
-- Add missing columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT,
ADD COLUMN location TEXT,
ADD COLUMN years_of_experience TEXT,
ADD COLUMN availability_status TEXT,
ADD COLUMN resume_url TEXT,
ADD COLUMN website_url TEXT;
