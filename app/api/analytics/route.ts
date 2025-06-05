import { type NextRequest, NextResponse } from "next/server"
import { getAnalyticsData, createAnalyticsData, getAdSpendByPlatform, getMonthlyAdSpend } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === "platform-summary") {
      const data = await getAdSpendByPlatform()
      return NextResponse.json(data)
    } else if (type === "monthly-trends") {
      const data = await getMonthlyAdSpend()
      return NextResponse.json(data)
    } else {
      const data = await getAnalyticsData()
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
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

    const analyticsData = await createAnalyticsData({
      platform: data.platform,
      spent: data.spent,
      leads: data.leads,
      month: data.month,
      year: data.year,
    })

    if (!analyticsData) {
      return NextResponse.json({ error: "Failed to create analytics data" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: analyticsData })
  } catch (error) {
    console.error("Error creating analytics data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
