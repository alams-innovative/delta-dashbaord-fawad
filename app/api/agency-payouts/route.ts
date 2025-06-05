import { type NextRequest, NextResponse } from "next/server"
import { getAgencyPayouts, createAgencyPayout } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payouts = await getAgencyPayouts()
    return NextResponse.json(payouts)
  } catch (error) {
    console.error("Error fetching agency payouts:", error)
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

    const payout = await createAgencyPayout({
      agency_id: data.agency_id || 1, // Default to first agency if not specified
      amount: data.amount,
      payout_date: data.payout_date || new Date().toISOString().split("T")[0],
      description: data.description,
    })

    if (!payout) {
      return NextResponse.json({ error: "Failed to create agency payout" }, { status: 500 })
    }

    return NextResponse.json({ success: true, payout })
  } catch (error) {
    console.error("Error creating agency payout:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
