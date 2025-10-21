import { NextRequest, NextResponse } from 'next/server';
import { ContratosService } from '@/services/contratos-service';

// POST - Salvar edição do contrato
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const arquivoEditado = formData.get('arquivo') as File;
    const usuario = formData.get('usuario') as string;

    if (!arquivoEditado) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Arquivo editado é obrigatório',
          errors: { arquivo: ['Arquivo editado é obrigatório'] }
        },
        { status: 400 }
      );
    }

    // Verificar tipo de arquivo
    const allowedTypes = ['pdf', 'docx', 'doc'];
    const fileExtension = arquivoEditado.name.split('.').pop()?.toLowerCase();
    
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
    if (arquivoEditado.size > maxSize) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Arquivo muito grande',
          errors: { arquivo: ['Tamanho máximo: 50MB'] }
        },
        { status: 400 }
      );
    }

    const contratoAtualizado = await ContratosService.salvarEdicao(
      params.id, 
      arquivoEditado, 
      usuario || 'sistema'
    );

    return NextResponse.json({
      success: true,
      message: 'Edição salva com sucesso',
      data: contratoAtualizado
    });

  } catch (error) {
    console.error('Erro ao salvar edição:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro ao salvar edição',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
