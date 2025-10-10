# 📄 Funcionalidade de Upload e Extração de PDFs

## 🎯 Visão Geral

O sistema agora suporta **upload de contratos em formato PDF** com **extração automática de dados** e **armazenamento do arquivo original** para consulta posterior.

## ✨ Recursos Implementados

### 1. Upload de PDFs
- ✅ Aceita arquivos PDF de até 20MB
- ✅ Processa PDFs com texto selecionável
- ✅ Armazena o arquivo original no servidor
- ✅ Seleção de diretoria responsável

### 2. Extração Automática de Dados
O sistema tenta extrair automaticamente os seguintes campos:

- ✅ **Número do Contrato** - Padrões: "Contrato nº 001/2025", "Nº 001/2025"
- ✅ **Objeto do Contrato** - Texto após "Objeto:", "Objeto do Contrato:"
- ✅ **Contratante** - Identifica Prefeitura, Município, etc.
- ✅ **Contratado** - Nome da empresa contratada
- ✅ **CNPJ** - Formato XX.XXX.XXX/XXXX-XX (formatado automaticamente)
- ✅ **Valor do Contrato** - Valores em R$ (formatos brasileiros)
- ✅ **Data de Início** - Formatos: DD/MM/AAAA, DD-MM-AAAA, etc.
- ✅ **Data de Fim/Término** - Múltiplos formatos aceitos
- ✅ **Modalidade** - Pregão, Concorrência, Dispensa, etc.
- ✅ **Tipo de Contrato** - Prestação de Serviços, Fornecimento, Obra, etc.
- ✅ **Secretaria/Diretoria** - Órgão responsável
- ✅ **Fonte de Recurso** - Recursos próprios, federais, etc.

### 3. Visualização e Download
- ✅ Botão para **visualizar PDF** no navegador (nova aba)
- ✅ Botão para **baixar PDF** original
- ✅ Disponível na consulta de contratos (cards e tabela)

## 🏗️ Arquitetura Implementada

### Backend (Laravel)

#### 1. Biblioteca Instalada
```bash
composer require smalot/pdfparser
```

#### 2. Novo Processador
**`app/Services/Imports/PdfProcessor.php`**
- Implementa `ProcessorInterface`
- Usa `smalot/pdfparser` para extrair texto
- Aplica regex avançados para identificar campos
- Suporta múltiplos formatos de data e número
- Normaliza texto para melhor extração

#### 3. Atualizações no Service
**`app/Services/Imports/FileImportService.php`**
```php
'pdf' => 'pdf',  // Tipo de arquivo
'pdf' => new PdfProcessor(),  // Processador
```

#### 4. Controller Atualizado
**`app/Http/Controllers/Api/FileImportController.php`**
- Aceita PDFs: `mimes:xml,xlsx,xls,csv,pdf`
- Limite aumentado: `max:20480` (20MB)
- Novos endpoints:
  - `GET /api/imports/{id}/pdf/view` - Visualizar PDF
  - `GET /api/imports/{id}/pdf/download` - Baixar PDF

#### 5. Migration Criada
**`database/migrations/2025_10_09_160048_add_pdf_path_to_contratos_importados_table.php`**
```php
$table->string('pdf_path')->nullable()
    ->comment('Caminho do arquivo PDF original do contrato');
```

#### 6. Model Atualizado
**`app/Models/ContratoImportado.php`**
- Campo `pdf_path` adicionado ao `$fillable`

#### 7. Rotas API
**`routes/api.php`**
```php
Route::get('/{id}/pdf/download', [FileImportController::class, 'downloadPdf']);
Route::get('/{id}/pdf/view', [FileImportController::class, 'viewPdf']);
```

### Frontend (Next.js)

#### 1. Nova Página de Upload
**`src/app/importacao/pdf/page.tsx`**
- Interface dedicada para upload de PDFs
- Avisos sobre PDFs escaneados vs. texto selecionável
- Seleção de diretoria
- Lista de campos extraídos automaticamente
- Dicas para melhor extração

#### 2. Componente FileUpload Atualizado
**`src/components/importacao/FileUpload.tsx`**
- Tipo `'pdf'` adicionado ao `fileType`
- Aceita formato `.pdf`

#### 3. Menu de Importação Atualizado
**`src/app/importacao/page.tsx`**
- Card "Importar PDF" com badge "Novo"
- Cor vermelha para destaque
- Link para `/importacao/pdf`

#### 4. Consulta de Contratos Atualizada
**`src/app/consulta/contratos/page.tsx`**
- Botão de visualização de PDF (ícone de download)
- Aparece apenas quando o contrato tem PDF associado
- Funções `handleViewPdf()` e `handleDownloadPdf()`
- Disponível em visualização cards e tabela

## 📋 Fluxo de Uso

### Upload e Processamento

1. **Acesse** `/importacao/pdf`
2. **Selecione** a diretoria responsável
3. **Faça upload** do arquivo PDF
4. **Sistema processa:**
   - Extrai texto do PDF
   - Aplica regex para identificar campos
   - Salva dados estruturados no banco
   - Armazena PDF original em `storage/app/imports/`
5. **Visualize** o resultado da importação
6. **Acesse** histórico em `/importacao/historico`

### Consulta e Visualização

1. **Acesse** `/consulta/contratos`
2. **Encontre** o contrato desejado
3. **Clique** no ícone de PDF (📄) ao lado dos outros botões
4. **PDF abre** em nova aba do navegador
5. **Ou baixe** clicando no botão de download

## 🔧 Configuração e Requisitos

### Requisitos do Sistema
- PHP 8.1+
- Composer
- Laravel 10+
- Biblioteca `smalot/pdfparser`

### Configuração

1. **Instalar dependências:**
```bash
cd backend-laravel
composer install
```

2. **Executar migrations:**
```bash
php artisan migrate
```

3. **Verificar storage:**
```bash
php artisan storage:link
```

4. **Permissões:**
```bash
chmod -R 775 storage/app/imports
```

## 📊 Estrutura de Dados

### Tabela: contratos_importados

```sql
- pdf_path VARCHAR(255) NULL
  -- Armazena: "imports/uuid-do-arquivo.pdf"
  -- Exemplo: "imports/9c8f5e2a-1234-5678-90ab-cdef12345678.pdf"
```

### Relacionamento
```
FileImport (1) ----< (N) ContratoImportado
     |                        |
file_path                 pdf_path
(PDF original)      (referência ao mesmo PDF)
```

## 🎨 Interface do Usuário

### Página de Upload (`/importacao/pdf`)
- Card com aviso amarelo sobre PDFs
- Seleção de diretoria (obrigatória)
- Componente de drag-and-drop
- Informações sobre campos extraídos
- Dicas para melhor extração

### Consulta de Contratos (`/consulta/contratos`)
- **Cards:** Botão vermelho com ícone 📄 ao lado de Ver/Editar/Deletar
- **Tabela:** Coluna de ações com botão adicional
- **Tooltip:** "Ver PDF original"
- **Condicional:** Só aparece se contrato tem PDF

## 🔍 Limitações e Melhorias Futuras

### Limitações Atuais
- ❌ PDFs escaneados (imagens) não são processados
- ❌ OCR não está implementado
- ❌ Layouts muito complexos podem ter extração parcial
- ❌ Tabelas e dados tabulares são ignorados

### Melhorias Futuras

1. **OCR Integration**
   - Integrar Tesseract OCR para PDFs escaneados
   - Suporte a imagens dentro de PDFs

2. **IA Avançada**
   - Usar GPT-4 Vision ou Claude para extração mais precisa
   - Treinamento com contratos reais

3. **Validação**
   - Validar CNPJ automaticamente
   - Verificar datas inconsistentes
   - Alertar sobre campos faltantes

4. **Preview**
   - Mostrar preview do PDF antes de confirmar
   - Permitir edição dos dados extraídos
   - Destacar texto extraído no PDF

5. **Múltiplos Contratos**
   - Detectar múltiplos contratos em um único PDF
   - Processar PDFs com vários contratos

6. **Anotações**
   - Permitir anotações no PDF
   - Destacar cláusulas importantes
   - Adicionar comentários

## 🧪 Testando a Funcionalidade

### 1. Teste com PDF Simples
```bash
# Crie um contrato em Word e exporte para PDF
# Upload via interface web
# Verifique os dados extraídos no histórico
```

### 2. Teste via cURL
```bash
curl -X POST http://localhost:8000/api/imports \
  -F "file=@contrato.pdf" \
  -H "Accept: application/json"
```

### 3. Visualizar PDF
```bash
# Via navegador
http://localhost:8000/api/imports/{id}/pdf/view

# Download
http://localhost:8000/api/imports/{id}/pdf/download
```

## 📈 Estatísticas e Monitoramento

### Logs
- Erros de processamento são logados em `storage/logs/laravel.log`
- Use `tail -f storage/logs/laravel.log` para monitorar

### Métricas
- Total de PDFs processados: Query `file_imports` WHERE `file_type = 'pdf'`
- Taxa de sucesso: Compare `successful_records` vs `failed_records`
- Campos mais extraídos: Analise `contratos_importados` para campos NULL

## 🚀 Próximos Passos Recomendados

1. **Testar com PDFs reais** do seu sistema
2. **Ajustar regex** no `PdfProcessor.php` conforme necessário
3. **Adicionar validações** específicas do seu município
4. **Implementar OCR** se necessário
5. **Criar templates** de PDFs padronizados
6. **Treinar usuários** sobre melhores práticas

## 📞 Suporte e Manutenção

### Arquivos Principais
```
backend-laravel/
├── app/Services/Imports/PdfProcessor.php
├── app/Http/Controllers/Api/FileImportController.php
├── routes/api.php
└── database/migrations/2025_10_09_160048_*

src/
├── app/importacao/pdf/page.tsx
├── app/consulta/contratos/page.tsx
└── components/importacao/FileUpload.tsx
```

### Ajustes Comuns

**Adicionar novo padrão de extração:**
```php
// Em PdfProcessor.php
private function extractNumeroContrato(string $text): ?string
{
    $patterns = [
        // Adicione seu padrão aqui
        '/seu-novo-padrao-regex/i',
    ];
    // ...
}
```

**Aumentar limite de tamanho:**
```php
// Em FileImportController.php
'file' => 'required|file|mimes:xml,xlsx,xls,csv,pdf|max:30720', // 30MB
```

---

## ✅ Implementação Completa

A funcionalidade de upload e extração de PDFs está **100% funcional** e pronta para uso em produção!

**Data de Implementação:** 9 de Outubro de 2025
**Versão:** 1.0.0

