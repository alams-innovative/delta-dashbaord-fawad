import { type NextRequest, NextResponse } from "next/server"
import { getGoogleCampaigns, createGoogleCampaign } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    console.log("📡 API: Getting Google campaigns...")
    const user = await getCurrentUser()
    if (!user || user.role !== "super_admin") {
      console.log("❌ Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const campaigns = await getGoogleCampaigns()
    console.log("✅ API: Returning", campaigns.length, "Google campaigns")
    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("💥 API Error fetching Google campaigns:", error)
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
    const campaign = await createGoogleCampaign(data)

    if (!campaign) {
      return NextResponse.json({ error: "Failed to create Google campaign" }, { status: 500 })
    }

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error("Error creating Google campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
