# Chat Widget IA - Sistema CODEMAR

## 💬 Visão Geral

O Chat Widget IA é um assistente conversacional flutuante que fica sempre disponível na tela, permitindo aos usuários conversar naturalmente com a IA sobre contratos, minutas e dados do sistema.

## 🚀 Funcionalidades Implementadas

### ✅ Widget Flutuante
- **Sempre Visível**: Botão flutuante no canto inferior direito
- **Interface Responsiva**: Adapta-se a diferentes tamanhos de tela
- **Estado Persistente**: Lembra se estava aberto entre sessões
- **Acesso Rápido**: Botão no header para abrir o chat

### ✅ Chat Conversacional
- **Conversação Natural**: Interface de chat intuitiva
- **Contexto de Conversa**: IA lembra do histórico da conversa
- **Tipos de Chat**: Geral, Contratos e Minutas
- **Nível de Confiança**: Mostra confiança da IA em cada resposta

### ✅ Recursos Avançados
- **Histórico Persistente**: Conversas salvas no localStorage
- **Sugestões Rápidas**: Botões com perguntas comuns
- **Indicador de Mensagens**: Badge com número de mensagens
- **Limpeza de Chat**: Botão para limpar conversa

## 🎯 Como Usar

### 1. Acesso ao Chat
- **Botão Flutuante**: Clique no ícone de chat no canto inferior direito
- **Botão no Header**: Clique em "Chat IA" no header
- **Estado Persistente**: O chat lembra se estava aberto

### 2. Interface do Chat
- **Área de Mensagens**: Visualize a conversa com a IA
- **Campo de Entrada**: Digite sua mensagem
- **Botão Enviar**: Clique ou pressione Enter
- **Seletores de Tipo**: Escolha entre Geral, Contratos e Minutas

### 3. Tipos de Conversa
- **Geral**: Conversas sobre todo o sistema
- **Contratos**: Foco em análises de contratos
- **Minutas**: Especializado em modelos de minutas

## 🔧 Componentes Técnicos

### ChatWidget.tsx
Widget flutuante com:
- Interface de chat completa
- Gerenciamento de estado
- Integração com API
- Histórico persistente

### useChatWidget.ts
Hook para gerenciar:
- Estado do widget
- Persistência no localStorage
- Eventos de abertura/fechamento

### API /api/ai/chat
Endpoint para:
- Chat conversacional
- Contexto de conversa
- Diferentes tipos de chat

## 📍 Integração no Sistema

### AppShell (Todas as Páginas)
```tsx
<ChatWidget isOpen={isChatOpen} onToggle={toggleChat} />
```

### Header (Acesso Rápido)
```tsx
<button onClick={handleOpenChat}>
  <ChatBubbleLeftRightIcon className="h-5 w-5" />
  <span>Chat IA</span>
</button>
```

## 💡 Exemplos de Conversas

### Análise de Contratos
```
Usuário: Quais são os maiores contratos por valor?
IA: Com base nos dados disponíveis, os maiores contratos por valor são:
1. Contrato de Desenvolvimento de Software - R$ 500.000,00
2. Contrato de Serviços de Limpeza - R$ 250.000,00
3. Contrato de Consultoria Jurídica - R$ 180.000,00

Usuário: E qual diretoria tem mais gastos?
IA: A diretoria com mais gastos é a Administrativa, com um total de R$ 400.000,00 em contratos ativos.
```

### Busca de Minutas
```
Usuário: Qual minuta usar para acordo de cooperação?
IA: Para acordos de cooperação, recomendo a "Minuta de Acordo de Cooperação" que está disponível no sistema. Esta minuta é específica para acordos de cooperação técnica entre órgãos públicos.

Usuário: Tem alguma para contrato de fornecimento?
IA: Sim! Existe a "Minuta de Contrato de Fornecimento" que é ideal para contratos de fornecimento de bens. Esta minuta está otimizada para esse tipo específico de contrato.
```

## 🎨 Interface do Usuário

### Widget Fechado
- **Botão Flutuante**: Ícone de chat no canto inferior direito
- **Badge de Mensagens**: Mostra número de mensagens não lidas
- **Hover Effect**: Animação ao passar o mouse

### Widget Aberto
- **Header**: Título, botões de ação e seletor de tipo
- **Área de Mensagens**: Scroll automático para última mensagem
- **Campo de Entrada**: Input com botão de enviar
- **Sugestões**: Botões com perguntas comuns

### Estados Visuais
- **Carregando**: Indicador de "IA está pensando..."
- **Confiança**: Badge colorido com nível de confiança
- **Timestamp**: Hora de cada mensagem
- **Tipos de Mensagem**: Visual diferenciado para usuário e IA

## 🔍 Tipos de Chat

### Geral
- Análises gerais do sistema
- Insights e tendências
- Comparações entre dados
- Relatórios automáticos

### Contratos
- Análise de valores
- Fornecedores e diretorias
- Status e vencimentos
- Rankings e comparações

### Minutas
- Recomendações por tipo
- Análise de adequação
- Comparação de modelos
- Sugestões de uso

## 🚀 APIs Utilizadas

### Chat Conversacional
```
POST /api/ai/chat
{
  "message": "Pergunta do usuário",
  "chatType": "general|contracts|minutas",
  "conversationHistory": [...]
}
```

### Resposta
```json
{
  "success": true,
  "result": {
    "query": "Pergunta original",
    "answer": "Resposta da IA",
    "suggestions": ["Sugestão 1", "Sugestão 2"],
    "confidence": 85,
    "sources": ["Fonte 1"],
    "conversationId": "1234567890",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 💾 Persistência de Dados

### Histórico de Conversas
- **localStorage**: Conversas salvas localmente
- **Estado do Widget**: Lembra se estava aberto
- **Limpeza**: Botão para limpar histórico

### Estrutura de Dados
```typescript
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  confidence?: number;
}
```

## 🎯 Recursos Avançados

### Contexto de Conversa
- **Histórico**: Últimas 5 mensagens para contexto
- **Continuidade**: IA lembra do que foi discutido
- **Referências**: Pode referenciar mensagens anteriores

### Sugestões Inteligentes
- **Perguntas Comuns**: Botões com consultas frequentes
- **Sugestões Dinâmicas**: Baseadas no tipo de chat
- **Ações Rápidas**: Clique para usar sugestão

### Indicadores Visuais
- **Nível de Confiança**: 0-100% com cores
- **Timestamp**: Hora de cada mensagem
- **Status de Carregamento**: "IA está pensando..."
- **Badge de Mensagens**: Contador no botão flutuante

## 🔒 Segurança e Privacidade

### Dados Enviados
- Mensagens do usuário
- Histórico da conversa (últimas 5 mensagens)
- Tipo de chat selecionado
- Nenhum dado sensível

### Armazenamento Local
- Conversas salvas no localStorage
- Estado do widget persistente
- Dados não enviados para servidor externo

## 📱 Responsividade

### Desktop
- Widget fixo no canto inferior direito
- Tamanho: 384px x 600px
- Interface completa com todos os recursos

### Mobile
- Widget responsivo
- Interface otimizada para touch
- Botões maiores para facilitar uso

## 🛠️ Configuração

### Dependências
```json
{
  "@google/generative-ai": "^0.2.1"
}
```

### Variáveis de Ambiente
```env
GEMINI_API_KEY=AIzaSyCeHSGln21RVy5nmT-hTFUlgZfXucwZ-r8
```

## 🚨 Troubleshooting

### Chat não abre
- Verificar se o componente está sendo renderizado
- Confirmar se o hook está sendo usado
- Verificar console para erros

### Mensagens não enviam
- Verificar conexão com a internet
- Confirmar se a API está funcionando
- Verificar se a chave do Gemini está válida

### Histórico não salva
- Verificar se o localStorage está habilitado
- Confirmar se não há erros de JSON
- Verificar permissões do navegador

## 🔄 Próximas Funcionalidades

### Em Desenvolvimento
- **Busca por Voz**: Comandos de voz para o chat
- **Arquivos**: Envio de arquivos para análise
- **Notificações**: Alertas de novas respostas
- **Temas**: Personalização visual do chat

### Ideias Futuras
- **Chat Multimodal**: Texto, voz e imagem
- **Agentes Especializados**: IAs específicas por área
- **Integração com APIs Externas**: Dados em tempo real
- **Análise de Sentimentos**: Detecção de humor do usuário

---

**Desenvolvido com ❤️ usando Google Gemini AI**
