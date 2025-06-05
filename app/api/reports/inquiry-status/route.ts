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

    // Calculate percentages
    const stats = statusResult.map((row) => ({
      status: row.status,
      count: Number(row.count),
      percentage: total > 0 ? (Number(row.count) / total) * 100 : 0,
    }))

    console.log("✅ Inquiry status statistics retrieved successfully")
    return NextResponse.json(stats)
  } catch (error) {
    console.error("❌ Error getting inquiry status statistics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
