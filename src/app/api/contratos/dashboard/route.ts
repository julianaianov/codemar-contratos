import { NextRequest, NextResponse } from 'next/server';
import { FiltrosContratos, DashboardContratos } from '@/types/contratos';

// Simulação de dados - em produção, conectar com Laravel/MySQL
const mockDashboardData: DashboardContratos = {
  total_contratos: 4972,
  contratos_ativos: 4972,
  contratos_vencidos: 0,
  valor_total_contratado: 11366407449.88,
  valor_total_pago: 8500000000.00,
  valor_restante: 2866407449.88,
  contratos_vencendo_30_dias: 2869,
  contratos_vencendo_30_60_dias: 83,
  contratos_vencendo_60_90_dias: 463,
  contratos_vencendo_90_180_dias: 205,
  contratos_vencendo_mais_180_dias: 1132,
};

export async function POST(request: NextRequest) {
  try {
    const filters: FiltrosContratos = await request.json();

    // Em produção, fazer requisição para Laravel API
    // const response = await fetch(`${process.env.LARAVEL_API_URL}/api/contratos/dashboard`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`
    //   },
    //   body: JSON.stringify(filters)
    // });
    // const data = await response.json();

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      data: mockDashboardData,
      message: 'Dados do dashboard carregados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
