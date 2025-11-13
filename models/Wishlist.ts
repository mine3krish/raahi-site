import mongoose, { Schema, models } from "mongoose";

const WishlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound index to ensure one user can't add same property twice
WishlistSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

export default models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
