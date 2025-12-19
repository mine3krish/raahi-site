import { NextRequest, NextResponse } from "next/server";
import PremiumProject from "@/models/PremiumProject";
import { connectDB } from "../../connect";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get unique locations from premium projects
    const locations = await PremiumProject.distinct("location", {
      status: "active"
    });

    // Sort locations alphabetically
    const sortedLocations = locations.sort();

    return NextResponse.json({
      locations: sortedLocations,
      success: true
    });
  } catch (error) {
    console.error("Error fetching premium project locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}