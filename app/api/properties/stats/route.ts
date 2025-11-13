import { NextResponse } from "next/server";
import Property from "@/models/Property";
import { connectDB } from "../../connect";

export async function GET() {
  try {
    await connectDB();

    const stateCounts = await Property.aggregate([
      { $group: { _id: "$state", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Transform to object format
    const counts: Record<string, number> = {};
    stateCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    return NextResponse.json({ counts });
  } catch (err: any) {
    console.error("State counts fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
