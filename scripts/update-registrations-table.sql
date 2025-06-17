-- Add new fields to registrations table for enhanced receipt functionality
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS internal_system_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS academic_session VARCHAR(100) DEFAULT 'ACADEMIC SESSION 2025 (ACS25)',
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'PAKISTAN',
ADD COLUMN IF NOT EXISTS pending_payment_due_date DATE,
ADD COLUMN IF NOT EXISTS receipt_notes TEXT;

-- Update existing records with default values
UPDATE registrations 
SET 
  internal_system_code = 'SYS-' || LPAD(id::text, 4, '0'),
  payment_method = 'cash',
  academic_session = 'ACADEMIC SESSION 2025 (ACS25)',
  address = 'PAKISTAN'
WHERE internal_system_code IS NULL;
