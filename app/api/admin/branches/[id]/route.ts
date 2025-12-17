import { NextRequest, NextResponse } from "next/server";
import SiteSettings from "@/models/SiteSettings";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "@/app/api/connect";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();
    const { name, address, phone, email, city, state, isMain, order } = body;

    if (!name || !address) {
      return NextResponse.json({ error: "Name and address are required" }, { status: 400 });
    }

    const settings = await SiteSettings.findOne({});
    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    const branchIndex = settings.branches.findIndex((b: any) => b._id.toString() === params.id);
    if (branchIndex === -1) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    settings.branches[branchIndex] = { ...settings.branches[branchIndex], name, address, phone, email, city, state, isMain, order };
    await settings.save();

    return NextResponse.json({ branch: settings.branches[branchIndex] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const settings = await SiteSettings.findOne({});
    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    const branchIndex = settings.branches.findIndex((b: any) => b._id.toString() === params.id);
    if (branchIndex === -1) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    settings.branches.splice(branchIndex, 1);
    await settings.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}