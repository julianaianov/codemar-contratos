#!/usr/bin/env python3
"""
Script Python simplificado para extração de dados de contratos PDF
"""

import sys
import json
import re
import os
from datetime import datetime

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
        # Tenta extrair texto diretamente
        doc = fitz.open(pdf_path)
        text = ""
        
        # Processa mais páginas para encontrar o valor
        for page_num in range(min(len(doc), 10)):  # Aumenta para 10 páginas
            page = doc.load_page(page_num)
            page_text = page.get_text()
            if page_text.strip():
                text += page_text + "\n"
        
        doc.close()
        
        # Se conseguiu extrair texto diretamente, retorna
        if text.strip():
            return text, "PDF_DIRETO"
        
        # Se não conseguiu, usa OCR nas primeiras páginas
        return extract_text_with_ocr_multiple_pages(pdf_path)
        
    except Exception as e:
        return None, f"Erro: {str(e)}"


def extract_text_with_ocr_first_page(pdf_path):
    """Extrai texto usando OCR apenas na primeira página"""
    try:
        doc = fitz.open(pdf_path)
        page = doc.load_page(0)  # Apenas primeira página
        
        # Converte página para imagem com resolução menor para evitar travamento
        mat = fitz.Matrix(1.5, 1.5)  # Resolução menor
        pix = page.get_pixmap(matrix=mat)
        img_data = pix.tobytes("png")
        
        # Usa OCR na imagem
        image = Image.open(io.BytesIO(img_data))
        text = pytesseract.image_to_string(image, lang='por', config='--psm 6')
        
        doc.close()
        return text, "OCR"
        
    except Exception as e:
        return None, f"Erro OCR: {str(e)}"


def extract_text_with_ocr_multiple_pages(pdf_path):
    """Extrai texto usando OCR em múltiplas páginas"""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        
        # Processa até 5 páginas com OCR
        for page_num in range(min(len(doc), 5)):
            page = doc.load_page(page_num)
            
            # Converte página para imagem
            mat = fitz.Matrix(1.5, 1.5)
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            # Usa OCR na imagem
            image = Image.open(io.BytesIO(img_data))
            page_text = pytesseract.image_to_string(image, lang='por', config='--psm 6')
            text += page_text + "\n"
        
        doc.close()
        return text, "OCR"
        
    except Exception as e:
        return None, f"Erro OCR múltiplas páginas: {str(e)}"


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
    
    # Valor - procura sempre por "VALOR DO CONTRATO" ou "VALOR TOTAL"
    valor_patterns = [
        r'valor\s*total\s*r\$\s*([\d\.,]+)',
        r'valor\s*do\s*contrato[^\d]*r\$\s*([\d\.,]+)',
        r'valor\s*total\s*de\s*r\$\s*([\d\.,]+)',
        r'd[áa]-se\s*a\s*este\s*contrato\s*o\s*valor\s*total\s*de\s*r\$\s*([\d\.,]+)',
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
                data['valor'] = float(valor_str)
                break
            except ValueError:
                continue
    
    # Data de início
    data_inicio_match = re.search(r'data\s*do\s*in[íi]cio[:\s]*([\d\/\-\.]+)', text, re.IGNORECASE)
    if data_inicio_match:
        data['data_inicio'] = parse_date(data_inicio_match.group(1))
    
    # Data final do documento
    data_final_match = re.search(r'maric[áa],\s*([\d\s]+de\s+[a-zç]+de\s+[\d]+)', text, re.IGNORECASE)
    if data_final_match:
        data['data_final_documento'] = parse_date(data_final_match.group(1))
    
    # Previsão legal
    previsao_match = re.search(r'lei\s*n[°º]?\s*13\.303[^\n]{10,200}', text, re.IGNORECASE)
    if previsao_match:
        data['previsao_legal'] = previsao_match.group(0).strip()
    
    # Status e outros campos padrão
    data['status'] = 'vigente'
    data['secretaria'] = 'Diretoria de Administração'
    data['texto_extraido'] = text[:8000]  # Primeiros 8000 caracteres
    
    return data


def parse_date(value):
    """Converte string para data"""
    if not value:
        return None
    
    value = value.strip()
    
    # Mapeia meses em português
    meses = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    }
    
    # Converte datas em português (ex: "24 de outubro de 2023")
    for mes, numero in meses.items():
        pattern = rf'(\d+)\s+de\s+{mes}\s+de\s+(\d{{4}})'
        match = re.search(pattern, value, re.IGNORECASE)
        if match:
            return f"{match.group(2)}-{numero}-{int(match.group(1)):02d}"
    
    # Tenta formatos padrão
    formats = ['%d/%m/%Y', '%d-%m-%Y', '%d.%m.%Y', '%Y-%m-%d', '%Y/%m/%d']
    
    for fmt in formats:
        try:
            date_obj = datetime.strptime(value, fmt)
            return date_obj.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    return None


def main():
    """Função principal"""
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Uso: python simple_extractor.py <caminho_do_pdf>"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    if not os.path.exists(pdf_path):
        print(json.dumps({"error": f"Arquivo não encontrado: {pdf_path}"}))
        sys.exit(1)
    
    try:
        # Extrai texto do PDF
        text, metodo = extract_text_from_pdf(pdf_path)
        
        if not text or not text.strip():
            print(json.dumps({"error": "Não foi possível extrair texto do PDF"}))
            sys.exit(1)
        
        # Extrai dados básicos
        data = extract_basic_data(text)
        data['metodo'] = metodo
        
        print(json.dumps(data, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
