-- Create WhatsApp messages tracking table (updated version)
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

-- Insert some sample data to test the functionality
INSERT INTO whatsapp_messages (record_id, record_type, message_type) VALUES
(1, 'inquiry', 'welcome'),
(2, 'inquiry', 'followup'),
(1, 'registration', 'welcome'),
(2, 'registration', 'payment'),
(3, 'inquiry', 'reminder');
