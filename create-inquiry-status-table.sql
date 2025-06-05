CREATE TABLE IF NOT EXISTS inquiry_status (
  id SERIAL PRIMARY KEY,
  inquiry_id INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  comments TEXT,
  updated_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_inquiry_status_inquiry_id ON inquiry_status(inquiry_id);
