#!/bin/bash

# Script para configurar a API do Gemini
echo "🔧 Configurando API do Gemini..."

# Verificar se a chave foi fornecida
if [ -z "$1" ]; then
    echo "❌ Erro: Forneça sua chave da API"
    echo "Uso: ./setup-gemini.sh SUA_CHAVE_AQUI"
    echo ""
    echo "💡 Para obter uma chave:"
    echo "1. Acesse: https://aistudio.google.com/app/apikey"
    echo "2. Crie uma nova chave"
    echo "3. Execute: ./setup-gemini.sh SUA_CHAVE"
    exit 1
fi

API_KEY="$1"

# Criar arquivo .env.local
echo "📝 Criando arquivo .env.local..."
cat > .env.local << EOF
# Configuração da API do Google Gemini
GEMINI_API_KEY=$API_KEY

# URL da API Laravel (se necessário)
NEXT_PUBLIC_LARAVEL_API_URL=http://localhost:8000
EOF

echo "✅ Arquivo .env.local criado com sucesso!"

# Configurar variável de ambiente para a sessão atual
export GEMINI_API_KEY="$API_KEY"
echo "✅ Variável GEMINI_API_KEY configurada para esta sessão"

# Testar a API
echo ""
echo "🧪 Testando a API..."
node test-gemini-api.js

echo ""
echo "🎉 Configuração concluída!"
echo "💡 Para usar em outras sessões, reinicie o terminal ou execute:"
echo "   source ~/.bashrc"
echo ""
echo "🚀 Para iniciar o servidor:"
echo "   npm run dev"


