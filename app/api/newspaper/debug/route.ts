import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import Property from "@/models/Property";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get recent properties with their creation dates
    const properties = await Property.find({ status: "Active" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("id name createdAt updatedAt");

    // Group by date
    const byDate: Record<string, any[]> = {};
    
    properties.forEach((prop) => {
      const dateKey = new Date(prop.createdAt).toISOString().split("T")[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = [];
      }
      byDate[dateKey].push({
        id: prop.id,
        name: prop.name,
        createdAt: prop.createdAt,
        createdAtISO: new Date(prop.createdAt).toISOString(),
        createdAtLocal: new Date(prop.createdAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata"
        }),
      });
    });

    return NextResponse.json({
      totalProperties: properties.length,
      propertiesByDate: byDate,
      dates: Object.keys(byDate).sort().reverse(),
      serverTime: new Date().toISOString(),
      serverTimeLocal: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata"
      }),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch debug info" },
      { status: 500 }
    );
  }
}
