#!/usr/bin/env node

/**
 * Script para importar modelos de minutas existentes
 * 
 * Uso:
 * node scripts/import-minutas.js /caminho/para/pasta/com/minutas
 * 
 * Exemplo:
 * node scripts/import-minutas.js "/home/user/ID._3.0_-_MINUTA_DE_ACORDO_DE_COOPERAÇAO_-Pós_Compliance"
 */

const fs = require('fs').promises;
const path = require('path');

// Diretório para armazenar as minutas
const MINUTAS_DIR = path.join(process.cwd(), 'public', 'minutas');
const METADATA_FILE = path.join(MINUTAS_DIR, 'metadata.json');

async function ensureMinutasDir() {
  try {
    await fs.access(MINUTAS_DIR);
  } catch {
    await fs.mkdir(MINUTAS_DIR, { recursive: true });
  }
}

async function loadMetadata() {
  try {
    await ensureMinutasDir();
    const data = await fs.readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveMetadata(minutas) {
  await ensureMinutasDir();
  await fs.writeFile(METADATA_FILE, JSON.stringify(minutas, null, 2));
}

async function importMinutas(sourceDir) {
  try {
    console.log(`🔍 Procurando modelos de minutas em: ${sourceDir}`);
    
    // Verificar se o diretório existe
    try {
      await fs.access(sourceDir);
    } catch {
      console.error(`❌ Diretório não encontrado: ${sourceDir}`);
      return;
    }

    // Listar arquivos .docx
    const files = await fs.readdir(sourceDir);
    const docxFiles = files.filter(file => file.toLowerCase().endsWith('.docx'));
    
    if (docxFiles.length === 0) {
      console.log('⚠️  Nenhum arquivo .docx encontrado no diretório');
      return;
    }

    console.log(`📄 Encontrados ${docxFiles.length} arquivo(s) .docx:`);
    docxFiles.forEach(file => console.log(`   - ${file}`));

    const minutas = await loadMetadata();
    let imported = 0;

    for (const file of docxFiles) {
      try {
        const sourcePath = path.join(sourceDir, file);
        const stats = await fs.stat(sourcePath);
        
        // Gerar ID único
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        // Nome do arquivo no servidor
        const fileName = `${id}_${file}`;
        const destPath = path.join(MINUTAS_DIR, fileName);

        // Copiar arquivo
        await fs.copyFile(sourcePath, destPath);

        // Extrair nome da minuta (remover extensão e caracteres especiais)
        const nome = file.replace('.docx', '').replace(/[_-]/g, ' ').trim();
        
        // Criar metadados
        const novaMinuta = {
          id,
          nome,
          descricao: `Modelo importado de: ${file}`,
          arquivo: fileName,
          tamanho: stats.size,
          dataUpload: new Date().toISOString(),
          tipo: 'DOCX'
        };

        minutas.push(novaMinuta);
        imported++;
        
        console.log(`✅ Importado: ${nome}`);
        
      } catch (error) {
        console.error(`❌ Erro ao importar ${file}:`, error.message);
      }
    }

    // Salvar metadados
    await saveMetadata(minutas);
    
    console.log(`\n🎉 Importação concluída!`);
    console.log(`📊 Total importado: ${imported} de ${docxFiles.length} arquivos`);
    console.log(`📁 Arquivos salvos em: ${MINUTAS_DIR}`);
    console.log(`🌐 Acesse: http://localhost:3000/geracao-contratos/minutas`);

  } catch (error) {
    console.error('❌ Erro na importação:', error);
  }
}

// Verificar argumentos
const sourceDir = process.argv[2];

if (!sourceDir) {
  console.log('📋 Uso: node scripts/import-minutas.js /caminho/para/pasta/com/minutas');
  console.log('');
  console.log('📝 Exemplo:');
  console.log('   node scripts/import-minutas.js "/home/user/ID._3.0_-_MINUTA_DE_ACORDO_DE_COOPERAÇAO_-Pós_Compliance"');
  console.log('');
  console.log('💡 Dica: Use aspas se o caminho contiver espaços');
  process.exit(1);
}

// Executar importação
importMinutas(sourceDir);

