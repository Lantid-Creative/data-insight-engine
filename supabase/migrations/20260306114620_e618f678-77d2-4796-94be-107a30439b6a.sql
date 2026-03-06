
-- Add bio and expertise_tags to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expertise_tags text[] DEFAULT '{}';

-- Forum channels
CREATE TABLE public.forum_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  slug text NOT NULL UNIQUE,
  icon text DEFAULT 'hash',
  created_by uuid NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view channels" ON public.forum_channels
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage channels" ON public.forum_channels
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create channels" ON public.forum_channels
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Forum posts
CREATE TABLE public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.forum_channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  is_pinned boolean DEFAULT false,
  is_announcement boolean DEFAULT false,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view posts" ON public.forum_posts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create own posts" ON public.forum_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.forum_posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own posts" ON public.forum_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Forum replies
CREATE TABLE public.forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL DEFAULT '',
  file_url text,
  parent_reply_id uuid REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view replies" ON public.forum_replies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create own replies" ON public.forum_replies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies" ON public.forum_replies
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies" ON public.forum_replies
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Forum reactions
CREATE TABLE public.forum_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  emoji text NOT NULL DEFAULT '👍',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, emoji),
  UNIQUE(reply_id, user_id, emoji)
);

ALTER TABLE public.forum_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view reactions" ON public.forum_reactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create own reactions" ON public.forum_reactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions" ON public.forum_reactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_replies;

-- Seed default channels
INSERT INTO public.forum_channels (name, slug, description, icon, created_by, is_default) VALUES
  ('General', 'general', 'Open discussion for the community', 'hash', '00000000-0000-0000-0000-000000000000', true),
  ('Data Insights', 'data-insights', 'Share and discuss data analysis findings', 'sparkles', '00000000-0000-0000-0000-000000000000', true),
  ('Help & Support', 'help-support', 'Ask questions and get help from the community', 'help-circle', '00000000-0000-0000-0000-000000000000', true),
  ('Announcements', 'announcements', 'Official platform updates and news', 'megaphone', '00000000-0000-0000-0000-000000000000', true);

-- Trigger to update updated_at on posts
CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
