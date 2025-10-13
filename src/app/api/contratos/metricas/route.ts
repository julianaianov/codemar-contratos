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
        message: 'Erro ao buscar métricas',
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

    const percentualAtivos = stats.total > 0 ? Math.round((stats.vigentes / stats.total) * 100) : 0;

    const metricas = {
      success: true,
      data: {
        total_contratos: stats.total,
        percentual_ativos: percentualAtivos,
        vencem_30_dias: { 
          quantidade: v30, 
          percentual: stats.vigentes > 0 ? Math.round((v30 / stats.vigentes) * 100) : 0 
        },
        vencem_30_60_dias: { 
          quantidade: v30_60, 
          percentual: stats.vigentes > 0 ? Math.round((v30_60 / stats.vigentes) * 100) : 0 
        },
        vencem_60_90_dias: { 
          quantidade: v60_90, 
          percentual: stats.vigentes > 0 ? Math.round((v60_90 / stats.vigentes) * 100) : 0 
        },
        vencem_90_180_dias: { 
          quantidade: v90_180, 
          percentual: stats.vigentes > 0 ? Math.round((v90_180 / stats.vigentes) * 100) : 0 
        },
        vencem_mais_180_dias: { 
          quantidade: v180, 
          percentual: stats.vigentes > 0 ? Math.round((v180 / stats.vigentes) * 100) : 0 
        },
        valor_contratado: stats.valor_total,
        valor_pago: 0, // Não implementado ainda
        valor_restante: stats.valor_total, // Assumindo que nada foi pago
        // Dados adicionais do Supabase
        contratos_encerrados: stats.encerrados,
        contratos_suspensos: stats.suspensos,
        contratos_rescindidos: stats.rescindidos,
        valor_contratos_vigentes: stats.valor_vigentes
      },
      message: 'Métricas calculadas via Supabase'
    };

    return NextResponse.json(metricas);
  } catch (error) {
    console.error('Erro ao buscar métricas de contratos:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
