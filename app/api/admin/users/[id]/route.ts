import { NextResponse } from "next/server";
import User from "@/models/User";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../../connect";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { id } = params;
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
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { id } = params;
    
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
