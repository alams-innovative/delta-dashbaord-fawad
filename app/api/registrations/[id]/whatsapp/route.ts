import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { buttonType, name, phone, message } = await request.json()
    const registrationId = Number.parseInt(params.id)

    if (!buttonType || !["welcome", "payment", "reminder"].includes(buttonType)) {
      return NextResponse.json({ error: "Invalid button type" }, { status: 400 })
    }

    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if this message type has already been sent for this registration
    const existing = await sql`
      SELECT id FROM whatsapp_status 
      WHERE record_id = ${registrationId} 
      AND record_type = 'registration' 
      AND message_type = ${buttonType}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Message already sent" }, { status: 400 })
    }

    // Insert the WhatsApp message record
    await sql`
      INSERT INTO whatsapp_status (record_id, record_type, name, phone, message_type, message_text)
      VALUES (${registrationId}, 'registration', ${name}, ${phone}, ${buttonType}, ${message})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating WhatsApp button state:", error)
    return NextResponse.json({ error: "Failed to update button state" }, { status: 500 })
  }
}
