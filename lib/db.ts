import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// User functions
export async function getUserByEmail(email: string) {
  try {
    console.log("🔍 Getting user by email:", email)
    const result = await sql`
      SELECT id, name, email, password_hash as password, role, created_at
      FROM users 
      WHERE email = ${email}
      LIMIT 1
    `
    console.log("📊 Database query result:", result.length > 0 ? "User found" : "No user found")
    return result[0] || null
  } catch (error) {
    console.error("💥 Error getting user by email:", error)
    return null
  }
}

export async function getAllUsers() {
  try {
    console.log("🔍 Getting all users...")
    const result = await sql`
      SELECT id, name, email, role, created_at
      FROM users 
      ORDER BY created_at DESC
    `
    console.log("✅ Found", result.length, "users")
    return result
  } catch (error) {
    console.error("❌ Error getting users:", error)
    return []
  }
}

export async function createUser(data: {
  name: string
  email: string
  password_hash: string
  role: string
}) {
  try {
    console.log("📝 Creating user:", data.email)
    const result = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${data.name}, ${data.email}, ${data.password_hash}, ${data.role})
      RETURNING id, name, email, role, created_at
    `
    console.log("✅ User created successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error creating user:", error)
    return null
  }
}

export async function deleteUser(id: number) {
  try {
    console.log("🗑️ Deleting user:", id)
    await sql`DELETE FROM users WHERE id = ${id}`
    console.log("✅ User deleted successfully")
    return true
  } catch (error) {
    console.error("❌ Error deleting user:", error)
    return false
  }
}

// Inquiry functions
export async function getInquiries() {
  try {
    console.log("🔍 Getting inquiries...")
    const result = await sql`
      SELECT * FROM inquiries ORDER BY created_at DESC
    `
    console.log("✅ Found", result.length, "inquiries")
    return result
  } catch (error) {
    console.error("❌ Error getting inquiries:", error)
    return []
  }
}

export async function createInquiry(data: {
  name: string
  phone: string
  email?: string
  heard_from?: string
  question?: string
  checkbox_field?: boolean
  course?: string
  gender?: string // New field
  matric_marks?: number // New field
  out_of_marks?: number // New field
  intermediate_stream?: string // New field
}) {
  try {
    console.log("📝 Creating inquiry:", data.name)
    const result = await sql`
      INSERT INTO inquiries (name, phone, email, heard_from, question, checkbox_field, course, gender, matric_marks, out_of_marks, intermediate_stream)
      VALUES (${data.name}, ${data.phone}, ${data.email || null}, ${data.heard_from || null}, ${data.question || null}, ${data.checkbox_field || false}, ${data.course || "MDCAT"}, ${data.gender || null}, ${data.matric_marks || null}, ${data.out_of_marks || null}, ${data.intermediate_stream || null})
      RETURNING *
    `
    console.log("✅ Inquiry created successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error creating inquiry:", error)
    return null
  }
}

export async function deleteInquiry(id: number) {
  try {
    console.log("🗑️ Deleting inquiry:", id)
    await sql`DELETE FROM inquiries WHERE id = ${id}`
    console.log("✅ Inquiry deleted successfully")
    return true
  } catch (error) {
    console.error("❌ Error deleting inquiry:", error)
    return false
  }
}

// Registration functions
export async function getRegistrations() {
  try {
    console.log("🔍 Getting registrations...")
    const result = await sql`
      SELECT * FROM registrations ORDER BY created_at DESC
    `
    console.log("✅ Found", result.length, "registrations")
    return result
  } catch (error) {
    console.error("❌ Error getting registrations:", error)
    return []
  }
}

export async function getRegistrationById(id: number) {
  try {
    console.log("🔍 Getting registration by ID:", id)
    const result = await sql`
      SELECT * FROM registrations 
      WHERE id = ${id}
      LIMIT 1
    `
    console.log("✅ Registration retrieved successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error getting registration by ID:", error)
    return null
  }
}

export async function createRegistration(data: {
  name: string
  father_name: string
  cnic?: string
  phone: string
  email?: string
  fee_paid?: number
  fee_pending?: number
  concession?: number
  gender?: string
  picture_url?: string
  comments?: string
}) {
  try {
    console.log("📝 Creating registration:", data.name)
    const result = await sql`
      INSERT INTO registrations (
        name, father_name, cnic, phone, email, 
        fee_paid, fee_pending, concession, gender, picture_url, comments,
        whatsapp_welcome_sent, whatsapp_payment_sent, whatsapp_reminder_sent
      )
      VALUES (
        ${data.name}, ${data.father_name}, ${data.cnic || null}, ${data.phone}, ${data.email || null},
        ${data.fee_paid || 0}, ${data.fee_pending || 0}, ${data.concession || 0}, 
        ${data.gender || null}, ${data.picture_url || null}, ${data.comments || null},
        false, false, false
      )
      RETURNING *
    `
    console.log("✅ Registration created successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error creating registration:", error)
    return null
  }
}

export async function deleteRegistration(id: number) {
  try {
    console.log("🗑️ Deleting registration:", id)
    await sql`DELETE FROM registrations WHERE id = ${id}`
    console.log("✅ Registration deleted successfully")
    return true
  } catch (error) {
    console.error("❌ Error deleting registration:", error)
    return false
  }
}

// Influencer functions
export async function getInfluencers() {
  try {
    console.log("🔍 Getting influencers...")
    const result = await sql`
      SELECT * FROM influencers ORDER BY created_at DESC
    `
    console.log("✅ Found", result.length, "influencers")
    return result
  } catch (error) {
    console.error("❌ Error getting influencers:", error)
    return []
  }
}

export async function createInfluencer(data: {
  name: string
  facebook_url?: string
  instagram_url?: string
  tiktok_url?: string
  youtube_url?: string
  price: number
  comments?: string
}) {
  try {
    console.log("📝 Creating influencer:", data.name)
    const result = await sql`
      INSERT INTO influencers (
        name, facebook_url, instagram_url, tiktok_url, youtube_url, price, comments
      )
      VALUES (
        ${data.name}, ${data.facebook_url || null}, ${data.instagram_url || null}, 
        ${data.tiktok_url || null}, ${data.youtube_url || null}, ${data.price}, ${data.comments || null}
      )
      RETURNING *
    `
    console.log("✅ Influencer created successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error creating influencer:", error)
    return null
  }
}

export async function deleteInfluencer(id: number) {
  try {
    console.log("🗑️ Deleting influencer:", id)
    await sql`DELETE FROM influencers WHERE id = ${id}`
    console.log("✅ Influencer deleted successfully")
    return true
  } catch (error) {
    console.error("❌ Error deleting influencer:", error)
    return false
  }
}

// Meta Campaigns functions
export async function getMetaCampaigns() {
  try {
    console.log("🔍 Getting Meta campaigns...")
    const result = await sql`
      SELECT * FROM meta_campaigns ORDER BY created_at DESC
    `
    console.log("✅ Found", result.length, "Meta campaigns")
    return result
  } catch (error) {
    console.error("❌ Error getting Meta campaigns:", error)
    return []
  }
}

export async function createMetaCampaign(data: {
  name: string
  budget: number
  start_date?: string
  end_date?: string
  status?: string
  notes?: string
}) {
  try {
    console.log("📝 Creating Meta campaign:", data.name)
    const result = await sql`
      INSERT INTO meta_campaigns (
        name, budget, start_date, end_date, status, notes
      )
      VALUES (
        ${data.name}, ${data.budget}, ${data.start_date || null}, ${data.end_date || null}, 
        ${data.status || "Active"}, ${data.notes || null}
      )
      RETURNING *
    `
    console.log("✅ Meta campaign created successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error creating Meta campaign:", error)
    return null
  }
}

// Google Campaigns functions
export async function getGoogleCampaigns() {
  try {
    console.log("🔍 Getting Google campaigns...")
    const result = await sql`
      SELECT * FROM google_campaigns ORDER BY created_at DESC
    `
    console.log("✅ Found", result.length, "Google campaigns")
    return result
  } catch (error) {
    console.error("❌ Error getting Google campaigns:", error)
    return []
  }
}

export async function createGoogleCampaign(data: {
  name: string
  budget: number
  start_date?: string
  end_date?: string
  status?: string
  notes?: string
}) {
  try {
    console.log("📝 Creating Google campaign:", data.name)
    const result = await sql`
      INSERT INTO google_campaigns (
        name, budget, start_date, end_date, status, notes
      )
      VALUES (
        ${data.name}, ${data.budget}, ${data.start_date || null}, ${data.end_date || null}, 
        ${data.status || "Active"}, ${data.notes || null}
      )
      RETURNING *
    `
    console.log("✅ Google campaign created successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error creating Google campaign:", error)
    return null
  }
}

// TikTok Campaigns functions
export async function getTikTokCampaigns() {
  try {
    console.log("🔍 Getting TikTok campaigns...")
    const result = await sql`
      SELECT * FROM tiktok_campaigns ORDER BY created_at DESC
    `
    console.log("✅ Found", result.length, "TikTok campaigns")
    return result
  } catch (error) {
    console.error("❌ Error getting TikTok campaigns:", error)
    return []
  }
}

export async function createTikTokCampaign(data: {
  name: string
  budget: number
  start_date?: string
  end_date?: string
  status?: string
  notes?: string
}) {
  try {
    console.log("📝 Creating TikTok campaign:", data.name)
    const result = await sql`
      INSERT INTO tiktok_campaigns (
        name, budget, start_date, end_date, status, notes
      )
      VALUES (
        ${data.name}, ${data.budget}, ${data.start_date || null}, ${data.end_date || null}, 
        ${data.status || "Active"}, ${data.notes || null}
      )
      RETURNING *
    `
    console.log("✅ TikTok campaign created successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error creating TikTok campaign:", error)
    return null
  }
}

// Session functions
export async function createSession(userId: number, sessionToken: string, expiresAt: Date) {
  try {
    await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
    `
  } catch (error) {
    console.error("Error creating session:", error)
  }
}

export async function getSessionByToken(sessionToken: string) {
  try {
    const result = await sql`
      SELECT u.id, u.name, u.email, u.role
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ${sessionToken} AND s.expires_at > NOW()
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting session by token:", error)
    return null
  }
}

export async function deleteSession(sessionToken: string) {
  try {
    await sql`
      DELETE FROM user_sessions WHERE session_token = ${sessionToken}
    `
  } catch (error) {
    console.error("Error deleting session:", error)
  }
}

// Update functions
export async function updateInquiry(
  id: number,
  data: {
    name?: string
    phone?: string
    email?: string
    heard_from?: string
    question?: string
    checkbox_field?: boolean
    course?: string
    gender?: string // New field
    matric_marks?: number // New field
    out_of_marks?: number // New field
    intermediate_stream?: string // New field
  },
) {
  try {
    console.log("📝 Updating inquiry:", id)
    const result = await sql`
      UPDATE inquiries 
      SET 
        name = COALESCE(${data.name}, name),
        phone = COALESCE(${data.phone}, phone),
        email = COALESCE(${data.email}, email),
        heard_from = COALESCE(${data.heard_from}, heard_from),
        question = COALESCE(${data.question}, question),
        checkbox_field = COALESCE(${data.checkbox_field}, checkbox_field),
        course = COALESCE(${data.course}, course),
        gender = COALESCE(${data.gender}, gender),
        matric_marks = COALESCE(${data.matric_marks}, matric_marks),
        out_of_marks = COALESCE(${data.out_of_marks}, out_of_marks),
        intermediate_stream = COALESCE(${data.intermediate_stream}, intermediate_stream),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    console.log("✅ Inquiry updated successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error updating inquiry:", error)
    return null
  }
}

export async function markInquiryAsRead(id: number) {
  try {
    console.log("📖 Marking inquiry as read:", id)
    await sql`
      UPDATE inquiries SET is_read = true, updated_at = NOW() WHERE id = ${id}
    `
    console.log("✅ Inquiry marked as read")
    return true
  } catch (error) {
    console.error("❌ Error marking inquiry as read:", error)
    return false
  }
}

export async function updateRegistration(
  id: number,
  data: {
    name?: string
    father_name?: string
    cnic?: string
    phone?: string
    email?: string
    fee_paid?: number
    fee_pending?: number
    concession?: number
    gender?: string
    picture_url?: string
    comments?: string
  },
) {
  try {
    console.log("📝 Updating registration:", id)
    const result = await sql`
      UPDATE registrations 
      SET 
        name = COALESCE(${data.name}, name),
        father_name = COALESCE(${data.father_name}, father_name),
        cnic = COALESCE(${data.cnic}, cnic),
        phone = COALESCE(${data.phone}, phone),
        email = COALESCE(${data.email}, email),
        fee_paid = COALESCE(${data.fee_paid}, fee_paid),
        fee_pending = COALESCE(${data.fee_pending}, fee_pending),
        concession = COALESCE(${data.concession}, concession),
        gender = COALESCE(${data.gender}, gender),
        picture_url = COALESCE(${data.picture_url}, picture_url),
        comments = COALESCE(${data.comments}, comments),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    console.log("✅ Registration updated successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error updating registration:", error)
    return null
  }
}

export async function updateInfluencer(
  id: number,
  data: {
    name?: string
    facebook_url?: string
    instagram_url?: string
    tiktok_url?: string
    youtube_url?: string
    price?: number
    comments?: string
  },
) {
  try {
    console.log("📝 Updating influencer:", id)
    const result = await sql`
      UPDATE influencers 
      SET 
        name = COALESCE(${data.name}, name),
        facebook_url = COALESCE(${data.facebook_url}, facebook_url),
        instagram_url = COALESCE(${data.instagram_url}, instagram_url),
        tiktok_url = COALESCE(${data.tiktok_url}, tiktok_url),
        youtube_url = COALESCE(${data.youtube_url}, youtube_url),
        price = COALESCE(${data.price}, price),
        comments = COALESCE(${data.comments}, comments),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    console.log("✅ Influencer updated successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error updating influencer:", error)
    return null
  }
}

// Agency functions
export async function getAgencies() {
  try {
    console.log("🔍 Getting agencies...")
    const result = await sql`
      SELECT * FROM agencies ORDER BY created_at DESC
    `
    console.log("✅ Found", result.length, "agencies")
    return result
  } catch (error) {
    console.error("❌ Error getting agencies:", error)
    return []
  }
}

export async function createAgency(data: {
  name: string
  contact_person?: string
  phone?: string
  email?: string
  commission_rate?: number
}) {
  try {
    console.log("📝 Creating agency:", data.name)
    const result = await sql`
      INSERT INTO agencies (
        name, contact_person, phone, email, commission_rate, 
        total_students, total_amount, commission_earned, commission_paid
      )
      VALUES (
        ${data.name}, ${data.contact_person || null}, ${data.phone || null}, 
        ${data.email || null}, ${data.commission_rate || 0.3}, 0, 0, 0, 0
      )
      RETURNING *
    `
    console.log("✅ Agency created successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error creating agency:", error)
    return null
  }
}

export async function getAgencyPayouts() {
  try {
    console.log("🔍 Getting agency payouts...")
    const result = await sql`
      SELECT * FROM agency_payouts ORDER BY payout_date DESC
    `
    console.log("✅ Found", result.length, "agency payouts")
    return result
  } catch (error) {
    console.error("❌ Error getting agency payouts:", error)
    return []
  }
}

export async function createAgencyPayout(data: {
  agency_id: number
  amount: number
  payout_date: string
  description?: string
}) {
  try {
    console.log("📝 Creating agency payout for agency:", data.agency_id)
    const result = await sql`
      INSERT INTO agency_payouts (agency_id, amount, payout_date, description)
      VALUES (${data.agency_id}, ${data.amount}, ${data.payout_date}, ${data.description || null})
      RETURNING *
    `

    // Update agency commission_paid
    await sql`
      UPDATE agencies 
      SET commission_paid = commission_paid + ${data.amount}
      WHERE id = ${data.agency_id}
    `

    console.log("✅ Agency payout created successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error creating agency payout:", error)
    return null
  }
}

export async function getAgencyStats() {
  try {
    console.log("🔍 Getting agency stats...")
    const result = await sql`
      SELECT 
        COALESCE(SUM(total_students), 0) as total_students,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(commission_earned), 0) as commission_earned,
        COALESCE(SUM(commission_paid), 0) as commission_paid
      FROM agencies
    `

    const stats = result[0]
    console.log("✅ Agency stats retrieved successfully")
    return {
      totalStudents: Number(stats.total_students),
      totalAmount: Number(stats.total_amount),
      commission30: Number(stats.commission_earned),
      paidOut: Number(stats.commission_paid),
    }
  } catch (error) {
    console.error("❌ Error getting agency stats:", error)
    return {
      totalStudents: 0,
      totalAmount: 0,
      commission30: 0,
      paidOut: 0,
    }
  }
}

// Analytics Data functions
export async function getAnalyticsData() {
  try {
    console.log("🔍 Getting analytics data...")
    const result = await sql`
      SELECT * FROM analytics_data ORDER BY created_at DESC
    `
    console.log("✅ Found", result.length, "analytics records")
    return result
  } catch (error) {
    console.error("❌ Error getting analytics data:", error)
    return []
  }
}

export async function createAnalyticsData(data: {
  platform: string
  spent: number
  leads: number
  month?: string
  year?: number
}) {
  try {
    console.log("📝 Creating analytics data for platform:", data.platform)
    const result = await sql`
      INSERT INTO analytics_data (
        platform, spent, leads, month, year
      )
      VALUES (
        ${data.platform}, ${data.spent}, ${data.leads}, ${data.month || null}, ${data.year || null}
      )
      RETURNING *
    `
    console.log("✅ Analytics data created successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error creating analytics data:", error)
    return null
  }
}

export async function getAdSpendByPlatform() {
  try {
    console.log("🔍 Getting ad spend by platform...")
    const result = await sql`
      SELECT platform, SUM(spent) as spent, SUM(leads) as leads
      FROM analytics_data
      GROUP BY platform
      ORDER BY platform
    `
    console.log("✅ Ad spend by platform retrieved successfully")
    return result
  } catch (error) {
    console.error("❌ Error getting ad spend by platform:", error)
    return []
  }
}

export async function getMonthlyAdSpend() {
  try {
    console.log("🔍 Getting monthly ad spend...")
    const result = await sql`
      SELECT month, 
        SUM(CASE WHEN platform = 'Meta' THEN spent ELSE 0 END) as meta,
        SUM(CASE WHEN platform = 'TikTok' THEN spent ELSE 0 END) as tiktok,
        SUM(CASE WHEN platform = 'Google' THEN spent ELSE 0 END) as google
      FROM analytics_data
      GROUP BY month
      ORDER BY 
        CASE 
          WHEN month = 'Jan' THEN 1
          WHEN month = 'Feb' THEN 2
          WHEN month = 'Mar' THEN 3
          WHEN month = 'Apr' THEN 4
          WHEN month = 'May' THEN 5
          WHEN month = 'Jun' THEN 6
          WHEN month = 'Jul' THEN 7
          WHEN month = 'Aug' THEN 8
          WHEN month = 'Sep' THEN 9
          WHEN month = 'Oct' THEN 10
          WHEN month = 'Nov' THEN 11
          WHEN month = 'Dec' THEN 12
        END
    `
    console.log("✅ Monthly ad spend retrieved successfully")
    return result
  } catch (error) {
    console.error("❌ Error getting monthly ad spend:", error)
    return []
  }
}

// Inquiry Status functions
export async function getInquiryStatus(inquiryId: number) {
  try {
    console.log("🔍 Getting inquiry status for:", inquiryId)
    const result = await sql`
      SELECT * FROM inquiry_status 
      WHERE inquiry_id = ${inquiryId} 
      ORDER BY created_at DESC 
      LIMIT 1
    `
    console.log("✅ Inquiry status retrieved successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error getting inquiry status:", error)
    return null
  }
}

export async function createInquiryStatus(data: {
  inquiry_id: number
  status: string
  comments?: string
  updated_by: string
}) {
  try {
    console.log("📝 Creating inquiry status for inquiry:", data.inquiry_id)

    // Add a small delay to prevent rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))

    const result = await sql`
      INSERT INTO inquiry_status (inquiry_id, status, comments, updated_by)
      VALUES (${data.inquiry_id}, ${data.status}, ${data.comments || null}, ${data.updated_by})
      RETURNING *
    `
    console.log("✅ Inquiry status created successfully")
    return result[0] || null
  } catch (error) {
    console.error("❌ Error creating inquiry status:", error)
    throw error // Re-throw to be handled by the API route
  }
}

export async function getInquiryStatusHistory(inquiryId: number) {
  try {
    console.log("🔍 Getting inquiry status history for:", inquiryId)

    // Add a small delay to prevent rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))

    // First check if the table exists and has data
    const result = await sql`
      SELECT * FROM inquiry_status 
      WHERE inquiry_id = ${inquiryId} 
      ORDER BY created_at DESC
    `

    console.log(`✅ Inquiry status history retrieved successfully - found ${result.length} entries`)
    return result || []
  } catch (error) {
    console.error("❌ Error getting inquiry status history:", error)

    // Check if it's a table doesn't exist error
    if (error instanceof Error && error.message.includes('relation "inquiry_status" does not exist')) {
      console.log("📝 inquiry_status table doesn't exist yet - returning empty array")
      return []
    }

    // For other errors, return empty array to prevent UI breaking
    return []
  }
}

// New functions for inquiry button stats with burn/unburn calculation
export async function getTotalInquiryStatusUpdates() {
  try {
    console.log("🔍 Getting total inquiry status updates...")
    const result = await sql`
      SELECT COUNT(*) as total_updates FROM inquiry_status
    `
    console.log("✅ Total inquiry status updates retrieved successfully")
    return Number(result[0]?.total_updates || 0)
  } catch (error) {
    console.error("❌ Error getting total inquiry status updates:", error)
    return 0
  }
}

export async function getTopInquiryStatusUpdaters() {
  try {
    console.log("🔍 Getting top inquiry status updaters...")
    const result = await sql`
      SELECT updated_by, COUNT(*) as update_count
      FROM inquiry_status
      GROUP BY updated_by
      ORDER BY update_count DESC
    `
    console.log("✅ Top inquiry status updaters retrieved successfully")
    return result.map((row) => ({
      updated_by: row.updated_by,
      update_count: Number(row.update_count),
    }))
  } catch (error) {
    console.error("❌ Error getting top inquiry status updaters:", error)
    return []
  }
}

export async function getInquiryStatusUpdateCounts() {
  try {
    console.log("🔍 Getting inquiry status update counts...")
    const result = await sql`
      SELECT status, COUNT(*) as update_count
      FROM inquiry_status
      GROUP BY status
      ORDER BY update_count DESC
    `
    console.log("✅ Inquiry status update counts retrieved successfully")
    return result.map((row) => ({
      status: row.status,
      update_count: Number(row.update_count),
    }))
  } catch (error) {
    console.error("❌ Error getting inquiry status update counts:", error)
    return []
  }
}

// New function to get burn/unburn statistics
export async function getBurnUnburnStats() {
  try {
    console.log("🔍 Getting burn/unburn statistics...")

    // Get total inquiries count
    const inquiryCountResult = await sql`
      SELECT COUNT(*) as total_inquiries FROM inquiries
    `
    const totalInquiries = Number(inquiryCountResult[0]?.total_inquiries || 0)

    // Get total burns (status updates)
    const burnResult = await sql`
      SELECT COUNT(*) as total_burns FROM inquiry_status
    `
    const totalBurns = Number(burnResult[0]?.total_burns || 0)

    // Calculate unburns: (total inquiries × 3) - burns
    const maxPossibleBurns = totalInquiries * 3
    const totalUnburns = Math.max(0, maxPossibleBurns - totalBurns)

    console.log("✅ Burn/unburn statistics retrieved successfully")
    return {
      totalInquiries,
      totalBurns,
      totalUnburns,
      maxPossibleBurns,
      burnPercentage: maxPossibleBurns > 0 ? (totalBurns / maxPossibleBurns) * 100 : 0,
      unburnPercentage: maxPossibleBurns > 0 ? (totalUnburns / maxPossibleBurns) * 100 : 0,
    }
  } catch (error) {
    console.error("❌ Error getting burn/unburn statistics:", error)
    return {
      totalInquiries: 0,
      totalBurns: 0,
      totalUnburns: 0,
      maxPossibleBurns: 0,
      burnPercentage: 0,
      unburnPercentage: 0,
    }
  }
}

// Updated WhatsApp functions with better error handling
export async function getInquiryWhatsAppSentCounts() {
  try {
    console.log("🔍 Getting inquiry WhatsApp sent counts...")

    // First check if the table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'whatsapp_messages'
      );
    `

    if (!tableCheck[0]?.exists) {
      console.log("📝 whatsapp_messages table doesn't exist yet - returning empty array")
      return []
    }

    const result = await sql`
      SELECT message_type, COUNT(*) as sent_count
      FROM whatsapp_messages
      WHERE record_type = 'inquiry'
      GROUP BY message_type
      ORDER BY sent_count DESC
    `
    console.log("✅ Inquiry WhatsApp sent counts retrieved successfully")
    return result.map((row) => ({
      message_type: row.message_type,
      sent_count: Number(row.sent_count),
    }))
  } catch (error) {
    console.error("❌ Error getting inquiry WhatsApp sent counts:", error)

    // Check if it's a table doesn't exist error
    if (error instanceof Error && error.message.includes('relation "whatsapp_messages" does not exist')) {
      console.log("📝 whatsapp_messages table doesn't exist yet - returning empty array")
      return []
    }

    return []
  }
}

export async function getRegistrationWhatsAppSentCounts() {
  try {
    console.log("🔍 Getting registration WhatsApp sent counts...")

    // Check if registrations table has the WhatsApp columns
    const result = await sql`
      SELECT 
        SUM(CASE WHEN whatsapp_welcome_sent = TRUE THEN 1 ELSE 0 END) as welcome_sent,
        SUM(CASE WHEN whatsapp_payment_sent = TRUE THEN 1 ELSE 0 END) as payment_sent,
        SUM(CASE WHEN whatsapp_reminder_sent = TRUE THEN 1 ELSE 0 END) as reminder_sent
      FROM registrations
    `
    console.log("✅ Registration WhatsApp sent counts retrieved successfully")
    const counts = result[0] || {}
    return [
      { message_type: "welcome", sent_count: Number(counts.welcome_sent || 0) },
      { message_type: "payment", sent_count: Number(counts.payment_sent || 0) },
      { message_type: "reminder", sent_count: Number(counts.reminder_sent || 0) },
    ].filter((item) => item.sent_count > 0) // Only return types that have been sent at least once
  } catch (error) {
    console.error("❌ Error getting registration WhatsApp sent counts:", error)

    // Check if columns don't exist
    if (error instanceof Error && error.message.includes("column") && error.message.includes("does not exist")) {
      console.log("📝 WhatsApp columns don't exist in registrations table yet - returning empty array")
      return []
    }

    return []
  }
}
