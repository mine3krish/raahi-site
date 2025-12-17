import { NextRequest, NextResponse } from "next/server";
import SiteSettings from "@/models/SiteSettings";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../connect";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const settings = await SiteSettings.findOne({});
    if (!settings) {
      return NextResponse.json({ branches: [] });
    }

    return NextResponse.json({ branches: settings.branches || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
      const newSettings = new SiteSettings({
        branches: [{ name, address, phone, email, city, state, isMain, order }],
      });
      await newSettings.save();
      return NextResponse.json({ branch: newSettings.branches[0] });
    }

    const newBranch = { name, address, phone, email, city, state, isMain, order };
    settings.branches.push(newBranch);
    await settings.save();

    return NextResponse.json({ branch: newBranch });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}