import * as Papa from 'papaparse';
import { FileImport, ContratoImportado } from '../../types';
import { ContratoImportadoModel } from '../../models/ContratoImportado';

export class CsvProcessor {
  private diretoria?: string;

  setDiretoria(diretoria: string): void {
    this.diretoria = diretoria;
  }

  async process(fileImport: FileImport, diretoria?: string): Promise<void> {
    try {
      // Em produção, você faria o download do arquivo do Supabase Storage
      // Por enquanto, vamos simular o processamento com dados reais
      
      const csvData = await this.readCsvFile(fileImport.file_path);
      
      if (!csvData || csvData.length === 0) {
        throw new Error('Arquivo CSV vazio ou inválido');
      }

      // Primeira linha contém cabeçalhos
      const headers = csvData[0];
      const rows = csvData.slice(1);

      // Normalizar cabeçalhos
      const normalizedHeaders = this.normalizeHeaders(headers);

      let totalRecords = rows.length;
      let successfulRecords = 0;
      let failedRecords = 0;

      // Processar cada linha
      for (let i = 0; i < rows.length; i++) {
        try {
          const row = rows[i];
          const contratoData = this.mapRowToContrato(row, normalizedHeaders, fileImport, diretoria);
          
          await ContratoImportadoModel.create(contratoData as any);
          successfulRecords++;
        } catch (error) {
          failedRecords++;
          console.error(`Erro ao processar linha ${i + 2}:`, error);
        }
      }

      // Atualizar contadores
      await this.updateFileImportCounters(fileImport.id, totalRecords, successfulRecords, failedRecords);

    } catch (error) {
      throw new Error(`Erro ao processar arquivo CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private async readCsvFile(filePath: string): Promise<string[][]> {
    // Em produção, você faria o download do arquivo do Supabase Storage
    // Por enquanto, vamos simular com dados reais baseados no Laravel
    
    return new Promise((resolve) => {
      // Simular dados reais de CSV baseados nos contratos migrados
      const mockCsvData = this.generateMockCsvData();
      
      // Simular parsing do CSV
      setTimeout(() => {
        resolve(mockCsvData);
      }, 100);
    });
  }

  private generateMockCsvData(): string[][] {
    // Gerar dados baseados nos contratos reais migrados do Laravel
    return [
      // Cabeçalhos
      ['ano_numero', 'numero_contrato', 'ano', 'pa', 'diretoria', 'modalidade', 'nome_empresa', 'cnpj_empresa', 'objeto', 'data_assinatura', 'prazo', 'unidade_prazo', 'valor_contrato', 'vencimento', 'gestor_contrato', 'fiscal_tecnico', 'fiscal_administrativo', 'suplente', 'contratante', 'contratado', 'cnpj_contratado', 'valor', 'data_inicio', 'data_fim', 'status', 'tipo_contrato', 'secretaria', 'fonte_recurso', 'observacoes'],
      // Dados reais baseados nos contratos migrados
      ['2018.37', '37', '2018', '12871/2018', 'MERCADO E PARCERIAS', 'ADESÃO A ATA - SRP', 'TS CONSULTORIA EMPRESARIAL LTDA', '06.033.739/0001-86', 'CONSULTORIA PROJETOS', '2023-07-13', '12', 'meses', '12535373.49', '2023-07-13', 'MARGARETH RAQUEL MIGUEL', '', 'CAMILA DA COSTA ANHAIA', 'MARIANA RIBEIRO SORRENTINO VALENTIM', 'CODEMAR', 'TS CONSULTORIA EMPRESARIAL LTDA', '06.033.739/0001-86', '12535373.49', '2023-07-13', '2023-07-13', 'ENCERRADO', '', 'MERCADO E PARCERIAS', '', ''],
      ['2018.40', '40', '2018', '17875/2018', 'ADMINISTRAÇÃO E FINANÇAS', 'PROCEDIMENTO LICITATORIO', 'NOVO HORIZONTE JACAREPAGUA', '00.185.997/0001-00', 'USO DE ATA - LOCAÇÃO DE CONTAINER PARA CODEMAR', '2023-08-23', '12', 'meses', '62702.40', '2023-08-23', 'RODRIGO DE LIMA CORREIA', '', 'JANAINA SOUZA DA CONCEIÇÃO', 'BÁRBARA ALINE SOUZA TELLES', 'CODEMAR', 'NOVO HORIZONTE JACAREPAGUA', '00.185.997/0001-00', '62702.40', '2023-08-23', '2023-08-23', 'ENCERRADO', '', 'ADMINISTRAÇÃO E FINANÇAS', '', ''],
      ['2018.43', '43', '2018', '17792/2018', 'OPERAÇÕES', 'USO DE ATA - SRP', 'NUCTECH DO BRASIL LTDA', '19.892.624/0001-99', 'LOCAÇÃO DE EQUIPAMENTOS DE RAIO-X', '2023-08-28', '12', 'meses', '66368.40', '2023-08-28', 'BRUNO MARINHO DE OLIVEIRA LOPES', '', 'ROBERTA SANTOS DA SILVA', 'FREDERICO MATTOS FERREIRA AZEREDO', 'CODEMAR', 'NUCTECH DO BRASIL LTDA', '19.892.624/0001-99', '66368.40', '2023-08-28', '2023-08-28', 'ENCERRADO', '', 'OPERAÇÕES', '', '']
    ];
  }

  private normalizeHeaders(headers: string[]): string[] {
    return headers.map(header => {
      if (!header) return '';
      
      return header
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    });
  }

  private mapRowToContrato(row: string[], headers: string[], fileImport: FileImport, diretoria?: string): Partial<ContratoImportado> {
    const contratoData: any = {
      file_import_id: fileImport.id,
      processado: true,
      dados_originais: {}
    };

    // Mapear cada campo
    headers.forEach((header, index) => {
      const value = row[index];
      
      switch (header) {
        case 'ano_numero':
          contratoData.ano_numero = value?.toString();
          break;
        case 'numero_contrato':
          contratoData.numero_contrato = value?.toString();
          break;
        case 'ano':
          contratoData.ano = parseInt(value) || null;
          break;
        case 'pa':
          contratoData.pa = value?.toString();
          break;
        case 'diretoria':
          contratoData.diretoria = value?.toString() || this.diretoria || diretoria;
          break;
        case 'modalidade':
          contratoData.modalidade = value?.toString();
          break;
        case 'nome_empresa':
          contratoData.nome_empresa = value?.toString();
          break;
        case 'cnpj_empresa':
          contratoData.cnpj_empresa = value?.toString();
          break;
        case 'objeto':
          contratoData.objeto = value?.toString();
          break;
        case 'data_assinatura':
          contratoData.data_assinatura = this.parseDate(value);
          break;
        case 'prazo':
          contratoData.prazo = parseInt(value) || null;
          break;
        case 'unidade_prazo':
          contratoData.unidade_prazo = value?.toString();
          break;
        case 'valor_contrato':
          contratoData.valor_contrato = parseFloat(value) || null;
          break;
        case 'vencimento':
          contratoData.vencimento = this.parseDate(value);
          break;
        case 'gestor_contrato':
          contratoData.gestor_contrato = value?.toString();
          break;
        case 'fiscal_tecnico':
          contratoData.fiscal_tecnico = value?.toString();
          break;
        case 'fiscal_administrativo':
          contratoData.fiscal_administrativo = value?.toString();
          break;
        case 'suplente':
          contratoData.suplente = value?.toString();
          break;
        case 'contratante':
          contratoData.contratante = value?.toString() || 'CODEMAR';
          break;
        case 'contratado':
          contratoData.contratado = value?.toString();
          break;
        case 'cnpj_contratado':
          contratoData.cnpj_contratado = value?.toString();
          break;
        case 'valor':
          contratoData.valor = parseFloat(value) || null;
          break;
        case 'data_inicio':
          contratoData.data_inicio = this.parseDate(value);
          break;
        case 'data_fim':
          contratoData.data_fim = this.parseDate(value);
          break;
        case 'status':
          contratoData.status = this.mapStatus(value?.toString());
          break;
        case 'tipo_contrato':
          contratoData.tipo_contrato = value?.toString();
          break;
        case 'secretaria':
          contratoData.secretaria = value?.toString();
          break;
        case 'fonte_recurso':
          contratoData.fonte_recurso = value?.toString();
          break;
        case 'observacoes':
          contratoData.observacoes = value?.toString();
          break;
        default:
          // Armazenar campos não mapeados nos dados originais
          contratoData.dados_originais[header] = value;
      }
    });

    return contratoData;
  }

  private parseDate(value: string | undefined): string | null {
    if (!value || value.trim() === '') return null;
    
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  private mapStatus(status: string | undefined): string | null {
    if (!status) return null;
    
    const statusMapping: Record<string, string> = {
      'VIGENTE': 'vigente',
      'ENCERRADO': 'encerrado',
      'ENCERRAOD': 'encerrado',
      'EMCERRADO': 'encerrado',
      'PARALISADO': 'suspenso',
      'CONTRATO SUSPENSO POR PERIODO DETERMINADO': 'suspenso',
      'RESCISÃO CONTRATUAL': 'rescindido',
      'ENCERRADO/RESCINDIDO': 'rescindido',
      'CANCELADO': 'rescindido',
      'RENOVAÇÃO EM ANDAMENTO': 'vigente',
      'AGUARDANDO PUBLICAÇÃO': 'vigente'
    };

    const upperStatus = status.toUpperCase().trim();
    return statusMapping[upperStatus] || 'vigente';
  }

  private async updateFileImportCounters(fileImportId: string, total: number, successful: number, failed: number): Promise<void> {
    // Atualizar contadores no banco
    // Em produção, você usaria o FileImportModel.update()
    console.log(`Atualizando contadores: Total: ${total}, Sucesso: ${successful}, Falhas: ${failed}`);
  }
}

