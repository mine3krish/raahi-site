import { NextResponse } from "next/server";
import Property from "@/models/Property";
import { connectDB } from "../../connect";

export async function GET() {
  try {
    await connectDB();

    // Get distinct states that have active properties
    const states = await Property.distinct("state", { status: "Active" });
    
    // Sort alphabetically
    states.sort();

    return NextResponse.json({ states });
  } catch (err: any) {
    console.error("States fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
