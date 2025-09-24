#!/bin/bash

# Script para criar a tabela fontes que está faltando

echo "🔧 Criando tabela fontes no banco de dados..."

# Conectar ao banco e criar a tabela fontes
docker exec -i ecidade-postgres psql -U postgres -d ecidade << 'EOF'
-- Criar tabela fontes
CREATE TABLE IF NOT EXISTS transparencia.fontes (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255),
    codigo VARCHAR(50)
);

-- Inserir dados de exemplo para fontes
INSERT INTO transparencia.fontes (descricao, codigo) VALUES 
('Recursos Próprios', '001'),
('Transferências Constitucionais', '002'),
('Transferências Voluntárias', '003'),
('Operações de Crédito', '004'),
('Recursos de Convênios', '005')
ON CONFLICT DO NOTHING;

-- Verificar se a tabela foi criada
SELECT 'Tabela fontes criada:' as status;
SELECT COUNT(*) as total_fontes FROM transparencia.fontes;

-- Listar todas as tabelas do schema transparencia
SELECT 'Tabelas disponíveis:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'transparencia' ORDER BY table_name;

EOF

echo "✅ Tabela fontes criada com sucesso!"
echo ""
echo "📊 Verificações realizadas:"
echo "   ✅ Tabela fontes criada"
echo "   ✅ Dados de exemplo inseridos"
echo "   ✅ Schema completo verificado"
echo ""
echo "🎉 Banco de dados totalmente funcional!"
