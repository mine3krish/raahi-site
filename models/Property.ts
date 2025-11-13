import mongoose, { Schema, models } from "mongoose";

const PropertySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    state: { type: String, required: true },
    type: { type: String, required: true },
    reservePrice: { type: Number, required: true },
    EMD: { type: Number, required: true },
    AuctionDate: { type: Date, required: true },
    area: { type: Number }, // in sqft
    images: [String],
    featured: { type: Boolean, default: false },
    notice: { type: String },
    status: { type: String, enum: ["Active", "Sold", "Pending"], default: "Active" },
  },
  { timestamps: true }
);

export default models.Property || mongoose.model("Property", PropertySchema);