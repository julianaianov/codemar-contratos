export const SUPABASE_CONFIG = {
  url: 'https://syhnkxbeftosviscvmmd.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTM2NDcsImV4cCI6MjA3NTg4OTY0N30.ppUts-2J2FUqJOYz0VY1xwWXYG1CkylKIIJDGziYi4I',
  serviceKey: process.env.SUPABASE_SERVICE_KEY,
  
  // Configurações de paginação
  pagination: {
    defaultPerPage: 15,
    maxPerPage: 100
  },
  
  // Configurações de upload
  upload: {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['xml', 'xlsx', 'xls', 'csv', 'pdf'],
    storagePath: 'imports'
  },
  
  // Configurações de autenticação
  auth: {
    tokenExpiration: 60 * 60, // 1 hora
    refreshTokenExpiration: 7 * 24 * 60 * 60, // 7 dias
    passwordMinLength: 6
  },
  
  // Diretorias disponíveis
  diretorias: [
    'Presidência',
    'Diretoria de Administração',
    'Diretoria Jurídica',
    'Diretoria de Assuntos Imobiliários',
    'Diretoria de Operações',
    'Diretoria de Tecnologia da Informação e Inovação',
    'Diretoria de Governança em Licitações e Contratações'
  ],
  
  // Status de contratos
  contractStatuses: [
    'vigente',
    'encerrado',
    'suspenso',
    'rescindido'
  ],
  
  // Tipos de arquivo suportados
  fileTypes: [
    'csv',
    'excel',
    'xml',
    'pdf'
  ],
  
  // Status de importação
  importStatuses: [
    'pending',
    'processing',
    'completed',
    'failed'
  ],
  
  // Roles de usuário
  userRoles: [
    'admin',
    'user'
  ]
} as const

export type SupabaseConfig = typeof SUPABASE_CONFIG




