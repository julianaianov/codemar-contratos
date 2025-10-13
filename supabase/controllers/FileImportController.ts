import { FileImportModel } from '../models/FileImport'
import { ContratoImportadoModel } from '../models/ContratoImportado'
import { FileImportService } from '../services/FileImportService'
import { ImportFilters, ApiResponse, PaginatedResponse, FileImport } from '../types'

export class FileImportController {
  /**
   * Lista todas as importações
   */
  static async index(filters: ImportFilters = {}): Promise<ApiResponse<PaginatedResponse<FileImport>>> {
    try {
      const imports = await FileImportModel.findAll(filters)
      
      return {
        success: true,
        data: imports
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao listar importações',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Faz upload e processa arquivo
   */
  static async store(fileData: {
    file: File
    diretoria?: string
    userId?: string
  }): Promise<ApiResponse<FileImport & {
    diretorias_encontradas: string[]
    total_diretorias: number
    diretoria_principal?: string
  }>> {
    try {
      const { file, diretoria, userId } = fileData

      // Validação do arquivo
      if (!file) {
        return {
          success: false,
          message: 'Arquivo é obrigatório',
          errors: {
            file: ['Arquivo é obrigatório']
          }
        }
      }

      // Verificar tipo de arquivo
      const allowedTypes = ['xml', 'xlsx', 'xls', 'csv', 'pdf']
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        return {
          success: false,
          message: 'Tipo de arquivo não suportado',
          errors: {
            file: ['Tipos suportados: XML, Excel, CSV, PDF']
          }
        }
      }

      // Verificar tamanho do arquivo (20MB)
      const maxSize = 20 * 1024 * 1024
      if (file.size > maxSize) {
        return {
          success: false,
          message: 'Arquivo muito grande',
          errors: {
            file: ['Tamanho máximo: 20MB']
          }
        }
      }

      // Para PDFs, diretoria é obrigatória
      if (fileExtension === 'pdf' && !diretoria) {
        return {
          success: false,
          message: 'Para arquivos PDF, a diretoria é obrigatória',
          errors: {
            diretoria: ['A diretoria é obrigatória para arquivos PDF']
          }
        }
      }

      // Criar registro de importação usando FileImportService
      const fileImport = await FileImportService.uploadFile(file, userId)

      // Processar o arquivo usando o FileImportService
      await FileImportService.processFile(fileImport, diretoria)

      // Buscar diretorias encontradas nos contratos importados
      const diretoriasEncontradas = await ContratoImportadoModel.getDiretoriasEncontradas(fileImport.id)
      const diretoriasArray = diretoriasEncontradas.map(d => d.diretoria)

      const response = {
        success: true,
        message: 'Arquivo importado com sucesso',
        data: {
          ...fileImport,
          diretorias_encontradas: diretoriasArray,
          total_diretorias: diretoriasArray.length,
          diretoria_principal: diretoriasArray[0]
        }
      }

      return response
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao processar arquivo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Retorna detalhes de uma importação
   */
  static async show(id: string): Promise<ApiResponse<FileImport>> {
    try {
      const importData = await FileImportModel.findById(id)
      
      if (!importData) {
        return {
          success: false,
          message: 'Importação não encontrada'
        }
      }

      return {
        success: true,
        data: importData
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao buscar importação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Deleta uma importação
   */
  static async destroy(id: string): Promise<ApiResponse<null>> {
    try {
      const importData = await FileImportModel.findById(id)
      
      if (!importData) {
        return {
          success: false,
          message: 'Importação não encontrada'
        }
      }

      await FileImportModel.delete(id)

      return {
        success: true,
        message: 'Importação deletada com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao deletar importação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Retorna contratos de uma importação
   */
  static async contratos(id: string, page: number = 1, perPage: number = 50): Promise<ApiResponse<PaginatedResponse<any>>> {
    try {
      const importData = await FileImportModel.findById(id)
      
      if (!importData) {
        return {
          success: false,
          message: 'Importação não encontrada'
        }
      }

      const contratos = await FileImportModel.getContratos(id, page, perPage)

      return {
        success: true,
        data: contratos
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao buscar contratos da importação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Retorna TODOS os contratos importados
   */
  static async todosContratos(): Promise<ApiResponse<any[]>> {
    try {
      const contratos = await ContratoImportadoModel.findAllWithFileInfo()

      const processedContratos = contratos.map(contrato => ({
        id: contrato.id,
        file_import_id: contrato.file_import_id,
        arquivo_original: (contrato as any).file_imports?.original_filename || 'N/A',
        tipo_arquivo: (contrato as any).file_imports?.file_type || 'N/A',
        // Novos campos específicos
        ano_numero: contrato.ano_numero,
        numero_contrato: contrato.numero_contrato,
        ano: contrato.ano,
        pa: contrato.pa,
        diretoria: contrato.diretoria,
        modalidade: contrato.modalidade,
        nome_empresa: contrato.nome_empresa,
        cnpj_empresa: contrato.cnpj_empresa,
        objeto: contrato.objeto,
        data_assinatura: contrato.data_assinatura,
        prazo: contrato.prazo,
        unidade_prazo: contrato.unidade_prazo,
        valor_contrato: contrato.valor_contrato,
        vencimento: contrato.vencimento,
        gestor_contrato: contrato.gestor_contrato,
        fiscal_tecnico: contrato.fiscal_tecnico,
        fiscal_administrativo: contrato.fiscal_administrativo,
        suplente: contrato.suplente,
        // Campos legados para compatibilidade
        contratante: contrato.contratante,
        contratado: contrato.contratado,
        cnpj_contratado: contrato.cnpj_contratado,
        valor: contrato.valor,
        data_inicio: contrato.data_inicio,
        data_fim: contrato.data_fim,
        status: contrato.status,
        tipo_contrato: contrato.tipo_contrato,
        secretaria: contrato.secretaria,
        fonte_recurso: contrato.fonte_recurso,
        pdf_path: contrato.pdf_path,
        texto_extraido: contrato.dados_originais?.texto_extraido_ocr || contrato.dados_originais?.texto_extraido || null,
        metodo: contrato.dados_originais?.metodo || 'texto',
        created_at: contrato.created_at
      }))

      return {
        success: true,
        data: processedContratos
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao buscar contratos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Retorna estatísticas das importações
   */
  static async stats(): Promise<ApiResponse<{
    total_imports: number
    pending: number
    processing: number
    completed: number
    failed: number
    total_contratos: number
  }>> {
    try {
      const [
        totalImports,
        pending,
        processing,
        completed,
        failed,
        totalContratos
      ] = await Promise.all([
        FileImportModel.findAll().then(result => result.total),
        FileImportModel.countByStatus('pending'),
        FileImportModel.countByStatus('processing'),
        FileImportModel.countByStatus('completed'),
        FileImportModel.countByStatus('failed'),
        ContratoImportadoModel.findAll().then(result => result.total)
      ])

      const stats = {
        total_imports: totalImports,
        pending,
        processing,
        completed,
        failed,
        total_contratos: totalContratos
      }

      return {
        success: true,
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Simula o processamento de um arquivo
   */
  private static async processFile(fileImport: FileImport, diretoria?: string): Promise<void> {
    try {
      // Marcar como iniciado
      await FileImportModel.markAsStarted(fileImport.id)

      // Simular processamento baseado no tipo de arquivo
      let totalRecords = 0
      let successfulRecords = 0
      let failedRecords = 0

      switch (fileImport.file_type) {
        case 'csv':
          totalRecords = Math.floor(Math.random() * 100) + 10
          successfulRecords = Math.floor(totalRecords * 0.9)
          failedRecords = totalRecords - successfulRecords
          break
        case 'excel':
          totalRecords = Math.floor(Math.random() * 200) + 20
          successfulRecords = Math.floor(totalRecords * 0.95)
          failedRecords = totalRecords - successfulRecords
          break
        case 'xml':
          totalRecords = Math.floor(Math.random() * 50) + 5
          successfulRecords = Math.floor(totalRecords * 0.85)
          failedRecords = totalRecords - successfulRecords
          break
        case 'pdf':
          totalRecords = Math.floor(Math.random() * 10) + 1
          successfulRecords = Math.floor(totalRecords * 0.8)
          failedRecords = totalRecords - successfulRecords
          break
      }

      // Criar contratos simulados
      for (let i = 0; i < successfulRecords; i++) {
        await ContratoImportadoModel.create({
          file_import_id: fileImport.id,
          numero_contrato: `CONTRATO-${Date.now()}-${i}`,
          objeto: `Objeto do contrato ${i + 1}`,
          contratante: 'CODEMAR',
          contratado: `Empresa ${i + 1}`,
          cnpj_contratado: `${Math.floor(Math.random() * 90000000000000) + 10000000000000}`,
          valor: Math.floor(Math.random() * 1000000) + 10000,
          data_inicio: new Date().toISOString().split('T')[0],
          data_fim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'vigente',
          diretoria: diretoria || 'Diretoria de Administração',
          processado: true,
          dados_originais: {
            linha: i + 1,
            arquivo: fileImport.original_filename
          }
        })
      }

      // Atualizar estatísticas da importação
      await FileImportModel.update(fileImport.id, {
        total_records: totalRecords,
        processed_records: totalRecords,
        successful_records: successfulRecords,
        failed_records: failedRecords,
        status: 'completed',
        completed_at: new Date().toISOString()
      })

    } catch (error) {
      // Marcar como falho
      await FileImportModel.markAsFailed(
        fileImport.id,
        error instanceof Error ? error.message : 'Erro desconhecido no processamento'
      )
    }
  }
}




