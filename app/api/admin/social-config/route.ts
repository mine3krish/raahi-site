import { NextRequest, NextResponse } from "next/server";
import SocialConfig from "@/models/SocialConfig";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "@/app/api/connect";

// GET - Fetch social configuration
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await verifyAdmin(req);

    let config = await SocialConfig.findOne();
    
    if (!config) {
      // Create default config if none exists
      config = await SocialConfig.create({
        accounts: [],
        templates: [],
      });
    }

    return NextResponse.json({ config });
  } catch (err: any) {
    console.error("Social config fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Update social configuration
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const data = await req.json();
    
    console.log("Received social config data:", JSON.stringify(data, null, 2));
    
    // Clean up any _id fields from the data before saving
    if (data.accounts) {
      data.accounts = data.accounts.map(({ _id, ...account }: any) => account);
    }
    if (data.templates) {
      data.templates = data.templates.map(({ _id, ...template }: any) => template);
    }
    
    let config = await SocialConfig.findOne();
    
    if (!config) {
      config = new SocialConfig({
        accounts: data.accounts || [],
        templates: data.templates || [],
        defaultTemplate: data.defaultTemplate,
      });
    } else {
      // Update the entire arrays
      config.accounts = data.accounts || [];
      config.templates = data.templates || [];
      if (data.defaultTemplate !== undefined) {
        config.defaultTemplate = data.defaultTemplate;
      }
    }
    
    // Mark the entire arrays as modified
    config.markModified('accounts');
    config.markModified('templates');
    
    await config.save();
    
    console.log("Saved config:", JSON.stringify(config, null, 2));
    
    // Verify it was actually saved by querying again
    const verifyConfig = await SocialConfig.findOne().lean();
    console.log("Verification - Config in DB:", JSON.stringify(verifyConfig, null, 2));

    return NextResponse.json({
      message: "Social configuration updated successfully",
      config: verifyConfig,
    });
  } catch (err: any) {
    console.error("Social config update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
