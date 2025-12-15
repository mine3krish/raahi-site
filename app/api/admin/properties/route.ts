import { NextRequest, NextResponse } from "next/server";
import Property from "@/models/Property";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../connect";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getCDNDir, getCDNUrl } from "@/lib/cdn";

export async function GET(req: Request) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const state = searchParams.get("state") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    // New filters
    const premium = searchParams.get("premium");
    const featured = searchParams.get("featured");
    const bestDeal = searchParams.get("bestDeal");

    // Build query
    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { id: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (state) query.state = state;
    if (type) query.type = type;
    if (status) query.status = status;
    // Add boolean filters if present (only filter if explicitly set to 'true' or 'false')
    if (premium === "true") query.premium = true;
    if (premium === "false") query.premium = false;
    if (featured === "true") query.featured = true;
    if (featured === "false") query.featured = false;
    if (bestDeal === "true") query.bestDeal = true;
    if (bestDeal === "false") query.bestDeal = false;

    // Get total count
    const total = await Property.countDocuments(query);

    // Get paginated properties
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: unknown) {
    let message = 'Unknown error';
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const formData = await req.formData();
    
    // Extract text fields
    const propertyData = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      state: formData.get("state") as string,
      type: formData.get("type") as string,
      reservePrice: parseFloat(formData.get("reservePrice") as string),
      EMD: parseFloat(formData.get("EMD") as string),
      AuctionDate: formData.get("AuctionDate") as string,
      area: formData.get("area") ? parseFloat(formData.get("area") as string) : undefined,
      featured: formData.get("featured") === "true",
      bestDeal: formData.get("bestDeal") === "true",
      premium: formData.get("premium") === "true",
      status: formData.get("status") as string || "Active",
      youtubeVideo: formData.get("youtubeVideo") as string || "",
      // Excel import fields
      schemeName: formData.get("schemeName") as string || "",
      category: formData.get("category") as string || "",
      city: formData.get("city") as string || "",
      areaTown: formData.get("areaTown") as string || "",
      date: formData.get("date") as string || "",
      emd: formData.get("emd") ? parseFloat(formData.get("emd") as string) : undefined,
      incrementBid: formData.get("incrementBid") as string || "",
      bankName: formData.get("bankName") as string || "",
      branchName: formData.get("branchName") as string || "",
      contactDetails: formData.get("contactDetails") as string || "",
      description: formData.get("description") as string || "",
      address: formData.get("address") as string || "",
      note: formData.get("note") as string || "",
      borrowerName: formData.get("borrowerName") as string || "",
      publishingDate: formData.get("publishingDate") as string || "",
      inspectionDate: formData.get("inspectionDate") as string || "",
      applicationSubmissionDate: formData.get("applicationSubmissionDate") as string || "",
      auctionStartDate: formData.get("auctionStartDate") as string || "",
      auctionEndTime: formData.get("auctionEndTime") as string || "",
      auctionType: formData.get("auctionType") as string || "",
      listingId: formData.get("listingId") as string || "",
      source: formData.get("source") as string || "",
      url: formData.get("url") as string || "",
      // Legacy fields
      assetCategory: formData.get("assetCategory") as string || "",
      assetAddress: formData.get("assetAddress") as string || "",
      assetCity: formData.get("assetCity") as string || "",
      publicationDate: formData.get("publicationDate") as string || "",
      agentMobile: formData.get("agentMobile") as string || "+91 848 884 8874",
    };

    // Handle image uploads
    const imageUrls: string[] = [];
    const CDN_DIR = getCDNDir();
    
    try {
      await mkdir(CDN_DIR, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Process image files
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image_") && value instanceof File) {
        const file = value;
        const unique = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filepath = path.join(CDN_DIR, unique);
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);
        
        imageUrls.push(getCDNUrl(unique));
      }
    }

    // Handle notice file upload
    let noticeUrl = "";
    const noticeFile = formData.get("notice_file") as File;
    if (noticeFile && noticeFile.size > 0) {
      try {
        await mkdir(getCDNDir(), { recursive: true });
      } catch {
        // Directory might already exist
      }
      
      const unique = `notice-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
      const noticeFilepath = path.join(getCDNDir(), unique);
      
      const noticeBytes = await noticeFile.arrayBuffer();
      const noticeBuffer = Buffer.from(noticeBytes);
      await writeFile(noticeFilepath, noticeBuffer);
      
      noticeUrl = getCDNUrl(unique);
    }

    // Create property with image URLs and notice
    const newProperty = new Property({
      ...propertyData,
      images: imageUrls,
      notice: noticeUrl,
    });

    await newProperty.save();

    return NextResponse.json({ 
      message: "Property created successfully", 
      property: newProperty 
    }, { status: 201 });

  } catch (err: unknown) {
    console.error("Property creation error:", err);
    let message = 'Unknown error';
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
