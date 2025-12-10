import { NextRequest, NextResponse } from "next/server";
import Community from "@/models/Community";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../../connect";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const params = await context.params;
    const communityId = params.id;
    
    // Try to find by custom id field first, then by MongoDB _id
    let community = await Community.findOne({ id: communityId });
    if (!community) {
      community = await Community.findById(communityId);
    }

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    return NextResponse.json({ community });
  } catch (err: any) {
    console.error("Community fetch error:", err);
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
    const communityId = params.id;
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
    const CDN_DIR = "/var/www/cdn";

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      try {
        await mkdir(CDN_DIR, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }

      const unique = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filepath = path.join(CDN_DIR, unique);
      await writeFile(filepath, buffer);
      updateData.image = `https://raahiauctions.cloud/cdn/${unique}`;
    } else if (existingImage) {
      updateData.image = existingImage;
    }

    // Try to find and update by custom id field first, then by MongoDB _id
    let community = await Community.findOne({ id: communityId });
    if (community) {
      community = await Community.findOneAndUpdate(
        { id: communityId },
        updateData,
        { new: true }
      );
    } else {
      community = await Community.findByIdAndUpdate(
        communityId,
        updateData,
        { new: true }
      );
    }

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
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const params = await context.params;
    const communityId = params.id;
    const body = await req.json();

    // Try to find by custom id field first, then by MongoDB _id
    let community = await Community.findOne({ id: communityId });
    if (community) {
      community = await Community.findOneAndUpdate(
        { id: communityId },
        body,
        { new: true }
      );
    } else {
      community = await Community.findByIdAndUpdate(
        communityId,
        body,
        { new: true }
      );
    }

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    return NextResponse.json({ community });
  } catch (err: any) {
    console.error("Community update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const params = await context.params;
    const communityId = params.id;
    
    // Try to find by custom id field first, then by MongoDB _id
    let community = await Community.findOne({ id: communityId });
    if (!community) {
      community = await Community.findByIdAndDelete(communityId);
    } else {
      community = await Community.findOneAndDelete({ id: communityId });
    }

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Community deleted successfully" });
  } catch (err: any) {
    console.error("Community deletion error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
