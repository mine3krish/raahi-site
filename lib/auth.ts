import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/app/api/connect";

export async function verifyAdmin(req: Request) {
  await connectDB();

  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) throw new Error("Unauthorized");

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  const user = await User.findById(decoded.id);

  console.log(user);

  if (!user || !user.isAdmin) throw new Error("Forbidden");
  return user;
}
