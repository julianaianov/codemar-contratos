import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ContratoPowerBI, getClassificacaoContrato } from '@/types/contract-terms';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Dados para Power BI
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const diretoria = searchParams.get('diretoria');
    const ano = searchParams.get('ano');
    const status = searchParams.get('status');

    // Construir query base
    let query = supabase
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
        data_inicio,
        data_fim,
        data_vigencia,
        data_execucao,
        contratado,
        diretoria,
        status,
        tipo_contrato,
        modalidade,
        categoria
      `);

    // Aplicar filtros
    if (diretoria) {
      query = query.eq('diretoria', diretoria);
    }

    if (ano) {
      query = query.eq('ano', parseInt(ano));
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('numero_contrato', { ascending: true });

    if (error) {
      console.error('Erro ao buscar dados para Power BI:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar dados para Power BI' },
        { status: 500 }
      );
    }

    // Transformar dados para formato Power BI com análise de conformidade
    const dadosPowerBI: ContratoPowerBI[] = (data || []).map(contrato => {
      const valorOriginal = contrato.valor_contrato || 0;
      const valorAtual = contrato.valor_atual || valorOriginal;
      const percentualAditivo = contrato.percentual_aditivo_total || 0;
      const valorAditivoTotal = contrato.valor_aditivo_total || 0;
      
      // Classificar contrato conforme Lei 14.133/2021
      const classificacao = getClassificacaoContrato(
        contrato.tipo_contrato || '', 
        contrato.objeto || ''
      );
      
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
      
      return {
        id: contrato.id.toString(),
        numero: contrato.numero_contrato || '',
        objeto: contrato.objeto || '',
        valor_original: valorOriginal,
        valor_atual: valorAtual,
        percentual_aditivo: percentualAditivo,
        valor_aditivo_total: valorAditivoTotal,
        quantidade_aditivos: contrato.quantidade_aditivos || 0,
        data_inicio: contrato.data_inicio || '',
        data_fim: contrato.data_fim || '',
        fornecedor: contrato.contratado || '',
        diretoria: contrato.diretoria || '',
        status: contrato.status || '',
        tipo: contrato.tipo_contrato || '',
        modalidade: contrato.modalidade || '',
        categoria: contrato.categoria || '',
        data_vigencia: contrato.data_vigencia || '',
        data_execucao: contrato.data_execucao || null,
        
        // Campos de análise de conformidade
        classificacao_contrato: classificacao.categoria,
        limite_legal: classificacao.limite,
        descricao_classificacao: classificacao.descricao,
        dentro_limite_legal: dentroLimite,
        percentual_restante: percentualRestante,
        valor_restante: valorRestante,
        status_conformidade: statusConformidade
      };
    });

    // Calcular estatísticas gerais
    const estatisticas = {
      total_contratos: dadosPowerBI.length,
      valor_total_original: dadosPowerBI.reduce((sum, c) => sum + c.valor_original, 0),
      valor_total_atual: dadosPowerBI.reduce((sum, c) => sum + c.valor_atual, 0),
      valor_total_aditivos: dadosPowerBI.reduce((sum, c) => sum + c.valor_aditivo_total, 0),
      percentual_medio_aditivo: dadosPowerBI.length > 0 
        ? dadosPowerBI.reduce((sum, c) => sum + c.percentual_aditivo, 0) / dadosPowerBI.length 
        : 0,
      contratos_com_aditivo: dadosPowerBI.filter(c => c.quantidade_aditivos > 0).length,
      contratos_sem_aditivo: dadosPowerBI.filter(c => c.quantidade_aditivos === 0).length,
      maior_aditivo: dadosPowerBI.length > 0 
        ? Math.max(...dadosPowerBI.map(c => c.percentual_aditivo)) 
        : 0,
      menor_aditivo: dadosPowerBI.length > 0 
        ? Math.min(...dadosPowerBI.map(c => c.percentual_aditivo)) 
        : 0,
      
      // Estatísticas de conformidade
      contratos_conformes: dadosPowerBI.filter(c => c.status_conformidade === 'CONFORME').length,
      contratos_atencao: dadosPowerBI.filter(c => c.status_conformidade === 'ATENCAO').length,
      contratos_inconformes: dadosPowerBI.filter(c => c.status_conformidade === 'INCONFORME').length,
      percentual_conformidade: dadosPowerBI.length > 0 
        ? (dadosPowerBI.filter(c => c.status_conformidade === 'CONFORME').length / dadosPowerBI.length) * 100 
        : 0,
      
      // Estatísticas por classificação
      contratos_reforma_equipamento: dadosPowerBI.filter(c => c.classificacao_contrato === 'REFORMA_EQUIPAMENTO').length,
      contratos_obras_servicos: dadosPowerBI.filter(c => c.classificacao_contrato === 'OBRAS_SERVICOS_COMPRAS').length,
      contratos_sociedade_mista: dadosPowerBI.filter(c => c.classificacao_contrato === 'SOCIEDADE_MISTA').length,
      
      // Valores por classificação
      valor_reforma_equipamento: dadosPowerBI
        .filter(c => c.classificacao_contrato === 'REFORMA_EQUIPAMENTO')
        .reduce((sum, c) => sum + c.valor_original, 0),
      valor_obras_servicos: dadosPowerBI
        .filter(c => c.classificacao_contrato === 'OBRAS_SERVICOS_COMPRAS')
        .reduce((sum, c) => sum + c.valor_original, 0),
      valor_sociedade_mista: dadosPowerBI
        .filter(c => c.classificacao_contrato === 'SOCIEDADE_MISTA')
        .reduce((sum, c) => sum + c.valor_original, 0)
    };

    return NextResponse.json({
      success: true,
      data: dadosPowerBI,
      estatisticas,
      filtros_aplicados: {
        diretoria,
        ano,
        status
      },
      total_registros: dadosPowerBI.length
    });

  } catch (error) {
    console.error('Erro na API Power BI:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
