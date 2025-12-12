import { NextResponse } from "next/server";
import { connectDB } from "../../connect";
import User from "@/models/User";
import { generateToken, hashPassword } from "../utils";

export async function POST(req: Request) {
    await connectDB();
    const {name, email, password} = await req.json();

    if (!name || !email || !password)
        return NextResponse.json({ error: "All fields required" }, { status: 400 });

    const existing = await User.findOne({ email });
    if (existing)
        return NextResponse.json({ error: "User already exists" }, { status: 409 });

    const hashed = await hashPassword(password);
    const user = await User.create({ name, email, password: hashed, isVerified: true, authMethod: 'email' });
    const token = generateToken({ id: user._id, email: user.email });

    return NextResponse.json({ token, user: { name, email } }, { status: 201 });
}