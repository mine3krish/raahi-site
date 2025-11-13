import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "../../connect";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user)
    return NextResponse.json({ error: "No user found with this email" }, { status: 404 });

  const token = crypto.randomBytes(20).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();

  // TODO: send email with `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
  return NextResponse.json({ message: "Password reset link sent (mock)" });
}
