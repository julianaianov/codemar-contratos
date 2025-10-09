# Troubleshooting - Importação de Contratos

## Problemas Comuns e Soluções

### 1. Erro 422 (Unprocessable Content) ao Importar PDF

**Sintoma:** Ao tentar fazer upload de um PDF, aparece erro 422.

**Causas Possíveis:**
- ❌ Diretoria não foi selecionada
- ❌ Arquivo muito grande (limite: 20MB)
- ❌ Formato de arquivo não suportado

**Solução:**
1. **Selecione uma diretoria** antes de fazer o upload
2. Verifique se o arquivo é um PDF válido
3. Verifique o tamanho do arquivo (máximo 20MB)

### 2. Erro 404 em /api/contratos

**Sintoma:** Console mostra "Failed to load resource: 404 (Not Found)" para `/api/contratos`.

**Causa:** O frontend está tentando acessar uma rota que não existe ou está configurada incorretamente.

**Solução:**
- Verifique se o backend Laravel está rodando na porta 8000
- Verifique a variável `NEXT_PUBLIC_LARAVEL_API_URL` no arquivo `.env.local`

### 3. PDF Importado mas Dados Não Extraídos

**Sintoma:** O PDF é importado com sucesso, mas os campos do contrato ficam vazios ou com dados incorretos.

**Causa:** O documento não é um contrato administrativo ou não está no formato esperado.

**Documentos Suportados:**
- ✅ Contratos de prestação de serviços
- ✅ Contratos de fornecimento de materiais
- ✅ Contratos de locação
- ✅ Termos de contrato administrativos
- ❌ Processos judiciais
- ❌ Petições
- ❌ Documentos pessoais

**Exemplo de Documento NÃO Suportado:**
O arquivo "2.1. TERMO DE CONTRATO - ASSINADO1.pdf" é um **processo judicial trabalhista** (TRT), não um contrato administrativo. Por isso os dados não foram extraídos corretamente.

**Solução:**
- Use documentos de contratos administrativos reais
- Verifique se o PDF contém os campos esperados:
  - Número do contrato
  - Objeto do contrato
  - Contratante e Contratado
  - Valor
  - Datas de vigência

### 4. Como Importar um PDF Corretamente

**Passo a Passo:**

1. **Acesse** `/importacao/pdf`

2. **Selecione a Diretoria** responsável pelo contrato:
   - Presidência
   - Diretoria de Administração
   - Diretoria Jurídica
   - Diretoria de Assuntos Imobiliários
   - Diretoria de Operações
   - Diretoria de Tecnologia da Informação e Inovação
   - Diretoria de Governança em Licitações e Contratações

3. **Faça o Upload** do arquivo PDF:
   - Arraste e solte o arquivo
   - Ou clique para selecionar

4. **Aguarde o Processamento**:
   - O sistema extrai o texto do PDF
   - Se for escaneado, usa OCR automático
   - Aplica regex para identificar os campos

5. **Verifique o Resultado**:
   - Acesse `/importacao/historico` para ver o status
   - Clique na importação para ver os detalhes
   - Verifique os dados extraídos

### 5. Verificar Logs de Erro

**Backend (Laravel):**
```bash
cd backend-laravel
tail -f storage/logs/laravel.log
```

**Frontend (Next.js):**
- Abra o Console do Navegador (F12)
- Vá para a aba "Console"
- Procure por erros em vermelho

### 6. Testar Importação Manualmente

**Via cURL:**
```bash
curl -X POST http://localhost:8000/api/imports \
  -F "file=@/caminho/para/seu/contrato.pdf"
```

**Resposta Esperada:**
```json
{
  "success": true,
  "message": "Arquivo importado com sucesso",
  "data": {
    "id": 1,
    "status": "completed",
    "total_records": 1,
    "successful_records": 1
  }
}
```

### 7. Limpar Cache

Se estiver tendo problemas persistentes, limpe o cache:

**Backend:**
```bash
cd backend-laravel
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

**Frontend:**
```bash
# Pare o servidor Next.js (Ctrl+C)
# Delete a pasta .next
rm -rf .next
# Inicie novamente
npm run dev
```

### 8. Verificar Status do Sistema

**Backend:**
```bash
curl http://localhost:8000/api/imports/stats
```

**Deve retornar:**
```json
{
  "success": true,
  "data": {
    "total_imports": X,
    "completed": Y,
    ...
  }
}
```

### 9. Exemplo de Contrato Válido

Um contrato administrativo típico deve conter:

```
TERMO DE CONTRATO Nº 123/2025

CONTRATANTE: Prefeitura Municipal de ...
CONTRATADO: Empresa XYZ Ltda
CNPJ: 12.345.678/0001-90

OBJETO: Prestação de serviços de ...

VALOR: R$ 50.000,00 (cinquenta mil reais)

VIGÊNCIA: De 01/01/2025 até 31/12/2025

ASSINATURAS:
...
```

### 10. Suporte

Se o problema persistir:

1. Verifique os logs do backend
2. Verifique o console do navegador
3. Tente com um arquivo diferente
4. Entre em contato com o suporte técnico

## Checklist de Verificação

Antes de reportar um problema, verifique:

- [ ] Backend Laravel está rodando (porta 8000)
- [ ] Frontend Next.js está rodando (porta 3000)
- [ ] Diretoria foi selecionada antes do upload
- [ ] Arquivo é um PDF válido
- [ ] Arquivo tem menos de 20MB
- [ ] Documento é um contrato administrativo (não judicial)
- [ ] Logs foram verificados
- [ ] Cache foi limpo

## Contatos

- **Documentação:** Veja os arquivos `FUNCIONALIDADE-PDF.md` e `CHANGELOG-PDF.md`
- **Logs:** `backend-laravel/storage/logs/laravel.log`
- **Suporte:** admin@codemar.com.br
