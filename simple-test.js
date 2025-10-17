#!/usr/bin/env node

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyCeHSGln21RVy5nmT-hTFUlgZfXucwZ-r8';

async function simpleTest() {
  console.log('🧪 Teste simples da API...\n');
  console.log('🔑 Chave:', API_KEY.substring(0, 20) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log('✅ Cliente criado');
    
    // Tentar diferentes modelos
    const models = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    
    for (const modelName of models) {
      try {
        console.log(`\n🔄 Testando modelo: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`✅ Modelo ${modelName} criado`);
        
        const result = await model.generateContent('Olá');
        const response = await result.response;
        const text = response.text();
        
        console.log(`🎉 ${modelName} funcionando! Resposta: ${text.substring(0, 50)}...`);
        break;
        
      } catch (modelError) {
        console.log(`❌ ${modelName} falhou: ${modelError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    
    if (error.message.includes('API_KEY')) {
      console.log('\n💡 A chave da API pode estar inválida');
      console.log('1. Verifique se a chave está correta');
      console.log('2. Obtenha uma nova chave em: https://makersuite.google.com/app/apikey');
    }
  }
}

simpleTest();

