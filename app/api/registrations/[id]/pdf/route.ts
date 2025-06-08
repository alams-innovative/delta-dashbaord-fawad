import { type NextRequest, NextResponse } from "next/server"
import { getRegistrationById } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const registrationId = Number.parseInt(params.id)
    const registration = await getRegistrationById(registrationId)

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Format Pakistani numbers
    const formatPKR = (amount: number) => {
      if (amount === 0) return "0.00"
      return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }

    // Calculate total
    const feePaid = registration.fee_paid || 0
    const feePending = registration.fee_pending || 0
    const concession = registration.concession || 0
    const total = feePending

    // Format date
    const today = new Date()
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}`
    const formattedTime = `${today.getHours().toString().padStart(2, "0")}:${today.getMinutes().toString().padStart(2, "0")}:${today.getSeconds().toString().padStart(2, "0")}`

    // Generate HTML for PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fee Voucher - ${registration.name}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
            }
            
            body {
                font-size: 12px;
                line-height: 1.4;
            }
            
            .container {
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #000;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                border-bottom: 1px solid #000;
            }
            
            .logo-section {
                display: flex;
                align-items: center;
            }
            
            .logo {
                width: 60px;
                height: 60px;
                background-color: #4338ca;
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                margin-right: 10px;
            }
            
            .logo-text {
                font-weight: bold;
                font-size: 14px;
                text-align: center;
            }
            
            .address {
                font-size: 11px;
                line-height: 1.3;
            }
            
            .voucher-title {
                font-weight: bold;
                font-size: 16px;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 10px;
                border-bottom: 1px solid #000;
            }
            
            .info-left, .info-right {
                display: flex;
            }
            
            .info-left > div, .info-right > div {
                margin-right: 15px;
            }
            
            .session-row {
                padding: 8px 10px;
                border-bottom: 1px solid #000;
                font-weight: bold;
            }
            
            .student-info {
                display: flex;
                border-bottom: 1px solid #000;
            }
            
            .student-details {
                width: 50%;
                padding: 10px;
            }
            
            .student-details div {
                margin-bottom: 5px;
            }
            
            .amount-section {
                width: 50%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: flex-end;
                padding: 10px;
            }
            
            .amount-title {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .amount-value {
                font-size: 18px;
                font-weight: bold;
            }
            
            .payment-info {
                display: flex;
                border-bottom: 1px solid #000;
            }
            
            .payment-left {
                width: 50%;
                padding: 10px;
            }
            
            .payment-left div {
                margin-bottom: 5px;
                display: flex;
                justify-content: space-between;
            }
            
            .payment-right {
                width: 50%;
                padding: 10px;
                display: flex;
                flex-direction: column;
            }
            
            .payment-right div {
                margin-bottom: 5px;
                display: flex;
                justify-content: space-between;
            }
            
            .total-row {
                font-weight: bold;
            }
            
            .zero-rupee {
                padding: 8px 10px;
                border-bottom: 1px solid #000;
                font-style: italic;
                text-align: center;
            }
            
            .disclaimer {
                padding: 8px 10px;
                border-bottom: 1px solid #000;
                font-size: 11px;
            }
            
            .footer {
                padding: 8px 10px;
                text-align: center;
                font-size: 10px;
                font-style: italic;
            }
            
            @media print {
                .container {
                    border: 1px solid #000;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo-section">
                    <div class="logo">
                        <div class="logo-text">DELTA</div>
                        <div class="logo-text">EDU</div>
                    </div>
                    <div>
                        <div style="font-weight: bold; font-size: 14px;">Delta Education Systems.</div>
                        <div class="address">Khadam Ali Road, SIAI KOT, PAKISTAN</div>
                        <div class="address">Mobile: 03023556989, preparations.com.pk</div>
                    </div>
                </div>
                <div class="voucher-title">Fee Voucher Paid</div>
            </div>
            
            <!-- Date and Invoice Info -->
            <div class="info-row">
                <div class="info-left">
                    <div>Date: ${formattedDate}</div>
                    <div>Time: ${formattedTime}</div>
                </div>
                <div class="info-right">
                    <div>Invoice No. INV-${registration.id.toString().padStart(6, "0")}</div>
                    <div>Internal System Code: SYS-${registration.id.toString().padStart(4, "0")}</div>
                </div>
            </div>
            
            <!-- Session -->
            <div class="session-row">
                <div>Session</div>
                <div>ACADEMIC SESSION ${new Date().getFullYear()} (ACS${new Date().getFullYear().toString().slice(-2)})</div>
            </div>
            
            <!-- Student Info -->
            <div class="student-info">
                <div class="student-details">
                    <div><strong>Student Name</strong> ${registration.name}</div>
                    <div><strong>Parents Name</strong> ${registration.father_name}</div>
                    <div><strong>Address</strong> PAKISTAN</div>
                    <div><strong>Contact</strong> ${registration.phone}</div>
                </div>
                <div class="amount-section">
                    <div class="amount-title">Amount in Pak Rupees</div>
                    <div class="amount-value">Rs. ${formatPKR(feePaid)}</div>
                </div>
            </div>
            
            <!-- Payment Info -->
            <div class="payment-info">
                <div class="payment-left">
                    <div>
                        <span>Total Paid</span>
                        <span>Rs ${formatPKR(feePaid)}</span>
                    </div>
                    <div>
                        <span>Total Due</span>
                        <span>Rs. ${formatPKR(feePending)}</span>
                    </div>
                    <div>
                        <span>Pending Payment Due on:</span>
                        <span>${feePending > 0 ? new Date(today.setMonth(today.getMonth() + 1)).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "N/A"}</span>
                    </div>
                </div>
                <div class="payment-right">
                    <div>
                        <span>Subtotal:</span>
                        <span>Rs ${formatPKR(feePaid)}</span>
                    </div>
                    <div>
                        <span>Discount</span>
                        <span>Rs. ${formatPKR(concession)}</span>
                    </div>
                    <div class="total-row">
                        <span>Total:</span>
                        <span>Rs ${formatPKR(total)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Zero Rupee -->
            <div class="zero-rupee">
                (${total === 0 ? "Zero" : ""} Rupee Only)
            </div>
            
            <!-- Disclaimer -->
            <div class="disclaimer">
                Dues once paid are not-refundable
            </div>
            
            <!-- Footer -->
            <div class="footer">
                Delta College Reserves the Rights as per the internal policy, terms and conditions (Electronic Receipt)
            </div>
        </div>
    </body>
    </html>
    `

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
