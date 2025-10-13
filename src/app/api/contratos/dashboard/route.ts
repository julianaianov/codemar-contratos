import { NextRequest, NextResponse } from 'next/server';
import { ContratoController } from '../../../../../supabase';

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json();

    // Usar o ContratoController do Supabase para buscar estatísticas
    const statsResult = await ContratoController.stats({
      diretoria: filters?.diretoria
    });

    if (!statsResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: statsResult.message
      }, { status: 500 });
    }

    const stats = statsResult.data!;

    // Buscar contratos para calcular vencimentos
    const contratosResult = await ContratoController.index({
      diretoria: filters?.diretoria,
      per_page: 1000
    });

    let v30 = 0, v30_60 = 0, v60_90 = 0, v90_180 = 0, v180 = 0;

    if (contratosResult.success && contratosResult.data) {
      const now = new Date();
      const toDate = (d: any) => (d ? new Date(d) : null);
      const daysUntil = (end: Date | null) => (end ? Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null);

      for (const contrato of contratosResult.data.data) {
        const status = (contrato?.status || '').toLowerCase();
        if (status === 'vigente') {
          const df = daysUntil(toDate(contrato?.data_fim));
          if (df !== null) {
            if (df <= 30 && df >= 0) v30 += 1;
            else if (df <= 60 && df >= 31) v30_60 += 1;
            else if (df <= 90 && df >= 61) v60_90 += 1;
            else if (df <= 180 && df >= 91) v90_180 += 1;
            else if (df > 180) v180 += 1;
          }
        }
      }
    }

    const dashboard = {
      success: true,
      data: {
        total_contratos: stats.total,
        contratos_ativos: stats.vigentes,
        contratos_vencidos: stats.encerrados,
        valor_total_contratado: stats.valor_total,
        valor_total_pago: 0, // Não implementado ainda
        valor_restante: stats.valor_total, // Assumindo que nada foi pago
        contratos_vencendo_30_dias: v30,
        contratos_vencendo_30_60_dias: v30_60,
        contratos_vencendo_60_90_dias: v60_90,
        contratos_vencendo_90_180_dias: v90_180,
        contratos_vencendo_mais_180_dias: v180,
        // Dados adicionais do Supabase
        contratos_suspensos: stats.suspensos,
        contratos_rescindidos: stats.rescindidos,
        valor_contratos_vigentes: stats.valor_vigentes
      },
      message: 'Dashboard calculado via Supabase'
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Erro ao buscar dashboard de contratos:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
