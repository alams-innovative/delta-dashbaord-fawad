import { type NextRequest, NextResponse } from "next/server"
import { updateInfluencer, deleteInfluencer } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const data = await request.json()

    const influencer = await updateInfluencer(id, {
      name: data.name,
      facebook_url: data.facebookUrl,
      instagram_url: data.instagramUrl,
      tiktok_url: data.tiktokUrl,
      youtube_url: data.youtubeUrl,
      price: data.price,
      comments: data.comments,
    })

    if (!influencer) {
      return NextResponse.json({ error: "Influencer not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, influencer })
  } catch (error) {
    console.error("Error updating influencer:", error)
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
    await deleteInfluencer(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting influencer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
