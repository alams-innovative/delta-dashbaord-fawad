-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  heard_from VARCHAR(255),
  question TEXT,
  checkbox_field BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  whatsapp_welcome_sent BOOLEAN DEFAULT false,
  whatsapp_followup_sent BOOLEAN DEFAULT false,
  whatsapp_reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  father_name VARCHAR(255) NOT NULL,
  cnic VARCHAR(20),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  fee_paid DECIMAL(10,2) DEFAULT 0,
  fee_pending DECIMAL(10,2) DEFAULT 0,
  concession DECIMAL(10,2) DEFAULT 0,
  gender VARCHAR(10),
  picture_url TEXT,
  comments TEXT,
  whatsapp_welcome_sent BOOLEAN DEFAULT false,
  whatsapp_payment_sent BOOLEAN DEFAULT false,
  whatsapp_reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create influencers table
CREATE TABLE IF NOT EXISTS influencers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  youtube_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create meta_campaigns table
CREATE TABLE IF NOT EXISTS meta_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create google_campaigns table
CREATE TABLE IF NOT EXISTS google_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tiktok_campaigns table
CREATE TABLE IF NOT EXISTS tiktok_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create whatsapp_status table
CREATE TABLE IF NOT EXISTS whatsapp_status (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL, -- 'inquiry' or 'registration'
  entity_id INTEGER NOT NULL,
  message_type VARCHAR(50) NOT NULL, -- 'welcome', 'followup', 'reminder', 'payment'
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  phone VARCHAR(20) NOT NULL,
  message_content TEXT
);
