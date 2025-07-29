import { type NextRequest, NextResponse } from "next/server"
import { updateInquiry, deleteInquiry } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    const data = await request.json()
    console.log(`📤 PATCH /api/inquiries/${id} - Updating inquiry with data:`, data)

    const updated = await updateInquiry(id, {
      name: data.name,
      phone: data.phone,
      email: data.email,
      heard_from: data.heardFrom,
      question: data.question,
      checkbox_field: data.checkboxField,
      program_of_interest: data.programOfInterest, // Added new field
    })

    if (updated) {
      console.log(`✅ Inquiry ${id} updated successfully.`)
      return NextResponse.json({ success: true, inquiry: updated })
    } else {
      console.warn(`⚠️ Inquiry ${id} not found or failed to update.`)
      return NextResponse.json({ error: "Inquiry not found or failed to update" }, { status: 404 })
    }
  } catch (error) {
    console.error(`❌ Error updating inquiry ${params.id}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    console.log(`🗑️ DELETE /api/inquiries/${id} - Deleting inquiry...`)

    const deleted = await deleteInquiry(id)

    if (deleted) {
      console.log(`✅ Inquiry ${id} deleted successfully.`)
      return NextResponse.json({ success: true })
    } else {
      console.warn(`⚠️ Inquiry ${id} not found or failed to delete.`)
      return NextResponse.json({ error: "Inquiry not found or failed to delete" }, { status: 404 })
    }
  } catch (error) {
    console.error(`❌ Error deleting inquiry ${params.id}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
