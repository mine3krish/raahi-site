import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  try {
    verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const wahaBaseUrl = searchParams.get("wahaBaseUrl");
    const sessionName = searchParams.get("sessionName");
    const wahaApiKey = searchParams.get("wahaApiKey");

    if (!wahaBaseUrl || !sessionName) {
      return NextResponse.json(
        { error: "wahaBaseUrl and sessionName are required" },
        { status: 400 }
      );
    }

    const url = `${wahaBaseUrl}/api/sessions/${sessionName}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (wahaApiKey) {
      headers["X-Api-Key"] = wahaApiKey;
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WAHA delete session error:", errorText);
      return NextResponse.json(
        { error: `WAHA API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Delete session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete session" },
      { status: 500 }
    );
  }
}
