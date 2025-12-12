import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";

// GET - Check session status
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const wahaBaseUrl = searchParams.get("wahaBaseUrl");
    const sessionName = searchParams.get("sessionName");
    const wahaApiKey = searchParams.get("wahaApiKey");

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

    // Check status from WAHA
    const response = await fetch(
      `${wahaBaseUrl}/api/sessions/${sessionName}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WAHA API error: ${error}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (err) {
    const error = err as Error;
    console.error("WAHA status check error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
