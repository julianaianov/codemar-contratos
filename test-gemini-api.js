#!/usr/bin/env node

/**
 * Script para testar a API do Gemini
 * Execute: node test-gemini-api.js
 */

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuração
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function testGeminiAPI() {
  console.log('🧪 Testando API do Gemini...\n');
  
  try {
    // Inicializar Gemini AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    console.log('✅ Gemini AI inicializado com sucesso');
    console.log('🔑 Chave da API:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'Não configurada');
    
    // Teste simples
    const prompt = 'Responda apenas "API funcionando!" em português.';
    
    console.log('\n📤 Enviando prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('📥 Resposta recebida:', text);
    console.log('\n🎉 API do Gemini está funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    
    if (error.message.includes('API_KEY')) {
      console.log('\n💡 Solução:');
      console.log('1. Configure a variável GEMINI_API_KEY');
      console.log('2. Ou edite este script com sua chave');
      console.log('3. Obtenha uma chave em: https://makersuite.google.com/app/apikey');
    }
    
    if (error.message.includes('quota')) {
      console.log('\n💡 Solução:');
      console.log('1. Verifique se tem créditos na conta Google AI');
      console.log('2. Aguarde o reset da cota (geralmente diário)');
    }
  }
}

// Executar teste
testGeminiAPI();
