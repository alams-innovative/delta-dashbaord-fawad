"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { NotificationPopup } from "@/components/notification-popup"
import { useEffect } from "react"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  console.log("🏗️ ConditionalLayout - pathname:", pathname, "isAuthenticated:", isAuthenticated, "isLoading:", isLoading)

  // Public routes that don't need authentication
  const publicRoutes = ["/login", "/inquiry"]
  const isPublicRoute = publicRoutes.includes(pathname)

  console.log("🔍 Route check - isPublicRoute:", isPublicRoute, "pathname:", pathname)

  // Add this useEffect after the existing console.log
  useEffect(() => {
    // Only redirect if we're not loading and not authenticated and not on a public route
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      console.log("🚫 ConditionalLayout - redirecting to login")
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router])

  // Show loading spinner while auth is loading
  if (isLoading) {
    console.log("⏳ ConditionalLayout - showing loading state")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // For public routes (login, inquiry), render without sidebar
  if (isPublicRoute) {
    console.log("🌐 ConditionalLayout - rendering public route")
    return (
      <>
        {children}
        <NotificationPopup />
      </>
    )
  }

  // For protected routes, check authentication
  if (!isAuthenticated) {
    console.log("🚫 ConditionalLayout - user not authenticated, rendering children (should redirect)")
    // Don't redirect here, let the page components handle it
    return (
      <>
        {children}
        <NotificationPopup />
      </>
    )
  }

  // For authenticated users on protected routes, render with sidebar
  console.log("✅ ConditionalLayout - rendering authenticated layout with sidebar")
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <NotificationPopup />
    </SidebarProvider>
  )
}
