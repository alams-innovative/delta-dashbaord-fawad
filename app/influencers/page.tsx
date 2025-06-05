"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, Edit, Trash2, Plus, UserCheck, Users, DollarSign, Star, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface Influencer {
  id: number
  name: string
  facebook_url?: string
  instagram_url?: string
  tiktok_url?: string
  youtube_url?: string
  price: number
  comments?: string
  created_at: string
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    price: 0,
    comments: "",
  })
  const { user } = useAuth()
  const { toast } = useToast()

  // Fetch influencers from database
  useEffect(() => {
    fetchInfluencers()
  }, [])

  const fetchInfluencers = async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching influencers from API...")

      const response = await fetch("/api/influencers")

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Influencers fetched:", data)
        setInfluencers(data || [])
      } else {
        console.error("❌ Failed to fetch influencers:", response.status)
        toast({
          title: "Error",
          description: "Failed to load influencers",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("💥 Error fetching influencers:", error)
      toast({
        title: "Error",
        description: "Failed to load influencers",
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
      const url = editingId ? `/api/influencers/${editingId}` : "/api/influencers"
      const method = editingId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()

        if (editingId) {
          toast({
            title: "Influencer Updated",
            description: "Influencer details have been updated successfully.",
          })
        } else {
          toast({
            title: "Influencer Added",
            description: "New influencer has been added successfully.",
          })
        }

        // Refresh the list
        await fetchInfluencers()

        // Reset form
        setFormData({
          name: "",
          facebookUrl: "",
          instagramUrl: "",
          tiktokUrl: "",
          youtubeUrl: "",
          price: 0,
          comments: "",
        })
        setShowAddForm(false)
        setEditingId(null)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to save influencer",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving influencer:", error)
      toast({
        title: "Error",
        description: "Failed to save influencer",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (influencer: Influencer) => {
    setFormData({
      name: influencer.name,
      facebookUrl: influencer.facebook_url || "",
      instagramUrl: influencer.instagram_url || "",
      tiktokUrl: influencer.tiktok_url || "",
      youtubeUrl: influencer.youtube_url || "",
      price: influencer.price,
      comments: influencer.comments || "",
    })
    setEditingId(influencer.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/influencers/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Influencer Deleted",
          description: "The influencer has been removed.",
        })
        await fetchInfluencers()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete influencer",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting influencer:", error)
      toast({
        title: "Error",
        description: "Failed to delete influencer",
        variant: "destructive",
      })
    }
  }

  if (user?.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-white" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading influencers...</span>
        </div>
      </div>
    )
  }

  const totalInfluencers = influencers.length
  const totalValue = influencers.reduce((sum, inf) => sum + inf.price, 0)
  const averagePrice = totalInfluencers > 0 ? totalValue / totalInfluencers : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl opacity-10"></div>
          <div className="relative p-8 rounded-3xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Influencer Management
                </h1>
                <p className="text-lg text-gray-600 mt-1">Manage influencer partnerships and collaborations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Influencers</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalInfluencers}</div>
              <p className="text-sm opacity-80 mt-1">Active partnerships</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Value</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Rs {totalValue.toLocaleString()}</div>
              <p className="text-sm opacity-80 mt-1">Combined partnership value</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Average Price</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Star className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Rs {Math.round(averagePrice).toLocaleString()}</div>
              <p className="text-sm opacity-80 mt-1">Per influencer partnership</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Influencer Form */}
        {showAddForm && (
          <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">
                    {editingId ? "Edit Influencer" : "Add New Influencer"}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {editingId ? "Update influencer details" : "Add a new influencer to your network"}
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
                      className="bg-white/50 border-gray-200 focus:border-teal-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-gray-700 font-medium">
                      Agreed Price *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="bg-white/50 border-gray-200 focus:border-teal-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebookUrl" className="text-gray-700 font-medium">
                      Facebook URL
                    </Label>
                    <Input
                      id="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                      placeholder="https://facebook.com/username"
                      className="bg-white/50 border-gray-200 focus:border-teal-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagramUrl" className="text-gray-700 font-medium">
                      Instagram URL
                    </Label>
                    <Input
                      id="instagramUrl"
                      value={formData.instagramUrl}
                      onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/username"
                      className="bg-white/50 border-gray-200 focus:border-teal-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktokUrl" className="text-gray-700 font-medium">
                      TikTok URL
                    </Label>
                    <Input
                      id="tiktokUrl"
                      value={formData.tiktokUrl}
                      onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                      placeholder="https://tiktok.com/@username"
                      className="bg-white/50 border-gray-200 focus:border-teal-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtubeUrl" className="text-gray-700 font-medium">
                      YouTube URL
                    </Label>
                    <Input
                      id="youtubeUrl"
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      placeholder="https://youtube.com/username"
                      className="bg-white/50 border-gray-200 focus:border-teal-400"
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
                    placeholder="Additional notes about this influencer..."
                    className="bg-white/50 border-gray-200 focus:border-teal-400"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingId ? "Updating..." : "Adding..."}
                      </>
                    ) : editingId ? (
                      "Update Influencer"
                    ) : (
                      "Add Influencer"
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
                        facebookUrl: "",
                        instagramUrl: "",
                        tiktokUrl: "",
                        youtubeUrl: "",
                        price: 0,
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

        {/* Influencers List */}
        <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">Influencer Network</CardTitle>
            </div>
            <div className="flex justify-between items-center">
              <CardDescription className="text-gray-600">Manage your influencer partnerships</CardDescription>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Influencer</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {influencers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No influencers found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Price</TableHead>
                      <TableHead className="font-semibold text-gray-700">Platforms</TableHead>
                      <TableHead className="font-semibold text-gray-700">Date Added</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {influencers.map((influencer) => (
                      <TableRow key={influencer.id} className="hover:bg-teal-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-800">{influencer.name}</TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center space-x-1">
                            <span className="text-green-600 font-semibold text-xs">Rs</span>
                            <span>{influencer.price.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {influencer.facebook_url && (
                              <a href={influencer.facebook_url} target="_blank" rel="noopener noreferrer">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                >
                                  FB
                                </Button>
                              </a>
                            )}
                            {influencer.instagram_url && (
                              <a href={influencer.instagram_url} target="_blank" rel="noopener noreferrer">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
                                >
                                  IG
                                </Button>
                              </a>
                            )}
                            {influencer.tiktok_url && (
                              <a href={influencer.tiktok_url} target="_blank" rel="noopener noreferrer">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                                >
                                  TT
                                </Button>
                              </a>
                            )}
                            {influencer.youtube_url && (
                              <a href={influencer.youtube_url} target="_blank" rel="noopener noreferrer">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                >
                                  YT
                                </Button>
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(influencer.created_at).toLocaleDateString()}
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
                                    Influencer Details
                                  </DialogTitle>
                                  <DialogDescription className="text-gray-600">
                                    Full details of {influencer.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <strong className="text-gray-700">Name:</strong>
                                    <p className="text-gray-600">{influencer.name}</p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-700">Agreed Price:</strong>
                                    <p className="text-gray-600">Rs {influencer.price.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-700">Facebook:</strong>
                                    <p className="text-gray-600">{influencer.facebook_url || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-700">Instagram:</strong>
                                    <p className="text-gray-600">{influencer.instagram_url || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-700">TikTok:</strong>
                                    <p className="text-gray-600">{influencer.tiktok_url || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-700">YouTube:</strong>
                                    <p className="text-gray-600">{influencer.youtube_url || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-700">Comments:</strong>
                                    <p className="text-gray-600">{influencer.comments || "No comments"}</p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-700">Date Added:</strong>
                                    <p className="text-gray-600">
                                      {new Date(influencer.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(influencer)}
                              className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(influencer.id)}
                              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
