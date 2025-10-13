-- ============================================================================
-- TABELAS PARA SUPABASE - SISTEMA DE CONTRATOS CODEMAR (VERSÃO COMPATÍVEL)
-- ============================================================================
-- Este script funciona mesmo se as tabelas já existirem
-- Copie e cole este código no SQL Editor do Supabase Dashboard
-- URL: https://syhnkxbeftosviscvmmd.supabase.co

-- ============================================================================
-- 1. HABILITAR EXTENSÃO UUID
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABELA DE USUÁRIOS (SE NÃO EXISTIR)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    cpf TEXT UNIQUE,
    department TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. TABELA DE IMPORTAÇÕES DE ARQUIVO (SE NÃO EXISTIR)
-- ============================================================================
CREATE TABLE IF NOT EXISTS file_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_filename TEXT NOT NULL,
    stored_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('csv', 'excel', 'xml', 'pdf')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    successful_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. TABELA DE CONTRATOS IMPORTADOS (SE NÃO EXISTIR)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contratos_importados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_import_id UUID REFERENCES file_imports(id) ON DELETE CASCADE,
    
    -- Campos específicos do contrato
    ano_numero TEXT,
    numero_contrato TEXT,
    ano INTEGER,
    pa TEXT,
    diretoria TEXT,
    modalidade TEXT,
    nome_empresa TEXT,
    cnpj_empresa TEXT,
    objeto TEXT,
    data_assinatura DATE,
    prazo INTEGER,
    unidade_prazo TEXT,
    valor_contrato DECIMAL(15,2),
    vencimento DATE,
    gestor_contrato TEXT,
    fiscal_tecnico TEXT,
    fiscal_administrativo TEXT,
    suplente TEXT,
    
    -- Campos legados para compatibilidade
    contratante TEXT,
    contratado TEXT,
    cnpj_contratado TEXT,
    valor DECIMAL(15,2),
    data_inicio DATE,
    data_fim DATE,
    status TEXT CHECK (status IN ('vigente', 'encerrado', 'suspenso', 'rescindido')),
    tipo_contrato TEXT,
    secretaria TEXT,
    fonte_recurso TEXT,
    observacoes TEXT,
    dados_originais JSONB,
    pdf_path TEXT,
    processado BOOLEAN DEFAULT false,
    erro_processamento TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. ÍNDICES PARA PERFORMANCE (SE NÃO EXISTIREM)
-- ============================================================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Índices para file_imports
CREATE INDEX IF NOT EXISTS idx_file_imports_user_id ON file_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_file_imports_file_type ON file_imports(file_type);
CREATE INDEX IF NOT EXISTS idx_file_imports_status ON file_imports(status);
CREATE INDEX IF NOT EXISTS idx_file_imports_created_at ON file_imports(created_at);

-- Índices para contratos_importados
CREATE INDEX IF NOT EXISTS idx_contratos_file_import_id ON contratos_importados(file_import_id);
CREATE INDEX IF NOT EXISTS idx_contratos_numero_contrato ON contratos_importados(numero_contrato);
CREATE INDEX IF NOT EXISTS idx_contratos_ano ON contratos_importados(ano);
CREATE INDEX IF NOT EXISTS idx_contratos_diretoria ON contratos_importados(diretoria);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos_importados(status);
CREATE INDEX IF NOT EXISTS idx_contratos_processado ON contratos_importados(processado);

-- ============================================================================
-- 6. FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 7. TRIGGERS PARA updated_at (SE NÃO EXISTIREM)
-- ============================================================================

-- Remover triggers existentes se houver
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_file_imports_updated_at ON file_imports;
DROP TRIGGER IF EXISTS update_contratos_importados_updated_at ON contratos_importados;

-- Criar triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_imports_updated_at 
    BEFORE UPDATE ON file_imports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_importados_updated_at 
    BEFORE UPDATE ON contratos_importados 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. USUÁRIO ADMINISTRADOR PADRÃO (SE NÃO EXISTIR)
-- ============================================================================
INSERT INTO users (name, email, password, role, is_active, department) 
VALUES (
    'Administrador',
    'admin@codemar.com',
    'hashed_admin_password_123', -- Em produção, usar hash real
    'admin',
    true,
    'Presidência'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 9. VERIFICAR SE TUDO FOI CRIADO/CONFIGURADO
-- ============================================================================

-- Verificar tabelas
SELECT 
    'Tabelas criadas:' as status,
    table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'file_imports', 'contratos_importados')
ORDER BY table_name;

-- Verificar usuário admin
SELECT 
    'Usuário admin:' as status,
    name,
    email,
    role,
    is_active
FROM users 
WHERE role = 'admin';

-- Verificar índices
SELECT 
    'Índices criados:' as status,
    indexname,
    tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verificar triggers
SELECT 
    'Triggers ativos:' as status,
    trigger_name,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'update_%_updated_at'
ORDER BY event_object_table;

-- ============================================================================
-- 10. MENSAGEM DE SUCESSO
-- ============================================================================
SELECT 
    '🎉 SISTEMA CONFIGURADO COM SUCESSO!' as mensagem,
    'Todas as tabelas, índices, triggers e usuário admin estão prontos.' as detalhes,
    'A aplicação Next.js pode agora conectar ao Supabase.' as proximo_passo;
