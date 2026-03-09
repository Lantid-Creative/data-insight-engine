
ALTER TABLE public.hms_hospitals
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS about text,
  ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#2563eb',
  ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE,
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS phone text;

-- Allow public (unauthenticated) access to view public hospitals by slug/domain
CREATE POLICY "Anyone can view public hospitals by slug"
  ON public.hms_hospitals
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- Allow public view of departments for public hospitals
CREATE POLICY "Anyone can view departments of public hospitals"
  ON public.hms_departments
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.hms_hospitals h
      WHERE h.id = hospital_id AND h.is_public = true
    )
  );
