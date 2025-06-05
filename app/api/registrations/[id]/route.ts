import { type NextRequest, NextResponse } from "next/server"
import { updateRegistration, deleteRegistration } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const formData = await request.json()

    // Map form data to database field names
    const updateData = {
      name: formData.name,
      father_name: formData.fatherName,
      cnic: formData.cnic,
      phone: formData.phone,
      email: formData.email,
      fee_paid: formData.feePaid,
      fee_pending: formData.feePending,
      concession: formData.concession,
      gender: formData.gender,
      picture_url: formData.pictureUrl,
      comments: formData.comments,
    }

    const registration = await updateRegistration(id, updateData)

    if (!registration) {
      return NextResponse.json({ error: "Registration not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({ success: true, registration })
  } catch (error) {
    console.error("Error updating registration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    await deleteRegistration(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting registration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
