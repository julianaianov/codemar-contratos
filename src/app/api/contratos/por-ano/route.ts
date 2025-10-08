import { NextResponse } from 'next/server';
import { ContratoPorAno } from '@/types/contratos';

// Simulação de dados - em produção, conectar com Laravel/MySQL
const mockContratosPorAno: ContratoPorAno[] = [
  {
    ano: 2025,
    quantidade: 1200,
    valor_total: 3500000000.00,
    valor_pago: 2800000000.00
  },
  {
    ano: 2024,
    quantidade: 1500,
    valor_total: 4200000000.00,
    valor_pago: 3500000000.00
  },
  {
    ano: 2023,
    quantidade: 1100,
    valor_total: 2800000000.00,
    valor_pago: 2500000000.00
  },
  {
    ano: 2022,
    quantidade: 950,
    valor_total: 2200000000.00,
    valor_pago: 2000000000.00
  },
  {
    ano: 2021,
    quantidade: 800,
    valor_total: 1800000000.00,
    valor_pago: 1700000000.00
  },
  {
    ano: 2020,
    quantidade: 700,
    valor_total: 1500000000.00,
    valor_pago: 1400000000.00
  },
  {
    ano: 2019,
    quantidade: 600,
    valor_total: 1200000000.00,
    valor_pago: 1100000000.00
  },
  {
    ano: 2018,
    quantidade: 500,
    valor_total: 1000000000.00,
    valor_pago: 950000000.00
  },
  {
    ano: 2017,
    quantidade: 450,
    valor_total: 900000000.00,
    valor_pago: 850000000.00
  },
  {
    ano: 2016,
    quantidade: 400,
    valor_total: 800000000.00,
    valor_pago: 750000000.00
  },
  {
    ano: 2015,
    quantidade: 350,
    valor_total: 700000000.00,
    valor_pago: 650000000.00
  },
  {
    ano: 2014,
    quantidade: 300,
    valor_total: 600000000.00,
    valor_pago: 550000000.00
  },
  {
    ano: 2013,
    quantidade: 250,
    valor_total: 500000000.00,
    valor_pago: 450000000.00
  },
  {
    ano: 2012,
    quantidade: 200,
    valor_total: 400000000.00,
    valor_pago: 350000000.00
  },
  {
    ano: 2011,
    quantidade: 150,
    valor_total: 300000000.00,
    valor_pago: 250000000.00
  },
  {
    ano: 2010,
    quantidade: 100,
    valor_total: 200000000.00,
    valor_pago: 150000000.00
  },
  {
    ano: 2009,
    quantidade: 80,
    valor_total: 150000000.00,
    valor_pago: 100000000.00
  }
];

export async function GET() {
  try {
    // Em produção, fazer requisição para Laravel API
    // const response = await fetch(`${process.env.LARAVEL_API_URL}/api/contratos/por-ano`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`
    //   }
    // });
    // const data = await response.json();

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: mockContratosPorAno,
      message: 'Dados por ano carregados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao carregar dados por ano:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
