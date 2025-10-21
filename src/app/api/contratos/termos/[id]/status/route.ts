import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TermoStatus } from '@/types/contract-terms';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// PUT - Atualizar status de um termo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const termoId = params.id;
    const body = await request.json();
    const { status, observacoes } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o status é válido
    const statusValidos: TermoStatus[] = ['pendente', 'aprovado', 'rejeitado', 'em_analise', 'executado'];
    if (!statusValidos.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    // Buscar o termo para obter o contrato_id
    const { data: termo, error: termoError } = await supabase
      .from('termos_contratuais')
      .select('contrato_id')
      .eq('id', termoId)
      .single();

    if (termoError || !termo) {
      return NextResponse.json(
        { error: 'Termo não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar o status do termo
    const { data, error } = await supabase
      .from('termos_contratuais')
      .update({
        status,
        observacoes: observacoes || null,
        atualizado_por: 'sistema', // TODO: Pegar do usuário logado
        atualizado_em: new Date().toISOString()
      })
      .eq('id', termoId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status do termo:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar status do termo' },
        { status: 500 }
      );
    }

    // Se o status foi aprovado, atualizar métricas do contrato
    if (status === 'aprovado') {
      await atualizarMetricasContrato(supabase, termo.contrato_id);
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Erro na API de status do termo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para atualizar métricas do contrato
async function atualizarMetricasContrato(supabase: any, contratoId: string) {
  try {
    // Buscar todos os termos aprovados do contrato
    const { data: termos, error: termosError } = await supabase
      .from('termos_contratuais')
      .select('tipo, valor_aditivo, percentual_aditivo')
      .eq('contrato_id', contratoId)
      .eq('status', 'aprovado');

    if (termosError) {
      console.error('Erro ao buscar termos para métricas:', termosError);
      return;
    }

    // Calcular métricas
    const aditivos = termos.filter(t => t.tipo === 'aditivo');
    const apostilamentos = termos.filter(t => t.tipo === 'apostilamento');
    const rescisoes = termos.filter(t => t.tipo === 'rescisao');

    const valorAditivoTotal = aditivos.reduce((sum, t) => sum + (t.valor_aditivo || 0), 0);
    const percentualAditivoTotal = aditivos.reduce((sum, t) => sum + (t.percentual_aditivo || 0), 0);

    // Buscar valor original do contrato
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos_importados')
      .select('valor_contrato')
      .eq('id', contratoId)
      .single();

    if (contratoError || !contrato) {
      console.error('Erro ao buscar contrato para métricas:', contratoError);
      return;
    }

    const valorAtual = (contrato.valor_contrato || 0) + valorAditivoTotal;

    // Atualizar contrato com métricas
    const { error: updateError } = await supabase
      .from('contratos_importados')
      .update({
        valor_atual: valorAtual,
        percentual_aditivo_total: percentualAditivoTotal,
        valor_aditivo_total: valorAditivoTotal,
        quantidade_aditivos: aditivos.length,
        quantidade_apostilamentos: apostilamentos.length,
        quantidade_rescisoes: rescisoes.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', contratoId);

    if (updateError) {
      console.error('Erro ao atualizar métricas do contrato:', updateError);
    }

  } catch (error) {
    console.error('Erro ao atualizar métricas do contrato:', error);
  }
}
