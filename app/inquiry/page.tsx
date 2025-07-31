"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Script from "next/script"
import { MDCATInquiryForm } from "@/components/mdcat-inquiry-form"
import { IntermediateInquiryForm } from "@/components/intermediate-inquiry-form"

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
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
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

  const trackConversion = useCallback(() => {
    console.log("🔍 Tracking conversion with Google Ads")

    if (typeof window !== "undefined" && window.gtag) {
      try {
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
  }, [GOOGLE_ADS_ID, CONVERSION_LABEL])

  const handleFormSuccess = () => {
    // Optionally reset selectedForm or navigate
    setSelectedForm("none") // Go back to selection after success
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
        {selectedForm === "none" ? (
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Select Inquiry Type</CardTitle>
              <CardDescription>Please choose the type of inquiry you want to submit.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Button
                onClick={() => setSelectedForm("mdcat")}
                className="w-full py-3 text-lg bg-purple-600 hover:bg-purple-700 text-white"
              >
                MDCAT Inquiry
              </Button>
              <Button
                onClick={() => setSelectedForm("intermediate")}
                className="w-full py-3 text-lg bg-green-600 hover:bg-green-700 text-white"
              >
                Intermediate Inquiry
              </Button>
            </CardContent>
          </Card>
        ) : selectedForm === "mdcat" ? (
          <MDCATInquiryForm
            onSuccess={handleFormSuccess}
            recaptchaLoaded={recaptchaLoaded}
            recaptchaToken={recaptchaToken}
            setRecaptchaToken={setRecaptchaToken}
            RECAPTCHA_SITE_KEY={RECAPTCHA_SITE_KEY}
            GOOGLE_ADS_ID={GOOGLE_ADS_ID}
            CONVERSION_LABEL={CONVERSION_LABEL}
            trackConversion={trackConversion}
            toast={toast}
          />
        ) : (
          <IntermediateInquiryForm
            onSuccess={handleFormSuccess}
            recaptchaLoaded={recaptchaLoaded}
            recaptchaToken={recaptchaToken}
            setRecaptchaToken={setRecaptchaToken}
            RECAPTCHA_SITE_KEY={RECAPTCHA_SITE_KEY}
            GOOGLE_ADS_ID={GOOGLE_ADS_ID}
            CONVERSION_LABEL={CONVERSION_LABEL}
            trackConversion={trackConversion}
            toast={toast}
          />
        )}
      </div>
    </>
  )
}
