import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { mobile, otp, name } = await req.json();

    // Validate input
    if (!mobile || !/^\+91[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "Invalid mobile number" },
        { status: 400 }
      );
    }

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Find user with OTP
    const user = await User.findOne({ mobile }).select("+otp +otpExpiry");

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please request a new OTP." },
        { status: 404 }
      );
    }

    // Check if OTP expired
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json(
        { error: "OTP expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Update user name if provided (for new users)
    if (name && user.name === "User") {
      user.name = name;
    }

    // Mark as verified
    user.isVerified = true;

    // Clear OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, mobile: user.mobile, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
