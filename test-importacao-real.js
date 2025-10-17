const { FileImportService } = require('./supabase/services/FileImportService');
const { FileImportController } = require('./supabase/controllers/FileImportController');

async function testarImportacaoReal() {
  console.log('🚀 Testando importação real de arquivos...\n');

  try {
    // Simular arquivo Excel
    const mockExcelFile = {
      name: 'contratos-teste.xlsx',
      size: 1024000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    console.log('📊 Testando importação de Excel...');
    const excelResult = await FileImportController.store({
      file: mockExcelFile,
      diretoria: 'MERCADO E PARCERIAS',
      userId: 'test-user'
    });

    if (excelResult.success) {
      console.log('✅ Excel importado com sucesso!');
      console.log(`   📄 Contratos processados: ${excelResult.data.successful_records}`);
      console.log(`   📁 Diretorias encontradas: ${excelResult.data.total_diretorias}`);
    } else {
      console.log('❌ Erro na importação Excel:', excelResult.message);
    }

    console.log('\n📋 Testando importação de CSV...');
    const mockCsvFile = {
      name: 'contratos-teste.csv',
      size: 512000,
      type: 'text/csv'
    };

    const csvResult = await FileImportController.store({
      file: mockCsvFile,
      diretoria: 'ADMINISTRAÇÃO E FINANÇAS',
      userId: 'test-user'
    });

    if (csvResult.success) {
      console.log('✅ CSV importado com sucesso!');
      console.log(`   📄 Contratos processados: ${csvResult.data.successful_records}`);
      console.log(`   📁 Diretorias encontradas: ${csvResult.data.total_diretorias}`);
    } else {
      console.log('❌ Erro na importação CSV:', csvResult.message);
    }

    console.log('\n📄 Testando importação de XML...');
    const mockXmlFile = {
      name: 'contratos-teste.xml',
      size: 256000,
      type: 'application/xml'
    };

    const xmlResult = await FileImportController.store({
      file: mockXmlFile,
      diretoria: 'OPERAÇÕES',
      userId: 'test-user'
    });

    if (xmlResult.success) {
      console.log('✅ XML importado com sucesso!');
      console.log(`   📄 Contratos processados: ${xmlResult.data.successful_records}`);
      console.log(`   📁 Diretorias encontradas: ${xmlResult.data.total_diretorias}`);
    } else {
      console.log('❌ Erro na importação XML:', xmlResult.message);
    }

    console.log('\n📑 Testando importação de PDF...');
    const mockPdfFile = {
      name: 'contrato-teste.pdf',
      size: 2048000,
      type: 'application/pdf'
    };

    const pdfResult = await FileImportController.store({
      file: mockPdfFile,
      diretoria: 'MERCADO E PARCERIAS',
      userId: 'test-user'
    });

    if (pdfResult.success) {
      console.log('✅ PDF importado com sucesso!');
      console.log(`   📄 Contratos processados: ${pdfResult.data.successful_records}`);
      console.log(`   📁 Diretorias encontradas: ${pdfResult.data.total_diretorias}`);
    } else {
      console.log('❌ Erro na importação PDF:', pdfResult.message);
    }

    console.log('\n🎉 Teste de importação concluído!');
    console.log('\n📊 Resumo dos testes:');
    console.log(`   ✅ Excel: ${excelResult.success ? 'SUCESSO' : 'FALHA'}`);
    console.log(`   ✅ CSV: ${csvResult.success ? 'SUCESSO' : 'FALHA'}`);
    console.log(`   ✅ XML: ${xmlResult.success ? 'SUCESSO' : 'FALHA'}`);
    console.log(`   ✅ PDF: ${pdfResult.success ? 'SUCESSO' : 'FALHA'}`);

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testarImportacaoReal();


