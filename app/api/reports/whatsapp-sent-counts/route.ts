import { NextResponse } from "next/server"
import { getInquiryWhatsAppSentCounts, getRegistrationWhatsAppSentCounts } from "@/lib/db"

export async function GET() {
  try {
    const inquirySentCounts = await getInquiryWhatsAppSentCounts()
    const registrationSentCounts = await getRegistrationWhatsAppSentCounts()

    return NextResponse.json({
      inquirySentCounts,
      registrationSentCounts,
    })
  } catch (error) {
    console.error("Error fetching WhatsApp sent counts:", error)
    return NextResponse.json({ error: "Failed to fetch WhatsApp sent counts" }, { status: 500 })
  }
}
