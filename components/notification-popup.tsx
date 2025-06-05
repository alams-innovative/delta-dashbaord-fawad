"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, X, Sparkles, Eye } from "lucide-react"

export function NotificationPopup() {
  const authContext = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [lastNotificationCount, setLastNotificationCount] = useState(0)

  // Safely get notifications with fallback
  const notifications = authContext?.notifications || []
  const clearNotifications = authContext?.clearNotifications || (() => {})
  const unreadCount = authContext?.unreadCount || 0

  // Show popup when new notifications arrive
  useEffect(() => {
    if (notifications && notifications.length > lastNotificationCount && notifications.length > 0) {
      setShowNotifications(true)
      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        setShowNotifications(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
    setLastNotificationCount(notifications ? notifications.length : 0)
  }, [notifications?.length, lastNotificationCount])

  const handleDismiss = () => {
    setShowNotifications(false)
    if (clearNotifications) {
      clearNotifications()
    }
  }

  // Don't render if no auth context or no notifications
  if (!authContext || !notifications || !showNotifications || notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm">
      <Card className="border-0 shadow-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover-lift">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white icon-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-lg flex items-center space-x-2">
                  <span>New Notifications</span>
                  <Sparkles className="h-4 w-4" />
                </h4>
                <div className="space-y-2 mt-3">
                  {notifications.slice(0, 3).map((notification, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full pulse-slow"></div>
                      <p className="text-sm text-white/90">{notification}</p>
                    </div>
                  ))}
                  {notifications.length > 3 && (
                    <p className="text-sm text-white/70 italic">+{notifications.length - 3} more notifications</p>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 hover:bg-white/20 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 flex space-x-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowNotifications(false)
                window.location.href = "/inquiries"
              }}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/40 flex items-center space-x-2"
            >
              <Eye className="h-3 w-3" />
              <span>View All</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-white/80 hover:bg-white/20">
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
