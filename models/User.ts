import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: false, unique: true, sparse: true }, // Made optional for mobile-only users
    password: { type: String, required: false, select: false }, // Optional for mobile-only users
    mobile: { type: String, required: false, unique: true, sparse: true }, // Mobile number with +91
    authMethod: { type: String, enum: ['email', 'mobile'], default: 'email' }, // Authentication method
    isVerified: { type: Boolean, default: false }, // Email/Mobile verification status
    isAdmin: {type: Boolean, default: false},
    resetToken: String,
    resetTokenExpiry: Date,
    // OTP fields
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);
