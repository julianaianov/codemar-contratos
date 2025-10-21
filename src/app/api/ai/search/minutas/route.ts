import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { GeminiAIService } from '@/services/gemini-ai';

// Interface para o modelo de minuta
interface MinutaModel {
  id: string;
  nome: string;
  descricao: string;
  arquivo: string;
  tamanho: number;
  dataUpload: string;
  tipo: string;
}

// Diretório para armazenar as minutas
const MINUTAS_DIR = path.join(process.cwd(), 'public', 'minutas');
const METADATA_FILE = path.join(MINUTAS_DIR, 'metadata.json');

// Carregar metadados das minutas
async function loadMetadata(): Promise<MinutaModel[]> {
  try {
    const data = await fs.readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// GET - Busca inteligente em minutas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Parâmetro de consulta (q) é obrigatório' },
        { status: 400 }
      );
    }

    // Carregar minutas existentes
    const minutas = await loadMetadata();

    if (minutas.length === 0) {
      return NextResponse.json({
        success: true,
        result: {
          query,
          answer: 'Nenhuma minuta encontrada no sistema. Faça upload de algumas minutas para poder fazer buscas.',
          suggestions: [
            'Fazer upload de minutas',
            'Verificar se há arquivos na pasta de minutas',
            'Contatar administrador do sistema'
          ],
          confidence: 100,
          sources: []
        }
      });
    }

    // Buscar com Gemini AI
    const result = await GeminiAIService.searchMinutas(query, minutas);

    return NextResponse.json({
      success: true,
      result,
      totalMinutas: minutas.length
    });

  } catch (error) {
    console.error('Erro na busca de minutas:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        result: {
          query: '',
          answer: 'Erro ao processar busca nas minutas.',
          suggestions: ['Tentar novamente', 'Verificar conexão'],
          confidence: 0,
          sources: []
        }
      },
      { status: 500 }
    );
  }
}

// POST - Busca avançada em minutas com filtros
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Campo query é obrigatório' },
        { status: 400 }
      );
    }

    // Carregar minutas
    const allMinutas = await loadMetadata();
    
    // Aplicar filtros se fornecidos
    let filteredMinutas = allMinutas;
    
    if (filters) {
      if (filters.tipo) {
        filteredMinutas = filteredMinutas.filter(m => 
          m.tipo.toLowerCase().includes(filters.tipo.toLowerCase())
        );
      }
      
      if (filters.dataInicio) {
        filteredMinutas = filteredMinutas.filter(m => 
          new Date(m.dataUpload) >= new Date(filters.dataInicio)
        );
      }
      
      if (filters.dataFim) {
        filteredMinutas = filteredMinutas.filter(m => 
          new Date(m.dataUpload) <= new Date(filters.dataFim)
        );
      }
    }

    if (filteredMinutas.length === 0) {
      return NextResponse.json({
        success: true,
        result: {
          query,
          answer: 'Nenhuma minuta encontrada com os filtros aplicados.',
          suggestions: [
            'Ajustar filtros de busca',
            'Remover filtros para ver todas as minutas',
            'Verificar critérios de filtro'
          ],
          confidence: 100,
          sources: []
        },
        filters: filters || {},
        totalMinutas: allMinutas.length,
        filteredMinutas: 0
      });
    }

    // Buscar com Gemini AI nos minutas filtrados
    const result = await GeminiAIService.searchMinutas(query, filteredMinutas);

    return NextResponse.json({
      success: true,
      result,
      filters: filters || {},
      totalMinutas: allMinutas.length,
      filteredMinutas: filteredMinutas.length
    });

  } catch (error) {
    console.error('Erro na busca avançada de minutas:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}



