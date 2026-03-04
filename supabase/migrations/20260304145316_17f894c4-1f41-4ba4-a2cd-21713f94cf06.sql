
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  team_invite_inapp boolean NOT NULL DEFAULT true,
  team_invite_email boolean NOT NULL DEFAULT true,
  team_invite_toast boolean NOT NULL DEFAULT true,
  project_share_inapp boolean NOT NULL DEFAULT true,
  project_share_email boolean NOT NULL DEFAULT true,
  project_share_toast boolean NOT NULL DEFAULT true,
  activity_inapp boolean NOT NULL DEFAULT true,
  activity_email boolean NOT NULL DEFAULT false,
  activity_toast boolean NOT NULL DEFAULT true,
  billing_inapp boolean NOT NULL DEFAULT true,
  billing_email boolean NOT NULL DEFAULT true,
  billing_toast boolean NOT NULL DEFAULT true,
  security_inapp boolean NOT NULL DEFAULT true,
  security_email boolean NOT NULL DEFAULT true,
  security_toast boolean NOT NULL DEFAULT true,
  system_inapp boolean NOT NULL DEFAULT true,
  system_email boolean NOT NULL DEFAULT false,
  system_toast boolean NOT NULL DEFAULT true,
  quiet_hours_enabled boolean NOT NULL DEFAULT false,
  quiet_hours_start time NOT NULL DEFAULT '22:00',
  quiet_hours_end time NOT NULL DEFAULT '08:00',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
