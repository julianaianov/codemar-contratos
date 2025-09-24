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
    const year = searchParams.get('year') || '2024';

    let result;

    switch (path) {
      case 'dashboard/metrics':
        result = await getDashboardMetrics(year);
        break;
      
      case 'receitas-chart':
        result = await getReceitasChart(year);
        break;
      
      case 'despesas-chart':
        result = await getDespesasChart(year);
        break;
      
      case 'institutions':
        result = await getInstitutions();
        break;
      
      case 'despesas':
        result = await getDespesas(year, searchParams.get('instituicao'));
        break;
      
      case 'receitas':
        result = await getReceitas(year, searchParams.get('instituicao'));
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
async function getDashboardMetrics(year: string) {
  const query1 = `SELECT COALESCE(SUM(r.valor), 0) as total FROM transparencia.receitas r WHERE r.exercicio = ${year}`;
  const query2 = `SELECT COALESCE(SUM(rm.valor), 0) as total FROM transparencia.receitas_movimentacoes rm`;
  const query3 = `SELECT COALESCE(SUM(e.valor), 0) as total FROM transparencia.empenhos e WHERE e.exercicio = ${year}`;
  const query4 = `SELECT COALESCE(SUM(e.valor_pago), 0) as total FROM transparencia.empenhos e WHERE e.exercicio = ${year}`;
  
  const [result1, result2, result3, result4] = await Promise.all([
    pool.query(query1),
    pool.query(query2),
    pool.query(query3),
    pool.query(query4)
  ]);
  
  return {
    total_receitas_previstas: result1.rows[0].total,
    total_receitas_arrecadadas: result2.rows[0].total,
    total_despesas_empenhadas: result3.rows[0].total,
    total_despesas_pagas: result4.rows[0].total
  };
}

// Função para obter gráfico de receitas por mês
async function getReceitasChart(year: string) {
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
async function getDespesasChart(year: string) {
  const query = `
    SELECT 
      EXTRACT(MONTH FROM e.data_emissao) as mes,
      SUM(e.valor) as total_empenhado,
      SUM(e.valor_liquidado) as total_liquidado,
      SUM(e.valor_pago) as total_pago
    FROM transparencia.empenhos e
    WHERE e.exercicio = ${year}
    GROUP BY EXTRACT(MONTH FROM e.data_emissao)
    ORDER BY mes
  `;
  
  const result = await pool.query(query);
  
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

// Função para obter instituições
async function getInstitutions() {
  const query = `SELECT id, descricao FROM transparencia.instituicoes ORDER BY descricao`;
  const result = await pool.query(query);
  return result.rows;
}

// Função para obter despesas com filtros
async function getDespesas(year: string, instituicao?: string | null) {
  let query = `
    SELECT 
      e.id,
      e.numero_empenho,
      e.descricao,
      e.valor,
      e.valor_liquidado,
      e.valor_pago,
      e.data_emissao,
      i.descricao as instituicao_nome
    FROM transparencia.empenhos e
    LEFT JOIN transparencia.instituicoes i ON e.orgao_id = i.id
    WHERE e.exercicio = ${year}
  `;
  
  if (instituicao) {
    query += ` AND e.orgao_id = ${instituicao}`;
  }
  
  query += ` ORDER BY e.data_emissao DESC`;
  
  const result = await pool.query(query);
  return result.rows;
}

// Função para obter receitas com filtros
async function getReceitas(year: string, instituicao?: string | null) {
  let query = `
    SELECT 
      r.id,
      r.descricao,
      r.valor,
      r.data,
      i.descricao as instituicao_nome
    FROM transparencia.receitas r
    LEFT JOIN transparencia.instituicoes i ON r.instituicao_id = i.id
    WHERE r.exercicio = ${year}
  `;
  
  if (instituicao) {
    query += ` AND r.instituicao_id = ${instituicao}`;
  }
  
  query += ` ORDER BY r.data DESC`;
  
  const result = await pool.query(query);
  return result.rows;
}
