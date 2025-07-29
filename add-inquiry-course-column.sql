ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS course VARCHAR(255) DEFAULT 'MDCAT';

-- Update existing inquiries to 'MDCAT' if their course is null or not set
UPDATE inquiries
SET course = 'MDCAT'
WHERE course IS NULL OR course = '';
