
-- Create artifacts table for AI-generated interactive content
CREATE TABLE public.artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  chat_message_id uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'Untitled Artifact',
  description text DEFAULT '',
  artifact_type text NOT NULL DEFAULT 'document',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_pinned boolean NOT NULL DEFAULT false,
  shared boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own artifacts" ON public.artifacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared artifacts" ON public.artifacts
  FOR SELECT USING (shared = true AND has_project_share(auth.uid(), project_id));

CREATE POLICY "Users can create own artifacts" ON public.artifacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own artifacts" ON public.artifacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own artifacts" ON public.artifacts
  FOR DELETE USING (auth.uid() = user_id);
