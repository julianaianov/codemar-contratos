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
  tamanho: number;
  dataUpload: string;
  tipo: string;
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

// GET - Preview de minuta específica (converte DOCX para HTML)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const minutas = await loadMetadata();
    const minuta = minutas.find(m => m.id === id);

    if (!minuta) {
      return NextResponse.json(
        { error: 'Minuta não encontrada' },
        { status: 404 }
      );
    }

    const filePath = path.join(MINUTAS_DIR, minuta.arquivo);
    
    try {
      // Ler arquivo DOCX
      const fileBuffer = await fs.readFile(filePath);
      
      // Converter DOCX para HTML usando mammoth
      const result = await mammoth.convertToHtml({ buffer: fileBuffer });
      
      // Retornar HTML com metadados
      return NextResponse.json({
        success: true,
        html: result.value,
        messages: result.messages,
        minuta: {
          id: minuta.id,
          nome: minuta.nome,
          descricao: minuta.descricao,
          dataUpload: minuta.dataUpload
        }
      });
      
    } catch (fileError) {
      console.error('Erro ao processar arquivo:', fileError);
      return NextResponse.json(
        { error: 'Erro ao processar arquivo DOCX' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro no preview:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

