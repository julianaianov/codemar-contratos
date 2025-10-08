import { NextRequest, NextResponse } from 'next/server';
import { FiltrosContratos, MetricasContratos } from '@/types/contratos';

// Simulação de dados - em produção, conectar com Laravel/MySQL
const mockMetricasData: MetricasContratos = {
  total_contratos: 4972,
  percentual_ativos: 100,
  vencem_30_dias: {
    quantidade: 2869,
    percentual: 58
  },
  vencem_30_60_dias: {
    quantidade: 83,
    percentual: 2
  },
  vencem_60_90_dias: {
    quantidade: 463,
    percentual: 9
  },
  vencem_90_180_dias: {
    quantidade: 205,
    percentual: 4
  },
  vencem_mais_180_dias: {
    quantidade: 1132,
    percentual: 23
  },
  valor_contratado: 11366407449.88,
  valor_pago: 8500000000.00,
  valor_restante: 2866407449.88,
};

export async function POST(request: NextRequest) {
  try {
    const filters: FiltrosContratos = await request.json();

    // Em produção, fazer requisição para Laravel API
    // const response = await fetch(`${process.env.LARAVEL_API_URL}/api/contratos/metricas`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`
    //   },
    //   body: JSON.stringify(filters)
    // });
    // const data = await response.json();

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      data: mockMetricasData,
      message: 'Métricas carregadas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao carregar métricas:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
