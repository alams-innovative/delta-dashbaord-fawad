import { type NextRequest, NextResponse } from "next/server"
import { getTikTokCampaigns, createTikTokCampaign } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const campaigns = await getTikTokCampaigns()
    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("Error fetching TikTok campaigns:", error)
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

    const campaign = await createTikTokCampaign({
      name: data.name,
      budget: data.budget,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      notes: data.notes,
    })

    if (!campaign) {
      return NextResponse.json({ error: "Failed to create TikTok campaign" }, { status: 500 })
    }

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error("Error creating TikTok campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
