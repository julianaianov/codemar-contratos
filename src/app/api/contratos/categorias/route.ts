import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase direto
const supabaseUrl = 'https://syhnkxbeftosviscvmmd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTM2NDcsImV4cCI6MjA3NTg4OTY0N30.ppUts-2J2FUqJOYz0VY1xwWXYG1CkylKIIJDGziYi4I';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const diretoria = searchParams.get('diretoria') || '';

    return await buscarCategorias(diretoria);
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
    const filters = await request.json();
    const diretoria = filters?.diretoria || '';

    return await buscarCategorias(diretoria);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

async function buscarCategorias(diretoria: string) {
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




