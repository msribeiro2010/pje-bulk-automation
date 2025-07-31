import { chromium, Browser, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { 
  clickFirstEditButton, 
  goToServidorTab, 
  clickAddLocalizacao, 
  selectOrgaoJulgador,
  ojAlreadyAssigned 
} from './helpers';

interface ConfigData {
  cpf: string;
  perfil: string;
  orgaos: string[];
  pjeUrl: string;
}

interface ProcessResult {
  orgao: string;
  status: 'Sucesso' | 'Erro' | 'Pulado' | 'Já Incluído';
  erro?: string;
}

async function main() {
  const configFile = process.argv[2];
  
  if (!configFile || !fs.existsSync(configFile)) {
    console.error('❌ Arquivo de configuração não encontrado');
    process.exit(1);
  }
  
  const config: ConfigData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  console.log(`🚀 Iniciando automação para CPF: ${config.cpf}`);
  console.log(`📋 Perfil: ${config.perfil}`);
  console.log(`🏛️ Órgãos a processar: ${config.orgaos.length}`);
  console.log(`🔍 DEBUG - Órgãos recebidos:`, JSON.stringify(config.orgaos, null, 2));
  
  // Verificar se os órgãos não estão vazios
  const orgaosValidos = config.orgaos.filter(o => o && o.trim());
  console.log(`✅ Órgãos válidos após filtro: ${orgaosValidos.length}`);
  
  if (orgaosValidos.length === 0) {
    console.log('❌ ERRO: Nenhum órgão válido encontrado!');
    console.log('📋 RESUMO FINAL:');
    console.log(`✅ Sucessos: 0`);
    console.log(`❌ Erros: 0`);
    console.log(`⏭️ Pulados: 0`);
    console.log(`🔄 Já Incluídos: 0`);
    console.log(`📋 Total: 0`);
    return;
  }
  
  let browser: Browser | null = null;
  let page: Page | null = null;
  const results: ProcessResult[] = [];
  
  try {
    // Detectar ambiente de produção
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    if (isProduction) {
      // Em produção, usar Playwright em modo headless
      console.log('🌐 Ambiente de produção detectado - usando Playwright headless');
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      const context = await browser.newContext();
      page = await context.newPage();
      console.log('✅ Browser headless iniciado');
    } else {
      // Em desenvolvimento, conectar ao Chrome existente
      browser = await chromium.connectOverCDP('http://localhost:9222');
      const contexts = browser.contexts();
      
      if (contexts.length === 0) {
        throw new Error('Nenhum contexto encontrado no Chrome');
      }
      
      const context = contexts[0];
      const pages = context.pages();
      
      if (pages.length === 0) {
        throw new Error('Nenhuma página encontrada');
      }
      
      page = pages[0];
      console.log('🔗 Conectado ao Chrome existente');
    }
    
    // Verificar se estamos na página correta ou navegar para a URL fornecida
    const currentUrl = page.url();
    let targetDomain: string;
    
    try {
      targetDomain = new URL(config.pjeUrl).hostname;
    } catch (urlError) {
      throw new Error(`URL inválida fornecida: ${config.pjeUrl}`);
    }
    
    // Em produção, sempre navegar para a URL. Em desenvolvimento, verificar se já estamos na página correta
    if (isProduction || !currentUrl.includes(targetDomain)) {
      console.log(`🌐 Navegando para: ${config.pjeUrl}`);
      try {
        // Tentar navegação com diferentes estratégias
        await page.goto(config.pjeUrl, { 
          waitUntil: 'networkidle', 
          timeout: 60000 
        });
        console.log('✅ Navegação concluída com networkidle');
      } catch (navError) {
        console.log('⚠️ Falha com networkidle, tentando com domcontentloaded...');
        try {
          await page.goto(config.pjeUrl, { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
          });
          console.log('✅ Navegação concluída com domcontentloaded');
        } catch (navError2) {
          console.log('⚠️ Falha com domcontentloaded, tentando navegação simples...');
          await page.goto(config.pjeUrl, { timeout: 60000 });
          console.log('✅ Navegação simples concluída');
        }
      }
      await page.waitForTimeout(5000); // Aguarda a página carregar
    }
    
    console.log('✅ Página do PJE detectada');
    
    // Buscar pelo CPF
    await searchByCPF(page, config.cpf);
    
    // Aguardar resultados carregarem completamente
    console.log('⏳ Aguardando resultados da busca carregarem...');
    await page.waitForTimeout(3000);
    
    // Clicar no primeiro botão de editar
    await clickFirstEditButton(page);
    
    // Aguardar página de edição carregar completamente
    console.log('⏳ Aguardando página de edição carregar...');
    await page.waitForTimeout(5000);
    
    // Ir para a aba Servidor
    await goToServidorTab(page);
    
    // Processar cada órgão
    for (let i = 0; i < config.orgaos.length; i++) {
      const orgao = config.orgaos[i].trim();
      
      if (!orgao) {
        console.log(`⏭️ Pulando órgão vazio na posição ${i + 1}`);
        results.push({ orgao: `Posição ${i + 1}`, status: 'Pulado' });
        continue;
      }
      
      console.log(`\n🏛️ Processando (${i + 1}/${config.orgaos.length}): ${orgao}`);
      
      try {
        // Verificar se o OJ já está incluído no perfil
        const jaIncluido = await ojAlreadyAssigned(page, orgao);
        
        if (jaIncluido) {
          console.log(`⏭️ ${orgao} já está incluído no perfil. Pulando para o próximo...`);
          results.push({ 
            orgao, 
            status: 'Já Incluído', 
            erro: 'Órgão Julgador já estava incluído no perfil do servidor' 
          });
          continue;
        }
        
        // Clicar em Adicionar Localização
        await clickAddLocalizacao(page);
        
        // Selecionar o órgão julgador (a função já salva internamente)
        try {
          await selectOrgaoJulgador(page, orgao, config.perfil);
          console.log(`✅ Sucesso: ${orgao}`);
          results.push({ orgao, status: 'Sucesso' });
        } catch (selectError) {
          console.log(`❌ Erro ao selecionar órgão ${orgao}:`, selectError);
          results.push({ orgao, status: 'Erro', erro: 'Órgão não encontrado ou erro na seleção' });
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${orgao}:`, error);
        results.push({ 
          orgao, 
          status: 'Erro', 
          erro: error instanceof Error ? error.message : 'Erro desconhecido' 
        });
      }
      
      // Aguardar um pouco entre processamentos
      await page.waitForTimeout(1000);
    }
    
    // Gerar relatório
    await generateReport(results, config);
    
    // Resumo final
    const sucessos = results.filter(r => r.status === 'Sucesso').length;
    const erros = results.filter(r => r.status === 'Erro').length;
    const pulados = results.filter(r => r.status === 'Pulado').length;
    const jaIncluidos = results.filter(r => r.status === 'Já Incluído').length;
    
    console.log('\n📊 RESUMO FINAL:');
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Erros: ${erros}`);
    console.log(`⏭️ Pulados: ${pulados}`);
    console.log(`🔄 Já Incluídos: ${jaIncluidos}`);
    console.log(`📋 Total: ${results.length}`);
    
  } catch (error) {
    console.error('❌ Erro na automação:', error);
    process.exit(1);
  } finally {
    // Fechar o browser ao final da automação
    if (browser) {
      console.log('🔒 Fechando browser...');
      try {
        await browser.close();
        console.log('✅ Browser fechado com sucesso');
      } catch (closeError) {
        console.log('⚠️ Erro ao fechar browser:', closeError);
      }
    }
    console.log('🏁 Automação finalizada');
  }
}

async function searchByCPF(page: Page, cpf: string) {
  // Remover formatação do CPF (pontos e traços)
  const cpfLimpo = cpf.replace(/[^0-9]/g, '');
  console.log(`🔍 Buscando por CPF: ${cpf} (limpo: ${cpfLimpo})`);
  
  // Tentar diferentes seletores para o campo de busca, priorizando campos específicos de CPF
  const searchCandidates = [
    page.locator('input[placeholder*="Digite o CPF ou nome do servidor"]'),
    page.locator('input[placeholder*="CPF"]'),
    page.locator('input[name="cpf"]'),
    page.locator('input[id="cpf"]'),
    page.locator('#cpf'),
    page.locator('input[placeholder*="nome"]'),
    page.locator('input[name="nome"]'),
    page.locator('#nome'),
    page.locator('input[type="text"]').first(),
    page.locator('.form-control').first()
  ];
  
  let searchInput = null;
  for (let i = 0; i < searchCandidates.length; i++) {
    const candidate = searchCandidates[i];
    const count = await candidate.count();
    console.log(`Candidato ${i + 1} para busca: ${count} elementos encontrados`);
    if (count > 0) {
      try {
        await candidate.first().waitFor({ timeout: 3000 });
        searchInput = candidate.first();
        console.log(`✅ Usando candidato ${i + 1} para busca`);
        break;
      } catch (e) {
        console.log(`Candidato ${i + 1} não está visível`);
      }
    }
  }
  
  if (!searchInput) {
    throw new Error('Campo de busca por CPF não foi encontrado');
  }
  
  // Limpar e digitar o CPF (sem formatação)
  await searchInput.clear();
  await searchInput.fill(cpfLimpo);
  
  // Tentar clicar no botão "Procurar" primeiro, se não encontrar, usar Enter
  const searchButtonCandidates = [
    page.locator('button:has-text("Procurar")'),
    page.locator('input[type="submit"][value*="Procurar"]'),
    page.locator('button[type="submit"]'),
    page.locator('.btn:has-text("Procurar")'),
    page.locator('input[value="Procurar"]'),
    page.locator('button:has-text("Buscar")'),
    page.locator('input[type="submit"]')
  ];
  
  let searchButtonClicked = false;
  for (let i = 0; i < searchButtonCandidates.length; i++) {
    const candidate = searchButtonCandidates[i];
    const count = await candidate.count();
    console.log(`Candidato ${i + 1} para botão Procurar: ${count} elementos encontrados`);
    if (count > 0) {
      try {
        await candidate.first().waitFor({ timeout: 2000 });
        await candidate.first().click();
        console.log(`✅ Clicou no botão Procurar (candidato ${i + 1})`);
        searchButtonClicked = true;
        break;
      } catch (e) {
        console.log(`Candidato ${i + 1} para botão Procurar não está clicável`);
      }
    }
  }
  
  // Se não conseguiu clicar no botão, usar Enter como fallback
  if (!searchButtonClicked) {
    console.log('⚠️ Botão Procurar não encontrado, usando Enter como alternativa');
    await searchInput.press('Enter');
  }
  
  // Aguardar os resultados carregarem
  await page.waitForTimeout(3000);
  
  console.log('✅ Busca realizada');
}

async function generateReport(results: ProcessResult[], config: ConfigData) {
  // Usar /tmp para compatibilidade com Vercel
  const outputDir = '/tmp';
  
  // Gerar CSV
  const csvContent = [
    'Órgão Julgador,Status,Erro',
    ...results.map(r => `"${r.orgao}","${r.status}","${r.erro || ''}"`)
  ].join('\n');
  
  const csvPath = path.join(outputDir, 'relatorio.csv');
  fs.writeFileSync(csvPath, csvContent);
  
  // Gerar JSON detalhado
  const jsonReport = {
    timestamp: new Date().toISOString(),
    config: {
      cpf: config.cpf,
      perfil: config.perfil,
      totalOrgaos: config.orgaos.length
    },
    results,
    summary: {
      sucessos: results.filter(r => r.status === 'Sucesso').length,
      erros: results.filter(r => r.status === 'Erro').length,
      pulados: results.filter(r => r.status === 'Pulado').length
    }
  };
  
  const jsonPath = path.join(outputDir, 'relatorio.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
  
  console.log(`📄 Relatório salvo em: ${csvPath}`);
  console.log(`📄 Relatório JSON salvo em: ${jsonPath}`);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { main };