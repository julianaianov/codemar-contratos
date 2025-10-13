import { supabase } from '../client'
import { UserModel } from '../models/User'
import { User, ApiResponse } from '../types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: 'admin' | 'user'
  cpf?: string
  department?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

export class AuthService {
  /**
   * Login do usuário
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const { email, password } = credentials

      if (!email || !password) {
        return {
          success: false,
          message: 'Email e senha são obrigatórios',
          errors: {
            email: !email ? ['Email é obrigatório'] : [],
            password: !password ? ['Senha é obrigatória'] : []
          }
        }
      }

      // Buscar usuário no banco
      const user = await UserModel.findByEmail(email)
      
      if (!user) {
        return {
          success: false,
          message: 'Credenciais inválidas'
        }
      }

      if (!user.is_active) {
        return {
          success: false,
          message: 'Usuário inativo'
        }
      }

      // Verificar senha (em produção, usar bcrypt)
      const isValidPassword = await this.verifyPassword(password, (user as any).password)
      
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Credenciais inválidas'
        }
      }

      // Atualizar último login
      await UserModel.update(user.id, {
        last_login_at: new Date().toISOString()
      })

      // Gerar token JWT (simulado)
      const token = this.generateToken(user)
      const refreshToken = this.generateRefreshToken(user)

      return {
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user,
          token,
          refreshToken
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao fazer login',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Registro de novo usuário
   */
  static async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const { name, email, password, role = 'user', cpf, department } = data

      // Validações
      if (!name || !email || !password) {
        return {
          success: false,
          message: 'Dados obrigatórios não fornecidos',
          errors: {
            name: !name ? ['Nome é obrigatório'] : [],
            email: !email ? ['Email é obrigatório'] : [],
            password: !password ? ['Senha é obrigatória'] : []
          }
        }
      }

      if (password.length < 6) {
        return {
          success: false,
          message: 'Senha deve ter pelo menos 6 caracteres',
          errors: {
            password: ['Senha deve ter pelo menos 6 caracteres']
          }
        }
      }

      // Verificar se email já existe
      const existingUser = await UserModel.findByEmail(email)
      if (existingUser) {
        return {
          success: false,
          message: 'Email já está em uso',
          errors: {
            email: ['Email já está em uso']
          }
        }
      }

      // Verificar se CPF já existe (se fornecido)
      if (cpf) {
        const existingCpf = await UserModel.findAll({ search: cpf })
        if (existingCpf.data.some(user => user.cpf === cpf)) {
          return {
            success: false,
            message: 'CPF já está em uso',
            errors: {
              cpf: ['CPF já está em uso']
            }
          }
        }
      }

      // Hash da senha
      const hashedPassword = await this.hashPassword(password)

      // Criar usuário
      const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        role,
        cpf,
        department,
        is_active: true
      } as any)

      // Gerar token
      const token = this.generateToken(user)
      const refreshToken = this.generateRefreshToken(user)

      return {
        success: true,
        message: 'Usuário registrado com sucesso',
        data: {
          user,
          token,
          refreshToken
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao registrar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Logout do usuário
   */
  static async logout(): Promise<ApiResponse<null>> {
    try {
      // Em um ambiente real, aqui você invalidaria o token
      // Por enquanto, apenas retornamos sucesso
      
      return {
        success: true,
        message: 'Logout realizado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao fazer logout',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Refresh do token
   */
  static async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    try {
      // Em um ambiente real, aqui você validaria o refresh token
      // e geraria um novo access token
      
      // Por enquanto, simulamos a validação
      if (!refreshToken) {
        return {
          success: false,
          message: 'Refresh token inválido'
        }
      }

      const newToken = this.generateToken({} as User) // Token genérico

      return {
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          token: newToken
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao renovar token',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Verificar se o usuário está autenticado
   */
  static async verifyToken(token: string): Promise<ApiResponse<User>> {
    try {
      // Em um ambiente real, aqui você validaria o JWT
      // Por enquanto, simulamos a validação
      
      if (!token) {
        return {
          success: false,
          message: 'Token não fornecido'
        }
      }

      // Simular extração do ID do usuário do token
      const userId = this.extractUserIdFromToken(token)
      
      if (!userId) {
        return {
          success: false,
          message: 'Token inválido'
        }
      }

      const user = await UserModel.findById(userId)
      
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        }
      }

      if (!user.is_active) {
        return {
          success: false,
          message: 'Usuário inativo'
        }
      }

      return {
        success: true,
        data: user
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao verificar token',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Middleware de autenticação
   */
  static async authenticate(token: string): Promise<User | null> {
    const result = await this.verifyToken(token)
    return result.success ? result.data! : null
  }

  /**
   * Middleware de autorização (admin)
   */
  static async requireAdmin(token: string): Promise<User | null> {
    const user = await this.authenticate(token)
    
    if (!user) {
      return null
    }

    if (!UserModel.isAdmin(user)) {
      return null
    }

    return user
  }

  /**
   * Hash da senha (simulado - em produção usar bcrypt)
   */
  private static async hashPassword(password: string): Promise<string> {
    // Em produção, usar bcrypt ou similar
    // Por enquanto, retornamos uma versão "hasheada" simples
    return `hashed_${password}_${Date.now()}`
  }

  /**
   * Verificar senha (simulado - em produção usar bcrypt)
   */
  private static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    // Em produção, usar bcrypt.compare()
    // Por enquanto, simulamos a verificação
    return hashedPassword.includes(password)
  }

  /**
   * Gerar token JWT (simulado)
   */
  private static generateToken(user: User): string {
    // Em produção, usar uma biblioteca JWT real
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
    }
    
    return `jwt_${btoa(JSON.stringify(payload))}`
  }

  /**
   * Gerar refresh token (simulado)
   */
  private static generateRefreshToken(user: User): string {
    // Em produção, usar uma biblioteca JWT real
    const payload = {
      sub: user.id,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 dias
    }
    
    return `refresh_${btoa(JSON.stringify(payload))}`
  }

  /**
   * Extrair ID do usuário do token (simulado)
   */
  private static extractUserIdFromToken(token: string): string | null {
    try {
      // Em produção, usar uma biblioteca JWT real
      if (token.startsWith('jwt_')) {
        const payload = JSON.parse(atob(token.substring(4)))
        return payload.sub
      }
      return null
    } catch {
      return null
    }
  }
}
