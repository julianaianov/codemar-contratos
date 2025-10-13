# 🐳 Laravel com Docker Compose

Este projeto inclui configuração completa do Laravel com MySQL usando Docker Compose.

## 📋 Pré-requisitos

- Docker
- Docker Compose

## 🚀 Início Rápido

### 1. Configuração Automática
```bash
./docker-setup.sh
```

### 2. Configuração Manual

#### Passo 1: Configurar .env
```bash
cp .env.example .env
```

Edite o arquivo `.env` com as configurações do Docker:
```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=codemar_contratos
DB_USERNAME=codemar
DB_PASSWORD=codemar2025
```

#### Passo 2: Construir e iniciar containers
```bash
docker-compose up -d --build
```

#### Passo 3: Configurar Laravel
```bash
# Gerar chave da aplicação
docker-compose run --rm laravel php artisan key:generate

# Executar migrations
docker-compose exec laravel php artisan migrate

# Configurar permissões
docker-compose exec laravel chmod -R 775 storage bootstrap/cache
```

## 🌐 Serviços Disponíveis

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Laravel API | http://localhost:8000 | - |
| phpMyAdmin | http://localhost:8080 | usuário: `codemar`, senha: `codemar2025` |

## 📋 Comandos Úteis

### Gerenciamento de Containers
```bash
# Iniciar containers
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f laravel
docker-compose logs -f mysql
```

### Comandos Laravel
```bash
# Executar comando artisan
docker-compose exec laravel php artisan [comando]

# Exemplos:
docker-compose exec laravel php artisan migrate
docker-compose exec laravel php artisan tinker
docker-compose exec laravel php artisan make:controller NomeController
```

### Acesso aos Containers
```bash
# Acessar container Laravel
docker-compose exec laravel bash

# Acessar MySQL
docker-compose exec mysql mysql -u codemar -pcodemar2025 codemar_contratos
```

## 🗄️ Banco de Dados

### Credenciais MySQL
- **Host**: mysql (dentro do Docker) / localhost:3306 (externo)
- **Porta**: 3306
- **Banco**: codemar_contratos
- **Usuário**: codemar
- **Senha**: codemar2025
- **Root Password**: root123

### Backup e Restore
```bash
# Backup
docker-compose exec mysql mysqldump -u codemar -pcodemar2025 codemar_contratos > backup.sql

# Restore
docker-compose exec -T mysql mysql -u codemar -pcodemar2025 codemar_contratos < backup.sql
```

## 🔧 Desenvolvimento

### Estrutura de Arquivos
```
backend-laravel/
├── docker-compose.yml    # Configuração dos serviços
├── Dockerfile           # Imagem do Laravel
├── docker-setup.sh      # Script de configuração
├── .env                 # Variáveis de ambiente
└── ...
```

### Volumes
- **Código fonte**: Montado em `/var/www/html`
- **Storage**: Persistente para uploads e cache
- **MySQL**: Volume persistente para dados

### Portas
- **8000**: Laravel (API)
- **3306**: MySQL
- **8080**: phpMyAdmin

## 🐛 Troubleshooting

### Problemas Comuns

#### Container não inicia
```bash
# Verificar logs
docker-compose logs laravel

# Reconstruir containers
docker-compose down
docker-compose up -d --build
```

#### Erro de permissão
```bash
# Corrigir permissões
docker-compose exec laravel chmod -R 775 storage bootstrap/cache
```

#### Banco de dados não conecta
```bash
# Verificar se MySQL está rodando
docker-compose ps

# Verificar logs do MySQL
docker-compose logs mysql
```

#### Limpar tudo e recomeçar
```bash
# Parar e remover tudo
docker-compose down -v
docker system prune -f

# Reconstruir
./docker-setup.sh
```

## 📚 API Endpoints

### Importação de Arquivos
```bash
# Upload de arquivo
curl -X POST http://localhost:8000/api/imports \
  -F "file=@caminho/para/arquivo.xml"

# Listar importações
curl http://localhost:8000/api/imports
```

### Contratos
```bash
# Listar contratos
curl http://localhost:8000/api/contratos

# Buscar contrato por ID
curl http://localhost:8000/api/contratos/1
```

## 🔒 Segurança

### Para Produção
1. Alterar senhas padrão
2. Configurar SSL/TLS
3. Usar secrets do Docker
4. Configurar firewall
5. Atualizar imagens regularmente

### Exemplo de .env para produção
```env
APP_ENV=production
APP_DEBUG=false
DB_PASSWORD=senha_forte_aqui
MYSQL_ROOT_PASSWORD=senha_root_forte
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar logs: `docker-compose logs -f`
2. Consultar documentação Laravel
3. Verificar issues do projeto




