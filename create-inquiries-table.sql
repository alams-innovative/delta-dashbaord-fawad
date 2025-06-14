-- Create inquiries table if it doesn't exist
CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    heard_from VARCHAR(255),
    question TEXT,
    checkbox_field BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    whatsapp_welcome_sent BOOLEAN DEFAULT FALSE,
    whatsapp_followup_sent BOOLEAN DEFAULT FALSE,
    whatsapp_reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample data if table is empty
INSERT INTO inquiries (name, phone, email, heard_from, question, is_read)
SELECT 'John Doe', '+1234567890', 'john@example.com', 'Website', 'Interested in MDCAT preparation', false
WHERE NOT EXISTS (SELECT 1 FROM inquiries LIMIT 1);

INSERT INTO inquiries (name, phone, email, heard_from, question, is_read)
SELECT 'Jane Smith', '+1234567891', 'jane@example.com', 'Facebook', 'Need information about fees', true
WHERE (SELECT COUNT(*) FROM inquiries) < 2;
