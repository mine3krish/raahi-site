import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";

const WAHA_API_KEY = "d0169ac6199f4681a46f191bce4dce94";

export async function DELETE(req: NextRequest) {
  try {
    verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const wahaBaseUrl = searchParams.get("wahaBaseUrl");
    const sessionName = searchParams.get("sessionName");

    if (!wahaBaseUrl || !sessionName) {
      return NextResponse.json(
        { error: "wahaBaseUrl and sessionName are required" },
        { status: 400 }
      );
    }

    const url = `${wahaBaseUrl}/api/sessions/${sessionName}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Api-Key": WAHA_API_KEY,
    };

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
