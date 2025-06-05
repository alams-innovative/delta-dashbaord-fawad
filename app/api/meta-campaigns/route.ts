import { type NextRequest, NextResponse } from "next/server"
import { getMetaCampaigns, createMetaCampaign } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    console.log("📡 API: Getting Meta campaigns...")
    const user = await getCurrentUser()
    if (!user || user.role !== "super_admin") {
      console.log("❌ Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const campaigns = await getMetaCampaigns()
    console.log("✅ API: Returning", campaigns.length, "Meta campaigns")
    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("💥 API Error fetching Meta campaigns:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const campaign = await createMetaCampaign(data)

    if (!campaign) {
      return NextResponse.json({ error: "Failed to create Meta campaign" }, { status: 500 })
    }

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error("Error creating Meta campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
