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

// Garantir que o diretório existe
async function ensureMinutasDir() {
  try {
    await fs.access(MINUTAS_DIR);
  } catch {
    await fs.mkdir(MINUTAS_DIR, { recursive: true });
  }
}

// Carregar metadados das minutas
async function loadMetadata(): Promise<MinutaModel[]> {
  try {
    await ensureMinutasDir();
    const data = await fs.readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Salvar metadados das minutas
async function saveMetadata(minutas: MinutaModel[]) {
  await ensureMinutasDir();
  await fs.writeFile(METADATA_FILE, JSON.stringify(minutas, null, 2));
}

// POST - Upload de nova minuta
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const arquivo = formData.get('arquivo') as File;
    const nome = formData.get('nome') as string;
    const descricao = formData.get('descricao') as string;

    if (!arquivo || !nome) {
      return NextResponse.json(
        { error: 'Arquivo e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se é um arquivo .docx
    if (!arquivo.name.toLowerCase().endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Apenas arquivos .docx são permitidos' },
        { status: 400 }
      );
    }

    // Verificar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (arquivo.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo permitido: 10MB' },
        { status: 400 }
      );
    }

    await ensureMinutasDir();

    // Gerar ID único
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Nome do arquivo no servidor (sanitizado)
    const sanitizedName = arquivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${id}_${sanitizedName}`;
    const filePath = path.join(MINUTAS_DIR, fileName);

    // Salvar arquivo
    const bytes = await arquivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    // Criar metadados
    const novaMinuta: MinutaModel = {
      id,
      nome: nome.trim(),
      descricao: descricao ? descricao.trim() : '',
      arquivo: fileName,
      tamanho: arquivo.size,
      dataUpload: new Date().toISOString(),
      tipo: 'DOCX'
    };

    // Salvar metadados
    const minutas = await loadMetadata();
    minutas.push(novaMinuta);
    await saveMetadata(minutas);

    return NextResponse.json({
      success: true,
      minuta: novaMinuta
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
