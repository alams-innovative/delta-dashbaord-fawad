import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { z } from "zod"

const sql = neon(process.env.DATABASE_URL!)

// Validation schema for creating a user
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
  role: z.enum(["staff", "admin", "super_admin"], {
    errorMap: () => ({ message: "Role must be one of: staff, admin, super_admin" }),
  }),
})

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await sql`
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createUserSchema.safeParse(body)
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

    // Check for duplicate email first (clearer 409 than relying on DB error)
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `
    if (existing.length > 0) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await sql`
      INSERT INTO users (name, email, password_hash, role, updated_at)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}, NOW())
      RETURNING id, name, email, role, created_at, updated_at
    `

    if (!newUser || newUser.length === 0) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    return NextResponse.json(newUser[0], { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating user:", error)

    // Handle Postgres unique constraint error gracefully
    const message = error instanceof Error ? error.message : ""
    if (message.includes("duplicate key value") || message.toLowerCase().includes("unique")) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
