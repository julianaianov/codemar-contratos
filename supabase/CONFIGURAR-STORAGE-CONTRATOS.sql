-- ============================================================================
-- CONFIGURAR SUPABASE STORAGE PARA CONTRATOS (VERSÃO COMPATÍVEL)
-- ============================================================================
-- Este script configura o storage para upload e edição de contratos
-- Execute este código no SQL Editor do Supabase Dashboard
-- URL: https://syhnkxbeftosviscvmmd.supabase.co

-- ============================================================================
-- 1. CRIAR BUCKET PARA CONTRATOS (SE NÃO EXISTIR)
-- ============================================================================

-- Criar bucket para contratos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contratos', 'contratos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. REMOVER POLÍTICAS EXISTENTES (SE HOUVER)
-- ============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Allow authenticated uploads contratos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads contratos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update contratos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete contratos" ON storage.objects;

-- ============================================================================
-- 3. CRIAR POLÍTICAS DE STORAGE PARA CONTRATOS
-- ============================================================================

-- Política para permitir uploads de contratos
CREATE POLICY "Allow authenticated uploads contratos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'contratos' 
    AND auth.role() = 'authenticated'
);

-- Política para permitir downloads de contratos
CREATE POLICY "Allow authenticated downloads contratos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'contratos' 
    AND auth.role() = 'authenticated'
);

-- Política para permitir updates de contratos
CREATE POLICY "Allow users to update contratos" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'contratos' 
    AND auth.role() = 'authenticated'
);

-- Política para permitir delete de contratos
CREATE POLICY "Allow users to delete contratos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'contratos' 
    AND auth.role() = 'authenticated'
);

-- ============================================================================
-- 4. CRIAR TABELA PARA METADADOS DOS CONTRATOS
-- ============================================================================

-- Tabela para armazenar metadados dos contratos
CREATE TABLE IF NOT EXISTS contratos_upload (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    arquivo_original VARCHAR(255) NOT NULL,
    arquivo_editado VARCHAR(255),
    tamanho BIGINT NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'ativo',
    versao INTEGER DEFAULT 1,
    is_editado BOOLEAN DEFAULT false,
    data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_edicao TIMESTAMP WITH TIME ZONE,
    usuario_upload VARCHAR(255),
    usuario_edicao VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice para busca por nome
CREATE INDEX IF NOT EXISTS idx_contratos_upload_nome ON contratos_upload(nome);

-- Índice para busca por tipo
CREATE INDEX IF NOT EXISTS idx_contratos_upload_tipo ON contratos_upload(tipo);

-- Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_contratos_upload_status ON contratos_upload(status);

-- Índice para busca por data
CREATE INDEX IF NOT EXISTS idx_contratos_upload_data ON contratos_upload(data_upload);

-- Índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_contratos_upload_usuario ON contratos_upload(usuario_upload);

-- ============================================================================
-- 6. CRIAR FUNÇÃO PARA ATUALIZAR TIMESTAMP
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_contratos_upload_updated_at ON contratos_upload;
CREATE TRIGGER update_contratos_upload_updated_at
    BEFORE UPDATE ON contratos_upload
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. CRIAR VIEW PARA ESTATÍSTICAS
-- ============================================================================

-- View para estatísticas dos contratos
CREATE OR REPLACE VIEW contratos_stats AS
SELECT 
    COUNT(*) as total_contratos,
    COUNT(CASE WHEN is_editado = true THEN 1 END) as contratos_editados,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as contratos_ativos,
    COUNT(CASE WHEN tipo = 'pdf' THEN 1 END) as contratos_pdf,
    COUNT(CASE WHEN tipo = 'docx' THEN 1 END) as contratos_docx,
    SUM(tamanho) as tamanho_total,
    AVG(tamanho) as tamanho_medio,
    MAX(data_upload) as ultimo_upload
FROM contratos_upload;

-- ============================================================================
-- 8. CRIAR RLS (ROW LEVEL SECURITY) SE NECESSÁRIO
-- ============================================================================

-- Habilitar RLS na tabela
ALTER TABLE contratos_upload ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Allow authenticated read contratos" ON contratos_upload
FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserção para usuários autenticados
CREATE POLICY "Allow authenticated insert contratos" ON contratos_upload
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "Allow authenticated update contratos" ON contratos_upload
FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir exclusão para usuários autenticados
CREATE POLICY "Allow authenticated delete contratos" ON contratos_upload
FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 9. INSERIR DADOS DE EXEMPLO (OPCIONAL)
-- ============================================================================

-- Inserir alguns contratos de exemplo
INSERT INTO contratos_upload (nome, descricao, arquivo_original, tamanho, tipo, usuario_upload, metadata)
VALUES 
    ('Contrato de Prestação de Serviços - Exemplo', 'Modelo de contrato para prestação de serviços', 'contrato_prestacao_servicos.pdf', 1024000, 'pdf', 'sistema', '{"categoria": "prestacao_servicos", "valor_base": 50000}'),
    ('Contrato de Fornecimento - Exemplo', 'Modelo de contrato para fornecimento de materiais', 'contrato_fornecimento.pdf', 2048000, 'pdf', 'sistema', '{"categoria": "fornecimento", "valor_base": 100000}'),
    ('Contrato de Locação - Exemplo', 'Modelo de contrato de locação', 'contrato_locacao.pdf', 1536000, 'pdf', 'sistema', '{"categoria": "locacao", "valor_base": 25000}')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se tudo foi criado corretamente
SELECT 
    'Storage Bucket' as tipo,
    CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'contratos') 
         THEN 'Criado com sucesso' 
         ELSE 'Erro na criação' 
    END as status
UNION ALL
SELECT 
    'Tabela contratos_upload' as tipo,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contratos_upload') 
         THEN 'Criada com sucesso' 
         ELSE 'Erro na criação' 
    END as status
UNION ALL
SELECT 
    'Políticas de Storage' as tipo,
    CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%contratos%') 
         THEN 'Criadas com sucesso' 
         ELSE 'Erro na criação' 
    END as status;
