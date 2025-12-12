import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import User from "@/models/User";
import SiteSettings from "@/models/SiteSettings";

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via WhatsApp using WAHA
async function sendWhatsAppOTP(mobile: string, otp: string): Promise<boolean> {
  try {
    // Get WAHA configuration from site settings
    const settings = await SiteSettings.findOne();
    if (!settings || !settings.wahaBaseUrl || !settings.wahaSessionName) {
      throw new Error("WhatsApp OTP not configured in site settings");
    }

    const { wahaBaseUrl, wahaSessionName, wahaApiKey } = settings;

    const headers: any = {
      "Content-Type": "application/json",
    };

    if (wahaApiKey) {
      headers["X-Api-Key"] = wahaApiKey;
    }

    const message = `🔐 Your OTP for Raahi Auctions is: *${otp}*\n\nThis OTP will expire in 5 minutes.\n\nDo not share this OTP with anyone.`;

    const response = await fetch(`${wahaBaseUrl}/api/sendText`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        chatId: mobile, // Format: 919876543210@c.us
        text: message,
        session: wahaSessionName,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("WAHA API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send WhatsApp OTP:", error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { mobile } = await req.json();

    // Validate mobile number (must be 10 digits)
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "Invalid mobile number. Must be a valid 10-digit Indian number." },
        { status: 400 }
      );
    }

    // Add +91 prefix
    const fullMobile = `+91${mobile}`;

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Check if user exists
    let user = await User.findOne({ mobile: fullMobile });

    if (user) {
      // Update existing user's OTP
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    } else {
      // Create temporary user entry with OTP (will be completed on verification)
      user = new User({
        name: "User", // Temporary name
        mobile: fullMobile,
        authMethod: "mobile",
        otp,
        otpExpiry,
      });
      await user.save({ validateBeforeSave: false });
    }

    // Send OTP via WhatsApp
    const whatsappId = `91${mobile}@c.us`; // WhatsApp ID format
    const sent = await sendWhatsAppOTP(whatsappId, otp);

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please check WhatsApp configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "OTP sent successfully to your WhatsApp",
      mobile: fullMobile,
    });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
