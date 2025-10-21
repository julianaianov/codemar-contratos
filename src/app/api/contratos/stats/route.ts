import { NextRequest, NextResponse } from 'next/server';
import { ContratosService } from '@/services/contratos-service';

// GET - Obter estatísticas dos contratos
export async function GET(request: NextRequest) {
  try {
    const stats = await ContratosService.obterEstatisticas();

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro ao obter estatísticas',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
