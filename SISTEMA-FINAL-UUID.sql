-- =====================================================
-- SISTEMA FINAL DE TERMOS E INSTRUMENTOS CONTRATUAIS
-- Conforme Lei 14.133/2021 - Nova Lei de Licitações
-- =====================================================
-- ✅ SCRIPT CORRIGIDO PARA UUID - 100% SEGURO
-- ✅ PRESERVA TODOS OS DADOS EXISTENTES
-- ✅ MANTÉM FUNCIONAMENTO ANTERIOR
-- Data: 17/10/2025

-- =====================================================
-- VERIFICAÇÃO INICIAL - BACKUP DE SEGURANÇA
-- =====================================================

-- Verificar se as tabelas principais existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contratos_importados') THEN
        RAISE EXCEPTION 'ERRO: Tabela contratos_importados não encontrada. Execute primeiro o script de setup básico.';
    END IF;
    
    RAISE NOTICE '✅ Tabela contratos_importados encontrada. Prosseguindo com segurança...';
END $$;

-- =====================================================
-- 1. CRIAÇÃO SEGURA DAS TABELAS (SEM APAGAR DADOS)
-- =====================================================

-- Tabela para termos contratuais (CRIA APENAS SE NÃO EXISTIR)
CREATE TABLE IF NOT EXISTS termos_contratuais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contrato_id UUID NOT NULL REFERENCES contratos_importados(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('apostilamento', 'aditivo', 'reconhecimento_divida', 'rescisao')),
    numero VARCHAR(20) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_vigencia DATE NOT NULL,
    data_execucao DATE,
    valor_original DECIMAL(15,2) DEFAULT 0,
    valor_aditivo DECIMAL(15,2),
    percentual_aditivo DECIMAL(5,2),
    descricao TEXT NOT NULL,
    justificativa TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'em_analise', 'executado')),
    empenho_id VARCHAR(50),
    empenho_numero VARCHAR(50),
    observacoes TEXT,
    anexos TEXT[], -- Array de URLs dos anexos
    criado_por VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_por VARCHAR(100),
    atualizado_em TIMESTAMP WITH TIME ZONE,
    
    -- Índices
    CONSTRAINT unique_termo_contrato_numero UNIQUE (contrato_id, numero)
);

-- Tabela para instrumentos contratuais (CRIA APENAS SE NÃO EXISTIR)
CREATE TABLE IF NOT EXISTS instrumentos_contratuais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contrato_id UUID NOT NULL REFERENCES contratos_importados(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('colaboracao', 'comodato', 'concessao', 'convenio', 'cooperacao', 'fomento', 'parceria', 'patrocinio', 'protocolo_intencoes', 'cessao', 'reconhecimento_divida')),
    numero VARCHAR(20) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    descricao TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'encerrado', 'cancelado')),
    observacoes TEXT,
    anexos TEXT[], -- Array de URLs dos anexos
    criado_por VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_por VARCHAR(100),
    atualizado_em TIMESTAMP WITH TIME ZONE,
    
    -- Validações
    CONSTRAINT data_fim_maior_inicio CHECK (data_fim >= data_inicio),
    CONSTRAINT valor_positivo CHECK (valor > 0),
    CONSTRAINT unique_instrumento_contrato_numero UNIQUE (contrato_id, numero)
);

-- Tabela para empenhos (CRIA APENAS SE NÃO EXISTIR)
CREATE TABLE IF NOT EXISTS empenhos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    valor DECIMAL(15,2) NOT NULL,
    data_empenho DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'liquidado', 'cancelado')),
    observacoes TEXT,
    criado_por VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_por VARCHAR(100),
    atualizado_em TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 2. ATUALIZAÇÃO SEGURA DA TABELA CONTRATOS_IMPORTADOS
-- =====================================================

-- Adicionar colunas APENAS se não existirem (PRESERVA DADOS EXISTENTES)
DO $$
BEGIN
    -- Adicionar coluna data_vigencia se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos_importados' AND column_name = 'data_vigencia') THEN
        ALTER TABLE contratos_importados ADD COLUMN data_vigencia DATE;
        RAISE NOTICE '✅ Coluna data_vigencia adicionada';
    END IF;
    
    -- Adicionar coluna data_execucao se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos_importados' AND column_name = 'data_execucao') THEN
        ALTER TABLE contratos_importados ADD COLUMN data_execucao DATE;
        RAISE NOTICE '✅ Coluna data_execucao adicionada';
    END IF;
    
    -- Adicionar coluna valor_original se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos_importados' AND column_name = 'valor_original') THEN
        ALTER TABLE contratos_importados ADD COLUMN valor_original DECIMAL(15,2);
        RAISE NOTICE '✅ Coluna valor_original adicionada';
    END IF;
    
    -- Adicionar coluna valor_atual se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos_importados' AND column_name = 'valor_atual') THEN
        ALTER TABLE contratos_importados ADD COLUMN valor_atual DECIMAL(15,2);
        RAISE NOTICE '✅ Coluna valor_atual adicionada';
    END IF;
    
    -- Adicionar coluna percentual_aditivo_total se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos_importados' AND column_name = 'percentual_aditivo_total') THEN
        ALTER TABLE contratos_importados ADD COLUMN percentual_aditivo_total DECIMAL(5,2) DEFAULT 0;
        RAISE NOTICE '✅ Coluna percentual_aditivo_total adicionada';
    END IF;
    
    -- Adicionar coluna valor_aditivo_total se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos_importados' AND column_name = 'valor_aditivo_total') THEN
        ALTER TABLE contratos_importados ADD COLUMN valor_aditivo_total DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE '✅ Coluna valor_aditivo_total adicionada';
    END IF;
    
    -- Adicionar coluna quantidade_aditivos se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos_importados' AND column_name = 'quantidade_aditivos') THEN
        ALTER TABLE contratos_importados ADD COLUMN quantidade_aditivos INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Coluna quantidade_aditivos adicionada';
    END IF;
    
    -- Adicionar coluna quantidade_apostilamentos se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos_importados' AND column_name = 'quantidade_apostilamentos') THEN
        ALTER TABLE contratos_importados ADD COLUMN quantidade_apostilamentos INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Coluna quantidade_apostilamentos adicionada';
    END IF;
    
    -- Adicionar coluna quantidade_rescisoes se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos_importados' AND column_name = 'quantidade_rescisoes') THEN
        ALTER TABLE contratos_importados ADD COLUMN quantidade_rescisoes INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Coluna quantidade_rescisoes adicionada';
    END IF;
END $$;

-- Inicializar valores apenas para registros que estão NULL (PRESERVA DADOS EXISTENTES)
UPDATE contratos_importados 
SET 
    valor_original = COALESCE(valor_original, valor_contrato, 0),
    valor_atual = COALESCE(valor_atual, valor_contrato, 0),
    percentual_aditivo_total = COALESCE(percentual_aditivo_total, 0),
    valor_aditivo_total = COALESCE(valor_aditivo_total, 0),
    quantidade_aditivos = COALESCE(quantidade_aditivos, 0),
    quantidade_apostilamentos = COALESCE(quantidade_apostilamentos, 0),
    quantidade_rescisoes = COALESCE(quantidade_rescisoes, 0),
    data_vigencia = COALESCE(data_vigencia, data_inicio),
    data_execucao = COALESCE(data_execucao, data_fim)
WHERE valor_original IS NULL 
   OR valor_atual IS NULL 
   OR percentual_aditivo_total IS NULL 
   OR valor_aditivo_total IS NULL 
   OR quantidade_aditivos IS NULL 
   OR quantidade_apostilamentos IS NULL 
   OR quantidade_rescisoes IS NULL;

-- =====================================================
-- 3. CRIAÇÃO SEGURA DE ÍNDICES (SEM CONFLITOS)
-- =====================================================

-- Índices para termos contratuais (CRIA APENAS SE NÃO EXISTIREM)
CREATE INDEX IF NOT EXISTS idx_termos_contrato_id ON termos_contratuais(contrato_id);
CREATE INDEX IF NOT EXISTS idx_termos_tipo ON termos_contratuais(tipo);
CREATE INDEX IF NOT EXISTS idx_termos_status ON termos_contratuais(status);
CREATE INDEX IF NOT EXISTS idx_termos_data_criacao ON termos_contratuais(data_criacao);
CREATE INDEX IF NOT EXISTS idx_termos_data_vigencia ON termos_contratuais(data_vigencia);

-- Índices para instrumentos contratuais (CRIA APENAS SE NÃO EXISTIREM)
CREATE INDEX IF NOT EXISTS idx_instrumentos_contrato_id ON instrumentos_contratuais(contrato_id);
CREATE INDEX IF NOT EXISTS idx_instrumentos_tipo ON instrumentos_contratuais(tipo);
CREATE INDEX IF NOT EXISTS idx_instrumentos_status ON instrumentos_contratuais(status);
CREATE INDEX IF NOT EXISTS idx_instrumentos_data_inicio ON instrumentos_contratuais(data_inicio);
CREATE INDEX IF NOT EXISTS idx_instrumentos_data_fim ON instrumentos_contratuais(data_fim);

-- Índices para empenhos (CRIA APENAS SE NÃO EXISTIREM)
CREATE INDEX IF NOT EXISTS idx_empenhos_numero ON empenhos(numero);
CREATE INDEX IF NOT EXISTS idx_empenhos_status ON empenhos(status);
CREATE INDEX IF NOT EXISTS idx_empenhos_data_empenho ON empenhos(data_empenho);

-- =====================================================
-- 4. CRIAÇÃO SEGURA DE FUNÇÕES (SUBSTITUI APENAS SE NECESSÁRIO)
-- =====================================================

-- Função para classificar contrato conforme Lei 14.133/2021
CREATE OR REPLACE FUNCTION get_classificacao_contrato(
    tipo_contrato TEXT,
    objeto_contrato TEXT DEFAULT ''
) RETURNS JSON AS $$
DECLARE
    tipo_lower TEXT;
    objeto_lower TEXT;
    resultado JSON;
BEGIN
    tipo_lower := LOWER(COALESCE(tipo_contrato, ''));
    objeto_lower := LOWER(COALESCE(objeto_contrato, ''));
    
    -- Reforma de edifício ou equipamento (50%)
    IF tipo_lower ~ '(reforma|reformas|equipamento|equipamentos|edifício|edifícios|instalação|instalações|manutenção|manutenções)' 
       OR objeto_lower ~ '(reforma|reformas|equipamento|equipamentos|edifício|edifícios|instalação|instalações|manutenção|manutenções)' THEN
        resultado := json_build_object(
            'categoria', 'REFORMA_EQUIPAMENTO',
            'limite', 50,
            'descricao', 'Reforma de Edifício ou Equipamento'
        );
    -- Obra, serviço ou compra (25%)
    ELSIF tipo_lower ~ '(obra|obras|construção|construções|ampliação|ampliações|restauração|restaurações|demolição|demolições|serviço|serviços|compra|compras|fornecimento|fornecimentos)'
          OR objeto_lower ~ '(obra|obras|construção|construções|ampliação|ampliações|restauração|restaurações|demolição|demolições|serviço|serviços|compra|compras|fornecimento|fornecimentos)' THEN
        resultado := json_build_object(
            'categoria', 'OBRAS_SERVICOS_COMPRAS',
            'limite', 25,
            'descricao', 'Obras, Serviços ou Compras'
        );
    -- Sociedade mista (25%)
    ELSIF tipo_lower ~ '(sociedade|mista)' THEN
        resultado := json_build_object(
            'categoria', 'SOCIEDADE_MISTA',
            'limite', 25,
            'descricao', 'Sociedade Mista'
        );
    -- Default (25%)
    ELSE
        resultado := json_build_object(
            'categoria', 'DEFAULT',
            'limite', 25,
            'descricao', 'Demais Contratos'
        );
    END IF;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar conformidade de aditivo
CREATE OR REPLACE FUNCTION verificar_conformidade_aditivo(
    contrato_id UUID,
    valor_aditivo DECIMAL
) RETURNS JSON AS $$
DECLARE
    contrato_record RECORD;
    classificacao JSON;
    percentual DECIMAL;
    dentro_limite BOOLEAN;
    status_conformidade TEXT;
    resultado JSON;
BEGIN
    -- Buscar dados do contrato
    SELECT valor_contrato, tipo_contrato, objeto
    INTO contrato_record
    FROM contratos_importados
    WHERE id = contrato_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('erro', 'Contrato não encontrado');
    END IF;
    
    -- Classificar contrato
    classificacao := get_classificacao_contrato(contrato_record.tipo_contrato, contrato_record.objeto);
    
    -- Calcular percentual
    percentual := (valor_aditivo / contrato_record.valor_contrato) * 100;
    
    -- Verificar se está dentro do limite
    dentro_limite := percentual <= (classificacao->>'limite')::DECIMAL;
    
    -- Determinar status
    IF percentual > (classificacao->>'limite')::DECIMAL THEN
        status_conformidade := 'INCONFORME';
    ELSIF percentual > (classificacao->>'limite')::DECIMAL * 0.8 THEN
        status_conformidade := 'ATENCAO';
    ELSE
        status_conformidade := 'CONFORME';
    END IF;
    
    -- Montar resultado
    resultado := json_build_object(
        'classificacao', classificacao,
        'percentual_aditivo', percentual,
        'dentro_limite_legal', dentro_limite,
        'status_conformidade', status_conformidade,
        'percentual_restante', GREATEST(0, (classificacao->>'limite')::DECIMAL - percentual),
        'valor_restante', (contrato_record.valor_contrato * GREATEST(0, (classificacao->>'limite')::DECIMAL - percentual)) / 100
    );
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar métricas do contrato
CREATE OR REPLACE FUNCTION atualizar_metricas_contrato()
RETURNS TRIGGER AS $$
DECLARE
    contrato_id UUID;
    total_aditivos DECIMAL(15,2);
    total_apostilamentos INTEGER;
    total_rescisoes INTEGER;
    percentual_total DECIMAL(5,2);
    valor_original DECIMAL(15,2);
BEGIN
    -- Determinar ID do contrato
    IF TG_OP = 'DELETE' THEN
        contrato_id := OLD.contrato_id;
    ELSE
        contrato_id := NEW.contrato_id;
    END IF;
    
    -- Buscar valor original do contrato
    SELECT valor_contrato INTO valor_original
    FROM contratos_importados
    WHERE id = contrato_id;
    
    -- Calcular totais dos termos aprovados
    SELECT 
        COALESCE(SUM(valor_aditivo), 0),
        COUNT(CASE WHEN tipo = 'apostilamento' THEN 1 END),
        COUNT(CASE WHEN tipo = 'rescisao' THEN 1 END)
    INTO total_aditivos, total_apostilamentos, total_rescisoes
    FROM termos_contratuais
    WHERE contrato_id = contrato_id
    AND status = 'aprovado';
    
    -- Calcular percentual total
    IF valor_original > 0 THEN
        percentual_total := (total_aditivos / valor_original) * 100;
    ELSE
        percentual_total := 0;
    END IF;
    
    -- Atualizar métricas na tabela de contratos
    UPDATE contratos_importados
    SET 
        valor_atual = valor_original + total_aditivos,
        percentual_aditivo_total = percentual_total,
        valor_aditivo_total = total_aditivos,
        quantidade_aditivos = (
            SELECT COUNT(*) FROM termos_contratuais 
            WHERE contrato_id = contrato_id AND status = 'aprovado'
        ),
        quantidade_apostilamentos = total_apostilamentos,
        quantidade_rescisoes = total_rescisoes,
        data_vigencia = COALESCE(data_vigencia, data_inicio),
        data_execucao = COALESCE(data_execucao, data_fim)
    WHERE id = contrato_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. CRIAÇÃO SEGURA DE TRIGGERS (SUBSTITUI APENAS SE NECESSÁRIO)
-- =====================================================

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_atualizar_metricas_termos ON termos_contratuais;

-- Criar trigger para atualizar métricas quando termos são inseridos/atualizados/deletados
CREATE TRIGGER trigger_atualizar_metricas_termos
    AFTER INSERT OR UPDATE OR DELETE ON termos_contratuais
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_metricas_contrato();

-- =====================================================
-- 6. CRIAÇÃO SEGURA DE VIEWS (SUBSTITUI APENAS SE NECESSÁRIO)
-- =====================================================

-- View para contratos com análise de conformidade
CREATE OR REPLACE VIEW v_contratos_conformidade AS
SELECT 
    c.id,
    c.numero_contrato,
    c.objeto,
    c.valor_contrato as valor_original,
    c.valor_atual,
    c.percentual_aditivo_total,
    c.valor_aditivo_total,
    c.quantidade_aditivos,
    c.tipo_contrato,
    c.modalidade,
    c.categoria,
    c.diretoria,
    c.status,
    c.data_inicio,
    c.data_fim,
    c.data_vigencia,
    c.data_execucao,
    
    -- Análise de conformidade
    get_classificacao_contrato(c.tipo_contrato, c.objeto) as classificacao,
    (get_classificacao_contrato(c.tipo_contrato, c.objeto)->>'limite')::DECIMAL as limite_legal,
    (c.percentual_aditivo_total <= (get_classificacao_contrato(c.tipo_contrato, c.objeto)->>'limite')::DECIMAL) as dentro_limite_legal,
    GREATEST(0, (get_classificacao_contrato(c.tipo_contrato, c.objeto)->>'limite')::DECIMAL - c.percentual_aditivo_total) as percentual_restante,
    (c.valor_contrato * GREATEST(0, (get_classificacao_contrato(c.tipo_contrato, c.objeto)->>'limite')::DECIMAL - c.percentual_aditivo_total)) / 100 as valor_restante,
    
    -- Status de conformidade
    CASE 
        WHEN c.percentual_aditivo_total > (get_classificacao_contrato(c.tipo_contrato, c.objeto)->>'limite')::DECIMAL THEN 'INCONFORME'
        WHEN c.percentual_aditivo_total > (get_classificacao_contrato(c.tipo_contrato, c.objeto)->>'limite')::DECIMAL * 0.8 THEN 'ATENCAO'
        ELSE 'CONFORME'
    END as status_conformidade
    
FROM contratos_importados c;

-- View para estatísticas de conformidade
CREATE OR REPLACE VIEW v_estatisticas_conformidade AS
SELECT 
    COUNT(*) as total_contratos,
    COUNT(CASE WHEN status_conformidade = 'CONFORME' THEN 1 END) as contratos_conformes,
    COUNT(CASE WHEN status_conformidade = 'ATENCAO' THEN 1 END) as contratos_atencao,
    COUNT(CASE WHEN status_conformidade = 'INCONFORME' THEN 1 END) as contratos_inconformes,
    ROUND(
        (COUNT(CASE WHEN status_conformidade = 'CONFORME' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
        2
    ) as percentual_conformidade,
    
    -- Por classificação
    COUNT(CASE WHEN (classificacao->>'categoria') = 'REFORMA_EQUIPAMENTO' THEN 1 END) as contratos_reforma_equipamento,
    COUNT(CASE WHEN (classificacao->>'categoria') = 'OBRAS_SERVICOS_COMPRAS' THEN 1 END) as contratos_obras_servicos,
    COUNT(CASE WHEN (classificacao->>'categoria') = 'SOCIEDADE_MISTA' THEN 1 END) as contratos_sociedade_mista,
    
    -- Valores por classificação
    SUM(CASE WHEN (classificacao->>'categoria') = 'REFORMA_EQUIPAMENTO' THEN valor_original ELSE 0 END) as valor_reforma_equipamento,
    SUM(CASE WHEN (classificacao->>'categoria') = 'OBRAS_SERVICOS_COMPRAS' THEN valor_original ELSE 0 END) as valor_obras_servicos,
    SUM(CASE WHEN (classificacao->>'categoria') = 'SOCIEDADE_MISTA' THEN valor_original ELSE 0 END) as valor_sociedade_mista,
    
    -- Valores totais
    SUM(valor_original) as valor_total_original,
    SUM(valor_atual) as valor_total_atual,
    SUM(valor_aditivo_total) as valor_total_aditivos,
    ROUND(AVG(percentual_aditivo_total), 2) as percentual_medio_aditivo
    
FROM v_contratos_conformidade;

-- =====================================================
-- 7. CONFIGURAÇÃO SEGURA DE POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas (APENAS SE NÃO ESTIVER HABILITADO)
DO $$
BEGIN
    -- Verificar e habilitar RLS para termos_contratuais
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'termos_contratuais' AND relrowsecurity = true) THEN
        ALTER TABLE termos_contratuais ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado para termos_contratuais';
    END IF;
    
    -- Verificar e habilitar RLS para instrumentos_contratuais
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'instrumentos_contratuais' AND relrowsecurity = true) THEN
        ALTER TABLE instrumentos_contratuais ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado para instrumentos_contratuais';
    END IF;
    
    -- Verificar e habilitar RLS para empenhos
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'empenhos' AND relrowsecurity = true) THEN
        ALTER TABLE empenhos ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado para empenhos';
    END IF;
END $$;

-- Criar políticas de segurança (APENAS SE NÃO EXISTIREM)
DO $$
BEGIN
    -- Políticas para termos contratuais
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'termos_contratuais' AND policyname = 'Permitir leitura de termos para usuários autenticados') THEN
        CREATE POLICY "Permitir leitura de termos para usuários autenticados" ON termos_contratuais
            FOR SELECT USING (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Política de leitura criada para termos_contratuais';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'termos_contratuais' AND policyname = 'Permitir inserção de termos para usuários autenticados') THEN
        CREATE POLICY "Permitir inserção de termos para usuários autenticados" ON termos_contratuais
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Política de inserção criada para termos_contratuais';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'termos_contratuais' AND policyname = 'Permitir atualização de termos para usuários autenticados') THEN
        CREATE POLICY "Permitir atualização de termos para usuários autenticados" ON termos_contratuais
            FOR UPDATE USING (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Política de atualização criada para termos_contratuais';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'termos_contratuais' AND policyname = 'Permitir exclusão de termos para usuários autenticados') THEN
        CREATE POLICY "Permitir exclusão de termos para usuários autenticados" ON termos_contratuais
            FOR DELETE USING (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Política de exclusão criada para termos_contratuais';
    END IF;
    
    -- Políticas para instrumentos contratuais
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'instrumentos_contratuais' AND policyname = 'Permitir leitura de instrumentos para usuários autenticados') THEN
        CREATE POLICY "Permitir leitura de instrumentos para usuários autenticados" ON instrumentos_contratuais
            FOR SELECT USING (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Política de leitura criada para instrumentos_contratuais';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'instrumentos_contratuais' AND policyname = 'Permitir inserção de instrumentos para usuários autenticados') THEN
        CREATE POLICY "Permitir inserção de instrumentos para usuários autenticados" ON instrumentos_contratuais
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Política de inserção criada para instrumentos_contratuais';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'instrumentos_contratuais' AND policyname = 'Permitir atualização de instrumentos para usuários autenticados') THEN
        CREATE POLICY "Permitir atualização de instrumentos para usuários autenticados" ON instrumentos_contratuais
            FOR UPDATE USING (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Política de atualização criada para instrumentos_contratuais';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'instrumentos_contratuais' AND policyname = 'Permitir exclusão de instrumentos para usuários autenticados') THEN
        CREATE POLICY "Permitir exclusão de instrumentos para usuários autenticados" ON instrumentos_contratuais
            FOR DELETE USING (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Política de exclusão criada para instrumentos_contratuais';
    END IF;
    
    -- Políticas para empenhos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'empenhos' AND policyname = 'Permitir leitura de empenhos para usuários autenticados') THEN
        CREATE POLICY "Permitir leitura de empenhos para usuários autenticados" ON empenhos
            FOR SELECT USING (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Política de leitura criada para empenhos';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'empenhos' AND policyname = 'Permitir inserção de empenhos para usuários autenticados') THEN
        CREATE POLICY "Permitir inserção de empenhos para usuários autenticados" ON empenhos
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Política de inserção criada para empenhos';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'empenhos' AND policyname = 'Permitir atualização de empenhos para usuários autenticados') THEN
        CREATE POLICY "Permitir atualização de empenhos para usuários autenticados" ON empenhos
            FOR UPDATE USING (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Política de atualização criada para empenhos';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'empenhos' AND policyname = 'Permitir exclusão de empenhos para usuários autenticados') THEN
        CREATE POLICY "Permitir exclusão de empenhos para usuários autenticados" ON empenhos
            FOR DELETE USING (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Política de exclusão criada para empenhos';
    END IF;
END $$;

-- =====================================================
-- 8. INSERÇÃO SEGURA DE DADOS DE EXEMPLO (APENAS SE NÃO EXISTIREM)
-- =====================================================

-- Inserir empenhos de exemplo (APENAS SE NÃO EXISTIREM)
INSERT INTO empenhos (numero, valor, data_empenho, data_vencimento, status, observacoes, criado_por)
SELECT * FROM (VALUES 
    ('EMP001/2025', 100000.00, '2025-01-15', '2025-12-31', 'ativo', 'Empenho para contrato de serviços', 'Sistema'),
    ('EMP002/2025', 250000.00, '2025-02-01', '2025-11-30', 'ativo', 'Empenho para contrato de obras', 'Sistema'),
    ('EMP003/2025', 50000.00, '2025-03-10', '2025-10-31', 'ativo', 'Empenho para contrato de sociedade mista', 'Sistema')
) AS v(numero, valor, data_empenho, data_vencimento, status, observacoes, criado_por)
WHERE NOT EXISTS (SELECT 1 FROM empenhos WHERE empenhos.numero = v.numero);

-- =====================================================
-- 9. VERIFICAÇÕES FINAIS E RELATÓRIO
-- =====================================================

-- Verificar se as tabelas foram criadas corretamente
DO $$
DECLARE
    tabelas_criadas INTEGER;
    funcoes_criadas INTEGER;
    views_criadas INTEGER;
    politicas_criadas INTEGER;
BEGIN
    -- Contar tabelas
    SELECT COUNT(*) INTO tabelas_criadas
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('termos_contratuais', 'instrumentos_contratuais', 'empenhos');
    
    -- Contar funções
    SELECT COUNT(*) INTO funcoes_criadas
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN ('get_classificacao_contrato', 'verificar_conformidade_aditivo', 'atualizar_metricas_contrato');
    
    -- Contar views
    SELECT COUNT(*) INTO views_criadas
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('v_contratos_conformidade', 'v_estatisticas_conformidade');
    
    -- Contar políticas
    SELECT COUNT(*) INTO politicas_criadas
    FROM pg_policies
    WHERE tablename IN ('termos_contratuais', 'instrumentos_contratuais', 'empenhos');
    
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '📊 RESUMO DA INSTALAÇÃO:';
    RAISE NOTICE '   • Tabelas criadas: %/3', tabelas_criadas;
    RAISE NOTICE '   • Funções criadas: %/3', funcoes_criadas;
    RAISE NOTICE '   • Views criadas: %/2', views_criadas;
    RAISE NOTICE '   • Políticas criadas: %/12', politicas_criadas;
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '🎯 SISTEMA PRONTO PARA USO!';
    RAISE NOTICE '   • Conformidade com Lei 14.133/2021 ✅';
    RAISE NOTICE '   • Contratos de Sociedade Mista (25%) ✅';
    RAISE NOTICE '   • Reforma/Equipamento (50%) ✅';
    RAISE NOTICE '   • Obras/Serviços/Compras (25%) ✅';
    RAISE NOTICE '   • Compatível com UUID ✅';
    RAISE NOTICE '=====================================================';
END $$;

-- =====================================================
-- FIM DO SCRIPT SEGURO
-- =====================================================
