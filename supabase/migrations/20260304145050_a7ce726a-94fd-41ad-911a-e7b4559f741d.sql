
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, read, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function to auto-create notifications for team member inserts
CREATE OR REPLACE FUNCTION public.notify_team_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _team_name text;
BEGIN
  SELECT name INTO _team_name FROM public.teams WHERE id = NEW.team_id;
  
  -- Notify the invited user (if they have an account)
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.user_id,
      'team_invite',
      'Team Invitation',
      'You have been invited to join ' || COALESCE(_team_name, 'a team'),
      '/dashboard/teams',
      jsonb_build_object('team_id', NEW.team_id, 'team_name', _team_name)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_team_invite
  AFTER INSERT ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_team_invite();

-- Trigger function to auto-create notifications for project shares
CREATE OR REPLACE FUNCTION public.notify_project_share()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _project_name text;
  _sharer_email text;
BEGIN
  SELECT name INTO _project_name FROM public.projects WHERE id = NEW.project_id;
  SELECT email INTO _sharer_email FROM auth.users WHERE id = NEW.shared_by;

  IF NEW.shared_with_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.shared_with_user_id,
      'project_share',
      'Project Shared With You',
      COALESCE(_sharer_email, 'Someone') || ' shared "' || COALESCE(_project_name, 'a project') || '" with you',
      '/dashboard/projects/' || NEW.project_id,
      jsonb_build_object('project_id', NEW.project_id, 'project_name', _project_name)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_project_share
  AFTER INSERT ON public.project_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_project_share();

-- Trigger for activity log events to notify project owner
CREATE OR REPLACE FUNCTION public.notify_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _project_owner uuid;
  _project_name text;
  _action_label text;
BEGIN
  -- Only notify if there's a project and the actor is not the owner
  IF NEW.project_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT user_id, name INTO _project_owner, _project_name
  FROM public.projects WHERE id = NEW.project_id;

  IF _project_owner IS NULL OR _project_owner = NEW.user_id THEN
    RETURN NEW;
  END IF;

  _action_label := replace(NEW.action, '_', ' ');

  INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
  VALUES (
    _project_owner,
    'activity',
    initcap(_action_label),
    'Activity on "' || COALESCE(_project_name, 'your project') || '": ' || _action_label,
    '/dashboard/projects/' || NEW.project_id,
    jsonb_build_object('project_id', NEW.project_id, 'action', NEW.action)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_activity
  AFTER INSERT ON public.activity_log
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_activity();
