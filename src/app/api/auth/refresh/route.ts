import { NextRequest, NextResponse } from 'next/server';

// Refresh do Laravel não consta explicitamente; mantendo endpoint compatível se existir
const ECIDADE_AUTH_URL = process.env.ECIDADE_AUTH_URL || 'http://localhost:8000/v4';

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Refresh token é obrigatório' },
        { status: 400 }
      );
    }

    const response = await fetch(`${ECIDADE_AUTH_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        refresh_token,
        client_id: process.env.ECIDADE_CLIENT_ID,
        client_secret: process.env.ECIDADE_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return NextResponse.json(
        { error: 'Falha ao renovar', details: text?.slice(0, 500) },
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
    console.error('Erro ao renovar token:', error);
    return NextResponse.json(
      { error: 'Erro ao renovar token de acesso' },
      { status: 500 }
    );
  }
}

