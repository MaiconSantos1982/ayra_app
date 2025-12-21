-- ============================================
-- CONFIGURAÇÃO SUPABASE - AYRA CADASTRO
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Verificar se a tabela existe e adicionar colunas faltantes
ALTER TABLE ayra_cadastro 
ADD COLUMN IF NOT EXISTS plano TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. Criar índice no email para performance
CREATE INDEX IF NOT EXISTS idx_ayra_cadastro_email ON ayra_cadastro(email);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE ayra_cadastro ENABLE ROW LEVEL SECURITY;

-- 4. REMOVER políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON ayra_cadastro;
DROP POLICY IF EXISTS "Users can insert own profile" ON ayra_cadastro;
DROP POLICY IF EXISTS "Users can update own profile" ON ayra_cadastro;
DROP POLICY IF EXISTS "Enable read access for all users" ON ayra_cadastro;
DROP POLICY IF EXISTS "Enable insert for all users" ON ayra_cadastro;
DROP POLICY IF EXISTS "Enable update for users based on id" ON ayra_cadastro;

-- 5. CRIAR políticas NOVAS (acesso público para leitura/escrita)
-- IMPORTANTE: Como não estamos usando Supabase Auth, precisamos permitir acesso público

-- Permitir SELECT (buscar por email no login)
CREATE POLICY "Allow public read access"
ON ayra_cadastro
FOR SELECT
USING (true);

-- Permitir INSERT (cadastro de novos usuários)
CREATE POLICY "Allow public insert"
ON ayra_cadastro
FOR INSERT
WITH CHECK (true);

-- Permitir UPDATE (atualizar dados pessoais)
CREATE POLICY "Allow public update"
ON ayra_cadastro
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 6. Verificar estrutura da tabela
-- Execute este SELECT para confirmar que tudo está OK:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ayra_cadastro' 
ORDER BY ordinal_position;

-- 7. Testar inserção manual (opcional)
-- INSERT INTO ayra_cadastro (nome, email, plano) 
-- VALUES ('Teste Manual', 'teste.manual@ayra.app', NULL);

-- 8. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'ayra_cadastro';

-- ============================================
-- IMPORTANTE: SEGURANÇA
-- ============================================
-- ATENÇÃO: Estas políticas permitem acesso público!
-- Isso é OK para MVP, mas em produção você deve:
-- 1. Implementar Supabase Auth
-- 2. Restringir políticas por auth.uid()
-- 3. Adicionar rate limiting
-- 4. Validar dados no backend
-- ============================================
