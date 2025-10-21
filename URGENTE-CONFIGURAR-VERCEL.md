# 🚨 URGENTE: Configurar Variáveis de Ambiente no Vercel

## ❌ **Problemas Identificados no Deploy:**

1. **Gráfico "Categoria Contratos"**: Mostra "Sem dados" 
2. **APIs do Supabase**: Retornam erro "Variáveis de ambiente do Supabase não configuradas"
3. **Chat de IA**: Funcionando ✅

## 🔧 **SOLUÇÃO: Configurar Variáveis no Vercel Dashboard**

### **Passo 1: Acessar o Vercel Dashboard**
- Vá para: https://vercel.com/dashboard
- Faça login na sua conta
- Selecione o projeto: `codemar-contratos`

### **Passo 2: Configurar Environment Variables**
- Clique em **Settings** (Configurações)
- Clique em **Environment Variables** (Variáveis de Ambiente)
- Clique em **Add New** (Adicionar Nova)

### **Passo 3: Adicionar as 3 Variáveis OBRIGATÓRIAS**

#### **Variável 1:**
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://syhnkxbeftosviscvmmd.supabase.co`
- **Environment:** Production
- **Save**

#### **Variável 2:**
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTM2NDcsImV4cCI6MjA3NTg4OTY0N30.ppUts-2J2FUqJOYz0VY1xwWXYG1CkylKIIJDGziYi4I`
- **Environment:** Production
- **Save**

#### **Variável 3:**
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMxMzY0NywiZXhwIjoyMDc1ODg5NjQ3fQ.SflWQ_60oTQsPMos0HM-RxuSoM-I0mlW2LCRY9kQJQ0`
- **Environment:** Production
- **Save**

### **Passo 4: Fazer Redeploy**
- Após adicionar as 3 variáveis
- Vá para **Deployments**
- Clique em **Redeploy** no último deploy
- Ou faça um novo commit para trigger automático

## ✅ **Verificação Após Configurar**

### **Teste 1: API de Categorias**
```bash
curl https://codemar-contratos.vercel.app/api/contratos/categorias
```
**Resultado esperado:**
```json
{
  "success": true,
  "data": [
    {
      "categoria": "PROCEDIMENTO LICITATORIO",
      "total": 796457352.64,
      "count": 103
    },
    ...
  ]
}
```

### **Teste 2: API de Contratos**
```bash
curl https://codemar-contratos.vercel.app/api/contratos/contratos
```
**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "count": 358
  }
}
```

### **Teste 3: Dashboard**
- Acesse: https://codemar-contratos.vercel.app
- O gráfico "Categoria Contratos" deve mostrar dados
- Não deve mais aparecer "Sem dados"

## 🔍 **Verificar RLS no Supabase**

Baseado na imagem que você mostrou, verifique se o RLS está desabilitado:

### **Execute no SQL Editor do Supabase:**
```sql
-- Verificar status do RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('contratos_importados', 'termos_contratuais', 'instrumentos_contratuais');
```

### **Se RLS estiver habilitado, desabilite:**
```sql
-- Desabilitar RLS temporariamente
ALTER TABLE contratos_importados DISABLE ROW LEVEL SECURITY;
ALTER TABLE termos_contratuais DISABLE ROW LEVEL SECURITY;
ALTER TABLE instrumentos_contratuais DISABLE ROW LEVEL SECURITY;
```

## 📊 **Dados que Devem Aparecer**

Após configurar, o gráfico deve mostrar:
- **Licitação** (103 contratos)
- **Dispensa** (94 contratos)
- **Adesão ATA** (13 contratos)
- **Inexigibilidade** (74 contratos)
- E outras categorias...

## 🎯 **Resumo do Problema**

- ✅ **Código**: Funcionando perfeitamente
- ✅ **Local**: Funcionando com dados
- ❌ **Vercel**: Variáveis de ambiente não configuradas
- ✅ **Chat IA**: Funcionando no Vercel

**Solução**: Configurar as 3 variáveis do Supabase no Vercel Dashboard

---

**🚨 IMPORTANTE:** Sem essas configurações, o sistema não consegue acessar o banco de dados do Supabase, por isso os gráficos aparecem como "Sem dados".
