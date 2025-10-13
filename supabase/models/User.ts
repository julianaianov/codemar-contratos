import { supabase, supabaseAdmin } from '../client'
import { User, UserFilters, PaginatedResponse } from '../types'

export class UserModel {
  /**
   * Busca todos os usuários com filtros e paginação
   */
  static async findAll(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (filters.role && filters.role !== 'all') {
      query = query.eq('role', filters.role)
    }

    if (filters.active && filters.active !== 'all') {
      query = query.eq('is_active', filters.active === 'true')
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%`)
    }

    // Ordenação
    query = query.order('created_at', { ascending: false })

    // Paginação
    const perPage = filters.per_page || 15
    const page = filters.page || 1
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`)
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
   * Busca um usuário por ID
   */
  static async findById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Erro ao buscar usuário: ${error.message}`)
    }

    return data
  }

  /**
   * Busca um usuário por email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Erro ao buscar usuário: ${error.message}`)
    }

    return data
  }

  /**
   * Cria um novo usuário
   */
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await (supabaseAdmin as any)
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`)
    }

    return data
  }

  /**
   * Atualiza um usuário
   */
  static async update(id: string, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> {
    const updateData = {
      ...userData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await (supabaseAdmin as any)
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`)
    }

    return data
  }

  /**
   * Deleta um usuário
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`)
    }
  }

  /**
   * Conta o total de usuários
   */
  static async count(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Erro ao contar usuários: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Conta usuários ativos
   */
  static async countActive(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (error) {
      throw new Error(`Erro ao contar usuários ativos: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Conta administradores
   */
  static async countAdmins(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')

    if (error) {
      throw new Error(`Erro ao contar administradores: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Verifica se o usuário é administrador
   */
  static isAdmin(user: User): boolean {
    return user.role === 'admin'
  }

  /**
   * Verifica se o usuário está ativo
   */
  static isActive(user: User): boolean {
    return user.is_active
  }

  /**
   * Busca usuários recentes
   */
  static async findRecent(limit: number = 3): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Erro ao buscar usuários recentes: ${error.message}`)
    }

    return data || []
  }
}




