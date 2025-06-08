"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Users,
  MessageSquare,
  Building2,
  Facebook,
  Music,
  Search,
  TrendingUp,
  UserCheck,
  LogOut,
  Home,
  Sparkles,
  Crown,
  Settings,
  BarChart3,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    roles: ["staff", "super_admin"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Inquiries",
    url: "/inquiries",
    icon: MessageSquare,
    roles: ["staff", "super_admin"],
    showBadge: true,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Registrations",
    url: "/registrations",
    icon: Users,
    roles: ["staff", "super_admin"],
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Agency Panel",
    url: "/agency",
    icon: Building2,
    roles: ["super_admin"],
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Meta Ads",
    url: "/meta-ads",
    icon: Facebook,
    roles: ["super_admin"],
    gradient: "from-blue-600 to-blue-800",
  },
  {
    title: "TikTok Ads",
    url: "/tiktok-ads",
    icon: Music,
    roles: ["super_admin"],
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Google Ads",
    url: "/google-ads",
    icon: Search,
    roles: ["super_admin"],
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "Analysis",
    url: "/analysis",
    icon: TrendingUp,
    roles: ["super_admin"],
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Influencers",
    url: "/influencers",
    icon: UserCheck,
    roles: ["super_admin"],
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    roles: ["staff", "super_admin"],
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["super_admin"],
    gradient: "from-gray-500 to-slate-500",
  },
]

export function AppSidebar() {
  const { user, logout, unreadCount } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  const filteredItems = menuItems.filter((item) => user && item.roles.includes(user.role))

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(url)
  }

  return (
    <Sidebar className="border-r-0 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white">
      <SidebarHeader className="border-b border-white/10 bg-slate-900/50">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white drop-shadow-sm">Alams Innovate</h2>
              <p className="text-xs text-purple-200 font-medium">Education Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <Avatar className="h-10 w-10 ring-2 ring-white/20">
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate drop-shadow-sm">{user?.name}</p>
              <div className="flex items-center space-x-1">
                {user?.role === "super_admin" && <Crown className="h-3 w-3 text-yellow-400" />}
                <p className="text-xs text-purple-200 capitalize font-medium">{user?.role.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-purple-200 font-bold mb-4 text-sm uppercase tracking-wider px-2 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {filteredItems.map((item) => {
                const active = isActive(item.url)
                const hovered = hoveredItem === item.title

                return (
                  <SidebarMenuItem
                    key={item.title}
                    onMouseEnter={() => setHoveredItem(item.title)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ease-out border text-white relative overflow-hidden ${
                          active
                            ? `bg-gradient-to-r ${item.gradient} border-white/30 shadow-md`
                            : `bg-transparent border-transparent ${hovered ? "border-white/20 shadow-md" : ""}`
                        }`}
                      >
                        {/* Expanding background - controlled by JS state */}
                        {!active && (
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${item.gradient} transition-all duration-300 ease-out rounded-xl transform origin-left ${
                              hovered ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                            }`}
                          />
                        )}

                        {/* Icon container */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md relative z-10 ${
                            active
                              ? `bg-white/10 ring-1 ring-white/50` // Active icon: no scale, subtle ring
                              : `bg-gradient-to-r ${item.gradient} ${hovered ? "scale-105" : ""}` // Non-active icon: scales on hover
                          }`}
                        >
                          <item.icon className="h-4 w-4 text-white" />
                        </div>

                        {/* Text */}
                        <span className="text-white font-semibold text-sm tracking-wide relative z-10">
                          {item.title}
                        </span>

                        {/* Active indicator */}
                        {active && <div className="absolute right-3 w-2 h-2 bg-white rounded-full" />}
                      </Link>
                    </SidebarMenuButton>
                    {item.showBadge && unreadCount > 0 && (
                      <SidebarMenuBadge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg animate-pulse font-bold">
                        {unreadCount}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10 bg-slate-900/50">
        <Button
          variant="outline"
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:text-white font-semibold shadow-lg mb-3"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
        <div className="text-center">
          <p className="text-purple-200 text-xs">
            Powered by <span className="font-semibold text-white">Alams Innovate</span>
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
