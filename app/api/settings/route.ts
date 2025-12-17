import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import SiteSettings from "@/models/SiteSettings";

// GET - Fetch public settings
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const settings = await SiteSettings.findOne();
    
    if (!settings) {
      return NextResponse.json({
        contactPhone: "+91 848 884 8874",
        contactEmail: "contact@raahiauction.com",
        contactAddress: "",
        officeHours: "Mon - Sat: 9:00 AM - 6:00 PM",
        aboutTitle: "About Raahi Auction",
        aboutDescription: "",
        missionStatement: "",
        visionStatement: "",
        facebookUrl: "",
        twitterUrl: "",
        instagramUrl: "",
        linkedinUrl: "",
        youtubeUrl: "",
        teamMembers: [],
        partners: [],
        testimonials: [],
        whatsappNumber: "+918488848874",
        footerText: `© ${new Date().getFullYear()} Raahi Auction. All rights reserved.`,
        siteTitle: "Raahi Auction",
        siteDescription: "Find bank verified properties across India",
      });
    }

    // Return only public-facing settings
    return NextResponse.json({
      contactPhone: settings.contactPhone,
      contactEmail: settings.contactEmail,
      contactAddress: settings.contactAddress,
      officeHours: settings.officeHours,
      aboutTitle: settings.aboutTitle,
      aboutDescription: settings.aboutDescription,
      missionStatement: settings.missionStatement,
      visionStatement: settings.visionStatement,
      facebookUrl: settings.facebookUrl,
      twitterUrl: settings.twitterUrl,
      instagramUrl: settings.instagramUrl,
      linkedinUrl: settings.linkedinUrl,
      youtubeUrl: settings.youtubeUrl,
      teamMembers: settings.teamMembers,
      partners: settings.partners,
      propertyBanners: settings.propertyBanners,
      testimonials: settings.testimonials,
      whatsappNumber: settings.whatsappNumber,
      footerText: settings.footerText,
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      heroImage: settings.heroImage,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      propertyPlaceholderImage: settings.propertyPlaceholderImage,
      branches: settings.branches || [],
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
