import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import Agent from "@/models/Agent";

// POST - Submit agent application
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, phone, city, state, experience, licenseNumber, portfolio, message } = body;

    // Validation
    if (!name || !email || !phone || !city || !state || !experience || !message) {
      return NextResponse.json(
        { message: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ""))) {
      return NextResponse.json(
        { message: "Phone number must be 10 digits" },
        { status: 400 }
      );
    }

    // Check if agent already applied
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return NextResponse.json(
        { message: "You have already submitted an application with this email" },
        { status: 400 }
      );
    }

    // Create agent application
    const agent = await Agent.create({
      name,
      email,
      phone,
      city,
      state,
      experience,
      licenseNumber: licenseNumber || undefined,
      portfolio: portfolio || undefined,
      message,
      status: "pending",
    });

    return NextResponse.json(
      {
        message: "Application submitted successfully! We'll contact you soon.",
        agent: {
          id: agent._id,
          name: agent.name,
          email: agent.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Agent application error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}
