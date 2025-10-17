import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase direto
const supabaseUrl = 'https://syhnkxbeftosviscvmmd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTM2NDcsImV4cCI6MjA3NTg4OTY0N30.ppUts-2J2FUqJOYz0VY1xwWXYG1CkylKIIJDGziYi4I';
const supabase = createClient(supabaseUrl, supabaseKey);

// Retorna as diretorias individuais que estão dentro de "OUTROS"
export async function GET(request: NextRequest) {
  try {
    // Definir diretorias principais
    const diretoriasPrincipais = [
      'OPERAÇÕES',
      'MERCADO E PARCERIAS', 
      'OBRAS E PROJETOS',
      'COMUNICAÇÃO',
      'ADMINISTRAÇÃO',
      'ASSUNTOS IMOBILIÁRIOS',
      'PRESIDÊNCIA',
      'JURÍDICO',
      'TECNOLOGIA DA INFORMAÇÃO E INOVAÇÃO'
    ];

    // Buscar contratos do Supabase
    const { data, error } = await supabase
      .from('contratos_importados')
      .select('diretoria, secretaria, valor, valor_contrato');
    
    if (error) {
      throw error;
    }

    // Agrupar por diretoria
    const map = new Map<string, { diretoria: string; quantidade: number; valor_total: number }>();
    
    (data || []).forEach(contrato => {
      const dir = contrato.diretoria || contrato.secretaria || 'Não informada';
      const valor = contrato.valor || contrato.valor_contrato || 0;
      
      if (map.has(dir)) {
        const existing = map.get(dir)!;
        existing.quantidade += 1;
        existing.valor_total += valor;
      } else {
        map.set(dir, {
          diretoria: dir,
          quantidade: 1,
          valor_total: valor
        });
      }
    });

    // Marcar quais diretorias já foram usadas pelas principais
    const usedDiretorias = new Set();
    
    diretoriasPrincipais.forEach(diretoria => {
      // Buscar correspondência exata primeiro
      let data = Array.from(map.values()).find(item => 
        item.diretoria === diretoria && !usedDiretorias.has(item.diretoria)
      );
      
      // Se não encontrar, buscar correspondência parcial
      if (!data) {
        data = Array.from(map.values()).find(item => {
          if (usedDiretorias.has(item.diretoria)) return false;
          
          const itemDir = item.diretoria.toLowerCase();
          const targetDir = diretoria.toLowerCase();
          
          if (targetDir === 'tecnologia da informação e inovação') {
            return itemDir.includes('tecnologia da informação') || 
                   itemDir.includes('inovação e tecnologia');
          }
          if (targetDir === 'administração') {
            return itemDir === 'administração' || itemDir === 'adiministração';
          }
          
          return itemDir.includes(targetDir) || targetDir.includes(itemDir);
        });
      }
      
      if (data) {
        usedDiretorias.add(data.diretoria);
      }
    });

    // Retornar apenas as diretorias que NÃO estão nas principais (as que estão em "OUTROS")
    const diretoriasOutros = Array.from(map.values())
      .filter(item => !usedDiretorias.has(item.diretoria))
      .sort((a, b) => b.valor_total - a.valor_total);

    return NextResponse.json({ success: true, data: diretoriasOutros });
  } catch (error) {
    console.error('Erro ao buscar diretorias de OUTROS:', error);
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 });
  }
}


