import { NextRequest, NextResponse } from "next/server";
import Community from "@/models/Community";
import { verifyAdmin } from "@/lib/auth";
import { getCDNDir, getCDNUrl } from "@/lib/cdn";
import { connectDB } from "../../connect";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(req: Request) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const communities = await Community.find().sort({ createdAt: -1 });

    return NextResponse.json({ communities });
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
    const communityData = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      state: formData.get("state") as string,
      memberCount: parseInt(formData.get("memberCount") as string) || 0,
      whatsappLink: formData.get("whatsappLink") as string,
      active: formData.get("active") === "true",
    };

    // Handle image upload
    let imageUrl = "";
    const imageFile = formData.get("image_file") as File;
    const CDN_DIR = getCDNDir();

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      // Create directory if it doesn't exist
      try {
        await mkdir(CDN_DIR, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }

      const unique = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filepath = path.join(CDN_DIR, unique);
      await writeFile(filepath, buffer);
      imageUrl = getCDNUrl(unique);
    }

    // Create community
    const community = await Community.create({
      ...communityData,
      image: imageUrl,
    });

    return NextResponse.json({ community }, { status: 201 });
  } catch (err: any) {
    console.error("Community creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
