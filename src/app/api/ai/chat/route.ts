import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIService } from '@/services/gemini-ai';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Cliente Supabase
const supabaseUrl = 'https://syhnkxbeftosviscvmmd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTM2NDcsImV4cCI6MjA3NTg4OTY0N30.ppUts-2J2FUqJOYz0VY1xwWXYG1CkylKIIJDGziYi4I';
const supabase = createClient(supabaseUrl, supabaseKey);

// Diretório para minutas
const MINUTAS_DIR = path.join(process.cwd(), 'public', 'minutas');
const METADATA_FILE = path.join(MINUTAS_DIR, 'metadata.json');

// Função para buscar contratos reais do Supabase
async function getRealContracts(limit: number = 500) {
  try {
    const { data, error } = await supabase
      .from('contratos_importados')
      .select('*')
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar contratos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro na função getRealContracts:', error);
    return [];
  }
}

// Função para buscar minutas reais
async function getRealMinutas() {
  try {
    const data = await fs.readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar minutas:', error);
    return [];
  }
}

// POST - Chat conversacional com contexto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, chatType = 'general', conversationHistory = [] } = body;

    console.log('💬 Nova mensagem recebida:', { message, chatType, historyLength: conversationHistory.length });

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar dados reais do sistema
    console.log('🔍 Buscando dados reais do sistema...');
    const realContracts = await getRealContracts(500); // Buscar até 500 contratos
    const realMinutas = await getRealMinutas();
    
    console.log(`📊 Encontrados ${realContracts.length} contratos e ${realMinutas.length} minutas`);
    
    // Converter contratos reais para o formato esperado pela IA
    const contractsForAI = realContracts.map(contract => ({
      id: contract.id?.toString() || '',
      nome: contract.objeto || contract.numero_contrato || 'Contrato sem nome',
      descricao: contract.objeto || 'Sem descrição',
      valor: contract.valor_contrato || 0,
      dataInicio: contract.data_inicio || contract.data_contrato || '',
      dataFim: contract.data_fim || contract.data_vencimento || '',
      fornecedor: contract.contratado || contract.fornecedor || 'Fornecedor não informado',
      diretoria: contract.diretoria || contract.secretaria || 'Diretoria não informada',
      status: contract.status || 'Status não informado',
      tipo: contract.tipo_contrato || 'Tipo não informado'
    }));

    let result;

    // Criar contexto da conversa
    const conversationContext = conversationHistory
      .slice(-5) // Últimas 5 mensagens para contexto
      .map((msg: any) => `${msg.type === 'user' ? 'Usuário' : 'IA'}: ${msg.content}`)
      .join('\n');

    switch (chatType) {
      case 'contracts':
        console.log('🔍 Buscando em contratos reais...');
        result = await GeminiAIService.searchContracts(
          `Contexto da conversa:\n${conversationContext}\n\nNova pergunta: ${message}`,
          contractsForAI
        );
        break;
      case 'minutas':
        console.log('📄 Buscando em minutas reais...');
        result = await GeminiAIService.searchMinutas(
          `Contexto da conversa:\n${conversationContext}\n\nNova pergunta: ${message}`,
          realMinutas
        );
        break;
      default:
        console.log('🌐 Buscando geral (contratos reais)...');
        result = await GeminiAIService.searchContracts(
          `Contexto da conversa:\n${conversationContext}\n\nNova pergunta: ${message}`,
          contractsForAI
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
    console.error('❌ Erro no chat:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        result: {
          query: 'Erro no processamento',
          answer: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
          suggestions: ['Tentar novamente', 'Verificar conexão', 'Contatar suporte'],
          confidence: 0,
          sources: []
        }
      },
      { status: 500 }
    );
  }
}

