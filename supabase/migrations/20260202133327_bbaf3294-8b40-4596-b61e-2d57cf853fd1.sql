-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, car_id)
);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for favorites
CREATE POLICY "Users can view their own favorites"
ON public.favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
ON public.favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
ON public.favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('car-images', 'car-images', true, 512000);

-- Storage policies for car images
CREATE POLICY "Car images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'car-images');

CREATE POLICY "Users can upload car images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'car-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their car images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'car-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their car images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'car-images' AND auth.uid() IS NOT NULL);