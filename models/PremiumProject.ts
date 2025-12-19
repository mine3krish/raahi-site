import mongoose, { Schema, models } from "mongoose";

const PremiumProjectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true }, // Could be a range or specific
    images: [String], // Array of image URLs
    brochure: { type: String }, // URL to brochure PDF or link
    builder: { type: String },
    agentNumber: { type: String },
    status: { type: String, enum: ["Active", "Sold Out", "Upcoming"], default: "Active" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PremiumProject = models.PremiumProject || mongoose.model("PremiumProject", PremiumProjectSchema);

export default PremiumProject;