"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle, Phone, CheckCircle, XCircle, Clock, Users, Loader2 } from "lucide-react"

interface InquiryStatusButtonProps {
  inquiryId: number
  currentStatus: string | null
  onStatusChange?: (newStatus: string) => void
}

const statusOptions = [
  { value: "contacted", label: "Contacted", icon: MessageCircle },
  { value: "called", label: "Called", icon: Phone },
  { value: "interested", label: "Interested", icon: CheckCircle },
  { value: "not_interested", label: "Not Interested", icon: XCircle },
  { value: "follow_up", label: "Follow Up", icon: Clock },
  { value: "no_status", label: "No Status", icon: Users },
]

export function InquiryStatusButton({
  inquiryId,
  currentStatus: initialStatus,
  onStatusChange,
}: InquiryStatusButtonProps) {
  const [status, setStatus] = useState<string | null>(initialStatus)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === status) return // No change, do nothing

    setLoading(true)
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, updated_by: "Admin" }), // You might want to get updated_by from auth context
      })

      if (!response.ok) {
        throw new Error("Failed to update inquiry status")
      }

      const data = await response.json()
      setStatus(data.status)
      onStatusChange?.(data.status) // Notify parent component of the change
      toast({
        title: "Success",
        description: `Inquiry status updated to "${newStatus.replace("_", " ")}".`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update inquiry status.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (statusValue: string | null) => {
    if (!statusValue) return "secondary"
    switch (statusValue.toLowerCase()) {
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

  const selectedStatusOption =
    statusOptions.find((option) => option.value === status) ||
    statusOptions.find((option) => option.value === "no_status")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 px-3 py-1.5 text-sm h-auto" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            selectedStatusOption && <selectedStatusOption.icon className="h-4 w-4" />
          )}
          <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
            {status ? status.replace("_", " ") : "No Status"}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusUpdate(option.value)}
            className="flex items-center gap-2"
          >
            <option.icon className="h-4 w-4" />
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
