import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    console.log(`📥 GET /api/inquiries/${id} - Fetching inquiry...`)

    if (isNaN(id)) {
      console.error("❌ Invalid inquiry ID provided")
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL not found")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    const result = await sql`
      SELECT id, name, phone, email, heard_from, question, checkbox_field, is_read, whatsapp_welcome_sent, whatsapp_followup_sent, whatsapp_reminder_sent, created_at, course, gender, matric_marks, out_of_marks, intermediate_stream
      FROM inquiries 
      WHERE id = ${id}
      LIMIT 1
    `

    const inquiry = result[0]

    if (!inquiry) {
      console.log(`🔍 Inquiry with ID ${id} not found`)
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
    }

    console.log("✅ Inquiry fetched successfully:", inquiry.id)
    return NextResponse.json({
      id: inquiry.id,
      name: inquiry.name || "",
      phone: inquiry.phone || "",
      email: inquiry.email || "",
      heardFrom: inquiry.heard_from || "Unknown",
      question: inquiry.question || "",
      isRead: inquiry.is_read || false,
      checkboxField: inquiry.checkbox_field || false,
      whatsapp_welcome_sent: inquiry.whatsapp_welcome_sent || false,
      whatsapp_followup_sent: inquiry.whatsapp_followup_sent || false,
      whatsapp_reminder_sent: inquiry.whatsapp_reminder_sent || false,
      createdAt: inquiry.created_at
        ? new Date(inquiry.created_at).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Unknown",
      course: inquiry.course || "MDCAT",
      gender: inquiry.gender || null,
      matricMarks: inquiry.matric_marks || null,
      outOfMarks: inquiry.out_of_marks || null,
      intermediateStream: inquiry.intermediate_stream || null,
    })
  } catch (error) {
    console.error("💥 Error fetching inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    console.log(`🔄 PATCH /api/inquiries/${id} - Updating inquiry...`)

    if (isNaN(id)) {
      console.error("❌ Invalid inquiry ID provided")
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    const data = await request.json()
    console.log("📋 Received data for update:", data)

    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL not found")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    const updateFields: string[] = []
    const updateValues: any[] = []

    if (data.name !== undefined) {
      updateFields.push("name = $")
      updateValues.push(data.name)
    }
    if (data.phone !== undefined) {
      updateFields.push("phone = $")
      updateValues.push(data.phone)
    }
    if (data.email !== undefined) {
      updateFields.push("email = $")
      updateValues.push(data.email)
    }
    if (data.heardFrom !== undefined) {
      updateFields.push("heard_from = $")
      updateValues.push(data.heardFrom)
    }
    if (data.question !== undefined) {
      updateFields.push("question = $")
      updateValues.push(data.question)
    }
    if (data.checkboxField !== undefined) {
      updateFields.push("checkbox_field = $")
      updateValues.push(data.checkboxField)
    }
    if (data.course !== undefined) {
      updateFields.push("course = $")
      updateValues.push(data.course)
    }
    if (data.gender !== undefined) {
      updateFields.push("gender = $")
      updateValues.push(data.gender)
    }
    if (data.matricMarks !== undefined) {
      updateFields.push("matric_marks = $")
      updateValues.push(data.matricMarks)
    }
    if (data.outOfMarks !== undefined) {
      updateFields.push("out_of_marks = $")
      updateValues.push(data.outOfMarks)
    }
    if (data.intermediateStream !== undefined) {
      updateFields.push("intermediate_stream = $")
      updateValues.push(data.intermediateStream)
    }

    if (updateFields.length === 0) {
      console.log("ℹ️ No fields to update")
      return NextResponse.json({ message: "No fields to update" }, { status: 200 })
    }

    const query = `
      UPDATE inquiries 
      SET 
        ${updateFields.map((field, index) => `${field}${index + 1}`).join(", ")},
        updated_at = NOW()
      WHERE id = $${updateFields.length + 1}
      RETURNING *
    `

    const result = await sql(query, ...updateValues, id)

    const updatedInquiry = result[0]

    if (!updatedInquiry) {
      console.error(`❌ Failed to update inquiry with ID ${id}`)
      return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 })
    }

    console.log("✅ Inquiry updated successfully:", updatedInquiry.id)
    return NextResponse.json({ success: true, inquiry: updatedInquiry })
  } catch (error) {
    console.error("💥 Error updating inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    console.log(`🗑️ DELETE /api/inquiries/${id} - Deleting inquiry...`)

    if (isNaN(id)) {
      console.error("❌ Invalid inquiry ID provided")
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL not found")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    await sql`DELETE FROM inquiries WHERE id = ${id}`

    console.log(`✅ Inquiry with ID ${id} deleted successfully`)
    return NextResponse.json({ success: true, message: "Inquiry deleted successfully" })
  } catch (error) {
    console.error("💥 Error deleting inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
