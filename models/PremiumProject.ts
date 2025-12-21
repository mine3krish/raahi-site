import mongoose, { Schema, models } from "mongoose";

const PremiumProjectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true }, // Could be a range or specific
    images: [String], // Array of image URLs
    // New: Variable product variants (e.g., 3 BHK, 4 BHK)
    variants: [
      {
        type: { type: String }, // e.g., '3 BHK', '4 BHK'
        propertyType: { type: String }, // e.g., 'Apartment'
        area: { type: String }, // e.g., '1605 - 2055 sq.ft.'
        areaSqm: { type: String }, // e.g., '149.11 - 190.92 sqm'
        price: { type: String }, // e.g., '₹ 1.97 - 2.5 Cr'
        priceNote: { type: String }, // e.g., '+ Charges'
      }
    ],
    // New: Why you should buy section
    whyBuy: [String],
    // New: Features list
    features: [String],
    // New: YouTube video embedded link
    ytVideoLink: { type: String },
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