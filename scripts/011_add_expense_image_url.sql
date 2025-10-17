-- Add image_url column to expenses table for photo attachments
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create a storage bucket for expense images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-images', 'expense-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes" ON storage.objects;

-- Allow public access to read images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'expense-images');

-- Allow anyone to upload images (since we don't use auth)
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'expense-images');

-- Allow anyone to delete images
CREATE POLICY "Allow deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'expense-images');
