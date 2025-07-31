"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { useToast } from "@/hooks/use-toast"

interface IntermediateInquiryFormProps {
  onSuccess: () => void
  // Removed recaptchaLoaded, recaptchaToken, setRecaptchaToken
  // Removed RECAPTCHA_SITE_KEY
  GOOGLE_ADS_ID: string
  CONVERSION_LABEL: string
  trackConversion: () => void
  toast: ReturnType<typeof useToast>["toast"]
}

export function IntermediateInquiryForm({
  onSuccess,
  // Removed recaptchaLoaded, recaptchaToken, setRecaptchaToken
  // Removed RECAPTCHA_SITE_KEY
  GOOGLE_ADS_ID,
  CONVERSION_LABEL,
  trackConversion,
  toast,
}: IntermediateInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    matricMarks: "",
    outOfMarks: "",
    intermediateStream: "",
    question: "",
    course: "Intermediate", // Fixed course for intermediate inquiries
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)

    console.log("🚀 Submitting Intermediate inquiry:", formData)

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          matricMarks: formData.matricMarks ? Number.parseInt(formData.matricMarks) : null,
          outOfMarks: formData.outOfMarks ? Number.parseInt(formData.outOfMarks) : null,
          // Removed recaptchaToken from body
        }),
      })

      console.log("📡 Response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Inquiry submitted successfully:", result)

        trackConversion()

        toast({
          title: "Success!",
          description: "Your Intermediate inquiry has been submitted successfully. We'll get back to you soon!",
        })

        setFormData({
          name: "",
          phone: "",
          gender: "",
          matricMarks: "",
          outOfMarks: "",
          intermediateStream: "",
          question: "",
          course: "Intermediate",
        })
        // Removed setRecaptchaToken(null) and grecaptcha.reset()
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
      // Removed grecaptcha.reset() and setRecaptchaToken(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Intermediate Inquiry Form</CardTitle>
        <CardDescription className="text-center">
          Please fill out this form to submit your Intermediate inquiry.
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
            <Label>Gender *</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) => handleInputChange("gender", value)}
              className="flex space-x-4"
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="gender-male" />
                <Label htmlFor="gender-male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="gender-female" />
                <Label htmlFor="gender-female">Female</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matricMarks">Matric Marks</Label>
              <Input
                id="matricMarks"
                name="matricMarks"
                type="number"
                placeholder="e.g., 900"
                value={formData.matricMarks}
                onChange={(e) => handleInputChange("matricMarks", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outOfMarks">Out of Marks</Label>
              <Input
                id="outOfMarks"
                name="outOfMarks"
                type="number"
                placeholder="e.g., 1100"
                value={formData.outOfMarks}
                onChange={(e) => handleInputChange("outOfMarks", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Intermediate Stream *</Label>
            <RadioGroup
              value={formData.intermediateStream}
              onValueChange={(value) => handleInputChange("intermediateStream", value)}
              className="grid grid-cols-2 gap-4"
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FSc Pre-Engineering" id="stream-pre-eng" />
                <Label htmlFor="stream-pre-eng">FSc Pre-Engineering</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FSc Medical" id="stream-pre-med" />
                <Label htmlFor="stream-pre-med">FSc Medical</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FA IT" id="stream-fa-it" />
                <Label htmlFor="stream-fa-it">FA IT</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ICS" id="stream-ics" />
                <Label htmlFor="stream-ics">ICS</Label>
              </div>
            </RadioGroup>
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

          {/* Removed reCAPTCHA div */}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Inquiry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
