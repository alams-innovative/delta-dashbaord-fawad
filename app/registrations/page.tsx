"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import { WhatsAppButtons } from "@/components/whatsapp-buttons"
import { CurrencyInput } from "@/components/currency-input"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2, Search, Users, UserCheck, Plus, GraduationCap, Loader2, Download } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface Registration {
  id: number
  name: string
  fatherName: string
  cnic: string
  phone: string
  email: string
  feePaid: number
  feePending: number
  concession: number
  gender: string
  pictureUrl?: string
  comments: string
  createdAt: string
  whatsapp_welcome_sent?: boolean
  whatsapp_payment_sent?: boolean
  whatsapp_reminder_sent?: boolean
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    cnic: "",
    phone: "",
    email: "",
    feePaid: 0,
    feePending: 0,
    concession: 0,
    gender: "",
    comments: "",
  })
  const { user } = useAuth()
  const { toast } = useToast()

  // Fetch registrations from database
  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching registrations from API...")

      const response = await fetch("/api/registrations")

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Registrations fetched:", data)

        // Transform database data to match component interface
        const transformedData = (data || []).map((reg: any) => ({
          id: reg.id,
          name: reg.name,
          fatherName: reg.father_name,
          cnic: reg.cnic || "",
          phone: reg.phone,
          email: reg.email || "",
          feePaid: Number.parseFloat(reg.fee_paid || 0),
          feePending: Number.parseFloat(reg.fee_pending || 0),
          concession: Number.parseFloat(reg.concession || 0),
          gender: reg.gender || "",
          pictureUrl: reg.picture_url,
          comments: reg.comments || "",
          createdAt: reg.created_at,
          whatsapp_welcome_sent: reg.whatsapp_welcome_sent || false,
          whatsapp_payment_sent: reg.whatsapp_payment_sent || false,
          whatsapp_reminder_sent: reg.whatsapp_reminder_sent || false,
        }))

        setRegistrations(transformedData)
      } else {
        console.error("❌ Failed to fetch registrations:", response.status)
        toast({
          title: "Error",
          description: "Failed to load registrations",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("💥 Error fetching registrations:", error)
      toast({
        title: "Error",
        description: "Failed to load registrations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingId ? `/api/registrations/${editingId}` : "/api/registrations"
      const method = editingId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          father_name: formData.fatherName,
          cnic: formData.cnic,
          phone: formData.phone,
          email: formData.email,
          fee_paid: formData.feePaid,
          fee_pending: formData.feePending,
          concession: formData.concession,
          gender: formData.gender,
          comments: formData.comments,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        if (editingId) {
          toast({
            title: "Registration Updated",
            description: "Student registration has been updated successfully.",
          })
        } else {
          toast({
            title: "Registration Added",
            description: "New student registration has been added successfully.",
          })
        }

        // Refresh the list
        await fetchRegistrations()

        // Reset form
        setFormData({
          name: "",
          fatherName: "",
          cnic: "",
          phone: "",
          email: "",
          feePaid: 0,
          feePending: 0,
          concession: 0,
          gender: "",
          comments: "",
        })
        setShowAddForm(false)
        setEditingId(null)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to save registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving registration:", error)
      toast({
        title: "Error",
        description: "Failed to save registration",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (registration: Registration) => {
    setFormData({
      name: registration.name,
      fatherName: registration.fatherName,
      cnic: registration.cnic,
      phone: registration.phone,
      email: registration.email,
      feePaid: registration.feePaid,
      feePending: registration.feePending,
      concession: registration.concession,
      gender: registration.gender,
      comments: registration.comments,
    })
    setEditingId(registration.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id: number) => {
    if (user?.role !== "super_admin") {
      toast({
        title: "Access Denied",
        description: "Only super admins can delete registrations",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Registration Deleted",
          description: "The registration has been removed.",
        })
        await fetchRegistrations()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting registration:", error)
      toast({
        title: "Error",
        description: "Failed to delete registration",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPDF = async (registration: Registration) => {
    try {
      const response = await fetch(`/api/registrations/${registration.id}/pdf`)
      if (response.ok) {
        const htmlContent = await response.text()

        // Create a new window with the PDF content
        const newWindow = window.open("", "_blank")
        if (newWindow) {
          newWindow.document.write(htmlContent)
          newWindow.document.close()

          // Add print functionality
          newWindow.onload = () => {
            // Add a print button to the PDF
            const printButton = newWindow.document.createElement("button")
            printButton.innerHTML = "🖨️ Print / Save as PDF"
            printButton.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #10b981;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: bold;
              z-index: 1000;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `
            printButton.onclick = () => newWindow.print()
            newWindow.document.body.appendChild(printButton)
          }
        }

        toast({
          title: "PDF Generated",
          description: "Registration PDF opened in new window",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to generate PDF",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    }
  }

  const filteredRegistrations = (registrations || []).filter(
    (reg) =>
      reg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone?.includes(searchTerm) ||
      reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.cnic?.includes(searchTerm),
  )

  const stats = {
    total: registrations.length,
    boys: registrations.filter((r) => r.gender === "Male").length,
    girls: registrations.filter((r) => r.gender === "Female").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading registrations...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl opacity-10"></div>
          <div className="relative p-8 rounded-3xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Student Registrations
                </h1>
                <p className="text-lg text-gray-600 mt-1">Manage student registrations and payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Registrations</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Boys</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <UserCheck className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.boys}</div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Girls</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <UserCheck className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.girls}</div>
            </CardContent>
          </Card>
        </div>

        {/* Add Registration Form */}
        {showAddForm && (
          <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">
                    {editingId ? "Edit Registration" : "Add New Registration"}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {editingId ? "Update student registration details" : "Register a new student"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/50 border-gray-200 focus:border-green-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherName" className="text-gray-700 font-medium">
                      Father Name *
                    </Label>
                    <Input
                      id="fatherName"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="bg-white/50 border-gray-200 focus:border-green-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnic" className="text-gray-700 font-medium">
                      CNIC (Optional)
                    </Label>
                    <Input
                      id="cnic"
                      value={formData.cnic}
                      onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                      placeholder="42101-1234567-8"
                      className="bg-white/50 border-gray-200 focus:border-green-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white/50 border-gray-200 focus:border-green-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email (Optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white/50 border-gray-200 focus:border-green-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-gray-700 font-medium">
                      Gender
                    </Label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-md focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feePaid" className="text-gray-700 font-medium">
                      Fee Paid
                    </Label>
                    <CurrencyInput
                      id="feePaid"
                      value={formData.feePaid}
                      onChange={(value) => setFormData({ ...formData, feePaid: value })}
                      className="bg-white/50 border-gray-200 focus:border-green-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feePending" className="text-gray-700 font-medium">
                      Fee Pending
                    </Label>
                    <CurrencyInput
                      id="feePending"
                      value={formData.feePending}
                      onChange={(value) => setFormData({ ...formData, feePending: value })}
                      className="bg-white/50 border-gray-200 focus:border-green-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="concession" className="text-gray-700 font-medium">
                      Concession
                    </Label>
                    <CurrencyInput
                      id="concession"
                      value={formData.concession}
                      onChange={(value) => setFormData({ ...formData, concession: value })}
                      className="bg-white/50 border-gray-200 focus:border-green-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comments" className="text-gray-700 font-medium">
                    Comments
                  </Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    placeholder="Any additional comments..."
                    className="bg-white/50 border-gray-200 focus:border-green-400"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingId ? "Updating..." : "Adding..."}
                      </>
                    ) : editingId ? (
                      "Update Registration"
                    ) : (
                      "Add Registration"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingId(null)
                      setFormData({
                        name: "",
                        fatherName: "",
                        cnic: "",
                        phone: "",
                        email: "",
                        feePaid: 0,
                        feePending: 0,
                        concession: 0,
                        gender: "",
                        comments: "",
                      })
                    }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Registration Management */}
        <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Search className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">Registration Management</CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, CNIC, phone, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-gray-200 focus:border-green-400"
                />
              </div>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Registration</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No registrations found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Fee Paid</TableHead>
                      <TableHead className="font-semibold text-gray-700">Remaining</TableHead>
                      <TableHead className="font-semibold text-gray-700">Phone</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                      <TableHead className="font-semibold text-gray-700">WhatsApp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id} className="hover:bg-green-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-800">{registration.name}</TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center space-x-1">
                            <span className="text-green-600 font-semibold text-xs">Rs</span>
                            <span>{registration.feePaid.toLocaleString("en-PK")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center space-x-1">
                            <span className="text-orange-600 font-semibold text-xs">Rs</span>
                            <span>{registration.feePending.toLocaleString("en-PK")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{registration.phone}</TableCell>
                        <TableCell>
                          <Badge
                            variant={registration.feePending === 0 ? "default" : "secondary"}
                            className={
                              registration.feePending === 0
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-orange-100 text-orange-800 border-orange-200"
                            }
                          >
                            {registration.feePending === 0 ? "Paid" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-bold text-gray-800">
                                    Registration Details
                                  </DialogTitle>
                                  <DialogDescription className="text-gray-600">
                                    Full details of {registration.name}'s registration
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <strong className="text-gray-700">Name:</strong>
                                      <p className="text-gray-600">{registration.name}</p>
                                    </div>
                                    <div>
                                      <strong className="text-gray-700">Father Name:</strong>
                                      <p className="text-gray-600">{registration.fatherName}</p>
                                    </div>
                                    <div>
                                      <strong className="text-gray-700">CNIC:</strong>
                                      <p className="text-gray-600">{registration.cnic || "Not provided"}</p>
                                    </div>
                                    <div>
                                      <strong className="text-gray-700">Phone:</strong>
                                      <p className="text-gray-600">{registration.phone}</p>
                                    </div>
                                    <div>
                                      <strong className="text-gray-700">Email:</strong>
                                      <p className="text-gray-600">{registration.email || "Not provided"}</p>
                                    </div>
                                    <div>
                                      <strong className="text-gray-700">Gender:</strong>
                                      <p className="text-gray-600">{registration.gender}</p>
                                    </div>
                                    <div>
                                      <strong className="text-gray-700">Fee Paid:</strong>
                                      <p className="text-gray-600">Rs {registration.feePaid.toLocaleString("en-PK")}</p>
                                    </div>
                                    <div>
                                      <strong className="text-gray-700">Fee Pending:</strong>
                                      <p className="text-gray-600">
                                        Rs {registration.feePending.toLocaleString("en-PK")}
                                      </p>
                                    </div>
                                    <div>
                                      <strong className="text-gray-700">Concession:</strong>
                                      <p className="text-gray-600">
                                        Rs {registration.concession.toLocaleString("en-PK")}
                                      </p>
                                    </div>
                                    <div>
                                      <strong className="text-gray-700">Date:</strong>
                                      <p className="text-gray-600">
                                        {new Date(registration.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <strong className="text-gray-700">Comments:</strong>
                                    <p className="text-gray-600">{registration.comments || "No comments"}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(registration)}
                              className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPDF(registration)}
                              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {user?.role === "super_admin" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(registration.id)}
                                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <WhatsAppButtons
                            id={registration.id}
                            name={registration.name}
                            phone={registration.phone}
                            type="registration"
                            welcomeSent={registration.whatsapp_welcome_sent}
                            paymentSent={registration.whatsapp_payment_sent}
                            reminderSent={registration.whatsapp_reminder_sent}
                            onButtonClick={fetchRegistrations}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
