# Dashboard e-Cidade

Dashboard interativo para visualização de dados municipais do sistema e-Cidade, conectando diretamente com o banco PostgreSQL do e-cidade-dev.

## Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado e cache
- **Recharts** - Gráficos e visualizações
- **Heroicons** - Ícones
- **PostgreSQL** - Conexão direta com banco do e-cidade

## Funcionalidades

- 📊 **Dashboard Principal** - Métricas gerais e KPIs
- 💰 **Módulo Financeiro** - Receitas, despesas e orçamento
- 🏛️ **Módulo Tributário** - IPTU, ISSQN e arrecadação
- 🎓 **Módulo Educação** - Escolas, alunos e indicadores
- 🏥 **Módulo Saúde** - Unidades de saúde e atendimentos
- 👥 **Recursos Humanos** - Servidores e folha de pagamento
- 🏢 **Patrimonial** - Bens e licitações
- 📈 **Relatórios** - Gráficos e exportação de dados
- 🔄 **Dados Reais** - Conexão direta com banco do e-cidade

## Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd dashboard
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
# e-Cidade API Configuration
ECIDADE_API_URL=http://localhost:8000/api
ECIDADE_CLIENT_ID=your_client_id
ECIDADE_CLIENT_SECRET=your_client_secret

# e-Cidade Database Configuration (PostgreSQL)
DB_PORTAL_HOST=localhost
DB_PORTAL_PORT=5432
DB_PORTAL_DATABASE=ecidade
DB_PORTAL_USERNAME=postgres
DB_PORTAL_PASSWORD=your_password

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. Execute o projeto:
```bash
npm run dev
```

5. Acesse: `http://localhost:3000`

## Conexão com e-Cidade

O dashboard se conecta diretamente com o banco PostgreSQL do e-cidade-dev, seguindo a mesma estrutura do projeto nova-transparencia:

### Estrutura de Conexão
- **Banco**: PostgreSQL do e-cidade
- **Schema**: `transparencia`
- **Tabelas principais**:
  - `receitas` - Dados de receitas
  - `empenhos` - Dados de despesas
  - `contratos` - Contratos municipais
  - `folha_pagamento` - Folha de pagamento
  - `planocontas` - Plano de contas

### Endpoints da API
- `/api/ecidade/database` - Endpoint principal para dados do banco
- Parâmetros suportados:
  - `path` - Tipo de dados (receitas, despesas, etc.)
  - `year` - Ano dos dados
  - `type` - Tipo de classificação
  - `mode` - Modo de exibição

### Exemplo de Uso
```typescript
// Buscar receitas do ano 2024
const receitas = await fetch('/api/ecidade/database?path=receitas&year=2024');

// Buscar despesas por tipo
const despesas = await fetch('/api/ecidade/database?path=despesas&year=2024&type=1');
```

## Estrutura do Projeto

```
src/
├── app/                    # Páginas Next.js
│   └── api/               # API Routes
│       └── ecidade/       # Endpoints do e-cidade
├── components/             # Componentes React
│   ├── charts/            # Componentes de gráficos
│   ├── dashboard/         # Componentes do dashboard
│   ├── layout/            # Componentes de layout
│   └── ui/                # Componentes de UI
├── hooks/                 # Custom hooks
│   ├── useECidadeData.ts  # Hooks com dados mock
│   └── useECidadeDatabaseData.ts # Hooks com dados reais
├── services/              # Serviços de API
│   ├── ecidade-api.ts    # API original
│   └── ecidade-database-api.ts # API de banco
├── types/                 # Definições TypeScript
└── utils/                 # Utilitários
```

## Modos de Operação

### 1. Modo Mock (Padrão)
- Usa dados simulados para desenvolvimento
- Não requer conexão com banco
- Ideal para testes e demonstrações

### 2. Modo Dados Reais
- Conecta diretamente com banco PostgreSQL do e-cidade
- Dados em tempo real
- Requer configuração do banco

Para alternar entre os modos, use o checkbox "Usar dados reais do e-Cidade" no dashboard principal.

## Uso

### Dashboard Principal
- Visualização de métricas gerais
- Gráficos de receitas e despesas
- Indicadores de performance
- Alternância entre dados mock e reais

### Módulos Específicos
- Navegue pelos módulos no menu lateral
- Filtre dados por período e categoria
- Exporte relatórios em diferentes formatos
- Visualize dados em gráficos interativos

### Autenticação
- Login com CPF e senha
- Tokens JWT para autenticação
- Renovação automática de tokens

## Desenvolvimento

### Scripts Disponíveis
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Verificação de código

### Adicionando Novos Módulos
1. Crie o componente na pasta `components/`
2. Adicione a rota em `app/`
3. Implemente os hooks em `hooks/`
4. Adicione os tipos em `types/`
5. Crie endpoint em `app/api/ecidade/database/`

### Estrutura de Dados
Os dados seguem a mesma estrutura do nova-transparencia:
- **Receitas**: Baseadas na tabela `transparencia.receitas`
- **Despesas**: Baseadas na tabela `transparencia.empenhos`
- **Contratos**: Baseadas na tabela `transparencia.contratos`
- **Folha**: Baseadas na tabela `transparencia.folha_pagamento`

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.