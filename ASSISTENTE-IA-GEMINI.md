# Assistente IA CODEMAR - Powered by Google Gemini

## 🤖 Visão Geral

O Assistente IA CODEMAR é uma funcionalidade avançada que utiliza o Google Gemini AI para fornecer análises inteligentes, buscas semânticas e insights sobre contratos, minutas e dados do sistema.

## 🚀 Funcionalidades Implementadas

### ✅ Busca Inteligente
- **Análise de Contratos**: Pergunte sobre valores, fornecedores, diretorias e tendências
- **Busca em Minutas**: Encontre a minuta ideal para seu caso específico
- **Sugestões Automáticas**: Receba sugestões de consultas baseadas nos dados disponíveis
- **Respostas Contextuais**: Respostas precisas com nível de confiança

### ✅ Interface Integrada
- **Barra de Busca IA**: Disponível em páginas principais
- **Dashboard Dedicado**: Página exclusiva para o assistente IA
- **Consultas Recentes**: Histórico de buscas realizadas
- **Insights Automáticos**: Análises salvas com alta confiança

### ✅ APIs Implementadas
- **Busca Geral**: `/api/ai/search` - Análise de contratos e dados
- **Busca em Minutas**: `/api/ai/search/minutas` - Busca específica em minutas
- **Sugestões**: Geração automática de consultas úteis

## 🔧 Configuração

### Chave de API Gemini
```typescript
// Configurada em: src/services/gemini-ai.ts
const API_KEY = 'AIzaSyCeHSGln21RVy5nmT-hTFUlgZfXucwZ-r8';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

### Projeto Google Cloud
- **Nome**: CODEMAR contratos
- **ID do Projeto**: 61670817401
- **Modelo**: Gemini Pro

## 📊 Tipos de Consultas Suportadas

### 🔍 Consultas sobre Contratos
```
"Quais são os maiores contratos por valor?"
"Quais fornecedores têm mais contratos?"
"Qual diretoria tem mais gastos?"
"Quais contratos estão próximos do vencimento?"
"Qual o valor total dos contratos ativos?"
"Analise as tendências dos contratos"
```

### 📄 Consultas sobre Minutas
```
"Qual minuta usar para acordo de cooperação?"
"Preciso de uma minuta para contrato de serviços"
"Quais minutas estão disponíveis?"
"Recomende uma minuta para meu caso"
"Qual minuta é melhor para contrato de fornecimento?"
```

### 📈 Análises e Tendências
```
"Analise as tendências dos contratos"
"Quais são os padrões de gastos por diretoria?"
"Identifique fornecedores com mais contratos"
"Compare valores entre diferentes tipos de contrato"
```

## 🛠️ Como Usar

### 1. Acesso ao Assistente
- **Menu Principal**: Clique em "Assistente IA" no menu lateral
- **URL Direta**: `http://localhost:3000/assistente-ia`
- **Integrado**: Disponível na página de minutas

### 2. Fazendo Consultas
1. Digite sua pergunta na barra de busca
2. Pressione Enter ou clique no ícone de busca
3. Aguarde a resposta da IA
4. Explore sugestões relacionadas

### 3. Ações Rápidas
- **Análise de Valores**: Clique no botão "Análise de Valores"
- **Análise de Fornecedores**: Clique no botão "Análise de Fornecedores"
- **Análise de Tendências**: Clique no botão "Análise de Tendências"

## 📁 Estrutura de Arquivos

```
src/
├── services/
│   └── gemini-ai.ts                    # Serviço principal do Gemini AI
├── components/ai/
│   ├── AISearchBox.tsx                 # Componente de busca
│   └── AIDashboard.tsx                 # Dashboard do assistente
├── app/
│   ├── assistente-ia/
│   │   └── page.tsx                    # Página principal do assistente
│   └── api/ai/
│       ├── search/
│       │   ├── route.ts                # API de busca geral
│       │   └── minutas/
│       │       └── route.ts            # API de busca em minutas
```

## 🔍 Exemplos de Uso

### Exemplo 1: Análise de Contratos
**Pergunta**: "Quais são os maiores contratos por valor?"
**Resposta**: A IA analisa os dados e retorna uma lista dos contratos com maiores valores, incluindo fornecedores, diretorias e detalhes relevantes.

### Exemplo 2: Busca de Minutas
**Pergunta**: "Qual minuta usar para acordo de cooperação?"
**Resposta**: A IA analisa as minutas disponíveis e recomenda a mais adequada, explicando o motivo da escolha.

### Exemplo 3: Análise de Tendências
**Pergunta**: "Analise as tendências dos contratos"
**Resposta**: A IA identifica padrões, tendências de gastos, distribuição por diretorias e fornece insights valiosos.

## 🎯 Recursos Avançados

### Nível de Confiança
- **80-100%**: Alta confiança - Resposta muito precisa
- **60-79%**: Confiança média - Resposta razoável
- **0-59%**: Baixa confiança - Resposta com limitações

### Sugestões Inteligentes
- Baseadas nos dados disponíveis
- Contextualizadas para o tipo de consulta
- Atualizadas dinamicamente

### Histórico de Consultas
- Salvo no localStorage
- Consultas recentes facilmente acessíveis
- Possibilidade de re-executar consultas

## 🔒 Segurança e Privacidade

### Dados Enviados
- Apenas metadados dos contratos (não dados sensíveis)
- Consultas do usuário
- Nenhum dado pessoal é compartilhado

### Chave de API
- Configurada no servidor
- Não exposta no frontend
- Protegida por variáveis de ambiente

## 🚀 Próximas Funcionalidades

### 🔄 Em Desenvolvimento
- **Análise de Sentimentos**: Análise de feedback e comentários
- **Previsões**: Previsão de gastos e tendências futuras
- **Relatórios Automáticos**: Geração automática de relatórios
- **Integração com Chat**: Interface de chat mais natural

### 💡 Ideias Futuras
- **Análise de Imagens**: Análise de documentos e imagens
- **Tradução Automática**: Suporte a múltiplos idiomas
- **Integração com APIs Externas**: Dados de fornecedores externos
- **Machine Learning**: Modelos personalizados para CODEMAR

## 🛠️ Troubleshooting

### Erro: "Erro ao processar consulta"
- Verificar conexão com a internet
- Confirmar se a chave de API está válida
- Tentar uma consulta mais simples

### Erro: "Nenhuma minuta encontrada"
- Verificar se há minutas cadastradas
- Fazer upload de minutas primeiro
- Usar o script de importação

### Resposta com baixa confiança
- Reformular a pergunta
- Ser mais específico na consulta
- Verificar se os dados estão disponíveis

## 📞 Suporte

Para dúvidas ou problemas com o Assistente IA:
1. Verificar a documentação
2. Testar com consultas simples
3. Verificar logs do console
4. Contatar o suporte técnico

---

**Desenvolvido com ❤️ usando Google Gemini AI**
