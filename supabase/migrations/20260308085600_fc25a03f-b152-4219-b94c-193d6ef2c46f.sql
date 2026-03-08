
-- Prompt library table
CREATE TABLE public.prompt_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- NULL for curated/platform prompts
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  prompt_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT 'sparkles',
  is_curated BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prompt_library ENABLE ROW LEVEL SECURITY;

-- Everyone can view curated prompts
CREATE POLICY "Anyone can view curated prompts"
ON public.prompt_library FOR SELECT TO authenticated
USING (is_curated = true);

-- Users can view own custom prompts
CREATE POLICY "Users can view own prompts"
ON public.prompt_library FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Users can create own prompts
CREATE POLICY "Users can create own prompts"
ON public.prompt_library FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND is_curated = false);

-- Users can update own prompts
CREATE POLICY "Users can update own prompts"
ON public.prompt_library FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Users can delete own prompts
CREATE POLICY "Users can delete own prompts"
ON public.prompt_library FOR DELETE TO authenticated
USING (auth.uid() = user_id AND is_curated = false);
