import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return false
  }
}

export async function GET() {
  try {
    console.log("📥 GET /api/inquiries - Fetching inquiries...")

    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL not found")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    // Try to fetch inquiries from database
    const result = await sql`
      SELECT *, program_of_interest FROM inquiries ORDER BY created_at DESC
    `

    console.log("📊 Raw database result:", result.length, "inquiries found")
    console.log("Sample inquiry data:", result.length > 0 ? JSON.stringify(result[0]) : "No inquiries")

    // Transform the data to match the expected format
    const transformedInquiries = result.map((inquiry: any) => {
      // Format the date properly
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
        checkboxField: inquiry.checkbox_field || false,
        whatsapp_welcome_sent: inquiry.whatsapp_welcome_sent || false,
        whatsapp_followup_sent: inquiry.whatsapp_followup_sent || false,
        whatsapp_reminder_sent: inquiry.whatsapp_reminder_sent || false,
        programOfInterest: inquiry.program_of_interest || "MDCAT", // Include new field
        createdAt: formattedDate,
      }
    })

    console.log("✅ Inquiries fetched successfully:", transformedInquiries.length)
    return NextResponse.json(transformedInquiries)
  } catch (error) {
    console.error("❌ Error fetching inquiries:", error)

    // Return empty array instead of error to prevent UI crashes
    console.log("🔄 Returning empty array due to database error")
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📤 POST /api/inquiries - Creating new inquiry...")
    const data = await request.json()
    console.log("📋 Received data:", data)

    // Validate required fields
    if (!data.name || !data.phone) {
      console.error("❌ Missing required fields")
      return NextResponse.json({ error: "Missing required fields: name, phone" }, { status: 400 })
    }

    // Verify reCAPTCHA
    if (!data.recaptchaToken) {
      console.error("❌ Missing reCAPTCHA token")
      return NextResponse.json({ error: "reCAPTCHA verification required" }, { status: 400 })
    }

    const isRecaptchaValid = await verifyRecaptcha(data.recaptchaToken)
    if (!isRecaptchaValid) {
      console.error("❌ reCAPTCHA verification failed")
      return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 })
    }

    console.log("✅ reCAPTCHA verification successful")

    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL not found")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    const result = await sql`
      INSERT INTO inquiries (name, phone, email, heard_from, question, checkbox_field, program_of_interest)
      VALUES (${data.name}, ${data.phone}, ${data.email || null}, ${data.heardFrom || null}, ${data.question || null}, ${data.checkboxField || false}, ${data.programOfInterest || "MDCAT"})
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
