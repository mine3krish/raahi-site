import { NextResponse } from "next/server";
import User from "@/models/User";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../connect";

export async function GET(req: Request) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
