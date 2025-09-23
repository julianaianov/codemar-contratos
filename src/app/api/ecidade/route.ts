import { NextRequest, NextResponse } from 'next/server';

const ECIDADE_API_URL = process.env.ECIDADE_API_URL || 'http://localhost:8000/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';
  
  try {
    const response = await fetch(`${ECIDADE_API_URL}/${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API do e-Cidade:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com a API do e-Cidade' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${ECIDADE_API_URL}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API do e-Cidade:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com a API do e-Cidade' },
      { status: 500 }
    );
  }
}

