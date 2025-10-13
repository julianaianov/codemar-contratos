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
    const backend = await response.json();

    // Fallback: calcular métricas a partir da lista de contratos
    const url = new URL(`${API_URL}/api/contratos`);
    if (filters?.diretoria) url.searchParams.append('diretoria', String(filters.diretoria));
    url.searchParams.append('per_page', '1000');

    const contratosResp = await fetch(url.toString());
    const contratosJson = await contratosResp.json();
    let lista: any[] = [];
    if (Array.isArray(contratosJson)) lista = contratosJson as any[];
    else if (Array.isArray(contratosJson?.data?.data)) lista = contratosJson.data.data as any[];
    else if (Array.isArray(contratosJson?.data)) lista = contratosJson.data as any[];

    const parseMoney = (value: any): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return value;
      const s = String(value);
      // mantém apenas dígitos, ponto e vírgula
      let t = s.replace(/[^\d.,-]/g, '');
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

    const now = new Date();
    const toDate = (d: any) => (d ? new Date(d) : null);
    const daysUntil = (end: Date | null) => (end ? Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null);

    let total = 0;
    let valorTotal = 0;
    let vigentes = 0;
    let v30 = 0, v30_60 = 0, v60_90 = 0, v90_180 = 0, v180 = 0;

    for (const c of lista) {
      total += 1;
      // Somar valor do contrato a partir de qualquer campo disponível (suporta formato pt-BR)
      const rawValor = (c?.valor ?? c?.valor_contrato ?? 0) as any;
      valorTotal += parseMoney(rawValor);
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
    // Se o backend respondeu com sucesso, preferir dados dele, mas reforçar o valor_total_contratado
    if (response.ok && backend?.success && backend?.data) {
      const merged = { ...backend };
      const bt = backend.data || {};
      const val = Number(bt.valor_total_contratado);
      if (!Number.isFinite(val) || val <= 0) {
        merged.data.valor_total_contratado = valorTotal;
        merged.message = 'Dashboard (valor_total_contratado) ajustado via fallback';
      }
      // também reforça total_contratos se backend não enviar
      if (!Number.isFinite(Number(bt.total_contratos)) || Number(bt.total_contratos) <= 0) {
        merged.data.total_contratos = total;
      }
      return NextResponse.json(merged);
    }
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
