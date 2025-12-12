import { NextResponse } from "next/server";
import User from "@/models/User";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../../connect";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { id } = await context.params;
    const body = await req.json();
    const { isAdmin } = body;

    const user = await User.findByIdAndUpdate(
      id,
      { isAdmin },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("PATCH user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { id } = await context.params;
    
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: any) {
    console.error("DELETE user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
