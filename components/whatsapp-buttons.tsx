"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Check, Clock, DollarSign } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface WhatsAppButtonsProps {
  id: number
  name: string
  phone: string
  type: "inquiry" | "registration"
  onButtonClick?: () => void
}

export function WhatsAppButtons({ id, name, phone, type, onButtonClick }: WhatsAppButtonsProps) {
  const [buttonStates, setButtonStates] = useState({
    welcome: false,
    followup: false,
    reminder: false,
    payment: false,
  })
  const [loading, setLoading] = useState(true)

  // Fetch button states from the database
  useEffect(() => {
    fetchButtonStates()
  }, [id, type])

  const fetchButtonStates = async () => {
    try {
      const response = await fetch(`/api/whatsapp-status?recordId=${id}&recordType=${type}`)
      if (response.ok) {
        const data = await response.json()
        const states = {
          welcome: false,
          followup: false,
          reminder: false,
          payment: false,
        }

        data.forEach((record: any) => {
          states[record.message_type as keyof typeof states] = true
        })

        setButtonStates(states)
      }
    } catch (error) {
      console.error("Error fetching button states:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, "")

    // Add country code if not present
    if (!cleaned.startsWith("92")) {
      if (cleaned.startsWith("0")) {
        cleaned = "92" + cleaned.substring(1)
      } else {
        cleaned = "92" + cleaned
      }
    }

    return cleaned
  }

  const getWhatsAppMessages = () => {
    if (type === "inquiry") {
      return {
        welcome: `AOA ${name},
Future Doctor of Sialkot,

🎉 Congratulations! Your First Step to Success has been completed ✅

Aap ko MDCAT 2025 session ki "Interested Students" list mein shamil kar liya gaya hai.

🗓 Introductory Session: 5th June, Thursday - Subah 9:30 baje
📍 Location: Delta Preparations, Sialkot
📌 Google Pin: https://maps.app.goo.gl/nPtgKH2CrMPhGnXe8

Agar aap mazeed maloomat chahte hain tou is message ko reply kar-dein.

Student Counsellor
Delta Preparations – MDCAT 2025`,
        followup: `Hi ${name}! 📚

We hope you're doing well. We wanted to follow up on your inquiry about our MDCAT course.

Our expert faculty and proven track record can help you secure admission in top medical colleges.

Would you like to schedule a consultation call to discuss your preparation strategy?

Delta Academy Team`,
        reminder: `Dear ${name}, 🎯

This is a friendly reminder about your interest in our MDCAT preparation course.

Don't miss out on our limited seats for the upcoming batch. Early registration comes with special benefits!

Contact us today to secure your spot.

Delta Academy Team`,
      }
    } else {
      // Registration messages remain the same
      return {
        welcome: `Welcome to Delta Academy, ${name}! 🎉

Congratulations on joining our MDCAT preparation program. You've taken the first step towards your medical career!

Your registration is confirmed. Our team will share the class schedule and study materials soon.

Welcome aboard!
Delta Academy Team`,
        payment: `Hi ${name}! 💳

We hope your MDCAT preparation is going well.

This is a gentle reminder about your pending fee payment. Please clear your dues at your earliest convenience to continue enjoying uninterrupted classes.

For payment details, please contact our accounts department.

Delta Academy Team`,
        reminder: `Dear ${name}, 📖

We hope you're making great progress in your MDCAT preparation!

Remember to attend all classes regularly and complete your assignments on time. Consistency is key to success.

Keep up the excellent work!
Delta Academy Team`,
      }
    }
  }

  const handleWhatsAppClick = async (buttonType: string) => {
    if (buttonStates[buttonType as keyof typeof buttonStates]) {
      toast({
        title: "Already Sent",
        description: "This message has already been sent to this contact.",
        variant: "destructive",
      })
      return
    }

    const messages = getWhatsAppMessages()
    const message = messages[buttonType as keyof typeof messages]
    const phoneNumber = formatPhoneNumber(phone)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    // Open WhatsApp
    window.open(whatsappUrl, "_blank")

    // Update button state in database
    try {
      const response = await fetch(`/api/${type === "inquiry" ? "inquiries" : "registrations"}/${id}/whatsapp`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buttonType,
          name,
          phone,
          message,
        }),
      })

      if (response.ok) {
        setButtonStates((prev) => ({
          ...prev,
          [buttonType]: true,
        }))

        toast({
          title: "Message Sent",
          description: `WhatsApp message sent to ${name}`,
        })

        onButtonClick?.()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update message status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating WhatsApp status:", error)
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      })
    }
  }

  const getButtonConfig = () => {
    if (type === "inquiry") {
      return [
        {
          key: "welcome",
          label: "Welcome",
          icon: MessageCircle,
          sent: buttonStates.welcome,
          color: "bg-green-500 hover:bg-green-600",
          sentColor: "bg-gray-400 cursor-not-allowed",
        },
        {
          key: "followup",
          label: "Follow-up",
          icon: Clock,
          sent: buttonStates.followup,
          color: "bg-blue-500 hover:bg-blue-600",
          sentColor: "bg-gray-400 cursor-not-allowed",
        },
        {
          key: "reminder",
          label: "Reminder",
          icon: Check,
          sent: buttonStates.reminder,
          color: "bg-orange-500 hover:bg-orange-600",
          sentColor: "bg-gray-400 cursor-not-allowed",
        },
      ]
    } else {
      return [
        {
          key: "welcome",
          label: "Welcome",
          icon: MessageCircle,
          sent: buttonStates.welcome,
          color: "bg-green-500 hover:bg-green-600",
          sentColor: "bg-gray-400 cursor-not-allowed",
        },
        {
          key: "payment",
          label: "Payment",
          icon: DollarSign,
          sent: buttonStates.payment,
          color: "bg-red-500 hover:bg-red-600",
          sentColor: "bg-gray-400 cursor-not-allowed",
        },
        {
          key: "reminder",
          label: "Reminder",
          icon: Check,
          sent: buttonStates.reminder,
          color: "bg-orange-500 hover:bg-orange-600",
          sentColor: "bg-gray-400 cursor-not-allowed",
        },
      ]
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  const buttons = getButtonConfig()

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
      {buttons.map((button) => {
        const Icon = button.icon
        return (
          <Button
            key={button.key}
            size="sm"
            onClick={() => handleWhatsAppClick(button.key)}
            disabled={button.sent}
            className={`${
              button.sent ? button.sentColor : `${button.color} text-white`
            } text-xs px-2 py-1 h-8 min-w-[70px] flex items-center justify-center`}
            title={button.sent ? "Already sent" : `Send ${button.label} message`}
          >
            <Icon className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">{button.label}</span>
            <span className="sm:hidden">{button.label.charAt(0)}</span>
            {button.sent && <Check className="h-3 w-3 ml-1" />}
          </Button>
        )
      })}
    </div>
  )
}
