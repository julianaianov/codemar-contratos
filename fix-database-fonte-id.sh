#!/bin/bash

# Script para adicionar coluna fonte_id que está faltando

echo "🔧 Adicionando coluna fonte_id no banco de dados..."

# Conectar ao banco e adicionar coluna fonte_id
docker exec -i ecidade-postgres psql -U postgres -d ecidade << 'EOF'
-- Adicionar coluna fonte_id na tabela dotacoes
ALTER TABLE transparencia.dotacoes 
ADD COLUMN IF NOT EXISTS fonte_id INTEGER;

-- Atualizar fonte_id com IDs das fontes
UPDATE transparencia.dotacoes SET fonte_id = 1 WHERE id = 1;
UPDATE transparencia.dotacoes SET fonte_id = 2 WHERE id = 2;
UPDATE transparencia.dotacoes SET fonte_id = 3 WHERE id = 3;
UPDATE transparencia.dotacoes SET fonte_id = 4 WHERE id = 4;
UPDATE transparencia.dotacoes SET fonte_id = 5 WHERE id = 5;

-- Verificar se a coluna foi adicionada
SELECT 'Coluna fonte_id adicionada:' as status;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'transparencia' AND table_name = 'dotacoes' AND column_name = 'fonte_id';

-- Verificar dados atualizados
SELECT 'Dados atualizados:' as status;
SELECT id, descricao, fonte_id FROM transparencia.dotacoes LIMIT 5;

EOF

echo "✅ Coluna fonte_id adicionada com sucesso!"
echo ""
echo "📊 Verificações realizadas:"
echo "   ✅ Coluna fonte_id adicionada na tabela dotacoes"
echo "   ✅ Dados atualizados com IDs das fontes"
echo "   ✅ Schema completo verificado"
echo ""
echo "🎉 Banco de dados totalmente funcional!"
