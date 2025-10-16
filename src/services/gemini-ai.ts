import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração do Gemini AI
const API_KEY = 'AIzaSyCeHSGln21RVy5nmT-hTFUlgZfXucwZ-r8';
const genAI = new GoogleGenerativeAI(API_KEY);

// Modelo Gemini Pro
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
    try {
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

Responda APENAS com o JSON, sem texto adicional.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Tentar parsear o JSON da resposta
      try {
        const parsedResponse = JSON.parse(text);
        return {
          query,
          answer: parsedResponse.answer || 'Não foi possível processar a consulta.',
          suggestions: parsedResponse.suggestions || [],
          confidence: parsedResponse.confidence || 0,
          sources: parsedResponse.sources || []
        };
      } catch (parseError) {
        // Se não conseguir parsear JSON, retornar resposta em texto simples
        return {
          query,
          answer: text,
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
      console.error('Erro na busca com Gemini AI:', error);
      return {
        query,
        answer: 'Desculpe, ocorreu um erro ao processar sua consulta. Tente novamente.',
        suggestions: [
          'Verificar conexão com a internet',
          'Tentar uma consulta mais simples',
          'Contatar o suporte técnico'
        ],
        confidence: 0,
        sources: []
      };
    }
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
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsedResponse = JSON.parse(text);
        return {
          query,
          answer: parsedResponse.answer || 'Não foi possível analisar as minutas.',
          suggestions: parsedResponse.suggestions || [],
          confidence: parsedResponse.confidence || 0,
          sources: parsedResponse.sources || []
        };
      } catch {
        return {
          query,
          answer: text,
          suggestions: ['Verificar minutas por tipo', 'Consultar descrições detalhadas'],
          confidence: 70,
          sources: []
        };
      }
    } catch (error) {
      console.error('Erro na busca de minutas:', error);
      return {
        query,
        answer: 'Erro ao processar consulta sobre minutas.',
        suggestions: ['Tentar novamente', 'Verificar conexão'],
        confidence: 0,
        sources: []
      };
    }
  }
}
