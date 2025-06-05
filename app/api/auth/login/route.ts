import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Hardcoded users as fallback
const hardcodedUsers = [
  {
    id: 999,
    name: "Alams",
    email: "alams@gmail.com",
    password: "Alams2929$%",
    role: "super_admin",
  },
  {
    id: 998,
    name: "Delta",
    email: "ihsanmdcat@delta.edu.pk",
    password: "Ihsan@123mdcat",
    role: "staff",
  },
  {
    id: 997,
    name: "Delta",
    email: "delta@gmail.com",
    password: "staff",
    role: "staff",
  },
  {
    id: 996,
    name: "Abdul Basit",
    email: "abdulbasitmdcat@delta.edu.pk",
    password: "abdul1234",
    role: "staff",
  },
]

async function authenticateUser(email: string, password: string) {
  try {
    console.log("🔍 Authenticating user:", email)

    // First try database users
    try {
      console.log("📊 Checking database users...")
      const result = await sql`
        SELECT id, name, email, password_hash, role
        FROM users 
        WHERE email = ${email}
        LIMIT 1
      `

      if (result.length > 0) {
        const dbUser = result[0]
        console.log("👤 Found database user:", dbUser.email)

        let isValidPassword = false

        // Check if password is hashed or plain text
        if (dbUser.password_hash.startsWith("$2a$") || dbUser.password_hash.startsWith("$2b$")) {
          isValidPassword = await bcrypt.compare(password, dbUser.password_hash)
        } else {
          isValidPassword = dbUser.password_hash === password
        }

        if (isValidPassword) {
          console.log("✅ Database user authenticated")
          return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            isHardcoded: false,
          }
        } else {
          console.log("❌ Invalid password for database user")
        }
      } else {
        console.log("ℹ️ No database user found")
      }
    } catch (dbError) {
      console.error("⚠️ Database authentication error:", dbError)
      // Continue to hardcoded users if database fails
    }

    // Fallback to hardcoded users
    console.log("🔄 Checking hardcoded users...")
    const hardcodedUser = hardcodedUsers.find((user) => user.email === email && user.password === password)

    if (hardcodedUser) {
      console.log("✅ Hardcoded user authenticated")
      return {
        id: hardcodedUser.id,
        name: hardcodedUser.name,
        email: hardcodedUser.email,
        role: hardcodedUser.role,
        isHardcoded: true,
      }
    }

    console.log("❌ Authentication failed for:", email)
    return null
  } catch (error) {
    console.error("💥 Authentication error:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login API called")

    const body = await request.json()
    const { email, password } = body

    console.log("📧 Login attempt for:", email)

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Authenticate user
    console.log("🔍 Authenticating user...")
    const user = await authenticateUser(email, password)

    if (!user) {
      console.log("❌ Invalid credentials for:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.email)

    // Create session token
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Set cookies
    const cookieStore = await cookies()

    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    })

    cookieStore.set(
      "user_data",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
      },
    )

    console.log("✅ Login successful for:", user.email)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("💥 Login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
