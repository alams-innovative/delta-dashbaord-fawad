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
      if (amount === 0) return "0"
      return amount.toLocaleString("en-PK")
    }

    // Generate HTML for PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Student Registration - ${registration.name}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f8f9fa;
                padding: 20px;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 2.5rem;
                margin-bottom: 10px;
                font-weight: 700;
            }
            
            .header p {
                font-size: 1.1rem;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px;
            }
            
            .section {
                margin-bottom: 30px;
                padding: 20px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: #f9fafb;
            }
            
            .section h2 {
                color: #10b981;
                font-size: 1.3rem;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 2px solid #10b981;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }
            
            .info-item {
                display: flex;
                flex-direction: column;
            }
            
            .info-label {
                font-weight: 600;
                color: #374151;
                font-size: 0.9rem;
                margin-bottom: 4px;
            }
            
            .info-value {
                color: #1f2937;
                font-size: 1rem;
                padding: 8px 12px;
                background: white;
                border: 1px solid #d1d5db;
                border-radius: 6px;
            }
            
            .fee-section {
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                border: 1px solid #0ea5e9;
            }
            
            .fee-section h2 {
                color: #0ea5e9;
                border-bottom-color: #0ea5e9;
            }
            
            .fee-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: white;
                border: 1px solid #e0f2fe;
                border-radius: 6px;
                margin-bottom: 10px;
            }
            
            .fee-label {
                font-weight: 600;
                color: #0c4a6e;
            }
            
            .fee-amount {
                font-weight: 700;
                font-size: 1.1rem;
            }
            
            .fee-paid { color: #059669; }
            .fee-pending { color: #dc2626; }
            .fee-concession { color: #7c3aed; }
            
            .comments-section {
                background: linear-gradient(135deg, #fef3c7, #fde68a);
                border: 1px solid #f59e0b;
            }
            
            .comments-section h2 {
                color: #92400e;
                border-bottom-color: #f59e0b;
            }
            
            .comments-text {
                background: white;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #fde68a;
                min-height: 60px;
                font-style: italic;
                color: #78350f;
            }
            
            .footer {
                background: #f3f4f6;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 0.9rem;
            }
            
            .status-badge {
                display: inline-block;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .status-paid {
                background: #d1fae5;
                color: #065f46;
                border: 1px solid #10b981;
            }
            
            .status-pending {
                background: #fed7aa;
                color: #9a3412;
                border: 1px solid #f97316;
            }
            
            @media print {
                body { background: white; padding: 0; }
                .container { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 Student Registration</h1>
                <p>Official Registration Document</p>
            </div>
            
            <div class="content">
                <!-- Personal Information -->
                <div class="section">
                    <h2>👤 Personal Information</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Student Name</span>
                            <span class="info-value">${registration.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Father's Name</span>
                            <span class="info-value">${registration.father_name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">CNIC</span>
                            <span class="info-value">${registration.cnic || "Not provided"}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Gender</span>
                            <span class="info-value">${registration.gender || "Not specified"}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Contact Information -->
                <div class="section">
                    <h2>📞 Contact Information</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Phone Number</span>
                            <span class="info-value">${registration.phone}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email Address</span>
                            <span class="info-value">${registration.email || "Not provided"}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Fee Information -->
                <div class="section fee-section">
                    <h2>💰 Fee Information</h2>
                    <div class="fee-item">
                        <span class="fee-label">Fee Paid</span>
                        <span class="fee-amount fee-paid">Rs ${formatPKR(registration.fee_paid || 0)}</span>
                    </div>
                    <div class="fee-item">
                        <span class="fee-label">Fee Pending</span>
                        <span class="fee-amount fee-pending">Rs ${formatPKR(registration.fee_pending || 0)}</span>
                    </div>
                    <div class="fee-item">
                        <span class="fee-label">Concession</span>
                        <span class="fee-amount fee-concession">Rs ${formatPKR(registration.concession || 0)}</span>
                    </div>
                    <div class="fee-item">
                        <span class="fee-label">Payment Status</span>
                        <span class="status-badge ${(registration.fee_pending || 0) === 0 ? "status-paid" : "status-pending"}">
                            ${(registration.fee_pending || 0) === 0 ? "Fully Paid" : "Payment Pending"}
                        </span>
                    </div>
                </div>
                
                <!-- Comments -->
                <div class="section comments-section">
                    <h2>📝 Comments</h2>
                    <div class="comments-text">
                        ${registration.comments || "No additional comments provided."}
                    </div>
                </div>
                
                <!-- Registration Details -->
                <div class="section">
                    <h2>📅 Registration Details</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Registration Date</span>
                            <span class="info-value">${new Date(registration.created_at).toLocaleDateString("en-PK", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Registration ID</span>
                            <span class="info-value">#${registration.id.toString().padStart(6, "0")}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>Generated on ${new Date().toLocaleDateString("en-PK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</p>
                <p>This is an official registration document.</p>
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
