import { NextResponse } from "next/server"
import {
  getTotalInquiryStatusUpdates,
  getTopInquiryStatusUpdaters,
  getInquiryStatusUpdateCounts,
  getBurnUnburnStats,
} from "@/lib/db"

export async function GET() {
  try {
    const totalUpdates = await getTotalInquiryStatusUpdates()
    const topUpdaters = await getTopInquiryStatusUpdaters()
    const statusUpdateCounts = await getInquiryStatusUpdateCounts()
    const burnUnburnStats = await getBurnUnburnStats() // New burn/unburn data

    return NextResponse.json({
      totalUpdates,
      topUpdaters,
      statusUpdateCounts,
      burnUnburnStats, // Include burn/unburn statistics
    })
  } catch (error) {
    console.error("Error fetching inquiry button stats:", error)
    return NextResponse.json({ error: "Failed to fetch inquiry button stats" }, { status: 500 })
  }
}
