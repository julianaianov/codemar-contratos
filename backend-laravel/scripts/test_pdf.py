#!/usr/bin/env python3
"""
Script simples para testar extração de PDF
"""

import sys
import json

try:
    import fitz  # PyMuPDF
    print("PyMuPDF importado com sucesso")
except ImportError as e:
    print(f"Erro ao importar PyMuPDF: {e}")
    sys.exit(1)

def test_pdf(pdf_path):
    """Testa abertura do PDF"""
    try:
        print(f"Tentando abrir: {pdf_path}")
        doc = fitz.open(pdf_path)
        print(f"PDF aberto com sucesso. Páginas: {len(doc)}")
        
        # Tenta extrair texto da primeira página
        page = doc.load_page(0)
        text = page.get_text()
        print(f"Texto extraído (primeiros 200 chars): {text[:200]}")
        
        doc.close()
        return True
        
    except Exception as e:
        print(f"Erro: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python test_pdf.py <caminho_do_pdf>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    success = test_pdf(pdf_path)
    
    if success:
        print("Teste concluído com sucesso")
    else:
        print("Teste falhou")
        sys.exit(1)
