import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Serve CDN files in development
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    const filePath = params.path.join("/");
    
    // Determine CDN directory based on environment
    const isDev = process.env.NODE_ENV === "development";
    const CDN_DIR = isDev 
      ? path.join(process.cwd(), "public", "uploads")
      : "/var/www/cdn";
    
    const fullPath = path.join(CDN_DIR, filePath);
    
    // Security check: prevent path traversal
    if (!fullPath.startsWith(CDN_DIR)) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 403 }
      );
    }
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    // Read and return the file
    const fileBuffer = await readFile(fullPath);
    
    // Determine content type from extension
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".svg": "image/svg+xml",
    };
    
    const contentType = contentTypes[ext] || "application/octet-stream";
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("CDN route error:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
