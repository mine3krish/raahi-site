import mongoose, { Schema, Document } from "mongoose";

export interface IImportedData extends Document {
  // Original Excel columns - stored as-is
  newListingId?: string;
  schemeName?: string;
  name?: string;
  category?: string;
  state?: string;
  city?: string;
  areaTown?: string;
  date?: string;
  reservePrice?: number;
  emd?: number;
  incrementBid?: string;
  bankName?: string;
  branchName?: string;
  contactDetails?: string;
  description?: string;
  address?: string;
  note?: string;
  borrowerName?: string;
  publishingDate?: string;
  inspectionDate?: string;
  applicationSubmissionDate?: string;
  auctionStartDate?: string;
  auctionEndTime?: string;
  auctionType?: string;
  listingId?: string;
  images?: string;
  notice?: string;
  source?: string;
  url?: string;
  fingerprint?: string;
  
  // Metadata
  importedAt: Date;
  importBatchId: string;
  propertyId?: string; // Reference to the processed Property ID
  processed: boolean;
  processingError?: string;
}

const ImportedDataSchema = new Schema<IImportedData>(
  {
    // Original Excel columns
    newListingId: { type: String, index: true },
    schemeName: { type: String },
    name: { type: String },
    category: { type: String },
    state: { type: String, index: true },
    city: { type: String },
    areaTown: { type: String },
    date: { type: String },
    reservePrice: { type: Number },
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
    images: { type: String },
    notice: { type: String },
    source: { type: String },
    url: { type: String },
    fingerprint: { type: String, index: true, unique: true, sparse: true },
    
    // Metadata
    importedAt: { type: Date, default: Date.now },
    importBatchId: { type: String, required: true, index: true },
    propertyId: { type: String, index: true },
    processed: { type: Boolean, default: false },
    processingError: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient searching
ImportedDataSchema.index({ newListingId: 1 });
ImportedDataSchema.index({ listingId: 1 });
ImportedDataSchema.index({ state: 1, city: 1 });
ImportedDataSchema.index({ importBatchId: 1 });
ImportedDataSchema.index({ processed: 1 });

const ImportedData =
  mongoose.models.ImportedData ||
  mongoose.model<IImportedData>("ImportedData", ImportedDataSchema);

export default ImportedData;
