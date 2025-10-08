import { NextRequest, NextResponse } from 'next/server';
import { UnidadeGestora } from '@/types/contratos';

// Simulação de dados - em produção, conectar com Laravel/MySQL
const mockUnidadesGestoras: UnidadeGestora[] = [
  {
    id: 170007,
    codigo: '170007',
    nome: 'SUCOP-STN',
    orgao_id: 25000,
    situacao: 'ativo'
  },
  {
    id: 170008,
    codigo: '170008',
    nome: 'PGFN/MF',
    orgao_id: 25000,
    situacao: 'ativo'
  },
  {
    id: 170010,
    codigo: '170010',
    nome: 'RFB/ME',
    orgao_id: 25000,
    situacao: 'ativo'
  },
  {
    id: 170011,
    codigo: '170011',
    nome: 'SPU/ME',
    orgao_id: 25000,
    situacao: 'ativo'
  },
  {
    id: 170018,
    codigo: '170018',
    nome: 'SRRF01',
    orgao_id: 25000,
    situacao: 'ativo'
  },
  {
    id: 170024,
    codigo: '170024',
    nome: 'DRF MACAPA',
    orgao_id: 25000,
    situacao: 'ativo'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgaoId = searchParams.get('orgao_id');

    // Em produção, fazer requisição para Laravel API
    // const response = await fetch(`${process.env.LARAVEL_API_URL}/api/contratos/unidades-gestoras?orgao_id=${orgaoId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`
    //   }
    // });
    // const data = await response.json();

    // Filtrar por órgão se especificado
    let unidades = mockUnidadesGestoras;
    if (orgaoId) {
      unidades = mockUnidadesGestoras.filter(u => u.orgao_id === parseInt(orgaoId));
    }

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: unidades,
      message: 'Unidades gestoras carregadas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao carregar unidades gestoras:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
