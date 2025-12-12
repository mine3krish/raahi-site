import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";

// GET - Fetch all sessions from WAHA
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const wahaBaseUrl = searchParams.get("wahaBaseUrl");
    const wahaApiKey = searchParams.get("wahaApiKey");

    if (!wahaBaseUrl) {
      return NextResponse.json(
        { error: "WAHA base URL is required" },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (wahaApiKey) {
      headers["X-Api-Key"] = wahaApiKey;
    }

    // Fetch sessions from WAHA
    const response = await fetch(`${wahaBaseUrl}/api/sessions`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WAHA API error: ${error}`);
    }

    const sessions = await response.json();

    return NextResponse.json({ sessions });
  } catch (err) {
    const error = err as Error;
    console.error("WAHA sessions fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create or start a session
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const { wahaBaseUrl, sessionName, config, wahaApiKey } = await req.json();

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

    // Start session on WAHA
    const response = await fetch(`${wahaBaseUrl}/api/sessions/start`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: sessionName,
        config: config || {
          proxy: null,
          webhooks: [],
        },
      }),
    });

    if (!response.ok) {
      // If session already exists (422), return success so QR can be shown
      if (response.status === 422) {
        return NextResponse.json({ 
          session: { name: sessionName, status: "SCAN_QR_CODE" },
          alreadyExists: true 
        });
      }
      
      const error = await response.text();
      throw new Error(`WAHA API error: ${error}`);
    }

    const data = await response.json();

    return NextResponse.json({ session: data });
  } catch (err) {
    const error = err as Error;
    console.error("WAHA session start error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Stop a session
export async function DELETE(req: NextRequest) {
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

    // Stop session on WAHA
    const response = await fetch(`${wahaBaseUrl}/api/sessions/${sessionName}/stop`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WAHA API error: ${error}`);
    }

    return NextResponse.json({ message: "Session stopped successfully" });
  } catch (err) {
    const error = err as Error;
    console.error("WAHA session stop error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
