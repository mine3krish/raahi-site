import { NextResponse } from "next/server";
import Property from "@/models/Property";
import PremiumProject from "@/models/PremiumProject";
import Community from "@/models/Community";
import Contact from "@/models/Contact";
import Agent from "@/models/Agent";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "../../connect";

export async function GET(req: Request) {
  try {
    await connectDB();
    await verifyAdmin(req);

    // Get property counts
    const totalProperties = await Property.countDocuments();
    const featuredProperties = await Property.countDocuments({ featured: true });
    const bestDealProperties = await Property.countDocuments({ bestDeal: true });
    const premiumProperties = await Property.countDocuments({ premium: true });
    const activeProperties = await Property.countDocuments({ status: "Active" });
    const soldProperties = await Property.countDocuments({ status: "Sold" });
    
    // Get premium projects count
    const totalPremiumProjects = await PremiumProject.countDocuments();
    
    // Get community count
    const totalCommunities = await Community.countDocuments();
    
    // Get contact counts
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: "new" });
    
    // Get agent counts
    const totalAgents = await Agent.countDocuments();
    const pendingAgents = await Agent.countDocuments({ status: "pending" });

    return NextResponse.json({
      totalProperties,
      featuredProperties,
      bestDealProperties,
      premiumProperties,
      totalPremiumProjects,
      activeProperties,
      soldProperties,
      totalCommunities,
      totalContacts,
      newContacts,
      totalAgents,
      pendingAgents,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
