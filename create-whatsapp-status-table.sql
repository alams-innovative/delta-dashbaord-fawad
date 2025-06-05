-- Create WhatsApp status table to track sent messages
CREATE TABLE IF NOT EXISTS whatsapp_status (
  id SERIAL PRIMARY KEY,
  record_id INTEGER NOT NULL,
  record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('inquiry', 'registration')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('welcome', 'followup', 'reminder', 'payment')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(record_id, record_type, message_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_status_record ON whatsapp_status(record_id, record_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_status_phone ON whatsapp_status(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_status_message ON whatsapp_status(message_type);

-- Insert some sample data to test
INSERT INTO whatsapp_status (record_id, record_type, name, phone, message_type) VALUES
(1, 'inquiry', 'John Doe', '03001234567', 'welcome'),
(2, 'registration', 'Jane Smith', '03009876543', 'welcome'),
(2, 'registration', 'Jane Smith', '03009876543', 'payment');
