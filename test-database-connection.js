// Script para testar conexão com banco PostgreSQL
const { Pool } = require('pg');

// Configuração baseada nas variáveis de ambiente
const pool = new Pool({
  host: process.env.DB_PORTAL_HOST || 'localhost',
  port: parseInt(process.env.DB_PORTAL_PORT || '5432'),
  database: process.env.DB_PORTAL_DATABASE || 'ecidade',
  user: process.env.DB_PORTAL_USERNAME || 'postgres',
  password: process.env.DB_PORTAL_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    console.log('📊 Configuração:');
    console.log(`   Host: ${process.env.DB_PORTAL_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORTAL_PORT || '5432'}`);
    console.log(`   Database: ${process.env.DB_PORTAL_DATABASE || 'ecidade'}`);
    console.log(`   User: ${process.env.DB_PORTAL_USERNAME || 'postgres'}`);
    console.log(`   SSL: ${process.env.NODE_ENV === 'production' ? 'Sim' : 'Não'}`);
    console.log('');

    // Testar conexão básica
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se o schema transparencia existe
    const schemaResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'transparencia'
    `);
    
    if (schemaResult.rows.length === 0) {
      console.log('❌ Schema "transparencia" não encontrado!');
      return;
    }
    console.log('✅ Schema "transparencia" encontrado!');
    
    // Verificar tabelas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'transparencia'
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Verificar dados por exercício
    const yearsResult = await client.query(`
      SELECT DISTINCT exercicio 
      FROM transparencia.receitas 
      ORDER BY exercicio DESC 
      LIMIT 5
    `);
    
    console.log('📅 Exercícios com dados:');
    yearsResult.rows.forEach(row => {
      console.log(`   - ${row.exercicio}`);
    });
    
    // Verificar dados para 2025
    const data2025 = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM transparencia.receitas WHERE exercicio = 2025) as receitas_2025,
        (SELECT COUNT(*) FROM transparencia.empenhos WHERE exercicio = 2025) as empenhos_2025,
        (SELECT COUNT(*) FROM transparencia.receitas_movimentacoes WHERE exercicio = 2025) as movimentacoes_2025
    `);
    
    console.log('📊 Dados para 2025:');
    console.log(`   Receitas: ${data2025.rows[0].receitas_2025}`);
    console.log(`   Empenhos: ${data2025.rows[0].empenhos_2025}`);
    console.log(`   Movimentações: ${data2025.rows[0].movimentacoes_2025}`);
    
    if (data2025.rows[0].receitas_2025 === '0' && data2025.rows[0].empenhos_2025 === '0') {
      console.log('⚠️  ATENÇÃO: Não há dados para 2025!');
      console.log('💡 Solução: Use dados de 2024 ou insira dados para 2025');
    }
    
    client.release();
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('🔧 Verifique:');
    console.error('   1. Variáveis de ambiente configuradas');
    console.error('   2. Banco acessível publicamente');
    console.error('   3. Credenciais corretas');
    console.error('   4. Firewall configurado');
  } finally {
    await pool.end();
  }
}

// Executar teste
testConnection();



