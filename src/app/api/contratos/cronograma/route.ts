import { NextResponse } from 'next/server';
import { CronogramaContrato } from '@/types/contratos';

// Simulação de dados - em produção, conectar com Laravel/MySQL
const mockCronogramaData: CronogramaContrato[] = [];

// Gerar dados para 2023-2027
for (let ano = 2023; ano <= 2027; ano++) {
  for (let mes = 1; mes <= 12; mes++) {
    // Valores baseados na imagem fornecida
    let valor = 0;
    
    if (ano === 2023) {
      if (mes <= 6) valor = 700000000 + Math.random() * 400000000;
      else if (mes === 11) valor = 2200000000;
      else if (mes === 12) valor = 2050000000;
      else valor = 800000000 + Math.random() * 300000000;
    } else if (ano === 2024) {
      if (mes <= 9) valor = 2000000000 + Math.random() * 500000000;
      else if (mes === 10) valor = 3700000000; // Pico em outubro
      else if (mes === 11) valor = 2200000000;
      else valor = 2600000000;
    } else if (ano === 2025) {
      if (mes <= 3) valor = 1800000000 + Math.random() * 200000000;
      else if (mes >= 9 && mes <= 10) valor = 2400000000 + Math.random() * 100000000;
      else valor = 1900000000 + Math.random() * 300000000;
    } else if (ano === 2026) {
      valor = 1500000000 + Math.random() * 200000000;
    } else if (ano === 2027) {
      valor = 1500000000 + Math.random() * 200000000;
    }

    mockCronogramaData.push({
      id: mockCronogramaData.length + 1,
      contrato_id: 1,
      mes,
      ano,
      valor_previsto: valor,
      valor_executado: valor * (0.7 + Math.random() * 0.3),
      percentual_execucao: 70 + Math.random() * 30
    });
  }
}

export async function GET() {
  try {
    // Em produção, fazer requisição para Laravel API
    // const response = await fetch(`${process.env.LARAVEL_API_URL}/api/contratos/cronograma`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`
    //   }
    // });
    // const data = await response.json();

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      data: mockCronogramaData,
      message: 'Dados do cronograma carregados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao carregar cronograma:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
