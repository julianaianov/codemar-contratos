# 🚀 Instruções Rápidas - Supabase

## 📋 Scripts Essenciais

### 1. **SCHEMA-PRINCIPAL.sql** ⭐
- **O que faz:** Cria todas as tabelas, índices, triggers e usuário admin
- **Quando usar:** Execute PRIMEIRO para configurar o banco de dados
- **Status:** ✅ Pronto para usar

### 2. **CONFIGURAR-STORAGE.sql**
- **O que faz:** Configura upload de arquivos (PDF, Excel, CSV)
- **Quando usar:** Execute APÓS o schema principal
- **Status:** ✅ Pronto para usar

### 3. **DESABILITAR-RLS.sql**
- **O que faz:** Desabilita Row Level Security (para testes)
- **Quando usar:** Apenas se precisar desabilitar segurança
- **Status:** ✅ Opcional

## 🎯 Passo a Passo

1. **Execute `SCHEMA-PRINCIPAL.sql`** no Supabase Dashboard
2. **Execute `CONFIGURAR-STORAGE.sql`** no Supabase Dashboard  
3. **Inicie o servidor:** `npm run dev`
4. **Acesse:** http://localhost:3000

## ✅ Sistema Pronto!

- ✅ Banco de dados configurado
- ✅ Upload de arquivos funcionando
- ✅ Autenticação configurada
- ✅ CRUD completo funcionando
- ✅ Compatível com backend Laravel

---
**🎉 Seu sistema de contratos CODEMAR está funcionando no Supabase!**
