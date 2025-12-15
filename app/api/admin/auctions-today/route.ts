import { NextRequest, NextResponse } from "next/server";
import Property from "@/models/Property";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../connect";

// Utility: parse AuctionDate in various formats (DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, etc.)
function parseAuctionDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Try ISO first
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  // Try DD/MM/YYYY
  const dmY = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmY) {
    const [_, dd, mm, yyyy] = dmY;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d;
  }
  // Try MM/DD/YYYY
  const mdY = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdY) {
    const [_, mm, dd, yyyy] = mdY;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d;
  }
  // Try YYYY/MM/DD
  const ymd = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymd) {
    const [_, yyyy, mm, dd] = ymd;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function isTodayIST(date: Date) {
  // Get current date in IST
  const now = new Date();
  // Convert now to IST
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + 5.5 * 60 * 60 * 1000);
  // Compare only the date parts (Y/M/D)
  return (
    date.getFullYear() === istTime.getFullYear() &&
    date.getMonth() === istTime.getMonth() &&
    date.getDate() === istTime.getDate()
  );
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await verifyAdmin(req);
    const allProperties = await Property.find({});
    const todaysAuctions = allProperties.filter((p: any) => {
      const d = parseAuctionDate(p.AuctionDate);
      return d && isTodayIST(d);
    });
    return NextResponse.json({
      count: todaysAuctions.length,
      auctions: todaysAuctions.map((p: any) => ({
        id: p.id,
        name: p.name,
        AuctionDate: p.AuctionDate,
        location: p.location,
        state: p.state,
        status: p.status,
        _id: p._id?.toString?.() || '',
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
