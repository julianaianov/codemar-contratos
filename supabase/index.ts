// Cliente Supabase
export { supabase, supabaseAdmin } from './client'

// Tipos
export * from './types'

// Modelos
export { UserModel } from './models/User'
export { FileImportModel } from './models/FileImport'
export { ContratoImportadoModel } from './models/ContratoImportado'

// Controllers
export { ContratoController } from './controllers/ContratoController'
export { AdminController } from './controllers/AdminController'
export { FileImportController } from './controllers/FileImportController'

// Serviços
export { FileImportService } from './services/FileImportService'

// Autenticação
export { AuthService } from './auth/AuthService'
export type { LoginCredentials, RegisterData, AuthResponse } from './auth/AuthService'




