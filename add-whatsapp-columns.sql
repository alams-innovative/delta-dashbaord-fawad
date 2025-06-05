-- Add WhatsApp columns to inquiries table
ALTER TABLE inquiries 
ADD COLUMN IF NOT EXISTS whatsapp_welcome_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_followup_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_reminder_sent BOOLEAN DEFAULT FALSE;

-- Add WhatsApp columns to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS whatsapp_welcome_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_payment_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_reminder_sent BOOLEAN DEFAULT FALSE;
