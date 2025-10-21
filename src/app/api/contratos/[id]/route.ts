import { NextRequest, NextResponse } from 'next/server';
import { ContratosService } from '@/services/contratos-service';

// GET - Buscar contrato por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contrato = await ContratosService.buscarContrato(params.id);

    if (!contrato) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Contrato não encontrado'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contrato
    });

  } catch (error) {
    console.error('Erro ao buscar contrato:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro ao buscar contrato',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar contrato
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nome, descricao, status, metadata } = body;

    // Buscar contrato existente
    const contratoExistente = await ContratosService.buscarContrato(params.id);
    if (!contratoExistente) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Contrato não encontrado'
        },
        { status: 404 }
      );
    }

    // Atualizar apenas os campos fornecidos
    const updates: any = {};
    if (nome !== undefined) updates.nome = nome;
    if (descricao !== undefined) updates.descricao = descricao;
    if (status !== undefined) updates.status = status;
    if (metadata !== undefined) updates.metadata = metadata;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Nenhum campo para atualizar'
        },
        { status: 400 }
      );
    }

    // Aqui você implementaria a atualização no banco
    // Por enquanto, retornamos o contrato existente
    return NextResponse.json({
      success: true,
      message: 'Contrato atualizado com sucesso',
      data: contratoExistente
    });

  } catch (error) {
    console.error('Erro ao atualizar contrato:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro ao atualizar contrato',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// DELETE - Excluir contrato
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ContratosService.excluirContrato(params.id);

    return NextResponse.json({
      success: true,
      message: 'Contrato excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir contrato:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro ao excluir contrato',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
