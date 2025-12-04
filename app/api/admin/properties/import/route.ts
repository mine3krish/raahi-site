import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import AdmZip from "adm-zip";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import OpenAI from "openai";
import { connectDB } from "@/app/api/connect";
import Property from "@/models/Property";
import SiteSettings from "@/models/SiteSettings";
import https from "https";
import http from "http";
import { verifyAdmin } from "@/lib/auth";

interface PropertyData {
  id: string;
  name: string;
  location: string;
  state: string;
  type: string;
  reservePrice: number;
  EMD: number;
  AuctionDate: string;
  area?: number;
  images: string[];
  status: string;
  
  // Additional auction details
  assetCategory?: string;
  assetAddress?: string;
  assetCity?: string;
  borrowerName?: string;
  publicationDate?: string;
  auctionStartDate?: string;
  auctionEndTime?: string;
  applicationSubmissionDate?: string;
  agentMobile?: string;
  note?: string;
}

interface ImportResult {
  properties: PropertyData[];
  errors: string[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_PLACEHOLDER_IMAGE = "https://raahiauctions.cloud/cdn/placeholder.jpg";
const VALID_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];
const CDN_DIR = "/var/www/cdn";

// Get placeholder image from settings
async function getPlaceholderImage(): Promise<string> {
  try {
    await connectDB();
    const settings = await SiteSettings.findOne();
    return settings?.propertyPlaceholderImage || DEFAULT_PLACEHOLDER_IMAGE;
  } catch (error) {
    console.error("Error fetching placeholder image from settings:", error);
    return DEFAULT_PLACEHOLDER_IMAGE;
  }
}

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(CDN_DIR)) {
    await fs.mkdir(CDN_DIR, { recursive: true });
  }
}

// Validate image format
function isValidImageFormat(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase().slice(1);
  return VALID_IMAGE_FORMATS.includes(ext);
}

// Download image from URL with timeout
async function downloadImage(url: string, timeoutMs: number = 10000): Promise<Buffer | null> {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https://') ? https : http;
      
      const timeout = setTimeout(() => {
        console.error(`Timeout downloading image: ${url}`);
        resolve(null);
      }, timeoutMs);
      
      const request = client.get(url, (response) => {
        clearTimeout(timeout);
        
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            console.log(`Redirecting to: ${redirectUrl}`);
            resolve(downloadImage(redirectUrl, timeoutMs));
            return;
          }
        }
        
        if (response.statusCode !== 200) {
          console.error(`Failed to download image: ${url}, status: ${response.statusCode}`);
          resolve(null);
          return;
        }
        
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          clearTimeout(timeout);
          resolve(Buffer.concat(chunks));
        });
        response.on('error', (error) => {
          clearTimeout(timeout);
          console.error(`Error downloading image from ${url}:`, error);
          resolve(null);
        });
      });
      
      request.on('error', (error) => {
        clearTimeout(timeout);
        console.error(`Error downloading image from ${url}:`, error);
        resolve(null);
      });
      
      request.setTimeout(timeoutMs, () => {
        request.destroy();
        console.error(`Request timeout for image: ${url}`);
        resolve(null);
      });
    } catch (error) {
      console.error(`Error downloading image from ${url}:`, error);
      resolve(null);
    }
  });
}

// Process and save image
async function processImage(buffer: Buffer, filename: string): Promise<string> {
  try {
    await ensureUploadDir();
    
    // Generate unique filename
    const unique = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const savePath = path.join(CDN_DIR, unique);
    
    // Process image with sharp (optimize and resize if needed)
    await sharp(buffer)
      .resize(1200, 900, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(savePath);
    
    return `https://raahiauctions.cloud/cdn/${unique}`;
  } catch (error) {
    console.error("Error processing image:", error);
    return DEFAULT_PLACEHOLDER_IMAGE;
  }
}

// Extract images from zip file
async function extractImagesFromZip(zipBuffer: Buffer): Promise<Map<string, Buffer>> {
  const imageMap = new Map<string, Buffer>();
  
  try {
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    
    for (const entry of zipEntries) {
      if (!entry.isDirectory) {
        const filename = entry.entryName.split("/").pop() || "";
        if (isValidImageFormat(filename)) {
          imageMap.set(filename.toLowerCase(), entry.getData());
        }
      }
    }
  } catch (error) {
    console.error("Error extracting zip:", error);
  }
  
  return imageMap;
}

// Generate property name using OpenAI
async function generatePropertyName(
  description: string,
  type: string,
  location: string,
  originalName?: string
): Promise<string> {
  if (originalName && originalName.trim()) {
    return originalName.trim();
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a real estate expert. Generate a concise, professional property name (max 60 characters) based on the provided details. The name should be descriptive and appealing."
        },
        {
          role: "user",
          content: `Generate a property name for:\nType: ${type}\nLocation: ${location}\nDescription: ${description}`
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });
    
    return response.choices[0]?.message?.content?.trim() || `${type} in ${location}`;
  } catch (error) {
    console.error("Error generating name with OpenAI:", error);
    return `${type} in ${location}`;
  }
}

// Generate random listing ID
function generateListingId(): string {
  const prefix = "PROP";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Parse Excel and extract property data
async function parseExcelFile(
  excelBuffer: Buffer,
  imageMap: Map<string, Buffer>,
  placeholderImage: string
): Promise<ImportResult> {
  const workbook = XLSX.read(excelBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  
  const properties: PropertyData[] = [];
  const errors: string[] = [];
  
  console.log(`Found ${rawData.length} rows in Excel file`);
  
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i] as Record<string, unknown>;
    const rowNum = i + 2; // Excel rows start at 1, plus header row

    console.log(`Processing row ${rowNum}:`, JSON.stringify(row));
    
    try {
      // Extract listing ID
      const listingId = row.newListingId || generateListingId();
      
      // Extract basic required fields
      const type = row.type || row.propertyType || row.Type || row.category;
      const location = row.location || row.address || row.Location || row.city || row.areaTown;
      const state = row.state || row.State;
      const reservePriceRaw = row.reservePrice || row.price || row.ReservePrice;
      const auctionDate = row.date;
      
      // Filter out "Others" category
      if (type && String(type).trim().toLowerCase() === 'others') {
        console.log(`⊘ Row ${rowNum}: Skipped - "Others" category filtered out`);
        continue;
      }
      
      // Validate required fields
      if (!type || type === "" || String(type).trim() === "") {
        errors.push(`Row ${rowNum}: Missing required field - type`);
        continue;
      }
      
      if (!location || location === "" || String(location).trim() === "") {
        errors.push(`Row ${rowNum}: Missing required field - location`);
        continue;
      }
      
      if (!state || state === "" || String(state).trim() === "") {
        errors.push(`Row ${rowNum}: Missing required field - state`);
        continue;
      }
      
      if (!reservePriceRaw) {
        errors.push(`Row ${rowNum}: Missing required field - reservePrice`);
        continue;
      }
      
      const reservePrice = parseFloat(String(reservePriceRaw));
      if (isNaN(reservePrice) || reservePrice <= 0) {
        errors.push(`Row ${rowNum}: Invalid reserve price - must be a positive number`);
        continue;
      }
      
      if (!auctionDate) {
        errors.push(`Row ${rowNum}: Missing required field - date`);
        continue;
      }
      
      // Calculate EMD
      const emdRaw = row.EMD || row.emd || row.earnestMoney;
      const emd = emdRaw ? parseFloat(String(emdRaw)) : reservePrice * 0.1;
      
      // Extract optional fields - Build comprehensive location
      let fullLocation = String(location);
      if (row.areaTown && row.city && row.areaTown !== row.city) {
        fullLocation = `${String(row.areaTown)}, ${String(row.city)}`;
      }
      if (row.branchName) {
        fullLocation = `${fullLocation}, Near ${String(row.branchName)}`;
      }
      
      const description = row.address || row.description || `${String(type)} property in ${fullLocation}`;
      const areaRaw = row.area || row.Area || row.sqft;
      const area = areaRaw ? parseFloat(String(areaRaw)) : undefined;
      
      let propertyName = "";
      // Check for schemeName field (case-insensitive)
      const schemeName = row.schemeName || row.SchemeName;
      if (schemeName) {
        propertyName = String(schemeName);
      } else {
        propertyName = await generatePropertyName(
          String(description), 
          String(type), 
          String(location), 
          row.name ? String(row.name) : undefined
        );
      }

      // Process images
      const images: string[] = [];
      const imageField = row.images || row.image || row.Image || row.Images;
      
      if (imageField && String(imageField).trim() !== "") {
        const imageFiles = String(imageField).split(/[,;|]/).map((s: string) => s.trim());
        
        for (const imageFile of imageFiles) {
          if (imageFile) {
            // Check if it's a URL (starts with http:// or https://)
            if (imageFile.startsWith('http://') || imageFile.startsWith('https://')) {
              try {
                console.log(`Downloading image from URL: ${imageFile}`);
                const imageBuffer = await downloadImage(imageFile);
                
                if (imageBuffer) {
                  // Extract filename from URL or generate one
                  const urlPath = new URL(imageFile).pathname;
                  const filename = path.basename(urlPath) || 'downloaded-image.jpg';
                  const processedPath = await processImage(imageBuffer, filename);
                  
                  if (processedPath !== placeholderImage) {
                    images.push(processedPath);
                    console.log(`✓ Downloaded and processed: ${imageFile} → ${processedPath}`);
                  }
                } else {
                  console.log(`✗ Failed to download: ${imageFile}`);
                }
              } catch (error) {
                console.error(`Error processing image URL ${imageFile}:`, error);
              }
            } else {
              // It's a filename - look for it in the ZIP
              const normalizedName = imageFile.toLowerCase();
              const imageBuffer = imageMap.get(normalizedName);
              
              if (imageBuffer && isValidImageFormat(imageFile)) {
                const processedPath = await processImage(imageBuffer, imageFile);
                if (processedPath !== placeholderImage) {
                  images.push(processedPath);
                }
              }
            }
          }
        }
      }
      
      // Add placeholder if no valid images
      if (images.length === 0) {
        images.push(placeholderImage);
      }
      
      // Create property object with all auction details
      properties.push({
        id: String(listingId),
        name: propertyName,
        location: fullLocation || String(location),
        state: String(state),
        type: String(type),
        reservePrice,
        EMD: emd,
        AuctionDate: String(auctionDate),
        area,
        images,
        status: "Active",
        
        // Additional auction details
        assetCategory: row.category ? String(row.category) : String(type),
        assetAddress: String(description),
        assetCity: row.city ? String(row.city) : (row.areaTown ? String(row.areaTown) : undefined),
        borrowerName: row.borrowerName ? String(row.borrowerName) : undefined,
        publicationDate: row.publicationDate ? String(row.publicationDate) : undefined,
        auctionStartDate: row.auctionStartDate ? String(row.auctionStartDate) : undefined,
        auctionEndTime: row.auctionEndTime ? String(row.auctionEndTime) : undefined,
        applicationSubmissionDate: row.applicationSubmissionDate ? String(row.applicationSubmissionDate) : undefined,
        agentMobile: row.agentMobile ? String(row.agentMobile) : "+91 848 884 8874",
        note: row.note ? String(row.note) : "",
      });
      
      console.log(`✓ Row ${rowNum} processed successfully: ${propertyName}`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Row ${rowNum}: ${message}`);
    }
  }
  
  return { properties, errors };
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    verifyAdmin(request);

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }
    
    // Parse multipart form data
    const formData = await request.formData();
    const excelFile = formData.get("excel") as File;
    const zipFile = formData.get("images") as File | null;
    
    if (!excelFile) {
      return NextResponse.json({ error: "Excel file is required" }, { status: 400 });
    }
    
    // Read Excel file
    const excelBuffer = Buffer.from(await excelFile.arrayBuffer());
    
    // Extract images from zip if provided
    let imageMap = new Map<string, Buffer>();
    if (zipFile) {
      const zipBuffer = Buffer.from(await zipFile.arrayBuffer());
      imageMap = await extractImagesFromZip(zipBuffer);
    }
    
    // Get placeholder image from settings
    const placeholderImage = await getPlaceholderImage();
    
    // Parse Excel and create property objects
    const { properties, errors } = await parseExcelFile(excelBuffer, imageMap, placeholderImage);
    
    if (properties.length === 0) {
      return NextResponse.json(
        { error: "No valid properties found in Excel file", errors },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Insert properties in bulk
    const results = {
      success: 0,
      failed: 0,
      duplicates: 0,
      errors: [...errors],
    };
    
    for (const property of properties) {
      try {
        // Check for duplicate
        const existing = await Property.findOne({ id: property.id });
        if (existing) {
          results.duplicates++;
          results.errors.push(`Property ${property.id} already exists`);
          continue;
        }
        
        await Property.create(property);
        results.success++;
      } catch (error) {
        results.failed++;
        const message = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`Failed to create ${property.id}: ${message}`);
      }
    }
    
    return NextResponse.json({
      message: "Import completed",
      results,
    });
    
  } catch (error) {
    console.error("Import error:", error);
    const message = error instanceof Error ? error.message : "Failed to import properties";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
