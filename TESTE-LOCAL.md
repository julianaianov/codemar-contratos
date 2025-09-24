# 🧪 Guia de Teste Local - Dashboard e-Cidade

## 📋 Pré-requisitos

### 1. Banco PostgreSQL do e-cidade
Certifique-se de que o banco PostgreSQL do e-cidade-dev está rodando:

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Se não estiver rodando, iniciar:
sudo systemctl start postgresql
```

### 2. Configuração do Banco
O banco deve ter:
- **Host**: localhost
- **Porta**: 5432
- **Database**: ecidade
- **Usuário**: postgres
- **Senha**: postgres (ou sua senha configurada)

### 3. Schema e Tabelas
Certifique-se de que o schema `transparencia` existe com as tabelas:
- `receitas`
- `empenhos`
- `contratos`
- `folha_pagamento`
- `planocontas`

## 🚀 Configuração Rápida

### 1. Executar Script de Configuração
```bash
./setup-env.sh
```

### 2. Verificar Configurações
Edite o arquivo `.env.local` se necessário:
```bash
nano .env.local
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Executar o Dashboard
```bash
npm run dev
```

## 🔧 Configurações do Ambiente

### Arquivo `.env.local`
```env
# e-Cidade API Configuration
ECIDADE_API_URL=http://localhost:8000/api
ECIDADE_CLIENT_ID=test_client_id
ECIDADE_CLIENT_SECRET=test_client_secret

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here_change_this_in_production

# e-Cidade Database Configuration (PostgreSQL)
DB_PORTAL_HOST=localhost
DB_PORTAL_PORT=5432
DB_PORTAL_DATABASE=ecidade
DB_PORTAL_USERNAME=postgres
DB_PORTAL_PASSWORD=postgres

# Environment
NODE_ENV=development
```

## 🧪 Testando a Conexão

### 1. Modo Mock (Padrão)
- Acesse: `http://localhost:3000`
- Dashboard carrega com dados simulados
- Não requer conexão com banco

### 2. Modo Dados Reais
- Acesse: `http://localhost:3000`
- Ative o checkbox "Usar dados reais do e-Cidade"
- Dashboard conecta com banco PostgreSQL

## 🔍 Verificações

### 1. Testar Conexão com Banco
```bash
# Conectar ao PostgreSQL
psql -h localhost -p 5432 -U postgres -d ecidade

# Verificar schema transparencia
\dn

# Verificar tabelas
\dt transparencia.*
```

### 2. Testar Endpoints da API
```bash
# Testar endpoint de métricas
curl "http://localhost:3000/api/ecidade/database?path=dashboard/metrics"

# Testar endpoint de receitas
curl "http://localhost:3000/api/ecidade/database?path=receitas&year=2024"
```

### 3. Verificar Logs
```bash
# Ver logs do Next.js
npm run dev

# Ver logs do banco (se necessário)
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solução**: Verificar se PostgreSQL está rodando
```bash
sudo systemctl start postgresql
```

### Erro de Autenticação
```
Error: password authentication failed for user "postgres"
```
**Solução**: Verificar senha no `.env.local`

### Erro de Schema
```
Error: schema "transparencia" does not exist
```
**Solução**: Verificar se o schema existe no banco
```sql
CREATE SCHEMA IF NOT EXISTS transparencia;
```

### Erro de Tabelas
```
Error: relation "transparencia.receitas" does not exist
```
**Solução**: Verificar se as tabelas existem ou importar dados do e-cidade

## 📊 Dados de Teste

Se não houver dados no banco, você pode:

### 1. Usar Modo Mock
- Desative o checkbox "Usar dados reais do e-Cidade"
- Dashboard funcionará com dados simulados

### 2. Importar Dados do e-cidade
- Execute o e-cidade-dev
- Importe dados de exemplo
- Configure as tabelas do schema `transparencia`

## 🎯 Funcionalidades para Testar

### Dashboard Principal
- [ ] Métricas carregam corretamente
- [ ] Gráficos são exibidos
- [ ] Alternância entre mock e dados reais funciona

### Módulos Específicos
- [ ] Receitas: `/financeiro`
- [ ] Despesas: `/financeiro`
- [ ] Educação: `/educacao`
- [ ] Saúde: `/saude`
- [ ] RH: `/recursos-humanos`
- [ ] Patrimonial: `/patrimonial`

### Gráficos e Visualizações
- [ ] Gráficos de linha funcionam
- [ ] Gráficos de barras funcionam
- [ ] Gráficos de pizza funcionam
- [ ] Tabelas de dados carregam

## 🚀 Comandos Úteis

```bash
# Iniciar dashboard
npm run dev

# Build de produção
npm run build

# Verificar dependências
npm audit

# Limpar cache
rm -rf .next
npm run dev
```

## 📞 Suporte

Se encontrar problemas:

1. **Verificar logs** do terminal
2. **Verificar configurações** do `.env.local`
3. **Testar conexão** com banco
4. **Usar modo mock** para desenvolvimento

---

✅ **Dashboard configurado e pronto para teste!**
