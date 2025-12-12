import mongoose, { Schema, models } from "mongoose";

const PropertySchema = new Schema(
  {
    // Core fields (required for display)
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    state: { type: String, required: true },
    type: { type: String, required: true },
    reservePrice: { type: Number, required: true },
    EMD: { type: Number, required: true },
    AuctionDate: { type: String, required: true },
    area: { type: Number },
    images: [String],
    featured: { type: Boolean, default: false },
    bestDeal: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    status: { type: String, enum: ["Active", "Sold", "Pending"], default: "Active" },
    youtubeVideo: { type: String, default: "" },
    
    // ALL Excel import fields (30 total columns)
    newListingId: { type: String },
    schemeName: { type: String },
    category: { type: String },
    city: { type: String },
    areaTown: { type: String },
    date: { type: String },
    emd: { type: Number },
    incrementBid: { type: String },
    bankName: { type: String },
    branchName: { type: String },
    contactDetails: { type: String },
    description: { type: String },
    address: { type: String },
    note: { type: String },
    borrowerName: { type: String },
    publishingDate: { type: String },
    inspectionDate: { type: String },
    applicationSubmissionDate: { type: String },
    auctionStartDate: { type: String },
    auctionEndTime: { type: String },
    auctionType: { type: String },
    listingId: { type: String },
    notice: { type: String },
    source: { type: String },
    url: { type: String },
    fingerprint: { type: String, index: true },
    
    // Legacy fields for backwards compatibility
    assetCategory: { type: String },
    assetAddress: { type: String },
    assetCity: { type: String },
    publicationDate: { type: String },
    agentMobile: { type: String, default: "+91 848 884 8874" },
    
    // Import tracking
    importBatchId: { type: String, index: true },
    importedAt: { type: Date },
  },
  { timestamps: true }
);

// Clear cached model to ensure schema updates are applied
if (models.Property) {
  delete models.Property;
}

const Property = mongoose.model("Property", PropertySchema);

export default Property;