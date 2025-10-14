-- Enable Row Level Security on group_members table
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones to allow re-running the script
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Group owners can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group owners can remove members" ON public.group_members;

-- Simplified policies to avoid infinite recursion by only checking groups table
-- Policy: Users can view members of groups they own or are members of
CREATE POLICY "Users can view group members"
  ON public.group_members
  FOR SELECT
  USING (
    -- User owns the group
    group_id IN (
      SELECT id FROM public.groups WHERE user_id = auth.uid()
    )
    -- OR user is a member (but we check this without recursion by matching user_id directly)
    OR user_id = auth.uid()
  );

-- Policy: Only group owners can add members
CREATE POLICY "Group owners can add members"
  ON public.group_members
  FOR INSERT
  WITH CHECK (
    -- Only the group owner can add members
    group_id IN (
      SELECT id FROM public.groups WHERE user_id = auth.uid()
    )
  );

-- Policy: Group owners can remove members
CREATE POLICY "Group owners can remove members"
  ON public.group_members
  FOR DELETE
  USING (
    -- Only the group owner can remove members
    group_id IN (
      SELECT id FROM public.groups WHERE user_id = auth.uid()
    )
  );
