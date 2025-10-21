import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TermoContratual, CriarTermoRequest, TermoTipo, TermoStatus } from '@/types/contract-terms';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// GET - Listar termos de um contrato
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const contratoId = searchParams.get('contrato_id');

    if (!contratoId) {
      return NextResponse.json(
        { error: 'ID do contrato é obrigatório' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('termos_contratuais')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('data_criacao', { ascending: false });

    if (error) {
      console.error('Erro ao buscar termos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar termos contratuais' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Erro na API de termos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo termo
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body: CriarTermoRequest = await request.json();
    
    // Validações
    if (!body.contrato_id || !body.tipo || !body.descricao || !body.justificativa) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: contrato_id, tipo, descricao, justificativa' },
        { status: 400 }
      );
    }

    // Buscar dados do contrato para validações
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos_importados')
      .select('valor_contrato, tipo_contrato, numero_contrato')
      .eq('id', body.contrato_id)
      .single();

    if (contratoError || !contrato) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { status: 404 }
      );
    }

    // Gerar número do termo
    const { data: ultimoTermo } = await supabase
      .from('termos_contratuais')
      .select('numero')
      .eq('contrato_id', body.contrato_id)
      .eq('tipo', body.tipo)
      .order('numero', { ascending: false })
      .limit(1)
      .single();

    const proximoNumero = ultimoTermo ? parseInt(ultimoTermo.numero.split('/')[0]) + 1 : 1;
    const numeroTermo = `${proximoNumero.toString().padStart(3, '0')}/${new Date().getFullYear()}`;

    // Calcular percentual de aditivo se for aditivo
    let percentualAditivo = 0;
    if (body.tipo === 'aditivo' && body.valor_aditivo && contrato.valor_contrato) {
      percentualAditivo = (body.valor_aditivo / contrato.valor_contrato) * 100;
    }

    // Criar termo
    const novoTermo: Omit<TermoContratual, 'id'> = {
      contrato_id: body.contrato_id,
      tipo: body.tipo,
      numero: numeroTermo,
      data_criacao: new Date().toISOString(),
      data_vigencia: body.data_vigencia,
      data_execucao: body.data_execucao,
      valor_original: contrato.valor_contrato || 0,
      valor_aditivo: body.valor_aditivo,
      percentual_aditivo: percentualAditivo,
      descricao: body.descricao,
      justificativa: body.justificativa,
      status: 'pendente',
      empenho_id: body.empenho_id,
      observacoes: body.observacoes,
      criado_por: 'sistema', // TODO: Pegar do usuário logado
      criado_em: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('termos_contratuais')
      .insert([novoTermo])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar termo:', error);
      return NextResponse.json(
        { error: 'Erro ao criar termo contratual' },
        { status: 500 }
      );
    }

    // Atualizar métricas do contrato
    await atualizarMetricasContrato(supabase, body.contrato_id);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Erro na API de termos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para atualizar métricas do contrato
async function atualizarMetricasContrato(supabase: any, contratoId: string) {
  try {
    // Buscar todos os termos do contrato
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
