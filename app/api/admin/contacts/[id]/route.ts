import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import Contact from "@/models/Contact";
import { verifyAdmin } from "@/lib/auth";

// GET - Get single contact
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdmin(req);
    if (!adminUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const params = await context.params;
    const contact = await Contact.findById(params.id);

    if (!contact) {
      return NextResponse.json(
        { message: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ contact });
  } catch (error: any) {
    console.error("Get contact error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

// PATCH - Update contact status
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdmin(req);
    if (!adminUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { status } = body;

    if (!["new", "read", "responded", "archived"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status" },
        { status: 400 }
      );
    }

    const params = await context.params;
    const contact = await Contact.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return NextResponse.json(
        { message: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Contact status updated",
      contact,
    });
  } catch (error: any) {
    console.error("Update contact error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a contact
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await verifyAdmin(req);
    if (!adminUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const params = await context.params;
    const contact = await Contact.findByIdAndDelete(params.id);

    if (!contact) {
      return NextResponse.json(
        { message: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Contact deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete contact error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete contact" },
      { status: 500 }
    );
  }
}
