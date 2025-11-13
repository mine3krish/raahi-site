import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import Agent from "@/models/Agent";
import { verifyAdmin } from "@/lib/auth";

// GET - Get single agent application
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin(req);
    if (!adminUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const agent = await Agent.findById(params.id);

    if (!agent) {
      return NextResponse.json(
        { message: "Agent application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent });
  } catch (error: any) {
    console.error("Get agent error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch agent" },
      { status: 500 }
    );
  }
}

// PATCH - Update agent application status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin(req);
    if (!adminUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { status } = body;

    if (!["pending", "approved", "rejected", "contacted"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status" },
        { status: 400 }
      );
    }

    const agent = await Agent.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!agent) {
      return NextResponse.json(
        { message: "Agent application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Agent status updated",
      agent,
    });
  } catch (error: any) {
    console.error("Update agent error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update agent" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an agent application
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin(req);
    if (!adminUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const agent = await Agent.findByIdAndDelete(params.id);

    if (!agent) {
      return NextResponse.json(
        { message: "Agent application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Agent application deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete agent error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete agent" },
      { status: 500 }
    );
  }
}
