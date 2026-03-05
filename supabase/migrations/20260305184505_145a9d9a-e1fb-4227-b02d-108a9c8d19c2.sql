
-- Epidemic Intel tables
CREATE TABLE public.epidemic_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  description text,
  region text NOT NULL,
  disease_category text DEFAULT 'general',
  case_count integer DEFAULT 0,
  change_percent numeric DEFAULT 0,
  source text DEFAULT 'AI Analysis',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE public.epidemic_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Epidemic Intelligence Report',
  report_type text NOT NULL DEFAULT 'surveillance',
  summary text,
  full_analysis text,
  regions jsonb DEFAULT '[]'::jsonb,
  disease_data jsonb DEFAULT '[]'::jsonb,
  trend_data jsonb DEFAULT '[]'::jsonb,
  alert_count integer DEFAULT 0,
  total_cases integer DEFAULT 0,
  time_range text DEFAULT '6m',
  disease_filter text DEFAULT 'all',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.epidemic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epidemic_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON public.epidemic_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.epidemic_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.epidemic_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON public.epidemic_alerts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reports" ON public.epidemic_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON public.epidemic_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON public.epidemic_reports FOR DELETE USING (auth.uid() = user_id);
