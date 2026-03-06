
-- Allow all authenticated users to read profiles (needed for forum user display)
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- Create a function to handle @mention notifications
CREATE OR REPLACE FUNCTION public.notify_forum_mentions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  mentioned_name text;
  mentioned_profile record;
  post_title text;
  source_content text;
  link_path text;
BEGIN
  -- Extract content based on table
  IF TG_TABLE_NAME = 'forum_posts' THEN
    source_content := NEW.content;
    post_title := NEW.title;
    link_path := '/dashboard/community';
  ELSIF TG_TABLE_NAME = 'forum_replies' THEN
    source_content := NEW.content;
    SELECT title INTO post_title FROM public.forum_posts WHERE id = NEW.post_id;
    link_path := '/dashboard/community';
  END IF;

  -- Find all @mentions (matches @"Full Name" or @username-style)
  FOR mentioned_name IN
    SELECT DISTINCT trim(m[1]) FROM regexp_matches(source_content, '@([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ ]{1,50}?)(?=[\s,.\!?\)]|$)', 'g') AS m
  LOOP
    -- Look up the profile by full_name (case-insensitive)
    SELECT * INTO mentioned_profile FROM public.profiles
    WHERE lower(full_name) = lower(mentioned_name)
    LIMIT 1;

    IF mentioned_profile IS NOT NULL AND mentioned_profile.user_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
      VALUES (
        mentioned_profile.user_id,
        'activity',
        'You were mentioned',
        'You were mentioned in "' || COALESCE(post_title, 'a post') || '"',
        link_path,
        jsonb_build_object('mentioned_by', NEW.user_id)
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Attach triggers
CREATE TRIGGER on_forum_post_mention
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.notify_forum_mentions();

CREATE TRIGGER on_forum_reply_mention
  AFTER INSERT ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.notify_forum_mentions();
