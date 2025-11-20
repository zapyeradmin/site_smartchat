-- Full schema and test data for Zapyer Hub
-- Safe to run multiple times: uses IF NOT EXISTS and idempotent policies

BEGIN;

-- Ensure required extension for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enum for application roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: deals
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  value DECIMAL(10,2),
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  expected_close_date DATE,
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: news_admin
CREATE TABLE IF NOT EXISTS public.news_admin (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT DEFAULT 'geral',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: integrations
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('api', 'webhook', 'oauth')),
  config JSONB,
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RBAC: user_roles + has_role
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.app_role NOT NULL
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _user_id AND ur.role = _role
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Base policies (authenticated manage)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can manage clients" ON public.clients;
CREATE POLICY "Authenticated users can manage clients" ON public.clients FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can manage deals" ON public.deals;
CREATE POLICY "Authenticated users can manage deals" ON public.deals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage deals" ON public.deals FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can manage tasks" ON public.tasks;
CREATE POLICY "Authenticated users can manage tasks" ON public.tasks FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can manage news" ON public.news_admin;
CREATE POLICY "Authenticated users can manage news" ON public.news_admin FOR ALL USING (auth.role() = 'authenticated');
-- Public read-only access for published news
DROP POLICY IF EXISTS "Public can read published news" ON public.news_admin;
CREATE POLICY "Public can read published news" ON public.news_admin FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON public.site_settings;
CREATE POLICY "Authenticated users can manage settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can manage integrations" ON public.integrations;
CREATE POLICY "Authenticated users can manage integrations" ON public.integrations FOR ALL USING (auth.role() = 'authenticated');

-- Admin override policies using has_role
DROP POLICY IF EXISTS "Admins can manage clients" ON public.clients;
CREATE POLICY "Admins can manage clients" ON public.clients FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can manage deals" ON public.deals;
CREATE POLICY "Admins can manage deals" ON public.deals FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can manage tasks" ON public.tasks;
CREATE POLICY "Admins can manage tasks" ON public.tasks FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can manage news" ON public.news_admin;
CREATE POLICY "Admins can manage news" ON public.news_admin FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can manage integrations" ON public.integrations;
CREATE POLICY "Admins can manage integrations" ON public.integrations FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies for user_roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers update_updated_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    DROP TRIGGER update_profiles_updated_at ON public.profiles;
  END IF;
END $$;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at') THEN
    DROP TRIGGER update_clients_updated_at ON public.clients;
  END IF;
END $$;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_deals_updated_at') THEN
    DROP TRIGGER update_deals_updated_at ON public.deals;
  END IF;
END $$;
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tasks_updated_at') THEN
    DROP TRIGGER update_tasks_updated_at ON public.tasks;
  END IF;
END $$;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_news_admin_updated_at') THEN
    DROP TRIGGER update_news_admin_updated_at ON public.news_admin;
  END IF;
END $$;
CREATE TRIGGER update_news_admin_updated_at BEFORE UPDATE ON public.news_admin FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_site_settings_updated_at') THEN
    DROP TRIGGER update_site_settings_updated_at ON public.site_settings;
  END IF;
END $$;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_integrations_updated_at') THEN
    DROP TRIGGER update_integrations_updated_at ON public.integrations;
  END IF;
END $$;
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Handle new user -> create profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
END $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Default site settings (idempotent)
INSERT INTO public.site_settings (key, value, description)
VALUES
('site_title', '"Zapyer Hub"', 'Título principal do site'),
('site_description', '"Plataforma de automação e integração"', 'Descrição do site'),
('primary_color', '"#3b82f6"', 'Cor primária do site'),
('secondary_color', '"#1e40af"', 'Cor secundária do site'),
('logo_url', '""', 'URL do logo principal'),
('contact_email', '"contato@zapyerhub.com"', 'Email de contato'),
('contact_phone', '""', 'Telefone de contato')
ON CONFLICT (key) DO NOTHING;

-- Seed test data
WITH admin_user AS (
  SELECT id AS user_id FROM auth.users ORDER BY created_at DESC LIMIT 1
),
ins_clients AS (
  INSERT INTO public.clients (name, email, phone, company, notes, status, created_by)
  VALUES
  ('Cliente Teste 1', 'cliente1@teste.com', '+55 11 99999-0001', 'Empresa Teste A', 'Primeiro cliente de teste', 'active', (SELECT user_id FROM admin_user)),
  ('Cliente Teste 2', 'cliente2@teste.com', '+55 21 99999-0002', 'Empresa Teste B', 'Segundo cliente de teste', 'prospect', (SELECT user_id FROM admin_user)),
  ('Cliente Teste 3', 'cliente3@teste.com', '+55 31 99999-0003', 'Empresa Teste C', 'Terceiro cliente de teste', 'inactive', (SELECT user_id FROM admin_user))
  RETURNING id
),
ins_deals AS (
  INSERT INTO public.deals (title, description, value, stage, client_id, assigned_to, expected_close_date, probability)
  SELECT * FROM (
    VALUES
    ('Negócio Teste 1', 'Primeiro negócio de teste', 1000.00, 'lead', (SELECT id FROM ins_clients LIMIT 1), (SELECT user_id FROM admin_user), CURRENT_DATE + 7, 30),
    ('Negócio Teste 2', 'Segundo negócio de teste', 2500.50, 'proposal', (SELECT id FROM ins_clients OFFSET 1 LIMIT 1), (SELECT user_id FROM admin_user), CURRENT_DATE + 14, 60),
    ('Negócio Teste 3', 'Terceiro negócio de teste', 500.00, 'negotiation', (SELECT id FROM ins_clients OFFSET 2 LIMIT 1), (SELECT user_id FROM admin_user), CURRENT_DATE + 21, 45)
  ) AS t(title, description, value, stage, client_id, assigned_to, expected_close_date, probability)
  RETURNING id, client_id
),
ins_tasks AS (
  INSERT INTO public.tasks (title, description, due_date, priority, status, assigned_to, client_id, deal_id)
  VALUES
  ('Tarefa Teste 1', 'Contactar Cliente Teste 1', now() + interval '3 days', 'high', 'in_progress', (SELECT user_id FROM admin_user), (SELECT client_id FROM ins_deals LIMIT 1), (SELECT id FROM ins_deals LIMIT 1)),
  ('Tarefa Teste 2', 'Enviar proposta para Cliente Teste 2', now() + interval '5 days', 'medium', 'pending', (SELECT user_id FROM admin_user), (SELECT client_id FROM ins_deals OFFSET 1 LIMIT 1), (SELECT id FROM ins_deals OFFSET 1 LIMIT 1)),
  ('Tarefa Teste 3', 'Negociar termos com Cliente Teste 3', now() + interval '7 days', 'urgent', 'pending', (SELECT user_id FROM admin_user), (SELECT client_id FROM ins_deals OFFSET 2 LIMIT 1), (SELECT id FROM ins_deals OFFSET 2 LIMIT 1))
  RETURNING id
)
INSERT INTO public.news_admin (title, slug, excerpt, content, author_id, published_at, status, category, featured_image, created_at, updated_at)
SELECT * FROM (
  VALUES
  (
    'Notícia Teste 1', 'noticia-teste-1', 'Resumo da notícia de teste 1',
    '<h2>Conteúdo Teste 1</h2><p>Esta é uma notícia de teste.</p>',
    (SELECT user_id FROM admin_user), now(), 'published', 'geral', '/lovable-uploads/4681b45a-e10b-4a3a-8d17-0b0defcd7032.png', now(), now()
  ),
  (
    'Notícia Teste 2', 'noticia-teste-2', 'Resumo da notícia de teste 2',
    '<h2>Conteúdo Teste 2</h2><p>Mais uma notícia de teste.</p>',
    (SELECT user_id FROM admin_user), now(), 'published', 'analise', '/lovable-uploads/61b45282-5735-4bef-8996-557611b71182.png', now(), now()
  )
) AS n(title, slug, excerpt, content, author_id, published_at, status, category, featured_image, created_at, updated_at)
ON CONFLICT (slug) DO NOTHING;

-- Default + test site settings overrides
INSERT INTO public.site_settings (key, value, description, updated_by)
VALUES
('homepage_banner', '"Bem-vindo ao Zapyer Hub (Teste)"', 'Banner exibido na página inicial (teste)', (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)),
('support_whatsapp', '"+55 11 90000-0000"', 'WhatsApp de suporte (teste)', (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description, updated_by = EXCLUDED.updated_by, updated_at = now();

-- Integrations test
INSERT INTO public.integrations (name, type, config, is_active, created_by)
VALUES
('Webhook Teste', 'webhook', '{"url":"https://example.com/webhook","secret":"teste"}', true, (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)),
('API Externa Teste', 'api', '{"endpoint":"https://api.example.com","token":"abc123"}', false, (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1));

-- Assign admin role to latest user (idempotent)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users ORDER BY created_at DESC LIMIT 1
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- Storage bucket for news images (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'news-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('news-images', 'news-images', TRUE);
  END IF;
END $$;

-- RLS policies for storage.objects specific to 'news-images'
DROP POLICY IF EXISTS "Public can read news images" ON storage.objects;
CREATE POLICY "Public can read news images" ON storage.objects FOR SELECT USING (bucket_id = 'news-images');

DROP POLICY IF EXISTS "Authenticated can upload news images" ON storage.objects;
CREATE POLICY "Authenticated can upload news images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'news-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can update news images" ON storage.objects;
CREATE POLICY "Authenticated can update news images" ON storage.objects FOR UPDATE USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can delete news images" ON storage.objects;
CREATE POLICY "Authenticated can delete news images" ON storage.objects FOR DELETE USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage news images" ON storage.objects;
CREATE POLICY "Admins can manage news images" ON storage.objects FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

COMMIT;