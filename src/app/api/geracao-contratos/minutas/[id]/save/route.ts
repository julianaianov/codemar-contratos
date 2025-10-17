import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
// Import dinâmico do pacote docx dentro do handler para evitar problemas de bundling

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

// Salvar metadados das minutas
async function saveMetadata(minutas: MinutaModel[]) {
  await fs.writeFile(METADATA_FILE, JSON.stringify(minutas, null, 2));
}

// POST - Salvar edições da minuta (criar nova versão)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content, nome, descricao } = body;

    const minutas = await loadMetadata();
    const minutaOriginal = minutas.find(m => m.id === id);

    if (!minutaOriginal) {
      return NextResponse.json(
        { error: 'Minuta não encontrada' },
        { status: 404 }
      );
    }

    // Gerar novo ID para a versão editada
    const novoId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Nome do arquivo editado
    const nomeArquivo = minutaOriginal.arquivo.replace(/^\d+_/, `${novoId}_`);
    const filePath = path.join(MINUTAS_DIR, nomeArquivo);

    // Importar docx dinamicamente para evitar problemas de export em tempo de build
    const docx = await import('docx');

    // Criar novo documento DOCX a partir do conteúdo
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: content || 'Documento editado',
                size: 24,
              }),
            ],
          }),
        ],
      }],
    });

    // Gerar buffer do documento
    const buffer = await docx.Packer.toBuffer(doc);

    // Salvar arquivo editado
    await fs.writeFile(filePath, buffer);

    // Criar nova minuta editada
    const minutaEditada: MinutaModel = {
      id: novoId,
      nome: nome || minutaOriginal.nome,
      descricao: descricao !== undefined ? descricao : minutaOriginal.descricao,
      arquivo: nomeArquivo,
      arquivoOriginal: minutaOriginal.arquivoOriginal, // Manter referência ao original
      tamanho: buffer.length,
      dataUpload: minutaOriginal.dataUpload,
      dataUltimaEdicao: new Date().toISOString(),
      tipo: minutaOriginal.tipo,
      versao: minutaOriginal.versao + 1,
      isEditada: true,
      versaoOriginal: minutaOriginal.versaoOriginal || minutaOriginal.id
    };

    // Adicionar nova versão editada
    minutas.push(minutaEditada);
    await saveMetadata(minutas);

    return NextResponse.json({
      success: true,
      message: 'Minuta editada salva com sucesso',
      minuta: minutaEditada,
      minutaOriginal: minutaOriginal
    });

  } catch (error) {
    console.error('Erro ao salvar minuta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
