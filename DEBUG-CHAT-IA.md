# 🔍 Debug do Chat de IA no Vercel

## ✅ **Status Atual:**
- **Backend API**: Funcionando ✅
- **Frontend Widget**: Pode ter problema ❓

## 🧪 **Testes Realizados:**

### **1. API Backend - FUNCIONANDO ✅**
```bash
curl -s "https://codemar-contratos.vercel.app/api/ai/chat" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"teste"}' | jq '.'
```

**Resultado:**
```json
{
  "success": true,
  "result": {
    "answer": "A consulta \"teste\" não fornece informações específicas...",
    "confidence": 100
  }
}
```

### **2. API Search - FUNCIONANDO ✅**
```bash
curl -s "https://codemar-contratos.vercel.app/api/ai/search" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"contratos"}' | jq '.success'
```

**Resultado:** `true`

## 🔍 **Possíveis Problemas no Frontend:**

### **1. Console do Navegador**
Abra o DevTools (F12) e verifique:
- **Console**: Há erros JavaScript?
- **Network**: As requisições para `/api/ai/chat` estão sendo feitas?
- **Response**: Qual é a resposta da API?

### **2. Verificar se o Widget está Carregado**
No console do navegador, digite:
```javascript
// Verificar se o componente está montado
document.querySelector('[data-testid="chat-widget"]')

// Verificar se há erros
console.log('Chat Widget Status:', window.chatWidgetStatus)
```

### **3. Testar Manualmente**
No console do navegador:
```javascript
// Testar envio de mensagem
fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'teste manual' })
})
.then(r => r.json())
.then(console.log)
```

## 🛠️ **Soluções Possíveis:**

### **1. Problema de CORS**
Se houver erro de CORS, verificar se o middleware está configurado corretamente.

### **2. Problema de JavaScript**
Se o widget não estiver carregando, pode ser:
- Erro de compilação
- Problema com imports
- Conflito de dependências

### **3. Problema de Estado**
Se o widget carrega mas não responde:
- Estado não está sendo atualizado
- Event listeners não estão funcionando
- Problema com React hooks

## 📋 **Checklist de Debug:**

- [ ] Abrir DevTools (F12)
- [ ] Verificar Console por erros
- [ ] Verificar Network tab
- [ ] Testar API manualmente
- [ ] Verificar se widget está montado
- [ ] Testar envio de mensagem
- [ ] Verificar resposta da API

## 🎯 **Próximos Passos:**

1. **Acessar o site**: https://codemar-contratos.vercel.app
2. **Abrir DevTools**: F12
3. **Clicar no chat**: Botão roxo no canto inferior direito
4. **Verificar console**: Há erros?
5. **Tentar enviar mensagem**: Funciona?
6. **Verificar Network**: Requisições sendo feitas?

## 📞 **Se o Problema Persistir:**

1. **Screenshot do Console** com erros
2. **Screenshot do Network tab** mostrando requisições
3. **Descrição do comportamento** observado
4. **Navegador usado** (Chrome, Firefox, Safari, etc.)

---

**💡 Dica:** O backend está funcionando, então o problema é no frontend. Verificar o console do navegador é o primeiro passo para identificar o problema.
