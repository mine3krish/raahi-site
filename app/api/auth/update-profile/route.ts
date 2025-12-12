import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    // Get token from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const { name, email, mobile } = await req.json();

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingEmail = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
      user.email = email;
    }
    if (mobile) {
      // Validate mobile number format
      if (!mobile.startsWith("+91") || mobile.length !== 13) {
        return NextResponse.json(
          { error: "Invalid mobile number format" },
          { status: 400 }
        );
      }
      // Check if mobile is already taken by another user
      const existingMobile = await User.findOne({ mobile, _id: { $ne: user._id } });
      if (existingMobile) {
        return NextResponse.json(
          { error: "Mobile number already in use" },
          { status: 400 }
        );
      }
      user.mobile = mobile;
    }

    await user.save();

    // Generate new token with updated info
    const newToken = jwt.sign(
      { id: user._id, email: user.email, mobile: user.mobile, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
