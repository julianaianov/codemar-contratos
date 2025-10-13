import { supabase, supabaseAdmin } from '../client'
import { FileImport, ImportFilters, PaginatedResponse, ContratoImportado } from '../types'

export class FileImportModel {
  /**
   * Busca todas as importações com filtros e paginação
   */
  static async findAll(filters: ImportFilters = {}): Promise<PaginatedResponse<FileImport>> {
    let query = supabaseAdmin
      .from('file_imports')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.file_type && filters.file_type !== 'all') {
      query = query.eq('file_type', filters.file_type)
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    // Ordenação
    query = query.order('created_at', { ascending: false })

    // Paginação
    const perPage = filters.per_page || 20
    const page = filters.page || 1
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Erro ao buscar importações: ${error.message}`)
    }

    const total = count || 0
    const lastPage = Math.ceil(total / perPage)

    return {
      data: data || [],
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total,
      from: from + 1,
      to: Math.min(to + 1, total)
    }
  }

  /**
   * Busca uma importação por ID
   */
  static async findById(id: string): Promise<FileImport | null> {
    const { data, error } = await supabaseAdmin
      .from('file_imports')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Erro ao buscar importação: ${error.message}`)
    }

    return data
  }

  /**
   * Cria uma nova importação
   */
  static async create(importData: Omit<FileImport, 'id' | 'created_at' | 'updated_at'>): Promise<FileImport> {
    const { data, error } = await (supabaseAdmin as any)
      .from('file_imports')
      .insert([importData])
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar importação: ${error.message}`)
    }

    return data
  }

  /**
   * Atualiza uma importação
   */
  static async update(id: string, importData: Partial<Omit<FileImport, 'id' | 'created_at' | 'updated_at'>>): Promise<FileImport> {
    const updateData = {
      ...importData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await (supabaseAdmin as any)
      .from('file_imports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar importação: ${error.message}`)
    }

    return data
  }

  /**
   * Deleta uma importação
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('file_imports')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Erro ao deletar importação: ${error.message}`)
    }
  }

  /**
   * Busca contratos de uma importação
   */
  static async getContratos(id: string, page: number = 1, perPage: number = 50): Promise<PaginatedResponse<ContratoImportado>> {
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data, error, count } = await supabaseAdmin
      .from('contratos_importados')
      .select('*', { count: 'exact' })
      .eq('file_import_id', id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw new Error(`Erro ao buscar contratos da importação: ${error.message}`)
    }

    const total = count || 0
    const lastPage = Math.ceil(total / perPage)

    return {
      data: data || [],
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total,
      from: from + 1,
      to: Math.min(to + 1, total)
    }
  }

  /**
   * Marca como iniciado
   */
  static async markAsStarted(id: string): Promise<FileImport> {
    return this.update(id, {
      status: 'processing',
      started_at: new Date().toISOString()
    })
  }

  /**
   * Marca como concluído
   */
  static async markAsCompleted(id: string): Promise<FileImport> {
    return this.update(id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }

  /**
   * Marca como falho
   */
  static async markAsFailed(id: string, errorMessage: string): Promise<FileImport> {
    return this.update(id, {
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString()
    })
  }

  /**
   * Verifica se a importação está completa
   */
  static isCompleted(importData: FileImport): boolean {
    return importData.status === 'completed'
  }

  /**
   * Verifica se a importação falhou
   */
  static isFailed(importData: FileImport): boolean {
    return importData.status === 'failed'
  }

  /**
   * Verifica se a importação está em processamento
   */
  static isProcessing(importData: FileImport): boolean {
    return importData.status === 'processing'
  }

  /**
   * Conta importações por status
   */
  static async countByStatus(status: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('file_imports')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)

    if (error) {
      throw new Error(`Erro ao contar importações por status: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Conta importações por tipo de arquivo
   */
  static async countByFileType(fileType: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('file_imports')
      .select('*', { count: 'exact', head: true })
      .eq('file_type', fileType)

    if (error) {
      throw new Error(`Erro ao contar importações por tipo: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Busca importações recentes
   */
  static async findRecent(limit: number = 5): Promise<FileImport[]> {
    const { data, error } = await supabaseAdmin
      .from('file_imports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Erro ao buscar importações recentes: ${error.message}`)
    }

    return data || []
  }

  /**
   * Estatísticas por tipo de arquivo
   */
  static async getStatsByType(): Promise<Array<{ file_type: string; total: number }>> {
    const { data, error } = await supabaseAdmin
      .from('file_imports')
      .select('file_type')
      .not('file_type', 'is', null)

    if (error) {
      throw new Error(`Erro ao buscar estatísticas por tipo: ${error.message}`)
    }

    // Agrupar por tipo
    const stats = (data || []).reduce((acc: Record<string, number>, item: any) => {
      acc[item.file_type] = (acc[item.file_type] || 0) + 1
      return acc
    }, {})

    return Object.entries(stats).map(([file_type, total]) => ({
      file_type,
      total: total as number
    }))
  }
}




