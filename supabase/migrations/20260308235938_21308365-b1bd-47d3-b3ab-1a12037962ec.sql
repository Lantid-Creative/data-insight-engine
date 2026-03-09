-- Create Enum for staff roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.hms_staff_role AS ENUM ('hospital_admin', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'receptionist', 'biller');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Hospitals table
CREATE TABLE public.hms_hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    registration_number TEXT,
    capacity INTEGER,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    owner_id UUID REFERENCES auth.users(id) -- The user who registered the hospital
);

-- Departments table
CREATE TABLE public.hms_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hms_hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Staff table
CREATE TABLE public.hms_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hms_hospitals(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.hms_departments(id) ON DELETE SET NULL,
    role public.hms_staff_role NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    staff_id_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, hospital_id)
);

-- Enable RLS
ALTER TABLE public.hms_hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hms_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hms_staff ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_hospital_admin(_user_id uuid, _hospital_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hms_staff
    WHERE user_id = _user_id AND hospital_id = _hospital_id AND role = 'hospital_admin'
  ) OR EXISTS (
    SELECT 1 FROM public.hms_hospitals
    WHERE id = _hospital_id AND owner_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_hospital_staff(_user_id uuid, _hospital_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hms_staff
    WHERE user_id = _user_id AND hospital_id = _hospital_id AND is_active = true
  )
$$;

-- RLS Policies for hms_hospitals
CREATE POLICY "Hospital admins can manage their hospitals"
ON public.hms_hospitals FOR ALL
USING (is_hospital_admin(auth.uid(), id));

CREATE POLICY "Hospital staff can view their hospitals"
ON public.hms_hospitals FOR SELECT
USING (is_hospital_staff(auth.uid(), id));

CREATE POLICY "Any authenticated user can register a hospital"
ON public.hms_hospitals FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for hms_departments
CREATE POLICY "Hospital admins can manage departments"
ON public.hms_departments FOR ALL
USING (is_hospital_admin(auth.uid(), hospital_id));

CREATE POLICY "Hospital staff can view departments"
ON public.hms_departments FOR SELECT
USING (is_hospital_staff(auth.uid(), hospital_id));

-- RLS Policies for hms_staff
CREATE POLICY "Hospital admins can manage staff"
ON public.hms_staff FOR ALL
USING (is_hospital_admin(auth.uid(), hospital_id));

CREATE POLICY "Staff can view other staff in same hospital"
ON public.hms_staff FOR SELECT
USING (is_hospital_staff(auth.uid(), hospital_id));

CREATE POLICY "Users can create their initial staff profile"
ON public.hms_staff FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_hms_hospitals_updated_at
BEFORE UPDATE ON public.hms_hospitals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hms_staff_updated_at
BEFORE UPDATE ON public.hms_staff
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();