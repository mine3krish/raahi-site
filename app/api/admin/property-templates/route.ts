import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import PropertyTemplate from "@/models/PropertyTemplate";
import { verifyAdmin } from "@/lib/auth";

// GET /api/admin/property-templates - Get all templates or specific template
export async function GET(request: NextRequest) {
  try {
    // Public endpoint - no auth required for reading templates
    await connectDB();

    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const getDefault = searchParams.get("default");

    if (getDefault === "true") {
      // Get default template
      let template = await PropertyTemplate.findOne({ isDefault: true, state: { $exists: false } });
      
      if (!template) {
        // Create default template if it doesn't exist
        template = await PropertyTemplate.create({
          name: "Default Template",
          isDefault: true,
          visibleFields: {}, // Will use schema defaults
        });
      }
      
      return NextResponse.json({ template });
    }

    if (state) {
      // Get state-specific template or fall back to default
      let template = await PropertyTemplate.findOne({ state });
      
      if (!template) {
        // Return default template if no state-specific template exists
        template = await PropertyTemplate.findOne({ isDefault: true, state: { $exists: false } });
      }
      
      return NextResponse.json({ template });
    }

    // Get all templates
    const templates = await PropertyTemplate.find().sort({ isDefault: -1, state: 1 });
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST /api/admin/property-templates - Create new template
export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request);
    await connectDB();

    const body = await request.json();
    const { state, name, visibleFields, isDefault } = body;

    // Validate required fields
    if (!name || !visibleFields) {
      return NextResponse.json(
        { error: "Name and visibleFields are required" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault && !state) {
      await PropertyTemplate.updateMany(
        { isDefault: true, state: { $exists: false } },
        { isDefault: false }
      );
    }

    const template = await PropertyTemplate.create({
      state,
      name,
      visibleFields,
      isDefault: isDefault || false,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/property-templates/:id - Update template
export async function PUT(request: NextRequest) {
  try {
    await verifyAdmin(request);
    await connectDB();

    const body = await request.json();
    const { id, name, visibleFields, isDefault } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    const template = await PropertyTemplate.findById(id);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault && !template.state) {
      await PropertyTemplate.updateMany(
        { _id: { $ne: id }, isDefault: true, state: { $exists: false } },
        { isDefault: false }
      );
    }

    template.name = name || template.name;
    template.visibleFields = visibleFields || template.visibleFields;
    template.isDefault = isDefault !== undefined ? isDefault : template.isDefault;
    
    await template.save();

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/property-templates/:id - Delete template
export async function DELETE(request: NextRequest) {
  try {
    await verifyAdmin(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    const template = await PropertyTemplate.findById(id);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Don't allow deleting the default template
    if (template.isDefault && !template.state) {
      return NextResponse.json(
        { error: "Cannot delete the default template" },
        { status: 400 }
      );
    }

    await PropertyTemplate.findByIdAndDelete(id);

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
