#!/usr/bin/env node

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Cliente Supabase
const supabaseUrl = 'https://syhnkxbeftosviscvmmd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Diretório para minutas
const MINUTAS_DIR = path.join(process.cwd(), 'public', 'minutas');
const METADATA_FILE = path.join(MINUTAS_DIR, 'metadata.json');

async function testRealData() {
  console.log('🧪 Testando busca de dados reais...\n');
  
  try {
    // Testar busca de contratos
    console.log('📊 Buscando contratos do Supabase...');
    const { data: contracts, error: contractsError } = await supabase
      .from('contratos_importados')
      .select('*')
      .limit(5)
      .order('created_at', { ascending: false });

    if (contractsError) {
      console.error('❌ Erro ao buscar contratos:', contractsError.message);
    } else {
      console.log(`✅ Encontrados ${contracts.length} contratos`);
      if (contracts.length > 0) {
        console.log('📋 Primeiro contrato:');
        console.log(`   ID: ${contracts[0].id}`);
        console.log(`   Número: ${contracts[0].numero_contrato}`);
        console.log(`   Objeto: ${contracts[0].objeto}`);
        console.log(`   Valor: R$ ${contracts[0].valor_contrato?.toLocaleString('pt-BR') || 'N/A'}`);
        console.log(`   Contratado: ${contracts[0].contratado}`);
        console.log(`   Diretoria: ${contracts[0].diretoria}`);
      }
    }

    // Testar busca de minutas
    console.log('\n📄 Buscando minutas...');
    try {
      const data = await fs.readFile(METADATA_FILE, 'utf-8');
      const minutas = JSON.parse(data);
      console.log(`✅ Encontradas ${minutas.length} minutas`);
      if (minutas.length > 0) {
        console.log('📋 Primeira minuta:');
        console.log(`   ID: ${minutas[0].id}`);
        console.log(`   Nome: ${minutas[0].nome}`);
        console.log(`   Descrição: ${minutas[0].descricao}`);
        console.log(`   Tipo: ${minutas[0].tipo}`);
      }
    } catch (minutasError) {
      console.log('⚠️ Nenhuma minuta encontrada ou erro ao carregar:', minutasError.message);
    }

    // Testar conversão de dados
    console.log('\n🔄 Testando conversão de dados para IA...');
    if (contracts && contracts.length > 0) {
      const contractsForAI = contracts.map(contract => ({
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

      console.log('✅ Dados convertidos para IA:');
      console.log(`   Total: ${contractsForAI.length} contratos`);
      if (contractsForAI.length > 0) {
        console.log('📋 Primeiro contrato convertido:');
        console.log(`   ID: ${contractsForAI[0].id}`);
        console.log(`   Nome: ${contractsForAI[0].nome}`);
        console.log(`   Valor: R$ ${contractsForAI[0].valor.toLocaleString('pt-BR')}`);
        console.log(`   Fornecedor: ${contractsForAI[0].fornecedor}`);
        console.log(`   Diretoria: ${contractsForAI[0].diretoria}`);
      }
    }

    console.log('\n🎉 Teste de dados reais concluído!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testRealData();

