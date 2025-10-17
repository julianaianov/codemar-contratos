import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import mammoth from 'mammoth';

// Interface para o modelo de minuta
interface MinutaModel {
  id: string;
  nome: string;
  descricao: string;
  arquivo: string;
  arquivoOriginal: string;
  tamanho: number;
  dataUpload: string;
  dataUltimaEdicao?: string;
  tipo: string;
  versao: number;
  isEditada: boolean;
  versaoOriginal?: string;
}

// Diretório para armazenar as minutas
const MINUTAS_DIR = path.join(process.cwd(), 'public', 'minutas');
const METADATA_FILE = path.join(MINUTAS_DIR, 'metadata.json');

// Carregar metadados das minutas
async function loadMetadata(): Promise<MinutaModel[]> {
  try {
    const data = await fs.readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// GET - Gerar versão para impressão
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'editada'; // 'original' ou 'editada'
    
    const minutas = await loadMetadata();
    const minuta = minutas.find(m => m.id === id);

    if (!minuta) {
      return NextResponse.json(
        { error: 'Minuta não encontrada' },
        { status: 404 }
      );
    }

    // Escolher arquivo baseado no tipo
    let arquivoParaImpressao: string;
    let nomeArquivo: string;
    
    if (tipo === 'original') {
      arquivoParaImpressao = minuta.arquivoOriginal || minuta.arquivo;
      nomeArquivo = `${minuta.nome}_original`;
    } else {
      arquivoParaImpressao = minuta.arquivo;
      nomeArquivo = minuta.isEditada ? `${minuta.nome}_editada` : minuta.nome;
    }

    const filePath = path.join(MINUTAS_DIR, arquivoParaImpressao);
    
    try {
      // Ler arquivo DOCX
      const fileBuffer = await fs.readFile(filePath);
      
      // Converter DOCX para HTML para impressão
      const result = await mammoth.convertToHtml({ buffer: fileBuffer });
      
      // Criar HTML otimizado para impressão
      const printHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${nomeArquivo} - CODEMAR</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
            background: white;
            margin: 0;
            padding: 0;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 18pt;
            font-weight: bold;
            margin: 0;
        }
        
        .header .subtitle {
            font-size: 12pt;
            margin-top: 10px;
            color: #666;
        }
        
        .content {
            text-align: justify;
        }
        
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10pt;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .no-print {
                display: none !important;
            }
        }
        
        .minuta-info {
            background: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #007bff;
            margin-bottom: 20px;
        }
        
        .minuta-info h3 {
            margin: 0 0 10px 0;
            color: #007bff;
        }
        
        .minuta-info p {
            margin: 5px 0;
            font-size: 11pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CODEMAR - Companhia de Desenvolvimento de Maricá</h1>
        <div class="subtitle">Sistema de Gestão de Contratos</div>
    </div>
    
    <div class="minuta-info">
        <h3>Informações da Minuta</h3>
        <p><strong>Nome:</strong> ${minuta.nome}</p>
        <p><strong>Descrição:</strong> ${minuta.descricao || 'Não informada'}</p>
        <p><strong>Tipo:</strong> ${minuta.tipo}</p>
        <p><strong>Versão:</strong> ${minuta.versao}</p>
        <p><strong>Data de Upload:</strong> ${new Date(minuta.dataUpload).toLocaleDateString('pt-BR')}</p>
        ${minuta.dataUltimaEdicao ? `<p><strong>Última Edição:</strong> ${new Date(minuta.dataUltimaEdicao).toLocaleDateString('pt-BR')}</p>` : ''}
        <p><strong>Status:</strong> ${minuta.isEditada ? 'Versão Editada' : 'Versão Original'}</p>
    </div>
    
    <div class="content">
        ${result.value}
    </div>
    
    <div class="footer">
        <p>Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        <p>CODEMAR - Sistema de Gestão de Contratos</p>
    </div>
    
    <script>
        // Auto-print quando a página carregar
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 1000);
        };
    </script>
</body>
</html>`;

      return new NextResponse(printHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
      
    } catch (fileError) {
      console.error('Erro ao processar arquivo para impressão:', fileError);
      return NextResponse.json(
        { error: 'Erro ao processar arquivo para impressão' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro na impressão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
