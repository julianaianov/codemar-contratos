import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = new URL(`${API_URL}/api/contratos/por-ano`);
    searchParams.forEach((value, key) => url.searchParams.append(key, value));

    const response = await fetch(url.toString());
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
