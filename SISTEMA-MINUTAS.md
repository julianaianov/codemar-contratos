# Sistema de Geração de Contratos - Minutas

## 📋 Visão Geral

O sistema de minutas permite o upload, gerenciamento e download de modelos de contratos em formato DOCX. Os usuários podem enviar seus modelos de minutas e utilizá-los para gerar novos contratos.

## 🚀 Funcionalidades

### ✅ Implementadas

- **Upload de Minutas**: Envio de arquivos .docx com metadados
- **Listagem**: Visualização de todas as minutas com informações detalhadas
- **Visualização Integrada**: Visualizar minutas diretamente no navegador (DOCX → HTML)
- **Edição Integrada**: Editar minutas diretamente no navegador com editor rico
- **Download**: Download de minutas para uso local
- **Exclusão**: Remoção de minutas do sistema
- **Estatísticas**: Contadores de minutas, tamanho total, etc.
- **Importação em Lote**: Script para importar múltiplas minutas de uma pasta

### 🔄 Em Desenvolvimento

- **Edição de Metadados**: Alterar nome e descrição das minutas
- **Categorização**: Organizar minutas por tipo/categoria
- **Versões**: Controle de versões dos modelos
- **Geração de Contratos**: Usar minutas para criar novos contratos

## 📁 Estrutura de Arquivos

```
dashboard/
├── src/app/geracao-contratos/
│   ├── minutas/
│   │   └── page.tsx                    # Página principal de minutas
│   └── page.tsx                        # Página de geração de contratos
├── src/app/api/geracao-contratos/minutas/
│   ├── route.ts                        # API: Listar minutas
│   ├── upload/
│   │   └── route.ts                    # API: Upload de minutas
│   └── [id]/
│       ├── route.ts                    # API: CRUD de minuta específica
│       └── download/
│           └── route.ts                # API: Download de minuta
├── public/minutas/                     # Armazenamento físico dos arquivos
│   └── metadata.json                   # Metadados das minutas
└── scripts/
    └── import-minutas.js               # Script de importação em lote
```

## 🛠️ Como Usar

### 1. Acessar o Sistema

Navegue para: `http://localhost:3000/geracao-contratos/minutas`

### 2. Upload Manual

1. Clique em "Nova Minuta"
2. Selecione um arquivo .docx
3. Preencha o nome e descrição
4. Clique em "Enviar"

### 3. Importação em Lote

Para importar múltiplas minutas de uma pasta:

```bash
# Navegar para o diretório do projeto
cd /home/user/codemar-contratos/dashboard

# Executar script de importação
node scripts/import-minutas.js "/caminho/para/pasta/com/minutas"

# Exemplo com a pasta mencionada:
node scripts/import-minutas.js "/home/user/ID._3.0_-_MINUTA_DE_ACORDO_DE_COOPERAÇAO_-Pós_Compliance"
```

### 4. Gerenciar Minutas

- **Visualizar/Editar**: Clique no ícone de olho para abrir o visualizador integrado
- **Modo Visualização**: Visualize o conteúdo da minuta convertido para HTML
- **Modo Edição**: Clique em "Editar" para editar o conteúdo com editor rico
- **Salvar**: Salve as alterações diretamente no arquivo DOCX
- **Download**: Baixe o arquivo original ou editado
- **Excluir**: Clique no ícone de lixeira para remover a minuta

## 📊 API Endpoints

### GET `/api/geracao-contratos/minutas`
Lista todas as minutas cadastradas.

**Resposta:**
```json
[
  {
    "id": "1234567890abcdef",
    "nome": "Minuta de Acordo de Cooperação",
    "descricao": "Modelo para acordos de cooperação técnica",
    "arquivo": "1234567890abcdef_minuta.docx",
    "tamanho": 24576,
    "dataUpload": "2024-01-15T10:30:00.000Z",
    "tipo": "DOCX"
  }
]
```

### POST `/api/geracao-contratos/minutas/upload`
Upload de nova minuta.

**FormData:**
- `arquivo`: Arquivo .docx
- `nome`: Nome da minuta
- `descricao`: Descrição (opcional)

### GET `/api/geracao-contratos/minutas/[id]/preview`
Converte minuta DOCX para HTML para visualização.

**Resposta:**
```json
{
  "success": true,
  "html": "<p>Conteúdo convertido para HTML</p>",
  "messages": [],
  "minuta": {
    "id": "1234567890abcdef",
    "nome": "Minuta de Acordo",
    "descricao": "Descrição da minuta",
    "dataUpload": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST `/api/geracao-contratos/minutas/[id]/save`
Salva edições da minuta.

**Body:**
```json
{
  "content": "Conteúdo HTML editado"
}
```

### GET `/api/geracao-contratos/minutas/[id]/download`
Download de minuta específica.

### DELETE `/api/geracao-contratos/minutas/[id]`
Exclui uma minuta.

## 🔧 Configurações

### Limites
- **Tamanho máximo**: 10MB por arquivo
- **Formatos aceitos**: Apenas .docx
- **Armazenamento**: `public/minutas/`

### Segurança
- Validação de tipo de arquivo
- Sanitização de nomes de arquivo
- Verificação de tamanho

## 🚨 Solução de Problemas

### Erro: "Arquivo não encontrado"
- Verifique se o arquivo foi enviado corretamente
- Confirme se o diretório `public/minutas/` existe

### Erro: "Apenas arquivos .docx são permitidos"
- Converta o arquivo para formato .docx
- Verifique se a extensão está correta

### Erro: "Arquivo muito grande"
- Reduza o tamanho do arquivo para menos de 10MB
- Comprima imagens ou remova conteúdo desnecessário

## 📝 Próximos Passos

1. **Encontrar a pasta com os modelos**: Localize a pasta `ID._3.0_-_MINUTA_DE_ACORDO_DE_COOPERAÇAO_-Pós_Compliance`
2. **Importar modelos**: Use o script de importação
3. **Testar funcionalidades**: Verifique upload, download e exclusão
4. **Implementar geração**: Conectar minutas com sistema de geração de contratos

## 💡 Dicas

- Use nomes descritivos para as minutas
- Adicione descrições detalhadas para facilitar a identificação
- Organize os modelos por categoria (futuro)
- Mantenha backups dos arquivos originais
