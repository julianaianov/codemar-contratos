# 🚀 Backend Laravel - Sistema de Importação de Contratos

## 📁 Estrutura Criada

```
backend-laravel/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           └── FileImportController.php      # Controller da API
│   ├── Models/
│   │   ├── FileImport.php                        # Model de importações
│   │   └── ContratoImportado.php                 # Model de contratos
│   └── Services/
│       └── Imports/
│           ├── FileImportService.php             # Serviço principal
│           ├── ProcessorInterface.php            # Interface dos processadores
│           ├── XmlProcessor.php                  # Processador de XML
│           ├── ExcelProcessor.php                # Processador de Excel
│           └── CsvProcessor.php                  # Processador de CSV
├── database/
│   └── migrations/
│       ├── 2025_10_09_005205_create_file_imports_table.php
│       └── 2025_10_09_005214_create_contratos_importados_table.php
├── routes/
│   └── api.php                                   # Rotas da API
├── storage/
│   └── app/
│       ├── imports/                              # Arquivos importados
│       └── examples/                             # Exemplos de arquivos
│           ├── contratos-exemplo.xml
│           └── contratos-exemplo.csv
├── config/
│   └── excel.php                                 # Configuração do Laravel Excel
└── README-IMPORTACAO.md                          # Documentação completa
```

## 🗄️ Banco de Dados

### Tabela: `file_imports`

Armazena informações sobre cada arquivo importado.

**Campos principais:**
- `id` - ID único
- `original_filename` - Nome original do arquivo
- `stored_filename` - Nome armazenado (UUID)
- `file_path` - Caminho do arquivo
- `file_type` - Tipo: xml, excel, csv
- `status` - Status: pending, processing, completed, failed
- `total_records` - Total de registros
- `successful_records` - Registros processados com sucesso
- `failed_records` - Registros com falha
- `error_message` - Mensagem de erro (se houver)
- `metadata` - Metadados JSON
- `user_id` - ID do usuário (FK)
- `started_at` - Data/hora de início
- `completed_at` - Data/hora de conclusão

### Tabela: `contratos_importados`

Armazena os contratos extraídos dos arquivos.

**Campos principais:**
- `id` - ID único
- `file_import_id` - FK para file_imports
- `numero_contrato` - Número do contrato
- `objeto` - Objeto do contrato
- `contratante` - Nome do contratante
- `contratado` - Nome do contratado
- `cnpj_contratado` - CNPJ
- `valor` - Valor do contrato
- `data_inicio` - Data de início
- `data_fim` - Data de fim
- `modalidade` - Modalidade de licitação
- `status` - Status do contrato
- `tipo_contrato` - Tipo
- `secretaria` - Secretaria responsável
- `fonte_recurso` - Fonte de recurso
- `observacoes` - Observações
- `dados_originais` - Dados originais (JSON)
- `processado` - Boolean
- `erro_processamento` - Erro (se houver)

## 📡 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/imports` | Lista todas as importações |
| POST | `/api/imports` | Upload e processamento de arquivo |
| GET | `/api/imports/stats` | Estatísticas gerais |
| GET | `/api/imports/{id}` | Detalhes de uma importação |
| GET | `/api/imports/{id}/contratos` | Contratos de uma importação |
| DELETE | `/api/imports/{id}` | Deleta uma importação |

## 🎯 Funcionalidades

### ✅ Implementadas

1. **Upload de Arquivos**
   - Suporte para XML, Excel (.xlsx, .xls) e CSV
   - Validação de tipo e tamanho (máx. 10MB)
   - Armazenamento seguro com UUID

2. **Processamento Inteligente**
   - Detecção automática do tipo de arquivo
   - Processadores específicos para cada formato
   - Mapeamento flexível de colunas (Excel/CSV)
   - Conversão automática de encoding (CSV)

3. **Tratamento de Erros**
   - Erros por registro não interrompem o processamento
   - Logs detalhados de erros
   - Contadores de sucesso/falha

4. **API RESTful**
   - Endpoints completos para CRUD
   - Paginação
   - Filtros (status, tipo)
   - Estatísticas

5. **Models com Relacionamentos**
   - Eloquent ORM
   - Relacionamentos definidos
   - Métodos auxiliares

## 🔧 Tecnologias Utilizadas

- **Laravel 10** - Framework PHP
- **Maatwebsite/Excel** - Processamento de Excel
- **PhpOffice/PhpSpreadsheet** - Manipulação de planilhas
- **MySQL/PostgreSQL** - Banco de dados
- **Eloquent ORM** - ORM do Laravel

## 🚀 Como Usar

### 1. Instalação

```bash
cd backend-laravel
composer install
cp .env.example .env
php artisan key:generate
```

### 2. Configurar Banco

Edite `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=codemar_contratos
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Executar Migrations

```bash
php artisan migrate
```

### 4. Iniciar Servidor

```bash
php artisan serve
```

API disponível em: `http://localhost:8000/api/imports`

## 📝 Exemplos de Uso

### Upload de Arquivo (cURL)

```bash
curl -X POST http://localhost:8000/api/imports \
  -F "file=@contratos.xlsx"
```

### Listar Importações

```bash
curl http://localhost:8000/api/imports
```

### Ver Estatísticas

```bash
curl http://localhost:8000/api/imports/stats
```

## 🎨 Integração com Frontend Next.js

### Exemplo de Upload no Next.js

```typescript
// src/app/importacao/upload/page.tsx
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8000/api/imports', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  console.log(data);
};
```

### Exemplo de Listagem

```typescript
const fetchImports = async () => {
  const response = await fetch('http://localhost:8000/api/imports');
  const data = await response.json();
  return data.data;
};
```

## 📊 Fluxo de Processamento

```
1. Upload do arquivo
   ↓
2. Validação (tipo, tamanho)
   ↓
3. Armazenamento (storage/app/imports)
   ↓
4. Criação do registro (file_imports)
   ↓
5. Detecção do tipo de arquivo
   ↓
6. Seleção do processador adequado
   ↓
7. Leitura e parsing do arquivo
   ↓
8. Extração dos dados
   ↓
9. Salvamento dos contratos (contratos_importados)
   ↓
10. Atualização de estatísticas
   ↓
11. Marcação como concluído/falho
```

## 🔐 Segurança

### Implementadas:
- Validação de tipo de arquivo
- Limite de tamanho (10MB)
- Armazenamento com UUID
- SQL Injection protegido (Eloquent ORM)

### A Implementar:
- Autenticação via Sanctum
- Rate limiting
- CORS configurado
- Validação de conteúdo do arquivo

## 🚧 Próximas Melhorias

1. **Jobs Assíncronos**
   - Processar arquivos grandes em background
   - Filas com Laravel Queue

2. **Notificações**
   - Email ao concluir importação
   - Notificações em tempo real (WebSockets)

3. **Validações Avançadas**
   - Validar CNPJ
   - Validar datas
   - Regras de negócio

4. **Interface Web**
   - Página de upload no Next.js
   - Visualização de importações
   - Download de relatórios

5. **Export**
   - Exportar contratos para Excel/CSV
   - Templates personalizados

6. **Logs Detalhados**
   - Log por linha processada
   - Dashboard de erros

## 📚 Documentação Adicional

- **README-IMPORTACAO.md** - Documentação completa da API
- **storage/app/examples/** - Arquivos de exemplo
- Comentários nos códigos

## 🧪 Testando

### Arquivos de Exemplo Incluídos:

- `storage/app/examples/contratos-exemplo.xml`
- `storage/app/examples/contratos-exemplo.csv`

Use estes arquivos para testar o sistema!

## 💡 Dicas

1. **Desenvolvimento Local**: Use `php artisan serve` para testes rápidos
2. **Logs**: Verifique `storage/logs/laravel.log` para erros
3. **Banco de Dados**: Use ferramentas como TablePlus ou DBeaver
4. **API Testing**: Use Postman ou Insomnia
5. **CORS**: Configure em `config/cors.php` para produção

## 🤝 Contribuindo

Este é um sistema interno. Para sugestões ou melhorias, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido para:** CODEMAR - Sistema de Contratos  
**Versão:** 1.0.0  
**Data:** Outubro 2025

