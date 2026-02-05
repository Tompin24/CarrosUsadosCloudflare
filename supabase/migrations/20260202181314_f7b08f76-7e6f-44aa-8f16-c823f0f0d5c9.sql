-- Add approval workflow to cars table
ALTER TABLE public.cars 
ADD COLUMN is_approved boolean DEFAULT false,
ADD COLUMN approved_by uuid REFERENCES auth.users(id),
ADD COLUMN approved_at timestamp with time zone;

-- Create stand_profiles table for branding
CREATE TABLE public.stand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  logo_url text,
  description text,
  primary_color text DEFAULT '#3b82f6',
  secondary_color text DEFAULT '#1e40af',
  phone text,
  email text,
  website text,
  address text,
  city text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on stand_profiles
ALTER TABLE public.stand_profiles ENABLE ROW LEVEL SECURITY;

-- Stand profiles are viewable by everyone (for branding on car pages)
CREATE POLICY "Stand profiles are viewable by everyone"
ON public.stand_profiles FOR SELECT
USING (true);

-- Users can insert their own stand profile
CREATE POLICY "Users can insert their own stand profile"
ON public.stand_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'stand'::app_role));

-- Users can update their own stand profile
CREATE POLICY "Users can update their own stand profile"
ON public.stand_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_stand_profiles_updated_at
BEFORE UPDATE ON public.stand_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update cars RLS policy for public viewing (only approved cars)
DROP POLICY IF EXISTS "Cars are viewable by everyone" ON public.cars;

CREATE POLICY "Approved cars are viewable by everyone"
ON public.cars FOR SELECT
USING (
  is_approved = true 
  OR auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add index for faster queries
CREATE INDEX idx_cars_is_approved ON public.cars(is_approved);
CREATE INDEX idx_cars_user_id ON public.cars(user_id);
CREATE INDEX idx_stand_profiles_user_id ON public.stand_profiles(user_id);