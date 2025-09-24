import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuração da conexão com o banco PostgreSQL do e-cidade
const pool = new Pool({
  host: process.env.DB_PORTAL_HOST || 'localhost',
  port: parseInt(process.env.DB_PORTAL_PORT || '5432'),
  database: process.env.DB_PORTAL_DATABASE || 'ecidade',
  user: process.env.DB_PORTAL_USERNAME || 'postgres',
  password: process.env.DB_PORTAL_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const year = searchParams.get('year') || undefined;
    const type = searchParams.get('type') || undefined;
    const mode = searchParams.get('mode') || 'padrao';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');

    let result;

    switch (path) {
      case 'dashboard/metrics':
        result = await getDashboardMetrics(year);
        break;
      
      case 'receitas':
        result = await getReceitas(year, type, mode, page, perPage);
        break;
      
      case 'despesas':
        result = await getDespesas(year, type, mode, page, perPage);
        break;
      
      case 'contratos':
        result = await getContratos(year, mode, page, perPage);
        break;
      
      case 'empenhos':
        result = await getEmpenhos(year, page, perPage);
        break;
      
      case 'folha-pagamento':
        result = await getFolhaPagamento(year, page, perPage);
        break;
      
      case 'dados-financeiros':
        result = await getDadosFinanceiros(year);
        break;
      
      case 'receitas/chart':
        result = await getReceitasChart(year, type);
        break;
      
      case 'despesas/chart':
        result = await getDespesasChart(year, type);
        break;
      
      case 'execucao-orcamentaria':
        result = await getExecucaoOrcamentaria(year);
        break;
      
      case 'iptu':
        result = await getIPTU(year, page, perPage);
        break;
      
      case 'issqn':
        result = await getISSQN(year, page, perPage);
        break;
      
      case 'educacao/escolas':
        result = await getEscolas();
        break;
      
      case 'educacao/alunos':
        result = await getAlunos(year, page, perPage);
        break;
      
      case 'saude/unidades':
        result = await getUnidadesSaude();
        break;
      
      case 'saude/atendimentos':
        result = await getAtendimentos(year, page, perPage);
        break;
      
      case 'patrimonial/bens':
        result = await getBens(year, page, perPage);
        break;
      
      case 'patrimonial/licitacoes':
        result = await getLicitacoes(year, page, perPage);
        break;
      
      case 'recursos-humanos/servidores':
        result = await getServidores(year, page, perPage);
        break;
      
      case 'receitas-chart':
        result = await getReceitasChart(year);
        break;
      
      case 'despesas-chart':
        result = await getDespesasChart(year);
        break;
      
      default:
        return NextResponse.json({ error: 'Endpoint não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API do e-cidade:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função para obter métricas do dashboard
async function getDashboardMetrics(year?: string) {
  const currentYear = year || new Date().getFullYear().toString();
  
  const query = `
    SELECT 
      (SELECT COALESCE(SUM(r.valor), 0) FROM transparencia.receitas r
       WHERE r.exercicio = $1) as total_receitas_previstas,
      (SELECT COALESCE(SUM(rm.valor), 0) FROM transparencia.receitas_movimentacoes rm) as total_receitas_arrecadadas,
      (SELECT COALESCE(SUM(e.valor), 0) FROM transparencia.empenhos e
       WHERE e.exercicio = $1) as total_despesas_empenhadas,
      (SELECT COALESCE(SUM(e.valor_pago), 0) FROM transparencia.empenhos e
       WHERE e.exercicio = $1) as total_despesas_pagas
  `;
  
  const result = await pool.query(query, [currentYear]);
  return result.rows[0];
}

// Função para obter receitas (baseada na estrutura do nova-transparencia)
async function getReceitas(year?: string, type?: string, mode?: string, page: number = 1, perPage: number = 10) {
  const currentYear = year || new Date().getFullYear().toString();
  const currentType = type || '0';
  const offset = (page - 1) * perPage;

  const subQuery = `
    SELECT 
      planocontas.exercicio as exercicio,
      planocontas.estrutural as estrutural,
      planocontas.descricao as descricao,
      instituicoes.descricao as instituicao,
      recursos.descricao as recurso,
      previsaoinicial,
      COALESCE(SUM(valor), 0) as arrecadado,
      COALESCE(SUM(previsaoadicional), 0) as adicional
    FROM transparencia.planocontas
      LEFT JOIN transparencia.receitas 
        ON planoconta_id = planocontas.id 
        AND planocontas.exercicio = receitas.exercicio
      LEFT JOIN transparencia.instituicoes 
        ON instituicao_id = instituicoes.id
      LEFT JOIN transparencia.recursos 
        ON recurso_id = recursos.id
      LEFT JOIN transparencia.receitas_movimentacoes 
        ON receita_id = receitas.id
    WHERE planocontas.exercicio = $1
      AND (planocontas.estrutural LIKE '4%' OR planocontas.estrutural LIKE '9%')
    GROUP BY 
      planocontas.exercicio, 
      planocontas.estrutural, 
      planocontas.descricao, 
      instituicoes.descricao, 
      recursos.descricao, 
      previsaoinicial
    ORDER BY planocontas.estrutural
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(subQuery, [currentYear, perPage, offset]);
  
  // Contar total de registros
  const countQuery = `
    SELECT COUNT(*) as total
    FROM transparencia.planocontas
    WHERE exercicio = $1
      AND (estrutural LIKE '4%' OR estrutural LIKE '9%')
  `;
  
  const countResult = await pool.query(countQuery, [currentYear]);
  const total = parseInt(countResult.rows[0].total);

  return {
    data: result.rows,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage)
    }
  };
}

// Função para obter despesas
async function getDespesas(year?: string, type?: string, mode?: string, page: number = 1, perPage: number = 10) {
  const currentYear = year || new Date().getFullYear().toString();
  const offset = (page - 1) * perPage;

  const query = `
    SELECT 
      e.exercicio,
      e.numero_empenho,
      e.data_emissao,
      e.valor,
      e.valor_liquidado,
      e.valor_pago,
      d.descricao as dotacao,
      f.descricao as fonte,
      o.descricao as orgao
    FROM transparencia.empenhos e
    LEFT JOIN transparencia.dotacoes d ON e.dotacao_id = d.id
    LEFT JOIN transparencia.fontes f ON d.fonte_id = f.id
    LEFT JOIN transparencia.orgaos o ON e.orgao_id = o.id
    WHERE e.exercicio = $1
    ORDER BY e.data_emissao DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [currentYear, perPage, offset]);
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM transparencia.empenhos
    WHERE exercicio = $1
  `;
  
  const countResult = await pool.query(countQuery, [currentYear]);
  const total = parseInt(countResult.rows[0].total);

  return {
    data: result.rows,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage)
    }
  };
}

// Função para obter contratos
async function getContratos(year?: string, mode?: string, page: number = 1, perPage: number = 10) {
  const currentYear = year || new Date().getFullYear().toString();
  const offset = (page - 1) * perPage;

  const query = `
    SELECT 
      c.id,
      c.numero_contrato,
      c.data_contrato,
      c.valor_contrato,
      c.objeto,
      f.descricao as fornecedor,
      o.descricao as orgao
    FROM transparencia.contratos c
    LEFT JOIN transparencia.fornecedores f ON c.fornecedor_id = f.id
    LEFT JOIN transparencia.orgaos o ON c.orgao_id = o.id
    WHERE EXTRACT(YEAR FROM c.data_contrato) = $1
    ORDER BY c.data_contrato DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [currentYear, perPage, offset]);
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM transparencia.contratos
    WHERE EXTRACT(YEAR FROM data_contrato) = $1
  `;
  
  const countResult = await pool.query(countQuery, [currentYear]);
  const total = parseInt(countResult.rows[0].total);

  return {
    data: result.rows,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage)
    }
  };
}

// Função para obter empenhos
async function getEmpenhos(year?: string, page: number = 1, perPage: number = 10) {
  const currentYear = year || new Date().getFullYear().toString();
  const offset = (page - 1) * perPage;

  const query = `
    SELECT 
      e.id,
      e.numero_empenho,
      e.data_emissao,
      e.valor,
      e.valor_liquidado,
      e.valor_pago,
      d.descricao as dotacao,
      o.descricao as orgao
    FROM transparencia.empenhos e
    LEFT JOIN transparencia.dotacoes d ON e.dotacao_id = d.id
    LEFT JOIN transparencia.orgaos o ON e.orgao_id = o.id
    WHERE e.exercicio = $1
    ORDER BY e.data_emissao DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [currentYear, perPage, offset]);
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM transparencia.empenhos
    WHERE exercicio = $1
  `;
  
  const countResult = await pool.query(countQuery, [currentYear]);
  const total = parseInt(countResult.rows[0].total);

  return {
    data: result.rows,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage)
    }
  };
}

// Função para obter folha de pagamento
async function getFolhaPagamento(year?: string, page: number = 1, perPage: number = 10) {
  const currentYear = year || new Date().getFullYear().toString();
  const offset = (page - 1) * perPage;

  const query = `
    SELECT 
      fp.id,
      fp.mes,
      fp.ano,
      fp.valor_total,
      s.nome as servidor,
      s.matricula,
      o.descricao as orgao
    FROM transparencia.folha_pagamento fp
    LEFT JOIN transparencia.servidores s ON fp.servidor_id = s.id
    LEFT JOIN transparencia.orgaos o ON s.orgao_id = o.id
    WHERE fp.ano = $1
    ORDER BY fp.mes DESC, fp.valor_total DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [currentYear, perPage, offset]);
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM transparencia.folha_pagamento
    WHERE ano = $1
  `;
  
  const countResult = await pool.query(countQuery, [currentYear]);
  const total = parseInt(countResult.rows[0].total);

  return {
    data: result.rows,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage)
    }
  };
}

// Função para obter dados financeiros gerais
async function getDadosFinanceiros(year?: string) {
  const currentYear = year || new Date().getFullYear().toString();
  
  const query = `
    SELECT 
      (SELECT SUM(previsaoinicial) FROM transparencia.planocontas 
       WHERE exercicio = $1 AND (estrutural LIKE '4%' OR estrutural LIKE '9%')) as receitas_previstas,
      (SELECT SUM(valor) FROM transparencia.receitas 
       WHERE exercicio = $1) as receitas_arrecadadas,
      (SELECT SUM(valor) FROM transparencia.empenhos 
       WHERE exercicio = $1) as despesas_empenhadas,
      (SELECT SUM(valor_pago) FROM transparencia.empenhos 
       WHERE exercicio = $1) as despesas_pagas
  `;
  
  const result = await pool.query(query, [currentYear]);
  return result.rows[0];
}


// Função para obter execução orçamentária
async function getExecucaoOrcamentaria(year?: string) {
  const currentYear = year || new Date().getFullYear().toString();
  
  const query = `
    SELECT 
      EXTRACT(MONTH FROM e.data_emissao) as mes,
      SUM(e.valor) as empenhado,
      SUM(e.valor_pago) as pago
    FROM transparencia.empenhos e
    WHERE e.exercicio = $1
    GROUP BY EXTRACT(MONTH FROM e.data_emissao)
    ORDER BY mes
  `;
  
  const result = await pool.query(query, [currentYear]);
  return result.rows;
}

// Funções para outros módulos (IPTU, ISSQN, Educação, Saúde, etc.)
async function getIPTU(year?: string, page: number = 1, perPage: number = 10) {
  // Implementar consulta para IPTU
  return { data: [], pagination: { page, perPage, total: 0, totalPages: 0 } };
}

async function getISSQN(year?: string, page: number = 1, perPage: number = 10) {
  // Implementar consulta para ISSQN
  return { data: [], pagination: { page, perPage, total: 0, totalPages: 0 } };
}

async function getEscolas() {
  // Implementar consulta para escolas
  return [];
}

async function getAlunos(year?: string, page: number = 1, perPage: number = 10) {
  // Implementar consulta para alunos
  return { data: [], pagination: { page, perPage, total: 0, totalPages: 0 } };
}

async function getUnidadesSaude() {
  // Implementar consulta para unidades de saúde
  return [];
}

async function getAtendimentos(year?: string, page: number = 1, perPage: number = 10) {
  // Implementar consulta para atendimentos
  return { data: [], pagination: { page, perPage, total: 0, totalPages: 0 } };
}

async function getBens(year?: string, page: number = 1, perPage: number = 10) {
  // Implementar consulta para bens patrimoniais
  return { data: [], pagination: { page, perPage, total: 0, totalPages: 0 } };
}

async function getLicitacoes(year?: string, page: number = 1, perPage: number = 10) {
  // Implementar consulta para licitações
  return { data: [], pagination: { page, perPage, total: 0, totalPages: 0 } };
}

async function getServidores(year?: string, page: number = 1, perPage: number = 10) {
  // Implementar consulta para servidores
  return { data: [], pagination: { page, perPage, total: 0, totalPages: 0 } };
}

// Função para obter gráfico de receitas por mês
async function getReceitasChart(year?: string) {
  const currentYear = year || new Date().getFullYear().toString();
  
  const query = `
    SELECT 
      EXTRACT(MONTH FROM rm.data) as mes,
      SUM(rm.valor) as total_arrecadado
    FROM transparencia.receitas_movimentacoes rm
    GROUP BY EXTRACT(MONTH FROM rm.data)
    ORDER BY mes
  `;
  
  const result = await pool.query(query);
  
  // Criar array com 12 meses
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const chartData = months.map(month => {
    const data = result.rows.find(row => row.mes === month);
    return {
      mes: month,
      total_arrecadado: data ? parseFloat(data.total_arrecadado) : 0
    };
  });
  
  return chartData;
}

// Função para obter gráfico de despesas por mês
async function getDespesasChart(year?: string) {
  const currentYear = year || new Date().getFullYear().toString();
  
  const query = `
    SELECT 
      EXTRACT(MONTH FROM e.data_emissao) as mes,
      SUM(e.valor) as total_empenhado,
      SUM(e.valor_liquidado) as total_liquidado,
      SUM(e.valor_pago) as total_pago
    FROM transparencia.empenhos e
    WHERE e.exercicio = $1
    GROUP BY EXTRACT(MONTH FROM e.data_emissao)
    ORDER BY mes
  `;
  
  const result = await pool.query(query, [currentYear]);
  
  // Criar array com 12 meses
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const chartData = months.map(month => {
    const data = result.rows.find(row => row.mes === month);
    return {
      mes: month,
      total_empenhado: data ? parseFloat(data.total_empenhado) : 0,
      total_liquidado: data ? parseFloat(data.total_liquidado) : 0,
      total_pago: data ? parseFloat(data.total_pago) : 0
    };
  });
  
  return chartData;
}
