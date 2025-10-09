#!/bin/bash

# Script de configuração inicial do Backend Laravel
echo "🚀 Iniciando configuração do Backend Laravel..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verifica se composer está instalado
if ! command -v composer &> /dev/null; then
    echo -e "${RED}❌ Composer não encontrado. Por favor, instale o Composer primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Composer encontrado${NC}"

# Verifica se PHP está instalado
if ! command -v php &> /dev/null; then
    echo -e "${RED}❌ PHP não encontrado. Por favor, instale o PHP 8.1 ou superior.${NC}"
    exit 1
fi

PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)
echo -e "${GREEN}✓ PHP ${PHP_VERSION} encontrado${NC}"

# 1. Instalar dependências
echo ""
echo -e "${YELLOW}📦 Instalando dependências do Composer...${NC}"
composer install --no-interaction

# 2. Copiar arquivo .env
if [ ! -f .env ]; then
    echo ""
    echo -e "${YELLOW}📝 Copiando arquivo .env.example para .env...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
else
    echo -e "${YELLOW}⚠ Arquivo .env já existe${NC}"
fi

# 3. Gerar chave da aplicação
echo ""
echo -e "${YELLOW}🔑 Gerando chave da aplicação...${NC}"
php artisan key:generate

# 4. Criar diretórios necessários
echo ""
echo -e "${YELLOW}📁 Criando diretórios necessários...${NC}"
mkdir -p storage/app/imports
mkdir -p storage/app/examples
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs

echo -e "${GREEN}✓ Diretórios criados${NC}"

# 5. Configurar permissões
echo ""
echo -e "${YELLOW}🔒 Configurando permissões...${NC}"
chmod -R 775 storage
chmod -R 775 bootstrap/cache

echo -e "${GREEN}✓ Permissões configuradas${NC}"

# 6. Perguntar sobre banco de dados
echo ""
echo -e "${YELLOW}🗄️  Configuração do Banco de Dados${NC}"
echo ""
echo "Por favor, configure manualmente o arquivo .env com suas credenciais do banco de dados:"
echo ""
echo "  DB_CONNECTION=mysql (ou pgsql, sqlite)"
echo "  DB_HOST=127.0.0.1"
echo "  DB_PORT=3306"
echo "  DB_DATABASE=codemar_contratos"
echo "  DB_USERNAME=seu_usuario"
echo "  DB_PASSWORD=sua_senha"
echo ""
read -p "Pressione ENTER depois de configurar o .env..."

# 7. Executar migrations
echo ""
echo -e "${YELLOW}🗄️  Executando migrations...${NC}"
read -p "Deseja executar as migrations agora? (s/n): " RUN_MIGRATIONS

if [ "$RUN_MIGRATIONS" = "s" ] || [ "$RUN_MIGRATIONS" = "S" ]; then
    php artisan migrate
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migrations executadas com sucesso${NC}"
    else
        echo -e "${RED}❌ Erro ao executar migrations. Verifique a configuração do banco de dados.${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Migrations não executadas. Execute manualmente: php artisan migrate${NC}"
fi

# 8. Criar link simbólico para storage (opcional para produção)
echo ""
echo -e "${YELLOW}🔗 Criando link simbólico para storage...${NC}"
php artisan storage:link 2>/dev/null || echo -e "${YELLOW}⚠ Link já existe ou não foi possível criar${NC}"

# 9. Limpar cache
echo ""
echo -e "${YELLOW}🧹 Limpando cache...${NC}"
php artisan config:clear
php artisan cache:clear
php artisan view:clear

echo -e "${GREEN}✓ Cache limpo${NC}"

# Finalização
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Configuração concluída com sucesso!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo ""
echo "1. Certifique-se de que o banco de dados está configurado no .env"
echo "2. Execute as migrations (se ainda não executou):"
echo "   ${GREEN}php artisan migrate${NC}"
echo ""
echo "3. Inicie o servidor de desenvolvimento:"
echo "   ${GREEN}php artisan serve${NC}"
echo ""
echo "4. Acesse a API em:"
echo "   ${GREEN}http://localhost:8000/api/imports${NC}"
echo ""
echo "5. Para testar, use os arquivos de exemplo em:"
echo "   ${GREEN}storage/app/examples/${NC}"
echo ""
echo -e "${YELLOW}📚 Documentação completa em: README-IMPORTACAO.md${NC}"
echo ""

