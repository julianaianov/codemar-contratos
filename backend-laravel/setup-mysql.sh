#!/bin/bash

# Script de configuração do MySQL para o backend Laravel
echo "🗄️  Configuração do MySQL para Laravel"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Solicita credenciais do MySQL
echo -e "${YELLOW}Por favor, forneça as credenciais do MySQL:${NC}"
echo ""
read -p "Host do MySQL (padrão: 127.0.0.1): " DB_HOST
DB_HOST=${DB_HOST:-127.0.0.1}

read -p "Porta do MySQL (padrão: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "Usuário do MySQL (padrão: root): " DB_USER
DB_USER=${DB_USER:-root}

read -sp "Senha do MySQL: " DB_PASSWORD
echo ""

read -p "Nome do banco de dados (padrão: codemar_contratos): " DB_NAME
DB_NAME=${DB_NAME:-codemar_contratos}

echo ""
echo -e "${YELLOW}📝 Configurando .env...${NC}"

# Atualiza o arquivo .env
sed -i "s/DB_CONNECTION=.*/DB_CONNECTION=mysql/" .env
sed -i "s/DB_HOST=.*/DB_HOST=${DB_HOST}/" .env
sed -i "s/DB_PORT=.*/DB_PORT=${DB_PORT}/" .env
sed -i "s/DB_DATABASE=.*/DB_DATABASE=${DB_NAME}/" .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=${DB_USER}/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env

echo -e "${GREEN}✓ Arquivo .env configurado${NC}"

# Tenta criar o banco de dados
echo ""
echo -e "${YELLOW}🗄️  Criando banco de dados '${DB_NAME}'...${NC}"

mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Banco de dados criado com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao criar banco de dados. Verifique as credenciais.${NC}"
    echo -e "${YELLOW}Você pode criar manualmente com:${NC}"
    echo "  mysql -u${DB_USER} -p"
    echo "  CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    exit 1
fi

# Executa as migrations
echo ""
echo -e "${YELLOW}🔄 Executando migrations...${NC}"
php artisan migrate --force

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations executadas com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao executar migrations${NC}"
    exit 1
fi

# Cria diretórios necessários
echo ""
echo -e "${YELLOW}📁 Criando diretórios de storage...${NC}"
mkdir -p storage/app/imports
mkdir -p storage/app/examples
chmod -R 775 storage
chmod -R 775 bootstrap/cache

echo -e "${GREEN}✓ Diretórios criados${NC}"

# Finalização
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Configuração concluída com sucesso!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo ""
echo "1. Inicie o servidor Laravel:"
echo "   ${GREEN}php artisan serve${NC}"
echo ""
echo "2. O servidor estará disponível em:"
echo "   ${GREEN}http://localhost:8000${NC}"
echo ""
echo "3. API de importação:"
echo "   ${GREEN}http://localhost:8000/api/imports${NC}"
echo ""
echo "4. Para testar, use:"
echo "   ${GREEN}curl -X POST http://localhost:8000/api/imports -F \"file=@storage/app/examples/contratos-exemplo.xml\"${NC}"
echo ""


