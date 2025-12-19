import mongoose, { Schema, models } from "mongoose";

const TeamMemberSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String },
  email: { type: String },
  phone: { type: String },
  bio: { type: String },
  order: { type: Number, default: 0 },
});

const PartnerSchema = new Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const BranchSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  city: { type: String },
  state: { type: String },
  isMain: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const BannerSchema = new Schema({
  image: { type: String, required: true },
  link: { type: String, default: "" },
  alt: { type: String, default: "Banner" },
  order: { type: Number, default: 0 },
});

const TestimonialSchema = new Schema({
  name: { type: String, required: true },
  location: { type: String, default: "" },
  image: { type: String, default: "" },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  message: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const SiteSettingsSchema = new Schema(
  {
    // Contact Information
    contactEmail: { type: String, default: "contact@raahiauction.com" },
    contactPhone: { type: String, default: "+91 848 884 8874" },
    contactAddress: { type: String, default: "" },
    officeHours: { type: String, default: "Mon - Sat: 9:00 AM - 6:00 PM" },
    
    // Hero Section
    heroImage: { type: String, default: "/Ahemdabad_Skyline.jpg" },
    heroTitle: { type: String, default: "Find Bank Verified Properties" },
    heroSubtitle: { type: String, default: "Discover verified listings and live property auctions across India." },
    
    // Property Placeholder
    propertyPlaceholderImage: { type: String, default: "/image.png" },
    
    // About Us
    aboutTitle: { type: String, default: "About Raahi Auction" },
    aboutDescription: { type: String, default: "" },
    missionStatement: { type: String, default: "" },
    visionStatement: { type: String, default: "" },
    
    // Social Media
    facebookUrl: { type: String, default: "" },
    twitterUrl: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },
    snapchatUrl: { type: String, default: "" },
    
    // AdSense
    adsenseClientId: { type: String, default: "" },
    adsenseSlotHeader: { type: String, default: "" },
    adsenseSlotSidebar: { type: String, default: "" },
    adsenseSlotFooter: { type: String, default: "" },
    adsenseEnabled: { type: Boolean, default: false },
    
    // Team Members
    teamMembers: [TeamMemberSchema],
    
    // Partners
    partners: [PartnerSchema],
    
    // Branches
    branches: [BranchSchema],
    
    // Property Page Banners
    propertyBanners: [BannerSchema],
    
    // Testimonials
    testimonials: [TestimonialSchema],
    
    // SEO
    siteTitle: { type: String, default: "Raahi Auction" },
    siteDescription: { type: String, default: "Find bank verified properties across India" },
    siteKeywords: { type: String, default: "auction, property, real estate, bank auction" },
    
    // Other Settings
    whatsappNumber: { type: String, default: "+918488848874" },
    footerText: { type: String, default: "© 2024 Raahi Auction. All rights reserved." },
    
    // WAHA Configuration for OTP
    wahaBaseUrl: { type: String, default: "" },
    wahaSessionName: { type: String, default: "" },
    wahaApiKey: { type: String, default: "" },

    // Telegram Social Link
    telegramUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

// Ensure only one settings document exists
SiteSettingsSchema.index({}, { unique: true });

if (models.SiteSettings) {
  delete models.SiteSettings;
}

const SiteSettings = mongoose.model("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
