"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { useToast } from "@/hooks/use-toast"

interface MDCATInquiryFormProps {
  onSuccess: () => void
  GOOGLE_ADS_ID: string
  CONVERSION_LABEL: string
  trackConversion: () => void
  toast: ReturnType<typeof useToast>["toast"]
}

export function MDCATInquiryForm({
  onSuccess,
  GOOGLE_ADS_ID,
  CONVERSION_LABEL,
  trackConversion,
  toast,
}: MDCATInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    heardFrom: "",
    question: "",
    checkboxField: false,
    course: "MDCAT",
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)

    console.log("🚀 Submitting MDCAT inquiry:", formData)

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
        }),
      })

      console.log("📡 Response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Inquiry submitted successfully:", result)

        trackConversion()

        toast({
          title: "Success!",
          description: "Your MDCAT inquiry has been submitted successfully. We'll get back to you soon!",
        })

        setFormData({
          name: "",
          phone: "",
          email: "",
          heardFrom: "",
          question: "",
          checkboxField: false,
          course: "MDCAT",
        })
        onSuccess()
      } else {
        const errorData = await response.json()
        console.error("❌ Submission failed:", errorData)
        throw new Error(errorData.error || "Failed to submit inquiry")
      }
    } catch (error) {
      console.error("💥 Submission error:", error)
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">MDCAT Inquiry Form</CardTitle>
        <CardDescription className="text-center">
          Please fill out this form to submit your MDCAT inquiry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Student Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="03XX-XXXXXXX"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heardFrom">How did you hear about us?</Label>
            <Select
              name="heardFrom"
              value={formData.heardFrom}
              onValueChange={(value) => handleInputChange("heardFrom", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="google">Google Search</SelectItem>
                <SelectItem value="friend">Friend/Family</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Your Question/Message</Label>
            <Textarea
              id="question"
              name="question"
              placeholder="Please describe your inquiry, questions about courses, fees, or any other information you need..."
              className="min-h-[120px]"
              value={formData.question}
              onChange={(e) => handleInputChange("question", e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="checkboxField"
              checked={formData.checkboxField}
              onCheckedChange={(checked) => handleInputChange("checkboxField", checked === true)}
            />
            <Label
              htmlFor="checkboxField"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Interested to Visit Delta on 9th June for 2nd Free to attend MDCAT 2025 Session
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Inquiry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
