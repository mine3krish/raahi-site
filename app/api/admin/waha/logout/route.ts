import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";

// POST - Logout from WhatsApp session
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const { wahaBaseUrl, sessionName, wahaApiKey } = await req.json();

    if (!wahaBaseUrl || !sessionName) {
      return NextResponse.json(
        { error: "WAHA base URL and session name are required" },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (wahaApiKey) {
      headers["X-Api-Key"] = wahaApiKey;
    }

    // Logout from WAHA
    const response = await fetch(
      `${wahaBaseUrl}/api/${sessionName}/auth/logout`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WAHA API error: ${error}`);
    }

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (err) {
    const error = err as Error;
    console.error("WAHA logout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
