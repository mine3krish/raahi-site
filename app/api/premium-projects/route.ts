import { NextRequest, NextResponse } from "next/server";
import PremiumProject from "@/models/PremiumProject";
import { connectDB } from "../connect";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      // Try to fetch by _id (ObjectId) or by custom string id
      let project = null;
      // Try ObjectId first
      try {
        project = await PremiumProject.findOne({ _id: id }).select("-__v");
      } catch (e) {
        // Ignore cast error
      }
      // If not found, try by string id field
      if (!project) {
        project = await PremiumProject.findOne({ id }).select("-__v");
      }
      return NextResponse.json({ projects: project ? [project] : [] });
    }

    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const status = searchParams.get("status") || "Active";
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (location) query.location = { $regex: location, $options: "i" };
    if (status) query.status = status;
    if (featured === "true") query.featured = true;

    // Get total count
    const total = await PremiumProject.countDocuments(query);

    // Get paginated projects - sort by latest first
    const projects = await PremiumProject.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-__v");

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching premium projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch premium projects" },
      { status: 500 }
    );
  }
}