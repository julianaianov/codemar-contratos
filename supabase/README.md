# Supabase Backend - Sistema de Contratos CODEMAR

Este diretório contém a implementação completa do backend usando Supabase, replicando toda a funcionalidade do backend Laravel original.

## Estrutura

```
supabase/
├── client.ts              # Cliente Supabase configurado
├── types.ts               # Tipos TypeScript para o banco de dados
├── config.ts              # Configurações do sistema
├── index.ts               # Exportações principais
├── models/                # Modelos de dados (equivalente aos Models Laravel)
│   ├── User.ts
│   ├── FileImport.ts
│   └── ContratoImportado.ts
├── controllers/           # Controllers (equivalente aos Controllers Laravel)
│   ├── ContratoController.ts
│   ├── AdminController.ts
│   └── FileImportController.ts
├── services/              # Serviços de negócio
│   └── FileImportService.ts
└── auth/                  # Sistema de autenticação
    └── AuthService.ts
```

## Configuração

### Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTM2NDcsImV4cCI6MjA3NTg4OTY0N30.ppUts-2J2FUqJOYz0VY1xwWXYG1CkylKIIJDGziYi4I
SUPABASE_SERVICE_KEY=sua_service_key_aqui
```

### URL do Projeto

```
https://syhnkxbeftosviscvmmd.supabase.co
```

## Funcionalidades Implementadas

### 1. Autenticação
- Login/Logout
- Registro de usuários
- Verificação de tokens
- Middleware de autenticação e autorização
- Suporte a roles (admin/user)

### 2. Gestão de Usuários
- CRUD completo de usuários
- Filtros e paginação
- Controle de acesso por roles
- Estatísticas de usuários

### 3. Importação de Arquivos
- Suporte a CSV, Excel, XML e PDF
- Processamento assíncrono
- OCR para PDFs
- Validação de dados
- Relatórios de importação

### 4. Gestão de Contratos
- CRUD completo de contratos
- Filtros avançados
- Estatísticas e métricas
- Busca por diretorias
- Processamento de dados originais

### 5. Dashboard Administrativo
- Estatísticas gerais
- Relatórios de importação
- Atividade recente
- Controle de armazenamento

## Uso

### Importação Básica

```typescript
import { 
  ContratoController, 
  AdminController, 
  FileImportController,
  AuthService 
} from './supabase'
```

### Exemplo de Uso - Contratos

```typescript
// Listar contratos
const contratos = await ContratoController.index({
  status: 'vigente',
  diretoria: 'Diretoria de Administração',
  per_page: 20
})

// Criar contrato
const novoContrato = await ContratoController.store({
  numero_contrato: 'CONTRATO-001',
  objeto: 'Prestação de serviços',
  contratante: 'CODEMAR',
  contratado: 'Empresa XYZ',
  valor: 100000,
  data_inicio: '2024-01-01',
  data_fim: '2024-12-31',
  status: 'vigente'
})
```

### Exemplo de Uso - Autenticação

```typescript
// Login
const loginResult = await AuthService.login({
  email: 'admin@codemar.com',
  password: 'senha123'
})

// Verificar token
const user = await AuthService.authenticate(token)
```

### Exemplo de Uso - Importação

```typescript
// Upload de arquivo
const file = new File(['conteudo'], 'contratos.xlsx')
const importResult = await FileImportController.store({
  file,
  diretoria: 'Diretoria de Administração',
  userId: 'user-id'
})
```

## Diferenças do Laravel

### Vantagens do Supabase
- **Real-time**: Atualizações em tempo real
- **Escalabilidade**: Infraestrutura gerenciada
- **Segurança**: Row Level Security (RLS)
- **Performance**: CDN global
- **Simplicidade**: Menos configuração

### Adaptações Feitas
- **Paginação**: Implementada manualmente (Supabase não tem paginação automática)
- **Validação**: Validação no frontend/backend TypeScript
- **Relacionamentos**: Implementados via queries manuais
- **Upload**: Preparado para Supabase Storage
- **Autenticação**: Sistema customizado (pode usar Supabase Auth)

## Próximos Passos

1. **Configurar Supabase Storage** para upload de arquivos
2. **Implementar RLS** (Row Level Security) no banco
3. **Migrar dados** do Laravel para Supabase
4. **Configurar webhooks** para processamento assíncrono
5. **Implementar cache** para melhor performance
6. **Adicionar testes** unitários e de integração

## Banco de Dados

### Tabelas Necessárias

```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  cpf TEXT UNIQUE,
  department TEXT,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Importações de arquivo
CREATE TABLE file_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('csv', 'excel', 'xml', 'pdf')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB,
  user_id UUID REFERENCES users(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contratos importados
CREATE TABLE contratos_importados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_import_id UUID REFERENCES file_imports(id) ON DELETE CASCADE,
  -- Campos específicos
  ano_numero TEXT,
  numero_contrato TEXT,
  ano INTEGER,
  pa TEXT,
  diretoria TEXT,
  modalidade TEXT,
  nome_empresa TEXT,
  cnpj_empresa TEXT,
  objeto TEXT,
  data_assinatura DATE,
  prazo INTEGER,
  unidade_prazo TEXT,
  valor_contrato DECIMAL(15,2),
  vencimento DATE,
  gestor_contrato TEXT,
  fiscal_tecnico TEXT,
  fiscal_administrativo TEXT,
  suplente TEXT,
  -- Campos legados
  contratante TEXT,
  contratado TEXT,
  cnpj_contratado TEXT,
  valor DECIMAL(15,2),
  data_inicio DATE,
  data_fim DATE,
  status TEXT CHECK (status IN ('vigente', 'encerrado', 'suspenso', 'rescindido')),
  tipo_contrato TEXT,
  secretaria TEXT,
  fonte_recurso TEXT,
  observacoes TEXT,
  dados_originais JSONB,
  pdf_path TEXT,
  processado BOOLEAN DEFAULT false,
  erro_processamento TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Suporte

Para dúvidas ou problemas, consulte a documentação do Supabase ou entre em contato com a equipe de desenvolvimento.




