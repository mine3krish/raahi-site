import { NextRequest, NextResponse } from "next/server";
import Wishlist from "@/models/Wishlist";
import { connectDB } from "../connect";
import jwt from "jsonwebtoken";

// Get user's wishlist
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const wishlist = await Wishlist.find({ userId: decoded.id });
    const propertyIds = wishlist.map(w => w.propertyId);

    return NextResponse.json({ propertyIds });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Add to wishlist
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const { propertyId } = await req.json();

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID required" }, { status: 400 });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ 
      userId: decoded.id, 
      propertyId 
    });

    if (existing) {
      return NextResponse.json({ error: "Already in wishlist" }, { status: 400 });
    }

    const wishlistItem = new Wishlist({
      userId: decoded.id,
      propertyId,
    });

    await wishlistItem.save();

    return NextResponse.json({ 
      message: "Added to wishlist",
      propertyId 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Remove from wishlist
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID required" }, { status: 400 });
    }

    await Wishlist.findOneAndDelete({ 
      userId: decoded.id, 
      propertyId 
    });

    return NextResponse.json({ 
      message: "Removed from wishlist",
      propertyId 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
