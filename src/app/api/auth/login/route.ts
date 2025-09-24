import { NextRequest, NextResponse } from 'next/server';

// Login do Laravel está sob /v4/login (fora do prefixo /v4/api)
const ECIDADE_AUTH_URL = process.env.ECIDADE_AUTH_URL || 'http://localhost:8000/v4';

export async function POST(request: NextRequest) {
  try {
    const { cpf, username, password } = await request.json();

    if (!password || (!cpf && !username)) {
      return NextResponse.json(
        { error: 'Usuário (CPF) e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // O backend espera campo "username"; mapeamos cpf -> username
    const body = {
      username: username || cpf,
      password,
      client_id: process.env.ECIDADE_CLIENT_ID,
      client_secret: process.env.ECIDADE_CLIENT_SECRET,
    } as Record<string, unknown>;

    const response = await fetch(`${ECIDADE_AUTH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return NextResponse.json(
        { error: 'Falha na autenticação', details: text?.slice(0, 500) },
        { status: response.status }
      );
    }

    // Tenta JSON; se vier texto, repassa bruto
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
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro ao autenticar' },
      { status: 500 }
    );
  }
}


