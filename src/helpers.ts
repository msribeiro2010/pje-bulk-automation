import { Page, expect } from 'playwright/test';

/** Remove ou aguarda o desaparecimento de overlays que bloqueiam cliques */
export async function waitForOverlaysToDisappear(page: Page) {
  console.log('🔍 Verificando overlays que podem bloquear cliques...');
  
  // Primeiro, tenta fechar modais/overlays clicando no backdrop ou ESC
  const overlaySelectors = [
    '.cdk-overlay-backdrop',
    '.cdk-overlay-transparent-backdrop',
    '.mat-dialog-container'
  ];
  
  for (const selector of overlaySelectors) {
    try {
      const overlay = page.locator(selector);
      const count = await overlay.count();
      if (count > 0) {
        console.log(`🚫 Encontrado overlay ${selector} (${count} elementos), tentando fechar...`);
        
        // Tenta clicar no backdrop para fechar
        if (selector.includes('backdrop')) {
          try {
            await overlay.first().click({ force: true, timeout: 2000 });
            console.log(`✅ Clicou no backdrop ${selector}`);
          } catch (e) {
            console.log(`⚠️ Erro ao clicar no backdrop: ${e}`);
          }
        }
        
        // Tenta ESC para fechar modais
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        // Verifica se ainda existe
        const stillExists = await overlay.count();
        if (stillExists > 0) {
          console.log(`⚠️ Overlay ${selector} ainda existe após tentativa de fechamento`);
        } else {
          console.log(`✅ Overlay ${selector} foi fechado`);
        }
      }
    } catch (e) {
      console.log(`Erro ao processar overlay ${selector}: ${e}`);
    }
  }
  
  // Aguarda um pouco extra para garantir que a página está estável
  await page.waitForTimeout(1000);
  console.log('✅ Overlays processados');
}

/** Aguarda e clica no primeiro botão com "editar"/ícone de lápis */
export async function clickFirstEditButton(page: Page) {
  console.log('🔍 Procurando botão de editar...');
  
  // Aguarda um pouco para a página carregar após preencher CPF
  await page.waitForTimeout(2000);
  
  // Tenta variações comuns de rótulo/ícone
  const candidates = [
    page.getByRole('button', { name: /editar|lápis|edit/i }),
    page.locator('button[aria-label*="Editar" i]'),
    page.locator('button[title*="Editar" i]'),
    page.locator('i[class*="pencil"], i[title*="Editar" i]').locator('xpath=ancestor::button[1]'),
    page.locator('button:has(i[class*="pencil"]), button:has(i[class*="edit"]), button:has(i[class*="fa-edit"])'),
    page.locator('a[title*="Editar" i], a[aria-label*="Editar" i]'),
    page.locator('button:has-text("Editar"), a:has-text("Editar")'),
    page.locator('[data-action*="edit" i], [onclick*="edit" i]'),
    page.locator('button.btn:has(i), a.btn:has(i)') // Botões genéricos com ícones
  ];
  
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const count = await c.count();
    console.log(`Candidato ${i + 1}: ${count} elementos encontrados`);
    if (count > 0) {
      console.log(`✅ Clicando no candidato ${i + 1}`);
      await c.first().click();
      return;
    }
  }
  
  // Debug: vamos ver todos os botões disponíveis
  console.log('🔍 Debug: Listando todos os botões disponíveis na página...');
  const allButtons = await page.locator('button, a[role="button"], input[type="button"], input[type="submit"]').all();
  for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
    const btn = allButtons[i];
    const text = await btn.textContent();
    const title = await btn.getAttribute('title');
    const ariaLabel = await btn.getAttribute('aria-label');
    console.log(`Botão ${i + 1}: texto="${text}" title="${title}" aria-label="${ariaLabel}"`);
  }
  
  throw new Error('Botão de editar (lápis) não foi encontrado após o preenchimento do CPF.');
}

/** Vai para a aba "Servidor" */
export async function goToServidorTab(page: Page) {
  console.log('🔍 Procurando aba "Servidor"...');
  
  // Aguardar um pouco mais para as abas carregarem
  await page.waitForTimeout(2000);
  
  // Tentar diferentes seletores para a aba Servidor
  const tabCandidates = [
    page.getByRole('tab', { name: /servidor/i }),
    page.locator('[role="tab"]:has-text("Servidor")'),
    page.locator('mat-tab-label:has-text("Servidor")'),
    page.locator('.mat-tab-label:has-text("Servidor")'),
    page.locator('div[role="tab"]:has-text("Servidor")'),
    page.locator('button[role="tab"]:has-text("Servidor")'),
    page.locator('[aria-label*="Servidor" i][role="tab"]'),
    page.locator('a:has-text("Servidor")'),
    page.locator('*:has-text("Servidor")[role="tab"]'),
    page.locator('mat-tab-label').filter({ hasText: /servidor/i }),
    page.locator('.mat-tab-label').filter({ hasText: /servidor/i })
  ];
  
  let tabFound = false;
  
  // Verificar se a página ainda está conectada
  try {
    await page.waitForTimeout(100); // Teste rápido de conexão
  } catch (error) {
    throw new Error('❌ Página foi fechada ou conexão perdida. Certifique-se de que o Chrome está aberto e na página correta.');
  }
  
  // Tentar múltiplas vezes com intervalos
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`🔄 Tentativa ${attempt} de encontrar aba Servidor...`);
    
    for (let i = 0; i < tabCandidates.length; i++) {
      const tab = tabCandidates[i];
      let count;
      try {
        count = await tab.count();
      } catch (error) {
        throw new Error('❌ Página foi fechada ou conexão perdida durante a busca. Certifique-se de que o Chrome está aberto e na página correta.');
      }
      console.log(`Candidato ${i + 1} (aba Servidor): ${count} elementos encontrados`);
      if (count > 0) {
        try {
          await tab.first().waitFor({ state: 'visible', timeout: 8000 });
          console.log(`✅ Clicando na aba Servidor (candidato ${i + 1})...`);
          await tab.first().click();
          tabFound = true;
          break;
        } catch (e) {
           console.log(`Candidato ${i + 1} não funcionou:`, e instanceof Error ? e.message : String(e));
        }
      }
    }
    
    if (tabFound) break;
    
    // Se não encontrou, aguarda mais um pouco antes da próxima tentativa
    if (attempt < 3) {
      console.log('⏳ Aguardando mais tempo para abas carregarem...');
      await page.waitForTimeout(3000);
    }
  }
  
  if (!tabFound) {
    // Debug: listar todas as abas disponíveis
    console.log('🔍 Debug: Listando abas disponíveis...');
    const allTabs = await page.locator('[role="tab"], mat-tab-label, .mat-tab-label, *[role="tab"]').all();
    for (let i = 0; i < Math.min(allTabs.length, 15); i++) {
      const tab = allTabs[i];
      const text = await tab.textContent();
      const ariaLabel = await tab.getAttribute('aria-label');
      const className = await tab.getAttribute('class');
      console.log(`Aba ${i + 1}: texto="${text}" aria-label="${ariaLabel}" class="${className}"`);
    }
    
    // Debug: listar todos os elementos que contêm "Servidor"
    console.log('🔍 Debug: Elementos que contêm "Servidor"...');
    const servidorElements = await page.locator('*:has-text("Servidor")').all();
    for (let i = 0; i < Math.min(servidorElements.length, 10); i++) {
      const element = servidorElements[i];
      const tagName = await element.evaluate(el => el.tagName);
      const text = await element.textContent();
      const role = await element.getAttribute('role');
      console.log(`Elemento ${i + 1}: <${tagName}> texto="${text}" role="${role}"`);
    }
    
    throw new Error('Aba "Servidor" não foi encontrada após múltiplas tentativas');
  }
  
  console.log('✅ Aba Servidor selecionada com sucesso');
}

/** Clica em "Adicionar localização/visibilidade" */
export async function clickAddLocalizacao(page: Page) {
  console.log('🔍 Procurando botão "Adicionar Localização"...');
  
  // Primeiro, aguarda overlays desaparecerem
  await waitForOverlaysToDisappear(page);
  
  // Tenta diferentes variações do botão
  const candidates = [
    page.getByRole('button', { name: /adicionar.*(localiza|visibili)/i }),
    page.locator('button:has-text("Adicionar"):has-text("Localização")'),
    page.locator('button:has-text("Adicionar"):has-text("Visibilidade")'),
    page.locator('button[title*="Adicionar" i][title*="Localização" i]'),
    page.locator('button[aria-label*="Adicionar" i][aria-label*="Localização" i]'),
    page.locator('button:has-text("Adicionar Localização")'),
    page.locator('button:has-text("Adicionar Visibilidade")')
  ];
  
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const count = await candidate.count();
    console.log(`Candidato ${i + 1} (Adicionar): ${count} elementos encontrados`);
    if (count > 0) {
      console.log(`✅ Clicando no candidato ${i + 1} para Adicionar`);
      await expect(candidate.first()).toBeVisible({ timeout: 10000 });
      
      // Tenta clique normal primeiro, depois force click se necessário
      try {
        await candidate.first().click({ timeout: 5000 });
      } catch (e) {
        console.log('⚠️ Clique normal falhou, tentando force click...');
        await candidate.first().click({ force: true });
      }
      return;
    }
  }
  
  // Debug: listar todos os botões que contêm "Adicionar"
  console.log('🔍 Debug: Listando botões com "Adicionar"...');
  const addButtons = await page.locator('button:has-text("Adicionar"), button[title*="Adicionar" i], button[aria-label*="Adicionar" i]').all();
  for (let i = 0; i < Math.min(addButtons.length, 5); i++) {
    const btn = addButtons[i];
    const text = await btn.textContent();
    const title = await btn.getAttribute('title');
    const ariaLabel = await btn.getAttribute('aria-label');
    console.log(`Botão Adicionar ${i + 1}: texto="${text}" title="${title}" aria-label="${ariaLabel}"`);
  }
  
  throw new Error('Botão "Adicionar Localização/Visibilidade" não foi encontrado.');
}

/** Seleciona Órgão Julgador no diálogo de inclusão */
export async function selectOrgaoJulgador(page: Page, ojName: string, perfil: string) {
  console.log(`🔍 Procurando campo de Órgão Julgador para: ${ojName}`);
  
  // Campo do OJ (combobox/autocomplete) - mais específico para evitar conflitos
  // Procura especificamente por mat-select que não esteja desabilitado e tenha o placeholder correto
  const combo = page.locator('mat-select[placeholder*="Órgão Julgador" i]:not([aria-disabled="true"]):not(.mat-select-disabled)').first();
  
  console.log('🔍 Aguardando campo de Órgão Julgador ficar visível...');
  await expect(combo).toBeVisible({ timeout: 10000 });
  
  console.log('🖱️ Clicando no campo de Órgão Julgador...');
  await combo.click();
  
  // Se for um input, preenche diretamente
  const tagName = await combo.evaluate(el => el.tagName.toLowerCase());
  if (tagName === 'input') {
    console.log('📝 Preenchendo campo de input...');
    await combo.fill(ojName);
  }
  
  // Aguarda sugestão e seleciona
  console.log('⏳ Aguardando opções aparecerem...');
  const option = page.getByRole('option', { name: new RegExp(ojName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });
  await expect(option).toBeVisible({ timeout: 10000 });
  
  console.log('✅ Selecionando opção...');
  await option.click();

  // Aguarda um pouco para o campo de perfil aparecer
  await page.waitForTimeout(1000);

  // Seleciona o papel configurado
  console.log(`👤 Procurando campo de Papel para selecionar: ${perfil}...`);
  await page.waitForTimeout(2000); // Aguarda campos carregarem
  
  const papelCandidates = [
    page.locator('mat-select[placeholder*="Papel" i]:not([aria-disabled="true"]):not(.mat-select-disabled)'),
    page.locator('select[name*="papel" i]'),
    page.locator('mat-select:has-text("Papel")'),
    page.locator('mat-select').nth(1), // Segundo mat-select no modal
    page.locator('mat-select[formcontrolname*="papel" i]'),
    page.locator('mat-select').filter({ hasText: /papel/i }),
    page.locator('mat-select').nth(2) // Terceiro mat-select (pode ser o papel)
  ];

  let papelSelected = false;
  for (let i = 0; i < papelCandidates.length; i++) {
    const papelCombo = papelCandidates[i];
    if (await papelCombo.count() > 0) {
      try {
        await papelCombo.first().waitFor({ state: 'visible', timeout: 3000 });
        console.log(`🖱️ Clicando no campo de Papel (candidato ${i + 1})...`);
        await papelCombo.first().click();
        
        // Aguarda opções aparecerem
        await page.waitForTimeout(1000);
        
        // Procura pela opção do perfil configurado
        const perfilOptions = [
          page.getByRole('option', { name: new RegExp(perfil, 'i') }),
          page.locator(`mat-option:has-text("${perfil}")`),
          page.locator(`[role="option"]:has-text("${perfil}")`),
          page.locator('mat-option').filter({ hasText: new RegExp(perfil, 'i') })
        ];
        
        for (const perfilOption of perfilOptions) {
          if (await perfilOption.count() > 0) {
            console.log(`✅ Selecionando papel "${perfil}"...`);
            await perfilOption.first().click();
            papelSelected = true;
            break;
          }
        }
        
        if (papelSelected) break;
        
        // Debug: listar opções disponíveis
        console.log('🔍 Debug: Listando opções de papel disponíveis...');
        const allOptions = await page.locator('mat-option, [role="option"]').all();
        for (let j = 0; j < Math.min(allOptions.length, 10); j++) {
          const option = allOptions[j];
          const text = await option.textContent();
          console.log(`Opção ${j + 1}: "${text}"`);
        }
        
        // Clica em ESC para fechar o dropdown se não encontrou
        await page.keyboard.press('Escape');
        
      } catch (e) {
        console.log(`Erro ao tentar papel candidato ${i + 1}:`, e);
      }
    }
  }

  if (!papelSelected) {
    console.log(`⚠️ Campo de papel não encontrado ou papel "${perfil}" não disponível`);
  }

  // Salvar (no modal)
  console.log('💾 Procurando botão salvar...');
  await page.waitForTimeout(2000);
  
  const salvarCandidates = [
    page.getByRole('button', { name: /gravar/i }),
    page.getByRole('button', { name: /salvar/i }),
    page.locator('button:has-text("Gravar")'),
    page.locator('button:has-text("Salvar")'),
    page.locator('button[type="submit"]'),
    page.locator('.mat-raised-button:has-text("Gravar")'),
    page.locator('.mat-button:has-text("Gravar")'),
    page.locator('mat-dialog-actions button:has-text("Gravar")'),
    page.locator('[mat-dialog-actions] button:has-text("Gravar")')
  ];

  let saved = false;
  for (let i = 0; i < salvarCandidates.length; i++) {
    const salvarBtn = salvarCandidates[i];
    if (await salvarBtn.count() > 0) {
      try {
        await salvarBtn.first().waitFor({ state: 'visible', timeout: 5000 });
        console.log(`💾 Clicando no botão salvar (candidato ${i + 1})...`);
        
        // Tenta clique normal primeiro
        try {
          await salvarBtn.first().click({ timeout: 3000 });
        } catch {
          // Se falhar, usa force click
          console.log('💾 Tentando force click no botão salvar...');
          await salvarBtn.first().click({ force: true });
        }
        
        saved = true;
        break;
      } catch (e) {
        console.log(`Erro ao tentar botão salvar candidato ${i + 1}:`, e);
      }
    }
  }

  if (!saved) {
    // Debug: listar botões disponíveis
    console.log('🔍 Debug: Listando botões disponíveis no modal...');
    const allButtons = await page.locator('button').all();
    for (let j = 0; j < Math.min(allButtons.length, 10); j++) {
      const button = allButtons[j];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      console.log(`Botão ${j + 1}: "${text}" (visível: ${isVisible})`);
    }
    throw new Error('Botão salvar não foi encontrado no modal');
  }

  // Aguarda um pouco para o salvamento processar
  await page.waitForTimeout(3000);
  
  console.log('✅ Órgão Julgador e papel selecionados e salvos!');
}

/** Verifica se OJ já está na grade/lista de Localização/Visibilidade */
export async function ojAlreadyAssigned(page: Page, ojName: string) {
  const row = page.getByRole('row', { name: new RegExp(ojName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });
  return (await row.count()) > 0;
}
