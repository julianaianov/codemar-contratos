-- ============================================================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA TESTES
-- ============================================================================
-- Execute este código no SQL Editor do Supabase para desabilitar RLS

-- Desabilitar RLS nas tabelas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE file_imports DISABLE ROW LEVEL SECURITY;
ALTER TABLE contratos_importados DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'file_imports', 'contratos_importados');




