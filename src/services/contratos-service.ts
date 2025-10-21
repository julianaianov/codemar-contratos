import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://syhnkxbeftosviscvmmd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTM2NDcsImV4cCI6MjA3NTg4OTY0N30.ppUts-2J2FUqJOYz0VY1xwWXYG1CkylKIIJDGziYi4I';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface ContratoModel {
  id: string;
  nome: string;
  descricao: string;
  arquivo_original: string;
  arquivo_editado?: string;
  tamanho: number;
  tipo: string;
  status: string;
  versao: number;
  is_editado: boolean;
  data_upload: string;
  data_edicao?: string;
  usuario_upload: string;
  usuario_edicao?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ContratoUploadData {
  nome: string;
  descricao?: string;
  arquivo: File;
  usuario?: string;
  metadata?: any;
}

export class ContratosService {
  /**
   * Lista todos os contratos
   */
  static async listarContratos(filtros: {
    tipo?: string;
    status?: string;
    is_editado?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<{ data: ContratoModel[]; total: number; page: number; per_page: number; total_pages: number }> {
    try {
      const { tipo, status, is_editado, page = 1, per_page = 15 } = filtros;
      
      let query = supabase
        .from('contratos_upload')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (is_editado !== undefined) {
        query = query.eq('is_editado', is_editado);
      }

      // Paginação
      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        total: count || 0,
        page,
        per_page,
        total_pages: Math.ceil((count || 0) / per_page)
      };
    } catch (error) {
      console.error('Erro ao listar contratos:', error);
      throw new Error('Erro ao listar contratos');
    }
  }

  /**
   * Busca contrato por ID
   */
  static async buscarContrato(id: string): Promise<ContratoModel | null> {
    try {
      const { data, error } = await supabase
        .from('contratos_upload')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
      return null;
    }
  }

  /**
   * Upload de novo contrato
   */
  static async uploadContrato(contratoData: ContratoUploadData): Promise<ContratoModel> {
    try {
      const { nome, descricao, arquivo, usuario = 'sistema', metadata } = contratoData;

      // Gerar ID único
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Nome do arquivo no servidor (sanitizado)
      const sanitizedName = arquivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${id}_${sanitizedName}`;
      const filePath = `contratos/${fileName}`;

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contratos')
        .upload(filePath, arquivo, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Criar registro no banco
      const { data: contrato, error: dbError } = await supabase
        .from('contratos_upload')
        .insert({
          id,
          nome: nome.trim(),
          descricao: descricao?.trim() || '',
          arquivo_original: fileName,
          tamanho: arquivo.size,
          tipo: arquivo.name.split('.').pop()?.toUpperCase() || 'PDF',
          status: 'ativo',
          versao: 1,
          is_editado: false,
          usuario_upload: usuario,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Erro ao salvar contrato: ${dbError.message}`);
      }

      return contrato;
    } catch (error) {
      console.error('Erro no upload do contrato:', error);
      throw error;
    }
  }

  /**
   * Salvar versão editada do contrato
   */
  static async salvarEdicao(id: string, arquivoEditado: File, usuario: string = 'sistema'): Promise<ContratoModel> {
    try {
      // Buscar contrato original
      const contratoOriginal = await this.buscarContrato(id);
      if (!contratoOriginal) {
        throw new Error('Contrato não encontrado');
      }

      // Gerar nome para arquivo editado
      const timestamp = Date.now();
      const fileNameEditado = `${id}_editado_${timestamp}.${arquivoEditado.name.split('.').pop()}`;
      const filePathEditado = `contratos/${fileNameEditado}`;

      // Upload do arquivo editado
      const { error: uploadError } = await supabase.storage
        .from('contratos')
        .upload(filePathEditado, arquivoEditado, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Erro no upload da edição: ${uploadError.message}`);
      }

      // Atualizar registro no banco
      const { data: contratoAtualizado, error: updateError } = await supabase
        .from('contratos_upload')
        .update({
          arquivo_editado: fileNameEditado,
          versao: contratoOriginal.versao + 1,
          is_editado: true,
          data_edicao: new Date().toISOString(),
          usuario_edicao: usuario
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Erro ao atualizar contrato: ${updateError.message}`);
      }

      return contratoAtualizado;
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
      throw error;
    }
  }

  /**
   * Download do arquivo original
   */
  static async downloadOriginal(id: string): Promise<{ url: string; filename: string }> {
    try {
      const contrato = await this.buscarContrato(id);
      if (!contrato) {
        throw new Error('Contrato não encontrado');
      }

      const { data, error } = await supabase.storage
        .from('contratos')
        .createSignedUrl(`${contrato.arquivo_original}`, 3600); // 1 hora

      if (error) {
        throw new Error(`Erro ao gerar URL: ${error.message}`);
      }

      return {
        url: data.signedUrl,
        filename: contrato.arquivo_original
      };
    } catch (error) {
      console.error('Erro ao baixar arquivo original:', error);
      throw error;
    }
  }

  /**
   * Download do arquivo editado
   */
  static async downloadEditado(id: string): Promise<{ url: string; filename: string }> {
    try {
      const contrato = await this.buscarContrato(id);
      if (!contrato || !contrato.arquivo_editado) {
        throw new Error('Contrato editado não encontrado');
      }

      const { data, error } = await supabase.storage
        .from('contratos')
        .createSignedUrl(`${contrato.arquivo_editado}`, 3600); // 1 hora

      if (error) {
        throw new Error(`Erro ao gerar URL: ${error.message}`);
      }

      return {
        url: data.signedUrl,
        filename: contrato.arquivo_editado
      };
    } catch (error) {
      console.error('Erro ao baixar arquivo editado:', error);
      throw error;
    }
  }

  /**
   * Excluir contrato
   */
  static async excluirContrato(id: string): Promise<void> {
    try {
      const contrato = await this.buscarContrato(id);
      if (!contrato) {
        throw new Error('Contrato não encontrado');
      }

      // Excluir arquivos do storage
      const arquivosParaExcluir = [contrato.arquivo_original];
      if (contrato.arquivo_editado) {
        arquivosParaExcluir.push(contrato.arquivo_editado);
      }

      for (const arquivo of arquivosParaExcluir) {
        const { error: deleteError } = await supabase.storage
          .from('contratos')
          .remove([arquivo]);

        if (deleteError) {
          console.warn(`Erro ao excluir arquivo ${arquivo}:`, deleteError);
        }
      }

      // Excluir registro do banco
      const { error: dbError } = await supabase
        .from('contratos_upload')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw new Error(`Erro ao excluir contrato: ${dbError.message}`);
      }
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas
   */
  static async obterEstatisticas(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('contratos_stats')
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        total_contratos: 0,
        contratos_editados: 0,
        contratos_ativos: 0,
        contratos_pdf: 0,
        contratos_docx: 0,
        tamanho_total: 0,
        tamanho_medio: 0,
        ultimo_upload: null
      };
    }
  }
}
