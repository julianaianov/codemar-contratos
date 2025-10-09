# 🔍 Funcionalidade OCR para PDFs Escaneados

## 🎯 Visão Geral

Agora o sistema suporta **OCR (Optical Character Recognition)** para PDFs escaneados! O sistema detecta automaticamente se um PDF contém texto selecionável ou é uma imagem escaneada, e usa o método apropriado para extrair os dados.

## ✨ Como Funciona

### 🔄 Processo Automático

1. **Upload do PDF** → Sistema tenta extração de texto normal
2. **Se falhar** → Automaticamente usa OCR
3. **OCR em português** → Extrai texto da imagem
4. **Mesma extração** → Aplica os mesmos regex para identificar campos
5. **Resultado** → Dados estruturados salvos no banco

### 🛠️ Tecnologias Utilizadas

- **Tesseract OCR 5.3.4** - Motor de OCR
- **Imagemagick** - Conversão PDF → Imagem
- **spatie/pdf-to-image** - Biblioteca PHP para conversão
- **intervention/image** - Processamento de imagens
- **Idioma português** - Configurado para melhor reconhecimento

## 📋 Arquivos Implementados

### Backend
```
backend-laravel/
├── app/Services/Imports/
│   ├── PdfOcrProcessor.php (novo - 450+ linhas)
│   └── PdfProcessor.php (atualizado - detecção automática)
├── composer.json (dependências adicionadas)
└── storage/app/temp/ocr/ (diretório temporário)
```

### Dependências Instaladas
```bash
# Sistema
sudo apt install tesseract-ocr tesseract-ocr-por imagemagick

# PHP
composer require intervention/image spatie/pdf-to-image
```

## 🔧 Configuração

### 1. Tesseract OCR
```bash
# Verificar instalação
tesseract --version
# tesseract 5.3.4

# Testar idioma português
tesseract imagem.png resultado -l por
```

### 2. Diretório Temporário
```bash
# Criar diretório para arquivos temporários
mkdir -p storage/app/temp/ocr
chmod 755 storage/app/temp/ocr
```

## 📊 Fluxo de Processamento

### PDF com Texto Selecionável
```
PDF → smalot/pdfparser → Texto → Regex → Dados
```

### PDF Escaneado (Imagem)
```
PDF → spatie/pdf-to-image → PNG → Tesseract OCR → Texto → Regex → Dados
```

## 🎨 Interface Atualizada

### Página de Upload (`/importacao/pdf`)
- ✅ **Aviso atualizado:** "Suporta PDFs escaneados (OCR automático)"
- ✅ **Dicas melhoradas:** Explicação sobre ambos os tipos
- ✅ **Indicadores visuais:** ✅ para funcionalidades suportadas

### Mensagens de Log
```php
// Log quando OCR é usado
\Log::info('PDF sem texto detectado, tentando OCR', ['file_import_id' => $fileImport->id]);

// Log de erro se OCR falhar
\Log::error('OCR também falhou', ['error' => $e->getMessage()]);
```

## 📈 Melhorias na Extração

### Regex Otimizados para OCR
Os mesmos padrões de extração funcionam para ambos os métodos:

| Campo | Padrões Reconhecidos |
|-------|---------------------|
| Número do Contrato | "Contrato nº", "N°", "Nº" |
| Objeto | "Objeto:", "Objeto do Contrato:" |
| Contratante | "Contratante:", "Município de", "Prefeitura" |
| Contratado | "Contratado:", "Empresa:" |
| CNPJ | XX.XXX.XXX/XXXX-XX |
| Valor | "Valor:", "R$" |
| Datas | DD/MM/AAAA, DD-MM-AAAA |
| Modalidade | Pregão, Concorrência, etc. |

### Dados Originais Expandidos
```php
'dados_originais' => [
    'texto_extraido_ocr' => substr($text, 0, 5000),
    'metodo' => 'OCR'
]
```

## ⚠️ Limitações e Considerações

### Limitações do OCR
- **Qualidade da imagem:** PDFs com baixa resolução podem ter reconhecimento ruim
- **Fonte/caligrafia:** Fontes muito pequenas ou manuscritas são difíceis
- **Contraste:** Texto claro em fundo claro pode falhar
- **Idiomas:** Apenas português configurado (pode ser expandido)

### Otimizações Implementadas
- **PSM 6:** Modo de análise otimizado para blocos uniformes
- **Idioma português:** Melhor reconhecimento de acentos e caracteres especiais
- **Limpeza de texto:** Normalização após OCR
- **Fallback inteligente:** Tenta texto normal primeiro, OCR como backup

## 🧪 Como Testar

### 1. PDF com Texto Selecionável
```bash
# Criar PDF de teste com texto
echo "CONTRATO 001/2025" | pandoc -o teste.pdf
# Upload via interface
```

### 2. PDF Escaneado (Simulado)
```bash
# Criar imagem de teste
convert -size 400x100 xc:white -pointsize 24 -fill black \
  -annotate +10+50 "CONTRATO 001/2025" teste.png

# Converter para PDF
convert teste.png teste-escaneado.pdf
# Upload via interface
```

### 3. Teste via cURL
```bash
curl -X POST http://localhost:8000/api/imports \
  -F "file=@contrato-escaneado.pdf" \
  -H "Accept: application/json"
```

## 📊 Monitoramento

### Logs Importantes
```bash
# Acompanhar processamento OCR
tail -f storage/logs/laravel.log | grep -i "ocr\|pdf"

# Verificar arquivos temporários
ls -la storage/app/temp/ocr/
```

### Métricas
- **Taxa de sucesso OCR:** Compare registros com `metodo: 'OCR'`
- **Tempo de processamento:** OCR é mais lento que extração direta
- **Qualidade extração:** Analise campos NULL por método

## 🔮 Melhorias Futuras

### 1. OCR Avançado
- [ ] Suporte a múltiplos idiomas
- [ ] OCR para tabelas (Tesseract table detection)
- [ ] Pré-processamento de imagem (melhoria de contraste)

### 2. IA Integrada
- [ ] GPT-4 Vision para PDFs complexos
- [ ] Claude para extração mais precisa
- [ ] Validação automática de dados extraídos

### 3. Interface
- [ ] Preview do texto extraído via OCR
- [ ] Edição inline dos dados extraídos
- [ ] Indicador visual do método usado (texto vs OCR)

### 4. Performance
- [ ] Cache de resultados OCR
- [ ] Processamento assíncrono
- [ ] Compressão de imagens temporárias

## 📚 Comandos Úteis

### Teste Manual de OCR
```bash
# Converter PDF para imagem
convert contrato.pdf[0] -quality 100 pagina.png

# Executar OCR
tesseract pagina.png resultado -l por --psm 6

# Ver resultado
cat resultado.txt
```

### Limpeza de Arquivos Temporários
```bash
# Limpar arquivos temporários OCR
rm -rf storage/app/temp/ocr/*
```

### Verificar Configuração
```bash
# Listar idiomas disponíveis
tesseract --list-langs

# Verificar resolução de imagem
identify imagem.png
```

## 🎉 Resultado Final

### ✅ Funcionalidades Implementadas
- **Detecção automática** de tipo de PDF
- **OCR em português** para PDFs escaneados
- **Fallback inteligente** (texto → OCR)
- **Mesma qualidade** de extração para ambos os tipos
- **Interface atualizada** com informações claras
- **Logs detalhados** para monitoramento

### 🚀 Status
```
✅ Tesseract OCR: INSTALADO
✅ Idioma português: CONFIGURADO  
✅ PdfOcrProcessor: IMPLEMENTADO
✅ Detecção automática: FUNCIONANDO
✅ Interface atualizada: COMPLETA
✅ Testes básicos: APROVADOS
```

**Agora o sistema suporta tanto PDFs com texto selecionável quanto PDFs escaneados!** 🎊

---

**Data de Implementação:** 9 de Outubro de 2025  
**Versão OCR:** 1.0.0  
**Status:** ✅ Produção
