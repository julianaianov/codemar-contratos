# Sistema de Versões de Minutas - CODEMAR

## 📋 Visão Geral

O sistema de versões de minutas permite preservar os arquivos originais enviados e criar versões editadas separadas, mantendo o histórico completo e permitindo download e impressão tanto da versão original quanto das versões editadas.

## 🔄 Funcionalidades Implementadas

### ✅ Preservação de Arquivos Originais
- **Arquivo Original**: Sempre preservado sem alterações
- **Arquivo Editável**: Cópia que pode ser modificada
- **Separação Clara**: Dois arquivos distintos no sistema

### ✅ Sistema de Versões
- **Controle de Versão**: Numeração automática (v1, v2, v3...)
- **Rastreamento**: Identificação de versões originais vs editadas
- **Histórico**: Data de upload e última edição

### ✅ Download e Impressão
- **Download Original**: Arquivo DOCX original preservado
- **Download Editado**: Versão atual com edições
- **Impressão Original**: Layout otimizado da versão original
- **Impressão Editada**: Layout otimizado da versão editada

## 🏗️ Estrutura de Dados

### Interface MinutaModel
```typescript
interface MinutaModel {
  id: string;                    // ID único da minuta
  nome: string;                  // Nome da minuta
  descricao: string;             // Descrição opcional
  arquivo: string;               // Nome do arquivo editável
  arquivoOriginal: string;       // Nome do arquivo original preservado
  tamanho: number;               // Tamanho em bytes
  dataUpload: string;            // Data de upload original
  dataUltimaEdicao?: string;     // Data da última edição
  tipo: string;                  // Tipo do arquivo (DOCX)
  versao: number;                // Número da versão
  isEditada: boolean;            // Se é uma versão editada
  versaoOriginal?: string;       // ID da versão original
}
```

## 📁 Estrutura de Arquivos

### Organização no Servidor
```
public/minutas/
├── metadata.json                    # Metadados de todas as minutas
├── 1234567890_original_minuta.docx  # Arquivo original preservado
├── 1234567890_minuta.docx           # Arquivo editável
├── 1234567891_minuta_editada.docx   # Nova versão editada
└── ...
```

### Convenção de Nomenclatura
- **Original**: `{id}_original_{nome_arquivo}`
- **Editável**: `{id}_{nome_arquivo}`
- **Editada**: `{novo_id}_{nome_arquivo}`

## 🔧 APIs Implementadas

### 1. Upload de Minuta
```
POST /api/geracao-contratos/minutas
```
- Cria arquivo original preservado
- Cria arquivo editável
- Inicializa versão 1
- Marca como não editada

### 2. Salvamento de Edições
```
POST /api/geracao-contratos/minutas/[id]/save
```
- Cria nova versão editada
- Preserva referência ao original
- Incrementa número da versão
- Marca como editada

### 3. Download Original
```
GET /api/geracao-contratos/minutas/[id]/original
```
- Retorna arquivo original preservado
- Headers para download direto
- Nome de arquivo com sufixo "_original"

### 4. Impressão
```
GET /api/geracao-contratos/minutas/[id]/print?tipo=original|editada
```
- Gera HTML otimizado para impressão
- Inclui informações da minuta
- Auto-print no navegador
- Layout profissional

## 🎨 Interface do Usuário

### Indicadores Visuais
- **Badge Original**: Verde para versões originais
- **Badge Editada**: Azul para versões editadas
- **Número da Versão**: v1, v2, v3...
- **Datas**: Upload e última edição

### Menus de Ação
- **Download**: Dropdown com opções Original/Atual
- **Impressão**: Dropdown com opções Original/Atual
- **Edição**: Cria nova versão editada

## 📊 Fluxo de Trabalho

### 1. Upload Inicial
```
Usuário envia minuta.docx
    ↓
Sistema cria:
- arquivo_original.docx (preservado)
- arquivo.docx (editável)
    ↓
Versão 1, isEditada: false
```

### 2. Edição
```
Usuário edita minuta
    ↓
Sistema cria:
- nova_versao_editada.docx
    ↓
Versão 2, isEditada: true
versaoOriginal: ID da versão 1
```

### 3. Download/Impressão
```
Usuário escolhe:
- Original: arquivo_original.docx
- Atual: arquivo_editado.docx
```

## 🔍 Exemplos de Uso

### Upload de Nova Minuta
```javascript
const formData = new FormData();
formData.append('arquivo', file);
formData.append('nome', 'Minuta de Contrato');
formData.append('descricao', 'Modelo para contratos de fornecimento');

const response = await fetch('/api/geracao-contratos/minutas', {
  method: 'POST',
  body: formData
});
```

### Edição de Minuta
```javascript
const response = await fetch(`/api/geracao-contratos/minutas/${id}/save`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: '<h1>Conteúdo editado</h1>',
    nome: 'Minuta Editada'
  })
});
```

### Download Original
```javascript
window.open(`/api/geracao-contratos/minutas/${id}/original`, '_blank');
```

### Impressão
```javascript
// Impressão da versão editada
window.open(`/api/geracao-contratos/minutas/${id}/print?tipo=editada`, '_blank');

// Impressão da versão original
window.open(`/api/geracao-contratos/minutas/${id}/print?tipo=original`, '_blank');
```

## 🎯 Benefícios

### Para o Usuário
- **Segurança**: Arquivo original sempre preservado
- **Flexibilidade**: Pode editar sem medo de perder o original
- **Rastreabilidade**: Histórico completo de versões
- **Conveniência**: Download e impressão de qualquer versão

### Para o Sistema
- **Integridade**: Dados originais nunca perdidos
- **Auditoria**: Rastreamento completo de mudanças
- **Escalabilidade**: Sistema suporta múltiplas versões
- **Manutenibilidade**: Código organizado e bem estruturado

## 🔒 Segurança

### Preservação de Dados
- Arquivos originais nunca são sobrescritos
- Cada edição cria nova versão
- Histórico completo mantido

### Validação
- Verificação de existência de arquivos
- Validação de tipos de arquivo
- Tratamento de erros robusto

## 📱 Responsividade

### Interface Adaptativa
- Menus dropdown responsivos
- Indicadores visuais claros
- Funciona em desktop e mobile

### Impressão Otimizada
- Layout A4 otimizado
- Cabeçalho e rodapé profissionais
- Auto-print no navegador

## 🚀 Próximas Funcionalidades

### Em Desenvolvimento
- **Comparação de Versões**: Visualizar diferenças
- **Histórico Detalhado**: Timeline de mudanças
- **Aprovação de Versões**: Workflow de aprovação
- **Comentários**: Anotações em versões

### Ideias Futuras
- **Merge de Versões**: Combinar edições
- **Templates**: Versões base para novos documentos
- **Colaboração**: Múltiplos editores
- **Versionamento Git**: Controle de versão avançado

## 🛠️ Configuração

### Dependências
```json
{
  "docx": "^8.5.0",
  "mammoth": "^1.6.0"
}
```

### Estrutura de Diretórios
```
public/minutas/          # Arquivos de minutas
├── metadata.json        # Metadados
└── *.docx              # Arquivos DOCX
```

## 🔧 Troubleshooting

### Problemas Comuns

#### Arquivo Original Não Encontrado
- Verificar se arquivo existe no diretório
- Confirmar nomenclatura correta
- Verificar permissões de arquivo

#### Erro ao Salvar Edição
- Verificar se minuta original existe
- Confirmar permissões de escrita
- Verificar espaço em disco

#### Problema na Impressão
- Verificar se arquivo DOCX é válido
- Confirmar se mammoth consegue processar
- Verificar configuração do navegador

### Logs e Debug
- Logs detalhados no console
- Tratamento de erros específicos
- Mensagens de erro claras para usuário

---

**Sistema desenvolvido para garantir integridade e rastreabilidade das minutas CODEMAR** 📄✨

