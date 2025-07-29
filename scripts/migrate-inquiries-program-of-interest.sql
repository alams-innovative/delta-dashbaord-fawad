-- Set program_of_interest to 'MDCAT' for existing inquiries where it's null
UPDATE inquiries
SET program_of_interest = 'MDCAT'
WHERE program_of_interest IS NULL;
