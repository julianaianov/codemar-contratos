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

    let result;

    switch (path) {
      case 'dashboard/metrics':
        result = await getDashboardMetrics();
        break;
      
      case 'receitas-chart':
        result = await getReceitasChart();
        break;
      
      case 'despesas-chart':
        result = await getDespesasChart();
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
async function getDashboardMetrics() {
  const query1 = `SELECT COALESCE(SUM(r.valor), 0) as total FROM transparencia.receitas r WHERE r.exercicio = 2024`;
  const query2 = `SELECT COALESCE(SUM(rm.valor), 0) as total FROM transparencia.receitas_movimentacoes rm`;
  const query3 = `SELECT COALESCE(SUM(e.valor), 0) as total FROM transparencia.empenhos e WHERE e.exercicio = 2024`;
  const query4 = `SELECT COALESCE(SUM(e.valor_pago), 0) as total FROM transparencia.empenhos e WHERE e.exercicio = 2024`;
  
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
async function getReceitasChart() {
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
async function getDespesasChart() {
  const query = `
    SELECT 
      EXTRACT(MONTH FROM e.data_emissao) as mes,
      SUM(e.valor) as total_empenhado,
      SUM(e.valor_liquidado) as total_liquidado,
      SUM(e.valor_pago) as total_pago
    FROM transparencia.empenhos e
    WHERE e.exercicio = 2024
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



