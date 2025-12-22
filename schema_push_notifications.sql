-- Tabela para armazenar subscrições de push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES ayra_cadastro(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  subscription_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS (Row Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas suas próprias subscrições
CREATE POLICY "Users can view own subscriptions" ON push_subscriptions
  FOR SELECT
  USING (user_id = (SELECT id FROM ayra_cadastro WHERE email = auth.email()));

-- Política: usuários podem inserir suas próprias subscrições
CREATE POLICY "Users can insert own subscriptions" ON push_subscriptions
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM ayra_cadastro WHERE email = auth.email()));

-- Política: usuários podem atualizar suas próprias subscrições
CREATE POLICY "Users can update own subscriptions" ON push_subscriptions
  FOR UPDATE
  USING (user_id = (SELECT id FROM ayra_cadastro WHERE email = auth.email()));

-- Política: usuários podem deletar suas próprias subscrições
CREATE POLICY "Users can delete own subscriptions" ON push_subscriptions
  FOR DELETE
  USING (user_id = (SELECT id FROM ayra_cadastro WHERE email = auth.email()));

-- Comentários para documentação
COMMENT ON TABLE push_subscriptions IS 'Armazena as subscrições de push notifications dos usuários';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'URL endpoint único para enviar notificações';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Chave pública do cliente (ECDH)';
COMMENT ON COLUMN push_subscriptions.auth IS 'Segredo de autenticação';
COMMENT ON COLUMN push_subscriptions.subscription_data IS 'Dados completos da subscrição em JSON';
