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

// Salvar metadados das minutas
async function saveMetadata(minutas: MinutaModel[]) {
  await fs.writeFile(METADATA_FILE, JSON.stringify(minutas, null, 2));
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
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${minuta.nome}.docx"`,
          'Content-Length': fileBuffer.length.toString(),
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

// DELETE - Excluir minuta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const minutas = await loadMetadata();
    const minutaIndex = minutas.findIndex(m => m.id === id);

    if (minutaIndex === -1) {
      return NextResponse.json(
        { error: 'Minuta não encontrada' },
        { status: 404 }
      );
    }

    const minuta = minutas[minutaIndex];
    const filePath = path.join(MINUTAS_DIR, minuta.arquivo);

    // Remover arquivo físico
    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn('Arquivo não encontrado para exclusão:', fileError);
    }

    // Remover dos metadados
    minutas.splice(minutaIndex, 1);
    await saveMetadata(minutas);

    return NextResponse.json({
      success: true,
      message: 'Minuta excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro na exclusão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar minuta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { nome, descricao } = body;

    const minutas = await loadMetadata();
    const minutaIndex = minutas.findIndex(m => m.id === id);

    if (minutaIndex === -1) {
      return NextResponse.json(
        { error: 'Minuta não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar metadados
    if (nome) minutas[minutaIndex].nome = nome;
    if (descricao !== undefined) minutas[minutaIndex].descricao = descricao;

    await saveMetadata(minutas);

    return NextResponse.json({
      success: true,
      minuta: minutas[minutaIndex]
    });

  } catch (error) {
    console.error('Erro na atualização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
