import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("📥 GET /api/inquiries - Fetching inquiries...")

    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL not found")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    const result = await sql`
      SELECT * FROM inquiries ORDER BY created_at DESC
    `

    console.log("📊 Raw database result:", result.length, "inquiries found")
    console.log("Sample inquiry data:", result.length > 0 ? JSON.stringify(result[0]) : "No inquiries")

    const transformedInquiries = result.map((inquiry: any) => {
      let formattedDate = "Unknown"
      try {
        if (inquiry.created_at) {
          const date = new Date(inquiry.created_at)
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          }
        }
      } catch (error) {
        console.error("Error formatting date:", error)
      }

      return {
        id: inquiry.id,
        name: inquiry.name || "",
        phone: inquiry.phone || "",
        email: inquiry.email || "",
        heardFrom: inquiry.heard_from || "Unknown",
        question: inquiry.question || "",
        isRead: inquiry.is_read || false,
        whatsapp_welcome_sent: inquiry.whatsapp_welcome_sent || false,
        whatsapp_followup_sent: inquiry.whatsapp_followup_sent || false,
        whatsapp_reminder_sent: inquiry.whatsapp_reminder_sent || false,
        createdAt: formattedDate,
        course: inquiry.course || "MDCAT",
        gender: inquiry.gender || null,
        matricMarks: inquiry.matric_marks || null,
        outOfMarks: inquiry.out_of_marks || null,
      }
    })

    console.log("✅ Inquiries fetched successfully:", transformedInquiries.length)
    return NextResponse.json(transformedInquiries)
  } catch (error) {
    console.error("❌ Error fetching inquiries:", error)
    console.log("🔄 Returning empty array due to database error")
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📤 POST /api/inquiries - Creating new inquiry...")
    const data = await request.json()
    console.log("📋 Received data:", data)

    if (!data.name || !data.phone) {
      console.error("❌ Missing required fields")
      return NextResponse.json({ error: "Missing required fields: name, phone" }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL not found")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    const result = await sql`
      INSERT INTO inquiries (name, phone, email, heard_from, question, course, gender, matric_marks, out_of_marks)
      VALUES (${data.name}, ${data.phone}, ${data.email || null}, ${data.heardFrom || null}, ${data.question || null}, ${data.course || "MDCAT"}, ${data.gender || null}, ${data.matricMarks || null}, ${data.outOfMarks || null})
      RETURNING *
    `

    const inquiry = result[0]

    if (!inquiry) {
      console.error("❌ Failed to create inquiry in database")
      return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 })
    }

    console.log("✅ Inquiry created successfully:", inquiry.id)
    return NextResponse.json({ success: true, inquiry })
  } catch (error) {
    console.error("💥 Error creating inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
