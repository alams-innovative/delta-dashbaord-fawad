"use client"

import type React from "react"
import { createContext, useState, useEffect, type ReactNode, useContext } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Inquiry {
  id: number
  name: string
  fatherName: string
  phone: string
  email: string
  heardFrom: string
  question: string
  isRead: boolean
  createdAt: string
}

interface AuthContextProps {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  notifications: string[]
  clearNotifications: () => void
  unreadCount: number
  inquiries: Inquiry[]
  markInquiryAsRead: (id: number) => Promise<void>
  refreshInquiries: () => Promise<void>
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: async () => false,
  logout: async () => {},
  isLoading: true,
  isAuthenticated: false,
  notifications: [],
  clearNotifications: () => {},
  unreadCount: 0,
  inquiries: [],
  markInquiryAsRead: async () => {},
  refreshInquiries: async () => {},
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<string[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUserFromLocalStorage = () => {
      console.log("📱 Loading user from localStorage...")
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log("✅ Found stored user:", parsedUser)
          setUser(parsedUser)
        } else {
          console.log("ℹ️ No stored user found")
        }
      } catch (error) {
        console.error("❌ Error parsing user from localStorage:", error)
        localStorage.removeItem("user")
      } finally {
        setIsLoading(false)
      }
    }

    // Add a small delay to prevent flash
    setTimeout(loadUserFromLocalStorage, 100)
  }, [])

  // Save user to localStorage when user changes
  useEffect(() => {
    if (user) {
      console.log("💾 Saving user to localStorage:", user)
      localStorage.setItem("user", JSON.stringify(user))
      // Load inquiries when user logs in
      refreshInquiries()
    } else {
      console.log("🗑️ Removing user from localStorage")
      localStorage.removeItem("user")
      setInquiries([]) // Clear inquiries when user logs out
    }
  }, [user])

  const refreshInquiries = async () => {
    if (!user) return

    try {
      console.log("🔄 Fetching inquiries from API...")
      const response = await fetch("/api/inquiries")

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Inquiries fetched:", data)
        setInquiries(data || [])
      } else {
        console.error("❌ Failed to fetch inquiries:", response.status)
        setInquiries([])
      }
    } catch (error) {
      console.error("💥 Error fetching inquiries:", error)
      setInquiries([])
    }
  }

  const markInquiryAsRead = async (id: number) => {
    try {
      console.log("📖 Marking inquiry as read:", id)
      const response = await fetch(`/api/inquiries/${id}/read`, {
        method: "PATCH",
      })

      if (response.ok) {
        console.log("✅ Inquiry marked as read")
        // Update local state
        setInquiries((prev) => prev.map((inquiry) => (inquiry.id === id ? { ...inquiry, isRead: true } : inquiry)))
      } else {
        console.error("❌ Failed to mark inquiry as read")
      }
    } catch (error) {
      console.error("💥 Error marking inquiry as read:", error)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 Attempting login with:", { email })

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("📡 Login response status:", response.status)

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Response is not JSON:", contentType)
        const text = await response.text()
        console.error("Response text:", text)
        return false
      }

      const result = await response.json()
      console.log("📋 Login result:", result)

      if (!response.ok) {
        console.error("❌ Login failed:", result)
        return false
      }

      if (result.success && result.user) {
        const userData = {
          id: result.user.id.toString(),
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        }
        console.log("👤 Setting user data:", userData)
        setUser(userData)
        console.log("✅ Login successful, returning true")
        return true
      }

      console.error("❌ Login failed: No user data in response")
      return false
    } catch (error) {
      console.error("💥 Login error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      console.log("🚪 Logging out...")
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const isAuthenticated = !!user
  console.log("🔍 Auth state:", {
    user: user?.email,
    isAuthenticated,
    isLoading,
    inquiriesCount: inquiries.length,
  })

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated,
        notifications: notifications || [],
        clearNotifications,
        unreadCount: (notifications || []).length,
        inquiries: inquiries || [],
        markInquiryAsRead,
        refreshInquiries,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
