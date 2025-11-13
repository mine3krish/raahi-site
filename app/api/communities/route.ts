import { NextResponse } from "next/server";
import Community from "@/models/Community";
import { connectDB } from "../connect";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state") || "";

    // Build query - only show active communities
    const query: any = { active: true };

    if (state) {
      query.state = state;
    }

    const communities = await Community.find(query)
      .sort({ state: 1, name: 1 })
      .select("-__v");

    return NextResponse.json({ communities });
  } catch (err: any) {
    console.error("Communities fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
