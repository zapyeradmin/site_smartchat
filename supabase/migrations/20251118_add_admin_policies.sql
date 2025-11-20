-- Admin override policies: permite que usuários com role 'admin' acessem e gerenciem todas as tabelas

-- Clients
CREATE POLICY IF NOT EXISTS "Admins can manage clients"
ON public.clients FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Deals
CREATE POLICY IF NOT EXISTS "Admins can manage deals"
ON public.deals FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tasks
CREATE POLICY IF NOT EXISTS "Admins can manage tasks"
ON public.tasks FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- News
CREATE POLICY IF NOT EXISTS "Admins can manage news"
ON public.news_admin FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Site settings
CREATE POLICY IF NOT EXISTS "Admins can manage settings"
ON public.site_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Integrations
CREATE POLICY IF NOT EXISTS "Admins can manage integrations"
ON public.integrations FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));