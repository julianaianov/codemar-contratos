# Busca Inteligente Global - Sistema CODEMAR

## 🌟 Visão Geral

A Busca Inteligente Global é uma funcionalidade avançada que permite aos usuários fazer consultas inteligentes sobre contratos, minutas e dados do sistema em qualquer página, utilizando o Google Gemini AI.

## 🚀 Funcionalidades Implementadas

### ✅ Busca Global Acessível
- **Botão no Header**: Acesso rápido em todas as páginas
- **Atalho de Teclado**: Ctrl+K (Windows/Linux) ou Cmd+K (Mac)
- **Modal Responsivo**: Interface otimizada para desktop e mobile
- **Tipos de Busca**: Geral, Contratos e Minutas

### ✅ Integração em Páginas Específicas
- **Página de Contratos**: Busca inteligente específica para contratos
- **Página de Minutas**: Busca inteligente específica para minutas
- **Página do Assistente IA**: Dashboard dedicado com funcionalidades avançadas

### ✅ Componentes Criados
- **`GlobalAISearch`**: Modal de busca global
- **`QuickAISearch`**: Componente de busca rápida para páginas específicas
- **`useGlobalSearch`**: Hook para gerenciar estado global
- **Integração no Header**: Botão sempre visível

## 🎯 Como Usar

### 1. Acesso Global
- **Botão no Header**: Clique em "Busca IA" no canto superior direito
- **Atalho de Teclado**: Pressione `Ctrl+K` ou `Cmd+K` em qualquer página
- **Menu Lateral**: Acesse "Assistente IA" para funcionalidades avançadas

### 2. Tipos de Busca
- **Geral**: Busca em todo o sistema (contratos, minutas, dados)
- **Contratos**: Busca específica em contratos e análises
- **Minutas**: Busca específica em modelos de minutas

### 3. Exemplos de Consultas
```
"Quais são os maiores contratos por valor?"
"Qual minuta usar para acordo de cooperação?"
"Analise as tendências dos contratos"
"Quais fornecedores têm mais contratos?"
"Qual diretoria tem mais gastos?"
```

## 🔧 Componentes Técnicos

### GlobalAISearch.tsx
Modal de busca global com:
- Interface responsiva
- Seleção de tipo de busca
- Resultados com nível de confiança
- Sugestões de consultas relacionadas
- Atalhos de teclado

### QuickAISearch.tsx
Componente de busca rápida com:
- Modo compacto e normal
- Integração em páginas específicas
- Resultados inline
- Sugestões automáticas

### useGlobalSearch.ts
Hook para gerenciar:
- Estado global da busca
- Eventos customizados
- Abertura/fechamento do modal

## 📍 Integração nas Páginas

### Header (Todas as Páginas)
```tsx
<button onClick={handleOpenGlobalSearch}>
  <SparklesIcon className="h-5 w-5" />
  <span>Busca IA</span>
  <span>Ctrl+K</span>
</button>
```

### Página de Contratos
```tsx
<QuickAISearch
  placeholder="Ex: Quais são os maiores contratos por valor?"
  searchType="contracts"
  className="max-w-2xl"
/>
```

### Página de Minutas
```tsx
<QuickAISearch
  placeholder="Ex: Qual minuta usar para acordo de cooperação?"
  searchType="minutas"
  className="max-w-2xl"
/>
```

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl+K` / `Cmd+K` | Abrir busca global |
| `Esc` | Fechar busca global |
| `Enter` | Executar busca |

## 🎨 Interface do Usuário

### Modal de Busca Global
- **Header**: Título e botão de fechar
- **Input**: Campo de busca com ícone e botão
- **Seletores**: Tipo de busca (Geral, Contratos, Minutas)
- **Resultados**: Resposta da IA com confiança
- **Sugestões**: Consultas relacionadas
- **Footer**: Informações sobre atalhos

### Busca Rápida
- **Modo Normal**: Interface completa com resultados detalhados
- **Modo Compacto**: Interface reduzida para espaços pequenos
- **Resultados Inline**: Respostas integradas na página

## 🔍 Tipos de Consultas Suportadas

### 📊 Análise de Contratos
- Valores e tendências
- Fornecedores e diretorias
- Status e vencimentos
- Comparações e rankings

### 📄 Busca em Minutas
- Recomendações por tipo
- Análise de adequação
- Sugestões de uso
- Comparação de modelos

### 📈 Análises Gerais
- Tendências do sistema
- Padrões de gastos
- Insights automáticos
- Relatórios inteligentes

## 🚀 APIs Utilizadas

### Busca Geral
```
GET /api/ai/search?q=consulta&type=general
```

### Busca em Contratos
```
GET /api/ai/search?q=consulta&type=contracts
```

### Busca em Minutas
```
GET /api/ai/search/minutas?q=consulta
```

### Sugestões
```
GET /api/ai/search?type=suggestions
```

## 💡 Recursos Avançados

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

## 🛠️ Configuração

### Variáveis de Ambiente
```env
GEMINI_API_KEY=AIzaSyCeHSGln21RVy5nmT-hTFUlgZfXucwZ-r8
```

### Dependências
```json
{
  "@google/generative-ai": "^0.2.1"
}
```

## 📱 Responsividade

### Desktop
- Modal centralizado
- Interface completa
- Atalhos de teclado

### Mobile
- Modal responsivo
- Interface otimizada
- Touch-friendly

## 🚨 Troubleshooting

### Erro: "Erro ao processar consulta"
- Verificar conexão com a internet
- Confirmar se a chave de API está válida
- Tentar uma consulta mais simples

### Modal não abre
- Verificar se o evento está sendo disparado
- Confirmar se o hook está sendo usado
- Verificar console para erros

### Atalho não funciona
- Verificar se não há conflitos com outros atalhos
- Confirmar se o evento está sendo escutado
- Testar em diferentes navegadores

## 🔄 Próximas Funcionalidades

### Em Desenvolvimento
- **Busca por Voz**: Comandos de voz para busca
- **Histórico Avançado**: Histórico com favoritos
- **Busca em Tempo Real**: Sugestões enquanto digita
- **Integração com Chat**: Interface de chat mais natural

### Ideias Futuras
- **Busca Multimodal**: Busca por texto, voz e imagem
- **Análise Preditiva**: Previsões baseadas em IA
- **Integração com APIs Externas**: Dados de fornecedores
- **Personalização**: Adaptação às preferências do usuário

---

**Desenvolvido com ❤️ usando Google Gemini AI**
