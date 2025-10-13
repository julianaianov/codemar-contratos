import { NextRequest, NextResponse } from 'next/server';
import { FiltrosContratos } from '@/types/contratos';

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const filters: FiltrosContratos = await request.json();

    const response = await fetch(`${API_URL}/api/contratos/metricas`, {
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

    // Fallback: derivar métricas básicas dos contratos com filtro de diretoria
    const url = new URL(`${API_URL}/api/contratos`);
    if (filters?.diretoria) url.searchParams.append('diretoria', String(filters.diretoria));
    url.searchParams.append('per_page', '1000');
    const contratosResp = await fetch(url.toString());
    const contratosJson = await contratosResp.json();
    let lista: any[] = [];
    if (Array.isArray(contratosJson)) lista = contratosJson as any[];
    else if (Array.isArray(contratosJson?.data?.data)) lista = contratosJson.data.data as any[];
    else if (Array.isArray(contratosJson?.data)) lista = contratosJson.data as any[];

    const total = lista.length;
    const ativos = lista.filter(c => String(c?.status || '').toLowerCase() === 'vigente').length;
    const parseMoney = (value: any): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return value;
      let t = String(value).replace(/[^\d.,-]/g, '');
      const lastDot = t.lastIndexOf('.');
      const lastComma = t.lastIndexOf(',');
      if (lastDot !== -1 && lastComma !== -1) {
        if (lastDot > lastComma) {
          t = t.replace(/,/g, '');
        } else {
          t = t.replace(/\./g, '').replace(/,/g, '.');
        }
      } else if (lastComma !== -1) {
        t = t.replace(/,/g, '.');
      }
      const n = Number(t);
      return isNaN(n) ? 0 : n;
    };

    const valor_contratado = lista.reduce((s, c) => s + parseMoney(c?.valor ?? c?.valor_contrato ?? 0), 0);

    const fallback = {
      success: true,
      data: {
        total_contratos: total,
        percentual_ativos: total ? Math.round((ativos / total) * 100) : 0,
        vencem_30_dias: { quantidade: 0, percentual: 0 },
        vencem_30_60_dias: { quantidade: 0, percentual: 0 },
        vencem_60_90_dias: { quantidade: 0, percentual: 0 },
        vencem_90_180_dias: { quantidade: 0, percentual: 0 },
        vencem_mais_180_dias: { quantidade: 0, percentual: 0 },
        valor_contratado,
        valor_pago: 0,
        valor_restante: 0,
      },
      message: 'Métricas calculadas via fallback',
    };
    return NextResponse.json(fallback);
  } catch (error) {
    console.error('Erro ao proxy métricas de contratos:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
