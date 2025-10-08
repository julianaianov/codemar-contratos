import { NextResponse } from 'next/server';
import { Contrato } from '@/types/contratos';

// Simulação de dados - em produção, conectar com Laravel/MySQL
const mockContratos: Contrato[] = [
  {
    id: 1,
    numero: '00001/2024',
    objeto: 'Fornecimento de equipamentos de informática',
    valor_total: 150000.00,
    valor_pago: 75000.00,
    valor_restante: 75000.00,
    data_inicio: '2024-01-01',
    data_fim: '2024-12-31',
    data_vencimento: '2024-12-31',
    situacao: 'ativo',
    fornecedor_id: 1,
    orgao_id: 25000,
    unidade_gestora_id: 170007,
    categoria_id: 1,
    modalidade: 'Pregão Eletrônico',
    processo_licitatorio: 'PE 001/2024',
    observacoes: 'Contrato para aquisição de equipamentos',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    numero: '00002/2024',
    objeto: 'Serviços de consultoria técnica',
    valor_total: 200000.00,
    valor_pago: 100000.00,
    valor_restante: 100000.00,
    data_inicio: '2024-02-01',
    data_fim: '2024-11-30',
    data_vencimento: '2024-11-30',
    situacao: 'ativo',
    fornecedor_id: 2,
    orgao_id: 25000,
    unidade_gestora_id: 170008,
    categoria_id: 2,
    modalidade: 'Tomada de Preços',
    processo_licitatorio: 'TP 002/2024',
    observacoes: 'Consultoria em gestão pública',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 3,
    numero: '00003/2024',
    objeto: 'Manutenção de sistemas',
    valor_total: 80000.00,
    valor_pago: 40000.00,
    valor_restante: 40000.00,
    data_inicio: '2024-03-01',
    data_fim: '2024-12-31',
    data_vencimento: '2024-12-31',
    situacao: 'ativo',
    fornecedor_id: 3,
    orgao_id: 25000,
    unidade_gestora_id: 170010,
    categoria_id: 3,
    modalidade: 'Dispensa de Licitação',
    processo_licitatorio: 'DL 003/2024',
    observacoes: 'Manutenção preventiva e corretiva',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  }
];

export async function GET() {
  try {
    // Em produção, fazer requisição para Laravel API
    // const response = await fetch(`${process.env.LARAVEL_API_URL}/api/contratos/contratos`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`
    //   }
    // });
    // const data = await response.json();

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: mockContratos,
      message: 'Contratos carregados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao carregar contratos:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
