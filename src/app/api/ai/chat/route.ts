import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIService } from '@/services/gemini-ai';

// POST - Chat conversacional com contexto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, chatType = 'general', conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
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

    // Criar contexto da conversa
    const conversationContext = conversationHistory
      .slice(-5) // Últimas 5 mensagens para contexto
      .map((msg: any) => `${msg.type === 'user' ? 'Usuário' : 'IA'}: ${msg.content}`)
      .join('\n');

    switch (chatType) {
      case 'contracts':
        result = await GeminiAIService.searchContracts(
          `Contexto da conversa:\n${conversationContext}\n\nNova pergunta: ${message}`,
          mockContracts
        );
        break;
      case 'minutas':
        // Simular minutas
        const mockMinutas = [
          {
            id: '1',
            nome: 'Minuta de Acordo de Cooperação',
            descricao: 'Modelo para acordos de cooperação técnica entre órgãos públicos',
            tipo: 'DOCX',
            dataUpload: '2024-01-15T10:30:00.000Z'
          },
          {
            id: '2',
            nome: 'Minuta de Contrato de Fornecimento',
            descricao: 'Modelo para contratos de fornecimento de bens',
            tipo: 'DOCX',
            dataUpload: '2024-01-20T14:15:00.000Z'
          }
        ];
        result = await GeminiAIService.searchMinutas(
          `Contexto da conversa:\n${conversationContext}\n\nNova pergunta: ${message}`,
          mockMinutas
        );
        break;
      default:
        result = await GeminiAIService.searchContracts(
          `Contexto da conversa:\n${conversationContext}\n\nNova pergunta: ${message}`,
          mockContracts
        );
    }

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        conversationId: Date.now().toString(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro no chat:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        result: {
          query: '',
          answer: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
          suggestions: ['Tentar novamente', 'Verificar conexão'],
          confidence: 0,
          sources: []
        }
      },
      { status: 500 }
    );
  }
}
