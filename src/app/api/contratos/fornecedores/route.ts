import { NextResponse } from 'next/server';
import { Fornecedor } from '@/types/contratos';

// Simulação de dados - em produção, conectar com Laravel/MySQL
const mockFornecedores: Fornecedor[] = [
  {
    id: 1,
    cnpj: '17.288.605/0001-22',
    razao_social: 'EMPRESA EXEMPLO LTDA',
    nome_fantasia: 'Exemplo Corp',
    endereco: 'Rua das Flores, 123',
    telefone: '(11) 99999-9999',
    email: 'contato@exemplo.com',
    situacao: 'ativo'
  },
  {
    id: 2,
    cnpj: '043.878.251-89',
    razao_social: 'FORNECEDOR TESTE S/A',
    nome_fantasia: 'Teste Fornecedor',
    endereco: 'Av. Principal, 456',
    telefone: '(11) 88888-8888',
    email: 'teste@fornecedor.com',
    situacao: 'ativo'
  },
  {
    id: 3,
    cnpj: '14.583.052/0001-42',
    razao_social: 'SERVICOS GERAIS LTDA',
    nome_fantasia: 'Serviços Gerais',
    endereco: 'Rua Comercial, 789',
    telefone: '(11) 77777-7777',
    email: 'servicos@gerais.com',
    situacao: 'ativo'
  },
  {
    id: 4,
    cnpj: '045.388.741-40',
    razao_social: 'TECNOLOGIA AVANCADA S/A',
    nome_fantasia: 'Tech Advanced',
    endereco: 'Av. Tecnologia, 321',
    telefone: '(11) 66666-6666',
    email: 'tech@advanced.com',
    situacao: 'ativo'
  },
  {
    id: 5,
    cnpj: '006.527.301-08',
    razao_social: 'CONSULTORIA EMPRESARIAL LTDA',
    nome_fantasia: 'Consultoria Pro',
    endereco: 'Rua dos Negócios, 654',
    telefone: '(11) 55555-5555',
    email: 'consultoria@pro.com',
    situacao: 'ativo'
  },
  {
    id: 6,
    cnpj: '38.296.342/0001-73',
    razao_social: 'CONSTRUCOES E OBRAS S/A',
    nome_fantasia: 'Construções Obras',
    endereco: 'Av. das Obras, 987',
    telefone: '(11) 44444-4444',
    email: 'obras@construcoes.com',
    situacao: 'ativo'
  }
];

export async function GET() {
  try {
    // Em produção, fazer requisição para Laravel API
    // const response = await fetch(`${process.env.LARAVEL_API_URL}/api/contratos/fornecedores`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`
    //   }
    // });
    // const data = await response.json();

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: mockFornecedores,
      message: 'Fornecedores carregados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao carregar fornecedores:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
