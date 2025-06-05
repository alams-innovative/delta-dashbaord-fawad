import { type NextRequest, NextResponse } from "next/server"
import { getInquiryStatusHistory, createInquiryStatus } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const inquiryId = Number.parseInt(params.id)

    if (isNaN(inquiryId)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    console.log(`🔍 Fetching status history for inquiry ${inquiryId}`)

    try {
      const history = await getInquiryStatusHistory(inquiryId)
      console.log(`✅ Found ${history.length} status entries for inquiry ${inquiryId}`)
      return NextResponse.json(history)
    } catch (dbError) {
      console.error("❌ Database error in status history:", dbError)

      // Return empty array instead of error to prevent UI breaking
      return NextResponse.json([])
    }
  } catch (error) {
    console.error("❌ Error in GET /api/inquiries/[id]/status:", error)
    return NextResponse.json([], { status: 200 }) // Return empty array with 200 status
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

    console.log(`📝 Creating status entry for inquiry ${inquiryId}:`, { status, updated_by })

    try {
      const result = await createInquiryStatus({
        inquiry_id: inquiryId,
        status,
        comments: comments || null,
        updated_by,
      })

      if (result) {
        console.log("✅ Status entry created successfully")
        return NextResponse.json(result)
      } else {
        console.error("❌ Failed to create status entry - no result returned")
        return NextResponse.json({ error: "Failed to create status entry" }, { status: 500 })
      }
    } catch (dbError) {
      console.error("❌ Database error creating status:", dbError)
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ Error in POST /api/inquiries/[id]/status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
