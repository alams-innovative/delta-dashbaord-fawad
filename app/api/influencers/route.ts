import { type NextRequest, NextResponse } from "next/server"
import { getInfluencers, createInfluencer } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    console.log("📡 API: Getting influencers...")
    const user = await getCurrentUser()
    if (!user || user.role !== "super_admin") {
      console.log("❌ Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const influencers = await getInfluencers()
    console.log("✅ API: Returning", influencers.length, "influencers")
    return NextResponse.json(influencers)
  } catch (error) {
    console.error("💥 API Error fetching influencers:", error)
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
    const influencer = await createInfluencer(data)

    if (!influencer) {
      return NextResponse.json({ error: "Failed to create influencer" }, { status: 500 })
    }

    return NextResponse.json({ success: true, influencer })
  } catch (error) {
    console.error("Error creating influencer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
