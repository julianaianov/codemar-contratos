/**
 * Exemplos de uso do sistema Supabase para Contratos CODEMAR
 * 
 * Este arquivo demonstra como usar todas as funcionalidades implementadas
 * para replicar o backend Laravel usando Supabase.
 */

import {
  ContratoController,
  AdminController,
  FileImportController,
  AuthService,
  UserModel,
  FileImportModel,
  ContratoImportadoModel
} from '../index'

// ============================================================================
// EXEMPLOS DE AUTENTICAÇÃO
// ============================================================================

export async function exemploAutenticacao() {
  console.log('=== EXEMPLOS DE AUTENTICAÇÃO ===')

  // 1. Login
  const loginResult = await AuthService.login({
    email: 'admin@codemar.com',
    password: 'senha123'
  })

  if (loginResult.success) {
    console.log('Login realizado:', loginResult.data?.user.name)
    const token = loginResult.data?.token

    // 2. Verificar token
    const user = await AuthService.authenticate(token!)
    console.log('Usuário autenticado:', user?.name)

    // 3. Verificar se é admin
    const admin = await AuthService.requireAdmin(token!)
    console.log('É admin?', !!admin)
  }

  // 4. Registro de novo usuário
  const registerResult = await AuthService.register({
    name: 'João Silva',
    email: 'joao@codemar.com',
    password: 'senha123',
    role: 'user',
    cpf: '12345678901',
    department: 'Diretoria de Administração'
  })

  if (registerResult.success) {
    console.log('Usuário registrado:', registerResult.data?.user.name)
  }
}

// ============================================================================
// EXEMPLOS DE GESTÃO DE CONTRATOS
// ============================================================================

export async function exemploContratos() {
  console.log('=== EXEMPLOS DE GESTÃO DE CONTRATOS ===')

  // 1. Listar contratos com filtros
  const contratos = await ContratoController.index({
    status: 'vigente',
    diretoria: 'Diretoria de Administração',
    per_page: 10,
    page: 1
  })

  if (contratos.success) {
    console.log(`Encontrados ${contratos.data?.count} contratos`)
    console.log('Primeiro contrato:', contratos.data?.data[0]?.numero_contrato)
  }

  // 2. Buscar contrato específico
  const contrato = await ContratoController.show('contrato-id')
  if (contrato.success) {
    console.log('Contrato encontrado:', contrato.data?.objeto)
  }

  // 3. Criar novo contrato
  const novoContrato = await ContratoController.store({
    file_import_id: 'import-id',
    numero_contrato: 'CONTRATO-2024-001',
    objeto: 'Prestação de serviços de consultoria',
    contratante: 'CODEMAR',
    contratado: 'Empresa XYZ Ltda',
    cnpj_contratado: '12345678000199',
    valor: 150000,
    data_inicio: '2024-01-01',
    data_fim: '2024-12-31',
    status: 'vigente',
    diretoria: 'Diretoria de Administração',
    processado: true
  })

  if (novoContrato.success) {
    console.log('Contrato criado:', novoContrato.data?.id)
  }

  // 4. Atualizar contrato
  const contratoAtualizado = await ContratoController.update('contrato-id', {
    status: 'encerrado',
    observacoes: 'Contrato finalizado conforme cronograma'
  })

  if (contratoAtualizado.success) {
    console.log('Contrato atualizado')
  }

  // 5. Estatísticas
  const stats = await ContratoController.stats({
    diretoria: 'Diretoria de Administração'
  })

  if (stats.success) {
    console.log('Estatísticas:', {
      total: stats.data?.total,
      vigentes: stats.data?.vigentes,
      valorTotal: stats.data?.valor_total
    })
  }

  // 6. Listar diretorias
  const diretorias = await ContratoController.diretorias()
  if (diretorias.success) {
    console.log('Diretorias disponíveis:', diretorias.data)
  }
}

// ============================================================================
// EXEMPLOS DE IMPORTATION DE ARQUIVOS
// ============================================================================

export async function exemploImportacao() {
  console.log('=== EXEMPLOS DE IMPORTAÇÃO DE ARQUIVOS ===')

  // 1. Listar importações
  const importacoes = await FileImportController.index({
    status: 'completed',
    file_type: 'excel',
    per_page: 20
  })

  if (importacoes.success) {
    console.log(`Encontradas ${importacoes.data?.total} importações`)
  }

  // 2. Upload de arquivo (simulado)
  const file = new File(['conteudo do arquivo'], 'contratos.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const uploadResult = await FileImportController.store({
    file,
    diretoria: 'Diretoria de Administração',
    userId: 'user-id'
  })

  if (uploadResult.success) {
    console.log('Arquivo importado:', uploadResult.data?.original_filename)
    console.log('Diretorias encontradas:', uploadResult.data?.diretorias_encontradas)
  }

  // 3. Buscar detalhes de importação
  const importacao = await FileImportController.show('import-id')
  if (importacao.success) {
    console.log('Status da importação:', importacao.data?.status)
    console.log('Registros processados:', importacao.data?.processed_records)
  }

  // 4. Buscar contratos de uma importação
  const contratosImportacao = await FileImportController.contratos('import-id', 1, 50)
  if (contratosImportacao.success) {
    console.log(`Contratos da importação: ${contratosImportacao.data?.total}`)
  }

  // 5. Buscar todos os contratos
  const todosContratos = await FileImportController.todosContratos()
  if (todosContratos.success) {
    console.log(`Total de contratos: ${todosContratos.data?.length}`)
  }

  // 6. Estatísticas de importação
  const statsImportacao = await FileImportController.stats()
  if (statsImportacao.success) {
    console.log('Estatísticas de importação:', statsImportacao.data)
  }
}

// ============================================================================
// EXEMPLOS DE ADMINISTRAÇÃO
// ============================================================================

export async function exemploAdministracao() {
  console.log('=== EXEMPLOS DE ADMINISTRAÇÃO ===')

  // 1. Dashboard administrativo
  const dashboard = await AdminController.dashboard()
  if (dashboard.success) {
    console.log('Dashboard:', {
      usuarios: dashboard.data?.users,
      importacoes: dashboard.data?.imports,
      contratos: dashboard.data?.contracts
    })
  }

  // 2. Listar usuários
  const usuarios = await AdminController.users({
    role: 'admin',
    active: 'true',
    per_page: 10
  })

  if (usuarios.success) {
    console.log(`Encontrados ${usuarios.data?.total} usuários`)
  }

  // 3. Criar usuário
  const novoUsuario = await AdminController.createUser({
    name: 'Maria Santos',
    email: 'maria@codemar.com',
    password: 'senha123',
    role: 'user',
    cpf: '98765432100',
    department: 'Diretoria Jurídica'
  })

  if (novoUsuario.success) {
    console.log('Usuário criado:', novoUsuario.data?.name)
  }

  // 4. Atualizar usuário
  const usuarioAtualizado = await AdminController.updateUser('user-id', {
    is_active: false,
    department: 'Diretoria de Operações'
  })

  if (usuarioAtualizado.success) {
    console.log('Usuário atualizado')
  }

  // 5. Relatórios de importação
  const relatorios = await AdminController.importReports({
    date_from: '2024-01-01',
    date_to: '2024-12-31',
    file_type: 'excel'
  })

  if (relatorios.success) {
    console.log('Relatórios:', relatorios.data?.imports.total)
  }
}

// ============================================================================
// EXEMPLOS DE USO DIRETO DOS MODELOS
// ============================================================================

export async function exemploModelos() {
  console.log('=== EXEMPLOS DE USO DIRETO DOS MODELOS ===')

  // 1. Usuários
  const totalUsuarios = await UserModel.count()
  console.log(`Total de usuários: ${totalUsuarios}`)

  const usuariosAtivos = await UserModel.countActive()
  console.log(`Usuários ativos: ${usuariosAtivos}`)

  const admins = await UserModel.countAdmins()
  console.log(`Administradores: ${admins}`)

  // 2. Importações
  const importacoesCompletas = await FileImportModel.countByStatus('completed')
  console.log(`Importações completas: ${importacoesCompletas}`)

  const arquivosPdf = await FileImportModel.countByFileType('pdf')
  console.log(`Arquivos PDF: ${arquivosPdf}`)

  // 3. Contratos
  const contratosProcessados = await ContratoImportadoModel.countProcessed()
  console.log(`Contratos processados: ${contratosProcessados}`)

  const diretorias = await ContratoImportadoModel.getDiretoriasEncontradas('import-id')
  console.log('Diretorias encontradas:', diretorias)
}

// ============================================================================
// EXEMPLO DE FLUXO COMPLETO
// ============================================================================

export async function exemploFluxoCompleto() {
  console.log('=== EXEMPLO DE FLUXO COMPLETO ===')

  try {
    // 1. Login
    const login = await AuthService.login({
      email: 'admin@codemar.com',
      password: 'senha123'
    })

    if (!login.success) {
      throw new Error('Falha no login')
    }

    const token = login.data!.token
    const user = login.data!.user

    console.log(`Usuário logado: ${user.name} (${user.role})`)

    // 2. Verificar se é admin
    const admin = await AuthService.requireAdmin(token)
    if (!admin) {
      throw new Error('Acesso negado - usuário não é admin')
    }

    // 3. Buscar estatísticas do dashboard
    const dashboard = await AdminController.dashboard()
    if (dashboard.success) {
      console.log('Dashboard carregado com sucesso')
    }

    // 4. Listar contratos vigentes
    const contratos = await ContratoController.index({
      status: 'vigente',
      per_page: 5
    })

    if (contratos.success) {
      console.log(`Encontrados ${contratos.data?.count} contratos vigentes`)
    }

    // 5. Buscar importações recentes
    const importacoes = await FileImportController.index({
      per_page: 5
    })

    if (importacoes.success) {
      console.log(`Encontradas ${importacoes.data?.total} importações`)
    }

    console.log('Fluxo completo executado com sucesso!')

  } catch (error) {
    console.error('Erro no fluxo completo:', error)
  }
}

// ============================================================================
// EXECUTAR EXEMPLOS
// ============================================================================

export async function executarTodosExemplos() {
  console.log('🚀 Iniciando exemplos do sistema Supabase...\n')

  await exemploAutenticacao()
  console.log('\n')

  await exemploContratos()
  console.log('\n')

  await exemploImportacao()
  console.log('\n')

  await exemploAdministracao()
  console.log('\n')

  await exemploModelos()
  console.log('\n')

  await exemploFluxoCompleto()
  console.log('\n')

  console.log('✅ Todos os exemplos executados!')
}

// Para executar os exemplos, descomente a linha abaixo:
// executarTodosExemplos()




