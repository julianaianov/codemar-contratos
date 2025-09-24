import { NextRequest, NextResponse } from 'next/server';

const ECIDADE_API_URL = process.env.ECIDADE_API_URL || 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
  try {
    const { cpf, password } = await request.json();

    if (!cpf || !password) {
      return NextResponse.json(
        { error: 'CPF e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const response = await fetch(`${ECIDADE_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        cpf,
        password,
        client_id: process.env.ECIDADE_CLIENT_ID,
        client_secret: process.env.ECIDADE_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Falha na autenticação' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro ao autenticar' },
      { status: 500 }
    );
  }
}


