-- Remove NOT NULL constraint and foreign key from user_id columns
-- This allows the app to work without authentication

-- Drop foreign key constraints
ALTER TABLE public.groups DROP CONSTRAINT IF EXISTS groups_user_id_fkey;
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;

-- Make user_id nullable
ALTER TABLE public.groups ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.expenses ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.payments ALTER COLUMN user_id DROP NOT NULL;

-- Drop indexes on user_id since we're not using authentication
DROP INDEX IF EXISTS idx_groups_user_id;
DROP INDEX IF EXISTS idx_expenses_user_id;
DROP INDEX IF EXISTS idx_payments_user_id;
