import { type NextRequest, NextResponse } from "next/server"
import { updateInquiry } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const data = await request.json()
    console.log(`📝 PATCH /api/inquiries/${id} - Updating inquiry...`, data)

    // Map the form field names to database field names
    const dbData = {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      heard_from: data.heardFrom || null,
      question: data.question || null,
      checkbox_field: data.checkboxField || false,
    }

    const updatedInquiry = await updateInquiry(id, dbData)

    if (!updatedInquiry) {
      console.error(`❌ Failed to update inquiry with ID ${id}`)
      return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 })
    }

    console.log(`✅ Inquiry ${id} updated successfully`)
    return NextResponse.json({ success: true, inquiry: updatedInquiry })
  } catch (error) {
    console.error(`💥 Error updating inquiry:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
