import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";

// GET - Fetch WhatsApp groups from WAHA
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const { wahaBaseUrl, sessionName, wahaApiKey } = await req.json();

    if (!wahaBaseUrl || !sessionName) {
      return NextResponse.json(
        { error: "WAHA configuration incomplete" },
        { status: 400 }
      );
    }

    const headers: any = {
      "Content-Type": "application/json",
    };
    
    if (wahaApiKey) {
      headers["X-Api-Key"] = wahaApiKey;
    }

    // Fetch groups from WAHA
    const groupsResponse = await fetch(
      `${wahaBaseUrl}/api/${sessionName}/groups`,
      {
        method: "GET",
        headers,
      }
    );

    if (!groupsResponse.ok) {
      const error = await groupsResponse.text();
      throw new Error(`WAHA API error: ${error}`);
    }

    const groupsData = await groupsResponse.json();
    
    // Extract groups from groupMetadata
    const groups = groupsData.map((item: any) => ({
      id: item.groupMetadata?.id?._serialized || String(item.id || ''),
      name: item.groupMetadata?.subject || 'Unknown Group',
      type: 'group'
    }));

    // Fetch channels from WAHA
    const channelsResponse = await fetch(
      `${wahaBaseUrl}/api/${sessionName}/channels`,
      {
        method: "GET",
        headers,
      }
    );

    let channels = [];
    if (channelsResponse.ok) {
      const channelsData = await channelsResponse.json();
      channels = channelsData.map((channel: any) => ({
        id: channel.id,
        name: channel.name,
        type: 'channel'
      }));
    }

    return NextResponse.json({ groups: [...groups, ...channels] });
  } catch (err: any) {
    console.error("WAHA groups fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
