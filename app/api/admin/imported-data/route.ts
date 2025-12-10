import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import ImportedData from "@/models/ImportedData";
import { verifyAdmin } from "@/lib/auth";

// GET /api/admin/imported-data - List all imported data with search and filters
export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};

    // Search by newListingId or listingId
    const search = searchParams.get("search");
    if (search) {
      query.$or = [
        { newListingId: { $regex: search, $options: "i" } },
        { listingId: { $regex: search, $options: "i" } },
        { schemeName: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { fingerprint: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by state
    const state = searchParams.get("state");
    if (state) {
      query.state = state;
    }

    // Filter by city
    const city = searchParams.get("city");
    if (city) {
      query.city = city;
    }

    // Filter by category
    const category = searchParams.get("category");
    if (category) {
      query.category = category;
    }

    // Filter by import batch
    const importBatchId = searchParams.get("importBatchId");
    if (importBatchId) {
      query.importBatchId = importBatchId;
    }

    // Filter by processed status
    const processed = searchParams.get("processed");
    if (processed !== null && processed !== "") {
      query.processed = processed === "true";
    }

    // Get total count
    const total = await ImportedData.countDocuments(query);

    // Get data
    const data = await ImportedData.find(query)
      .sort({ importedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching imported data:", error);
    return NextResponse.json(
      { error: "Failed to fetch imported data" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/imported-data - Delete imported data (by batch or individual)
export async function DELETE(request: NextRequest) {
  try {
    await verifyAdmin(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");
    const id = searchParams.get("id");

    if (batchId) {
      // Delete entire batch
      const result = await ImportedData.deleteMany({ importBatchId: batchId });
      return NextResponse.json({
        message: `Deleted ${result.deletedCount} records from batch ${batchId}`,
        deletedCount: result.deletedCount,
      });
    } else if (id) {
      // Delete single record
      await ImportedData.findByIdAndDelete(id);
      return NextResponse.json({ message: "Record deleted successfully" });
    } else {
      return NextResponse.json(
        { error: "Either batchId or id is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting imported data:", error);
    return NextResponse.json(
      { error: "Failed to delete imported data" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
