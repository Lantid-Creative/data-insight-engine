
-- Allow admins to view all projects for moderation
CREATE POLICY "Admins can delete any project"
  ON public.projects FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any project
CREATE POLICY "Admins can update any project"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all activity logs
CREATE POLICY "Admins can view all activity"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all project files
CREATE POLICY "Admins can view all project files"
  ON public.project_files FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all teams
CREATE POLICY "Admins can view all teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all notifications (for moderation)
CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
