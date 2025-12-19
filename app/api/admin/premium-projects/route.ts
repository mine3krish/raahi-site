import { NextRequest, NextResponse } from "next/server";
import PremiumProject from "@/models/PremiumProject";
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
    const status = searchParams.get("status") || "";
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build query
    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;
    if (featured === "true") query.featured = true;

    // Get total count
    const total = await PremiumProject.countDocuments(query);

    // Get paginated projects
    const projects = await PremiumProject.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      projects,
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
    const projectData = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      builder: formData.get("builder") as string || "",
      status: formData.get("status") as string || "Active",
      featured: formData.get("featured") === "true",
      agentNumber: formData.get("agentNumber") as string || "",
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

    // Create project
    const project = new PremiumProject({
      ...projectData,
      images: imageUrls,
      brochure: brochureUrl || undefined,
    });

    await project.save();

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    let message = 'Unknown error';
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}