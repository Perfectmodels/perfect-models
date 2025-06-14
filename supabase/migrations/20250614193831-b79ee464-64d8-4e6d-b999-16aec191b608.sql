
-- Supprimer les anciennes politiques de sécurité restrictives
DROP POLICY IF EXISTS "Deny all public access to model_applications" ON public.model_applications;
DROP POLICY IF EXISTS "Deny all public access to model_events" ON public.model_events;
DROP POLICY IF EXISTS "Deny all public access to model_languages" ON public.model_languages;
DROP POLICY IF EXISTS "Deny all public access to model_skills" ON public.model_skills;

-- Créer de nouvelles politiques pour autoriser l'insertion publique des candidatures
CREATE POLICY "Allow public insert for model applications" ON public.model_applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert for model languages" ON public.model_languages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert for model skills" ON public.model_skills FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert for model events" ON public.model_events FOR INSERT TO anon WITH CHECK (true);
