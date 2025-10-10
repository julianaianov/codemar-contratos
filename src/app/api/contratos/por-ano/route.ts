import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/contratos/por-ano`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: data?.message || 'Erro ao carregar dados por ano',
        error: data?.error || undefined
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao proxy dados por ano dos contratos:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
