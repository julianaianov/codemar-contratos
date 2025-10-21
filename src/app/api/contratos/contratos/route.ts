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
    
    // Converter searchParams para objeto de filtros
    const filters: any = {};
    searchParams.forEach((value, key) => {
      filters[key] = value;
    });

    // Buscar contratos diretamente do Supabase
    let query = supabase.from('contratos_importados').select('*', { count: 'exact' });

    // Aplicar filtros
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.numero_contrato) {
      query = query.ilike('numero_contrato', `%${filters.numero_contrato}%`);
    }
    if (filters.contratado) {
      query = query.ilike('contratado', `%${filters.contratado}%`);
    }
    if (filters.diretoria && filters.diretoria.toLowerCase() !== 'todas') {
      query = query.or(`diretoria.eq.${filters.diretoria},secretaria.eq.${filters.diretoria}`);
    }

    // Paginação
    const page = parseInt(filters.page) || 1;
    const perPage = parseInt(filters.per_page) || 15;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    // Ordenação
    const orderBy = filters.order_by || 'created_at';
    const ascending = (filters.order_direction || 'desc') === 'asc';
    query = query.order(orderBy, { ascending });

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        data: data || [],
        count: count || 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count || 0) / perPage)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
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
    const body = await request.json();
    
    // Validação básica
    if (!body.numero_contrato || !body.objeto || !body.contratante || !body.contratado || !body.valor || !body.data_inicio || !body.data_fim || !body.status) {
      return NextResponse.json({
        success: false,
        message: 'Dados inválidos',
        errors: { message: 'Campos obrigatórios faltando' }
      }, { status: 400 });
    }

    if (new Date(body.data_fim) < new Date(body.data_inicio)) {
      return NextResponse.json({
        success: false,
        message: 'Data fim deve ser após data início',
        errors: { data_fim: 'Data fim deve ser após data início' }
      }, { status: 400 });
    }

    // Inserir contrato no Supabase
    const { data, error } = await supabase
      .from('contratos_importados')
      .insert({
        ...body,
        processado: true // Contratos manuais são considerados processados
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Contrato criado com sucesso!',
      data
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}