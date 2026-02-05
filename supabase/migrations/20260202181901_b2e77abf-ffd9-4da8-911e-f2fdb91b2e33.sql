-- Allow admins to update approval status on any car
DROP POLICY IF EXISTS "Users can update cars based on role" ON public.cars;

CREATE POLICY "Users can update cars based on role" 
ON public.cars FOR UPDATE
USING (
  -- Owner with vendor or stand role can update their own cars
  ((auth.uid() = user_id) AND (has_role(auth.uid(), 'vendor'::app_role) OR has_role(auth.uid(), 'stand'::app_role)))
  -- Admins can update any car (for approval)
  OR has_role(auth.uid(), 'admin'::app_role)
);