-- Disable RLS on group_members table to avoid infinite recursion
-- This is a temporary solution until we can implement proper non-recursive policies

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can add members" ON public.group_members;
DROP POLICY IF EXISTS "Users can update members" ON public.group_members;
DROP POLICY IF EXISTS "Users can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Group owners can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Group owners can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group owners can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Authenticated users can view members" ON public.group_members;
DROP POLICY IF EXISTS "Authenticated users can add members" ON public.group_members;

-- Drop the helper function if it exists
DROP FUNCTION IF EXISTS public.is_group_owner(uuid);

-- Disable RLS on group_members table
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;

-- Note: This means any authenticated user can read/write group_members
-- We rely on application-level security for now
-- TODO: Re-enable RLS with proper non-recursive policies later
