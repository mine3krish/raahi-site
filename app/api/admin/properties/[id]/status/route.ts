import { NextRequest, NextResponse } from "next/server";
import Property from "@/models/Property";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "@/app/api/connect";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const params = await context.params;
    const { status } = await req.json();
    const propertyId = params.id;

    if (!status || !["Active", "Sold", "Pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const property = await Property.findOneAndUpdate(
      { id: propertyId },
      { status },
      { new: true }
    );

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Status updated successfully",
      property,
    });
  } catch (err: any) {
    console.error("Status update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
