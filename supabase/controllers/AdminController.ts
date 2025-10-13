import { UserModel } from '../models/User'
import { FileImportModel } from '../models/FileImport'
import { ContratoImportadoModel } from '../models/ContratoImportado'
import { User, UserFilters, ImportFilters, ApiResponse, PaginatedResponse, DashboardStats } from '../types'

export class AdminController {
  /**
   * Dashboard com estatísticas gerais
   */
  static async dashboard(): Promise<ApiResponse<DashboardStats>> {
    try {
      const [
        totalUsers,
        activeUsers,
        adminUsers,
        totalImports,
        successfulImports,
        failedImports,
        processingImports,
        totalContracts,
        processedContracts,
        pdfFiles,
        recentImports,
        recentUsers
      ] = await Promise.all([
        UserModel.count(),
        UserModel.countActive(),
        UserModel.countAdmins(),
        Promise.all([
          FileImportModel.countByStatus('completed'),
          FileImportModel.countByStatus('failed'),
          FileImportModel.countByStatus('processing')
        ]).then(counts => counts.reduce((a, b) => a + b, 0)),
        FileImportModel.countByStatus('completed'),
        FileImportModel.countByStatus('failed'),
        FileImportModel.countByStatus('processing'),
        ContratoImportadoModel.findAll().then(result => result.total),
        ContratoImportadoModel.countProcessed(),
        FileImportModel.countByFileType('pdf'),
        FileImportModel.findRecent(5),
        UserModel.findRecent(3)
      ])

      // Calcular tamanho do armazenamento (simulado)
      const totalSize = await this.calculateStorageSize()

      // Preparar atividade recente
      const recentActivity = [
        ...recentImports.map(importData => ({
          type: 'import' as const,
          description: `Importação de ${importData.file_type}: ${importData.original_filename}`,
          status: importData.status,
          date: importData.created_at,
          records: importData.total_records
        })),
        ...recentUsers.map(user => ({
          type: 'user' as const,
          description: `Novo usuário: ${user.name} (${user.role})`,
          date: user.created_at
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)

      const stats: DashboardStats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers
        },
        imports: {
          total: totalImports,
          successful: successfulImports,
          failed: failedImports,
          processing: processingImports
        },
        contracts: {
          total: totalContracts,
          processed: processedContracts
        },
        storage: {
          pdf_files: pdfFiles,
          total_size: totalSize
        },
        recent_activity: recentActivity
      }

      return {
        success: true,
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao carregar dashboard',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Listar usuários
   */
  static async users(filters: UserFilters = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    try {
      const users = await UserModel.findAll(filters)
      
      return {
        success: true,
        data: users
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao listar usuários',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Criar usuário
   */
  static async createUser(userData: {
    name: string
    email: string
    password: string
    role: 'admin' | 'user'
    cpf?: string
    department?: string
  }): Promise<ApiResponse<User>> {
    try {
      // Validações
      if (!userData.name || !userData.email || !userData.password || !userData.role) {
        return {
          success: false,
          message: 'Dados obrigatórios não fornecidos',
          errors: {
            name: !userData.name ? ['Nome é obrigatório'] : [],
            email: !userData.email ? ['Email é obrigatório'] : [],
            password: !userData.password ? ['Senha é obrigatória'] : [],
            role: !userData.role ? ['Função é obrigatória'] : []
          }
        }
      }

      if (userData.password.length < 6) {
        return {
          success: false,
          message: 'Senha deve ter pelo menos 6 caracteres',
          errors: {
            password: ['Senha deve ter pelo menos 6 caracteres']
          }
        }
      }

      if (!['admin', 'user'].includes(userData.role)) {
        return {
          success: false,
          message: 'Função inválida',
          errors: {
            role: ['Função deve ser admin ou user']
          }
        }
      }

      // Verificar se email já existe
      const existingUser = await UserModel.findByEmail(userData.email)
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
      if (userData.cpf) {
        const existingCpf = await UserModel.findAll({ search: userData.cpf })
        if (existingCpf.data.some(user => user.cpf === userData.cpf)) {
          return {
            success: false,
            message: 'CPF já está em uso',
            errors: {
              cpf: ['CPF já está em uso']
            }
          }
        }
      }

      // Hash da senha (simulado - em produção usar bcrypt)
      const hashedPassword = await this.hashPassword(userData.password)

      const user = await UserModel.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        cpf: userData.cpf,
        department: userData.department,
        is_active: true
      } as any)

      return {
        success: true,
        message: 'Usuário criado com sucesso',
        data: user
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao criar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Atualizar usuário
   */
  static async updateUser(id: string, userData: Partial<{
    name: string
    email: string
    password: string
    role: 'admin' | 'user'
    cpf: string
    department: string
    is_active: boolean
  }>): Promise<ApiResponse<User>> {
    try {
      const user = await UserModel.findById(id)
      
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        }
      }

      // Validações condicionais
      if (userData.email && userData.email !== user.email) {
        const existingUser = await UserModel.findByEmail(userData.email)
        if (existingUser) {
          return {
            success: false,
            message: 'Email já está em uso',
            errors: {
              email: ['Email já está em uso']
            }
          }
        }
      }

      if (userData.cpf && userData.cpf !== user.cpf) {
        const existingCpf = await UserModel.findAll({ search: userData.cpf })
        if (existingCpf.data.some(u => u.cpf === userData.cpf)) {
          return {
            success: false,
            message: 'CPF já está em uso',
            errors: {
              cpf: ['CPF já está em uso']
            }
          }
        }
      }

      if (userData.password && userData.password.length < 6) {
        return {
          success: false,
          message: 'Senha deve ter pelo menos 6 caracteres',
          errors: {
            password: ['Senha deve ter pelo menos 6 caracteres']
          }
        }
      }

      if (userData.role && !['admin', 'user'].includes(userData.role)) {
        return {
          success: false,
          message: 'Função inválida',
          errors: {
            role: ['Função deve ser admin ou user']
          }
        }
      }

      const updateData: any = { ...userData }
      
      if (userData.password) {
        updateData.password = await this.hashPassword(userData.password)
      }

      const updatedUser = await UserModel.update(id, updateData)

      return {
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: updatedUser
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao atualizar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Deletar usuário
   */
  static async deleteUser(id: string, currentUserId?: string): Promise<ApiResponse<null>> {
    try {
      const user = await UserModel.findById(id)
      
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        }
      }

      // Não permitir deletar o próprio usuário
      if (currentUserId && user.id === currentUserId) {
        return {
          success: false,
          message: 'Não é possível deletar seu próprio usuário'
        }
      }

      await UserModel.delete(id)

      return {
        success: true,
        message: 'Usuário deletado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao deletar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Relatórios de importação
   */
  static async importReports(filters: ImportFilters = {}): Promise<ApiResponse<{
    imports: PaginatedResponse<any>
    stats_by_type: Array<{ file_type: string; total: number }>
  }>> {
    try {
      const imports = await FileImportModel.findAll(filters)
      const statsByType = await FileImportModel.getStatsByType()

      return {
        success: true,
        data: {
          imports,
          stats_by_type: statsByType
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao gerar relatórios',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Calcular tamanho do armazenamento (simulado)
   */
  private static async calculateStorageSize(): Promise<string> {
    // Em um ambiente real, isso seria calculado baseado nos arquivos armazenados
    // Por enquanto, retornamos um valor simulado
    const imports = await FileImportModel.findAll()
    const totalFiles = imports.total
    
    // Simular tamanho baseado no número de arquivos
    const estimatedSize = totalFiles * 2.5 // MB por arquivo em média
    
    const units = ['B', 'KB', 'MB', 'GB']
    let size = estimatedSize * 1024 * 1024 // Converter para bytes
    let unitIndex = 2 // Começar com MB

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`
  }

  /**
   * Hash da senha (simulado - em produção usar bcrypt)
   */
  private static async hashPassword(password: string): Promise<string> {
    // Em produção, usar bcrypt ou similar
    // Por enquanto, retornamos uma versão "hasheada" simples
    return `hashed_${password}_${Date.now()}`
  }
}




