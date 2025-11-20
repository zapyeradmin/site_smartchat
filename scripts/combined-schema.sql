-- Combined Supabase schema generated from supabase/migrations

-- ===============================================
-- Migration: 20250925225702_11bdfc5c-a737-4651-93b7-0f466b13727c.sql
-- ===============================================
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
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

-- Create deals table for pipeline
CREATE TABLE public.deals (
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

-- Create tasks table
CREATE TABLE public.tasks (
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

-- Create news_admin table for managing news
CREATE TABLE public.news_admin (
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

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integrations table
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('api', 'webhook', 'oauth')),
  config JSONB,
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for clients (admin access)
CREATE POLICY "Authenticated users can manage clients" ON public.clients FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for deals (admin access)
CREATE POLICY "Authenticated users can manage deals" ON public.deals FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for tasks (admin access)  
CREATE POLICY "Authenticated users can manage tasks" ON public.tasks FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for news_admin (admin access)
CREATE POLICY "Authenticated users can manage news" ON public.news_admin FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for site_settings (admin access)
CREATE POLICY "Authenticated users can manage settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for integrations (admin access)
CREATE POLICY "Authenticated users can manage integrations" ON public.integrations FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_news_admin_updated_at BEFORE UPDATE ON public.news_admin FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger function for new user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
('site_title', '"Zapyer Hub"', 'Título principal do site'),
('site_description', '"Plataforma de automação e integração"', 'Descrição do site'),
('primary_color', '"#3b82f6"', 'Cor primária do site'),
('secondary_color', '"#1e40af"', 'Cor secundária do site'),
('logo_url', '""', 'URL do logo principal'),
('contact_email', '"contato@zapyerhub.com"', 'Email de contato'),
('contact_phone', '""', 'Telefone de contato');

-- ===============================================
-- Migration: 20250925225726_9952b669-6939-4203-9449-3505c5d89765.sql
-- ===============================================
-- Fix search path for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$;

-- ===============================================
-- Migration: 20250927003326_623d44aa-7995-40f2-a638-f18987c7eb86.sql
-- ===============================================
-- Migrate existing news data to the database with proper UUIDs
INSERT INTO public.news_admin (
  title, slug, excerpt, content, author_id, published_at, 
  status, category, featured_image, created_at, updated_at
) VALUES 
(
  'Como Fazer Seu Primeiro Trade',
  'como-fazer-seu-primeiro-trade',
  'Aprenda estratégias essenciais de trading de criptomoedas para maximizar seus lucros.',
  '<h2>Introdução ao Trading de Criptomoedas</h2><p>O trading de criptomoedas pode parecer intimidador no início, mas com as estratégias certas e conhecimento adequado, você pode começar a operar com confiança. Este guia completo irá te ensinar os primeiros passos.</p><h3>1. Configurando sua Conta</h3><p>Antes de começar a negociar, é essencial configurar uma conta segura em uma exchange confiável. Certifique-se de:</p><ul><li>Verificar sua identidade completamente</li><li>Configurar autenticação de dois fatores (2FA)</li><li>Definir senhas fortes e únicas</li></ul><h3>2. Entendendo os Conceitos Básicos</h3><p>Familiarize-se com termos essenciais como:</p><ul><li><strong>Bid/Ask:</strong> Preços de compra e venda</li><li><strong>Spread:</strong> Diferença entre bid e ask</li><li><strong>Volume:</strong> Quantidade negociada</li><li><strong>Market Cap:</strong> Capitalização de mercado</li></ul><h3>3. Sua Primeira Operação</h3><p>Para realizar seu primeiro trade:</p><ol><li>Escolha um par de trading (ex: BTC/USDT)</li><li>Analise o gráfico e identifique tendências</li><li>Defina seu ponto de entrada e saída</li><li>Configure stop-loss para gerenciar riscos</li><li>Execute a operação com uma quantia pequena</li></ol><h3>Conclusão</h3><p>Lembre-se: o trading envolve riscos. Sempre faça sua própria pesquisa e nunca invista mais do que pode perder. Com prática e disciplina, você pode desenvolver suas habilidades de trading.</p>',
  (SELECT id FROM auth.users LIMIT 1),
  '2024-12-01 00:00:00+00',
  'published',
  'tutorial',
  '/lovable-uploads/4681b45a-e10b-4a3a-8d17-0b0defcd7032.png',
  '2024-12-01 00:00:00+00',
  now()
),
(
  'Análise de Mercado Avançada',
  'analise-de-mercado-avancada',
  'Domine ferramentas de análise técnica para tomar decisões mais informadas em seus trades.',
  '<h2>Análise Técnica Avançada</h2><p>A análise técnica é fundamental para qualquer trader sério. Este artigo explora técnicas avançadas que podem melhorar significativamente suas decisões de trading.</p><h3>Indicadores Técnicos Essenciais</h3><p>Os indicadores mais eficazes incluem:</p><ul><li><strong>RSI (Relative Strength Index):</strong> Identifica condições de sobrecompra/sobrevenda</li><li><strong>MACD:</strong> Mostra a relação entre duas médias móveis</li><li><strong>Bollinger Bands:</strong> Indica volatilidade e níveis de suporte/resistência</li><li><strong>Volume:</strong> Confirma a força dos movimentos de preço</li></ul><h3>Padrões de Gráfico</h3><p>Reconhecer padrões é crucial:</p><ul><li>Triângulos (ascendente, descendente, simétrico)</li><li>Ombro-cabeça-ombro</li><li>Bandeiras e flâmulas</li><li>Duplo topo/fundo</li></ul><h3>Estratégias de Confirmação</h3><p>Nunca se baseie em um único indicador. Use múltiplas confirmações:</p><ol><li>Combine indicadores de momentum e tendência</li><li>Observe o volume para validar breakouts</li><li>Considere timeframes diferentes</li><li>Analise o sentimento do mercado</li></ol><h3>Conclusão</h3><p>A análise técnica é uma habilidade que se desenvolve com o tempo. Pratique consistentemente e mantenha um journal de trading para rastrear seu progresso.</p>',
  (SELECT id FROM auth.users LIMIT 1),
  '2024-11-28 00:00:00+00',
  'published',
  'analise',
  '/lovable-uploads/61b45282-5735-4bef-8996-557611b71182.png',
  '2024-11-28 00:00:00+00',
  now()
),
(
  'Gestão de Risco no Trading',
  'gestao-de-risco-no-trading',
  'Aprenda a proteger seu capital com estratégias eficazes de gerenciamento de risco.',
  '<h2>A Importância da Gestão de Risco</h2><p>A gestão de risco é o aspecto mais crucial do trading. Sem ela, mesmo os melhores traders podem perder tudo. Este guia ensina como proteger seu capital.</p><h3>Regra dos 2%</h3><p>Nunca arrisque mais de 2% do seu capital em uma única operação. Esta regra simples pode salvar sua conta de trading:</p><ul><li>Se você tem R$ 10.000, não arrisque mais de R$ 200 por trade</li><li>Use stop-loss para limitar perdas</li><li>Calcule o tamanho da posição baseado no risco</li></ul><h3>Diversificação Inteligente</h3><p>Não coloque todos os ovos na mesma cesta:</p><ul><li>Diversifique entre diferentes criptomoedas</li><li>Use estratégias complementares</li><li>Varie os timeframes de suas operações</li><li>Considere correlações entre ativos</li></ul><h3>Psicologia do Risco</h3><p>O maior inimigo do trader é ele mesmo. Controle suas emoções:</p><ol><li>Defina regras claras e siga-as</li><li>Não persiga perdas com posições maiores</li><li>Aceite que perdas fazem parte do jogo</li><li>Mantenha um journal de trading</li></ol><h3>Ferramentas de Gestão de Risco</h3><p>Use a tecnologia a seu favor:</p><ul><li>Stop-loss automático</li><li>Take-profit predefinido</li><li>Trailing stops</li><li>Alertas de preço</li></ul><h3>Conclusão</h3><p>Lembre-se: é melhor ganhar menos com segurança do que perder tudo por ganância. A consistência vence a agressividade no longo prazo.</p>',
  (SELECT id FROM auth.users LIMIT 1),
  '2024-11-25 00:00:00+00',
  'published',
  'educacao',
  '/lovable-uploads/de08f44e-da14-467d-882c-67f893cdd9b7.png',
  '2024-11-25 00:00:00+00',
  now()
),
(
  'Tendências do Mercado Cripto',
  'tendencias-do-mercado-cripto',
  'Fique por dentro das últimas tendências e oportunidades no mercado de criptomoedas.',
  '<h2>O Futuro das Criptomoedas</h2><p>O mercado de criptomoedas está em constante evolução. Entender as tendências emergentes pode te dar uma vantagem competitiva significativa.</p><h3>DeFi e Yield Farming</h3><p>As finanças descentralizadas continuam revolucionando o setor:</p><ul><li>Protocolos de empréstimo descentralizados</li><li>Pools de liquidez automatizados</li><li>Staking e yield farming</li><li>Governança descentralizada (DAOs)</li></ul><h3>NFTs e Metaverso</h3><p>Além do hype, aplicações reais estão emergindo:</p><ul><li>Arte digital e colecionáveis</li><li>Gaming e play-to-earn</li><li>Imóveis virtuais</li><li>Identidade digital</li></ul><h3>Layer 2 e Escalabilidade</h3><p>Soluções para os problemas de escalabilidade:</p><ol><li>Polygon e sidechains</li><li>Lightning Network para Bitcoin</li><li>Rollups otimistas e ZK</li><li>Sharding no Ethereum 2.0</li></ol><h3>Regulamentação Global</h3><p>O cenário regulatório está se definindo:</p><ul><li>CBDCs (moedas digitais de bancos centrais)</li><li>Frameworks regulatórios claros</li><li>Compliance e KYC obrigatórios</li><li>Tributação de criptomoedas</li></ul><h3>Oportunidades de Investimento</h3><p>Setores promissores para 2024:</p><ul><li>Infraestrutura blockchain</li><li>Soluções de privacidade</li><li>Interoperabilidade entre blockchains</li><li>Web3 e aplicações descentralizadas</li></ul><h3>Conclusão</h3><p>Mantenha-se informado sobre as tendências, mas sempre faça sua própria pesquisa. O mercado cripto é volátil e requer cautela.</p>',
  (SELECT id FROM auth.users LIMIT 1),
  '2024-11-22 00:00:00+00',
  'published',
  'mercado',
  '/lovable-uploads/d4235e74-39e5-47b2-a294-9e825d81c7f0.png',
  '2024-11-22 00:00:00+00',
  now()
);

-- ===============================================
-- Migration: 20250928014251_3f7ba491-5a7c-4fdf-a7c8-119d8854eee2.sql
-- ===============================================
-- Create RLS policy to allow public reading of published news
CREATE POLICY "Public can view published news" 
ON public.news_admin 
FOR SELECT 
USING (status = 'published');

-- Create index for better performance on status and published_at queries
CREATE INDEX IF NOT EXISTS idx_news_admin_status_published_at 
ON public.news_admin (status, published_at DESC);

-- ===============================================
-- Migration: 20251022125931_abf76f1a-b710-4166-a5bd-47e09645987c.sql
-- ===============================================
-- Fix Critical Security Issues: Proper Role Management and RLS Policies
-- This version handles existing NULL data

-- ============================================================================
-- 1. CRITICAL: Implement Proper Role Management System
-- ============================================================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create separate roles table with strict RLS
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can only view their own roles (read-only)
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Create security definer function for role checks (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Remove insecure role column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- ============================================================================
-- 2. Fix Clients Table RLS - Owner-Scoped Access
-- ============================================================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON public.clients;

-- Get first admin user or any user to assign existing clients
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Get the first user from auth.users
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  -- Update NULL created_by values to first user
  IF first_user_id IS NOT NULL THEN
    UPDATE public.clients 
    SET created_by = first_user_id 
    WHERE created_by IS NULL;
  END IF;
END $$;

-- Now make created_by required and set default
ALTER TABLE public.clients ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.clients ALTER COLUMN created_by SET NOT NULL;

-- Add owner-scoped policies
CREATE POLICY "Users can view their own clients"
ON public.clients FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own clients"
ON public.clients FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own clients"
ON public.clients FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own clients"
ON public.clients FOR DELETE
USING (auth.uid() = created_by);

-- ============================================================================
-- 3. Fix Deals Table RLS - Assignment-Based Access
-- ============================================================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage deals" ON public.deals;

-- Users can view deals they're assigned to or deals for their clients
CREATE POLICY "Users can view assigned deals"
ON public.deals FOR SELECT
USING (
  auth.uid() = assigned_to 
  OR auth.uid() IN (
    SELECT created_by FROM public.clients WHERE id = deals.client_id
  )
);

-- Users can insert deals only for their own clients
CREATE POLICY "Users can insert deals for their clients"
ON public.deals FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT created_by FROM public.clients WHERE id = client_id
  )
);

-- Users can update deals they're assigned to or own the client
CREATE POLICY "Users can update assigned deals"
ON public.deals FOR UPDATE
USING (
  auth.uid() = assigned_to 
  OR auth.uid() IN (
    SELECT created_by FROM public.clients WHERE id = deals.client_id
  )
);

-- Users can delete deals they're assigned to
CREATE POLICY "Users can delete assigned deals"
ON public.deals FOR DELETE
USING (auth.uid() = assigned_to);

-- ============================================================================
-- 4. Fix Integrations Table RLS - Owner-Scoped Access
-- ============================================================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage integrations" ON public.integrations;

-- Handle existing NULL created_by values
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    UPDATE public.integrations 
    SET created_by = first_user_id 
    WHERE created_by IS NULL;
  END IF;
END $$;

-- Make created_by required and set default
ALTER TABLE public.integrations ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.integrations ALTER COLUMN created_by SET NOT NULL;

-- Add owner-scoped policies
CREATE POLICY "Users can view own integrations"
ON public.integrations FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can create integrations"
ON public.integrations FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own integrations"
ON public.integrations FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own integrations"
ON public.integrations FOR DELETE
USING (auth.uid() = created_by);

-- ===============================================
-- Migration: 20251118_add_admin_policies.sql
-- ===============================================
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

-- ===============================================
-- Storage: bucket and policies for news images
-- ===============================================
-- Create public bucket 'news-images' if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'news-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('news-images', 'news-images', TRUE);
  END IF;
END $$;

-- Policies scoped to 'news-images' bucket
DROP POLICY IF EXISTS "Public can read news images" ON storage.objects;
CREATE POLICY "Public can read news images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

DROP POLICY IF EXISTS "Authenticated can upload news images" ON storage.objects;
CREATE POLICY "Authenticated can upload news images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can update news images" ON storage.objects;
CREATE POLICY "Authenticated can update news images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can delete news images" ON storage.objects;
CREATE POLICY "Authenticated can delete news images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage news images" ON storage.objects;
CREATE POLICY "Admins can manage news images" 
ON storage.objects 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

