import { type NextRequest, NextResponse } from "next/server"
import { getAgencies, createAgency, getAgencyStats } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === "stats") {
      const stats = await getAgencyStats()
      return NextResponse.json(stats)
    } else {
      const agencies = await getAgencies()
      return NextResponse.json(agencies)
    }
  } catch (error) {
    console.error("Error fetching agencies:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const agency = await createAgency({
      name: data.name,
      contact_person: data.contact_person,
      phone: data.phone,
      email: data.email,
      commission_rate: data.commission_rate,
    })

    if (!agency) {
      return NextResponse.json({ error: "Failed to create agency" }, { status: 500 })
    }

    return NextResponse.json({ success: true, agency })
  } catch (error) {
    console.error("Error creating agency:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
