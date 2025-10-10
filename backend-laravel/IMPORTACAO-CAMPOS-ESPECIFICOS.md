# 📋 Importação de Contratos - Campos Específicos

## 🎯 Campos Obrigatórios para Contratos

O sistema agora extrai e armazena os seguintes campos específicos dos contratos:

### 📊 Campos Principais
- **ano-nº**: Identificador único do contrato (ex: 2025/001)
- **contrato**: Número do contrato (ex: 001/2025)
- **ano**: Ano do contrato (ex: 2025)
- **P.A**: Processo Administrativo (ex: PA-2025-001)
- **DIRETORIA**: Diretoria responsável (ex: Secretaria de Obras)
- **MODALIDADE**: Modalidade de licitação (ex: Pregão Eletrônico)
- **NOME DA EMPRESA**: Razão social da empresa contratada
- **CNPJ DA EMPRESA**: CNPJ da empresa contratada
- **OBJETO**: Descrição do objeto do contrato
- **DATA DA ASSINATURA**: Data de assinatura do contrato
- **PRAZO**: Prazo de execução (número)
- **UNID. PRAZO**: Unidade do prazo (dias, meses, anos)
- **VALOR DO CONTRATO**: Valor total do contrato
- **VENCIMENTO**: Data de vencimento do contrato

## 📁 Importação de Arquivos

### 📄 Arquivos PDF
- **Extração automática**: O sistema extrai automaticamente os campos do texto do PDF
- **OCR**: Se o PDF for escaneado, usa OCR para extrair o texto
- **Diretoria obrigatória**: A diretoria deve ser selecionada no upload (obrigatória para PDFs)

### 📊 Arquivos Excel (.xlsx, .xls)
- **Cabeçalhos flexíveis**: Aceita diferentes nomes de colunas
- **Mapeamento automático**: Mapeia automaticamente os campos baseado nos cabeçalhos
- **Diretoria do arquivo**: Usa as diretorias que estão no próprio arquivo Excel
- **Sem seleção prévia**: Não precisa selecionar diretoria antes do upload

### 📋 Estrutura do Excel

#### Cabeçalhos Principais (recomendados):
```
ano-nº,contrato,ano,P.A,DIRETORIA REQUISITANTE,MODALIDADE,NOME DA EMPRESA,CNPJ DA EMPRESA,OBJETO,DATA DA ASSINATURA,PRAZO,UNID. PRAZO,VALOR DO CONTRATO,VENCIMENTO,STATUS,GESTOR DO CONTRATO,FISCAL TÉCNICO,FISCAL ADMINISTRATIVO,SUPLENTE,OBSERVAÇÕES
```

#### Cabeçalhos Alternativos Aceitos:
- `ano-nº`, `ano_numero`, `ano_numero_contrato`
- `contrato`, `numero`, `numero_contrato`, `nº contrato`
- `ano`, `ano_contrato`
- `P.A`, `pa`, `p.a`, `processo_administrativo`, `processo`
- `DIRETORIA REQUISITANTE` (recomendado), `diretoria_requisitante`, `DIRETORIA`, `diretoria`, `secretaria`, `unidade`
- `MODALIDADE`, `modalidade`, `modalidade_licitacao`
- `NOME DA EMPRESA`, `nome_empresa`, `empresa`, `contratado`, `fornecedor`, `razao_social`
- `CNPJ DA EMPRESA`, `cnpj_empresa`, `cnpj`, `cnpj_contratado`
- `OBJETO`, `objeto`, `descricao`, `descrição`, `objeto_contrato`
- `DATA DA ASSINATURA`, `data_assinatura`, `assinatura`, `data_contrato`
- `PRAZO`, `prazo`, `prazo_contrato`, `duracao`
- `UNID. PRAZO`, `unidade_prazo`, `unid_prazo`, `unidade`, `periodo`
- `VALOR DO CONTRATO`, `valor_contrato`, `valor`, `valor_total`
- `VENCIMENTO`, `vencimento`, `data_vencimento`, `data_fim`, `vigencia_fim`
- `STATUS`, `status`, `situacao`, `situação`
- `GESTOR DO CONTRATO`, `gestor_contrato`, `gestor`, `responsavel`
- `FISCAL TÉCNICO`, `fiscal_tecnico`, `fiscal_tecnico`
- `FISCAL ADMINISTRATIVO`, `fiscal_administrativo`, `fiscal_admin`
- `SUPLENTE`, `suplente`, `substituto`
- `OBSERVAÇÕES`, `observacoes`, `observações`, `obs`

## 🔄 Processo de Importação

### 1. Upload do Arquivo

#### Para Arquivos Excel (sem diretoria obrigatória):
```bash
POST /api/imports
Content-Type: multipart/form-data

file: [arquivo.xlsx]
```

#### Para Arquivos PDF (diretoria obrigatória):
```bash
POST /api/imports
Content-Type: multipart/form-data

file: [arquivo.pdf]
diretoria: "Secretaria de Obras"
```

### 2. Processamento Automático
- **PDF**: Extrai texto e identifica campos automaticamente, usa diretoria selecionada
- **Excel**: Mapeia colunas para campos baseado nos cabeçalhos, usa diretorias do arquivo

### 3. Armazenamento
- Salva todos os campos específicos na tabela `contratos_importados`
- Mantém compatibilidade com campos legados
- Armazena dados originais para auditoria

## 🎨 Interface de Visualização

### Cards de Contratos
Os cards agora exibem todas as informações específicas:
- **Header**: ano-número e status
- **Grid de informações**: organizadas em duas colunas
- **Objeto**: descrição completa do contrato
- **Footer**: informações de importação

### Filtros Disponíveis
- **Ano**: Filtra por ano do contrato
- **Diretoria**: Filtra por diretoria responsável
- **Modalidade**: Filtra por modalidade de licitação
- **Status**: Filtra por status do contrato

## 🔍 Exemplos de Uso

### Upload via API

#### Arquivo Excel (sem diretoria):
```bash
curl -X POST http://localhost:8000/api/imports \
  -F "file=@contratos.xlsx"
```

#### Arquivo PDF (com diretoria):
```bash
curl -X POST http://localhost:8000/api/imports \
  -F "file=@contratos.pdf" \
  -F "diretoria=Secretaria de Obras"
```

### Resposta da API
```json
{
  "success": true,
  "message": "Arquivo importado com sucesso",
  "data": {
    "id": 1,
    "original_filename": "contratos.xlsx",
    "file_type": "xlsx",
    "status": "completed",
    "total_records": 10,
    "successful_records": 10,
    "failed_records": 0
  },
  "diretorias_encontradas": [
    "Secretaria de Obras",
    "Secretaria de Saúde",
    "Secretaria de Educação"
  ],
  "total_diretorias": 3,
  "diretoria_principal": "Secretaria de Obras"
}
```

### Buscar Contratos
```bash
curl http://localhost:8000/api/imports/1/contratos
```

## ⚙️ Configurações

### Diretoria por Tipo de Arquivo

#### Arquivos Excel:
- **Prioridade 1**: Campo `DIRETORIA REQUISITANTE` do arquivo Excel (recomendado)
- **Prioridade 2**: Campo `diretoria_requisitante` do arquivo Excel
- **Prioridade 3**: Campo `DIRETORIA` do arquivo Excel
- **Prioridade 4**: Campo `diretoria` do arquivo Excel
- **Prioridade 5**: Campo `secretaria` do arquivo Excel  
- **Prioridade 6**: Campo `unidade` do arquivo Excel
- **Fallback**: Diretoria selecionada no upload (se fornecida)
- **Último recurso**: "Diretoria não especificada"

#### Mapeamento de Campos Específico para Excel:
- **Contratado**: Preenchido com o valor de `NOME DA EMPRESA`
- **CNPJ Contratado**: Preenchido com o valor de `CNPJ DA EMPRESA`
- **Valor**: Preenchido com o valor de `VALOR DO CONTRATO`
- **Secretaria**: Preenchido com o valor de `DIRETORIA REQUISITANTE`
- **Status**: Extraído diretamente da coluna `STATUS` da planilha

#### Arquivos PDF:
- **Obrigatório**: Diretoria selecionada no upload
- **Aplicado a**: Todos os contratos extraídos do PDF

### Validações
- **Ano**: Deve estar entre 2000 e 2030
- **CNPJ**: Formato brasileiro válido
- **Valores**: Números positivos
- **Datas**: Formato ISO (YYYY-MM-DD)

## 🚀 Benefícios

1. **Organização**: Contratos organizados por diretoria automaticamente
2. **Filtragem**: Filtros específicos por todos os campos
3. **Compatibilidade**: Mantém compatibilidade com sistema anterior
4. **Flexibilidade**: Aceita diferentes formatos de cabeçalhos
5. **Auditoria**: Mantém dados originais para rastreabilidade

## 📞 Suporte

Para dúvidas sobre a importação:
1. Verifique se os cabeçalhos estão corretos
2. Confirme se a diretoria foi selecionada
3. Verifique os logs de erro na API
4. Teste com arquivo de exemplo fornecido
