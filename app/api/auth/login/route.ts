import User from "@/models/User";
import { connectDB } from "../../connect";
import { NextResponse } from "next/server";
import { comparePassword, generateToken } from "../utils";

export async function POST(req: Request) {
    await connectDB();
    const {email, password} = await req.json();

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await comparePassword(password, user.password);
    if (!valid)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = generateToken({ id: user._id, email: user.email });

    return NextResponse.json({ token, user: { name: user.name, email: user.email } });
}