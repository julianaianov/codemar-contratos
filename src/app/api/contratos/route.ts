import { NextRequest, NextResponse } from 'next/server';
import { ContratosService } from '@/services/contratos-service';

// GET - Listar contratos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filtros = {
      tipo: searchParams.get('tipo') || undefined,
      status: searchParams.get('status') || undefined,
      is_editado: searchParams.get('is_editado') === 'true' ? true : searchParams.get('is_editado') === 'false' ? false : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      per_page: parseInt(searchParams.get('per_page') || '15')
    };

    const result = await ContratosService.listarContratos(filtros);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro ao listar contratos:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro ao listar contratos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// POST - Upload de novo contrato
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const nome = formData.get('nome') as string;
    const descricao = formData.get('descricao') as string;
    const arquivo = formData.get('arquivo') as File;
    const usuario = formData.get('usuario') as string;
    const metadata = formData.get('metadata') as string;

    if (!nome || !arquivo) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Nome e arquivo são obrigatórios',
          errors: { 
            nome: nome ? [] : ['Nome é obrigatório'],
            arquivo: arquivo ? [] : ['Arquivo é obrigatório']
          }
        },
        { status: 400 }
      );
    }

    // Verificar tipo de arquivo
    const allowedTypes = ['pdf', 'docx', 'doc'];
    const fileExtension = arquivo.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Tipo de arquivo não suportado',
          errors: { arquivo: ['Tipos suportados: PDF, DOCX, DOC'] }
        },
        { status: 400 }
      );
    }

    // Verificar tamanho do arquivo (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (arquivo.size > maxSize) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Arquivo muito grande',
          errors: { arquivo: ['Tamanho máximo: 50MB'] }
        },
        { status: 400 }
      );
    }

    const contratoData = {
      nome,
      descricao: descricao || '',
      arquivo,
      usuario: usuario || 'sistema',
      metadata: metadata ? JSON.parse(metadata) : {}
    };

    const contrato = await ContratosService.uploadContrato(contratoData);

    return NextResponse.json({
      success: true,
      message: 'Contrato enviado com sucesso',
      data: contrato
    });

  } catch (error) {
    console.error('Erro no upload do contrato:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro ao enviar contrato',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
