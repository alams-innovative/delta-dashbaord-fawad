-- Create WhatsApp messages tracking table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id SERIAL PRIMARY KEY,
  record_id INTEGER NOT NULL,
  record_type VARCHAR(20) NOT NULL, -- 'inquiry' or 'registration'
  message_type VARCHAR(20) NOT NULL, -- 'welcome', 'followup', 'reminder', 'payment'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_record ON whatsapp_messages(record_id, record_type, message_type);
