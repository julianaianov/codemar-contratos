#!/bin/bash

# Script para iniciar PostgreSQL no Docker para o Dashboard e-Cidade

echo "🐳 Iniciando PostgreSQL no Docker..."

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    echo "❌ Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

# Parar container existente se houver
echo "🛑 Parando container existente (se houver)..."
docker stop ecidade-postgres 2>/dev/null || true
docker rm ecidade-postgres 2>/dev/null || true

# Iniciar PostgreSQL no Docker
echo "🚀 Iniciando PostgreSQL..."
docker run --name ecidade-postgres \
  -e POSTGRES_DB=ecidade \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:13

# Aguardar PostgreSQL inicializar
echo "⏳ Aguardando PostgreSQL inicializar..."
sleep 10

# Verificar se está rodando
if docker ps | grep -q ecidade-postgres; then
    echo "✅ PostgreSQL rodando no Docker!"
    echo "📊 Container: ecidade-postgres"
    echo "🔗 Porta: 5432"
    echo "🗄️ Banco: ecidade"
    echo "👤 Usuário: postgres"
    echo "🔑 Senha: postgres"
else
    echo "❌ Erro ao iniciar PostgreSQL"
    exit 1
fi

# Criar schema e tabelas
echo "📋 Criando schema e tabelas..."
docker exec -i ecidade-postgres psql -U postgres -d ecidade << 'EOF'
-- Criar schema transparencia
CREATE SCHEMA IF NOT EXISTS transparencia;

-- Criar tabela de receitas
CREATE TABLE IF NOT EXISTS transparencia.receitas (
    id SERIAL PRIMARY KEY,
    exercicio INTEGER,
    valor DECIMAL(15,2),
    data DATE,
    descricao VARCHAR(255)
);

-- Criar tabela de empenhos
CREATE TABLE IF NOT EXISTS transparencia.empenhos (
    id SERIAL PRIMARY KEY,
    exercicio INTEGER,
    valor DECIMAL(15,2),
    dataemissao DATE,
    descricao VARCHAR(255)
);

-- Inserir dados de exemplo
INSERT INTO transparencia.receitas (exercicio, valor, data, descricao) VALUES 
(2024, 100000.00, '2024-01-01', 'Receita de IPTU'),
(2024, 150000.00, '2024-02-01', 'Receita de ISS'),
(2024, 200000.00, '2024-03-01', 'Receita de ITR'),
(2024, 120000.00, '2024-04-01', 'Receita de Taxas'),
(2024, 180000.00, '2024-05-01', 'Receita de Contribuições')
ON CONFLICT DO NOTHING;

INSERT INTO transparencia.empenhos (exercicio, valor, dataemissao, descricao) VALUES 
(2024, 80000.00, '2024-01-15', 'Empenho de Educação'),
(2024, 120000.00, '2024-02-15', 'Empenho de Saúde'),
(2024, 90000.00, '2024-03-15', 'Empenho de Infraestrutura'),
(2024, 110000.00, '2024-04-15', 'Empenho de Assistência Social'),
(2024, 95000.00, '2024-05-15', 'Empenho de Administração')
ON CONFLICT DO NOTHING;

-- Criar tabela planocontas
CREATE TABLE IF NOT EXISTS transparencia.planocontas (
    id SERIAL PRIMARY KEY,
    exercicio INTEGER,
    estrutural VARCHAR(20),
    descricao VARCHAR(255),
    previsaoinicial DECIMAL(15,2)
);

-- Inserir dados de exemplo para planocontas
INSERT INTO transparencia.planocontas (exercicio, estrutural, descricao, previsaoinicial) VALUES 
(2024, '4.1.1.1.01', 'Impostos sobre o Patrimônio', 100000.00),
(2024, '4.1.1.2.01', 'Impostos sobre Serviços', 150000.00),
(2024, '4.1.1.3.01', 'Impostos sobre Renda', 200000.00),
(2024, '4.1.2.1.01', 'Taxas de Serviços', 120000.00),
(2024, '4.1.3.1.01', 'Contribuições Sociais', 180000.00)
ON CONFLICT DO NOTHING;

-- Criar tabela receitas_movimentacoes
CREATE TABLE IF NOT EXISTS transparencia.receitas_movimentacoes (
    id SERIAL PRIMARY KEY,
    receita_id INTEGER,
    valor DECIMAL(15,2),
    data DATE
);

-- Inserir dados de exemplo para movimentações
INSERT INTO transparencia.receitas_movimentacoes (receita_id, valor, data) VALUES 
(1, 25000.00, '2024-01-15'),
(1, 30000.00, '2024-02-15'),
(2, 40000.00, '2024-01-20'),
(2, 35000.00, '2024-02-20'),
(3, 50000.00, '2024-01-25'),
(3, 45000.00, '2024-02-25')
ON CONFLICT DO NOTHING;

EOF

echo "✅ Schema e tabelas criados com dados de exemplo!"

echo ""
echo "🎉 PostgreSQL configurado com sucesso!"
echo ""
echo "📊 Informações de conexão:"
echo "   Host: localhost"
echo "   Porta: 5432"
echo "   Banco: ecidade"
echo "   Usuário: postgres"
echo "   Senha: postgres"
echo ""
echo "🚀 Agora você pode:"
echo "   1. Acessar: http://localhost:3000"
echo "   2. Marcar 'Usar dados reais do e-Cidade'"
echo "   3. O dashboard deve conectar com o banco!"
echo ""
echo "🛑 Para parar o PostgreSQL:"
echo "   docker stop ecidade-postgres"
echo ""
echo "🔄 Para reiniciar:"
echo "   ./start-postgresql-docker.sh"



