
-- Teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  email text NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  invited_by uuid,
  accepted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Project shares with granular permissions
CREATE TABLE public.project_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  shared_with_user_id uuid,
  shared_with_email text NOT NULL,
  shared_by uuid NOT NULL,
  can_view boolean NOT NULL DEFAULT true,
  can_upload boolean NOT NULL DEFAULT false,
  can_analyze boolean NOT NULL DEFAULT false,
  can_report boolean NOT NULL DEFAULT false,
  can_manage boolean NOT NULL DEFAULT false,
  accepted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, shared_with_email)
);

ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- API keys
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Default',
  key_prefix text NOT NULL,
  key_hash text NOT NULL,
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Activity log
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for teams
CREATE POLICY "Team owners and members can view team" ON public.teams
FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.team_members WHERE team_id = teams.id AND user_id = auth.uid() AND accepted = true)
);

CREATE POLICY "Authenticated users can create teams" ON public.teams
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update team" ON public.teams
FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Team owners can delete team" ON public.teams
FOR DELETE USING (owner_id = auth.uid());

-- RLS for team_members
CREATE POLICY "Team members can view members" ON public.team_members
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND owner_id = auth.uid())
);

CREATE POLICY "Team owners/admins can insert members" ON public.team_members
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid() AND tm.role = 'admin' AND tm.accepted = true)
);

CREATE POLICY "Team owners can update members" ON public.team_members
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND owner_id = auth.uid())
);

CREATE POLICY "Team owners can delete members" ON public.team_members
FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND owner_id = auth.uid())
);

-- RLS for project_shares
CREATE POLICY "Project owner can view shares" ON public.project_shares
FOR SELECT USING (
  shared_by = auth.uid() OR shared_with_user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_shares.project_id AND user_id = auth.uid())
);

CREATE POLICY "Project owner can create shares" ON public.project_shares
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_shares.project_id AND user_id = auth.uid())
);

CREATE POLICY "Project owner can update shares" ON public.project_shares
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_shares.project_id AND user_id = auth.uid())
);

CREATE POLICY "Project owner can delete shares" ON public.project_shares
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_shares.project_id AND user_id = auth.uid())
);

-- RLS for api_keys
CREATE POLICY "Users can view own API keys" ON public.api_keys
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys" ON public.api_keys
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON public.api_keys
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON public.api_keys
FOR DELETE USING (auth.uid() = user_id);

-- RLS for activity_log
CREATE POLICY "Users can view activity on own projects" ON public.activity_log
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.projects WHERE id = activity_log.project_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.project_shares WHERE project_id = activity_log.project_id AND shared_with_user_id = auth.uid() AND can_view = true)
);

CREATE POLICY "Authenticated users can insert activity" ON public.activity_log
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Also allow shared users to view projects they have access to
CREATE POLICY "Shared users can view shared projects" ON public.projects
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.project_shares WHERE project_id = projects.id AND shared_with_user_id = auth.uid() AND can_view = true AND accepted = true)
);

-- Allow shared users to view files on shared projects
CREATE POLICY "Shared users can view shared project files" ON public.project_files
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.project_shares WHERE project_id = project_files.project_id AND shared_with_user_id = auth.uid() AND can_view = true AND accepted = true)
);
