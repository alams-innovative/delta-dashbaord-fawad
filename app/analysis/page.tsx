"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, DollarSign, Target, BarChart3, Activity, Zap, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useState, useEffect } from "react"

export default function AnalysisPage() {
  const { user } = useAuth()
  const [adSpendData, setAdSpendData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      // Fetch platform summary
      const platformResponse = await fetch("/api/analytics?type=platform-summary")
      if (platformResponse.ok) {
        const platformData = await platformResponse.json()
        setAdSpendData(platformData)
      }

      // Fetch monthly trends
      const monthlyResponse = await fetch("/api/analytics?type=monthly-trends")
      if (monthlyResponse.ok) {
        const monthlyTrends = await monthlyResponse.json()
        setMonthlyData(monthlyTrends)
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  if (user?.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
              <p className="text-gray-600">This page is only accessible to Super Admins.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading analytics data...</span>
        </div>
      </div>
    )
  }

  const totalSpent = adSpendData.reduce((sum, item) => sum + item.spent, 0)
  const totalLeads = adSpendData.reduce((sum, item) => sum + item.leads, 0)
  const agencyCommission = totalSpent * 0.3

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl opacity-10"></div>
          <div className="relative p-8 rounded-3xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Advertising Analysis
                </h1>
                <p className="text-lg text-gray-600 mt-1">Combined analysis of all advertising platforms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Ad Spend</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Rs {totalSpent.toLocaleString()}</div>
              <p className="text-sm opacity-80 mt-1">Across all platforms</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Leads</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Target className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalLeads}</div>
              <p className="text-sm opacity-80 mt-1">Generated leads</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Cost Per Lead</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Rs {(totalSpent / totalLeads).toFixed(0)}</div>
              <p className="text-sm opacity-80 mt-1">Average across platforms</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">30% Agency Value</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Rs {agencyCommission.toLocaleString()}</div>
              <p className="text-sm opacity-80 mt-1">Commission calculation</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">Platform Performance</CardTitle>
                  <CardDescription className="text-gray-600">Ad spend and leads by platform</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  spent: {
                    label: "Spent",
                    color: "hsl(var(--chart-1))",
                  },
                  leads: {
                    label: "Leads",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adSpendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="platform" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="spent" fill="url(#spentGradient)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="leads" fill="url(#leadsGradient)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#A855F7" />
                      </linearGradient>
                      <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">Ad Spend Distribution</CardTitle>
                  <CardDescription className="text-gray-600">Budget allocation across platforms</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  spent: {
                    label: "Spent",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={adSpendData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="spent"
                    >
                      {adSpendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">Monthly Ad Spend Trends</CardTitle>
                <CardDescription className="text-gray-600">
                  Track spending patterns across all platforms
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                meta: {
                  label: "Meta",
                  color: "hsl(var(--chart-1))",
                },
                tiktok: {
                  label: "TikTok",
                  color: "hsl(var(--chart-2))",
                },
                google: {
                  label: "Google",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="meta" stackId="a" fill="#8B5CF6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="tiktok" stackId="a" fill="#EC4899" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="google" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Platform Comparison Table */}
        <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">Platform Comparison</CardTitle>
                <CardDescription className="text-gray-600">Detailed performance metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">Platform</th>
                    <th className="text-right p-4 font-semibold text-gray-700">Total Spent</th>
                    <th className="text-right p-4 font-semibold text-gray-700">Leads Generated</th>
                    <th className="text-right p-4 font-semibold text-gray-700">Cost Per Lead</th>
                    <th className="text-right p-4 font-semibold text-gray-700">30% Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {adSpendData.map((platform, index) => (
                    <tr
                      key={platform.platform}
                      className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-800">{platform.platform}</td>
                      <td className="p-4 text-right text-gray-600">
                        <div className="flex items-center justify-end space-x-1">
                          <span className="text-green-600 font-semibold text-xs">Rs</span>
                          <span>{platform.spent.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right text-gray-600">{platform.leads}</td>
                      <td className="p-4 text-right text-gray-600">
                        <div className="flex items-center justify-end space-x-1">
                          <span className="text-orange-600 font-semibold text-xs">Rs</span>
                          <span>{(platform.spent / platform.leads).toFixed(0)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right text-gray-600">
                        <div className="flex items-center justify-end space-x-1">
                          <span className="text-purple-600 font-semibold text-xs">Rs</span>
                          <span>{(platform.spent * 0.3).toLocaleString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b border-gray-200 font-bold bg-gray-50">
                    <td className="p-4 text-gray-800">Total</td>
                    <td className="p-4 text-right text-gray-800">
                      <div className="flex items-center justify-end space-x-1">
                        <span className="text-green-600 font-semibold text-xs">Rs</span>
                        <span>{totalSpent.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-gray-800">{totalLeads}</td>
                    <td className="p-4 text-right text-gray-800">
                      <div className="flex items-center justify-end space-x-1">
                        <span className="text-orange-600 font-semibold text-xs">Rs</span>
                        <span>{(totalSpent / totalLeads).toFixed(0)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-gray-800">
                      <div className="flex items-center justify-end space-x-1">
                        <span className="text-purple-600 font-semibold text-xs">Rs</span>
                        <span>{agencyCommission.toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
