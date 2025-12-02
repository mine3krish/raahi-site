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
    status: { type: String, enum: ["Active", "Sold", "Pending"], default: "Active" },
    
    // Additional auction details
    assetCategory: { type: String },
    assetAddress: { type: String },
    assetCity: { type: String },
    borrowerName: { type: String },
    publicationDate: { type: String },
    auctionStartDate: { type: String },
    auctionEndTime: { type: String },
    applicationSubmissionDate: { type: String },
  },
  { timestamps: true }
);

// Clear cached model to ensure schema updates are applied
if (models.Property) {
  delete models.Property;
}

const Property = mongoose.model("Property", PropertySchema);

export default Property;