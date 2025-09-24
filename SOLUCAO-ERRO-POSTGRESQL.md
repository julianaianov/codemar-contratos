# 🔧 Solução: Erro de Conexão PostgreSQL

## ❌ Problema Identificado
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

O dashboard está tentando conectar com PostgreSQL na porta 5432, mas o banco não está rodando.

## ✅ Soluções Disponíveis

### 🎯 Solução 1: Usar Modo Mock (Recomendado para Teste)
O dashboard já está funcionando com dados simulados! 

**Como usar:**
1. Acesse: `http://localhost:3000`
2. **NÃO** marque o checkbox "Usar dados reais do e-Cidade"
3. O dashboard funcionará com dados simulados

### 🎯 Solução 2: Instalar e Configurar PostgreSQL

#### 1. Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Verificar se está rodando
sudo systemctl status postgresql
```

#### 2. Configurar PostgreSQL
```bash
# Entrar como usuário postgres
sudo -u postgres psql

# Criar banco de dados
CREATE DATABASE ecidade;

# Criar usuário (se necessário)
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE ecidade TO postgres;

# Sair
\q
```

#### 3. Criar Schema e Tabelas
```bash
# Conectar ao banco
psql -h localhost -U postgres -d ecidade

# Criar schema transparencia
CREATE SCHEMA IF NOT EXISTS transparencia;

# Criar tabelas básicas (exemplo)
CREATE TABLE transparencia.receitas (
    id SERIAL PRIMARY KEY,
    exercicio INTEGER,
    valor DECIMAL(15,2),
    data DATE
);

CREATE TABLE transparencia.empenhos (
    id SERIAL PRIMARY KEY,
    exercicio INTEGER,
    valor DECIMAL(15,2),
    dataemissao DATE
);

# Inserir dados de exemplo
INSERT INTO transparencia.receitas (exercicio, valor, data) VALUES 
(2024, 100000.00, '2024-01-01'),
(2024, 150000.00, '2024-02-01');

INSERT INTO transparencia.empenhos (exercicio, valor, dataemissao) VALUES 
(2024, 80000.00, '2024-01-15'),
(2024, 120000.00, '2024-02-15');
```

### 🎯 Solução 3: Usar Docker (Alternativa)

#### 1. Instalar Docker
```bash
# Instalar Docker
sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

#### 2. Executar PostgreSQL no Docker
```bash
# Executar PostgreSQL
docker run --name ecidade-postgres \
  -e POSTGRES_DB=ecidade \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:13

# Verificar se está rodando
docker ps
```

#### 3. Criar Tabelas no Docker
```bash
# Conectar ao container
docker exec -it ecidade-postgres psql -U postgres -d ecidade

# Executar os mesmos comandos SQL da Solução 2
```

## 🧪 Testando as Soluções

### Teste 1: Modo Mock (Funciona Sempre)
```bash
# Acessar dashboard
curl http://localhost:3000

# Verificar se carrega sem erros
# Não marcar checkbox "Usar dados reais"
```

### Teste 2: Modo Real (Requer PostgreSQL)
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U postgres -d ecidade

# Acessar dashboard e marcar checkbox "Usar dados reais"
```

## 🔍 Verificação de Status

### Verificar PostgreSQL
```bash
# Status do serviço
sudo systemctl status postgresql

# Portas em uso
sudo netstat -tlnp | grep 5432

# Processos PostgreSQL
ps aux | grep postgres
```

### Verificar Dashboard
```bash
# Logs do dashboard
npm run dev

# Testar endpoint
curl "http://localhost:3000/api/ecidade/database?path=dashboard/metrics"
```

## 📋 Checklist de Configuração

### ✅ Para Modo Mock:
- [x] Dashboard rodando em `http://localhost:3000`
- [x] Checkbox "Usar dados reais" **DESMARCADO**
- [x] Dados simulados carregando
- [x] Gráficos funcionando

### ✅ Para Modo Real:
- [ ] PostgreSQL instalado e rodando
- [ ] Banco `ecidade` criado
- [ ] Schema `transparencia` criado
- [ ] Tabelas criadas com dados
- [ ] Checkbox "Usar dados reais" **MARCADO**
- [ ] Conexão funcionando

## 🚀 Comandos Rápidos

### Iniciar PostgreSQL (Ubuntu/Debian)
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Parar PostgreSQL
```bash
sudo systemctl stop postgresql
```

### Reiniciar PostgreSQL
```bash
sudo systemctl restart postgresql
```

### Verificar Conexão
```bash
psql -h localhost -U postgres -d ecidade -c "SELECT version();"
```

## 🎯 Recomendação

**Para teste rápido:** Use o **Modo Mock** (Solução 1)
- Dashboard funciona imediatamente
- Dados simulados para demonstração
- Não requer configuração de banco

**Para desenvolvimento:** Configure PostgreSQL (Solução 2 ou 3)
- Dados reais do e-cidade
- Funcionalidade completa
- Requer configuração inicial

---

✅ **Dashboard está funcionando!** Acesse `http://localhost:3000` e teste as funcionalidades.
