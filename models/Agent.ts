import mongoose, { Document, Model } from "mongoose";

export interface IAgent extends Document {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  experience: string;
  licenseNumber?: string;
  portfolio?: string;
  message: string;
  status: "pending" | "approved" | "rejected" | "contacted";
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
      enum: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"],
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    portfolio: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "contacted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AgentSchema.index({ status: 1, createdAt: -1 });
AgentSchema.index({ email: 1 });
AgentSchema.index({ state: 1 });

const Agent: Model<IAgent> =
  mongoose.models.Agent || mongoose.model<IAgent>("Agent", AgentSchema);

export default Agent;
