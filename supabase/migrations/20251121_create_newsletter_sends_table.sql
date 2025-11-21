-- Criar tabela de logs de envios de newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  total_enviados INTEGER NOT NULL DEFAULT 0,
  data TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_sends_slug ON public.newsletter_sends(slug);
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_data ON public.newsletter_sends(data);

ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;

-- Permitir inserção (log) para anon e authenticated
CREATE POLICY "Allow insert logs" ON public.newsletter_sends
  FOR INSERT WITH CHECK (true);

-- Leitura somente para authenticated
CREATE POLICY "Allow read logs" ON public.newsletter_sends
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON public.newsletter_sends TO authenticated;
GRANT INSERT ON public.newsletter_sends TO anon;