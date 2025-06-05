"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Users,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  TrendingUp,
  Eye,
  Target,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InquiryStatusStats {
  status: string
  count: number
  percentage: number
}

interface InquiryWithStatus {
  id: number
  name: string
  phone: string
  email: string
  created_at: string
  current_status: string | null
  last_updated: string | null
  updated_by: string | null
}

export default function ReportsPage() {
  const [statusStats, setStatusStats] = useState<InquiryStatusStats[]>([])
  const [inquiriesWithStatus, setInquiriesWithStatus] = useState<InquiryWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [animateCards, setAnimateCards] = useState(false)
  const { toast } = useToast()

  const fetchReportData = async () => {
    try {
      setRefreshing(true)

      // Fetch inquiry status statistics
      const statsResponse = await fetch("/api/reports/inquiry-status")
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        setStatusStats(stats)
      }

      // Fetch inquiries with their current status
      const inquiriesResponse = await fetch("/api/reports/inquiries-with-status")
      if (inquiriesResponse.ok) {
        const inquiries = await inquiriesResponse.json()
        setInquiriesWithStatus(inquiries)
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
      // Trigger animation after data loads
      setTimeout(() => setAnimateCards(true), 100)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [])

  const getStatusIcon = (status: string | null | undefined) => {
    if (!status) return <Users className="h-5 w-5" />

    switch (status.toLowerCase()) {
      case "contacted":
        return <MessageCircle className="h-5 w-5" />
      case "called":
        return <Phone className="h-5 w-5" />
      case "interested":
        return <CheckCircle className="h-5 w-5" />
      case "not_interested":
        return <XCircle className="h-5 w-5" />
      case "follow_up":
        return <Clock className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getStatusGradient = (status: string | null | undefined) => {
    if (!status) return "from-gray-400 to-gray-600"

    switch (status.toLowerCase()) {
      case "contacted":
        return "from-blue-400 to-blue-600"
      case "called":
        return "from-green-400 to-green-600"
      case "interested":
        return "from-emerald-400 to-emerald-600"
      case "not_interested":
        return "from-red-400 to-red-600"
      case "follow_up":
        return "from-yellow-400 to-yellow-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const getStatusBadgeVariant = (status: string | null | undefined) => {
    if (!status) return "secondary"

    switch (status.toLowerCase()) {
      case "contacted":
        return "default"
      case "called":
        return "secondary"
      case "interested":
        return "default"
      case "not_interested":
        return "destructive"
      case "follow_up":
        return "outline"
      default:
        return "secondary"
    }
  }

  const totalInquiries = statusStats.reduce((sum, stat) => sum + stat.count, 0)
  const conversionRate =
    totalInquiries > 0 ? ((statusStats.find((s) => s.status === "interested")?.count || 0) / totalInquiries) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div
              className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Loading Analytics...</p>
          <p className="text-sm text-gray-500 mt-2">Preparing your insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+CjwvZz4KPC9nPgo8L3N2Zz4=')] opacity-20" />

        <div className="relative px-4 py-16 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <BarChart3 className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Analytics Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Inquiry Reports
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Transform your data into actionable insights with beautiful visualizations
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-2xl md:text-3xl font-bold">{totalInquiries}</div>
                <div className="text-sm text-blue-100">Total Inquiries</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-2xl md:text-3xl font-bold">
                  {statusStats.find((s) => s.status === "contacted")?.count || 0}
                </div>
                <div className="text-sm text-blue-100">Contacted</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-2xl md:text-3xl font-bold">
                  {statusStats.find((s) => s.status === "interested")?.count || 0}
                </div>
                <div className="text-sm text-blue-100">Interested</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-2xl md:text-3xl font-bold">{conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-blue-100">Conversion</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-8 px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Action Buttons */}
          <div className="flex justify-end mb-6 space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReportData}
              disabled={refreshing}
              className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="detailed"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Target className="h-4 w-4 mr-2" />
                Detailed View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Enhanced Summary Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: "Total Inquiries",
                    value: totalInquiries,
                    icon: Users,
                    gradient: "from-blue-500 to-blue-600",
                    change: "+12%",
                  },
                  {
                    title: "Contacted",
                    value: statusStats.find((s) => s.status === "contacted")?.count || 0,
                    icon: MessageCircle,
                    gradient: "from-green-500 to-green-600",
                    change: "+8%",
                  },
                  {
                    title: "Called",
                    value: statusStats.find((s) => s.status === "called")?.count || 0,
                    icon: Phone,
                    gradient: "from-purple-500 to-purple-600",
                    change: "+15%",
                  },
                  {
                    title: "Interested",
                    value: statusStats.find((s) => s.status === "interested")?.count || 0,
                    icon: CheckCircle,
                    gradient: "from-emerald-500 to-emerald-600",
                    change: "+23%",
                  },
                ].map((stat, index) => (
                  <Card
                    key={stat.title}
                    className={`relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
                      animateCards ? "animate-in slide-in-from-bottom-4" : "opacity-0"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`}></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="flex items-center text-xs">
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-green-600 font-medium">{stat.change}</span>
                        <span className="text-gray-500 ml-1">from last month</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Enhanced Status Distribution */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 mr-3">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    Status Distribution
                  </CardTitle>
                  <CardDescription className="text-base">
                    Real-time breakdown of inquiry statuses with visual indicators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {statusStats.map((stat, index) => (
                    <div
                      key={stat.status}
                      className={`group hover:bg-gray-50/50 p-4 rounded-xl transition-all duration-300 ${
                        animateCards ? "animate-in slide-in-from-left-4" : "opacity-0"
                      }`}
                      style={{ animationDelay: `${(index + 4) * 150}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${getStatusGradient(stat.status)} shadow-lg`}
                          >
                            {getStatusIcon(stat.status)}
                            <div className="absolute inset-0 bg-white/20 rounded-lg"></div>
                          </div>
                          <div>
                            <span className="text-lg font-semibold capitalize text-gray-800">
                              {stat.status.replace("_", " ")}
                            </span>
                            <div className="text-sm text-gray-500">{stat.count} inquiries</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{stat.percentage.toFixed(1)}%</div>
                          <div className="text-sm text-gray-500">of total</div>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getStatusGradient(stat.status)} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                            style={{
                              width: animateCards ? `${stat.percentage}%` : "0%",
                              transitionDelay: `${(index + 4) * 200}ms`,
                            }}
                          >
                            <div className="h-full bg-white/30 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="absolute right-0 top-0 transform -translate-y-8">
                          <div
                            className={`px-2 py-1 rounded-md text-xs font-medium text-white bg-gradient-to-r ${getStatusGradient(stat.status)} shadow-lg`}
                          >
                            {stat.count}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 mr-3">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    Detailed Inquiry Analysis
                  </CardTitle>
                  <CardDescription className="text-base">
                    Individual inquiry tracking with status history and timeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inquiriesWithStatus.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-12 w-12 text-gray-400" />
                        </div>
                        <p className="text-xl font-medium text-gray-600 mb-2">No Data Available</p>
                        <p className="text-gray-500">Start tracking inquiries to see detailed analytics here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inquiriesWithStatus.map((inquiry, index) => (
                          <div
                            key={inquiry.id}
                            className={`group relative p-6 border border-gray-200/50 rounded-xl hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50 hover:from-blue-50/30 hover:to-indigo-50/30 ${
                              animateCards ? "animate-in slide-in-from-right-4" : "opacity-0"
                            }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {inquiry.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-lg font-semibold text-gray-900">{inquiry.name}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <span className="flex items-center">
                                        <Phone className="h-4 w-4 mr-1" />
                                        {inquiry.phone}
                                      </span>
                                      <span className="flex items-center">
                                        <MessageCircle className="h-4 w-4 mr-1" />
                                        {inquiry.email}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <Badge
                                    variant={getStatusBadgeVariant(inquiry.current_status)}
                                    className="text-sm px-3 py-1 shadow-sm"
                                  >
                                    <div className="flex items-center space-x-1">
                                      {getStatusIcon(inquiry.current_status)}
                                      <span>
                                        {inquiry.current_status
                                          ? inquiry.current_status.replace("_", " ")
                                          : "No Status"}
                                      </span>
                                    </div>
                                  </Badge>
                                  {inquiry.last_updated && (
                                    <p className="text-xs text-gray-500 mt-2">
                                      Updated: {new Date(inquiry.last_updated).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <div className="w-1 h-12 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
