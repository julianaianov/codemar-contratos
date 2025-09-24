#!/bin/bash

# Script para configurar o ambiente de desenvolvimento

echo "🚀 Configurando ambiente de desenvolvimento do Dashboard e-Cidade..."

# Copiar arquivo de exemplo se não existir
if [ ! -f .env.local ]; then
    echo "📋 Copiando arquivo de configuração..."
    cp env.local .env.local
    echo "✅ Arquivo .env.local criado!"
else
    echo "⚠️  Arquivo .env.local já existe!"
fi

echo ""
echo "🔧 Configurações do ambiente:"
echo "   - Dashboard: http://localhost:3000"
echo "   - Banco PostgreSQL: localhost:5432"
echo "   - Banco: ecidade"
echo "   - Usuário: postgres"
echo "   - Senha: postgres"
echo ""

echo "📝 Para personalizar as configurações, edite o arquivo .env.local:"
echo "   nano .env.local"
echo ""

echo "🚀 Para iniciar o dashboard:"
echo "   npm run dev"
echo ""

echo "✅ Configuração concluída!"
