#!/bin/bash

# Script para configurar e executar o Laravel com Docker Compose
echo "🐳 Configuração do Laravel com Docker Compose"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker e Docker Compose encontrados${NC}"

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo ""
    echo -e "${YELLOW}📝 Criando arquivo .env...${NC}"
    cp .env.example .env
    
    # Configurar .env para Docker
    sed -i 's/DB_HOST=.*/DB_HOST=mysql/' .env
    sed -i 's/DB_DATABASE=.*/DB_DATABASE=codemar_contratos/' .env
    sed -i 's/DB_USERNAME=.*/DB_USERNAME=codemar/' .env
    sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=codemar2025/' .env
    
    echo -e "${GREEN}✓ Arquivo .env criado e configurado para Docker${NC}"
fi

# Gerar chave da aplicação
echo ""
echo -e "${YELLOW}🔑 Gerando chave da aplicação...${NC}"
docker-compose run --rm laravel php artisan key:generate

# Construir e iniciar os containers
echo ""
echo -e "${YELLOW}🏗️  Construindo e iniciando containers...${NC}"
docker-compose up -d --build

# Aguardar MySQL estar pronto
echo ""
echo -e "${YELLOW}⏳ Aguardando MySQL estar pronto...${NC}"
sleep 10

# Executar migrations
echo ""
echo -e "${YELLOW}🗄️  Executando migrations...${NC}"
docker-compose exec laravel php artisan migrate --force

# Criar diretórios necessários
echo ""
echo -e "${YELLOW}📁 Configurando diretórios...${NC}"
docker-compose exec laravel mkdir -p storage/app/imports
docker-compose exec laravel mkdir -p storage/app/examples
docker-compose exec laravel chmod -R 775 storage
docker-compose exec laravel chmod -R 775 bootstrap/cache

# Limpar cache
echo ""
echo -e "${YELLOW}🧹 Limpando cache...${NC}"
docker-compose exec laravel php artisan config:clear
docker-compose exec laravel php artisan cache:clear
docker-compose exec laravel php artisan view:clear

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Configuração concluída com sucesso!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}📋 Serviços disponíveis:${NC}"
echo ""
echo -e "🌐 Laravel API: ${GREEN}http://localhost:8000${NC}"
echo -e "🗄️  phpMyAdmin: ${GREEN}http://localhost:8080${NC}"
echo -e "   Usuário: ${GREEN}codemar${NC}"
echo -e "   Senha: ${GREEN}codemar2025${NC}"
echo ""
echo -e "${YELLOW}📋 Comandos úteis:${NC}"
echo ""
echo -e "Parar containers: ${GREEN}docker-compose down${NC}"
echo -e "Ver logs: ${GREEN}docker-compose logs -f${NC}"
echo -e "Executar comando no Laravel: ${GREEN}docker-compose exec laravel php artisan [comando]${NC}"
echo -e "Acessar container: ${GREEN}docker-compose exec laravel bash${NC}"
echo ""
echo -e "${YELLOW}📚 Para testar a API:${NC}"
echo -e "${GREEN}curl -X POST http://localhost:8000/api/imports -F \"file=@storage/app/examples/contratos-exemplo.xml\"${NC}"
echo ""




