import { type NextRequest, NextResponse } from "next/server"
import { getRegistrations, createRegistration } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    console.log("📡 API: Getting registrations...")
    const user = await getCurrentUser()
    if (!user) {
      console.log("❌ Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const registrations = await getRegistrations()
    console.log("✅ API: Returning", registrations.length, "registrations")
    return NextResponse.json(registrations)
  } catch (error) {
    console.error("💥 API Error fetching registrations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const registration = await createRegistration(data)

    if (!registration) {
      return NextResponse.json({ error: "Failed to create registration" }, { status: 500 })
    }

    return NextResponse.json({ success: true, registration })
  } catch (error) {
    console.error("Error creating registration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
