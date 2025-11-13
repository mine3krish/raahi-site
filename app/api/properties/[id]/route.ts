import { NextRequest, NextResponse } from "next/server";
import Property from "@/models/Property";
import { connectDB } from "../../connect";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const params = await context.params;
    const propertyId = params.id;
    
    // Only show Active properties to public
    const property = await Property.findOne({ 
      id: propertyId,
      status: "Active" 
    }).select("-__v");

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ property });
  } catch (err: any) {
    console.error("Property fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
