-- Add gender column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE inquiries ADD COLUMN gender VARCHAR(50);
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column gender already exists in inquiries.';
END $$;

-- Add matric_marks column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE inquiries ADD COLUMN matric_marks INTEGER;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column matric_marks already exists in inquiries.';
END $$;

-- Add out_of_marks column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE inquiries ADD COLUMN out_of_marks INTEGER;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column out_of_marks already exists in inquiries.';
END $$;

-- Add intermediate_stream column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE inquiries ADD COLUMN intermediate_stream VARCHAR(255);
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column intermediate_stream already exists in inquiries.';
END $$;
