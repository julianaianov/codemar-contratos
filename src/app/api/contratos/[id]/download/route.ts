import { NextRequest, NextResponse } from 'next/server';
import { ContratosService } from '@/services/contratos-service';

// GET - Download de arquivo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'original'; // 'original' ou 'editado'

    let downloadData;
    
    if (tipo === 'editado') {
      downloadData = await ContratosService.downloadEditado(params.id);
    } else {
      downloadData = await ContratosService.downloadOriginal(params.id);
    }

    return NextResponse.json({
      success: true,
      data: downloadData
    });

  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro ao baixar arquivo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
