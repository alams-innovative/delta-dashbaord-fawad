import { type NextRequest, NextResponse } from "next/server"
import { getInquiryStatusHistory, createInquiryStatus } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const inquiryId = Number.parseInt(params.id)

    if (isNaN(inquiryId)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    const history = await getInquiryStatusHistory(inquiryId)
    return NextResponse.json(history)
  } catch (error) {
    console.error("Error fetching inquiry status history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const inquiryId = Number.parseInt(params.id)

    if (isNaN(inquiryId)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    const body = await request.json()
    const { status, comments, updated_by } = body

    if (!status || !updated_by) {
      return NextResponse.json({ error: "Status and updated_by are required" }, { status: 400 })
    }

    const result = await createInquiryStatus({
      inquiry_id: inquiryId,
      status,
      comments: comments || null,
      updated_by,
    })

    if (result) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: "Failed to create status entry" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating inquiry status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
