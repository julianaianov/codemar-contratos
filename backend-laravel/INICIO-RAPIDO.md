# 🚀 Início Rápido - Backend Laravel

## Passo 1: Configurar MySQL

Execute o script de configuração:

```bash
cd backend-laravel
./setup-mysql.sh
```

O script vai solicitar:
- Host do MySQL (padrão: 127.0.0.1)
- Porta (padrão: 3306)
- Usuário (padrão: root)
- Senha
- Nome do banco (padrão: codemar_contratos)

O script automaticamente:
1. ✅ Configura o arquivo `.env`
2. ✅ Cria o banco de dados
3. ✅ Executa as migrations
4. ✅ Cria os diretórios necessários

## Passo 2: Iniciar o Servidor

```bash
php artisan serve
```

Servidor disponível em: **http://localhost:8000**

## Passo 3: Testar a API

### Testar com arquivo XML:

```bash
curl -X POST http://localhost:8000/api/imports \
  -F "file=@storage/app/examples/contratos-exemplo.xml"
```

### Testar com arquivo CSV:

```bash
curl -X POST http://localhost:8000/api/imports \
  -F "file=@storage/app/examples/contratos-exemplo.csv"
```

### Ver lista de importações:

```bash
curl http://localhost:8000/api/imports
```

### Ver estatísticas:

```bash
curl http://localhost:8000/api/imports/stats
```

## Passo 4: Ver os Dados no MySQL

```bash
mysql -u root -p codemar_contratos

# Ver importações
SELECT * FROM file_imports;

# Ver contratos importados
SELECT numero_contrato, contratado, valor, data_inicio FROM contratos_importados;
```

## 📡 Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/imports` | Upload e processa arquivo |
| GET | `/api/imports` | Lista importações |
| GET | `/api/imports/{id}` | Detalhes de importação |
| GET | `/api/imports/{id}/contratos` | Contratos da importação |
| GET | `/api/imports/stats` | Estatísticas |
| DELETE | `/api/imports/{id}` | Deleta importação |

## 🔧 Configuração Manual (Se Preferir)

### 1. Criar banco manualmente:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE codemar_contratos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Editar `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=codemar_contratos
DB_USERNAME=root
DB_PASSWORD=sua_senha
```

### 3. Executar migrations:

```bash
php artisan migrate
```

### 4. Criar diretórios:

```bash
mkdir -p storage/app/imports
chmod -R 775 storage
```

## ❌ Problemas Comuns

### Erro de conexão com MySQL:

```bash
# Verifique se o MySQL está rodando
sudo systemctl status mysql

# Inicie o MySQL se necessário
sudo systemctl start mysql
```

### Erro de permissão:

```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Erro "SQLSTATE[HY000] [1045]":

- Verifique usuário e senha no `.env`
- Teste a conexão: `mysql -u root -p`

## 📚 Documentação Completa

- **README-IMPORTACAO.md** - Documentação completa da API
- **BACKEND-LARAVEL-ESTRUTURA.md** - Arquitetura do sistema

## 🎯 Próximos Passos

Depois de configurar e testar o backend:

1. ✅ Integrar com o frontend Next.js
2. ✅ Criar páginas de upload
3. ✅ Criar visualização de importações
4. ✅ Adicionar exportação de dados


