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
    AuctionDate: { type: String, required: true }, // Store as string due to date format variations
    area: { type: Number }, // in sqft
    images: [String],
    featured: { type: Boolean, default: false },
    bestDeal: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    status: { type: String, enum: ["Active", "Sold", "Pending"], default: "Active" },
    
    // Additional auction details
    assetCategory: { type: String, default: "" },
    assetAddress: { type: String, default: "" },
    assetCity: { type: String, default: "" },
    borrowerName: { type: String, default: "" },
    publicationDate: { type: String, default: "" },
    auctionStartDate: { type: String, default: "" },
    auctionEndTime: { type: String, default: "" },
    applicationSubmissionDate: { type: String, default: "" },
    inspectionDate: { type: String, default: "" }, // Inspection date or "Not Available"
    agentMobile: { type: String, default: "+91 848 884 8874" },
    note: { type: String, default: "" },
    youtubeVideo: { type: String, default: "" }, // YouTube video URL
  },
  { timestamps: true }
);

// Clear cached model to ensure schema updates are applied
if (models.Property) {
  delete models.Property;
}

const Property = mongoose.model("Property", PropertySchema);

export default Property;