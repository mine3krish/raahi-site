import { NextRequest, NextResponse } from "next/server";
import Property from "@/models/Property";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../connect";

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const dmY = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmY) {
    const [_, dd, mm, yyyy] = dmY;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d;
  }
  const mdY = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdY) {
    const [_, mm, dd, yyyy] = mdY;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d;
  }
  const ymd = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymd) {
    const [_, yyyy, mm, dd] = ymd;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d;
  }
  // Handle DD MMM YYYY HH:MM format, e.g., "15 Dec 2025 11:30"
  const ddMmmYyyyHhMm = dateStr.match(/^(\d{1,2}) (\w{3}) (\d{4}) (\d{1,2}):(\d{2})$/);
  if (ddMmmYyyyHhMm) {
    const [_, dd, mmm, yyyy, hh, mm] = ddMmmYyyyHhMm;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(mmm);
    if (monthIndex !== -1) {
      d = new Date(Number(yyyy), monthIndex, Number(dd), Number(hh), Number(mm));
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

function isTodayIST(date: Date) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + 5.5 * 60 * 60 * 1000);
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
    const todaysInspections = allProperties.filter((p: any) => {
      const d = parseDate(p.inspectionDate);
      return d && isTodayIST(d);
    });
    return NextResponse.json({
      count: todaysInspections.length,
      inspections: todaysInspections.map((p: any) => ({
        id: p.id,
        name: p.name,
        inspectionDate: p.inspectionDate,
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