
-- Create forum-files storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('forum-files', 'forum-files', true);

-- Allow authenticated users to upload to forum-files bucket
CREATE POLICY "Authenticated users can upload forum files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'forum-files');

-- Allow public read access
CREATE POLICY "Public can read forum files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'forum-files');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own forum files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'forum-files' AND (storage.foldername(name))[1] = auth.uid()::text);
