import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "../../connect";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        await connectDB();

        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 403 });
    }
}