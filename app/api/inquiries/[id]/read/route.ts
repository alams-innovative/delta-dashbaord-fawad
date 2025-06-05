import { type NextRequest, NextResponse } from "next/server"
import { markInquiryAsRead } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    await markInquiryAsRead(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking inquiry as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
