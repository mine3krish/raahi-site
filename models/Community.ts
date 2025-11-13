import mongoose, { models, Schema } from "mongoose";

const CommunitySchema = new Schema(
    {
        id: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        description: { type: String, default: "" },
        state: { type: String, required: true },
        image: { type: String, default: "" },
        memberCount: { type: Number, default: 0 },
        whatsappLink: { type: String, required: true },
        active: { type: Boolean, default: true },
    },
    {
        timestamps: true
    }
)

export default models.Community || mongoose.model("Community", CommunitySchema);