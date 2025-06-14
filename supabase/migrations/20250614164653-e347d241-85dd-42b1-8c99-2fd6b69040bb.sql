
-- Enable Row Level Security (RLS) and add policies to protect sensitive tables

-- Protect admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deny all public access to admin_users"
ON public.admin_users
FOR ALL
USING (false);

-- Protect model_applications table
ALTER TABLE public.model_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deny all public access to model_applications"
ON public.model_applications
FOR ALL
USING (false);

-- Protect model_events table
ALTER TABLE public.model_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deny all public access to model_events"
ON public.model_events
FOR ALL
USING (false);

-- Protect model_languages table
ALTER TABLE public.model_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deny all public access to model_languages"
ON public.model_languages
FOR ALL
USING (false);

-- Protect model_skills table
ALTER TABLE public.model_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deny all public access to model_skills"
ON public.model_skills
FOR ALL
USING (false);

-- Protect classroom_content table
ALTER TABLE public.classroom_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to published classroom content"
ON public.classroom_content
FOR SELECT
USING (is_published = true);

-- Protect gallery_themes table
ALTER TABLE public.gallery_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to gallery_themes"
ON public.gallery_themes
FOR SELECT
USING (true);

-- Protect gallery_images table
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to gallery_images"
ON public.gallery_images
FOR SELECT
USING (true);

