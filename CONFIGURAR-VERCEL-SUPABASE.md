# 🚨 URGENTE: Configurar Variáveis do Supabase no Vercel

## ❌ **Problema Identificado**
O gráfico "Categoria Contratos" não aparece no deploy do Vercel porque as variáveis de ambiente do Supabase não estão configuradas.

**Erro atual:** `"Variáveis de ambiente do Supabase não configuradas"`

## 🔧 **Solução: Configurar no Vercel Dashboard**

### **1. Acesse o Vercel Dashboard**
- Vá para: https://vercel.com/dashboard
- Faça login na sua conta
- Selecione o projeto: `codemar-contratos`

### **2. Configure as Variáveis de Ambiente**
- Clique em **Settings** (Configurações)
- Clique em **Environment Variables** (Variáveis de Ambiente)
- Clique em **Add New** (Adicionar Nova)

### **3. Adicione estas 3 variáveis OBRIGATÓRIAS:**

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

### **4. Fazer Novo Deploy**
- Após adicionar as 3 variáveis
- Vá para **Deployments**
- Clique em **Redeploy** no último deploy
- Ou faça um novo commit para trigger automático

## ✅ **Verificação**

Após configurar, teste:
```bash
curl https://codemar-contratos.vercel.app/api/contratos/categorias
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": [...]
}
```

## 🔍 **Verificar Dados no Supabase**

Baseado na imagem que você mostrou, verifique se:

1. **RLS está desabilitado** nas tabelas:
   - `contratos_importados`
   - `termos_contratuais`
   - `instrumentos_contratuais`

2. **Execute no SQL Editor do Supabase:**
```sql
-- Verificar se RLS está desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('contratos_importados', 'termos_contratuais', 'instrumentos_contratuais');
```

3. **Se RLS estiver habilitado, desabilite:**
```sql
-- Desabilitar RLS temporariamente
ALTER TABLE contratos_importados DISABLE ROW LEVEL SECURITY;
ALTER TABLE termos_contratuais DISABLE ROW LEVEL SECURITY;
ALTER TABLE instrumentos_contratuais DISABLE ROW LEVEL SECURITY;
```

## 📊 **Dados Esperados**

O gráfico "Categoria Contratos" deve mostrar dados baseados na tabela `contratos_importados` com:
- **Categoria** (campo `categoria`)
- **Quantidade** de contratos por categoria
- **Valor total** por categoria

## 🎯 **Próximos Passos**

1. ✅ Configurar variáveis no Vercel
2. ✅ Verificar RLS no Supabase  
3. ✅ Fazer redeploy
4. ✅ Testar API endpoints
5. ✅ Verificar gráfico no dashboard

---

**🚨 IMPORTANTE:** Sem essas configurações, o sistema não consegue acessar o banco de dados do Supabase, por isso os gráficos aparecem como "Sem dados".
