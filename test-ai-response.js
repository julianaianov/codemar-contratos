#!/usr/bin/env node

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function testAIResponse() {
  console.log('🧪 Testando resposta da IA...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `
Você é um assistente especializado em análise de contratos públicos da CODEMAR. 
Analise os dados de contratos fornecidos e responda à consulta do usuário de forma precisa e útil.

DADOS DOS CONTRATOS:
ID: 1
Nome: Contrato de Fornecimento de Material de Escritório
Descrição: Fornecimento de material de escritório para todas as diretorias
Valor: R$ 150.000
Período: 2024-01-01 a 2024-12-31
Fornecedor: Papelaria Central Ltda
Diretoria: Administrativa
Status: Ativo
Tipo: Fornecimento
---

CONSULTA DO USUÁRIO: "Quais são os maiores contratos por valor?"

INSTRUÇÕES:
1. Analise os dados de contratos fornecidos
2. Responda à consulta de forma clara e precisa
3. Forneça informações específicas quando possível (valores, datas, fornecedores)
4. Se não encontrar informações exatas, indique isso claramente
5. Sugira consultas relacionadas que podem ser úteis
6. Avalie sua confiança na resposta (0-100%)

FORMATO DA RESPOSTA (JSON):
{
  "answer": "Resposta detalhada à consulta",
  "suggestions": ["Sugestão 1", "Sugestão 2", "Sugestão 3"],
  "confidence": 85,
  "sources": ["ID do contrato relevante 1", "ID do contrato relevante 2"]
}

IMPORTANTE: Responda APENAS com o JSON válido, sem markdown, sem \`\`\`json, sem texto adicional. Apenas o objeto JSON puro.
`;

    console.log('📤 Enviando prompt...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('📥 Resposta bruta:', text);
    console.log('\n🔧 Processando resposta...');
    
    // Limpar o texto da resposta (remover markdown se presente)
    let cleanText = text.trim();
    
    // Remover markdown code blocks se presente
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('📝 Texto limpo:', cleanText);
    
    // Tentar parsear o JSON da resposta
    try {
      const parsedResponse = JSON.parse(cleanText);
      console.log('\n✅ JSON parseado com sucesso!');
      console.log('📋 Resposta:', parsedResponse.answer);
      console.log('💡 Sugestões:', parsedResponse.suggestions);
      console.log('🎯 Confiança:', parsedResponse.confidence + '%');
      console.log('🔗 Fontes:', parsedResponse.sources);
    } catch (parseError) {
      console.log('\n❌ Erro ao parsear JSON:', parseError.message);
      console.log('📄 Usando texto limpo como resposta');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAIResponse();
