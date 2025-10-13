import { FileImportModel } from '../models/FileImport'
import { ContratoImportadoModel } from '../models/ContratoImportado'
import { FileImport, ApiResponse } from '../types'
import { ExcelProcessor } from './processors/ExcelProcessor'
import { CsvProcessor } from './processors/CsvProcessor'
import { XmlProcessor } from './processors/XmlProcessor'
import { PdfProcessor } from './processors/PdfProcessor'

export interface ProcessorInterface {
  process(fileImport: FileImport, diretoria?: string): Promise<void>
  setDiretoria?(diretoria: string): void
}

export class FileImportService {
  /**
   * Faz upload e cria registro de importação
   */
  static async uploadFile(file: File, userId?: string): Promise<FileImport> {
    // Determina o tipo de arquivo
    const fileType = this.determineFileType(file)
    
    // Gera nome único para o arquivo
    const storedFilename = `${Date.now()}_${file.name}`
    
    // Upload real para Supabase Storage
    const filePath = await this.uploadToStorage(file, storedFilename)
    
    // Cria registro no banco
    return await FileImportModel.create({
      original_filename: file.name,
      stored_filename: storedFilename,
      file_path: filePath,
      file_type: fileType,
      user_id: userId || 'system',
      status: 'pending',
      total_records: 0,
      processed_records: 0,
      successful_records: 0,
      failed_records: 0,
      metadata: {
        file_size: file.size,
        mime_type: file.type,
        uploaded_at: new Date().toISOString()
      }
    })
  }

  /**
   * Faz upload do arquivo para o Supabase Storage
   */
  private static async uploadToStorage(file: File, filename: string): Promise<string> {
    try {
      // Em produção, você usaria o cliente Supabase para fazer upload
      // Por enquanto, simulamos o upload
      const filePath = `imports/${filename}`
      
      console.log(`Uploading file ${filename} to ${filePath}`)
      
      // Simular upload (em produção, usar supabase.storage.from('imports').upload())
      return filePath
    } catch (error) {
      throw new Error(`Erro ao fazer upload do arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  /**
   * Processa o arquivo importado
   */
  static async processFile(fileImport: FileImport, diretoria?: string): Promise<void> {
    try {
      await FileImportModel.markAsStarted(fileImport.id)

      const processor = this.getProcessor(fileImport.file_type)
      
      // Para PDFs, sempre passa a diretoria (obrigatória)
      // Para Excel, só passa se não houver diretoria no arquivo
      if (diretoria && 'setDiretoria' in processor) {
        if (fileImport.file_type === 'pdf') {
          // PDF sempre usa diretoria externa
          (processor as any).setDiretoria(diretoria)
        } else {
          // Excel usa diretoria externa apenas como fallback
          (processor as any).setDiretoria(diretoria)
        }
      }
      
      await processor.process(fileImport, diretoria)

      // Para PDFs, garante que todos os contratos tenham a diretoria definida
      // Para Excel, não força - deixa como está no arquivo
      if (diretoria && fileImport.file_type === 'pdf') {
        const contratos = await ContratoImportadoModel.findByFileImport(fileImport.id)
        for (const contrato of contratos) {
          if (!contrato.diretoria) {
            await ContratoImportadoModel.update(contrato.id, { diretoria })
          }
        }
      }

      await FileImportModel.markAsCompleted(fileImport.id)
    } catch (error) {
      await FileImportModel.markAsFailed(
        fileImport.id,
        error instanceof Error ? error.message : 'Erro desconhecido'
      )
      throw error
    }
  }

  /**
   * Determina o tipo do arquivo baseado na extensão
   */
  private static determineFileType(file: File): 'csv' | 'excel' | 'xml' | 'pdf' {
    const extension = file.name.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'xml':
        return 'xml'
      case 'xlsx':
      case 'xls':
        return 'excel'
      case 'csv':
        return 'csv'
      case 'pdf':
        return 'pdf'
      default:
        throw new Error(`Tipo de arquivo não suportado: ${extension}`)
    }
  }

  /**
   * Retorna o processador apropriado para o tipo de arquivo
   */
  private static getProcessor(fileType: string): ProcessorInterface {
    switch (fileType) {
      case 'xml':
        return new XmlProcessor()
      case 'excel':
        return new ExcelProcessor()
      case 'csv':
        return new CsvProcessor()
      case 'pdf':
        return new PdfProcessor()
      default:
        throw new Error(`Processador não encontrado para: ${fileType}`)
    }
  }

  /**
   * Lista todas as importações
   */
  static async listImports(filters: {
    status?: string
    file_type?: string
    per_page?: number
  } = {}): Promise<ApiResponse<any>> {
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
   * Obtém detalhes de uma importação
   */
  static async getImportDetails(importId: string): Promise<FileImport> {
    const importData = await FileImportModel.findById(importId)
    
    if (!importData) {
      throw new Error('Importação não encontrada')
    }

    return importData
  }

  /**
   * Deleta uma importação e seus dados
   */
  static async deleteImport(importId: string): Promise<void> {
    const importData = await FileImportModel.findById(importId)
    
    if (!importData) {
      throw new Error('Importação não encontrada')
    }
    
    // Em um ambiente real, aqui você deletaria o arquivo do Supabase Storage
    // Por enquanto, apenas deletamos o registro
    
    // Delete o registro (cascata deletará os contratos)
    await FileImportModel.delete(importId)
  }
}

