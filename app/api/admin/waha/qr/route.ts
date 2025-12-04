import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";

const WAHA_API_KEY = "d0169ac6199f4681a46f191bce4dce94";

// GET - Fetch QR code for session authentication
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const wahaBaseUrl = searchParams.get("wahaBaseUrl");
    const sessionName = searchParams.get("sessionName");

    if (!wahaBaseUrl || !sessionName) {
      return NextResponse.json(
        { error: "WAHA base URL and session name are required" },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Api-Key": WAHA_API_KEY,
    };

    // Fetch QR code from WAHA
    const response = await fetch(
      `${wahaBaseUrl}/api/${sessionName}/auth/qr`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WAHA API error: ${error}`);
    }

    // WAHA returns QR as image, convert to base64
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const qrDataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ qr: qrDataUrl });
  } catch (err) {
    const error = err as Error;
    console.error("WAHA QR fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
