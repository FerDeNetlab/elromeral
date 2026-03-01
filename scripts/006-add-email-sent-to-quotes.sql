-- Add email_sent field to track if automatic emails have been sent
-- This prevents duplicate emails when updating existing quotes

ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS email_sent boolean DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN quotes.email_sent IS 'Indicates if automatic emails (client quote + admin alert) have been sent for this quote';

-- Create index for filtering quotes by email status
CREATE INDEX IF NOT EXISTS idx_quotes_email_sent ON quotes(email_sent);
