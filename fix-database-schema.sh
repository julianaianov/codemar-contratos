#!/bin/bash

# Script para corrigir o schema do banco de dados

echo "🔧 Corrigindo schema do banco de dados..."

# Conectar ao banco e corrigir as tabelas
docker exec -i ecidade-postgres psql -U postgres -d ecidade << 'EOF'
-- Adicionar colunas faltantes na tabela empenhos
ALTER TABLE transparencia.empenhos 
ADD COLUMN IF NOT EXISTS valor_liquidado DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(15,2) DEFAULT 0;

-- Atualizar dados de exemplo com valores de liquidação e pagamento
UPDATE transparencia.empenhos SET 
    valor_liquidado = valor * 0.8,
    valor_pago = valor * 0.7
WHERE valor_liquidado = 0 AND valor_pago = 0;

-- Corrigir nome da coluna dataemissao para data_emissao
ALTER TABLE transparencia.empenhos 
RENAME COLUMN dataemissao TO data_emissao;

-- Adicionar coluna planoconta_id na tabela receitas
ALTER TABLE transparencia.receitas 
ADD COLUMN IF NOT EXISTS planoconta_id INTEGER;

-- Atualizar planoconta_id com IDs das contas
UPDATE transparencia.receitas SET planoconta_id = 1 WHERE id = 1;
UPDATE transparencia.receitas SET planoconta_id = 2 WHERE id = 2;
UPDATE transparencia.receitas SET planoconta_id = 3 WHERE id = 3;
UPDATE transparencia.receitas SET planoconta_id = 4 WHERE id = 4;
UPDATE transparencia.receitas SET planoconta_id = 5 WHERE id = 5;

-- Adicionar coluna data_movimentacao na tabela receitas_movimentacoes
ALTER TABLE transparencia.receitas_movimentacoes 
ADD COLUMN IF NOT EXISTS data_movimentacao DATE;

-- Atualizar data_movimentacao com a mesma data da coluna data
UPDATE transparencia.receitas_movimentacoes 
SET data_movimentacao = data 
WHERE data_movimentacao IS NULL;

-- Criar tabela dotacoes que estava faltando
CREATE TABLE IF NOT EXISTS transparencia.dotacoes (
    id SERIAL PRIMARY KEY,
    exercicio INTEGER,
    valor DECIMAL(15,2),
    descricao VARCHAR(255)
);

-- Inserir dados de exemplo para dotacoes
INSERT INTO transparencia.dotacoes (exercicio, valor, descricao) VALUES 
(2024, 50000.00, 'Dotação para Educação'),
(2024, 75000.00, 'Dotação para Saúde'),
(2024, 30000.00, 'Dotação para Infraestrutura'),
(2024, 40000.00, 'Dotação para Assistência Social'),
(2024, 25000.00, 'Dotação para Administração')
ON CONFLICT DO NOTHING;

-- Criar tabela instituicoes
CREATE TABLE IF NOT EXISTS transparencia.instituicoes (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255)
);

-- Inserir dados de exemplo para instituicoes
INSERT INTO transparencia.instituicoes (descricao) VALUES 
('Prefeitura Municipal'),
('Secretaria de Educação'),
('Secretaria de Saúde'),
('Secretaria de Obras'),
('Secretaria de Assistência Social')
ON CONFLICT DO NOTHING;

-- Criar tabela recursos
CREATE TABLE IF NOT EXISTS transparencia.recursos (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255)
);

-- Inserir dados de exemplo para recursos
INSERT INTO transparencia.recursos (descricao) VALUES 
('Recursos Próprios'),
('Transferências Constitucionais'),
('Transferências Voluntárias'),
('Operações de Crédito'),
('Recursos de Convênios')
ON CONFLICT DO NOTHING;

-- Adicionar colunas faltantes na tabela receitas
ALTER TABLE transparencia.receitas 
ADD COLUMN IF NOT EXISTS instituicao_id INTEGER,
ADD COLUMN IF NOT EXISTS recurso_id INTEGER;

-- Atualizar com IDs das instituições e recursos
UPDATE transparencia.receitas SET 
    instituicao_id = 1,
    recurso_id = 1
WHERE instituicao_id IS NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_receitas_exercicio ON transparencia.receitas(exercicio);
CREATE INDEX IF NOT EXISTS idx_empenhos_exercicio ON transparencia.empenhos(exercicio);
CREATE INDEX IF NOT EXISTS idx_planocontas_exercicio ON transparencia.planocontas(exercicio);
CREATE INDEX IF NOT EXISTS idx_receitas_movimentacoes_data ON transparencia.receitas_movimentacoes(data_movimentacao);

EOF

echo "✅ Schema corrigido com sucesso!"
echo ""
echo "📊 Tabelas e colunas criadas/corrigidas:"
echo "   ✅ empenhos: adicionadas colunas valor_liquidado, valor_pago"
echo "   ✅ empenhos: renomeada coluna dataemissao para data_emissao"
echo "   ✅ receitas: adicionada coluna planoconta_id"
echo "   ✅ receitas_movimentacoes: adicionada coluna data_movimentacao"
echo "   ✅ dotacoes: tabela criada"
echo "   ✅ instituicoes: tabela criada"
echo "   ✅ recursos: tabela criada"
echo "   ✅ Índices criados para melhor performance"
echo ""
echo "🎉 Banco de dados corrigido! Agora o dashboard deve funcionar."
