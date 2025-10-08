import { NextRequest, NextResponse } from 'next/server';

const ECIDADE_API_URL = process.env.ECIDADE_API_URL || 'http://localhost:8000/v4/api';

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
      const text = await response.text().catch(() => '');
      return NextResponse.json(
        { error: 'Erro ao chamar backend', status: response.status, details: text?.slice(0, 500) },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    }
    const text = await response.text();
    return new NextResponse(text, {
      status: 200,
      headers: { 'content-type': contentType || 'text/plain; charset=utf-8' },
    });
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
      const text = await response.text().catch(() => '');
      return NextResponse.json(
        { error: 'Erro ao chamar backend', status: response.status, details: text?.slice(0, 500) },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    }
    const text = await response.text();
    return new NextResponse(text, {
      status: 200,
      headers: { 'content-type': contentType || 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Erro na API do e-Cidade:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com a API do e-Cidade' },
      { status: 500 }
    );
  }
}




