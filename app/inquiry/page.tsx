"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MDCATInquiryForm } from "@/components/mdcat-inquiry-form"
import { IntermediateInquiryForm } from "@/components/intermediate-inquiry-form"
import { useToast } from "@/hooks/use-toast"

export default function InquiryPage() {
  const [activeTab, setActiveTab] = useState("mdcat")
  const { toast } = useToast()

  // Removed reCAPTCHA state and effects

  const handleFormSuccess = () => {
    // Optionally switch tabs or show a success message
    console.log("Form submitted successfully!")
  }

  // Dummy function for Google Ads conversion tracking (no-op since reCAPTCHA is removed)
  const trackConversion = () => {
    console.log("Conversion tracking (dummy) triggered.")
  }

  // Dummy values for GOOGLE_ADS_ID and CONVERSION_LABEL
  const GOOGLE_ADS_ID = "AW-123456789"
  const CONVERSION_LABEL = "dummy_conversion_label"

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mdcat">MDCAT Inquiry</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediate Inquiry</TabsTrigger>
        </TabsList>
        <TabsContent value="mdcat">
          <MDCATInquiryForm
            onSuccess={handleFormSuccess}
            // Removed recaptchaLoaded, recaptchaToken, setRecaptchaToken, RECAPTCHA_SITE_KEY
            GOOGLE_ADS_ID={GOOGLE_ADS_ID}
            CONVERSION_LABEL={CONVERSION_LABEL}
            trackConversion={trackConversion}
            toast={toast}
          />
        </TabsContent>
        <TabsContent value="intermediate">
          <IntermediateInquiryForm
            onSuccess={handleFormSuccess}
            // Removed recaptchaLoaded, recaptchaToken, setRecaptchaToken, RECAPTCHA_SITE_KEY
            GOOGLE_ADS_ID={GOOGLE_ADS_ID}
            CONVERSION_LABEL={CONVERSION_LABEL}
            trackConversion={trackConversion}
            toast={toast}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
