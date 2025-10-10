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

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: data?.message || 'Erro ao carregar métricas',
        error: data?.error || undefined
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao proxy métricas de contratos:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
