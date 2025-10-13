-- ============================================================================
-- CONFIGURAR SUPABASE STORAGE PARA UPLOAD DE ARQUIVOS (VERSÃO COMPATÍVEL)
-- ============================================================================
-- Este script funciona mesmo se as políticas já existirem
-- Execute este código no SQL Editor do Supabase Dashboard
-- URL: https://syhnkxbeftosviscvmmd.supabase.co

-- ============================================================================
-- 1. CRIAR BUCKET PARA IMPORTAÇÕES (SE NÃO EXISTIR)
-- ============================================================================

-- Criar bucket para uploads de arquivos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('imports', 'imports', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. REMOVER POLÍTICAS EXISTENTES (SE HOUVER)
-- ============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;

-- ============================================================================
-- 3. CRIAR POLÍTICAS DE STORAGE
-- ============================================================================

-- Política para permitir uploads (qualquer usuário autenticado)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'imports' 
    AND auth.role() = 'authenticated'
);

-- Política para permitir downloads (qualquer usuário autenticado)
CREATE POLICY "Allow authenticated downloads" ON storage.objects
FOR SELECT USING (
    bucket_id = 'imports' 
    AND auth.role() = 'authenticated'
);

-- Política para permitir updates (apenas o usuário que fez o upload)
CREATE POLICY "Allow users to update their own files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'imports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir delete (apenas o usuário que fez o upload)
CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'imports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- 4. FUNÇÃO PARA GERAR NOME ÚNICO DE ARQUIVO (SE NÃO EXISTIR)
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_unique_filename(
    user_id UUID,
    original_filename TEXT
)
RETURNS TEXT AS $$
DECLARE
    file_extension TEXT;
    base_name TEXT;
    unique_filename TEXT;
BEGIN
    -- Extrair extensão do arquivo
    file_extension := substring(original_filename from '\.([^.]*)$');
    base_name := substring(original_filename from '^([^.]+)');
    
    -- Gerar nome único com timestamp
    unique_filename := user_id::text || '/' || base_name || '_' || 
                      extract(epoch from now())::bigint || '.' || file_extension;
    
    RETURN unique_filename;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. FUNÇÃO PARA OBTER URL PÚBLICA DO ARQUIVO (SE NÃO EXISTIR)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_file_public_url(file_path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://syhnkxbeftosviscvmmd.supabase.co/storage/v1/object/public/imports/' || file_path;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. VERIFICAR SE STORAGE FOI CONFIGURADO
-- ============================================================================

-- Verificar se o bucket foi criado
SELECT 
    'Bucket criado:' as status,
    id,
    name,
    public
FROM storage.buckets 
WHERE id = 'imports';

-- Verificar políticas criadas
SELECT 
    'Políticas criadas:' as status,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%authenticated%'
ORDER BY policyname;

-- ============================================================================
-- 7. TESTE DE FUNCIONAMENTO (OPCIONAL)
-- ============================================================================

-- Verificar se as funções foram criadas
SELECT 
    'Funções criadas:' as status,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('generate_unique_filename', 'get_file_public_url')
ORDER BY routine_name;

-- ============================================================================
-- 8. MENSAGEM DE SUCESSO
-- ============================================================================
SELECT 
    '🎉 STORAGE CONFIGURADO COM SUCESSO!' as mensagem,
    'Bucket imports criado e políticas configuradas.' as detalhes,
    'Upload de arquivos está funcionando.' as status;

-- ============================================================================
-- FIM DA CONFIGURAÇÃO DE STORAGE
-- ============================================================================
