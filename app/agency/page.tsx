"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, TrendingUp, Building2, Plus, Calendar, DollarSign, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

const mockPayouts = [
  {
    id: 1,
    amount: 5000,
    date: "2024-01-15",
    description: "Monthly commission payout",
  },
  {
    id: 2,
    amount: 3500,
    date: "2024-01-10",
    description: "Bonus payout",
  },
]

export default function AgencyPage() {
  const [payouts, setPayouts] = useState([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAmount: 0,
    commission30: 0,
    paidOut: 0,
  })
  const [loading, setLoading] = useState(true)
  const [payoutAmount, setPayoutAmount] = useState("")
  const [description, setDescription] = useState("")
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch agency stats
      const statsResponse = await fetch("/api/agencies?type=stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch payouts
      const payoutsResponse = await fetch("/api/agency-payouts")
      if (payoutsResponse.ok) {
        const payoutsData = await payoutsResponse.json()
        setPayouts(payoutsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payoutAmount || isNaN(Number(payoutAmount))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      })
      return
    }

    const amount = Number(payoutAmount)
    const remainingCommission = stats.commission30 - stats.paidOut

    if (amount > remainingCommission) {
      toast({
        title: "Amount Too High",
        description: "Payout amount cannot exceed remaining commission.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/agency-payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description: description || "Commission payout",
        }),
      })

      if (response.ok) {
        toast({
          title: "Payout Added",
          description: `Rs ${amount} has been recorded as paid to agency.`,
        })

        setPayoutAmount("")
        setDescription("")
        await fetchData() // Refresh data
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to add payout",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding payout:", error)
      toast({
        title: "Error",
        description: "Failed to add payout",
        variant: "destructive",
      })
    }
  }

  if (user?.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 flex items-center justify-center">
        <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading agency data...</span>
        </div>
      </div>
    )
  }

  const remainingCommission = stats.commission30 - stats.paidOut

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl opacity-10"></div>
          <div className="relative p-8 rounded-3xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Agency Panel
                </h1>
                <p className="text-lg text-gray-600 mt-1">Manage agency commissions and payouts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Students via Agency</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalStudents}</div>
              <p className="text-sm opacity-80 mt-1">Registered through agencies</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Registration Amount</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Rs {stats.totalAmount.toLocaleString()}</div>
              <p className="text-sm opacity-80 mt-1">Paid + Pending - Concessions</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">30% Commission Pool</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Rs {remainingCommission.toLocaleString()}</div>
              <p className="text-sm opacity-80 mt-1">
                Remaining: Rs {remainingCommission.toLocaleString()} | Paid: Rs {stats.paidOut.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Payout Form */}
        <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">Record Agency Payout</CardTitle>
                <CardDescription className="text-gray-600">
                  Enter the amount paid to agencies. This will be subtracted from the 30% commission pool.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPayout} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-700 font-medium">
                    Payout Amount *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-white/50 border-gray-200 focus:border-orange-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700 font-medium">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    className="bg-white/50 border-gray-200 focus:border-orange-400"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                Record Payout
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">Payout History</CardTitle>
                <CardDescription className="text-gray-600">Record of all agency payouts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id} className="hover:bg-orange-50/50 transition-colors">
                      <TableCell className="text-gray-600">
                        {new Date(payout.payout_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">
                        <div className="flex items-center space-x-1">
                          <span className="text-green-600 font-semibold text-xs">Rs</span>
                          <span>{Number(payout.amount).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{payout.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
