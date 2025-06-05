"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie } from "recharts"
import { Users, TrendingUp, MessageSquare, Sparkles, Target, Award, Clock } from "lucide-react"

const inquiryData = [
  { source: "Facebook", count: 35, fill: "#8B5CF6" },
  { source: "TikTok", count: 28, fill: "#EC4899" },
  { source: "Google", count: 22, fill: "#06B6D4" },
  { source: "Referral", count: 15, fill: "#10B981" },
]

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [registrationData, setRegistrationData] = useState([])
  const [inquiryData, setInquiryData] = useState([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalReceived: 0,
    pendingAmount: 0,
    totalInquiries: 0,
  })
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    console.log("🏠 Dashboard - checking auth state:", { isAuthenticated, user: user?.email, isLoading })

    // Only redirect if we're sure the user is not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      console.log("❌ User not authenticated, redirecting to login...")
      router.replace("/login")
      return
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch registrations for monthly chart
        const regResponse = await fetch("/api/registrations")
        if (regResponse.ok) {
          const registrations = await regResponse.json()

          // Process registrations by month
          const monthlyData = registrations.reduce((acc: any, reg: any) => {
            const month = new Date(reg.created_at).toLocaleDateString("en-US", { month: "short" })
            acc[month] = (acc[month] || 0) + 1
            return acc
          }, {})

          const chartData = Object.entries(monthlyData).map(([month, count]) => ({
            month,
            registrations: count,
          }))
          setRegistrationData(chartData)

          // Calculate stats from registrations
          const totalReceived = registrations.reduce((sum: number, reg: any) => {
            const feePaid = Number(reg.fee_paid) || 0
            return sum + feePaid
          }, 0)

          const pendingAmount = registrations.reduce((sum: number, reg: any) => {
            const feePending = Number(reg.fee_pending) || 0
            return sum + feePending
          }, 0)

          setStats((prev) => ({
            ...prev,
            totalStudents: registrations.length,
            totalReceived,
            pendingAmount,
          }))
        }

        // Fetch inquiries for pie chart
        const inqResponse = await fetch("/api/inquiries")
        if (inqResponse.ok) {
          const inquiries = await inqResponse.json()

          // Process inquiries by source
          const sourceData = inquiries.reduce((acc: any, inq: any) => {
            const source = inq.heard_from || "Other"
            acc[source] = (acc[source] || 0) + 1
            return acc
          }, {})

          const colors = ["#8B5CF6", "#EC4899", "#06B6D4", "#10B981", "#F59E0B"]
          const pieData = Object.entries(sourceData).map(([source, count], index) => ({
            source,
            count,
            fill: colors[index % colors.length],
          }))
          setInquiryData(pieData)

          setStats((prev) => ({
            ...prev,
            totalInquiries: inquiries.length,
          }))
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setDataLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  // Show loading while auth is being determined
  if (isLoading) {
    console.log("⏳ Dashboard - showing loading state")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show redirecting message while redirecting
  if (!isAuthenticated) {
    console.log("🔄 Dashboard - showing redirect message")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (dataLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  console.log("✅ Dashboard - rendering dashboard for user:", user?.name)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10"></div>
          <div className="relative p-8 rounded-3xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Welcome back, {user?.name || "User"}!
                </h1>
                <p className="text-lg text-gray-600 mt-1">Here's what's happening with your institution today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Students</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalStudents.toLocaleString()}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 opacity-80" />
                <p className="text-sm opacity-80">+12% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Amount Received</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-sm font-bold">Rs</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                Rs {stats.totalReceived > 0 ? stats.totalReceived.toLocaleString() : "0"}
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <Award className="h-4 w-4 opacity-80" />
                <p className="text-sm opacity-80">+8% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Pending Amount</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                Rs {stats.pendingAmount > 0 ? stats.pendingAmount.toLocaleString() : "0"}
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <Target className="h-4 w-4 opacity-80" />
                <p className="text-sm opacity-80">-3% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Inquiries</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalInquiries}</div>
              <div className="flex items-center space-x-1 mt-2">
                <Sparkles className="h-4 w-4 opacity-80" />
                <p className="text-sm opacity-80">+24% from last month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">Monthly Registrations</CardTitle>
                  <CardDescription className="text-gray-600">
                    Student registrations over the last 6 months
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  registrations: {
                    label: "Registrations",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={registrationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="registrations" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">Inquiry Sources</CardTitle>
                  <CardDescription className="text-gray-600">Where students heard about us</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Count",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inquiryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="count"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Powered by <span className="font-semibold text-gray-700">Alams Innovate</span>
          </p>
        </div>
      </div>
    </div>
  )
}
