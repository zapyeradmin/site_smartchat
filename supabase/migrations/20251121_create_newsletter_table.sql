-- Criar tabela newsletter
CREATE TABLE IF NOT EXISTS public.newsletter (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON public.newsletter(status);

-- Grant permissions
GRANT ALL ON public.newsletter TO authenticated;
GRANT SELECT, INSERT ON public.newsletter TO anon;

-- Criar RLS policies
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

-- Permitir inserção para todos (inclusive usuários não autenticados)
CREATE POLICY "Allow insert for everyone" ON public.newsletter
    FOR INSERT WITH CHECK (true);

-- Permitir leitura apenas do próprio email (se aplicável)
CREATE POLICY "Allow read own email" ON public.newsletter
    FOR SELECT USING (
        auth.uid() IS NULL OR 
        email = auth.jwt() ->> 'email'
    );

-- Permitir atualização apenas para usuários autenticados
CREATE POLICY "Allow update for authenticated" ON public.newsletter
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_newsletter_updated_at ON public.newsletter;
CREATE TRIGGER update_newsletter_updated_at
    BEFORE UPDATE ON public.newsletter
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();