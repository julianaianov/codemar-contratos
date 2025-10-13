import { supabase, supabaseAdmin } from '../client'
import { ContratoImportado, ContratoFilters, PaginatedResponse, ContratoStats } from '../types'

export class ContratoImportadoModel {
  /**
   * Busca todos os contratos com filtros e paginação
   */
  static async findAll(filters: ContratoFilters = {}): Promise<PaginatedResponse<ContratoImportado>> {
    let query = supabaseAdmin
      .from('contratos_importados')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.numero_contrato) {
      query = query.ilike('numero_contrato', `%${filters.numero_contrato}%`)
    }

    if (filters.contratado) {
      query = query.ilike('contratado', `%${filters.contratado}%`)
    }

    if (filters.diretoria && filters.diretoria !== '' && filters.diretoria.toLowerCase() !== 'todas') {
      if (filters.diretoria === 'OUTROS') {
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
        const diretoriaFiltro = filters.diretoria.toUpperCase();
        // Usar correspondência parcial para lidar com prefixos como "DIRETORIA DE"
        query = query.or(`diretoria.ilike.%${diretoriaFiltro}%,secretaria.ilike.%${diretoriaFiltro}%`)
      }
    }

    if (filters.data_inicio) {
      query = query.gte('data_inicio', filters.data_inicio)
    }

    if (filters.data_fim) {
      query = query.lte('data_fim', filters.data_fim)
    }

    // Ordenação
    const orderBy = filters.order_by || 'created_at'
    const orderDirection = filters.order_direction || 'desc'
    query = query.order(orderBy, { ascending: orderDirection === 'asc' })

    // Paginação
    const perPage = filters.per_page || 15
    const page = filters.page || 1
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Erro ao buscar contratos: ${error.message}`)
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
   * Busca um contrato por ID
   */
  static async findById(id: string): Promise<ContratoImportado | null> {
    const { data, error } = await supabaseAdmin
      .from('contratos_importados')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Erro ao buscar contrato: ${error.message}`)
    }

    return data
  }

  /**
   * Cria um novo contrato
   */
  static async create(contratoData: Omit<ContratoImportado, 'id' | 'created_at' | 'updated_at'>): Promise<ContratoImportado> {
    const { data, error } = await (supabaseAdmin as any)
      .from('contratos_importados')
      .insert([contratoData])
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar contrato: ${error.message}`)
    }

    return data
  }

  /**
   * Atualiza um contrato
   */
  static async update(id: string, contratoData: Partial<Omit<ContratoImportado, 'id' | 'created_at' | 'updated_at'>>): Promise<ContratoImportado> {
    const updateData = {
      ...contratoData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await (supabaseAdmin as any)
      .from('contratos_importados')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar contrato: ${error.message}`)
    }

    return data
  }

  /**
   * Deleta um contrato
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('contratos_importados')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Erro ao deletar contrato: ${error.message}`)
    }
  }

  /**
   * Marca como processado
   */
  static async markAsProcessed(id: string): Promise<ContratoImportado> {
    return this.update(id, { processado: true })
  }

  /**
   * Marca como falho no processamento
   */
  static async markAsFailedProcessing(id: string, error: string): Promise<ContratoImportado> {
    return this.update(id, {
      processado: false,
      erro_processamento: error
    })
  }

  /**
   * Busca contratos por importação
   */
  static async findByFileImport(fileImportId: string): Promise<ContratoImportado[]> {
    const { data, error } = await supabaseAdmin
      .from('contratos_importados')
      .select('*')
      .eq('file_import_id', fileImportId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar contratos da importação: ${error.message}`)
    }

    return data || []
  }

  /**
   * Busca diretorias encontradas nos contratos
   */
  static async getDiretoriasEncontradas(fileImportId: string): Promise<Array<{ diretoria: string; total: number }>> {
    const { data, error } = await supabaseAdmin
      .from('contratos_importados')
      .select('diretoria')
      .eq('file_import_id', fileImportId)
      .not('diretoria', 'is', null)

    if (error) {
      throw new Error(`Erro ao buscar diretorias: ${error.message}`)
    }

    // Agrupar por diretoria
    const stats = (data || []).reduce((acc: Record<string, number>, item: any) => {
      if (item.diretoria) {
        acc[item.diretoria] = (acc[item.diretoria] || 0) + 1
      }
      return acc
    }, {})

    return Object.entries(stats)
      .map(([diretoria, total]) => ({ diretoria, total: total as number }))
      .sort((a, b) => b.total - a.total)
  }

  /**
   * Estatísticas dos contratos
   */
  static async getStats(filters: { diretoria?: string } = {}): Promise<ContratoStats> {
    let query = supabaseAdmin
      .from('contratos_importados')
      .select('status, valor, valor_contrato')

    // Filtrar por diretoria se fornecido
    if (filters.diretoria) {
      if (filters.diretoria === 'OUTROS') {
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
        const diretoriaFiltro = filters.diretoria.toUpperCase();
        // Usar correspondência parcial para lidar com prefixos como "DIRETORIA DE"
        query = query.or(`diretoria.ilike.%${diretoriaFiltro}%,secretaria.ilike.%${diretoriaFiltro}%`)
      }
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
    }

    const contratos = data || []
    
    const stats: ContratoStats = {
      total: contratos.length,
      vigentes: contratos.filter((c: any) => c.status === 'vigente').length,
      encerrados: contratos.filter((c: any) => c.status === 'encerrado').length,
      suspensos: contratos.filter((c: any) => c.status === 'suspenso').length,
      rescindidos: contratos.filter((c: any) => c.status === 'rescindido').length,
      valor_total: contratos.reduce((sum, c: any) => sum + (c.valor || c.valor_contrato || 0), 0),
      valor_vigentes: contratos
        .filter((c: any) => c.status === 'vigente')
        .reduce((sum, c: any) => sum + (c.valor || c.valor_contrato || 0), 0)
    }

    return stats
  }

  /**
   * Lista todas as diretorias disponíveis
   */
  static async getDiretorias(): Promise<string[]> {
    const diretorias = [
      'Presidência',
      'Diretoria de Administração',
      'Diretoria Jurídica',
      'Diretoria de Assuntos Imobiliários',
      'Diretoria de Operações',
      'Diretoria de Tecnologia da Informação e Inovação',
      'Diretoria de Governança em Licitações e Contratações'
    ]

    return diretorias
  }

  /**
   * Busca contratos com dados originais processados
   */
  static async findWithProcessedData(id: string): Promise<ContratoImportado | null> {
    const contrato = await this.findById(id)
    
    if (!contrato) {
      return null
    }

    // Processar dados originais se existirem
    if (contrato.dados_originais && typeof contrato.dados_originais === 'object') {
      const orig = contrato.dados_originais
      const normalized: Record<string, any> = {}
      
      // Normalizar chaves
      Object.entries(orig).forEach(([k, v]) => {
        const nk = this.normalizeKey(k)
        normalized[nk] = v
      })

      // Função para buscar valores com fallbacks
      const fallback = (keys: string[]): any => {
        for (const k of keys) {
          const base = this.normalizeKey(k)
          
          // Match exato
          if (normalized[base] && normalized[base] !== '') {
            return typeof normalized[base] === 'string' ? normalized[base].trim() : normalized[base]
          }
          
          // Procurar variantes
          for (const [nk, val] of Object.entries(normalized)) {
            if (val === '' || val === null) continue
            
            const regex = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s+|_)\\d+$`)
            const regexParens = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`)
            
            if (regex.test(nk) || regexParens.test(nk)) {
              return typeof val === 'string' ? val.trim() : val
            }
          }
        }
        return null
      }

      // Aplicar fallbacks para campos específicos
      const processedData = {
        ...contrato,
        numero_contrato: contrato.numero_contrato || fallback(['contrato', 'numero', 'numero_contrato', 'nº contrato', 'numero contrato']),
        ano_numero: contrato.ano_numero || fallback(['ano-nº', 'ano_numero', 'ano numero', 'ano-numero']),
        ano: contrato.ano || fallback(['ano', 'ano contrato', 'ano_contrato']),
        status: contrato.status || fallback(['status', 'situacao', 'situação']),
        diretoria: contrato.diretoria || fallback(['diretoria requisitante', 'diretoria', 'secretaria', 'unidade']),
        gestor_contrato: contrato.gestor_contrato || fallback(['gestor do contrato', 'gestor_contrato', 'gestor', 'responsavel', 'responsável']),
        fiscal_tecnico: contrato.fiscal_tecnico || fallback(['fiscal tecnico', 'fiscal tecnico', 'fiscal_tecnico', 'fiscal técnico']),
        fiscal_administrativo: contrato.fiscal_administrativo || fallback(['fiscal administrativo', 'fiscal administrativo', 'fiscal_administrativo', 'fiscal admin']),
        suplente: contrato.suplente || fallback(['suplente', 'substituto']),
        valor_contrato: contrato.valor_contrato || fallback(['valor do contrato', 'valor_contrato', 'valor_total', 'valor total', 'valor']),
        data_assinatura: contrato.data_assinatura || fallback(['data da assinatura', 'data_assinatura', 'assinatura', 'data contrato', 'data_contrato']),
        prazo: contrato.prazo || fallback(['prazo', 'prazo contrato', 'duracao', 'duração']),
        unidade_prazo: contrato.unidade_prazo || fallback(['unid. prazo', 'unidade_prazo', 'unid_prazo', 'unidade', 'periodo', 'período']),
        vencimento: contrato.vencimento || fallback(['vencimento', 'data_vencimento', 'data fim', 'data_fim', 'vigencia_fim'])
      }

      return processedData
    }

    return contrato
  }

  /**
   * Normaliza chaves de dados originais
   */
  private static normalizeKey(key: string): string {
    return key
      .toLowerCase()
      .replace(/[.,;:\\/\\-–—_()\[\]{}]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Conta contratos processados
   */
  static async countProcessed(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('contratos_importados')
      .select('*', { count: 'exact', head: true })
      .eq('processado', true)

    if (error) {
      throw new Error(`Erro ao contar contratos processados: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Busca todos os contratos (para compatibilidade com API existente)
   */
  static async findAllWithFileInfo(): Promise<ContratoImportado[]> {
    const { data, error } = await supabaseAdmin
      .from('contratos_importados')
      .select(`
        *,
        file_imports!inner(
          original_filename,
          file_type
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar contratos com informações de arquivo: ${error.message}`)
    }

    return data || []
  }
}




