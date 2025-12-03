import { NextRequest, NextResponse } from "next/server";
import Property from "@/models/Property";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "@/app/api/connect";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const params = await context.params;
    const propertyId = params.id;
    const property = await Property.findOne({ id: propertyId });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ property });
  } catch (err: any) {
    console.error("Property fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const params = await context.params;
    const formData = await req.formData();
    const propertyId = params.id;

    // Extract text fields
    const propertyData: any = {
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

    // Handle existing images
    const existingImagesStr = formData.get("existingImages") as string;
    let imageUrls: string[] = existingImagesStr ? JSON.parse(existingImagesStr) : [];

    // Handle new image uploads
    const CDN_DIR = "/var/www/cdn";
    
    try {
      await mkdir(CDN_DIR, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Process new image files
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

    // Handle notice file upload or keep existing
    let noticeUrl = formData.get("existingNotice") as string || "";
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

    // Update property
    const updatedProperty = await Property.findOneAndUpdate(
      { id: propertyId },
      {
        ...propertyData,
        images: imageUrls,
        notice: noticeUrl,
      },
      { new: true }
    );

    if (!updatedProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (err: any) {
    console.error("Property update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const params = await context.params;
    const propertyId = params.id;
    const deletedProperty = await Property.findOneAndDelete({ id: propertyId });

    if (!deletedProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Property deleted successfully",
    });
  } catch (err: any) {
    console.error("Property deletion error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
