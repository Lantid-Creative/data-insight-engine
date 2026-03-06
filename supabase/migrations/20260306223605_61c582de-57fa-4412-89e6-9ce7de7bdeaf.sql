
-- Data Rooms
CREATE TABLE public.data_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  access_level text NOT NULL DEFAULT 'confidential',
  watermarking_enabled boolean DEFAULT true,
  encryption_enabled boolean DEFAULT true,
  ip_restrictions_enabled boolean DEFAULT false,
  two_factor_required boolean DEFAULT false,
  download_limits_enabled boolean DEFAULT false,
  access_expiration_enabled boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.data_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data rooms" ON public.data_rooms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own data rooms" ON public.data_rooms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data rooms" ON public.data_rooms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data rooms" ON public.data_rooms FOR DELETE USING (auth.uid() = user_id);

-- Data Room Members
CREATE TABLE public.data_room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.data_rooms(id) ON DELETE CASCADE,
  user_id uuid,
  email text NOT NULL,
  name text DEFAULT '',
  organization text DEFAULT '',
  role text NOT NULL DEFAULT 'viewer',
  invited_by uuid NOT NULL,
  accepted boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz DEFAULT now()
);

ALTER TABLE public.data_room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room owners can manage members" ON public.data_room_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.data_rooms WHERE id = room_id AND user_id = auth.uid())
);
CREATE POLICY "Members can view co-members" ON public.data_room_members FOR SELECT USING (user_id = auth.uid());

-- Now add shared room access policy
CREATE POLICY "Members can view shared rooms" ON public.data_rooms FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.data_room_members WHERE room_id = id AND user_id = auth.uid())
);

-- Data Room Files
CREATE TABLE public.data_room_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.data_rooms(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text DEFAULT '',
  file_size bigint DEFAULT 0,
  uploaded_by uuid NOT NULL,
  uploaded_by_name text DEFAULT '',
  view_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.data_room_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room owners can manage files" ON public.data_room_files FOR ALL USING (
  EXISTS (SELECT 1 FROM public.data_rooms WHERE id = room_id AND user_id = auth.uid())
);
CREATE POLICY "Room members can view files" ON public.data_room_files FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.data_room_members WHERE room_id = data_room_files.room_id AND user_id = auth.uid())
);

-- Data Room Activity
CREATE TABLE public.data_room_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.data_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text DEFAULT '',
  organization text DEFAULT '',
  action text NOT NULL,
  action_type text DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.data_room_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room owners can view activity" ON public.data_room_activity FOR ALL USING (
  EXISTS (SELECT 1 FROM public.data_rooms WHERE id = room_id AND user_id = auth.uid())
);
CREATE POLICY "Room members can view activity" ON public.data_room_activity FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.data_room_members WHERE room_id = data_room_activity.room_id AND user_id = auth.uid())
);
CREATE POLICY "Authenticated can insert activity" ON public.data_room_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pipelines
CREATE TABLE public.pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Untitled Pipeline',
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_run_at timestamptz,
  last_run_status text DEFAULT 'never',
  last_run_records integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pipelines" ON public.pipelines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pipelines" ON public.pipelines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pipelines" ON public.pipelines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pipelines" ON public.pipelines FOR DELETE USING (auth.uid() = user_id);

-- Regulatory Documents
CREATE TABLE public.regulatory_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  document_type text NOT NULL,
  template_id text DEFAULT '',
  status text NOT NULL DEFAULT 'ready',
  pages integer DEFAULT 0,
  sections jsonb DEFAULT '[]'::jsonb,
  study_name text DEFAULT '',
  study_description text DEFAULT '',
  target_agency text DEFAULT 'fda',
  compliance_checks jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.regulatory_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reg docs" ON public.regulatory_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reg docs" ON public.regulatory_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reg docs" ON public.regulatory_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reg docs" ON public.regulatory_documents FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for data room files
INSERT INTO storage.buckets (id, name, public) VALUES ('data-room-files', 'data-room-files', false);

-- Storage policies for data-room-files
CREATE POLICY "Auth users upload data room files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'data-room-files' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users view data room files" ON storage.objects FOR SELECT USING (bucket_id = 'data-room-files' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users delete data room files" ON storage.objects FOR DELETE USING (bucket_id = 'data-room-files' AND auth.role() = 'authenticated');

-- Storage policies for project-files bucket (for upload page)
CREATE POLICY "Auth upload project files storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');
CREATE POLICY "Auth view project files storage" ON storage.objects FOR SELECT USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete project files storage" ON storage.objects FOR DELETE USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');
