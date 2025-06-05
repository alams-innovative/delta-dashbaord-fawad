import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Hardcoded users as fallback
const hardcodedUsers = [
  {
    id: 999, // Use high ID to avoid conflicts
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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function authenticateUser(email: string, password: string) {
  // Check hardcoded credentials first
  const hardcodedUser = hardcodedUsers.find((user) => user.email === email && user.password === password)

  if (hardcodedUser) {
    return {
      id: hardcodedUser.id,
      name: hardcodedUser.name,
      email: hardcodedUser.email,
      role: hardcodedUser.role,
      isHardcoded: true, // Flag to indicate this is a hardcoded user
    }
  }

  // Fallback to database if hardcoded doesn't match
  try {
    const user = await getUserByEmail(email)

    if (!user) {
      return null
    }

    let isValid = false

    if (user.password_hash.startsWith("$2a$") || user.password_hash.startsWith("$2b$")) {
      // Password is hashed, use bcrypt to compare
      isValid = await verifyPassword(password, user.password_hash)
    } else {
      // Password is plain text, compare directly
      isValid = user.password_hash === password
    }

    if (isValid) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isHardcoded: false,
      }
    }
  } catch (error) {
    console.error("Database authentication error:", error)
    // Continue to return null if database fails
  }

  return null
}

export async function createUserSession(userId: number, isHardcoded = false) {
  const sessionToken = generateSessionToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  // Only create database session for real database users
  if (!isHardcoded) {
    try {
      await createSession(userId, sessionToken, expiresAt)
    } catch (error) {
      console.error("Session creation error:", error)
      // Continue anyway - session will work in memory
    }
  }

  const cookieStore = await cookies()
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  })

  // For hardcoded users, store session info in cookie
  if (isHardcoded) {
    cookieStore.set(
      "user_data",
      JSON.stringify({
        id: userId,
        sessionToken,
        expiresAt: expiresAt.toISOString(),
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
      },
    )
  }

  return sessionToken
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value
    const userData = cookieStore.get("user_data")?.value

    if (!sessionToken || !userData) {
      return null
    }

    const user = JSON.parse(userData)
    return user
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("session")
    cookieStore.delete("user_data")
  } catch (error) {
    console.error("Logout error:", error)
  }
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Database user functions
export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function createSession(userId: number, sessionToken: string, expiresAt: Date) {
  try {
    await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
    `
  } catch (error) {
    console.error("Error creating session:", error)
    throw error
  }
}

export async function getSessionByToken(sessionToken: string) {
  try {
    const result = await sql`
      SELECT u.id, u.name, u.email, u.role
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ${sessionToken} AND s.expires_at > NOW()
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting session by token:", error)
    return null
  }
}

export async function deleteSession(sessionToken: string) {
  try {
    await sql`
      DELETE FROM user_sessions WHERE session_token = ${sessionToken}
    `
  } catch (error) {
    console.error("Error deleting session:", error)
    throw error
  }
}
