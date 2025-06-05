import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("🔍 Getting inquiries with status...")

    const result = await sql`
      SELECT 
        i.id,
        i.name,
        i.phone,
        i.email,
        i.created_at,
        s.status as current_status,
        s.created_at as last_updated,
        s.updated_by
      FROM inquiries i
      LEFT JOIN (
        SELECT DISTINCT ON (inquiry_id) 
          inquiry_id, 
          status,
          created_at,
          updated_by
        FROM inquiry_status 
        ORDER BY inquiry_id, created_at DESC
      ) s ON i.id = s.inquiry_id
      ORDER BY i.created_at DESC
    `

    console.log("✅ Inquiries with status retrieved successfully")
    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Error getting inquiries with status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
