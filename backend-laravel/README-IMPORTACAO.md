# Sistema de Importação de Contratos

Este sistema permite importar contratos de arquivos **XML**, **Excel** (.xlsx, .xls) e **CSV**.

## 📋 Estrutura do Banco de Dados

### Tabelas Criadas

1. **file_imports** - Armazena informações sobre cada arquivo importado
2. **contratos_importados** - Armazena os contratos extraídos dos arquivos

## 🚀 Configuração Inicial

### 1. Instalar Dependências

```bash
composer install
```

### 2. Configurar Banco de Dados

Edite o arquivo `.env` com suas configurações de banco de dados:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=codemar_contratos
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

### 3. Executar Migrations

```bash
php artisan migrate
```

### 4. Criar Link Simbólico para Storage

```bash
php artisan storage:link
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
php artisan serve
```

O servidor estará disponível em: `http://localhost:8000`

## 📡 Endpoints da API

### Base URL
```
http://localhost:8000/api/imports
```

### 1. Upload e Processar Arquivo

**POST** `/api/imports`

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (form-data):**
```
file: [arquivo.xml|arquivo.xlsx|arquivo.csv]
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Arquivo importado com sucesso",
  "data": {
    "id": 1,
    "original_filename": "contratos.xlsx",
    "file_type": "excel",
    "status": "completed",
    "total_records": 150,
    "successful_records": 148,
    "failed_records": 2,
    "created_at": "2025-10-09T00:52:05.000000Z"
  }
}
```

### 2. Listar Todas as Importações

**GET** `/api/imports`

**Query Parameters:**
- `status` (opcional): pending, processing, completed, failed
- `file_type` (opcional): xml, excel, csv
- `per_page` (opcional): número de registros por página (padrão: 15)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [...],
    "total": 10
  }
}
```

### 3. Ver Detalhes de uma Importação

**GET** `/api/imports/{id}`

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "original_filename": "contratos.xlsx",
    "file_type": "excel",
    "status": "completed",
    "total_records": 150,
    "successful_records": 148,
    "failed_records": 2,
    "contratos": [...]
  }
}
```

### 4. Ver Contratos de uma Importação

**GET** `/api/imports/{id}/contratos`

**Resposta:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "numero_contrato": "001/2025",
        "objeto": "Prestação de serviços",
        "contratado": "Empresa XYZ",
        "valor": "150000.00",
        ...
      }
    ]
  }
}
```

### 5. Ver Estatísticas

**GET** `/api/imports/stats`

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total_imports": 10,
    "pending": 1,
    "processing": 0,
    "completed": 8,
    "failed": 1,
    "total_contratos": 1250
  }
}
```

### 6. Deletar Importação

**DELETE** `/api/imports/{id}`

**Resposta:**
```json
{
  "success": true,
  "message": "Importação deletada com sucesso"
}
```

## 📄 Formatos de Arquivo Suportados

### 1. XML

Estrutura esperada:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<contratos>
    <contrato>
        <numero>001/2025</numero>
        <objeto>Prestação de serviços</objeto>
        <contratante>Prefeitura Municipal</contratante>
        <contratado>Empresa XYZ</contratado>
        <cnpj>12.345.678/0001-90</cnpj>
        <valor>150000.00</valor>
        <data_inicio>2025-01-01</data_inicio>
        <data_fim>2025-12-31</data_fim>
        <modalidade>Pregão Eletrônico</modalidade>
        <status>Ativo</status>
        <tipo>Serviços</tipo>
        <secretaria>Secretaria de Educação</secretaria>
        <fonte_recurso>1001</fonte_recurso>
        <observacoes>Contrato de prestação de serviços</observacoes>
    </contrato>
    <!-- Mais contratos... -->
</contratos>
```

### 2. Excel (.xlsx, .xls)

A primeira linha deve conter os cabeçalhos. Colunas aceitas (flexível):

| Coluna | Variações Aceitas |
|--------|-------------------|
| numero_contrato | numero, numero_contrato, nº contrato |
| objeto | objeto, descricao |
| contratante | contratante, orgao |
| contratado | contratado, fornecedor, empresa |
| cnpj_contratado | cnpj, cnpj_contratado |
| valor | valor, valor_contrato |
| data_inicio | data_inicio, inicio, vigencia_inicio |
| data_fim | data_fim, fim, vigencia_fim |
| modalidade | modalidade |
| status | status, situacao |
| tipo_contrato | tipo, tipo_contrato |
| secretaria | secretaria, unidade |
| fonte_recurso | fonte_recurso, fonte |
| observacoes | observacoes, obs |

**Exemplo:**

| numero | objeto | contratado | valor | data_inicio | data_fim |
|--------|--------|------------|-------|-------------|----------|
| 001/2025 | Serviços | Empresa XYZ | 150000.00 | 01/01/2025 | 31/12/2025 |

### 3. CSV

Mesma estrutura do Excel, mas em formato CSV (separado por vírgula).

**Exemplo:**
```csv
numero,objeto,contratado,valor,data_inicio,data_fim
001/2025,Serviços,Empresa XYZ,150000.00,01/01/2025,31/12/2025
002/2025,Materiais,Empresa ABC,80000.00,15/01/2025,15/12/2025
```

## 🎯 Campos da Tabela `contratos_importados`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | BIGINT | ID único do contrato |
| file_import_id | BIGINT | ID da importação |
| numero_contrato | VARCHAR | Número do contrato |
| objeto | TEXT | Objeto do contrato |
| contratante | VARCHAR | Nome do contratante |
| contratado | VARCHAR | Nome do contratado |
| cnpj_contratado | VARCHAR | CNPJ do contratado |
| valor | DECIMAL(15,2) | Valor do contrato |
| data_inicio | DATE | Data de início |
| data_fim | DATE | Data de fim |
| modalidade | VARCHAR | Modalidade de licitação |
| status | VARCHAR | Status do contrato |
| tipo_contrato | VARCHAR | Tipo do contrato |
| secretaria | VARCHAR | Secretaria responsável |
| fonte_recurso | VARCHAR | Fonte de recurso |
| observacoes | TEXT | Observações |
| dados_originais | JSON | Dados originais do arquivo |
| processado | BOOLEAN | Se foi processado |
| erro_processamento | TEXT | Erro de processamento |

## 🔧 Processamento

O sistema:
1. Valida o arquivo (tipo e tamanho máximo: 10MB)
2. Armazena o arquivo no diretório `storage/app/imports`
3. Cria registro na tabela `file_imports`
4. Processa o arquivo de acordo com o tipo
5. Extrai dados e salva na tabela `contratos_importados`
6. Atualiza estatísticas (total, sucesso, falhas)
7. Marca como concluído ou falho

## 🐛 Tratamento de Erros

- Erros por linha/registro são logados mas não interrompem o processamento
- O campo `error_message` da tabela `file_imports` contém detalhes de erros gerais
- O campo `erro_processamento` da tabela `contratos_importados` contém erros específicos

## 📊 Status de Importação

- **pending**: Aguardando processamento
- **processing**: Em processamento
- **completed**: Concluído com sucesso
- **failed**: Falhou

## 🚀 Próximos Passos

### Melhorias Recomendadas:

1. **Jobs Assíncronos**: Usar Laravel Jobs para processar arquivos grandes em background
   ```bash
   php artisan make:job ProcessFileImportJob
   php artisan queue:work
   ```

2. **Autenticação**: Adicionar autenticação via Sanctum
3. **Validação Avançada**: Validar CNPJ, datas, valores
4. **Notificações**: Enviar email quando importação terminar
5. **Export**: Permitir exportar contratos para Excel/CSV
6. **Interface Web**: Criar interface em React/Next.js para upload
7. **Logs Detalhados**: Melhorar sistema de logs
8. **Testes**: Adicionar testes unitários e de integração

## 🧪 Testando a API

### Usando cURL:

```bash
# Upload de arquivo
curl -X POST http://localhost:8000/api/imports \
  -F "file=@/caminho/para/arquivo.xlsx"

# Listar importações
curl http://localhost:8000/api/imports

# Ver detalhes
curl http://localhost:8000/api/imports/1

# Estatísticas
curl http://localhost:8000/api/imports/stats
```

### Usando Postman:

1. Crie uma requisição POST para `http://localhost:8000/api/imports`
2. Vá para Body > form-data
3. Adicione key `file` (tipo File)
4. Selecione o arquivo
5. Envie a requisição

## 📝 Licença

Este projeto faz parte do sistema CODEMAR Contratos.

