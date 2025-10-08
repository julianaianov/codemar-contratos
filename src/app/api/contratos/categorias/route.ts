import { NextResponse } from 'next/server';
import { ContratoPorCategoria } from '@/types/contratos';

// Simulação de dados - em produção, conectar com Laravel/MySQL
const mockCategoriasData: ContratoPorCategoria[] = [
  {
    categoria: 'Tecnologia da Informação',
    quantidade: 1250,
    valor_total: 3500000000.00,
    percentual: 30.8,
    cor: '#3B82F6'
  },
  {
    categoria: 'Serviços de Consultoria',
    quantidade: 890,
    valor_total: 2800000000.00,
    percentual: 24.6,
    cor: '#10B981'
  },
  {
    categoria: 'Obras e Construção',
    quantidade: 650,
    valor_total: 2200000000.00,
    percentual: 19.4,
    cor: '#F59E0B'
  },
  {
    categoria: 'Equipamentos',
    quantidade: 780,
    valor_total: 1800000000.00,
    percentual: 15.8,
    cor: '#EF4444'
  },
  {
    categoria: 'Serviços de Limpeza',
    quantidade: 400,
    valor_total: 1066407449.88,
    percentual: 9.4,
    cor: '#8B5CF6'
  }
];

export async function GET() {
  try {
    // Em produção, fazer requisição para Laravel API
    // const response = await fetch(`${process.env.LARAVEL_API_URL}/api/contratos/categorias`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`
    //   }
    // });
    // const data = await response.json();

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: mockCategoriasData,
      message: 'Dados das categorias carregados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
