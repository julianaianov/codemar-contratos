import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const diretoria = searchParams.get('diretoria') || '';

    return await buscarCategorias(supabase, diretoria);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const filters = await request.json();
    const diretoria = filters?.diretoria || '';

    return await buscarCategorias(supabase, diretoria);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

async function buscarCategorias(supabase: any, diretoria: string) {
  // Buscar categorias dos contratos no Supabase (usando modalidade como categoria)
  let query = supabase
    .from('contratos_importados')
    .select('modalidade, valor, diretoria, secretaria')
    .not('modalidade', 'is', null);

  // Aplicar filtro de diretoria se fornecido
  if (diretoria && diretoria.toLowerCase() !== 'todas') {
    query = query.or(`diretoria.eq.${diretoria},secretaria.eq.${diretoria}`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Agrupar por categoria e calcular totais
  const categoriasMap = new Map();
  
  (data || []).forEach(contrato => {
    const categoria = contrato.modalidade || 'Sem categoria';
    const valor = contrato.valor || 0;
    
    if (categoriasMap.has(categoria)) {
      const existing = categoriasMap.get(categoria);
      categoriasMap.set(categoria, {
        categoria,
        total: existing.total + valor,
        count: existing.count + 1
      });
    } else {
      categoriasMap.set(categoria, {
        categoria,
        total: valor,
        count: 1
      });
    }
  });

  const categorias = Array.from(categoriasMap.values())
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({
    success: true,
    data: categorias
  });
}




