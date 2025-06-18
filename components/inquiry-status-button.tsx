"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { XCircle, Calendar, Users, Trophy, Phone, ArrowRight } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface StatusHistory {
  id: number
  status: string
  comments: string | null
  created_at: string
  updated_by: string
}

interface InquiryStatusButtonProps {
  inquiryId: number
  currentStatus?: string
  onStatusUpdate?: () => void
}

const statusOptions = [
  { value: "inquiry_valid", label: "Inquiry is Valid" },
  { value: "inquiry_called", label: "Inquiry has been Called" },
  { value: "student_seeking_info", label: "Student Seeking Information" },
  { value: "interested_not_decided", label: "Interested to Join - Not Decided" },
  { value: "not_interested", label: "Not Interested" },
  { value: "scheduled_free_session", label: "Scheduled for Free Session" },
  { value: "attended_free_session", label: "Attended Free Session" },
  { value: "converted_enrolled", label: "Converted - Enrolled" },
  { value: "wants_to_speak", label: "Wants to Speak with Someone" },
  { value: "unreachable", label: "Unreachable" },
]

const notInterestedReasonOptions = [
  "Declined Clearly",
  "Already Joined",
  "Course Mismatch",
  "No Reason",
  "Re-check Later",
  "Already Enrolled in STEP/KIPS or others",
  "Prefers Local Institute",
  "Fee Higher than Competitors",
  "No Installment Option",
  "Requested Discount Unavailable",
  "Campus Too Far",
  "Timing Not Flexible",
  "Course Not Needed Now",
  "Prefers Physical Classes",
  "Preparing with Tutor at Home",
  "Confused Between Option",
  "Friends Joining Elsewhere",
  "Trusts Other Brand More",
  "Waiting for Results",
  "Joining Later Session",
]

export function InquiryStatusButton({ inquiryId, currentStatus, onStatusUpdate }: InquiryStatusButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [comments, setComments] = useState("")
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [latestStatus, setLatestStatus] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const [notInterestedReasons, setNotInterestedReasons] = useState<string[]>([])
  const [showNotInterestedReasons, setShowNotInterestedReasons] = useState(false)
  const [showNotInterestedScreen, setShowNotInterestedScreen] = useState(false)

  const fetchStatusHistory = async () => {
    try {
      setLoading(true)
      setFetchError(null)
      console.log(`Fetching status history for inquiry ${inquiryId}`)

      const response = await fetch(`/api/inquiries/${inquiryId}/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Status history data:", data)

        if (Array.isArray(data)) {
          setStatusHistory(data)
          // Update the latest status from the history
          if (data.length > 0) {
            const latest = data[0] // Assuming data is sorted by created_at DESC
            setLatestStatus(latest.status)
            console.log("Latest status from history:", latest.status)
          } else {
            setLatestStatus(null)
          }
        } else {
          console.warn("Received non-array data:", data)
          setStatusHistory([])
          setLatestStatus(null)
        }
      } else {
        console.error("Failed to fetch status history:", response.status, response.statusText)
        setStatusHistory([])
        setLatestStatus(null)
        setFetchError(`Failed to load status history (${response.status})`)
      }
    } catch (error) {
      console.error("Error fetching status history:", error)
      setStatusHistory([])
      setLatestStatus(null)
      setFetchError("Network error while loading status history")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchStatusHistory()
    }
  }, [open, inquiryId])

  // Also fetch status when component mounts to show current status
  useEffect(() => {
    fetchStatusHistory()
  }, [inquiryId])

  const handleReasonToggle = (reason: string) => {
    setNotInterestedReasons((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]))
  }

  useEffect(() => {
    if (selectedStatus === "not_interested") {
      const reasonText = `Not Interested\nReason:\n${notInterestedReasons.map((r) => `• ${r}`).join("\n")}`
      setComments(reasonText)
    }
  }, [notInterestedReasons, selectedStatus])

  const handleSubmit = async () => {
    if (!selectedStatus || !user) {
      toast({
        title: "Error",
        description: "Please select a status before submitting.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      console.log("Submitting status update:", {
        inquiryId,
        status: selectedStatus,
        comments: comments.trim() || null,
        updated_by: user.name,
      })

      const response = await fetch(`/api/inquiries/${inquiryId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
          comments: comments.trim() || null,
          updated_by: user.name,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Status update successful:", result)

        // Update the latest status immediately
        setLatestStatus(selectedStatus)

        toast({
          title: "Status Updated",
          description: "Inquiry status has been updated successfully.",
        })
        setSelectedStatus("")
        setComments("")
        setNotInterestedReasons([])
        setShowNotInterestedScreen(false)

        // Wait a moment before refreshing to ensure database is updated
        setTimeout(async () => {
          await fetchStatusHistory()
          onStatusUpdate?.()
        }, 500)

        setOpen(false) // Close the dialog
      } else {
        const errorData = await response.json()
        console.error("Status update failed:", errorData)
        throw new Error(errorData.error || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update inquiry status.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find((opt) => opt.value === status)
    return option ? option.label : status
  }

  const getCurrentStatusInfo = () => {
    // Use latestStatus from database first, then fallback to currentStatus prop
    const statusToUse = latestStatus || currentStatus
    const status = statusOptions.find((s) => s.value === statusToUse)
    return status || { value: "no_status", label: "No Status" }
  }

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case "converted_enrolled":
        return "bg-green-500"
      case "not_interested":
        return "bg-red-500"
      case "scheduled_free_session":
      case "attended_free_session":
        return "bg-blue-500"
      case "inquiry_valid":
      case "inquiry_called":
        return "bg-yellow-500"
      case "student_seeking_info":
      case "interested_not_decided":
        return "bg-orange-500"
      case "wants_to_speak":
        return "bg-purple-500"
      case "unreachable":
        return "bg-gray-500"
      default:
        return "bg-blue-500"
    }
  }

  const statusInfo = getCurrentStatusInfo()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-xs font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 cursor-pointer"
          onClick={() => {
            console.log("Button clicked, opening dialog")
            setOpen(true)
          }}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(statusInfo.value)}`} />
            <span className="text-xs">{statusInfo.label}</span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-[98vw] h-[95vh] p-4 overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-center">Update Inquiry Status</DialogTitle>
        </DialogHeader>

        {showNotInterestedScreen ? (
          <div className="flex flex-col h-full">
            {/* Top Section: Status and Comments */}
            <div className="flex gap-4 mb-4 flex-shrink-0">
              {/* Status Section - Left Side */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-center mb-3 text-gray-800">Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-center bg-red-500 text-white font-semibold py-2 rounded-md">
                    Not Interested
                  </div>
                </div>
              </div>

              {/* Comments Section - Right Side */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-center mb-3 text-gray-800">Comments</h3>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full h-32 p-3 border-2 border-gray-300 rounded-xl resize-none text-sm"
                  placeholder="Add your comments here..."
                />

                {/* Submit Button */}
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedStatus || submitting}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 transition-all text-sm"
                  >
                    {submitting ? "SUBMITTING..." : "SUBMIT"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Section: Not Interested Reasons */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-center mb-3 text-gray-800">Reasons for Not Interested</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {notInterestedReasonOptions.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => handleReasonToggle(reason)}
                    className={`py-1.5 px-2 rounded-full border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-all text-xs ${
                      notInterestedReasons.includes(reason) ? "ring-2 ring-blue-500 ring-offset-1" : ""
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Section: History Table */}
            <div className="flex-1 min-h-0">
              <h3 className="text-lg font-semibold text-center mb-2 text-gray-800">History</h3>
              <div className="border-2 border-gray-400 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-2 py-1 text-left font-semibold text-xs w-1/4">Time Stamp</th>
                      <th className="px-2 py-1 text-left font-semibold text-xs w-1/4">Status</th>
                      <th className="px-2 py-1 text-left font-semibold text-xs w-1/4">Admin</th>
                      <th className="px-2 py-1 text-left font-semibold text-xs w-1/4">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            <span className="ml-2 text-xs">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : fetchError ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-red-500 text-xs">
                          {fetchError}
                        </td>
                      </tr>
                    ) : statusHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-gray-500 text-xs">
                          No status history found for this inquiry.
                        </td>
                      </tr>
                    ) : (
                      statusHistory.map((entry, index) => (
                        <tr
                          key={entry.id}
                          className={index % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"}
                        >
                          <td className="px-2 py-1 text-gray-700 border-b border-gray-200 text-xs">
                            {formatDate(entry.created_at)}
                          </td>
                          <td className="px-2 py-1 text-gray-700 border-b border-gray-200 text-xs">
                            {getStatusLabel(entry.status)}
                          </td>
                          <td className="px-2 py-1 text-gray-700 border-b border-gray-200 text-xs">
                            {entry.updated_by}
                          </td>
                          <td className="px-2 py-1 text-gray-700 border-b border-gray-200 text-xs">
                            {entry.comments || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-start mt-3">
              <button
                onClick={() => {
                  setShowNotInterestedScreen(false)
                  setSelectedStatus("")
                  setComments("")
                  setNotInterestedReasons([])
                }}
                className="bg-gray-500 hover:bg-gray-800 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 transition-all text-sm"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Top Section: Status and Comments */}
            <div className="flex gap-4 mb-4 flex-shrink-0">
              {/* Status Section - Left Side */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-center mb-3 text-gray-800">Status</h3>
                <div className="space-y-2">
                  {/* Row 1 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedStatus("inquiry_valid")}
                      className={`flex-1 py-1.5 px-2 rounded-full border-2 border-gray-300 bg-gray-50 hover:bg-green-100 text-gray-700 font-medium transition-all text-xs ${
                        selectedStatus === "inquiry_valid" ? "ring-2 ring-red-500 ring-offset-1" : ""
                      }`}
                    >
                      Inquiry is Valid
                    </button>
                    <button
                      onClick={() => setSelectedStatus("inquiry_called")}
                      className={`flex-1 py-1.5 px-2 rounded-full border-2 border-gray-300 bg-gray-50 hover:bg-green-100 text-gray-700 font-medium transition-all text-xs ${
                        selectedStatus === "inquiry_called" ? "ring-2 ring-red-500 ring-offset-1" : ""
                      }`}
                    >
                      Inquiry has been Called
                    </button>
                  </div>

                  {/* Row 2 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedStatus("student_seeking_info")}
                      className={`flex-1 py-1.5 px-2 rounded-full border-2 border-gray-300 bg-gray-50 hover:bg-green-100 text-gray-700 font-medium transition-all text-xs ${
                        selectedStatus === "student_seeking_info" ? "ring-2 ring-red-500 ring-offset-1" : ""
                      }`}
                    >
                      Student Seeking Information
                    </button>
                    <button
                      onClick={() => setSelectedStatus("interested_not_decided")}
                      className={`flex-1 py-1.5 px-2 rounded-full border-2 border-gray-300 bg-gray-50 hover:bg-green-100 text-gray-700 font-medium transition-all text-xs ${
                        selectedStatus === "interested_not_decided" ? "ring-2 ring-red-500 ring-offset-1" : ""
                      }`}
                    >
                      Interested to Join - Not Decided
                    </button>
                  </div>

                  {/* Row 3 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedStatus("not_interested")
                        setShowNotInterestedScreen(true)
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-full border-2 border-gray-300 bg-gray-50 hover:bg-green-100 text-gray-700 font-medium transition-all text-xs ${
                        selectedStatus === "not_interested" ? "ring-2 ring-red-500 ring-offset-1" : ""
                      }`}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Interested
                    </button>

                    <button
                      onClick={() => setSelectedStatus("scheduled_free_session")}
                      className={`flex-1 py-1.5 px-2 rounded-full border-2 border-gray-300 bg-gray-50 hover:bg-green-100 text-gray-700 font-medium transition-all text-xs ${
                        selectedStatus === "scheduled_free_session" ? "ring-2 ring-red-500 ring-offset-1" : ""
                      }`}
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Scheduled for Free Session
                    </button>
                  </div>

                  {/* Row 4 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedStatus("attended_free_session")}
                      className={`flex-1 py-1.5 px-2 rounded-full border-2 border-gray-300 bg-gray-50 hover:bg-green-100 text-gray-700 font-medium transition-all text-xs ${
                        selectedStatus === "attended_free_session" ? "ring-2 ring-red-500 ring-offset-1" : ""
                      }`}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      Attended Free Session
                    </button>
                    <button
                      onClick={() => setSelectedStatus("converted_enrolled")}
                      className={`flex-1 py-1.5 px-2 rounded-full border-2 border-gray-300 bg-gray-50 hover:bg-green-100 text-gray-700 font-medium transition-all text-xs ${
                        selectedStatus === "converted_enrolled" ? "ring-2 ring-red-500 ring-offset-1" : ""
                      }`}
                    >
                      <Trophy className="w-3 h-3 mr-1" />
                      Converted - Enrolled
                    </button>
                  </div>

                  {/* Row 5 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedStatus("wants_to_speak")}
                      className={`flex-1 py-1.5 px-2 rounded-full border-2 border-gray-300 bg-gray-50 hover:bg-green-100 text-gray-700 font-medium transition-all text-xs ${
                        selectedStatus === "wants_to_speak" ? "ring-2 ring-red-500 ring-offset-1" : ""
                      }`}
                    >
                      Wants to Speak with Someone
                    </button>
                    <button
                      onClick={() => setSelectedStatus("unreachable")}
                      className={`flex-1 py-1.5 px-2 rounded-full border-2 border-gray-300 bg-gray-50 hover:bg-green-100 text-gray-700 font-medium transition-all text-xs ${
                        selectedStatus === "unreachable" ? "ring-2 ring-red-500 ring-offset-1" : ""
                      }`}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Unreachable
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments Section - Right Side */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-center mb-3 text-gray-800">Comments</h3>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full h-32 p-3 border-2 border-gray-300 rounded-xl resize-none text-sm"
                  placeholder="Add your comments here..."
                />

                {/* Submit Button */}
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedStatus || submitting}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 transition-all text-sm"
                  >
                    {submitting ? "SUBMITTING..." : "SUBMIT"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section: History Table */}
            <div className="flex-1 min-h-0">
              <h3 className="text-lg font-semibold text-center mb-2 text-gray-800">History</h3>
              <div className="border-2 border-gray-400 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-2 py-1 text-left font-semibold text-xs w-1/4">Time Stamp</th>
                      <th className="px-2 py-1 text-left font-semibold text-xs w-1/4">Status</th>
                      <th className="px-2 py-1 text-left font-semibold text-xs w-1/4">Admin</th>
                      <th className="px-2 py-1 text-left font-semibold text-xs w-1/4">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            <span className="ml-2 text-xs">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : fetchError ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-red-500 text-xs">
                          {fetchError}
                        </td>
                      </tr>
                    ) : statusHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-gray-500 text-xs">
                          No status history found for this inquiry.
                        </td>
                      </tr>
                    ) : (
                      statusHistory.map((entry, index) => (
                        <tr
                          key={entry.id}
                          className={index % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"}
                        >
                          <td className="px-2 py-1 text-gray-700 border-b border-gray-200 text-xs">
                            {formatDate(entry.created_at)}
                          </td>
                          <td className="px-2 py-1 text-gray-700 border-b border-gray-200 text-xs">
                            {getStatusLabel(entry.status)}
                          </td>
                          <td className="px-2 py-1 text-gray-700 border-b border-gray-200 text-xs">
                            {entry.updated_by}
                          </td>
                          <td className="px-2 py-1 text-gray-700 border-b border-gray-200 text-xs">
                            {entry.comments || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
