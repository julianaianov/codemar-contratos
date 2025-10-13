# 🚀 Como Configurar as Tabelas no Supabase

## 📋 Passo a Passo Completo

### 1. 🌐 Acessar o Supabase Dashboard

1. Vá para: **https://supabase.com/dashboard**
2. Faça login na sua conta
3. Selecione o projeto: **syhnkxbeftosviscvmmd**

### 2. 📊 Abrir o SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"** para criar uma nova query

### 3. 📝 Copiar e Colar o Código SQL

1. Abra o arquivo: `supabase/TABELAS-SUPABASE.sql`
2. **Copie todo o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique em **"Run"** para executar

### 4. ✅ Verificar se Funcionou

Execute estas queries para verificar:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

**Resultado esperado:**
```
table_name
----------
users
file_imports
contratos_importados
```

```sql
-- Verificar o usuário admin
SELECT * FROM users WHERE role = 'admin';
```

**Resultado esperado:**
```
id | name | email | role | is_active | department
---|------|-------|------|-----------|----------
[uuid] | Administrador | admin@codemar.com | admin | true | Presidência
```

## 🗄️ Estrutura das Tabelas Criadas

### 📋 Tabela `users`
```sql
- id (UUID, Primary Key)
- name (TEXT)
- email (TEXT, Unique)
- password (TEXT)
- role (admin/user)
- is_active (BOOLEAN)
- cpf (TEXT, Unique)
- department (TEXT)
- last_login_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 📁 Tabela `file_imports`
```sql
- id (UUID, Primary Key)
- original_filename (TEXT)
- stored_filename (TEXT)
- file_path (TEXT)
- file_type (csv/excel/xml/pdf)
- status (pending/processing/completed/failed)
- total_records (INTEGER)
- processed_records (INTEGER)
- successful_records (INTEGER)
- failed_records (INTEGER)
- error_message (TEXT)
- metadata (JSONB)
- user_id (UUID, Foreign Key)
- started_at (TIMESTAMP)
- completed_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 📄 Tabela `contratos_importados`
```sql
- id (UUID, Primary Key)
- file_import_id (UUID, Foreign Key)
- ano_numero (TEXT)
- numero_contrato (TEXT)
- ano (INTEGER)
- pa (TEXT)
- diretoria (TEXT)
- modalidade (TEXT)
- nome_empresa (TEXT)
- cnpj_empresa (TEXT)
- objeto (TEXT)
- data_assinatura (DATE)
- prazo (INTEGER)
- unidade_prazo (TEXT)
- valor_contrato (DECIMAL)
- vencimento (DATE)
- gestor_contrato (TEXT)
- fiscal_tecnico (TEXT)
- fiscal_administrativo (TEXT)
- suplente (TEXT)
- contratante (TEXT)
- contratado (TEXT)
- cnpj_contratado (TEXT)
- valor (DECIMAL)
- data_inicio (DATE)
- data_fim (DATE)
- status (vigente/encerrado/suspenso/rescindido)
- tipo_contrato (TEXT)
- secretaria (TEXT)
- fonte_recurso (TEXT)
- observacoes (TEXT)
- dados_originais (JSONB)
- pdf_path (TEXT)
- processado (BOOLEAN)
- erro_processamento (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔧 Configurações Adicionais (Opcional)

### 🔒 Row Level Security (RLS)

Se quiser ativar segurança por linha, execute:

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos_importados ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todos os usuários
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );
```

### 📊 Views Úteis

Para facilitar consultas, execute:

```sql
-- View para estatísticas de importações
CREATE VIEW import_stats AS
SELECT 
    file_type,
    status,
    COUNT(*) as total,
    SUM(total_records) as total_records,
    SUM(successful_records) as successful_records,
    SUM(failed_records) as failed_records
FROM file_imports
GROUP BY file_type, status;

-- View para estatísticas de contratos
CREATE VIEW contract_stats AS
SELECT 
    status,
    diretoria,
    COUNT(*) as total_contracts,
    SUM(COALESCE(valor_contrato, valor, 0)) as total_value
FROM contratos_importados
WHERE processado = true
GROUP BY status, diretoria;
```

## 🧪 Testar a Conexão

### 1. 📝 Teste Básico

```sql
-- Inserir um usuário de teste
INSERT INTO users (name, email, password, role, department) 
VALUES ('Teste', 'teste@codemar.com', 'senha123', 'user', 'Diretoria de Administração');

-- Verificar se foi inserido
SELECT * FROM users WHERE email = 'teste@codemar.com';
```

### 2. 🔗 Teste de Relacionamento

```sql
-- Inserir uma importação de teste
INSERT INTO file_imports (original_filename, stored_filename, file_path, file_type, status, user_id)
VALUES ('teste.xlsx', 'teste_123.xlsx', 'uploads/teste_123.xlsx', 'excel', 'completed', 
        (SELECT id FROM users WHERE email = 'teste@codemar.com' LIMIT 1));

-- Inserir um contrato de teste
INSERT INTO contratos_importados (file_import_id, numero_contrato, objeto, contratante, contratado, valor, status, processado)
VALUES (
    (SELECT id FROM file_imports WHERE original_filename = 'teste.xlsx' LIMIT 1),
    'TESTE-001',
    'Contrato de teste',
    'CODEMAR',
    'Empresa Teste',
    50000,
    'vigente',
    true
);

-- Verificar relacionamento
SELECT 
    c.numero_contrato,
    c.objeto,
    f.original_filename,
    u.name as usuario
FROM contratos_importados c
JOIN file_imports f ON c.file_import_id = f.id
JOIN users u ON f.user_id = u.id
WHERE c.numero_contrato = 'TESTE-001';
```

## 🚨 Solução de Problemas

### ❌ Erro: "extension uuid-ossp does not exist"
```sql
-- Execute primeiro:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### ❌ Erro: "relation already exists"
```sql
-- As tabelas já existem, isso é normal
-- Continue com os próximos passos
```

### ❌ Erro: "permission denied"
```sql
-- Verifique se você tem permissões de administrador no projeto
-- Entre em contato com o administrador do projeto
```

## ✅ Próximos Passos

1. **✅ Tabelas criadas** - Verificar se todas as 3 tabelas foram criadas
2. **🔧 Configurar variáveis de ambiente** no seu projeto Next.js
3. **🧪 Testar a conexão** com o código TypeScript
4. **📊 Inserir dados de teste** para validar funcionamento
5. **🚀 Integrar com o frontend** Next.js

## 📞 Suporte

Se encontrar problemas:
1. Verifique se copiou todo o código SQL
2. Execute as queries de verificação
3. Consulte os logs do Supabase
4. Verifique as permissões do projeto

---

**🎉 Pronto! Suas tabelas estão configuradas no Supabase!**




