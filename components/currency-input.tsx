"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface CurrencyInputProps {
  id?: string
  value: number
  onChange: (value: number) => void
  className?: string
  placeholder?: string
}

// Format number with Pakistani comma system
const formatPakistaniNumber = (num: number): string => {
  if (num === 0) return "0"

  const numStr = num.toString()
  const length = numStr.length

  if (length <= 3) return numStr
  if (length <= 5) return numStr.slice(0, -3) + "," + numStr.slice(-3)
  if (length <= 7) return numStr.slice(0, -5) + "," + numStr.slice(-5, -3) + "," + numStr.slice(-3)

  // For larger numbers, use standard formatting
  return num.toLocaleString("en-PK")
}

// Remove formatting and return number
const parseFormattedNumber = (str: string): number => {
  const cleaned = str.replace(/[^0-9]/g, "")
  return cleaned === "" ? 0 : Number.parseInt(cleaned, 10)
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ id, value, onChange, className, placeholder, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const numericValue = parseFormattedNumber(inputValue)
      onChange(numericValue)
    }

    const displayValue = value === 0 ? "" : formatPakistaniNumber(value)

    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
          Rs |
        </div>
        <Input
          ref={ref}
          id={id}
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder || "0"}
          className={cn("pl-12", className)}
          {...props}
        />
      </div>
    )
  },
)

CurrencyInput.displayName = "CurrencyInput"
