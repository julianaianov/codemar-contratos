import * as xml2js from 'xml2js';
import { FileImport, ContratoImportado } from '../../types';
import { ContratoImportadoModel } from '../../models/ContratoImportado';

export class XmlProcessor {
  private diretoria?: string;

  setDiretoria(diretoria: string): void {
    this.diretoria = diretoria;
  }

  async process(fileImport: FileImport, diretoria?: string): Promise<void> {
    try {
      // Em produção, você faria o download do arquivo do Supabase Storage
      // Por enquanto, vamos simular o processamento com dados reais
      
      const xmlData = await this.readXmlFile(fileImport.file_path);
      const parsedData = await this.parseXmlData(xmlData);
      
      if (!parsedData || !parsedData.contratos || !parsedData.contratos.contrato) {
        throw new Error('Arquivo XML vazio ou estrutura inválida');
      }

      const contratos = Array.isArray(parsedData.contratos.contrato) 
        ? parsedData.contratos.contrato 
        : [parsedData.contratos.contrato];

      let totalRecords = contratos.length;
      let successfulRecords = 0;
      let failedRecords = 0;

      // Processar cada contrato
      for (let i = 0; i < contratos.length; i++) {
        try {
          const contratoXml = contratos[i];
          const contratoData = this.mapXmlToContrato(contratoXml, fileImport, diretoria);
          
          await ContratoImportadoModel.create(contratoData as any);
          successfulRecords++;
        } catch (error) {
          failedRecords++;
          console.error(`Erro ao processar contrato ${i + 1}:`, error);
        }
      }

      // Atualizar contadores
      await this.updateFileImportCounters(fileImport.id, totalRecords, successfulRecords, failedRecords);

    } catch (error) {
      throw new Error(`Erro ao processar arquivo XML: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private async readXmlFile(filePath: string): Promise<string> {
    // Em produção, você faria o download do arquivo do Supabase Storage
    // Por enquanto, vamos simular com dados reais baseados no Laravel
    
    return new Promise((resolve) => {
      // Simular dados reais de XML baseados nos contratos migrados
      const mockXmlData = this.generateMockXmlData();
      
      setTimeout(() => {
        resolve(mockXmlData);
      }, 100);
    });
  }

  private generateMockXmlData(): string {
    // Gerar XML baseado nos contratos reais migrados do Laravel
    return `<?xml version="1.0" encoding="UTF-8"?>
<contratos>
  <contrato>
    <ano_numero>2018.37</ano_numero>
    <numero_contrato>37</numero_contrato>
    <ano>2018</ano>
    <pa>12871/2018</pa>
    <diretoria>MERCADO E PARCERIAS</diretoria>
    <modalidade>ADESÃO A ATA - SRP</modalidade>
    <nome_empresa>TS CONSULTORIA EMPRESARIAL LTDA</nome_empresa>
    <cnpj_empresa>06.033.739/0001-86</cnpj_empresa>
    <objeto>CONSULTORIA PROJETOS</objeto>
    <data_assinatura>2023-07-13</data_assinatura>
    <prazo>12</prazo>
    <unidade_prazo>meses</unidade_prazo>
    <valor_contrato>12535373.49</valor_contrato>
    <vencimento>2023-07-13</vencimento>
    <gestor_contrato>MARGARETH RAQUEL MIGUEL</gestor_contrato>
    <fiscal_tecnico></fiscal_tecnico>
    <fiscal_administrativo>CAMILA DA COSTA ANHAIA</fiscal_administrativo>
    <suplente>MARIANA RIBEIRO SORRENTINO VALENTIM</suplente>
    <contratante>CODEMAR</contratante>
    <contratado>TS CONSULTORIA EMPRESARIAL LTDA</contratado>
    <cnpj_contratado>06.033.739/0001-86</cnpj_contratado>
    <valor>12535373.49</valor>
    <data_inicio>2023-07-13</data_inicio>
    <data_fim>2023-07-13</data_fim>
    <status>ENCERRADO</status>
    <tipo_contrato></tipo_contrato>
    <secretaria>MERCADO E PARCERIAS</secretaria>
    <fonte_recurso></fonte_recurso>
    <observacoes></observacoes>
  </contrato>
  <contrato>
    <ano_numero>2018.40</ano_numero>
    <numero_contrato>40</numero_contrato>
    <ano>2018</ano>
    <pa>17875/2018</pa>
    <diretoria>ADMINISTRAÇÃO E FINANÇAS</diretoria>
    <modalidade>PROCEDIMENTO LICITATORIO</modalidade>
    <nome_empresa>NOVO HORIZONTE JACAREPAGUA</nome_empresa>
    <cnpj_empresa>00.185.997/0001-00</cnpj_empresa>
    <objeto>USO DE ATA - LOCAÇÃO DE CONTAINER PARA CODEMAR</objeto>
    <data_assinatura>2023-08-23</data_assinatura>
    <prazo>12</prazo>
    <unidade_prazo>meses</unidade_prazo>
    <valor_contrato>62702.40</valor_contrato>
    <vencimento>2023-08-23</vencimento>
    <gestor_contrato>RODRIGO DE LIMA CORREIA</gestor_contrato>
    <fiscal_tecnico></fiscal_tecnico>
    <fiscal_administrativo>JANAINA SOUZA DA CONCEIÇÃO</fiscal_administrativo>
    <suplente>BÁRBARA ALINE SOUZA TELLES</suplente>
    <contratante>CODEMAR</contratante>
    <contratado>NOVO HORIZONTE JACAREPAGUA</contratado>
    <cnpj_contratado>00.185.997/0001-00</cnpj_contratado>
    <valor>62702.40</valor>
    <data_inicio>2023-08-23</data_inicio>
    <data_fim>2023-08-23</data_fim>
    <status>ENCERRADO</status>
    <tipo_contrato></tipo_contrato>
    <secretaria>ADMINISTRAÇÃO E FINANÇAS</secretaria>
    <fonte_recurso></fonte_recurso>
    <observacoes></observacoes>
  </contrato>
  <contrato>
    <ano_numero>2018.43</ano_numero>
    <numero_contrato>43</numero_contrato>
    <ano>2018</ano>
    <pa>17792/2018</pa>
    <diretoria>OPERAÇÕES</diretoria>
    <modalidade>USO DE ATA - SRP</modalidade>
    <nome_empresa>NUCTECH DO BRASIL LTDA</nome_empresa>
    <cnpj_empresa>19.892.624/0001-99</cnpj_empresa>
    <objeto>LOCAÇÃO DE EQUIPAMENTOS DE RAIO-X</objeto>
    <data_assinatura>2023-08-28</data_assinatura>
    <prazo>12</prazo>
    <unidade_prazo>meses</unidade_prazo>
    <valor_contrato>66368.40</valor_contrato>
    <vencimento>2023-08-28</vencimento>
    <gestor_contrato>BRUNO MARINHO DE OLIVEIRA LOPES</gestor_contrato>
    <fiscal_tecnico></fiscal_tecnico>
    <fiscal_administrativo>ROBERTA SANTOS DA SILVA</fiscal_administrativo>
    <suplente>FREDERICO MATTOS FERREIRA AZEREDO</suplente>
    <contratante>CODEMAR</contratante>
    <contratado>NUCTECH DO BRASIL LTDA</contratado>
    <cnpj_contratado>19.892.624/0001-99</cnpj_contratado>
    <valor>66368.40</valor>
    <data_inicio>2023-08-28</data_inicio>
    <data_fim>2023-08-28</data_fim>
    <status>ENCERRADO</status>
    <tipo_contrato></tipo_contrato>
    <secretaria>OPERAÇÕES</secretaria>
    <fonte_recurso></fonte_recurso>
    <observacoes></observacoes>
  </contrato>
</contratos>`;
  }

  private async parseXmlData(xmlData: string): Promise<any> {
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true
    });

    return new Promise((resolve, reject) => {
      parser.parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  private mapXmlToContrato(contratoXml: any, fileImport: FileImport, diretoria?: string): Partial<ContratoImportado> {
    const contratoData: any = {
      file_import_id: fileImport.id,
      processado: true,
      dados_originais: contratoXml
    };

    // Mapear campos do XML
    contratoData.ano_numero = this.getXmlValue(contratoXml, 'ano_numero');
    contratoData.numero_contrato = this.getXmlValue(contratoXml, 'numero_contrato');
    contratoData.ano = parseInt(this.getXmlValue(contratoXml, 'ano')) || null;
    contratoData.pa = this.getXmlValue(contratoXml, 'pa');
    contratoData.diretoria = this.getXmlValue(contratoXml, 'diretoria') || this.diretoria || diretoria;
    contratoData.modalidade = this.getXmlValue(contratoXml, 'modalidade');
    contratoData.nome_empresa = this.getXmlValue(contratoXml, 'nome_empresa');
    contratoData.cnpj_empresa = this.getXmlValue(contratoXml, 'cnpj_empresa');
    contratoData.objeto = this.getXmlValue(contratoXml, 'objeto');
    contratoData.data_assinatura = this.parseDate(this.getXmlValue(contratoXml, 'data_assinatura'));
    contratoData.prazo = parseInt(this.getXmlValue(contratoXml, 'prazo')) || null;
    contratoData.unidade_prazo = this.getXmlValue(contratoXml, 'unidade_prazo');
    contratoData.valor_contrato = parseFloat(this.getXmlValue(contratoXml, 'valor_contrato')) || null;
    contratoData.vencimento = this.parseDate(this.getXmlValue(contratoXml, 'vencimento'));
    contratoData.gestor_contrato = this.getXmlValue(contratoXml, 'gestor_contrato');
    contratoData.fiscal_tecnico = this.getXmlValue(contratoXml, 'fiscal_tecnico');
    contratoData.fiscal_administrativo = this.getXmlValue(contratoXml, 'fiscal_administrativo');
    contratoData.suplente = this.getXmlValue(contratoXml, 'suplente');
    contratoData.contratante = this.getXmlValue(contratoXml, 'contratante') || 'CODEMAR';
    contratoData.contratado = this.getXmlValue(contratoXml, 'contratado');
    contratoData.cnpj_contratado = this.getXmlValue(contratoXml, 'cnpj_contratado');
    contratoData.valor = parseFloat(this.getXmlValue(contratoXml, 'valor')) || null;
    contratoData.data_inicio = this.parseDate(this.getXmlValue(contratoXml, 'data_inicio'));
    contratoData.data_fim = this.parseDate(this.getXmlValue(contratoXml, 'data_fim'));
    contratoData.status = this.mapStatus(this.getXmlValue(contratoXml, 'status'));
    contratoData.tipo_contrato = this.getXmlValue(contratoXml, 'tipo_contrato');
    contratoData.secretaria = this.getXmlValue(contratoXml, 'secretaria');
    contratoData.fonte_recurso = this.getXmlValue(contratoXml, 'fonte_recurso');
    contratoData.observacoes = this.getXmlValue(contratoXml, 'observacoes');

    return contratoData;
  }

  private getXmlValue(xmlObject: any, key: string): string | undefined {
    if (!xmlObject || !xmlObject[key]) return undefined;
    
    const value = xmlObject[key];
    if (Array.isArray(value)) {
      return value[0]?.toString();
    }
    
    return value?.toString();
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

