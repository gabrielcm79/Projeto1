-- ==============================================================================
-- Schema SQL para o Projeto Notion-Like no Supabase
-- ==============================================================================
-- Instruções:
-- 1. Acesse o painel do Supabase (https://supabase.com/dashboard)
-- 2. Vá em 'SQL Editor' -> 'New query'
-- 3. Cole o código abaixo e clique em 'Run' (Executar).
-- ==============================================================================

-- 1. Criação da tabela de Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitação de Row Level Security (RLS)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- 3. Política de acesso público (leitura e gravação para anon key)
-- Obs: Se no futuro adicionar autenticação de usuários, adapte para 'auth.uid()'
CREATE POLICY "Permitir leitura pública do workspace"
    ON public.workspaces FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção e atualização pública do workspace"
    ON public.workspaces FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_workspace_updated ON public.workspaces;
CREATE TRIGGER on_workspace_updated
    BEFORE UPDATE ON public.workspaces
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
