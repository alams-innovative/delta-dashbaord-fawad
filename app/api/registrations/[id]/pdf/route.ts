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

    // Get URL parameters for customization
    const url = new URL(request.url)
    const paymentMethod = url.searchParams.get("paymentMethod") || "Cash"

    // Format Pakistani numbers
    const formatPKR = (amount: number) => {
      if (amount === 0 || isNaN(amount)) return "0.00"
      return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }

    // Calculate amounts - Total should equal amount paid for receipt
    const feePaid = Number.parseFloat(registration.fee_paid || 0) || 0
    const feePending = Number.parseFloat(registration.fee_pending || 0) || 0
    const concession = Number.parseFloat(registration.concession || 0) || 0

    // For receipt, we show the amount that was actually paid
    const receiptAmount = feePaid
    const subtotal = feePaid + feePending
    const totalAfterDiscount = subtotal - concession

    // Format dates
    const now = new Date()
    const generatedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    const generatedTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

    // Calculate due date (30 days from now)
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const formattedDueDate = dueDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    const numberToWords = (num: number): string => {
      if (isNaN(num) || num === 0) return "Zero"

      const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
      const teens = [
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ]
      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
      const thousands = ["", "Thousand", "Million", "Billion"]

      function convertHundreds(n: number): string {
        let result = ""
        if (n >= 100) {
          result += ones[Math.floor(n / 100)] + " Hundred "
          n %= 100
        }
        if (n >= 20) {
          result += tens[Math.floor(n / 10)] + " "
          n %= 10
        } else if (n >= 10) {
          result += teens[n - 10] + " "
          return result
        }
        if (n > 0) {
          result += ones[n] + " "
        }
        return result
      }

      let result = ""
      let thousandCounter = 0

      while (num > 0) {
        if (num % 1000 !== 0) {
          result = convertHundreds(num % 1000) + thousands[thousandCounter] + " " + result
        }
        num = Math.floor(num / 1000)
        thousandCounter++
      }

      return result.trim()
    }

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
            background: white;
        }
        
        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
            background: white;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 2px solid #000;
            background: #f8f9fa;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
        }
        
        .logo {
            width: 80px; /* Adjust as needed */
            height: 80px; /* Adjust as needed */
            background: url('/images/delta-college-logo.jpg') no-repeat center center; /* Updated logo path */
            background-size: contain;
            margin-right: 15px;
            /* Removed border and border-radius to fit the shield logo */
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #4338ca;
            margin-bottom: 3px;
        }
        
        .company-address {
            font-size: 12px;
            margin-bottom: 3px;
            color: #666;
        }
        
        .voucher-title {
            font-size: 16px;
            font-weight: bold;
            color: #4338ca;
        }
        
        .timestamp {
            text-align: center;
            padding: 8px 15px;
            background: #e3f2fd;
            border-bottom: 1px solid #000;
            font-size: 11px;
            color: #1976d2;
            font-weight: bold;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            border-bottom: 1px solid #000;
            font-size: 11px;
        }
        
        .payment-method {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .payment-option {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .radio-selected {
            width: 12px;
            height: 12px;
            border: 2px solid #4338ca;
            border-radius: 50%;
            background: #4338ca;
            position: relative;
        }
        
        .radio-unselected {
            width: 12px;
            height: 12px;
            border: 2px solid #ccc;
            border-radius: 50%;
            background: white;
        }
        
        .session-row {
            padding: 10px 15px;
            border-bottom: 2px solid #000;
            background: #f5f5f5;
            font-weight: bold;
        }
        
        .student-info {
            display: flex;
            border-bottom: 2px solid #000;
        }
        
        .student-details {
            width: 60%;
            padding: 15px;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 8px;
        }
        
        .detail-label {
            font-weight: bold;
            width: 120px;
            margin-right: 10px;
            color: #374151;
        }
        
        .detail-value {
            color: #1f2937;
        }
        
        .amount-section {
            width: 40%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 15px;
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
        }
        
        .amount-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #0c4a6e;
        }
        
        .amount-value {
            font-size: 24px;
            font-weight: bold;
            color: #0ea5e9;
        }
        
        .payment-summary {
            display: flex;
            padding: 15px;
            border-bottom: 1px solid #000;
        }
        
        .payment-left {
            width: 50%;
        }
        
        .payment-right {
            width: 50%;
            text-align: right;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
        }
        
        .total-row {
            border-top: 2px solid #000;
            padding-top: 8px;
            font-weight: bold;
            font-size: 14px;
            color: #059669;
        }
        
        .amount-words {
            text-align: center;
            padding: 10px;
            font-style: italic;
            border-bottom: 1px solid #000;
            background: #fef3c7;
            color: #92400e;
        }
        
        .disclaimer {
            padding: 10px 15px;
            border-bottom: 1px solid #000;
            font-size: 11px;
            background: #f3f4f6;
        }
        
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 10px;
            color: #6b7280;
            background: #f9fafb;
        }
        
        .share-buttons {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 1000;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        
        .btn-whatsapp {
            background: #25d366;
            color: white;
        }
        
        .btn-print {
            background: #4338ca;
            color: white;
        }
        
        @media print {
            .share-buttons { display: none; }
            body { background: white; }
            .container { box-shadow: none; border: 1px solid #000; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo-section">
                <div class="logo"></div>
                <div class="company-info">
                    <div class="company-name">Delta Education Systems</div>
                    <div class="company-address">Khadam Ali Road, SIAI KOT, PAKISTAN</div>
                    <div class="company-address">Mobile: 03023556989, preparations.com.pk</div>
                </div>
            </div>
            <div class="voucher-title">Fee Voucher Paid</div>
        </div>
        
        <!-- Generated Timestamp -->
        <div class="timestamp">
            Generated on: ${generatedDate} at ${generatedTime} | Electronic Receipt
        </div>
        
        <!-- Date and Payment Method -->
        <div class="info-row">
            <div>
                <strong>Date:</strong> ${generatedDate}<br>
                <strong>Time:</strong> ${generatedTime}
            </div>
            <div class="payment-method">
                <div class="payment-option">
                    <div class="${paymentMethod === "Cash" ? "radio-selected" : "radio-unselected"}"></div>
                    <span>Cash</span>
                </div>
                <div class="payment-option">
                    <div class="${paymentMethod === "Check" ? "radio-selected" : "radio-unselected"}"></div>
                    <span>Check</span>
                </div>
                <div class="payment-option">
                    <div class="${paymentMethod === "Bank" ? "radio-selected" : "radio-unselected"}"></div>
                    <span>Bank</span>
                </div>
                <div class="payment-option">
                    <div class="${paymentMethod === "Mobile" ? "radio-selected" : "radio-unselected"}"></div>
                    <span>Mobile</span>
                </div>
                <div class="payment-option">
                    <div class="${paymentMethod === "Card" ? "radio-selected" : "radio-unselected"}"></div>
                    <span>Card</span>
                </div>
            </div>
            <div>
                <strong>Invoice No.</strong> INV-${registration.id.toString().padStart(6, "0")}<br>
                <strong>Internal System Code:</strong> SYS-${registration.id.toString().padStart(4, "0")}
            </div>
        </div>
        
        <!-- Academic Session -->
        <div class="session-row">
            <strong>Academic Session:</strong> ${registration.academic_session || "ACADEMIC SESSION 2025 (ACS25)"}
        </div>
        
        <!-- Student Information -->
        <div class="student-info">
            <div class="student-details">
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${registration.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Father Name:</span>
                    <span class="detail-value">${registration.father_name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${registration.address || "PAKISTAN"}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Gender:</span>
                    <span class="detail-value">${registration.gender || "Not specified"}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Contact Number:</span>
                    <span class="detail-value">${registration.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Pending Payment Due on:</span>
                    <span class="detail-value">${feePending > 0 ? formattedDueDate : "N/A"}</span>
                </div>
            </div>
            <div class="amount-section">
                <div class="amount-title">Amount Paid</div>
                <div class="amount-value">Rs. ${formatPKR(receiptAmount)}</div>
            </div>
        </div>
        
        <!-- Payment Summary -->
        <div class="payment-summary">
            <div class="payment-left">
                <div class="summary-row">
                    <span><strong>Amount Paid:</strong></span>
                    <span><strong>Rs ${formatPKR(feePaid)}</strong></span>
                </div>
                <div class="summary-row">
                    <span><strong>Remaining Due:</strong></span>
                    <span><strong>Rs ${formatPKR(feePending)}</strong></span>
                </div>
            </div>
            <div class="payment-right">
                <div class="summary-row">
                    <span><strong>Total Fee:</strong></span>
                    <span><strong>Rs ${formatPKR(subtotal)}</strong></span>
                </div>
                <div class="summary-row">
                    <span><strong>Discount:</strong></span>
                    <span><strong>Rs ${formatPKR(concession)}</strong></span>
                </div>
                <div class="summary-row total-row">
                    <span><strong>Receipt Amount:</strong></span>
                    <span><strong>Rs ${formatPKR(receiptAmount)}</strong></span>
                </div>
            </div>
        </div>
        
        <!-- Amount in Words -->
        <div class="amount-words">
            (${numberToWords(receiptAmount)} Rupees Only)
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
    
    <!-- Share Buttons -->
    <div class="share-buttons">
        <button class="btn btn-whatsapp" onclick="shareViaWhatsApp()">
            📱 Share via WhatsApp
        </button>
        <button class="btn btn-print" onclick="window.print()">
            🖨️ Print Receipt
        </button>
    </div>
    
    <script>
        function shareViaWhatsApp() {
            const studentName = "${registration.name}";
            const studentPhone = "${registration.phone.startsWith("0") ? `92${registration.phone.substring(1)}` : registration.phone.replace(/\D/g, "")}"; // Format phone
            const amount = "Rs ${formatPKR(receiptAmount)}";
            const invoiceNo = "INV-${registration.id.toString().padStart(6, "0")}";
            
            const message = \`🎓 Delta College Fee Receipt
            
Student: \${studentName}
Invoice: \${invoiceNo}
Amount Paid: \${amount}
Payment Method: ${paymentMethod}
Date: ${generatedDate}

Generated via Delta College Management System\`;
            
            const whatsappUrl = \`https://wa.me/\${studentPhone}?text=\${encodeURIComponent(message)}\`;
            window.open(whatsappUrl, '_blank');
        }
    </script>
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
