import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import ImportedData from "@/models/ImportedData";
import { verifyAdmin } from "@/lib/auth";

// GET /api/admin/imported-data/batches - Get list of import batches
export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);
    await connectDB();

    const batches = await ImportedData.aggregate([
      {
        $group: {
          _id: "$importBatchId",
          importBatchId: { $first: "$importBatchId" },
          totalRecords: { $sum: 1 },
          processedRecords: {
            $sum: { $cond: ["$processed", 1, 0] }
          },
          successfulRecords: {
            $sum: { $cond: [{ $and: ["$processed", { $not: "$processingError" }] }, 1, 0] }
          },
          errorRecords: {
            $sum: { $cond: ["$processingError", 1, 0] }
          },
          firstImportedAt: { $min: "$importedAt" },
          lastImportedAt: { $max: "$importedAt" },
        }
      },
      {
        $sort: { firstImportedAt: -1 }
      }
    ]);

    return NextResponse.json({ batches });
  } catch (error) {
    console.error("Error fetching import batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch import batches" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
