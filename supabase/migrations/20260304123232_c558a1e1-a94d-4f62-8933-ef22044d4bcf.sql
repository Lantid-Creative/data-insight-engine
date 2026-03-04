
-- Create security definer functions to break circular RLS references

-- Check if user owns a project (breaks projects <-> project_shares cycle)
CREATE OR REPLACE FUNCTION public.is_project_owner(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = _project_id AND user_id = _user_id
  )
$$;

-- Check if user has a share on a project (breaks projects <-> project_shares cycle)
CREATE OR REPLACE FUNCTION public.has_project_share(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_shares
    WHERE project_id = _project_id
      AND shared_with_user_id = _user_id
      AND can_view = true
      AND accepted = true
  )
$$;

-- Check if user is team owner (breaks teams <-> team_members cycle)
CREATE OR REPLACE FUNCTION public.is_team_owner(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = _team_id AND owner_id = _user_id
  )
$$;

-- Check if user is accepted team member (breaks teams <-> team_members cycle)
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id AND user_id = _user_id AND accepted = true
  )
$$;

-- Check if user is team admin
CREATE OR REPLACE FUNCTION public.is_team_admin(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id AND user_id = _user_id AND role = 'admin' AND accepted = true
  )
$$;

-- ===== Fix projects SELECT policies =====
DROP POLICY IF EXISTS "Shared users can view shared projects" ON public.projects;
CREATE POLICY "Shared users can view shared projects"
  ON public.projects FOR SELECT TO authenticated
  USING (public.has_project_share(auth.uid(), id));

-- ===== Fix project_shares policies =====
DROP POLICY IF EXISTS "Project owner can create shares" ON public.project_shares;
CREATE POLICY "Project owner can create shares"
  ON public.project_shares FOR INSERT TO authenticated
  WITH CHECK (public.is_project_owner(auth.uid(), project_id));

DROP POLICY IF EXISTS "Project owner can delete shares" ON public.project_shares;
CREATE POLICY "Project owner can delete shares"
  ON public.project_shares FOR DELETE TO authenticated
  USING (public.is_project_owner(auth.uid(), project_id));

DROP POLICY IF EXISTS "Project owner can update shares" ON public.project_shares;
CREATE POLICY "Project owner can update shares"
  ON public.project_shares FOR UPDATE TO authenticated
  USING (public.is_project_owner(auth.uid(), project_id));

DROP POLICY IF EXISTS "Project owner can view shares" ON public.project_shares;
CREATE POLICY "Project owner can view shares"
  ON public.project_shares FOR SELECT TO authenticated
  USING (
    shared_by = auth.uid()
    OR shared_with_user_id = auth.uid()
    OR public.is_project_owner(auth.uid(), project_id)
  );

-- ===== Fix project_files shared SELECT policy =====
DROP POLICY IF EXISTS "Shared users can view shared project files" ON public.project_files;
CREATE POLICY "Shared users can view shared project files"
  ON public.project_files FOR SELECT TO authenticated
  USING (public.has_project_share(auth.uid(), project_id));

-- ===== Fix activity_log SELECT policy =====
DROP POLICY IF EXISTS "Users can view activity on own projects" ON public.activity_log;
CREATE POLICY "Users can view activity on own projects"
  ON public.activity_log FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_project_owner(auth.uid(), project_id)
    OR public.has_project_share(auth.uid(), project_id)
  );

-- ===== Fix teams SELECT policy =====
DROP POLICY IF EXISTS "Team owners and members can view team" ON public.teams;
CREATE POLICY "Team owners and members can view team"
  ON public.teams FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.is_team_member(auth.uid(), id)
  );

-- ===== Fix team_members policies =====
DROP POLICY IF EXISTS "Team members can view members" ON public.team_members;
CREATE POLICY "Team members can view members"
  ON public.team_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_team_owner(auth.uid(), team_id)
    OR public.is_team_member(auth.uid(), team_id)
  );

DROP POLICY IF EXISTS "Team owners can delete members" ON public.team_members;
CREATE POLICY "Team owners can delete members"
  ON public.team_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_team_owner(auth.uid(), team_id)
  );

DROP POLICY IF EXISTS "Team owners can update members" ON public.team_members;
CREATE POLICY "Team owners can update members"
  ON public.team_members FOR UPDATE TO authenticated
  USING (public.is_team_owner(auth.uid(), team_id));

DROP POLICY IF EXISTS "Team owners/admins can insert members" ON public.team_members;
CREATE POLICY "Team owners/admins can insert members"
  ON public.team_members FOR INSERT TO authenticated
  WITH CHECK (
    public.is_team_owner(auth.uid(), team_id)
    OR public.is_team_admin(auth.uid(), team_id)
  );
