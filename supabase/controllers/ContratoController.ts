import { ContratoImportadoModel } from '../models/ContratoImportado';
import { Database } from '../types';

type ContratoImportado = Database['public']['Tables']['contratos_importados']['Row'];
type ContratoInsert = Database['public']['Tables']['contratos_importados']['Insert'];

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page?: number;
  per_page?: number;
  total_pages?: number;
}

export class ContratoController {
  /**
   * Lista todos os contratos
   */
  static async index(filters: any = {}): Promise<ApiResponse<PaginatedResponse<ContratoImportado>>> {
    try {
      const result = await ContratoImportadoModel.findAll(filters);
      const data = result.data;
      const count = result.total;
      
      return {
        success: true,
        data: { data, count }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Exibe um contrato específico
   */
  static async show(id: string): Promise<ApiResponse<ContratoImportado>> {
    try {
      const contrato = await ContratoImportadoModel.findById(id);
      
      if (!contrato) {
        return {
          success: false,
          message: 'Contrato não encontrado'
        }
      }

      return {
        success: true,
        data: contrato
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Cria um novo contrato
   */
  static async store(contratoData: ContratoInsert): Promise<ApiResponse<ContratoImportado>> {
    try {
      // Validação básica
      if (!contratoData.numero_contrato || !contratoData.objeto || !contratoData.contratante || !contratoData.contratado) {
        return {
          success: false,
          message: 'Dados obrigatórios não fornecidos',
          errors: {
            numero_contrato: !contratoData.numero_contrato ? ['Número do contrato é obrigatório'] : [],
            objeto: !contratoData.objeto ? ['Objeto é obrigatório'] : [],
            contratante: !contratoData.contratante ? ['Contratante é obrigatório'] : [],
            contratado: !contratoData.contratado ? ['Contratado é obrigatório'] : []
          }
        }
      }

      if (!contratoData.valor || contratoData.valor < 0) {
        return {
          success: false,
          message: 'Valor inválido',
          errors: {
            valor: ['Valor deve ser maior ou igual a zero']
          }
        }
      }

      if (!contratoData.data_inicio || !contratoData.data_fim) {
        return {
          success: false,
          message: 'Datas obrigatórias',
          errors: {
            data_inicio: !contratoData.data_inicio ? ['Data de início é obrigatória'] : [],
            data_fim: !contratoData.data_fim ? ['Data de fim é obrigatória'] : []
          }
        }
      }

      if (new Date(contratoData.data_fim) <= new Date(contratoData.data_inicio)) {
        return {
          success: false,
          message: 'Data de fim deve ser posterior à data de início',
          errors: {
            data_fim: ['Data de fim deve ser posterior à data de início']
          }
        }
      }

      if (!contratoData.status || !['vigente', 'encerrado', 'suspenso', 'rescindido'].includes(contratoData.status)) {
        return {
          success: false,
          message: 'Status inválido',
          errors: {
            status: ['Status deve ser: vigente, encerrado, suspenso ou rescindido']
          }
        }
      }

      const contrato = await ContratoImportadoModel.create({
        ...contratoData,
        processado: true // Contratos manuais são considerados processados
      })

      return {
        success: true,
        message: 'Contrato cadastrado com sucesso!',
        data: contrato
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Atualiza um contrato existente
   */
  static async update(id: string, contratoData: Partial<Omit<ContratoImportado, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<ContratoImportado>> {
    try {
      const contrato = await ContratoImportadoModel.findById(id)
      
      if (!contrato) {
        return {
          success: false,
          message: 'Contrato não encontrado'
        }
      }

      // Validações condicionais
      if (contratoData.valor !== undefined && contratoData.valor < 0) {
        return {
          success: false,
          message: 'Valor inválido',
          errors: {
            valor: ['Valor deve ser maior ou igual a zero']
          }
        }
      }

      if (contratoData.data_inicio && contratoData.data_fim && new Date(contratoData.data_fim) <= new Date(contratoData.data_inicio)) {
        return {
          success: false,
          message: 'Data de fim deve ser posterior à data de início',
          errors: {
            data_fim: ['Data de fim deve ser posterior à data de início']
          }
        }
      }

      if (contratoData.status && !['vigente', 'encerrado', 'suspenso', 'rescindido'].includes(contratoData.status)) {
        return {
          success: false,
          message: 'Status inválido',
          errors: {
            status: ['Status deve ser: vigente, encerrado, suspenso ou rescindido']
          }
        }
      }

      const updatedContrato = await ContratoImportadoModel.update(id, contratoData)

      return {
        success: true,
        message: 'Contrato atualizado com sucesso!',
        data: updatedContrato
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Remove um contrato
   */
  static async destroy(id: string): Promise<ApiResponse<null>> {
    try {
      const contrato = await ContratoImportadoModel.findById(id)
      
      if (!contrato) {
        return {
          success: false,
          message: 'Contrato não encontrado'
        }
      }

      await ContratoImportadoModel.delete(id)

      return {
        success: true,
        message: 'Contrato removido com sucesso!'
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Estatísticas dos contratos
   */
  static async stats(filters: { diretoria?: string } = {}): Promise<ApiResponse<any>> {
    try {
      const stats = await ContratoImportadoModel.getStats(filters)
      
      return {
        success: true,
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Lista todas as diretorias disponíveis
   */
  static async diretorias(): Promise<ApiResponse<string[]>> {
    try {
      const diretorias = await ContratoImportadoModel.getDiretorias()
      
      return {
        success: true,
        data: diretorias
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }
}
