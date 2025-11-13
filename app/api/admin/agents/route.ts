import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import Agent from "@/models/Agent";
import { verifyAdmin } from "@/lib/auth";

// GET - Get all agent applications (admin)
export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyAdmin(req);
    if (!adminUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const state = searchParams.get("state");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (state && state !== "all") {
      query.state = state;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    // Get agents with pagination
    const skip = (page - 1) * limit;
    const agents = await Agent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Agent.countDocuments(query);

    // Get status counts
    const statusCounts = await Agent.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      all: await Agent.countDocuments(),
      pending: 0,
      approved: 0,
      rejected: 0,
      contacted: 0,
    };

    statusCounts.forEach((item) => {
      counts[item._id as keyof typeof counts] = item.count;
    });

    return NextResponse.json({
      agents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      counts,
    });
  } catch (error: any) {
    console.error("Get agents error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
