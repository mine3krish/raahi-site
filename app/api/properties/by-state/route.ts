import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import Property from "@/models/Property";

// GET - Get property counts by state
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Aggregate properties by state
    const stateData = await Property.aggregate([
      {
        $match: {
          status: { $in: ["Active", "Upcoming"] }, // Only active and upcoming properties
        },
      },
      {
        $group: {
          _id: "$state",
          count: { $sum: 1 },
          featured: {
            $sum: { $cond: [{ $eq: ["$featured", true] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          state: "$_id",
          count: 1,
          featured: 1,
        },
      },
      {
        $sort: { count: -1 }, // Sort by count descending
      },
    ]);

    return NextResponse.json({
      states: stateData,
      total: stateData.reduce((sum, item) => sum + item.count, 0),
    });
  } catch (error: any) {
    console.error("Get state-wise properties error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch state-wise data" },
      { status: 500 }
    );
  }
}
