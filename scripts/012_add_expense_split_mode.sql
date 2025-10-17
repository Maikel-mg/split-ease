-- Add split mode and split data columns to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS split_mode TEXT DEFAULT 'equally';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS split_data JSONB;

-- Update existing expenses to have split_mode = 'equally'
UPDATE expenses SET split_mode = 'equally' WHERE split_mode IS NULL;
