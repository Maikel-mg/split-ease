-- Drop all existing policies on group_members
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Group owners can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group owners can remove members" ON public.group_members;

-- Create a security definer function to check if user owns a group
-- This function runs with the privileges of the function owner, bypassing RLS
CREATE OR REPLACE FUNCTION public.user_owns_group(group_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = group_uuid AND user_id = auth.uid()
  );
$$;

-- Simplified RLS policies using the security definer function
-- This avoids infinite recursion by not querying group_members within its own policies

CREATE POLICY "Users can view group members"
  ON public.group_members
  FOR SELECT
  USING (
    -- User owns the group (checked via security definer function)
    public.user_owns_group(group_id)
    -- OR it's their own member record
    OR user_id = auth.uid()
  );

CREATE POLICY "Group owners can add members"
  ON public.group_members
  FOR INSERT
  WITH CHECK (
    -- Only the group owner can add members
    public.user_owns_group(group_id)
  );

CREATE POLICY "Group owners can update members"
  ON public.group_members
  FOR UPDATE
  USING (
    public.user_owns_group(group_id)
  );

CREATE POLICY "Group owners can remove members"
  ON public.group_members
  FOR DELETE
  USING (
    -- Only the group owner can remove members
    public.user_owns_group(group_id)
  );
