import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { verifyAdmin } from "@/lib/auth";
import { getCDNDir, getCDNUrl } from "@/lib/cdn";

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdmin(req);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Setup CDN directory
    const CDN_DIR = getCDNDir();
    
    try {
      await mkdir(CDN_DIR, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "jpg";
    const unique = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filepath = path.join(CDN_DIR, unique);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);
    
    // Return CDN URL
    const url = getCDNUrl(unique);    return NextResponse.json({ url }, { status: 200 });

  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
