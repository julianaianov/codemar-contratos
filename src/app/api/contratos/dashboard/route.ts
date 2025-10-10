import { NextRequest, NextResponse } from 'next/server';
import { FiltrosContratos } from '@/types/contratos';

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const filters: FiltrosContratos = await request.json();

    const response = await fetch(`${API_URL}/api/contratos/dashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filters)
    });
    const data = await response.json();

    if (response.ok && data?.success) {
      return NextResponse.json(data);
    }

    // Fallback: calcular métricas a partir da lista de contratos
    const url = new URL(`${API_URL}/api/contratos`);
    if (filters?.diretoria) url.searchParams.append('diretoria', String(filters.diretoria));
    url.searchParams.append('per_page', '1000');

    const contratosResp = await fetch(url.toString());
    const contratosJson = await contratosResp.json();
    const lista: any[] = contratosJson?.data?.data || contratosJson?.data || contratosJson || [];

    const now = new Date();
    const toDate = (d: any) => (d ? new Date(d) : null);
    const daysUntil = (end: Date | null) => (end ? Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null);

    let total = 0;
    let valorTotal = 0;
    let vigentes = 0;
    let v30 = 0, v30_60 = 0, v60_90 = 0, v90_180 = 0, v180 = 0;

    for (const c of lista) {
      total += 1;
      valorTotal += Number(c?.valor || 0);
      const status = (c?.status || '').toLowerCase();
      if (status === 'vigente') {
        vigentes += 1;
        const df = daysUntil(toDate(c?.data_fim));
        if (df !== null) {
          if (df <= 30 && df >= 0) v30 += 1;
          else if (df <= 60 && df >= 31) v30_60 += 1;
          else if (df <= 90 && df >= 61) v60_90 += 1;
          else if (df <= 180 && df >= 91) v90_180 += 1;
          else if (df > 180) v180 += 1;
        }
      }
    }

    const fallback = {
      success: true,
      data: {
        total_contratos: total,
        contratos_ativos: vigentes,
        contratos_vencidos: 0,
        valor_total_contratado: valorTotal,
        valor_total_pago: 0,
        valor_restante: 0,
        contratos_vencendo_30_dias: v30,
        contratos_vencendo_30_60_dias: v30_60,
        contratos_vencendo_60_90_dias: v60_90,
        contratos_vencendo_90_180_dias: v90_180,
        contratos_vencendo_mais_180_dias: v180,
      },
      message: 'Dashboard calculado via fallback'
    };
    return NextResponse.json(fallback);
  } catch (error) {
    console.error('Erro ao proxy dashboard de contratos:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
