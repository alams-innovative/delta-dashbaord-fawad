"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" // Import RadioGroup
import { useToast } from "@/hooks/use-toast"
import Script from "next/script"

declare global {
  interface Window {
    grecaptcha: any
    onRecaptchaChange: (token: string) => void
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export default function InquiryPage() {
  const [selectedForm, setSelectedForm] = useState<"none" | "mdcat" | "intermediate">("none")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    heardFrom: "",
    question: "",
    checkboxField: false,
    course: "", // Initialize as empty, will be set by form type
    gender: "", // New field
    matricMarks: "", // New field
    outOfMarks: "", // New field
  })
  const { toast } = useToast()

  // Your reCAPTCHA site key (this is meant to be public)
  const RECAPTCHA_SITE_KEY = "6LfhCFErAAAAAA4npK1JUOAus_k07d6rXy0Q9PlD"

  // Google Ads conversion tracking constants
  const GOOGLE_ADS_ID = "AW-17131753970"
  const CONVERSION_LABEL = "qXJICKfewNAaEPKjh-k_"

  useEffect(() => {
    // Set up the global callback function
    window.onRecaptchaChange = (token: string) => {
      console.log("✅ reCAPTCHA completed:", token ? "Token received" : "No token")
      setRecaptchaToken(token)
    }

    // Load reCAPTCHA script
    const script = document.createElement("script")
    script.src = "https://www.google.com/recaptcha/api.js"
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log("✅ reCAPTCHA script loaded successfully")
      setRecaptchaLoaded(true)
    }
    script.onerror = () => {
      console.error("❌ Failed to load reCAPTCHA script")
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://www.google.com/recaptcha/api.js"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
      // Clean up global function
      if (window.onRecaptchaChange) {
        delete window.onRecaptchaChange
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = (formType: "mdcat" | "intermediate") => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      heardFrom: "",
      question: "",
      checkboxField: false,
      course: formType === "mdcat" ? "MDCAT" : "", // Set default course based on form type
      gender: "",
      matricMarks: "",
      outOfMarks: "",
    })
    setRecaptchaToken(null)
    if (window.grecaptcha) {
      window.grecaptcha.reset()
    }
  }

  const handleFormSelection = (type: "mdcat" | "intermediate") => {
    setSelectedForm(type)
    resetForm(type) // Reset form data when switching types
    if (type === "mdcat") {
      setFormData((prev) => ({ ...prev, course: "MDCAT" }))
    }
  }

  // Function to track conversion
  const trackConversion = () => {
    console.log("🔍 Tracking conversion with Google Ads")

    if (typeof window !== "undefined" && window.gtag) {
      try {
        // Send the conversion event to Google Ads
        window.gtag("event", "conversion", {
          send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABEL}`,
          value: 1.0,
          currency: "PKR",
          transaction_id: Date.now().toString(),
        })
        console.log("✅ Conversion event sent to Google Ads")
      } catch (error) {
        console.error("❌ Error sending conversion event:", error)
      }
    } else {
      console.error("❌ Google gtag not available")
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!recaptchaToken) {
      toast({
        title: "Error",
        description: "Please complete the reCAPTCHA verification.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    console.log("🚀 Submitting inquiry:", formData)

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          matricMarks: formData.matricMarks ? Number(formData.matricMarks) : null,
          outOfMarks: formData.outOfMarks ? Number(formData.outOfMarks) : null,
          recaptchaToken,
        }),
      })

      console.log("📡 Response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Inquiry submitted successfully:", result)

        // Track conversion with Google Ads
        trackConversion()

        toast({
          title: "Success!",
          description: "Your inquiry has been submitted successfully. We'll get back to you soon!",
        })

        // Reset form and reCAPTCHA
        setSelectedForm("none") // Go back to selection screen
        resetForm(selectedForm)
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
      // Reset reCAPTCHA on error
      if (window.grecaptcha) {
        window.grecaptcha.reset()
      }
      setRecaptchaToken(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Google Ads gtag - Using Next.js Script component for better performance */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Student Inquiry Form</CardTitle>
            <CardDescription className="text-center">
              Please fill out this form to submit your inquiry. We'll get back to you soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedForm === "none" && (
              <div className="flex flex-col space-y-4">
                <Button
                  onClick={() => handleFormSelection("mdcat")}
                  className="w-full py-3 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  MDCAT Inquiry
                </Button>
                <Button
                  onClick={() => handleFormSelection("intermediate")}
                  className="w-full py-3 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  Intermediate Inquiry
                </Button>
              </div>
            )}

            {selectedForm !== "none" && (
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

                {selectedForm === "mdcat" && (
                  <>
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
                      <Label htmlFor="course">Interested Course *</Label>
                      <Select
                        name="course"
                        value={formData.course}
                        onValueChange={(value) => handleInputChange("course", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Matric">Matric</SelectItem>
                          <SelectItem value="MDCAT">MDCAT</SelectItem>
                          <SelectItem value="FSc Pre-Engineering">FSc Pre-Engineering</SelectItem>
                          <SelectItem value="FSc Medical">FSc Medical</SelectItem>
                          <SelectItem value="ICS">ICS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {selectedForm === "intermediate" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <RadioGroup
                        value={formData.gender}
                        onValueChange={(value) => handleInputChange("gender", value)}
                        className="flex space-x-4"
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
                      <Label htmlFor="intermediateCourse">Interested Course *</Label>
                      <RadioGroup
                        value={formData.course}
                        onValueChange={(value) => handleInputChange("course", value)}
                        className="grid grid-cols-2 gap-2"
                        required
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="FSc Pre-Engineering" id="course-pre-eng" />
                          <Label htmlFor="course-pre-eng">FSc Pre-Engineering</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="FSc Medical" id="course-pre-med" />
                          <Label htmlFor="course-pre-med">FSc Medical</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="FA IT" id="course-fa-it" />
                          <Label htmlFor="course-fa-it">FA IT</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ICS" id="course-ics" />
                          <Label htmlFor="course-ics">ICS</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </>
                )}

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

                {/* reCAPTCHA */}
                <div className="flex justify-center">
                  {recaptchaLoaded ? (
                    <div
                      className="g-recaptcha"
                      data-sitekey={RECAPTCHA_SITE_KEY}
                      data-callback="onRecaptchaChange"
                    ></div>
                  ) : (
                    <div className="text-sm text-gray-500">Loading reCAPTCHA...</div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button type="submit" className="flex-1" disabled={isSubmitting || !recaptchaToken}>
                    {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setSelectedForm("none")} className="flex-1">
                    Back to Selection
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">
          Powered by <span className="font-semibold text-gray-700">Alams Innovate</span>
        </p>
      </div>
    </>
  )
}
