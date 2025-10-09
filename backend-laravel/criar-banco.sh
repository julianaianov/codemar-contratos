#!/bin/bash

# Script para criar banco de dados MySQL para o Laravel
echo "🗄️  Criando banco de dados para o sistema"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Digite a senha do root do MySQL:${NC}"
read -sp "Senha: " MYSQL_ROOT_PASSWORD
echo ""

# Criar banco de dados e usuário
echo -e "${YELLOW}Criando banco de dados e usuário...${NC}"

mysql -u root -p"${MYSQL_ROOT_PASSWORD}" << EOF
CREATE DATABASE IF NOT EXISTS codemar_contratos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'codemar'@'localhost' IDENTIFIED BY 'codemar2025';
GRANT ALL PRIVILEGES ON codemar_contratos.* TO 'codemar'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Banco de dados 'codemar_contratos' criado com sucesso!${NC}"
    echo -e "${GREEN}✓ Usuário 'codemar' criado com senha 'codemar2025'${NC}"
    
    # Atualizar .env
    echo ""
    echo -e "${YELLOW}Atualizando arquivo .env...${NC}"
    
    cp .env .env.backup
    
    sed -i 's/^DB_CONNECTION=.*/DB_CONNECTION=mysql/' .env
    sed -i 's/^DB_HOST=.*/DB_HOST=127.0.0.1/' .env
    sed -i 's/^DB_PORT=.*/DB_PORT=3306/' .env
    sed -i 's|^DB_DATABASE=.*|DB_DATABASE=codemar_contratos|' .env
    sed -i 's/^DB_USERNAME=.*/DB_USERNAME=codemar/' .env
    sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=codemar2025/' .env
    
    echo -e "${GREEN}✓ Arquivo .env atualizado${NC}"
    
    # Gerar APP_KEY se não existir
    echo ""
    echo -e "${YELLOW}Verificando APP_KEY...${NC}"
    if ! grep -q "APP_KEY=base64:" .env; then
        php artisan key:generate
        echo -e "${GREEN}✓ APP_KEY gerada${NC}"
    else
        echo -e "${GREEN}✓ APP_KEY já existe${NC}"
    fi
    
    # Executar migrations
    echo ""
    echo -e "${YELLOW}Executando migrations...${NC}"
    php artisan migrate --force
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}============================================${NC}"
        echo -e "${GREEN}✅ Banco de dados configurado com sucesso!${NC}"
        echo -e "${GREEN}============================================${NC}"
        echo ""
        echo -e "${YELLOW}Credenciais do banco:${NC}"
        echo -e "  Host: ${GREEN}127.0.0.1${NC}"
        echo -e "  Porta: ${GREEN}3306${NC}"
        echo -e "  Banco: ${GREEN}codemar_contratos${NC}"
        echo -e "  Usuário: ${GREEN}codemar${NC}"
        echo -e "  Senha: ${GREEN}codemar2025${NC}"
        echo ""
        echo -e "${YELLOW}Para acessar o banco:${NC}"
        echo -e "  ${GREEN}mysql -u codemar -pcodemar2025 codemar_contratos${NC}"
        echo ""
    else
        echo -e "${RED}❌ Erro ao executar migrations${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Erro ao criar banco de dados. Verifique a senha do root.${NC}"
    exit 1
fi



