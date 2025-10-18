import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração do Gemini AI
// A API aceita tanto GEMINI_API_KEY quanto GOOGLE_API_KEY
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyCeHSGln21RVy5nmT-hTFUlgZfXucwZ-r8';
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

// Inicializar Gemini AI
try {
  if (API_KEY && API_KEY !== '' && API_KEY !== 'your-api-key-here') {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Usar o modelo mais recente disponível
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    console.log('✅ Gemini AI inicializado com sucesso');
    console.log('🔑 Chave configurada:', API_KEY.substring(0, 10) + '...');
  } else {
    console.warn('⚠️ Chave da API do Gemini não configurada');
    console.log('💡 Configure GEMINI_API_KEY ou GOOGLE_API_KEY no arquivo .env.local');
  }
} catch (error) {
  console.error('❌ Erro ao inicializar Gemini AI:', error);
}

export interface SearchResult {
  query: string;
  answer: string;
  suggestions: string[];
  confidence: number;
  sources?: string[];
}

export interface ContractData {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  fornecedor: string;
  diretoria: string;
  status: string;
  tipo: string;
}

export class GeminiAIService {
  /**
   * Busca inteligente de contratos usando IA
   */
  static async searchContracts(query: string, contracts: ContractData[]): Promise<SearchResult> {
    // Se o modelo não estiver disponível, usar fallback
    if (!model) {
      console.log('🔄 Usando fallback - modelo Gemini não disponível');
      return this.fallbackSearch(query, contracts);
    }

    try {
      console.log('🤖 Enviando consulta para Gemini AI:', query);
      const contractsContext = this.formatContractsForAI(contracts);
      
      const prompt = `
Você é um assistente especializado em análise de contratos públicos da CODEMAR. 
Analise os dados de contratos fornecidos e responda à consulta do usuário de forma precisa e útil.

DADOS DOS CONTRATOS:
${contractsContext}

CONSULTA DO USUÁRIO: "${query}"

INSTRUÇÕES:
1. Analise os dados de contratos fornecidos
2. Responda à consulta de forma clara e precisa
3. Para perguntas sobre quantidade/número total de contratos, use o número exato de registros fornecidos
4. Forneça informações específicas quando possível (valores, datas, fornecedores)
5. Se não encontrar informações exatas, indique isso claramente
6. Sugira consultas relacionadas que podem ser úteis
7. Avalie sua confiança na resposta (0-100%)

FORMATO DA RESPOSTA (JSON):
{
  "answer": "Resposta detalhada à consulta",
  "suggestions": ["Sugestão 1", "Sugestão 2", "Sugestão 3"],
  "confidence": 85,
  "sources": ["ID do contrato relevante 1", "ID do contrato relevante 2"]
}

IMPORTANTE: Responda APENAS com o JSON válido, sem markdown, sem \`\`\`json, sem texto adicional. Apenas o objeto JSON puro.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📝 Resposta do Gemini:', text);
      
      // Limpar o texto da resposta (remover markdown se presente)
      let cleanText = text.trim();
      
      // Remover markdown code blocks se presente
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Tentar parsear o JSON da resposta
      try {
        const parsedResponse = JSON.parse(cleanText);
        console.log('✅ Resposta parseada com sucesso');
        return {
          query,
          answer: parsedResponse.answer || 'Não foi possível processar a consulta.',
          suggestions: parsedResponse.suggestions || [],
          confidence: parsedResponse.confidence || 0,
          sources: parsedResponse.sources || []
        };
      } catch (parseError) {
        console.log('⚠️ Erro ao parsear JSON, usando resposta em texto simples');
        console.log('Texto original:', text);
        console.log('Texto limpo:', cleanText);
        console.log('Erro de parse:', parseError.message);
        
        // Se não conseguir parsear JSON, retornar resposta em texto simples
        return {
          query,
          answer: cleanText || text,
          suggestions: [
            'Buscar contratos por valor',
            'Filtrar por diretoria',
            'Consultar fornecedores específicos'
          ],
          confidence: 70,
          sources: []
        };
      }
    } catch (error) {
      console.error('❌ Erro na busca com Gemini AI:', error);
      return this.fallbackSearch(query, contracts);
    }
  }

  /**
   * Fallback quando a API do Gemini não está disponível
   */
  private static fallbackSearch(query: string, contracts: ContractData[]): SearchResult {
    const queryLower = query.toLowerCase();
    
    // Se não há contratos, retornar mensagem informativa
    if (contracts.length === 0) {
      return {
        query,
        answer: 'Nenhum contrato encontrado no sistema. Verifique se há dados importados.',
        suggestions: [
          'Importar contratos',
          'Verificar conexão com banco de dados',
          'Contatar administrador'
        ],
        confidence: 100,
        sources: []
      };
    }
    
    // Análise simples baseada em palavras-chave
    
    // Contagem total de contratos
    if (queryLower.includes('numero') || queryLower.includes('quantidade') || queryLower.includes('quantos') || 
        (queryLower.includes('total') && (queryLower.includes('contrato') || queryLower.includes('contratos')))) {
      return {
        query,
        answer: `O sistema possui ${contracts.length} contratos cadastrados.`,
        suggestions: [
          'Ver contratos por valor',
          'Filtrar por diretoria',
          'Consultar fornecedores',
          'Analisar por tipo de contrato'
        ],
        confidence: 100,
        sources: []
      };
    }
    
    if (queryLower.includes('maior') || queryLower.includes('valor')) {
      const sortedContracts = contracts.sort((a, b) => b.valor - a.valor);
      const topContract = sortedContracts[0];
      
      return {
        query,
        answer: `O maior contrato por valor é "${topContract.nome}" com valor de R$ ${topContract.valor.toLocaleString('pt-BR')}, fornecido por ${topContract.fornecedor} para a diretoria ${topContract.diretoria}.`,
        suggestions: [
          'Ver todos os contratos por valor',
          'Filtrar por diretoria',
          'Consultar fornecedores'
        ],
        confidence: 90,
        sources: [topContract.id]
      };
    }
    
    if (queryLower.includes('fornecedor')) {
      const fornecedores = Array.from(new Set(contracts.map(c => c.fornecedor)));
      return {
        query,
        answer: `Encontrei ${fornecedores.length} fornecedores únicos nos contratos: ${fornecedores.slice(0, 5).join(', ')}${fornecedores.length > 5 ? ' e outros.' : '.'}`,
        suggestions: [
          'Ver contratos por fornecedor',
          'Analisar valores por fornecedor',
          'Consultar fornecedores específicos'
        ],
        confidence: 85,
        sources: []
      };
    }
    
    if (queryLower.includes('diretoria')) {
      const diretorias = Array.from(new Set(contracts.map(c => c.diretoria)));
      return {
        query,
        answer: `As diretorias com contratos são: ${diretorias.join(', ')}.`,
        suggestions: [
          'Ver contratos por diretoria',
          'Analisar gastos por diretoria',
          'Consultar diretoria específica'
        ],
        confidence: 85,
        sources: []
      };
    }
    
    if ((queryLower.includes('total') || queryLower.includes('soma')) && (queryLower.includes('valor') || queryLower.includes('financeiro'))) {
      const total = contracts.reduce((sum, c) => sum + c.valor, 0);
      return {
        query,
        answer: `O valor total dos contratos é R$ ${total.toLocaleString('pt-BR')}, distribuído em ${contracts.length} contratos.`,
        suggestions: [
          'Ver distribuição por diretoria',
          'Analisar por tipo de contrato',
          'Consultar contratos ativos'
        ],
        confidence: 90,
        sources: []
      };
    }
    
    // Resposta genérica
    return {
      query,
      answer: `Encontrei ${contracts.length} contratos disponíveis. Posso ajudá-lo a analisar valores, fornecedores, diretorias ou tipos de contrato. Que informação específica você gostaria de saber?`,
      suggestions: [
        'Quais são os maiores contratos por valor?',
        'Quais fornecedores têm mais contratos?',
        'Qual o valor total dos contratos?',
        'Quais diretorias têm mais gastos?'
      ],
      confidence: 70,
      sources: []
    };
  }

  /**
   * Análise de tendências nos contratos
   */
  static async analyzeTrends(contracts: ContractData[]): Promise<SearchResult> {
    const query = 'Analise as tendências e padrões nos contratos da CODEMAR';
    return this.searchContracts(query, contracts);
  }

  /**
   * Sugestões de consultas baseadas nos dados
   */
  static async generateQuerySuggestions(contracts: ContractData[]): Promise<string[]> {
    try {
      const contractsContext = this.formatContractsForAI(contracts.slice(0, 10)); // Usar apenas uma amostra
      
      const prompt = `
Com base nos dados de contratos fornecidos, sugira 5 consultas úteis que um usuário poderia fazer:

DADOS DOS CONTRATOS:
${contractsContext}

Sugira consultas que sejam:
- Específicas e acionáveis
- Úteis para análise de contratos
- Baseadas nos dados reais disponíveis
- Em português brasileiro

FORMATO: Retorne apenas uma lista JSON de strings:
["Consulta 1", "Consulta 2", "Consulta 3", "Consulta 4", "Consulta 5"]
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        return [
          'Quais são os maiores contratos por valor?',
          'Quais fornecedores têm mais contratos?',
          'Qual diretoria tem mais gastos?',
          'Quais contratos estão próximos do vencimento?',
          'Qual o valor total dos contratos ativos?'
        ];
      }
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      return [
        'Buscar contratos por valor',
        'Filtrar por diretoria',
        'Consultar fornecedores',
        'Analisar tendências',
        'Verificar vencimentos'
      ];
    }
  }

  /**
   * Formatar dados de contratos para o contexto da IA
   */
  private static formatContractsForAI(contracts: ContractData[]): string {
    return contracts.map(contract => `
ID: ${contract.id}
Nome: ${contract.nome}
Descrição: ${contract.descricao}
Valor: R$ ${contract.valor.toLocaleString('pt-BR')}
Período: ${contract.dataInicio} a ${contract.dataFim}
Fornecedor: ${contract.fornecedor}
Diretoria: ${contract.diretoria}
Status: ${contract.status}
Tipo: ${contract.tipo}
---`).join('\n');
  }

  /**
   * Busca semântica em minutas
   */
  static async searchMinutas(query: string, minutas: any[]): Promise<SearchResult> {
    // Se o modelo não estiver disponível, usar fallback
    if (!model) {
      return this.fallbackSearchMinutas(query, minutas);
    }

    try {
      const minutasContext = minutas.map(minuta => `
ID: ${minuta.id}
Nome: ${minuta.nome}
Descrição: ${minuta.descricao}
Tipo: ${minuta.tipo}
Data: ${minuta.dataUpload}
---`).join('\n');

      const prompt = `
Você é um assistente especializado em análise de minutas de contratos da CODEMAR.
Analise as minutas disponíveis e responda à consulta do usuário.

MINUTAS DISPONÍVEIS:
${minutasContext}

CONSULTA: "${query}"

Responda de forma útil sobre as minutas disponíveis, sugerindo qual seria mais adequada para a necessidade do usuário.

FORMATO (JSON):
{
  "answer": "Resposta sobre as minutas",
  "suggestions": ["Sugestão 1", "Sugestão 2"],
  "confidence": 80,
  "sources": ["ID da minuta recomendada"]
}

IMPORTANTE: Responda APENAS com o JSON válido, sem markdown, sem \`\`\`json, sem texto adicional. Apenas o objeto JSON puro.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Limpar o texto da resposta (remover markdown se presente)
      let cleanText = text.trim();
      
      // Remover markdown code blocks se presente
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      try {
        const parsedResponse = JSON.parse(cleanText);
        return {
          query,
          answer: parsedResponse.answer || 'Não foi possível analisar as minutas.',
          suggestions: parsedResponse.suggestions || [],
          confidence: parsedResponse.confidence || 0,
          sources: parsedResponse.sources || []
        };
      } catch (parseError) {
        console.log('⚠️ Erro ao parsear JSON de minutas, usando resposta em texto simples');
        return {
          query,
          answer: cleanText || text,
          suggestions: ['Verificar minutas por tipo', 'Consultar descrições detalhadas'],
          confidence: 70,
          sources: []
        };
      }
    } catch (error) {
      console.error('Erro na busca de minutas:', error);
      return this.fallbackSearchMinutas(query, minutas);
    }
  }

  /**
   * Fallback para busca de minutas
   */
  private static fallbackSearchMinutas(query: string, minutas: any[]): SearchResult {
    const queryLower = query.toLowerCase();
    
    // Se não há minutas, retornar mensagem informativa
    if (minutas.length === 0) {
      return {
        query,
        answer: 'Nenhuma minuta encontrada no sistema. Faça upload de minutas para poder fazer consultas.',
        suggestions: [
          'Fazer upload de minutas',
          'Verificar se há arquivos na pasta de minutas',
          'Contatar administrador do sistema'
        ],
        confidence: 100,
        sources: []
      };
    }
    
    if (queryLower.includes('cooperação') || queryLower.includes('cooperacao')) {
      const minutaCoop = minutas.find(m => 
        m.nome.toLowerCase().includes('cooperação') || 
        m.nome.toLowerCase().includes('cooperacao') ||
        m.descricao.toLowerCase().includes('cooperação') ||
        m.descricao.toLowerCase().includes('cooperacao')
      );
      
      if (minutaCoop) {
        return {
          query,
          answer: `Para acordo de cooperação, recomendo a minuta "${minutaCoop.nome}". ${minutaCoop.descricao}`,
          suggestions: [
            'Ver detalhes da minuta',
            'Consultar outras minutas',
            'Verificar tipos disponíveis'
          ],
          confidence: 95,
          sources: [minutaCoop.id]
        };
      }
    }
    
    if (queryLower.includes('fornecimento')) {
      const minutaFornec = minutas.find(m => 
        m.nome.toLowerCase().includes('fornecimento') ||
        m.descricao.toLowerCase().includes('fornecimento')
      );
      
      if (minutaFornec) {
        return {
          query,
          answer: `Para contratos de fornecimento, recomendo a minuta "${minutaFornec.nome}". ${minutaFornec.descricao}`,
          suggestions: [
            'Ver detalhes da minuta',
            'Consultar outras minutas',
            'Verificar tipos disponíveis'
          ],
          confidence: 95,
          sources: [minutaFornec.id]
        };
      }
    }
    
    // Resposta genérica
    return {
      query,
      answer: `Encontrei ${minutas.length} minutas disponíveis: ${minutas.map(m => m.nome).join(', ')}. Qual tipo de contrato você precisa? Posso ajudá-lo a encontrar a minuta mais adequada.`,
      suggestions: [
        'Ver todas as minutas',
        'Filtrar por tipo',
        'Consultar descrições detalhadas'
      ],
      confidence: 80,
      sources: minutas.map(m => m.id)
    };
  }
}

