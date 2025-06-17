import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("🔍 Getting inquiry status statistics...")

    // Get total count of inquiries
    const totalResult = await sql`
      SELECT COUNT(*) as total FROM inquiries
    `
    console.log("📊 Total inquiries result:", totalResult)
    const total = Number(totalResult[0].total)

    // Get status distribution
    const statusResult = await sql`
      SELECT 
        COALESCE(s.status, 'no_status') as status,
        COUNT(*) as count
      FROM inquiries i
      LEFT JOIN (
        SELECT DISTINCT ON (inquiry_id) 
          inquiry_id, 
          status
        FROM inquiry_status 
        ORDER BY inquiry_id, created_at DESC
      ) s ON i.id = s.inquiry_id
      GROUP BY s.status
      ORDER BY count DESC
    `
    console.log("📊 Status distribution result:", statusResult)

    // Calculate percentages
    const statusDistribution = statusResult.map((row) => ({
      status: row.status,
      count: Number(row.count),
      percentage: total > 0 ? (Number(row.count) / total) * 100 : 0,
    }))

    // Return data in the expected object format
    const responseData = {
      totalInquiries: total,
      statusDistribution: statusDistribution,
    }

    console.log("✅ Inquiry status statistics retrieved successfully:", responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("❌ Error getting inquiry status statistics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
