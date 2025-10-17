#!/usr/bin/env node

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCeHSGln21RVy5nmT-hTFUlgZfXucwZ-r8';

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    console.log('📋 Listando modelos disponíveis...\n');
    
    const models = await genAI.listModels();
    
    console.log('✅ Modelos disponíveis:');
    models.forEach(model => {
      console.log(`- ${model.name}`);
      if (model.supportedGenerationMethods) {
        console.log(`  Métodos: ${model.supportedGenerationMethods.join(', ')}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

listModels();


