"use client"

import { useState, useCallback } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { MDCATInquiryForm } from "@/components/mdcat-inquiry-form"
import { IntermediateInquiryForm } from "@/components/intermediate-inquiry-form"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Removed declare global for grecaptcha and onRecaptchaChange

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ""
const CONVERSION_LABEL = process.env.NEXT_PUBLIC_CONVERSION_LABEL || ""

export default function InquiryPage() {
  const [selectedForm, setSelectedForm] = useState<"MDCAT" | "Intermediate" | null>(null)
  // Removed recaptchaLoaded and recaptchaToken states
  const { toast } = useToast()

  // Function to track Google Ads conversion
  const trackConversion = useCallback(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "conversion", {
        send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABEL}`,
      })
      console.log("Google Ads conversion tracked!")
    } else {
      console.warn("Google Ads gtag not loaded. Conversion not tracked.")
    }
  }, [])

  // Removed useEffect for reCAPTCHA setup and cleanup

  const handleFormSuccess = () => {
    setSelectedForm(null) // Go back to selection after successful submission
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      {/* Google Ads Script */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>

      {/* Removed reCAPTCHA Script */}

      {!selectedForm ? (
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Select Inquiry Type</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => setSelectedForm("MDCAT")} className="w-full">
              MDCAT Inquiry
            </Button>
            <Button onClick={() => setSelectedForm("Intermediate")} className="w-full">
              Intermediate Inquiry
            </Button>
          </CardContent>
        </Card>
      ) : selectedForm === "MDCAT" ? (
        <MDCATInquiryForm
          onSuccess={handleFormSuccess}
          // Removed recaptchaLoaded, recaptchaToken, setRecaptchaToken
          // Removed RECAPTCHA_SITE_KEY
          GOOGLE_ADS_ID={GOOGLE_ADS_ID}
          CONVERSION_LABEL={CONVERSION_LABEL}
          trackConversion={trackConversion}
          toast={toast}
        />
      ) : (
        <IntermediateInquiryForm
          onSuccess={handleFormSuccess}
          // Removed recaptchaLoaded, recaptchaToken, setRecaptchaToken
          // Removed RECAPTCHA_SITE_KEY
          GOOGLE_ADS_ID={GOOGLE_ADS_ID}
          CONVERSION_LABEL={CONVERSION_LABEL}
          trackConversion={trackConversion}
          toast={toast}
        />
      )}
    </div>
  )
}
