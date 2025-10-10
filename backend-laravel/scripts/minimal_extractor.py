#!/usr/bin/env python3
"""
Script Python minimalista para extração de dados de contratos PDF
"""

import sys
import json
import re
import os

try:
    import fitz  # PyMuPDF
    import pytesseract
    from PIL import Image
    import io
except ImportError as e:
    print(json.dumps({"error": f"Dependência não encontrada: {e}"}))
    sys.exit(1)


def extract_text_from_pdf(pdf_path):
    """Extrai texto do PDF usando PyMuPDF primeiro, depois OCR se necessário"""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        
        # Tenta extrair texto diretamente das primeiras 3 páginas
        for page_num in range(min(len(doc), 3)):
            page = doc.load_page(page_num)
            page_text = page.get_text()
            if page_text.strip():
                text += page_text + "\n"
        
        doc.close()
        
        # Se conseguiu extrair texto diretamente, retorna
        if text.strip() and len(text.strip()) > 100:  # Pelo menos 100 caracteres
            return text, "PDF_DIRETO"
        
        # Se não conseguiu ou texto muito curto, usa OCR na primeira página
        return extract_text_with_ocr(pdf_path)
        
    except Exception as e:
        return None, f"Erro: {str(e)}"


def extract_text_with_ocr(pdf_path):
    """Extrai texto usando OCR em múltiplas páginas"""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        
        # Processa até 3 páginas para encontrar o valor
        for page_num in range(min(len(doc), 3)):
            page = doc.load_page(page_num)
            
            # Converte página para imagem com resolução baixa mas legível
            mat = fitz.Matrix(1.2, 1.2)  # Resolução baixa para evitar travamento
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            # Usa OCR na imagem com configuração otimizada para português
            image = Image.open(io.BytesIO(img_data))
            
            # Tenta OCR com configurações diferentes
            try:
                # Primeira tentativa: configuração padrão
                page_text = pytesseract.image_to_string(image, lang='por', config='--psm 6')
            except:
                # Segunda tentativa: configuração mais simples
                page_text = pytesseract.image_to_string(image, config='--psm 6')
            
            if page_text and page_text.strip():
                text += page_text + "\n"
        
        doc.close()
        
        # Se conseguiu extrair texto significativo, retorna
        if text and len(text.strip()) > 50:
            return text, "OCR"
        else:
            return None, "OCR falhou - texto insuficiente"
        
    except Exception as e:
        return None, f"Erro OCR: {str(e)}"


def extract_basic_data(text):
    """Extrai dados básicos do texto"""
    if not text:
        return {}
    
    # Normaliza o texto
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = text.strip()
    
    data = {}
    
    # Número do contrato
    numero_match = re.search(r'n[°º]\s*([0-9\/\-\.]+)', text, re.IGNORECASE)
    if numero_match:
        data['numero_contrato'] = numero_match.group(1).strip()
    
    # Objeto
    objeto_match = re.search(r'objeto[:\s]+([^\n]{10,500})', text, re.IGNORECASE)
    if objeto_match:
        objeto = objeto_match.group(1).strip()
        if len(objeto) > 500:
            objeto = objeto[:500] + '...'
        data['objeto'] = objeto
    
    # Contratante
    contratante_match = re.search(r'companhia\s*de\s*desenvolvimento\s*de\s*maric[áa][^\n]{5,100}', text, re.IGNORECASE)
    if contratante_match:
        data['contratante'] = contratante_match.group(0).strip()
    else:
        data['contratante'] = 'Companhia de Desenvolvimento de Maricá - CODEMAR'
    
    # Contratado
    contratado_match = re.search(r'destaq\s*com[ée]rcio\s*e\s*servi[çc]os[^\n]{5,100}', text, re.IGNORECASE)
    if contratado_match:
        data['contratado'] = contratado_match.group(0).strip()
    
    # CNPJ
    cnpj_match = re.search(r'(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2})', text)
    if cnpj_match:
        cnpj = re.sub(r'[^\d]', '', cnpj_match.group(1))
        if len(cnpj) == 14:
            data['cnpj_contratado'] = f"{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:14]}"
    
    # Valor - procura por diferentes padrões de valor
    valor_patterns = [
        r'valor\s*total\s*r\$\s*([\d\.,]+)',
        r'valor\s*do\s*contrato[^\d]*r\$\s*([\d\.,]+)',
        r'valor\s*total\s*de\s*r\$\s*([\d\.,]+)',
        r'd[áa]-se\s*a\s*este\s*contrato\s*o\s*valor\s*total\s*de\s*r\$\s*([\d\.,]+)',
        r'cl[áa]usula\s*sexta[^\d]*valor[^\d]*r\$\s*([\d\.,]+)',
        r'r\$\s*([\d\.,]+)',
    ]
    
    for pattern in valor_patterns:
        valor_match = re.search(pattern, text, re.IGNORECASE)
        if valor_match:
            valor_str = valor_match.group(1)
            valor_str = re.sub(r'[^\d,\.]', '', valor_str)
            if ',' in valor_str and '.' in valor_str:
                valor_str = valor_str.replace('.', '').replace(',', '.')
            elif ',' in valor_str:
                valor_str = valor_str.replace(',', '.')
            try:
                valor_float = float(valor_str)
                # Só aceita valores razoáveis (entre 100 e 100 milhões)
                if 100 <= valor_float <= 100000000:
                    data['valor'] = valor_float
                    break
            except ValueError:
                continue
    
    # Data de início
    data_inicio_match = re.search(r'data\s*do\s*in[íi]cio[:\s]*([\d\/\-\.]+)', text, re.IGNORECASE)
    if data_inicio_match:
        data['data_inicio'] = parse_date(data_inicio_match.group(1))
    
    # Status e outros campos padrão
    data['status'] = 'vigente'
    data['secretaria'] = 'Diretoria de Administração'
    data['texto_extraido'] = text[:5000]  # Primeiros 5000 caracteres
    data['metodo'] = 'PDF_DIRETO'
    
    return data


def parse_date(value):
    """Converte string para data"""
    if not value:
        return None
    
    value = value.strip()
    
    # Tenta formatos padrão
    formats = ['%d/%m/%Y', '%d-%m-%Y', '%d.%m.%Y', '%Y-%m-%d', '%Y/%m/%d']
    
    for fmt in formats:
        try:
            from datetime import datetime
            date_obj = datetime.strptime(value, fmt)
            return date_obj.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    return None


def main():
    """Função principal"""
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Uso: python minimal_extractor.py <caminho_do_pdf>"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    if not os.path.exists(pdf_path):
        print(json.dumps({"error": f"Arquivo não encontrado: {pdf_path}"}))
        sys.exit(1)
    
    try:
        # Extrai texto do PDF
        text, metodo = extract_text_from_pdf(pdf_path)
        
        if not text or not text.strip():
            # Se não conseguiu extrair texto, retorna dados básicos
            data = {
                "numero_contrato": None,
                "objeto": "PDF escaneado - dados não extraídos automaticamente",
                "contratante": "COMPANHIA DE DESENVOLVIMENTO DE MARICÁ S.A - CODEMAR",
                "contratado": None,
                "cnpj_contratado": None,
                "valor": None,
                "data_inicio": None,
                "data_fim": None,
                "modalidade": None,
                "status": "vigente",
                "tipo_contrato": None,
                "secretaria": "Diretoria de Administração",
                "fonte_recurso": None,
                "previsao_legal": None,
                "data_final_documento": None,
                "observacoes": "PDF escaneado - requer revisão manual",
                "texto_extraido": "Não foi possível extrair texto automaticamente",
                "metodo": "FALHA_OCR"
            }
            print(json.dumps(data, ensure_ascii=False, indent=2))
        else:
            # Extrai dados básicos
            data = extract_basic_data(text)
            data['metodo'] = metodo
            print(json.dumps(data, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
