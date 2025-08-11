import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { z } from "zod"

const sql = neon(process.env.DATABASE_URL!)

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number")
    .optional()
    .or(z.literal("")), // Allow empty string to "not change"
  role: z
    .enum(["staff", "admin", "super_admin"], {
      errorMap: () => ({ message: "Role must be one of: staff, admin, super_admin" }),
    })
    .optional(),
})

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (currentUser.id === userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    await sql`DELETE FROM user_sessions WHERE user_id = ${userId}`
    await sql`DELETE FROM users WHERE id = ${userId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const body = await request.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten(),
        },
        { status: 422 },
      )
    }

    const { name, email, password, role } = parsed.data

    // Prevent changing email to one that already exists on another account
    if (email) {
      const existing = await sql`
        SELECT id FROM users WHERE email = ${email} AND id <> ${userId} LIMIT 1
      `
      if (existing.length > 0) {
        return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 })
      }
    }

    // Hash password if provided and not empty
    const hashedPassword =
      typeof password === "string" && password.trim().length > 0 ? await bcrypt.hash(password, 10) : null

    // Use COALESCE to update only provided fields
    const updated = await sql`
      UPDATE users
      SET
        name = COALESCE(${name ?? null}, name),
        email = COALESCE(${email ?? null}, email),
        role = COALESCE(${role ?? null}, role),
        password_hash = COALESCE(${hashedPassword}, password_hash),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, name, email, role, created_at, updated_at
    `

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(updated[0])
  } catch (error: unknown) {
    console.error("Error updating user:", error)

    const message = error instanceof Error ? error.message : ""
    if (message.includes("duplicate key value") || message.toLowerCase().includes("unique")) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
