-- Disable RLS on all tables to allow anonymous access
-- Since we're not using traditional authentication, we need to allow
-- anonymous users to read and write data

-- Disable RLS on groups table
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;

-- Disable RLS on expenses table  
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;

-- Disable RLS on payments table
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- group_members already has RLS disabled from script 007

-- Note: This allows any user (including anonymous) to access all data
-- Security is now handled at the application level
