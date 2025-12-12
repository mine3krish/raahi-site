import mongoose, { Schema, Document } from "mongoose";

export interface IPropertyTemplate extends Document {
  state?: string; // null/undefined = default template for all states
  isDefault: boolean;
  name: string; // e.g., "Default Template" or "Maharashtra Template"
  
  // Field visibility configuration
  visibleFields: {
    // Core fields
    id: boolean;
    name: boolean;
    location: boolean;
    state: boolean;
    type: boolean;
    reservePrice: boolean;
    EMD: boolean;
    AuctionDate: boolean;
    area: boolean;
    images: boolean;
    status: boolean;
    
    // Excel import fields
    newListingId: boolean;
    schemeName: boolean;
    category: boolean;
    city: boolean;
    areaTown: boolean;
    date: boolean;
    emd: boolean;
    incrementBid: boolean;
    bankName: boolean;
    branchName: boolean;
    contactDetails: boolean;
    description: boolean;
    address: boolean;
    note: boolean;
    borrowerName: boolean;
    publishingDate: boolean;
    inspectionDate: boolean;
    applicationSubmissionDate: boolean;
    auctionStartDate: boolean;
    auctionEndTime: boolean;
    auctionType: boolean;
    listingId: boolean;
    notice: boolean;
    source: boolean;
    url: boolean;
    fingerprint: boolean;
    
    // Legacy/additional fields
    assetCategory: boolean;
    assetAddress: boolean;
    assetCity: boolean;
    publicationDate: boolean;
    agentMobile: boolean;
    youtubeVideo: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const PropertyTemplateSchema = new Schema<IPropertyTemplate>(
  {
    state: { type: String, index: true, sparse: true }, // null = default template
    isDefault: { type: Boolean, default: false },
    name: { type: String, required: true },
    
    visibleFields: {
      // Core fields - default visible
      id: { type: Boolean, default: true },
      name: { type: Boolean, default: true },
      location: { type: Boolean, default: true },
      state: { type: Boolean, default: true },
      type: { type: Boolean, default: true },
      reservePrice: { type: Boolean, default: true },
      EMD: { type: Boolean, default: true },
      AuctionDate: { type: Boolean, default: true },
      area: { type: Boolean, default: true },
      images: { type: Boolean, default: true },
      status: { type: Boolean, default: true },
      
      // Excel import fields - default hidden
      newListingId: { type: Boolean, default: false },
      schemeName: { type: Boolean, default: false },
      category: { type: Boolean, default: false },
      city: { type: Boolean, default: false },
      areaTown: { type: Boolean, default: false },
      date: { type: Boolean, default: false },
      emd: { type: Boolean, default: false },
      incrementBid: { type: Boolean, default: false },
      bankName: { type: Boolean, default: false },
      branchName: { type: Boolean, default: false },
      contactDetails: { type: Boolean, default: false },
      description: { type: Boolean, default: false },
      address: { type: Boolean, default: true },
      note: { type: Boolean, default: true },
      borrowerName: { type: Boolean, default: false },
      publishingDate: { type: Boolean, default: false },
      inspectionDate: { type: Boolean, default: true },
      applicationSubmissionDate: { type: Boolean, default: false },
      auctionStartDate: { type: Boolean, default: false },
      auctionEndTime: { type: Boolean, default: false },
      auctionType: { type: Boolean, default: false },
      listingId: { type: Boolean, default: false },
      notice: { type: Boolean, default: false },
      source: { type: Boolean, default: false },
      url: { type: Boolean, default: false },
      fingerprint: { type: Boolean, default: false },
      
      // Legacy/additional fields
      assetCategory: { type: Boolean, default: false },
      assetAddress: { type: Boolean, default: true },
      assetCity: { type: Boolean, default: false },
      publicationDate: { type: Boolean, default: false },
      agentMobile: { type: Boolean, default: true },
      youtubeVideo: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PropertyTemplateSchema.index({ state: 1, isDefault: 1 });

// Ensure only one default template
PropertyTemplateSchema.pre('save', async function(next) {
  if (this.isDefault && !this.state) {
    // If setting as default, unset other defaults
    await mongoose.model('PropertyTemplate').updateMany(
      { isDefault: true, state: { $exists: false } },
      { isDefault: false }
    );
  }
  next();
});

const PropertyTemplate =
  mongoose.models.PropertyTemplate ||
  mongoose.model<IPropertyTemplate>("PropertyTemplate", PropertyTemplateSchema);

export default PropertyTemplate;
