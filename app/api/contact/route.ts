import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/api/connect";
import Contact from "@/models/Contact";

// POST - Submit a contact form
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Validation
    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required" },
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

    // Create contact
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      status: "new",
    });

    return NextResponse.json(
      {
        message: "Contact form submitted successfully! We'll get back to you soon.",
        contact: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
