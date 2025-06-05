import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized. Only super admins can delete inquiries." }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    console.log(`🗑️ DELETE /api/inquiries/${id} - Deleting inquiry...`)

    // First, delete any related WhatsApp status records
    await sql`
      DELETE FROM whatsapp_status 
      WHERE record_id = ${id} AND record_type = 'inquiry'
    `

    // Then delete the inquiry
    const result = await sql`
      DELETE FROM inquiries 
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      console.error(`❌ Inquiry with ID ${id} not found`)
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
    }

    console.log(`✅ Inquiry ${id} deleted successfully`)
    return NextResponse.json({ success: true, message: "Inquiry deleted successfully" })
  } catch (error) {
    console.error(`💥 Error deleting inquiry:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
