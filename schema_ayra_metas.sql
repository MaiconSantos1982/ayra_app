-- Tabela para armazenar metas dos usuários
CREATE TABLE IF NOT EXISTS public.ayra_metas (
    id BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES public.ayra_cadastro(id) ON DELETE CASCADE,
    
    -- Metas nutricionais
    calorias_diarias INTEGER NOT NULL,
    proteina_g INTEGER NOT NULL,
    carboidrato_g INTEGER NOT NULL,
    gordura_g INTEGER NOT NULL,
    
    -- Metas de estilo de vida
    agua_ml INTEGER,
    dias_exercicio_semana INTEGER,
    horas_sono INTEGER,
    
    -- Metas de acompanhamento
    peso_corporal_kg DECIMAL(5,2),
    meta_consistencia_dias INTEGER DEFAULT 5,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para buscar metas por usuário
CREATE INDEX IF NOT EXISTS idx_metas_usuario ON public.ayra_metas(id_usuario);

-- RLS Policies
ALTER TABLE public.ayra_metas ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (qualquer um pode ler - ajuste conforme necessidade)
CREATE POLICY "Permitir leitura de metas" ON public.ayra_metas
    FOR SELECT
    USING (true);

-- Política para INSERT (qualquer um pode inserir)
CREATE POLICY "Permitir inserção de metas" ON public.ayra_metas
    FOR INSERT
    WITH CHECK (true);

-- Política para UPDATE (qualquer um pode atualizar)
CREATE POLICY "Permitir atualização de metas" ON public.ayra_metas
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Política para DELETE (qualquer um pode deletar)
CREATE POLICY "Permitir exclusão de metas" ON public.ayra_metas
    FOR DELETE
    USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_ayra_metas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ayra_metas_updated_at
    BEFORE UPDATE ON public.ayra_metas
    FOR EACH ROW
    EXECUTE FUNCTION update_ayra_metas_updated_at();
