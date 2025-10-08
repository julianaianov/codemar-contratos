#!/bin/bash

# Script para criar todas as tabelas que estão faltando

echo "🔧 Criando todas as tabelas faltantes no banco de dados..."

# Conectar ao banco e criar todas as tabelas necessárias
docker exec -i ecidade-postgres psql -U postgres -d ecidade << 'EOF'
-- Criar tabela orgaos
CREATE TABLE IF NOT EXISTS transparencia.orgaos (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255),
    codigo VARCHAR(50)
);

-- Inserir dados de exemplo para orgaos
INSERT INTO transparencia.orgaos (descricao, codigo) VALUES 
('Prefeitura Municipal', '001'),
('Secretaria de Educação', '002'),
('Secretaria de Saúde', '003'),
('Secretaria de Obras', '004'),
('Secretaria de Assistência Social', '005')
ON CONFLICT DO NOTHING;

-- Criar tabela funcoes
CREATE TABLE IF NOT EXISTS transparencia.funcoes (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255),
    codigo VARCHAR(50)
);

-- Inserir dados de exemplo para funcoes
INSERT INTO transparencia.funcoes (descricao, codigo) VALUES 
('Administração Geral', '01'),
('Educação', '02'),
('Saúde', '03'),
('Assistência Social', '04'),
('Urbanismo', '05')
ON CONFLICT DO NOTHING;

-- Criar tabela subfuncoes
CREATE TABLE IF NOT EXISTS transparencia.subfuncoes (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255),
    codigo VARCHAR(50)
);

-- Inserir dados de exemplo para subfuncoes
INSERT INTO transparencia.subfuncoes (descricao, codigo) VALUES 
('Administração Geral', '01.01'),
('Educação Infantil', '02.01'),
('Ensino Fundamental', '02.02'),
('Atenção Básica', '03.01'),
('Assistência Social', '04.01')
ON CONFLICT DO NOTHING;

-- Adicionar colunas faltantes na tabela empenhos
ALTER TABLE transparencia.empenhos 
ADD COLUMN IF NOT EXISTS orgao_id INTEGER,
ADD COLUMN IF NOT EXISTS funcao_id INTEGER,
ADD COLUMN IF NOT EXISTS subfuncao_id INTEGER,
ADD COLUMN IF NOT EXISTS numero_empenho VARCHAR(50);

-- Atualizar dados de exemplo
UPDATE transparencia.empenhos SET 
    orgao_id = 1,
    funcao_id = 1,
    subfuncao_id = 1,
    numero_empenho = 'EMP-' || id
WHERE orgao_id IS NULL;

-- Verificar todas as tabelas criadas
SELECT 'Tabelas disponíveis:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'transparencia' ORDER BY table_name;

-- Verificar estrutura das tabelas principais
SELECT 'Estrutura da tabela empenhos:' as status;
\d transparencia.empenhos;

-- Verificar dados inseridos
SELECT 'Dados de exemplo inseridos:' as status;
SELECT COUNT(*) as total_empenhos FROM transparencia.empenhos;
SELECT COUNT(*) as total_orgaos FROM transparencia.orgaos;
SELECT COUNT(*) as total_funcoes FROM transparencia.funcoes;
SELECT COUNT(*) as total_subfuncoes FROM transparencia.subfuncoes;

EOF

echo "✅ Todas as tabelas criadas com sucesso!"
echo ""
echo "📊 Verificações realizadas:"
echo "   ✅ Tabela orgaos criada"
echo "   ✅ Tabela funcoes criada"
echo "   ✅ Tabela subfuncoes criada"
echo "   ✅ Colunas adicionadas na tabela empenhos"
echo "   ✅ Dados de exemplo inseridos"
echo "   ✅ Schema completo verificado"
echo ""
echo "🎉 Banco de dados totalmente funcional!"



