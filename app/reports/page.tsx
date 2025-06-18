"use client"

import { useState, useEffect, useMemo } from "react"
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
  Download,
  RefreshCw,
  TrendingUp,
  Eye,
  Target,
  Calendar,
  Trophy,
  Activity,
  Flame,
  Snowflake,
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

interface TopUpdater {
  updated_by: string
  update_count: number
}

interface StatusUpdateCount {
  status: string
  update_count: number
}

interface WhatsappSentCount {
  message_type: string
  sent_count: number
}

interface BurnUnburnStats {
  totalInquiries: number
  totalBurns: number
  totalUnburns: number
  maxPossibleBurns: number
  burnPercentage: number
  unburnPercentage: number
}

export default function ReportsPage() {
  const [statusStats, setStatusStats] = useState<InquiryStatusStats[]>([])
  const [inquiriesWithStatus, setInquiriesWithStatus] = useState<InquiryWithStatus[]>([])
  const [totalButtonBurns, setTotalButtonBurns] = useState(0)
  const [topUsersByBurns, setTopUsersByBurns] = useState<TopUpdater[]>([])
  const [statusUpdateCounts, setStatusUpdateCounts] = useState<StatusUpdateCount[]>([])
  const [burnUnburnStats, setBurnUnburnStats] = useState<BurnUnburnStats>({
    totalInquiries: 0,
    totalBurns: 0,
    totalUnburns: 0,
    maxPossibleBurns: 0,
    burnPercentage: 0,
    unburnPercentage: 0,
  })
  const [whatsappSentCounts, setWhatsappSentCounts] = useState<{
    inquirySentCounts: WhatsappSentCount[]
    registrationSentCounts: WhatsappSentCount[]
  }>({ inquirySentCounts: [], registrationSentCounts: [] })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [animateCards, setAnimateCards] = useState(false)
  const { toast } = useToast()

  const fetchReportData = async () => {
    try {
      setRefreshing(true)

      // Fetch inquiry status statistics (current counts)
      const statsResponse = await fetch("/api/reports/inquiry-status", { cache: "no-store" })
      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStatusStats(data.statusDistribution)
      } else {
        console.error("Failed to fetch status statistics:", statsResponse.status, statsResponse.statusText)
        toast({
          title: "Error",
          description: `Failed to load status statistics: ${statsResponse.statusText}`,
          variant: "destructive",
        })
      }

      // Fetch inquiries with their current status
      const inquiriesResponse = await fetch("/api/reports/inquiries-with-status", { cache: "no-store" })
      if (inquiriesResponse.ok) {
        const inquiries = await inquiriesResponse.json()
        setInquiriesWithStatus(inquiries)
      } else {
        console.error("Failed to fetch inquiries with status:", inquiriesResponse.status, inquiriesResponse.statusText)
        toast({
          title: "Error",
          description: `Failed to load detailed inquiries: ${inquiriesResponse.statusText}`,
          variant: "destructive",
        })
      }

      // Fetch inquiry button stats (total burns, top users, status-specific burns, and burn/unburn stats)
      const buttonStatsResponse = await fetch("/api/reports/inquiry-button-stats", { cache: "no-store" })
      if (buttonStatsResponse.ok) {
        const data = await buttonStatsResponse.json()
        setTotalButtonBurns(data.totalUpdates)
        setTopUsersByBurns(data.topUpdaters)
        setStatusUpdateCounts(data.statusUpdateCounts)
        setBurnUnburnStats(data.burnUnburnStats) // Set burn/unburn stats
      } else {
        console.error("Failed to fetch button stats:", buttonStatsResponse.status, buttonStatsResponse.statusText)
        toast({
          title: "Error",
          description: `Failed to load button usage stats: ${buttonStatsResponse.statusText}`,
          variant: "destructive",
        })
      }

      // Fetch WhatsApp sent counts
      const whatsappSentResponse = await fetch("/api/reports/whatsapp-sent-counts", { cache: "no-store" })
      if (whatsappSentResponse.ok) {
        const data = await whatsappSentResponse.json()
        setWhatsappSentCounts(data)
      } else {
        console.error(
          "Failed to fetch WhatsApp sent counts:",
          whatsappSentResponse.status,
          whatsappSentResponse.statusText,
        )
        toast({
          title: "Error",
          description: `Failed to load WhatsApp sent counts: ${whatsappSentResponse.statusText}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
      toast({
        title: "Error",
        description: "Failed to load report data due to a network error.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
      setTimeout(() => setAnimateCards(true), 100)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [])

  const getCountForStatuses = (statuses: string[]) => {
    return statusStats.filter((stat) => statuses.includes(stat.status)).reduce((sum, stat) => sum + stat.count, 0)
  }

  const totalInquiries = useMemo(() => statusStats.reduce((sum, stat) => sum + stat.count, 0), [statusStats])
  const notInterestedCount = useMemo(() => getCountForStatuses(["not_interested"]), [statusStats])
  const calledCount = useMemo(() => getCountForStatuses(["inquiry_called"]), [statusStats])
  const convertedCount = useMemo(() => getCountForStatuses(["converted_enrolled"]), [statusStats])

  const combinedStatusData = useMemo(() => {
    const combinedMap = new Map<string, { current_count: number; update_count: number }>()

    statusStats.forEach((stat) => {
      combinedMap.set(stat.status, { current_count: stat.count, update_count: 0 })
    })

    statusUpdateCounts.forEach((updateStat) => {
      const existing = combinedMap.get(updateStat.status)
      if (existing) {
        existing.update_count = updateStat.update_count
      } else {
        combinedMap.set(updateStat.status, { current_count: 0, update_count: updateStat.update_count })
      }
    })

    return Array.from(combinedMap.entries())
      .map(([status, data]) => ({
        status,
        current_count: data.current_count,
        update_count: data.update_count,
      }))
      .sort((a, b) => b.update_count - a.update_count)
  }, [statusStats, statusUpdateCounts])

  const getStatusIcon = (status: string | null | undefined) => {
    if (!status) return <Users className="h-5 w-5" />

    switch (status.toLowerCase()) {
      case "inquiry_valid":
      case "student_seeking_info":
      case "wants_to_speak":
        return <MessageCircle className="h-5 w-5" />
      case "inquiry_called":
        return <Phone className="h-5 w-5" />
      case "interested_not_decided":
        return <CheckCircle className="h-5 w-5" />
      case "not_interested":
        return <XCircle className="h-5 w-5" />
      case "scheduled_free_session":
      case "attended_free_session":
        return <Calendar className="h-5 w-5" />
      case "converted_enrolled":
        return <Trophy className="h-5 w-5" />
      case "unreachable":
        return <Phone className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getStatusGradient = (status: string | null | undefined) => {
    if (!status) return "from-gray-400 to-gray-600"

    switch (status.toLowerCase()) {
      case "inquiry_valid":
      case "student_seeking_info":
      case "wants_to_speak":
        return "from-blue-400 to-blue-600"
      case "inquiry_called":
        return "from-green-400 to-green-600"
      case "interested_not_decided":
        return "from-emerald-400 to-emerald-600"
      case "not_interested":
        return "from-red-400 to-red-600"
      case "scheduled_free_session":
      case "attended_free_session":
        return "from-yellow-400 to-yellow-600"
      case "converted_enrolled":
        return "from-teal-500 to-green-500"
      case "unreachable":
        return "from-gray-500 to-gray-700"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const getStatusBadgeVariant = (status: string | null | undefined) => {
    if (!status) return "secondary"

    switch (status.toLowerCase()) {
      case "inquiry_valid":
      case "student_seeking_info":
      case "wants_to_speak":
        return "default"
      case "inquiry_called":
        return "secondary"
      case "interested_not_decided":
        return "default"
      case "not_interested":
        return "destructive"
      case "scheduled_free_session":
      case "attended_free_session":
        return "outline"
      case "converted_enrolled":
        return "default"
      case "unreachable":
        return "secondary"
      default:
        return "secondary"
    }
  }

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
                <div className="text-2xl md:text-3xl font-bold">{notInterestedCount}</div>
                <div className="text-sm text-blue-100">Not Interested</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-2xl md:text-3xl font-bold">{calledCount}</div>
                <div className="text-sm text-blue-100">Called</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-2xl md:text-3xl font-bold">{convertedCount}</div>
                <div className="text-sm text-blue-100">Converted</div>
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
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-md">
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
              <TabsTrigger
                value="button-usage"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Activity className="h-4 w-4 mr-2" />
                Button Usage
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
                  },
                  {
                    title: "Not Interested",
                    value: notInterestedCount,
                    icon: XCircle,
                    gradient: "from-red-500 to-red-600",
                  },
                  {
                    title: "Called",
                    value: calledCount,
                    icon: Phone,
                    gradient: "from-purple-500 to-purple-600",
                  },
                  {
                    title: "Converted",
                    value: convertedCount,
                    icon: Trophy,
                    gradient: "from-emerald-500 to-emerald-600",
                  },
                ].map((stat, index) => (
                  <Card
                    key={stat.title}
                    className={`relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
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
                        <span className="text-green-600 font-medium">Live Data</span>
                        <span className="text-gray-500 ml-1">from database</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Enhanced Status Distribution */}
              <Card className="bg-white border-0 shadow-xl">
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
                      className={`group hover:bg-gray-100 p-4 rounded-xl transition-all duration-300 ${
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
                          </div>
                          <div>
                            <span className="text-lg font-semibold capitalize text-gray-800">
                              {stat.status.replace(/_/g, " ")}
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
              <Card className="bg-white border-0 shadow-xl">
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
                            className={`group relative p-6 border border-gray-200/50 rounded-xl hover:shadow-lg transition-all duration-300 bg-white hover:bg-gray-50 ${
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
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                      {inquiry.name}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                      <span className="flex items-center">
                                        <Phone className="h-4 w-4 mr-1" />
                                        {inquiry.phone}
                                      </span>
                                      {inquiry.email && (
                                        <span className="flex items-center">
                                          <MessageCircle className="h-4 w-4 mr-1" />
                                          {inquiry.email}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="text-sm text-gray-500 mb-1">Current Status</div>
                                  <Badge
                                    variant={getStatusBadgeVariant(inquiry.current_status)}
                                    className="text-xs font-medium px-3 py-1"
                                  >
                                    {inquiry.current_status
                                      ? inquiry.current_status.replace(/_/g, " ").toUpperCase()
                                      : "NO STATUS"}
                                  </Badge>
                                </div>

                                <div className="text-right">
                                  <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                                  <div className="text-sm font-medium text-gray-700">
                                    {inquiry.last_updated
                                      ? new Date(inquiry.last_updated).toLocaleDateString()
                                      : "Never"}
                                  </div>
                                  {inquiry.updated_by && (
                                    <div className="text-xs text-gray-500">by {inquiry.updated_by}</div>
                                  )}
                                </div>

                                <div className="text-right">
                                  <div className="text-sm text-gray-500 mb-1">Created</div>
                                  <div className="text-sm font-medium text-gray-700">
                                    {new Date(inquiry.created_at).toLocaleDateString()}
                                  </div>
                                </div>
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

            <TabsContent value="button-usage" className="space-y-6">
              {/* Burn/Unburn Statistics Card */}
              <Card className="bg-white border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 mr-3">
                      <Flame className="h-6 w-6 text-white" />
                    </div>
                    Burn/Unburn Statistics
                  </CardTitle>
                  <CardDescription className="text-base">
                    Track status update usage with burn/unburn analysis (Max: Total Inquiries × 3)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Flame className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-orange-600 mb-2">{burnUnburnStats.totalBurns}</div>
                      <div className="text-sm font-medium text-orange-700">Total Burns</div>
                      <div className="text-xs text-orange-600 mt-1">
                        {burnUnburnStats.burnPercentage.toFixed(1)}% used
                      </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Snowflake className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-2">{burnUnburnStats.totalUnburns}</div>
                      <div className="text-sm font-medium text-blue-700">Total Unburns</div>
                      <div className="text-xs text-blue-600 mt-1">
                        {burnUnburnStats.unburnPercentage.toFixed(1)}% remaining
                      </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-purple-600 mb-2">{burnUnburnStats.maxPossibleBurns}</div>
                      <div className="text-sm font-medium text-purple-700">Max Possible</div>
                      <div className="text-xs text-purple-600 mt-1">Inquiries × 3</div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-green-600 mb-2">{burnUnburnStats.totalInquiries}</div>
                      <div className="text-sm font-medium text-green-700">Total Inquiries</div>
                      <div className="text-xs text-green-600 mt-1">Base count</div>
                    </div>
                  </div>

                  {/* Progress Bar for Burn/Unburn Ratio */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Burn/Unburn Ratio</span>
                      <span className="text-sm text-gray-500">
                        {burnUnburnStats.totalBurns} / {burnUnburnStats.maxPossibleBurns}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="h-full flex">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-1000 ease-out"
                          style={{
                            width: `${burnUnburnStats.burnPercentage}%`,
                          }}
                        ></div>
                        <div
                          className="bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-1000 ease-out"
                          style={{
                            width: `${burnUnburnStats.unburnPercentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Burns ({burnUnburnStats.burnPercentage.toFixed(1)}%)</span>
                      <span>Unburns ({burnUnburnStats.unburnPercentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Button Usage Statistics */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Top Users by Burns */}
                <Card className="bg-white border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 mr-3">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      Top Users by Burns
                    </CardTitle>
                    <CardDescription>Users with the most status updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topUsersByBurns.length === 0 ? (
                        <div className="text-center py-8">
                          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No user activity yet</p>
                        </div>
                      ) : (
                        topUsersByBurns.map((user, index) => (
                          <div
                            key={user.updated_by}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-green-50 hover:to-emerald-50 transition-all duration-300"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                  index === 0
                                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                    : index === 1
                                      ? "bg-gradient-to-br from-gray-400 to-gray-600"
                                      : index === 2
                                        ? "bg-gradient-to-br from-orange-400 to-orange-600"
                                        : "bg-gradient-to-br from-blue-400 to-blue-600"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <span className="font-medium text-gray-800">{user.updated_by}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {user.update_count} burns
                              </Badge>
                              <Flame className="h-4 w-4 text-orange-500" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Status Update Distribution */}
                <Card className="bg-white border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 mr-3">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      Status Update Distribution
                    </CardTitle>
                    <CardDescription>Breakdown of status changes by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {combinedStatusData.length === 0 ? (
                        <div className="text-center py-8">
                          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No status updates yet</p>
                        </div>
                      ) : (
                        combinedStatusData.map((item, index) => (
                          <div
                            key={item.status}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-purple-50 hover:to-indigo-50 transition-all duration-300"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${getStatusGradient(item.status)}`}>
                                {getStatusIcon(item.status)}
                              </div>
                              <div>
                                <span className="font-medium text-gray-800 capitalize">
                                  {item.status.replace(/_/g, " ")}
                                </span>
                                <div className="text-sm text-gray-500">
                                  {item.current_count} current • {item.update_count} total updates
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {item.update_count} burns
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* WhatsApp Message Statistics */}
              <Card className="bg-white border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 mr-3">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    WhatsApp Message Statistics
                  </CardTitle>
                  <CardDescription>Track WhatsApp messages sent to inquiries and registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Inquiry WhatsApp Messages */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Inquiry Messages
                      </h4>
                      <div className="space-y-3">
                        {whatsappSentCounts.inquirySentCounts.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No inquiry messages sent yet</p>
                          </div>
                        ) : (
                          whatsappSentCounts.inquirySentCounts.map((item) => (
                            <div
                              key={item.message_type}
                              className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                            >
                              <span className="font-medium text-green-800 capitalize">
                                {item.message_type.replace(/_/g, " ")}
                              </span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {item.sent_count} sent
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Registration WhatsApp Messages */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Registration Messages
                      </h4>
                      <div className="space-y-3">
                        {whatsappSentCounts.registrationSentCounts.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No registration messages sent yet</p>
                          </div>
                        ) : (
                          whatsappSentCounts.registrationSentCounts.map((item) => (
                            <div
                              key={item.message_type}
                              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                            >
                              <span className="font-medium text-blue-800 capitalize">
                                {item.message_type.replace(/_/g, " ")}
                              </span>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {item.sent_count} sent
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
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
