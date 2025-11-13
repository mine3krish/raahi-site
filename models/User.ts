import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    isAdmin: {type: Boolean, default: false},
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);
