import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import SiteSettings from "@/models/SiteSettings";
import Property from "@/models/Property";
import { verifyAdmin } from "@/lib/auth";
import { getCDNDir, getCDNUrl } from "@/lib/cdn";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET - Fetch settings
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check if it's an admin request
    const isAdmin = request.headers.get("authorization");
    if (isAdmin) {
      try {
        await verifyAdmin(request);
      } catch {
        // If not admin, return public settings only
        const settings = await SiteSettings.findOne();
        if (!settings) {
          return NextResponse.json({
            contactPhone: "+91 848 884 8874",
            contactEmail: "contact@raahiauction.com",
          });
        }
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
          testimonials: settings.testimonials,
          whatsappNumber: settings.whatsappNumber,
          footerText: settings.footerText,
          siteTitle: settings.siteTitle,
          siteDescription: settings.siteDescription,
        });
      }
    }

    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      // Create default settings
      settings = await SiteSettings.create({});
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    await verifyAdmin(request);

    const formData = await request.formData();
    
    // Get current settings
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }

    // Update basic fields
    const fields = [
      "contactEmail", "contactPhone", "contactAddress", "officeHours",
      "aboutTitle", "aboutDescription", "missionStatement", "visionStatement",
      "facebookUrl", "twitterUrl", "instagramUrl", "linkedinUrl", "youtubeUrl",
      "adsenseClientId", "adsenseSlotHeader", "adsenseSlotSidebar", "adsenseSlotFooter",
      "whatsappNumber", "wahaBaseUrl", "wahaSessionName", "wahaApiKey",
      "footerText", "siteTitle", "siteDescription", "siteKeywords",
      "heroImage", "heroTitle", "heroSubtitle", "propertyPlaceholderImage"
    ];

    fields.forEach((field) => {
      const value = formData.get(field);
      if (value !== null) {
        (settings as any)[field] = value;
      }
    });

    // Update boolean fields
    settings.adsenseEnabled = formData.get("adsenseEnabled") === "true";

    // Handle team members
    const teamMembersJson = formData.get("teamMembers");
    if (teamMembersJson) {
      settings.teamMembers = JSON.parse(teamMembersJson as string);
    }

    // Handle partners
    const partnersJson = formData.get("partners");
    if (partnersJson) {
      settings.partners = JSON.parse(partnersJson as string);
    }

    // Handle property banners
    const bannersJson = formData.get("propertyBanners");
    if (bannersJson) {
      settings.propertyBanners = JSON.parse(bannersJson as string);
    }

    // Handle testimonials
    const testimonialsJson = formData.get("testimonials");
    if (testimonialsJson) {
      settings.testimonials = JSON.parse(testimonialsJson as string);
    }

    // Check if placeholder image was updated and update properties
    const newPlaceholderImage = formData.get("propertyPlaceholderImage") as string;
    const oldPlaceholderImage = settings.propertyPlaceholderImage;
    
    if (newPlaceholderImage && oldPlaceholderImage && newPlaceholderImage !== oldPlaceholderImage) {
      // Update any properties that have the old placeholder in their images array
      const result = await Property.updateMany(
        { 
          images: oldPlaceholderImage // Properties that contain the old placeholder URL
        },
        { 
          $set: { "images.$": newPlaceholderImage } // Replace the matched element
        }
      );
      
      console.log(`Updated ${result.modifiedCount} properties with new placeholder image`);
    }

    // Handle file uploads (team member photos, partner logos)
    const CDN_DIR = getCDNDir();
    
    try {
      await mkdir(CDN_DIR, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Process uploaded files
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("teamMemberImage_") && value instanceof File) {
        const index = key.split("_")[1];
        const file = value;
        const unique = `team-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filepath = path.join(CDN_DIR, unique);
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);
        
        const imageUrl = getCDNUrl(unique);
        if (settings.teamMembers[index]) {
          settings.teamMembers[index].image = imageUrl;
        }
      }

      if (key.startsWith("partnerLogo_") && value instanceof File) {
        const index = key.split("_")[1];
        const file = value;
        const unique = `partner-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filepath = path.join(CDN_DIR, unique);
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);
        
        const logoUrl = getCDNUrl(unique);
        if (settings.partners[index]) {
          settings.partners[index].logo = logoUrl;
        }
      }
    }

    await settings.save();

    return NextResponse.json({ 
      success: true, 
      message: "Settings updated successfully",
      settings 
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 500 }
    );
  }
}
