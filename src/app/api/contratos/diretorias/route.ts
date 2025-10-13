import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase direto
const supabaseUrl = 'https://syhnkxbeftosviscvmmd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTM2NDcsImV4cCI6MjA3NTg4OTY0N30.ppUts-2J2FUqJOYz0VY1xwWXYG1CkylKIIJDGziYi4I';
const supabase = createClient(supabaseUrl, supabaseKey);

// Retorna agregação de valores por diretoria
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const diretoria = searchParams.get('diretoria') || '';

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

    // Se foi filtrado por uma diretoria específica, retornar apenas essa diretoria
    if (diretoria && diretoria.toLowerCase() !== 'todas') {
      // Se for "OUTROS", calcular os contratos que não estão nas diretorias principais
      if (diretoria === 'OUTROS') {
        // Usar a mesma lógica de correspondência para calcular OUTROS
        const usedDiretoriasOutros = new Set();
        
        diretoriasPrincipais.forEach(diretoria => {
          // Buscar correspondência exata primeiro
          let data = Array.from(map.values()).find(item => 
            item.diretoria === diretoria && !usedDiretoriasOutros.has(item.diretoria)
          );
          
          // Se não encontrar, buscar correspondência parcial
          if (!data) {
            data = Array.from(map.values()).find(item => {
              if (usedDiretoriasOutros.has(item.diretoria)) return false;
              
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
            usedDiretoriasOutros.add(data.diretoria);
          }
        });
        
        const outrosQuantidade = Array.from(map.values()).reduce((sum, item) => {
          return usedDiretoriasOutros.has(item.diretoria) ? sum : sum + item.quantidade;
        }, 0);
        
        const outrosValor = Array.from(map.values()).reduce((sum, item) => {
          return usedDiretoriasOutros.has(item.diretoria) ? sum : sum + item.valor_total;
        }, 0);
        
        if (outrosQuantidade > 0) {
          return NextResponse.json({ 
            success: true, 
            data: [{ 
              diretoria: 'OUTROS', 
              quantidade: outrosQuantidade, 
              valor_total: outrosValor 
            }] 
          });
        } else {
          return NextResponse.json({ success: true, data: [] });
        }
      }
      
      // Buscar por correspondência direta ou parcial para outras diretorias
      const matchingData = Array.from(map.values()).find(item => 
        item.diretoria === diretoria ||
        item.diretoria.toLowerCase() === diretoria.toLowerCase() ||
        item.diretoria.toLowerCase().includes(diretoria.toLowerCase()) ||
        diretoria.toLowerCase().includes(item.diretoria.toLowerCase())
      );
      
      if (matchingData) {
        return NextResponse.json({ success: true, data: [matchingData] });
      }
      return NextResponse.json({ success: true, data: [] });
    }

    // Retornar apenas as diretorias principais (as que estão no filtro)

    // Primeiro, marcar quais diretorias já foram usadas
    const usedDiretorias = new Set();
    
    const diretoriasData = diretoriasPrincipais
      .map(diretoria => {
        // Buscar correspondência exata primeiro
        let data = Array.from(map.values()).find(item => 
          item.diretoria === diretoria && !usedDiretorias.has(item.diretoria)
        );
        
        // Se não encontrar, buscar correspondência parcial mais específica
        if (!data) {
          data = Array.from(map.values()).find(item => {
            if (usedDiretorias.has(item.diretoria)) return false;
            
            const itemDir = item.diretoria.toLowerCase();
            const targetDir = diretoria.toLowerCase();
            
            // Correspondências específicas baseadas no debug
            if (targetDir === 'tecnologia da informação e inovação') {
              return itemDir.includes('tecnologia da informação') || 
                     itemDir.includes('inovação e tecnologia');
            }
            if (targetDir === 'administração') {
              return itemDir === 'administração' || itemDir === 'adiministração';
            }
            
            // Correspondência geral
            return itemDir.includes(targetDir) || targetDir.includes(itemDir);
          });
        }
        
        // Marcar como usada se encontrou
        if (data) {
          usedDiretorias.add(data.diretoria);
        }
        
        return data || { diretoria, quantidade: 0, valor_total: 0 };
      })
      .filter(item => item.quantidade > 0); // Apenas diretorias com contratos

    // Calcular total das diretorias principais
    const totalPrincipais = diretoriasData.reduce((sum, item) => sum + item.valor_total, 0);
    const totalGeral = Array.from(map.values()).reduce((sum, item) => sum + item.valor_total, 0);
    
    // Calcular "OUTROS" de forma consistente (usando o Set de diretorias já usadas)
    const outrosQuantidade = Array.from(map.values()).reduce((sum, item) => {
      return usedDiretorias.has(item.diretoria) ? sum : sum + item.quantidade;
    }, 0);
    
    const outrosValor = Array.from(map.values()).reduce((sum, item) => {
      return usedDiretorias.has(item.diretoria) ? sum : sum + item.valor_total;
    }, 0);
    
    // Se há contratos "OUTROS", adicionar categoria
    if (outrosQuantidade > 0) {
      diretoriasData.push({
        diretoria: 'OUTROS',
        quantidade: outrosQuantidade,
        valor_total: outrosValor
      });
    }

    // Ordenar por valor total
    diretoriasData.sort((a, b) => b.valor_total - a.valor_total);

    return NextResponse.json({ success: true, data: diretoriasData });
  } catch (error) {
    console.error('Erro ao agregar valores por diretoria:', error);
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 });
  }
}