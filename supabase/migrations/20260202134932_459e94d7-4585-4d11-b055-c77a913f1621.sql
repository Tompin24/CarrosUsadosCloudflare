-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'vendor', 'stand');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles table
-- Users can view their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage all roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Update cars table policies to allow vendor and stand roles
DROP POLICY IF EXISTS "Users can insert their own cars" ON public.cars;
DROP POLICY IF EXISTS "Users can update their own cars" ON public.cars;
DROP POLICY IF EXISTS "Users can delete their own cars" ON public.cars;

-- Vendors and Stands can insert cars
CREATE POLICY "Vendors and Stands can insert cars"
ON public.cars
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    public.has_role(auth.uid(), 'vendor') OR 
    public.has_role(auth.uid(), 'stand') OR
    public.has_role(auth.uid(), 'admin')
  )
);

-- Vendors can update their own cars, Stands and Admins can update any
CREATE POLICY "Users can update cars based on role"
ON public.cars
FOR UPDATE
USING (
  (auth.uid() = user_id AND (public.has_role(auth.uid(), 'vendor') OR public.has_role(auth.uid(), 'stand'))) OR
  public.has_role(auth.uid(), 'admin')
);

-- Stands and Admins can delete cars
CREATE POLICY "Stands and Admins can delete cars"
ON public.cars
FOR DELETE
USING (
  (auth.uid() = user_id AND public.has_role(auth.uid(), 'stand')) OR
  public.has_role(auth.uid(), 'admin')
);