import { NextResponse } from "next/server";
import Property from "@/models/Property";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../../connect";

export async function POST(req: Request) {
  try {
    await connectDB();
    await verifyAdmin(req);

    // Get all properties that don't have inspectionDate field
    const properties = await Property.find({});
    
    let updated = 0;
    let alreadyHas = 0;
    
    for (const property of properties) {
      // Check if inspectionDate field exists and has a value
      if (!property.inspectionDate || property.inspectionDate === undefined) {
        // Set default value as empty string (will show call button)
        property.inspectionDate = "";
        await property.save();
        updated++;
      } else {
        alreadyHas++;
      }
    }

    return NextResponse.json({
      message: "Migration completed successfully",
      total: properties.length,
      updated,
      alreadyHas,
    });

  } catch (err: any) {
    console.error("Migration error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
