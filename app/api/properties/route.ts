import { NextRequest, NextResponse } from "next/server";
import Property from "@/models/Property";
import { connectDB } from "../connect";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const state = searchParams.get("state") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "Active"; // Default to Active only
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Build query - show all properties, sort by latest
    const query: any = {};
    
    if (search) {
      query.$or = [
        { id: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    
    if (state) query.state = state;
    if (type) query.type = type;
    if (status) query.status = status; // Allow filtering by status
    if (featured === "true") query.featured = true;
    
    // Filter by bestDeal or premium
    const bestDeal = searchParams.get("bestDeal");
    const premium = searchParams.get("premium");
    if (bestDeal === "true") query.bestDeal = true;
    if (premium === "true") query.premium = true;

    // Get total count
    const total = await Property.countDocuments(query);

    // Get paginated properties - sort by latest first
    const properties = await Property.find(query)
      .sort({ createdAt: -1 }) // Latest first
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-__v"); // Exclude version key

    return NextResponse.json({
      properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("Properties fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
