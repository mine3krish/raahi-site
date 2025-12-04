import mongoose from "mongoose";

const SocialAccountSchema = new mongoose.Schema({
  platform: { type: String, required: true }, // 'linkedin', 'facebook', 'instagram', 'whatsapp'
  name: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  config: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { _id: false });

const PostTemplateSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  name: { type: String, required: true },
  template: { type: String, required: true },
  includeImage: { type: Boolean, default: true },
  includeLink: { type: Boolean, default: true },
}, { _id: false });

const SocialConfigSchema = new mongoose.Schema({
  accounts: [SocialAccountSchema],
  templates: [PostTemplateSchema],
  defaultTemplate: {
    type: String,
    default: `🏠 {{name}}

📍 Location: {{location}}, {{state}}
💰 Reserve Price: {{reservePrice}}
📅 Auction Date: {{auctionDate}}
📏 Area: {{area}} sq ft
🏷️ Type: {{type}}

🔗 View Details: {{link}}

#RealEstate #PropertyAuction #{{state}}`,
  },
});

const SocialConfig = mongoose.models.SocialConfig || mongoose.model("SocialConfig", SocialConfigSchema);

export default SocialConfig;
