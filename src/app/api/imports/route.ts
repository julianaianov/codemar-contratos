import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://syhnkxbeftosviscvmmd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTM2NDcsImV4cCI6MjA3NTg4OTY0N30.ppUts-2J2FUqJOYz0VY1xwWXYG1CkylKIIJDGziYi4I';
const supabase = createClient(supabaseUrl, supabaseKey);

// POST - Upload e processamento de arquivo
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const diretoria = formData.get('diretoria') as string;

    if (!file) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Arquivo é obrigatório',
          errors: { file: ['Arquivo é obrigatório'] }
        },
        { status: 400 }
      );
    }

    // Verificar tipo de arquivo
    const allowedTypes = ['xml', 'xlsx', 'xls', 'csv', 'pdf'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Tipo de arquivo não suportado',
          errors: { file: ['Tipos suportados: XML, Excel, CSV, PDF'] }
        },
        { status: 400 }
      );
    }

    // Verificar tamanho do arquivo (20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Arquivo muito grande',
          errors: { file: ['Tamanho máximo: 20MB'] }
        },
        { status: 400 }
      );
    }

    // Para PDFs, diretoria é obrigatória
    if (fileExtension === 'pdf' && !diretoria) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Para arquivos PDF, a diretoria é obrigatória',
          errors: { diretoria: ['A diretoria é obrigatória para arquivos PDF'] }
        },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const storedFilename = `${timestamp}_${randomId}_${file.name}`;
    const filePath = `imports/${storedFilename}`;

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('imports')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Erro no upload para Supabase:', uploadError);
      return NextResponse.json(
        { 
          success: false,
          message: 'Erro ao fazer upload do arquivo',
          error: uploadError.message
        },
        { status: 500 }
      );
    }

    // Criar registro na tabela file_imports
    const { data: fileImport, error: dbError } = await supabase
      .from('file_imports')
      .insert({
        original_filename: file.name,
        stored_filename: storedFilename,
        file_path: filePath,
        file_type: fileExtension,
        status: 'pending',
        total_records: 0,
        processed_records: 0,
        successful_records: 0,
        failed_records: 0,
        metadata: {
          file_size: file.size,
          mime_type: file.type,
          uploaded_at: new Date().toISOString(),
          diretoria: diretoria || null
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
      return NextResponse.json(
        { 
          success: false,
          message: 'Erro ao salvar informações do arquivo',
          error: dbError.message
        },
        { status: 500 }
      );
    }

    // Para PDFs, simular processamento (em produção, usar OCR/IA)
    if (fileExtension === 'pdf') {
      // Simular extração de dados do PDF
      const extractedData = {
        numero_contrato: `CONTRATO-${timestamp}`,
        objeto: 'Contrato extraído do PDF',
        valor_contrato: 0,
        contratado: 'Fornecedor não identificado',
        diretoria: diretoria,
        status: 'vigente',
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      // Salvar contrato extraído
      const { error: contractError } = await supabase
        .from('contratos_importados')
        .insert({
          file_import_id: fileImport.id,
          numero_contrato: extractedData.numero_contrato,
          objeto: extractedData.objeto,
          valor_contrato: extractedData.valor_contrato,
          contratado: extractedData.contratado,
          diretoria: extractedData.diretoria,
          status: extractedData.status,
          data_inicio: extractedData.data_inicio,
          data_fim: extractedData.data_fim,
          created_at: new Date().toISOString()
        });

      if (contractError) {
        console.error('Erro ao salvar contrato:', contractError);
      }

      // Atualizar status da importação
      await supabase
        .from('file_imports')
        .update({
          status: 'completed',
          total_records: 1,
          processed_records: 1,
          successful_records: 1,
          failed_records: 0
        })
        .eq('id', fileImport.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Arquivo importado com sucesso',
      data: {
        id: fileImport.id,
        original_filename: fileImport.original_filename,
        file_type: fileImport.file_type,
        status: fileImport.status,
        total_records: fileImport.total_records,
        successful_records: fileImport.successful_records,
        failed_records: fileImport.failed_records,
        created_at: fileImport.created_at
      }
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// GET - Listar importações
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '15');
    const status = searchParams.get('status');
    const fileType = searchParams.get('file_type');

    let query = supabase
      .from('file_imports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }
    if (fileType) {
      query = query.eq('file_type', fileType);
    }

    // Paginação
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

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
    console.error('Erro ao buscar importações:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro ao buscar importações',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
