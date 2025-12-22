-- ====================================================
-- MIGRAÇÃO: Corrige schema push_subscriptions para usar IDs numéricos
-- ====================================================

-- 1. Drop tabela antiga (se tiver dados, eles serão perdidos)
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;

-- 2. Recriar tabela com user_id como BIGINT
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL,  -- MUDOU: UUID → BIGINT
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  subscription_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_user_id_endpoint_key UNIQUE (user_id, endpoint),
  CONSTRAINT push_subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.ayra_cadastro (id) 
    ON DELETE CASCADE
);

-- 3. Índices
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions (user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON public.push_subscriptions (endpoint);

-- 4. RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can view own subscriptions" 
  ON public.push_subscriptions
  FOR SELECT 
  USING (user_id = (SELECT id FROM public.ayra_cadastro WHERE email = auth.email()));

CREATE POLICY "Users can insert own subscriptions" 
  ON public.push_subscriptions
  FOR INSERT 
  WITH CHECK (user_id = (SELECT id FROM public.ayra_cadastro WHERE email = auth.email()));

CREATE POLICY "Users can update own subscriptions" 
  ON public.push_subscriptions
  FOR UPDATE 
  USING (user_id = (SELECT id FROM public.ayra_cadastro WHERE email = auth.email()));

CREATE POLICY "Users can delete own subscriptions" 
  ON public.push_subscriptions
  FOR DELETE 
  USING (user_id = (SELECT id FROM public.ayra_cadastro WHERE email = auth.email()));

-- 6. Comentários
COMMENT ON TABLE public.push_subscriptions IS 'Armazena subscrições de push notifications dos usuários';
COMMENT ON COLUMN public.push_subscriptions.user_id IS 'ID do usuário da tabela ayra_cadastro';
COMMENT ON COLUMN public.push_subscriptions.endpoint IS 'URL endpoint da subscrição push';
COMMENT ON COLUMN public.push_subscriptions.p256dh IS 'Chave pública P256DH para criptografia';
COMMENT ON COLUMN public.push_subscriptions.auth IS 'Chave de autenticação';
COMMENT ON COLUMN public.push_subscriptions.subscription_data IS 'Dados completos da subscrição em JSON';
