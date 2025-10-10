#!/usr/bin/env python3
"""
Script Python para extração de dados de contratos PDF usando OCR
Especificamente otimizado para contratos da CODEMAR
"""

import sys
import json
import re
import os
from datetime import datetime
from pathlib import Path

try:
    import fitz  # PyMuPDF
    import pytesseract
    from PIL import Image
    import io
except ImportError as e:
    print(json.dumps({"error": f"Dependência não encontrada: {e}"}))
    sys.exit(1)


def normalize_text(text):
    """Normaliza o texto para facilitar extração"""
    if not text:
        return ""
    
    # Remove quebras de linha excessivas
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove espaços múltiplos
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()


def extract_numero_contrato(text):
    """Extrai número do contrato"""
    patterns = [
        r'n[°º]\s*([0-9\/\-\.]+)',
        r'contrato\s*n[°º]?\s*[:\s]*([0-9\/\-\.]+)',
        r'n[úu]mero\s*(?:do\s*)?contrato[:\s]+([^\n]{1,50})',
        r'termo\s*de\s*contrato\s*n[°º]?\s*([0-9\/\-\.]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    return None


def extract_objeto(text):
    """Extrai objeto do contrato"""
    patterns = [
        r'objeto[:\s]+([^\n]{10,800})',
        r'objeto\s*do\s*contrato[:\s]+([^\n]{10,800})',
        r'1[°º]\s*uso\s*da\s*ata[^\n]{10,800}',
        r'contrata[çc][ãa]o\s*de\s*empresa[^\n]{10,800}',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            objeto = match.group(0) if match.group(0) else match.group(1)
            objeto = objeto.strip()
            if len(objeto) > 500:
                objeto = objeto[:500] + '...'
            return objeto
    
    return None


def extract_contratante(text):
    """Extrai contratante"""
    patterns = [
        r'contratante[:\s]+([^\n]{5,200})',
        r'companhia\s*de\s*desenvolvimento\s*de\s*maric[áa][^\n]{5,100}',
        r'codemar[^\n]{5,100}',
        r'munic[íi]pio\s*de\s*([^\n]{5,100})',
        r'prefeitura\s*municipal\s*de\s*([^\n]{5,100})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            contratante = match.group(0) if match.group(0) else match.group(1)
            contratante = contratante.strip()
            if len(contratante) > 200:
                contratante = contratante[:200]
            return contratante
    
    return 'Companhia de Desenvolvimento de Maricá - CODEMAR'


def extract_contratado(text):
    """Extrai contratado"""
    patterns = [
        r'contratad[ao][:\s]+([^\n]{5,200})',
        r'destaq\s*com[ée]rcio\s*e\s*servi[çc]os[^\n]{5,100}',
        r'empresa[:\s]+([^\n]{5,200})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            contratado = match.group(0) if match.group(0) else match.group(1)
            contratado = re.sub(r'\s*-?\s*cnpj.*$', '', contratado, flags=re.IGNORECASE)
            contratado = contratado.strip()
            if len(contratado) > 200:
                contratado = contratado[:200]
            return contratado
    
    return None


def extract_cnpj(text):
    """Extrai CNPJ"""
    pattern = r'(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2})'
    match = re.search(pattern, text)
    
    if match:
        cnpj = re.sub(r'[^\d]', '', match.group(1))
        if len(cnpj) == 14:
            return f"{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:14]}"
    
    return None


def extract_valor(text):
    """Extrai valor do contrato"""
    patterns = [
        r'valor\s*(?:global|total)?[:\s]*r\$?\s*([\d\.,]+)',
        r'valor\s*do\s*contrato[:\s]*r\$?\s*([\d\.,]+)',
        r'd[áa]-se\s*a\s*este\s*contrato\s*o\s*valor\s*total\s*de\s*r\$\s*([\d\.,]+)',
        r'r\$\s*([\d\.,]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return parse_decimal(match.group(1))
    
    return None


def extract_data_inicio(text):
    """Extrai data de início (CONTRADATA)"""
    patterns = [
        r'data\s*do\s*in[íi]cio[:\s]*([\d\/\-\.]+)',
        r'data\s*(?:de\s*)?in[íi]cio[:\s]*([\d\/\-\.]+)',
        r'in[íi]cio[:\s]*([\d\/\-\.]+)',
        r'vig[êe]ncia[:\s]*(?:de\s*)?([\d\/\-\.]+)',
        r'contrdata[:\s]*([\d\/\-\.]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return parse_date(match.group(1))
    
    return None


def extract_data_fim(text):
    """Extrai data de fim/término"""
    patterns = [
        r'data\s*(?:de\s*)?t[ée]rmino[:\s]*([\d\/\-\.]+)',
        r'data\s*(?:de\s*)?fim[:\s]*([\d\/\-\.]+)',
        r't[ée]rmino[:\s]*([\d\/\-\.]+)',
        r'at[ée][:\s]*([\d\/\-\.]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return parse_date(match.group(1))
    
    return None


def extract_data_final_documento(text):
    """Extrai data final do documento (data das assinaturas)"""
    patterns = [
        r'maric[áa],\s*([\d\s]+de\s+[a-zç]+de\s+[\d]+)',
        r'([\d]+\s+de\s+[a-zç]+de\s+[\d]+)',
        r'data[:\s]*([\d\/\-\.]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return parse_date(match.group(1))
    
    return None


def extract_previsao_legal(text):
    """Extrai previsão legal"""
    patterns = [
        r'previs[ãa]o\s*legal[:\s]*([^\n]{10,200})',
        r'lei\s*n[°º]?\s*13\.303[^\n]{10,200}',
        r'procedimento\s*licitat[óo]rio[^\n]{10,200}',
        r'processo\s*administrativo[^\n]{10,200}',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            previsao = match.group(0) if match.group(0) else match.group(1)
            previsao = previsao.strip()
            if len(previsao) > 200:
                previsao = previsao[:200] + '...'
            return previsao
    
    return None


def extract_modalidade(text):
    """Extrai modalidade"""
    modalidades = [
        'Pregão Eletrônico',
        'Pregão Presencial', 
        'Concorrência',
        'Tomada de Preços',
        'Convite',
        'Dispensa',
        'Inexigibilidade',
    ]
    
    for modalidade in modalidades:
        if modalidade.lower() in text.lower():
            return modalidade
    
    return None


def extract_tipo_contrato(text):
    """Extrai tipo de contrato"""
    tipos = {
        'Prestação de Serviços': ['prestação de serviços', 'serviços'],
        'Fornecimento': ['fornecimento', 'aquisição'],
        'Obra': ['obra', 'construção'],
        'Compra': ['compra', 'aquisição'],
    }
    
    for tipo, palavras_chave in tipos.items():
        for palavra in palavras_chave:
            if palavra.lower() in text.lower():
                return tipo
    
    return None


def extract_secretaria(text):
    """Extrai secretaria/diretoria"""
    patterns = [
        r'secretaria\s*(?:de|municipal\s*de)?\s*([^\n]{5,100})',
        r'diretoria\s*(?:de)?\s*([^\n]{5,100})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    return None


def extract_fonte_recurso(text):
    """Extrai fonte de recurso"""
    patterns = [
        r'fonte\s*(?:de\s*)?recurso[s]?[:\s]*([^\n]{5,100})',
        r'recursos?\s*(?:pr[óo]prios?|federais?|estaduais?)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    
    return None


def parse_decimal(value):
    """Converte string para decimal"""
    if not value:
        return None
    
    # Remove caracteres não numéricos exceto vírgula e ponto
    value = re.sub(r'[^\d,\.]', '', value)
    
    if ',' in value and '.' in value:
        # Formato brasileiro: 1.234.567,89
        value = value.replace('.', '').replace(',', '.')
    elif ',' in value:
        # Apenas vírgula: 1234,56
        value = value.replace(',', '.')
    
    try:
        return float(value)
    except ValueError:
        return None


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


def extract_text_from_pdf(pdf_path):
    """Extrai texto do PDF usando PyMuPDF primeiro, depois OCR se necessário"""
    try:
        # Tenta extrair texto diretamente
        doc = fitz.open(pdf_path)
        text = ""
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_text = page.get_text()
            if page_text.strip():
                text += page_text + "\n"
        
        doc.close()
        
        # Se conseguiu extrair texto diretamente, retorna
        if text.strip():
            return text
        
        # Se não conseguiu, usa OCR
        return extract_text_with_ocr(pdf_path)
        
    except Exception as e:
        # Se falhou, tenta OCR
        return extract_text_with_ocr(pdf_path)


def extract_text_with_ocr(pdf_path):
    """Extrai texto usando OCR"""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            
            # Converte página para imagem
            mat = fitz.Matrix(2.0, 2.0)  # Aumenta resolução
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            # Usa OCR na imagem
            image = Image.open(io.BytesIO(img_data))
            page_text = pytesseract.image_to_string(image, lang='por')
            text += page_text + "\n"
        
        doc.close()
        return text
        
    except Exception as e:
        raise Exception(f"Erro no OCR: {str(e)}")


def extract_contract_data(pdf_path):
    """Função principal para extrair dados do contrato"""
    try:
        # Extrai texto do PDF
        text = extract_text_from_pdf(pdf_path)
        
        if not text.strip():
            raise Exception("Não foi possível extrair texto do PDF")
        
        # Normaliza o texto
        text = normalize_text(text)
        
        # Extrai dados estruturados
        data = {
            'numero_contrato': extract_numero_contrato(text),
            'objeto': extract_objeto(text),
            'contratante': extract_contratante(text),
            'contratado': extract_contratado(text),
            'cnpj_contratado': extract_cnpj(text),
            'valor': extract_valor(text),
            'data_inicio': extract_data_inicio(text),
            'data_fim': extract_data_fim(text),
            'modalidade': extract_modalidade(text),
            'status': 'vigente',
            'tipo_contrato': extract_tipo_contrato(text),
            'secretaria': extract_secretaria(text),
            'fonte_recurso': extract_fonte_recurso(text),
            'previsao_legal': extract_previsao_legal(text),
            'data_final_documento': extract_data_final_documento(text),
            'observacoes': None,
            'texto_extraido': text[:5000],  # Primeiros 5000 caracteres
            'metodo': 'OCR' if 'tesseract' in str(pytesseract) else 'PDF_DIRETO'
        }
        
        return data
        
    except Exception as e:
        return {"error": str(e)}


def main():
    """Função principal"""
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Uso: python pdf_extractor.py <caminho_do_pdf>"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    if not os.path.exists(pdf_path):
        print(json.dumps({"error": f"Arquivo não encontrado: {pdf_path}"}))
        sys.exit(1)
    
    try:
        data = extract_contract_data(pdf_path)
        print(json.dumps(data, ensure_ascii=False, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
