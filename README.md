# e-Cidade Dashboard

Dashboard interativo para visualização de dados do sistema e-Cidade, desenvolvido com Next.js, TypeScript, Tailwind CSS e React.

## 🚀 Funcionalidades

### 📊 Dashboard Principal
- **Métricas Gerais**: Receitas, despesas, saldo orçamentário, execução
- **Indicadores de Gestão**: Eficiência orçamentária, custos por servidor/aluno
- **Gráficos Interativos**: Visualizações em tempo real dos dados municipais

### 💰 Módulo Financeiro
- **Orçamento**: Controle de receitas e despesas
- **Execução Orçamentária**: Acompanhamento da execução em tempo real
- **Relatórios**: Gráficos de evolução e distribuição

### 🏛️ Módulo Tributário
- **IPTU**: Controle de impostos prediais
- **ISSQN**: Imposto sobre serviços
- **Arrecadação**: Acompanhamento de receitas tributárias

### 🎓 Módulo Educação
- **Escolas**: Gestão de unidades escolares
- **Alunos**: Controle de matrículas e frequência
- **Indicadores**: Métricas educacionais

### 🏥 Módulo Saúde
- **Unidades de Saúde**: Gestão de postos e hospitais
- **Atendimentos**: Controle de consultas e procedimentos
- **Indicadores**: Métricas de saúde pública

### 👥 Módulo Recursos Humanos
- **Servidores**: Gestão de funcionários públicos
- **Folha de Pagamento**: Controle de salários e benefícios
- **Indicadores**: Métricas de RH

### 🏢 Módulo Patrimonial
- **Bens**: Inventário patrimonial
- **Licitações**: Processos de compras públicas
- **Contratos**: Gestão contratual

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado
- **Recharts** - Gráficos interativos
- **Heroicons** - Ícones
- **Framer Motion** - Animações

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd dashboard
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
ECIDADE_API_URL=http://localhost:8000/api
ECIDADE_CLIENT_ID=your_client_id
ECIDADE_CLIENT_SECRET=your_client_secret
```

4. **Execute o projeto**
```bash
npm run dev
```

## 🔧 Configuração da API

### Conectar com e-Cidade

O dashboard se conecta com a API do e-Cidade através de endpoints REST. Configure os seguintes endpoints na API do e-Cidade:

#### Autenticação
```http
POST /api/auth/login
Content-Type: application/json

{
  "cpf": "12345678901",
  "password": "senha123",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret"
}
```

#### Dashboard
```http
GET /api/dashboard/metrics
Authorization: Bearer {token}
```

#### Financeiro
```http
GET /api/financeiro/orcamento
GET /api/financeiro/receitas
GET /api/financeiro/despesas
GET /api/financeiro/receitas/chart
GET /api/financeiro/despesas/chart
```

#### Tributário
```http
GET /api/tributario/iptu
GET /api/tributario/issqn
GET /api/tributario/arrecadacao/chart
```

#### Educação
```http
GET /api/educacao/escolas
GET /api/educacao/alunos
GET /api/educacao/metrics
```

#### Saúde
```http
GET /api/saude/unidades
GET /api/saude/atendimentos
GET /api/saude/metrics
```

#### Recursos Humanos
```http
GET /api/recursos-humanos/servidores
GET /api/recursos-humanos/folha-pagamento
GET /api/recursos-humanos/metrics
```

#### Patrimonial
```http
GET /api/patrimonial/bens
GET /api/patrimonial/licitacoes
GET /api/patrimonial/metrics
```

## 📱 Responsividade

O dashboard é totalmente responsivo e funciona em:
- 📱 Dispositivos móveis
- 📱 Tablets
- 💻 Desktops
- 🖥️ Telas grandes

## 🎨 Personalização

### Temas
O dashboard suporta temas personalizáveis através do Tailwind CSS. Modifique as cores em `tailwind.config.js`.

### Componentes
Todos os componentes são modulares e podem ser facilmente customizados.

### Gráficos
Os gráficos são configuráveis e suportam diferentes tipos de visualização.

## 🚀 Deploy

### Vercel
```bash
npm run build
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Estrutura do Projeto

```
dashboard/
├── src/
│   ├── app/                 # Páginas Next.js
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes base
│   │   ├── charts/         # Componentes de gráficos
│   │   ├── dashboard/      # Componentes do dashboard
│   │   └── layout/         # Componentes de layout
│   ├── hooks/              # Custom hooks
│   ├── services/           # Serviços de API
│   ├── types/              # Tipos TypeScript
│   └── utils/              # Utilitários
├── public/                 # Arquivos estáticos
└── package.json           # Dependências
```

## 🔒 Segurança

- Autenticação OAuth2
- Tokens JWT
- CORS configurado
- Validação de dados
- Sanitização de inputs

## 📈 Performance

- Lazy loading de componentes
- Cache de dados com React Query
- Otimização de imagens
- Bundle splitting
- Tree shaking

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Coverage
npm run test:coverage
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, entre em contato:
- 📧 Email: suporte@ecidade.com.br
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Website: https://ecidade.com.br

---

Desenvolvido com ❤️ para a gestão municipal brasileira.

