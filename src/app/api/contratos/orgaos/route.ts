import { NextResponse } from 'next/server';
import { Orgao } from '@/types/contratos';

// Simulação de dados - em produção, conectar com Laravel/MySQL
const mockOrgaos: Orgao[] = [
  {
    id: 25000,
    codigo: '25000',
    nome: 'MINISTERIO DA FAZENDA',
    sigla: 'MF',
    situacao: 'ativo'
  },
  {
    id: 24208,
    codigo: '24208',
    nome: 'INSTITUTO NAC.DE TECNOLOGIA DA INFORMACAO-ITI',
    sigla: 'ITI',
    situacao: 'ativo'
  },
  {
    id: 24209,
    codigo: '24209',
    nome: 'CENTRO NAC DE TECN ELETRONICA AVANCADA S/A',
    sigla: 'CTE',
    situacao: 'ativo'
  },
  {
    id: 25201,
    codigo: '25201',
    nome: 'BANCO CENTRAL DO BRASIL-ORC.FISCAL/SEG.SOCIAL',
    sigla: 'BACEN',
    situacao: 'ativo'
  },
  {
    id: 25203,
    codigo: '25203',
    nome: 'COMISSÃO DE VALORES MOBILIARIOS',
    sigla: 'CVM',
    situacao: 'ativo'
  },
  {
    id: 25205,
    codigo: '25205',
    nome: 'FUND.INST.BRASILEIRO DE GEOG.E ESTATISTICA',
    sigla: 'IBGE',
    situacao: 'ativo'
  }
];

export async function GET() {
  try {
    // Em produção, fazer requisição para Laravel API
    // const response = await fetch(`${process.env.LARAVEL_API_URL}/api/contratos/orgaos`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`
    //   }
    // });
    // const data = await response.json();

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: mockOrgaos,
      message: 'Órgãos carregados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao carregar órgãos:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
