import { NextRequest, NextResponse } from "next/server";
import Property from "@/models/Property";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../connect";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    // Build query
    const query: any = {};
    
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
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
      assetCategory: formData.get("assetCategory") as string || "",
      assetAddress: formData.get("assetAddress") as string || "",
      assetCity: formData.get("assetCity") as string || "",
      borrowerName: formData.get("borrowerName") as string || "",
      publicationDate: formData.get("publicationDate") as string || "",
      auctionStartDate: formData.get("auctionStartDate") as string || "",
      auctionEndTime: formData.get("auctionEndTime") as string || "",
      applicationSubmissionDate: formData.get("applicationSubmissionDate") as string || "",
      agentMobile: formData.get("agentMobile") as string || "+91 848 884 8874",
    };

    // Handle image uploads
    const imageUrls: string[] = [];
    const CDN_DIR = "/var/www/cdn";
    
    try {
      await mkdir(CDN_DIR, { recursive: true });
    } catch (err) {
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
        
        imageUrls.push(`https://raahiauctions.cloud/cdn/${unique}`);
      }
    }

    // Handle notice file upload
    let noticeUrl = "";
    const noticeFile = formData.get("notice_file") as File;
    if (noticeFile && noticeFile.size > 0) {
      try {
        await mkdir(CDN_DIR, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }
      
      const unique = `notice-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
      const noticeFilepath = path.join(CDN_DIR, unique);
      
      const noticeBytes = await noticeFile.arrayBuffer();
      const noticeBuffer = Buffer.from(noticeBytes);
      await writeFile(noticeFilepath, noticeBuffer);
      
      noticeUrl = `https://raahiauctions.cloud/cdn/${unique}`;
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

  } catch (err: any) {
    console.error("Property creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
