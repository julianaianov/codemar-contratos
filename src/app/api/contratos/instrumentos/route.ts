import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { InstrumentoContratual, CriarInstrumentoRequest, InstrumentoTipo, TermoStatus } from '@/types/contract-terms';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Listar instrumentos de um contrato
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contratoId = searchParams.get('contrato_id');

    if (!contratoId) {
      return NextResponse.json(
        { error: 'ID do contrato é obrigatório' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('instrumentos_contratuais')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('data_inicio', { ascending: false });

    if (error) {
      console.error('Erro ao buscar instrumentos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar instrumentos contratuais' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Erro na API de instrumentos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo instrumento
export async function POST(request: NextRequest) {
  try {
    const body: CriarInstrumentoRequest = await request.json();
    
    // Validações
    if (!body.contrato_id || !body.tipo || !body.descricao || !body.data_inicio || !body.data_fim) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: contrato_id, tipo, descricao, data_inicio, data_fim' },
        { status: 400 }
      );
    }

    // Verificar se o contrato existe
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos_importados')
      .select('numero_contrato')
      .eq('id', body.contrato_id)
      .single();

    if (contratoError || !contrato) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { status: 404 }
      );
    }

    // Gerar número do instrumento
    const { data: ultimoInstrumento } = await supabase
      .from('instrumentos_contratuais')
      .select('numero')
      .eq('contrato_id', body.contrato_id)
      .eq('tipo', body.tipo)
      .order('numero', { ascending: false })
      .limit(1)
      .single();

    const proximoNumero = ultimoInstrumento ? parseInt(ultimoInstrumento.numero.split('/')[0]) + 1 : 1;
    const numeroInstrumento = `${proximoNumero.toString().padStart(3, '0')}/${new Date().getFullYear()}`;

    // Criar instrumento
    const novoInstrumento: Omit<InstrumentoContratual, 'id'> = {
      contrato_id: body.contrato_id,
      tipo: body.tipo,
      numero: numeroInstrumento,
      data_inicio: body.data_inicio,
      data_fim: body.data_fim,
      valor: body.valor,
      descricao: body.descricao,
      status: 'pendente',
      observacoes: body.observacoes,
      criado_por: 'sistema', // TODO: Pegar do usuário logado
      criado_em: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('instrumentos_contratuais')
      .insert([novoInstrumento])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar instrumento:', error);
      return NextResponse.json(
        { error: 'Erro ao criar instrumento contratual' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Erro na API de instrumentos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
