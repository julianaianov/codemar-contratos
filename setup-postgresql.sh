#!/bin/bash

# Script para configurar PostgreSQL para o Dashboard e-Cidade

echo "🐘 Configurando PostgreSQL para Dashboard e-Cidade..."

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "📦 Instalando PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    echo "✅ PostgreSQL instalado!"
else
    echo "✅ PostgreSQL já está instalado!"
fi

# Verificar se PostgreSQL está rodando
if ! sudo systemctl is-active --quiet postgresql; then
    echo "🚀 Iniciando PostgreSQL..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    echo "✅ PostgreSQL iniciado!"
else
    echo "✅ PostgreSQL já está rodando!"
fi

# Configurar banco de dados
echo "🗄️ Configurando banco de dados..."

# Criar banco e usuário
sudo -u postgres psql << EOF
-- Criar banco se não existir
SELECT 'CREATE DATABASE ecidade' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecidade')\gexec

-- Criar usuário se não existir
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
        CREATE USER postgres WITH PASSWORD 'postgres';
    END IF;
END
\$\$;

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE ecidade TO postgres;
\q
EOF

echo "✅ Banco de dados configurado!"

# Criar schema e tabelas básicas
echo "📋 Criando schema e tabelas..."

psql -h localhost -U postgres -d ecidade << EOF
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
(2024, 200000.00, '2024-03-01', 'Receita de ITR')
ON CONFLICT DO NOTHING;

INSERT INTO transparencia.empenhos (exercicio, valor, dataemissao, descricao) VALUES 
(2024, 80000.00, '2024-01-15', 'Empenho de Educação'),
(2024, 120000.00, '2024-02-15', 'Empenho de Saúde'),
(2024, 90000.00, '2024-03-15', 'Empenho de Infraestrutura')
ON CONFLICT DO NOTHING;

\q
EOF

echo "✅ Schema e tabelas criados!"

# Testar conexão
echo "🧪 Testando conexão..."
if psql -h localhost -U postgres -d ecidade -c "SELECT 'Conexão OK' as status;" &> /dev/null; then
    echo "✅ Conexão com PostgreSQL funcionando!"
else
    echo "❌ Erro na conexão com PostgreSQL"
    echo "Verifique as configurações no arquivo .env.local"
fi

echo ""
echo "🎯 Próximos passos:"
echo "1. Acesse: http://localhost:3000"
echo "2. Marque o checkbox 'Usar dados reais do e-Cidade'"
echo "3. O dashboard deve carregar dados do PostgreSQL"
echo ""
echo "📝 Configurações do banco:"
echo "   - Host: localhost"
echo "   - Porta: 5432"
echo "   - Banco: ecidade"
echo "   - Usuário: postgres"
echo "   - Senha: postgres"
echo ""
echo "✅ Configuração do PostgreSQL concluída!"



