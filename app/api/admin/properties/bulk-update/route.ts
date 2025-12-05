import { NextResponse } from "next/server";
import Property from "@/models/Property";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../../connect";

export async function PATCH(req: Request) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();
    const { propertyIds, updates } = body;

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json({ error: "Property IDs are required" }, { status: 400 });
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ error: "Updates object is required" }, { status: 400 });
    }

    // Build update object - only allow specific fields
    const allowedUpdates: any = {};
    if ("featured" in updates) allowedUpdates.featured = updates.featured;
    if ("bestDeal" in updates) allowedUpdates.bestDeal = updates.bestDeal;
    if ("premium" in updates) allowedUpdates.premium = updates.premium;
    if ("status" in updates) allowedUpdates.status = updates.status;

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
    }

    // Perform bulk update
    const result = await Property.updateMany(
      { id: { $in: propertyIds } },
      { $set: allowedUpdates }
    );

    return NextResponse.json({
      message: "Properties updated successfully",
      updated: result.modifiedCount,
      matched: result.matchedCount,
    });

  } catch (err: any) {
    console.error("Bulk update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
