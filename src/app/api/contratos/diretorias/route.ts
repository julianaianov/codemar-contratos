import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';

// Retorna agregação de valores por diretoria
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const diretoria = searchParams.get('diretoria') || '';

    // Buscar até 1000 contratos (ajuste se necessário para mais)
    const url = new URL(`${API_URL}/api/contratos`);
    if (diretoria && diretoria.toLowerCase() !== 'todas') {
      url.searchParams.append('diretoria', diretoria);
    }
    url.searchParams.append('per_page', '1000');

    const response = await fetch(url.toString());
    const json = await response.json();

    // Extrair lista independente do formato (paginado ou não)
    const lista: any[] = json?.data?.data || json?.data || json || [];

    // Normaliza label para evitar duplicidades por acento/caixa/pontuação
    const normalize = (s: string) => (s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[\.;,:/\\_\-]+/g, ' ') // unifica separadores
      .replace(/\s+/g, ' ') // colapsa espaços
      .trim()
      .toUpperCase();

    // Canonicalização para um conjunto fixo de diretorias (evita duplicidades)
    const canonicalList = [
      'PRESIDÊNCIA',
      'DIRETORIA DE ADMINISTRAÇÃO',
      'DIRETORIA JURÍDICA',
      'DIRETORIA DE ASSUNTOS IMOBILIÁRIOS',
      'DIRETORIA DE OPERAÇÕES',
      'DIRETORIA DE TECNOLOGIA DA INFORMAÇÃO E INOVAÇÃO',
      'DIRETORIA DE GOVERNANÇA EM LICITAÇÕES E CONTRATAÇÕES',
      'OUTRAS DIRETORIAS'
    ];

    const canonicalize = (raw: string): string => {
      const n = normalize(raw);
      if (n.includes('PRESID')) return 'PRESIDÊNCIA';
      if (n.includes('ADMIN')) return 'ADMINISTRAÇÃO';
      if (n.includes('JURID')) return 'JURÍDICA';
      if (n.includes('IMOBILI')) return 'ASSUNTOS IMOBILIÁRIOS';
      if (n.includes('OPERAC') || n.includes('OBRAS') || n.includes('SERVICO')) return 'OPERAÇÕES';
      if (n.includes('TECNOLOG') || n.includes('INOVAC')) return 'TECNOLOGIA DA INFORMAÇÃO E INOVAÇÃO';
      if (n.includes('LICIT') || n.includes('CONTRAT') || n.includes('GOVERNA')) return 'GOVERNANÇA EM LICITAÇÕES E CONTRATAÇÕES';
      // Se o backend já veio em uma das formas canônicas, preserve
      for (const c of canonicalList) {
        if (n === normalize(c)) return c;
      }
      return 'OUTRAS DIRETORIAS';
    };

    // Agregar por diretoria/secretaria usando a chave normalizada
    const map = new Map<string, { diretoria: string; quantidade: number; valor_total: number }>();
    for (const c of lista) {
      const rawDir: string = (c?.diretoria || c?.secretaria || 'Não informada') as string;
      const key = canonicalize(rawDir);
      const valor: number = Number(c?.valor ?? c?.valor_contrato ?? 0) || 0;
      const current = map.get(key) || { diretoria: key, quantidade: 0, valor_total: 0 };
      current.quantidade += 1;
      current.valor_total += valor;
      map.set(key, current);
    }

    // Ordenar por valor desc
    let data = Array.from(map.values()).sort((a, b) => b.valor_total - a.valor_total);
    // Garante presença estável das diretorias canônicas que existirem no período
    const set = new Set(data.map(d => d.diretoria));
    for (const c of canonicalList) {
      if (!set.has(c)) continue; // não força inclusão se não houver dados
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao agregar valores por diretoria:', error);
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 });
  }
}


