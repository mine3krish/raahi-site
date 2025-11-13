import { NextRequest, NextResponse } from "next/server";
import Community from "@/models/Community";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../../connect";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { id } = params;
    const community = await Community.findOne({ id });

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    return NextResponse.json({ community });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { id } = params;
    const formData = await req.formData();

    // Extract text fields
    const updateData: any = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      state: formData.get("state") as string,
      memberCount: parseInt(formData.get("memberCount") as string) || 0,
      whatsappLink: formData.get("whatsappLink") as string,
      active: formData.get("active") === "true",
    };

    // Handle image upload
    const imageFile = formData.get("image_file") as File;
    const existingImage = formData.get("existingImage") as string;

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "uploads", "communities");

      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }

      const filename = `${Date.now()}-${imageFile.name}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      updateData.image = `/uploads/communities/${filename}`;
    } else if (existingImage) {
      updateData.image = existingImage;
    }

    const community = await Community.findOneAndUpdate(
      { id },
      updateData,
      { new: true }
    );

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    return NextResponse.json({ community });
  } catch (err: any) {
    console.error("Community update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { id } = params;
    const body = await req.json();

    const community = await Community.findOneAndUpdate(
      { id },
      body,
      { new: true }
    );

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    return NextResponse.json({ community });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { id } = params;
    const community = await Community.findOneAndDelete({ id });

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Community deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
