
-- Redaction jobs table
CREATE TABLE public.redaction_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_size bigint DEFAULT 0,
  original_text text NOT NULL,
  redacted_text text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'complete', 'failed')),
  entity_count integer DEFAULT 0,
  avg_confidence numeric(5,2) DEFAULT 0,
  specialty text DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.redaction_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redaction jobs" ON public.redaction_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own redaction jobs" ON public.redaction_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own redaction jobs" ON public.redaction_jobs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own redaction jobs" ON public.redaction_jobs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Detected PHI entities per job
CREATE TABLE public.redaction_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.redaction_jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  entity_type text NOT NULL,
  original_value text NOT NULL,
  redacted_value text NOT NULL,
  confidence numeric(5,2) NOT NULL DEFAULT 0,
  start_index integer DEFAULT 0,
  end_index integer DEFAULT 0,
  is_redacted boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.redaction_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entities" ON public.redaction_entities FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entities" ON public.redaction_entities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entities" ON public.redaction_entities FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entities" ON public.redaction_entities FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Audit trail for redaction actions
CREATE TABLE public.redaction_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES public.redaction_jobs(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.redaction_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON public.redaction_audit_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit logs" ON public.redaction_audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
