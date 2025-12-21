import { NextRequest, NextResponse } from "next/server";
import PremiumProject from "@/models/PremiumProject";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../../connect";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getCDNDir, getCDNUrl } from "@/lib/cdn";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const params = await context.params;
    const projectId = params.id;
    const project = await PremiumProject.findById(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Premium project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (err: any) {
    console.error("Premium project fetch error:", err);
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
    const projectId = params.id;

    // Extract text fields
    const projectData: any = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      builder: formData.get("builder") as string || "",
      status: formData.get("status") as string || "Active",
      featured: formData.get("featured") === "true",
      agentNumber: formData.get("agentNumber") as string || "",
      variants: formData.get("variants") ? JSON.parse(formData.get("variants") as string) : [],
      whyBuy: formData.get("whyBuy") ? JSON.parse(formData.get("whyBuy") as string) : [],
      features: formData.get("features") ? JSON.parse(formData.get("features") as string) : [],
      ytVideoLink: formData.get("ytVideoLink") as string || "",
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

    // Handle brochure file upload
    let brochureUrl = "";
    const brochureFile = formData.get("brochure") as File;
    if (brochureFile && brochureFile.size > 0) {
      const unique = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
      const filepath = path.join(CDN_DIR, unique);

      const bytes = await brochureFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      brochureUrl = getCDNUrl(unique);
    }

    // Update existing images if provided
    const existingImages = formData.get("existingImages") as string;
    if (existingImages) {
      const existingImageUrls = JSON.parse(existingImages);
      imageUrls.push(...existingImageUrls);
    }

    // Update project
    const updateData = {
      ...projectData,
      ...(imageUrls.length > 0 && { images: imageUrls }),
      ...(brochureUrl && { brochure: brochureUrl }),
    };

    // Find the project first (by _id or custom id)
    let project = null;
    try {
      project = await PremiumProject.findById(projectId);
    } catch (e) {
      // Ignore cast error
    }
    if (!project) {
      project = await PremiumProject.findOne({ id: projectId });
    }

    if (!project) {
      return NextResponse.json(
        { error: "Premium project not found" },
        { status: 404 }
      );
    }

    const updatedProject = await PremiumProject.findByIdAndUpdate(
      project._id,
      updateData,
      { new: true }
    );

    return NextResponse.json({ project });
  } catch (err: any) {
    console.error("Premium project update error:", err);
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
    const projectId = params.id;

    const project = await PremiumProject.findByIdAndDelete(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Premium project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Premium project deleted successfully" });
  } catch (err: any) {
    console.error("Premium project delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}