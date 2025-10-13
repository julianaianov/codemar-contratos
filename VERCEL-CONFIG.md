# 🚀 Configuração para Vercel - codemar-contratos.vercel.app

## 📋 Variáveis de Ambiente para o Vercel

### 🔧 **Como configurar no Vercel Dashboard:**

1. **Acesse:** https://vercel.com/dashboard
2. **Selecione o projeto:** `codemar-contratos`
3. **Vá para:** Settings > Environment Variables
4. **Adicione as seguintes variáveis:**

---

## 🔑 **Variáveis de Ambiente (Produção)**

### **Supabase Configuration**
```
NEXT_PUBLIC_SUPABASE_URL = https://syhnkxbeftosviscvmmd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTM2NDcsImV4cCI6MjA3NTg4OTY0N30.ppUts-2J2FUqJOYz0VY1xwWXYG1CkylKIIJDGziYi4I
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMxMzY0NywiZXhwIjoyMDc1ODg5NjQ3fQ.SflWQ_60oTQsPMos0HM-RxuSoM-I0mlW2LCRY9kQJQ0
```

### **Next.js Configuration**
```
NEXTAUTH_URL = https://codemar-contratos.vercel.app
NEXTAUTH_SECRET = codemar_contratos_production_secret_2024_secure
```

### **Application Configuration**
```
NEXT_PUBLIC_APP_NAME = CODEMAR Contratos
NEXT_PUBLIC_APP_VERSION = 1.0.0
NEXT_PUBLIC_APP_ENVIRONMENT = production
```

### **File Upload Configuration**
```
NEXT_PUBLIC_MAX_FILE_SIZE = 20971520
NEXT_PUBLIC_ALLOWED_FILE_TYPES = xml,xlsx,xls,csv,pdf
```

### **API Configuration**
```
NEXT_PUBLIC_API_BASE_URL = https://codemar-contratos.vercel.app/api
NEXT_PUBLIC_API_TIMEOUT = 30000
```

### **Security Configuration**
```
NEXT_PUBLIC_ENABLE_RLS = true
NEXT_PUBLIC_ENABLE_AUTH = true
```

### **Logging Configuration**
```
NEXT_PUBLIC_LOG_LEVEL = warn
NEXT_PUBLIC_ENABLE_DEBUG = false
```

### **Environment**
```
NODE_ENV = production
```

---

## 🎯 **Passo a Passo no Vercel:**

### **1. Acessar o Dashboard**
- Vá para: https://vercel.com/dashboard
- Faça login na sua conta

### **2. Selecionar o Projeto**
- Clique no projeto `codemar-contratos`
- Se não existir, crie um novo projeto

### **3. Configurar Variáveis**
- Clique em **Settings**
- Clique em **Environment Variables**
- Clique em **Add New**

### **4. Adicionar cada variável**
- **Name:** Nome da variável (ex: `NEXT_PUBLIC_SUPABASE_URL`)
- **Value:** Valor da variável (ex: `https://syhnkxbeftosviscvmmd.supabase.co`)
- **Environment:** Selecione **Production** (ou All)
- Clique em **Save**

### **5. Repetir para todas as variáveis**
- Adicione todas as 15 variáveis listadas acima
- Certifique-se de selecionar **Production** para todas

### **6. Fazer Deploy**
- Após adicionar todas as variáveis
- Faça um novo deploy do projeto
- As variáveis serão aplicadas automaticamente

---

## ✅ **Verificação**

Após configurar, acesse:
- **URL:** https://codemar-contratos.vercel.app
- **Sistema deve funcionar** com todas as funcionalidades
- **Upload de arquivos** funcionando
- **Autenticação** funcionando
- **Banco de dados** conectado

---

## 🚨 **Importante**

- ✅ **NEXT_PUBLIC_*** variáveis são públicas (visíveis no frontend)
- 🔒 **Variáveis sem prefixo** são privadas (apenas backend)
- 🌍 **Production** = domínio vercel.app
- 🏠 **Development** = localhost:3000

---

**🎉 Após configurar todas as variáveis, seu sistema estará funcionando em produção!**

