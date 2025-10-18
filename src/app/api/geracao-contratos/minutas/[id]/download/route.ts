import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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

// GET - Download de minuta específica
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
      const fileBuffer = await fs.readFile(filePath);
      const bytes = new Uint8Array(fileBuffer);

      return new NextResponse(bytes, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${minuta.nome}.docx"`,
          'Content-Length': bytes.byteLength.toString(),
        },
      });
    } catch (fileError) {
      console.error('Erro ao ler arquivo:', fileError);
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Erro no download:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}



