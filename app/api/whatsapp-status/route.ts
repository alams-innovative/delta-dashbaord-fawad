import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get("recordId")
    const recordType = searchParams.get("recordType")

    if (!recordId || !recordType) {
      return NextResponse.json({ error: "Missing recordId or recordType" }, { status: 400 })
    }

    const result = await sql`
      SELECT message_type, sent_at 
      FROM whatsapp_status 
      WHERE record_id = ${Number.parseInt(recordId)} 
      AND record_type = ${recordType}
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching WhatsApp status:", error)
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get("recordId")
    const recordType = searchParams.get("recordType")
    const messageType = searchParams.get("messageType")

    if (!recordId || !recordType) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    if (messageType) {
      // Delete specific message type
      await sql`
        DELETE FROM whatsapp_status 
        WHERE record_id = ${Number.parseInt(recordId)} 
        AND record_type = ${recordType}
        AND message_type = ${messageType}
      `
    } else {
      // Delete all messages for this record
      await sql`
        DELETE FROM whatsapp_status 
        WHERE record_id = ${Number.parseInt(recordId)} 
        AND record_type = ${recordType}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting WhatsApp status:", error)
    return NextResponse.json({ error: "Failed to delete status" }, { status: 500 })
  }
}
