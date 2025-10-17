import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIService } from '@/services/gemini-ai';

// GET - Busca inteligente com Gemini AI
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'contracts';

    if (!query) {
      return NextResponse.json(
        { error: 'Parâmetro de consulta (q) é obrigatório' },
        { status: 400 }
      );
    }

    // Simular dados de contratos (em produção, viria do banco de dados)
    const mockContracts = [
      {
        id: '1',
        nome: 'Contrato de Fornecimento de Material de Escritório',
        descricao: 'Fornecimento de material de escritório para todas as diretorias',
        valor: 150000,
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        fornecedor: 'Papelaria Central Ltda',
        diretoria: 'Administrativa',
        status: 'Ativo',
        tipo: 'Fornecimento'
      },
      {
        id: '2',
        nome: 'Contrato de Serviços de Limpeza',
        descricao: 'Serviços de limpeza e conservação predial',
        valor: 250000,
        dataInicio: '2024-02-01',
        dataFim: '2024-12-31',
        fornecedor: 'Limpeza Total S.A.',
        diretoria: 'Administrativa',
        status: 'Ativo',
        tipo: 'Serviços'
      },
      {
        id: '3',
        nome: 'Contrato de Desenvolvimento de Software',
        descricao: 'Desenvolvimento de sistema de gestão de contratos',
        valor: 500000,
        dataInicio: '2024-03-01',
        dataFim: '2025-02-28',
        fornecedor: 'Tech Solutions Ltda',
        diretoria: 'Tecnologia',
        status: 'Ativo',
        tipo: 'Desenvolvimento'
      },
      {
        id: '4',
        nome: 'Contrato de Consultoria Jurídica',
        descricao: 'Consultoria jurídica especializada em contratos públicos',
        valor: 180000,
        dataInicio: '2024-01-15',
        dataFim: '2024-12-31',
        fornecedor: 'Advocacia & Associados',
        diretoria: 'Jurídica',
        status: 'Ativo',
        tipo: 'Consultoria'
      },
      {
        id: '5',
        nome: 'Contrato de Manutenção de Equipamentos',
        descricao: 'Manutenção preventiva e corretiva de equipamentos de informática',
        valor: 120000,
        dataInicio: '2024-04-01',
        dataFim: '2024-12-31',
        fornecedor: 'Manutenção Tech Ltda',
        diretoria: 'Tecnologia',
        status: 'Ativo',
        tipo: 'Manutenção'
      }
    ];

    let result;

    switch (type) {
      case 'contracts':
        result = await GeminiAIService.searchContracts(query, mockContracts);
        break;
      case 'trends':
        result = await GeminiAIService.analyzeTrends(mockContracts);
        break;
      case 'suggestions':
        const suggestions = await GeminiAIService.generateQuerySuggestions(mockContracts);
        return NextResponse.json({
          success: true,
          suggestions
        });
      default:
        result = await GeminiAIService.searchContracts(query, mockContracts);
    }

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Erro na busca com IA:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        result: {
          query: '',
          answer: 'Desculpe, ocorreu um erro ao processar sua consulta.',
          suggestions: ['Tentar novamente', 'Verificar conexão'],
          confidence: 0,
          sources: []
        }
      },
      { status: 500 }
    );
  }
}

// POST - Busca avançada com parâmetros customizados
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, type, filters } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Campo query é obrigatório' },
        { status: 400 }
      );
    }

    // Aqui você pode implementar filtros mais avançados
    // Por enquanto, vamos usar a busca básica
    const result = await GeminiAIService.searchContracts(query, []);

    return NextResponse.json({
      success: true,
      result,
      filters: filters || {}
    });

  } catch (error) {
    console.error('Erro na busca avançada:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

