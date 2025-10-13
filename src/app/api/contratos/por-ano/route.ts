import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase direto
const supabaseUrl = 'https://syhnkxbeftosviscvmmd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTM2NDcsImV4cCI6MjA3NTg4OTY0N30.ppUts-2J2FUqJOYz0VY1xwWXYG1CkylKIIJDGziYi4I';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros de filtro da URL
    const { searchParams } = new URL(request.url);
    const diretoria = searchParams.get('diretoria');
    
    // Construir query base
    let query = supabase
      .from('contratos_importados')
      .select('ano, valor, status, diretoria, secretaria')
      .not('ano', 'is', null);

    // Aplicar filtro de diretoria se fornecido
    if (diretoria) {
      if (diretoria === 'OUTROS') {
        // Para "OUTROS", buscar contratos que NÃO estão nas diretorias principais
        const diretoriasPrincipais = [
          'OPERAÇÕES', 'MERCADO E PARCERIAS', 'OBRAS E PROJETOS', 'COMUNICAÇÃO',
          'ADMINISTRAÇÃO', 'ASSUNTOS IMOBILIÁRIOS', 'PRESIDÊNCIA', 'JURÍDICO',
          'TECNOLOGIA DA INFORMAÇÃO E INOVAÇÃO'
        ];
        
        // Usar filtro NOT para excluir diretorias principais
        for (const dir of diretoriasPrincipais) {
          query = query.neq('diretoria', dir).neq('secretaria', dir);
        }
      } else {
        // Normalizar o filtro para maiúsculo para corresponder ao banco
        const diretoriaFiltro = diretoria.toUpperCase();
        // Usar correspondência parcial para lidar com prefixos como "DIRETORIA DE"
        query = query.or(`diretoria.ilike.%${diretoriaFiltro}%,secretaria.ilike.%${diretoriaFiltro}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Agrupar por ano e calcular totais
    const anosMap = new Map();
    
    (data || []).forEach(contrato => {
      const ano = contrato.ano || new Date().getFullYear();
      const valor = contrato.valor || 0;
      const status = contrato.status || 'indefinido';
      
      if (!anosMap.has(ano)) {
        anosMap.set(ano, {
          ano,
          total: 0,
          count: 0,
          vigentes: 0,
          encerrados: 0,
          suspensos: 0,
          rescindidos: 0
        });
      }
      
      const existing = anosMap.get(ano);
      existing.total += valor;
      existing.count += 1;
      
      if (status === 'vigente') existing.vigentes += 1;
      else if (status === 'encerrado') existing.encerrados += 1;
      else if (status === 'suspenso') existing.suspensos += 1;
      else if (status === 'rescindido') existing.rescindidos += 1;
    });

    const anos = Array.from(anosMap.values())
      .sort((a, b) => a.ano - b.ano);

    return NextResponse.json({
      success: true,
      data: anos
    });
  } catch (error) {
    console.error('Erro ao buscar dados por ano:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}




