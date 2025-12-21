-- Adiciona coluna data_nascimento na tabela de usuários
ALTER TABLE ayra_cadastro 
ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- Comentário para documentação:
-- A coluna 'idade' continuará existindo e será calculada automaticamente
-- pelo aplicativo antes de salvar, para manter compatibilidade.
