import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import Contact from "@/models/Contact";
import { verifyAdmin } from "@/lib/auth";

// GET - Get all contacts (admin)
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    // Get contacts with pagination
    const skip = (page - 1) * limit;
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Contact.countDocuments(query);

    // Get status counts
    const statusCounts = await Contact.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      all: await Contact.countDocuments(),
      new: 0,
      read: 0,
      responded: 0,
      archived: 0,
    };

    statusCounts.forEach((item) => {
      counts[item._id as keyof typeof counts] = item.count;
    });

    return NextResponse.json({
      contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      counts,
    });
  } catch (error: any) {
    console.error("Get contacts error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
