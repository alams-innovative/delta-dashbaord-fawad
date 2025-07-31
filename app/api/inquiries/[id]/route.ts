import { type NextRequest, NextResponse } from "next/server"
import { updateInquiry } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    const data = await request.json()
    console.log(`Updating inquiry ${id} with data:`, data)

    const updatedInquiry = await updateInquiry(id, {
      name: data.name,
      phone: data.phone,
      email: data.email,
      heard_from: data.heardFrom,
      question: data.question,
      checkbox_field: data.checkboxField,
      course: data.course,
      gender: data.gender, // New field
      matric_marks: data.matricMarks, // New field
      out_of_marks: data.outOfMarks, // New field
      intermediate_stream: data.intermediateStream, // New field
    })

    if (!updatedInquiry) {
      return NextResponse.json({ error: "Inquiry not found or failed to update" }, { status: 404 })
    }

    return NextResponse.json(updatedInquiry)
  } catch (error) {
    console.error("Error updating inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
