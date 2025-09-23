import { NextRequest, NextResponse } from 'next/server';

const ECIDADE_API_URL = process.env.ECIDADE_API_URL || 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Refresh token é obrigatório' },
        { status: 400 }
      );
    }

    const response = await fetch(`${ECIDADE_API_URL}/auth/refresh`, {
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return NextResponse.json(
      { error: 'Erro ao renovar token de acesso' },
      { status: 500 }
    );
  }
}

