export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  is_active: boolean
  cpf?: string
  department?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface FileImport {
  id: string
  original_filename: string
  stored_filename: string
  file_path: string
  file_type: 'csv' | 'excel' | 'xml' | 'pdf'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_records: number
  processed_records: number
  successful_records: number
  failed_records: number
  error_message?: string
  metadata?: Record<string, any>
  user_id: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface ContratoImportado {
  id: string
  file_import_id: string
  // Campos específicos do contrato
  ano_numero?: string
  numero_contrato?: string
  ano?: number
  pa?: string
  diretoria?: string
  modalidade?: string
  nome_empresa?: string
  cnpj_empresa?: string
  objeto?: string
  data_assinatura?: string
  prazo?: number
  unidade_prazo?: string
  valor_contrato?: number
  vencimento?: string
  gestor_contrato?: string
  fiscal_tecnico?: string
  fiscal_administrativo?: string
  suplente?: string
  // Campos legados para compatibilidade
  contratante?: string
  contratado?: string
  cnpj_contratado?: string
  valor?: number
  data_inicio?: string
  data_fim?: string
  status?: 'vigente' | 'encerrado' | 'suspenso' | 'rescindido'
  tipo_contrato?: string
  secretaria?: string
  fonte_recurso?: string
  observacoes?: string
  dados_originais?: Record<string, any>
  pdf_path?: string
  processado: boolean
  erro_processamento?: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      file_imports: {
        Row: FileImport
        Insert: Omit<FileImport, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<FileImport, 'id' | 'created_at' | 'updated_at'>>
      }
      contratos_importados: {
        Row: ContratoImportado
        Insert: Omit<ContratoImportado, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ContratoImportado, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'user'
      file_type: 'csv' | 'excel' | 'xml' | 'pdf'
      import_status: 'pending' | 'processing' | 'completed' | 'failed'
      contract_status: 'vigente' | 'encerrado' | 'suspenso' | 'rescindido'
    }
  }
}

// Tipos para respostas da API
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

// Tipos para filtros
export interface ContratoFilters {
  status?: string
  numero_contrato?: string
  contratado?: string
  diretoria?: string
  data_inicio?: string
  data_fim?: string
  order_by?: string
  order_direction?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

export interface UserFilters {
  role?: string
  active?: string
  search?: string
  per_page?: number
  page?: number
}

export interface ImportFilters {
  status?: string
  file_type?: string
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

// Tipos para estatísticas
export interface DashboardStats {
  users: {
    total: number
    active: number
    admins: number
  }
  imports: {
    total: number
    successful: number
    failed: number
    processing: number
  }
  contracts: {
    total: number
    processed: number
  }
  storage: {
    pdf_files: number
    total_size: string
  }
  recent_activity: Array<{
    type: 'import' | 'user'
    description: string
    status?: string
    date: string
    records?: number
  }>
}

export interface ContratoStats {
  total: number
  vigentes: number
  encerrados: number
  suspensos: number
  rescindidos: number
  valor_total: number
  valor_vigentes: number
}




