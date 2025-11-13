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
      AuctionDate: new Date(formData.get("AuctionDate") as string),
      area: formData.get("area") ? parseFloat(formData.get("area") as string) : undefined,
      featured: formData.get("featured") === "true",
      status: formData.get("status") as string || "Active",
    };

    // Handle existing images
    const existingImagesStr = formData.get("existingImages") as string;
    let imageUrls: string[] = existingImagesStr ? JSON.parse(existingImagesStr) : [];

    // Handle new image uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads", "properties");
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Process new image files
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image_") && value instanceof File) {
        const file = value;
        const filename = `${propertyId}_${Date.now()}_${file.name}`;
        const filepath = path.join(uploadDir, filename);
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);
        
        imageUrls.push(`/uploads/properties/${filename}`);
      }
    }

    // Handle notice file upload or keep existing
    let noticeUrl = formData.get("existingNotice") as string || "";
    const noticeFile = formData.get("notice_file") as File;
    
    if (noticeFile && noticeFile.size > 0) {
      const noticeDir = path.join(process.cwd(), "public", "uploads", "notices");
      try {
        await mkdir(noticeDir, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }
      
      const noticeFilename = `${propertyId}_notice_${Date.now()}_${noticeFile.name}`;
      const noticeFilepath = path.join(noticeDir, noticeFilename);
      
      const noticeBytes = await noticeFile.arrayBuffer();
      const noticeBuffer = Buffer.from(noticeBytes);
      await writeFile(noticeFilepath, noticeBuffer);
      
      noticeUrl = `/uploads/notices/${noticeFilename}`;
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
