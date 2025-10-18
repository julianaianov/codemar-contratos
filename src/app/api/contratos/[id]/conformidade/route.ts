import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Função para classificar contrato conforme Lei 14.133/2021
function getClassificacaoContrato(tipoContrato: string, objetoContrato?: string): {
  categoria: string;
  limite: number;
  descricao: string;
} {
  const tipoLower = tipoContrato.toLowerCase();
  const objetoLower = (objetoContrato || '').toLowerCase();
  
  // Reforma de edifício ou equipamento (50%)
  if (tipoLower.includes('reforma') || tipoLower.includes('equipamento') || 
      tipoLower.includes('edifício') || tipoLower.includes('instalação') || 
      tipoLower.includes('manutenção') || objetoLower.includes('reforma') || 
      objetoLower.includes('equipamento') || objetoLower.includes('edifício') || 
      objetoLower.includes('instalação') || objetoLower.includes('manutenção')) {
    return {
      categoria: 'REFORMA_EQUIPAMENTO',
      limite: 50,
      descricao: 'Reforma de Edifício ou Equipamento'
    };
  }
  
  // Obra, serviço ou compra (25%)
  if (tipoLower.includes('obra') || tipoLower.includes('construção') || 
      tipoLower.includes('serviço') || tipoLower.includes('compra') || 
      tipoLower.includes('fornecimento') || objetoLower.includes('obra') || 
      objetoLower.includes('construção') || objetoLower.includes('serviço') || 
      objetoLower.includes('compra') || objetoLower.includes('fornecimento')) {
    return {
      categoria: 'OBRAS_SERVICOS_COMPRAS',
      limite: 25,
      descricao: 'Obras, Serviços ou Compras'
    };
  }
  
  // Sociedade mista (25%)
  if (tipoLower.includes('sociedade') || tipoLower.includes('mista')) {
    return {
      categoria: 'SOCIEDADE_MISTA',
      limite: 25,
      descricao: 'Sociedade Mista'
    };
  }
  
  // Default (25%)
  return {
    categoria: 'DEFAULT',
    limite: 25,
    descricao: 'Demais Contratos'
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Análise de conformidade de um contrato específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contratoId = params.id;

    // Buscar dados do contrato
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos_importados')
      .select(`
        id,
        numero_contrato,
        objeto,
        valor_contrato,
        valor_atual,
        percentual_aditivo_total,
        valor_aditivo_total,
        quantidade_aditivos,
        tipo_contrato,
        modalidade,
        categoria,
        diretoria,
        status,
        data_inicio,
        data_fim,
        data_vigencia,
        data_execucao
      `)
      .eq('id', contratoId)
      .single();

    if (contratoError || !contrato) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { status: 404 }
      );
    }

    // Buscar termos aprovados do contrato
    const { data: termos, error: termosError } = await supabase
      .from('termos_contratuais')
      .select('*')
      .eq('contrato_id', contratoId)
      .eq('status', 'aprovado')
      .order('data_criacao', { ascending: false });

    if (termosError) {
      console.error('Erro ao buscar termos:', termosError);
    }

    // Classificar contrato conforme Lei 14.133/2021
    const classificacao = getClassificacaoContrato(
      contrato.tipo_contrato || '', 
      contrato.objeto || ''
    );

    const valorOriginal = contrato.valor_contrato || 0;
    const percentualAditivo = contrato.percentual_aditivo_total || 0;
    const valorAditivoTotal = contrato.valor_aditivo_total || 0;

    // Calcular conformidade
    const dentroLimite = percentualAditivo <= classificacao.limite;
    const percentualRestante = Math.max(0, classificacao.limite - percentualAditivo);
    const valorRestante = (valorOriginal * percentualRestante) / 100;

    // Determinar status de conformidade
    let statusConformidade: 'CONFORME' | 'ATENCAO' | 'INCONFORME';
    if (percentualAditivo > classificacao.limite) {
      statusConformidade = 'INCONFORME';
    } else if (percentualAditivo > classificacao.limite * 0.8) {
      statusConformidade = 'ATENCAO';
    } else {
      statusConformidade = 'CONFORME';
    }

    // Análise detalhada dos termos
    const analiseTermos = (termos || []).map(termo => ({
      id: termo.id,
      tipo: termo.tipo,
      numero: termo.numero,
      data_criacao: termo.data_criacao,
      valor_aditivo: termo.valor_aditivo || 0,
      percentual_aditivo: termo.percentual_aditivo || 0,
      descricao: termo.descricao,
      justificativa: termo.justificativa,
      status: termo.status
    }));

    // Recomendações
    const recomendacoes = [];
    
    if (statusConformidade === 'INCONFORME') {
      recomendacoes.push({
        tipo: 'CRITICO',
        titulo: 'Contrato Inconforme',
        descricao: `O contrato ultrapassou o limite legal de ${classificacao.limite}% para ${classificacao.descricao}.`,
        acao: 'Revisar termos aprovados e considerar rescisão ou renegociação.'
      });
    } else if (statusConformidade === 'ATENCAO') {
      recomendacoes.push({
        tipo: 'ATENCAO',
        titulo: 'Próximo do Limite',
        descricao: `O contrato está próximo do limite legal de ${classificacao.limite}%.`,
        acao: 'Monitorar novos aditivos e evitar ultrapassar o limite.'
      });
    }

    if (percentualRestante < 5 && percentualRestante > 0) {
      recomendacoes.push({
        tipo: 'INFO',
        titulo: 'Limite Restante Baixo',
        descricao: `Restam apenas ${percentualRestante.toFixed(1)}% para novos aditivos.`,
        acao: 'Planejar cuidadosamente novos aditivos.'
      });
    }

    // Histórico de conformidade
    const historicoConformidade = (termos || []).map(termo => {
      const percentualAcumulado = termo.percentual_aditivo || 0;
      const statusHistorico = percentualAcumulado > classificacao.limite ? 'INCONFORME' : 
                             percentualAcumulado > classificacao.limite * 0.8 ? 'ATENCAO' : 'CONFORME';
      
      return {
        data: termo.data_criacao,
        termo: termo.numero,
        tipo: termo.tipo,
        percentual_acumulado: percentualAcumulado,
        status: statusHistorico
      };
    });

    const resultado = {
      contrato: {
        id: contrato.id,
        numero: contrato.numero_contrato,
        objeto: contrato.objeto,
        valor_original: valorOriginal,
        valor_atual: contrato.valor_atual || valorOriginal,
        tipo: contrato.tipo_contrato,
        modalidade: contrato.modalidade,
        categoria: contrato.categoria,
        diretoria: contrato.diretoria,
        status: contrato.status
      },
      
      classificacao: {
        categoria: classificacao.categoria,
        limite_legal: classificacao.limite,
        descricao: classificacao.descricao,
        base_legal: 'Lei 14.133/2021'
      },
      
      conformidade: {
        percentual_aditivo: percentualAditivo,
        valor_aditivo_total: valorAditivoTotal,
        dentro_limite_legal: dentroLimite,
        percentual_restante: percentualRestante,
        valor_restante: valorRestante,
        status: statusConformidade,
        margem_seguranca: classificacao.limite * 0.8
      },
      
      termos: {
        total: (termos || []).length,
        analise: analiseTermos
      },
      
      recomendacoes,
      historico_conformidade: historicoConformidade,
      
      estatisticas: {
        quantidade_aditivos: contrato.quantidade_aditivos || 0,
        quantidade_apostilamentos: (termos || []).filter(t => t.tipo === 'apostilamento').length,
        quantidade_rescisoes: (termos || []).filter(t => t.tipo === 'rescisao').length,
        ultimo_termo: termos && termos.length > 0 ? termos[0].data_criacao : null
      }
    };

    return NextResponse.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('Erro na análise de conformidade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
