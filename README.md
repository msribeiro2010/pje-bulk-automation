# PJE Bulk Automation

Sistema de automação profissional para inclusão de perfis em órgãos julgadores do PJE (Processo Judicial Eletrônico).

## ✨ Novas Funcionalidades

### 🎨 Interface Moderna e Profissional
- **Design atualizado**: Interface mais limpa e profissional
- **Remoção da animação do robô**: Substituída por loading mais elegante
- **Painel de resultados aprimorado**: Layout em grid com cards modernos
- **Responsividade melhorada**: Interface adaptável para diferentes dispositivos

### 🎛️ Controles de Automação Avançados
- **Botão Pausar**: Pausa a automação em qualquer momento
- **Botão Retomar**: Continua a automação após pausa
- **Botão Parar**: Interrompe completamente a automação
- **Barra de progresso**: Visualização do progresso em tempo real
- **Status em tempo real**: Monitoramento contínuo do estado da automação

### 📊 Relatório Executivo Detalhado
- **Resumo executivo**: Estatísticas visuais com cards modernos
- **Painel de sucessos**: Lista organizada dos órgãos incluídos com sucesso
- **Painel de órgãos existentes**: Identificação dos que já estavam cadastrados
- **Painel de erros**: Detalhamento dos problemas encontrados
- **Análise detalhada**: Estatísticas completas com percentuais

## 🚀 Como Usar

### Pré-requisitos
- Node.js 16+ instalado
- Chrome ou Firefox para automação
- Acesso ao sistema PJE

### Instalação
```bash
npm install
```

### Execução
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

### Iniciar Chrome para Automação
1. Clique no botão "🌐 Abrir Chrome para Automação"
2. Aguarde o Chrome iniciar em modo debug
3. Faça login no PJE manualmente

### Executar Automação
1. **Preencha os dados**:
   - URL do PJE
   - CPF do servidor
   - Perfil desejado
   - Órgãos julgadores (manual ou CSV)

2. **Escolha o método de entrada**:
   - **Digitação Manual**: Digite os órgãos linha por linha
   - **Upload CSV**: Carregue arquivo CSV com os órgãos

3. **Inicie a automação**:
   - Clique em "🚀 Iniciar Automação"
   - Monitore o progresso em tempo real
   - Use os controles para pausar/retomar/parar

## 📋 Funcionalidades

### Controle de Automação
- **⏸️ Pausar**: Pausa a automação temporariamente
- **▶️ Retomar**: Continua a automação após pausa
- **⏹️ Parar**: Interrompe completamente a automação
- **📊 Progresso**: Barra de progresso em tempo real

### Relatório de Resultados
- **✅ Novos Cadastros**: Órgãos incluídos com sucesso
- **🔄 Já Existiam**: Órgãos que já estavam cadastrados
- **❌ Erros**: Problemas encontrados durante o processo
- **📈 Estatísticas**: Análise detalhada com percentuais

### Upload de CSV
- Suporte a arquivos CSV até 5MB
- Configuração de coluna e cabeçalho
- Validação automática de dados
- Relatório de importação

### Normalização de Nomes
- Botão para normalizar nomes de órgãos
- Conversão automática para padrão PJE
- Validação de formato

## 🛠️ Tecnologias

- **Backend**: Node.js, Express, TypeScript
- **Automação**: Playwright
- **Frontend**: HTML5, CSS3, JavaScript
- **Processamento**: CSV parsing, normalização de dados

## 📁 Estrutura do Projeto

```
pje-bulk-automation/
├── src/
│   ├── automation.ts          # Lógica principal de automação
│   ├── automation-control.ts  # Controle de pausa/parada
│   ├── server.ts             # Servidor Express
│   ├── csv-importer.ts       # Importação de CSV
│   └── helpers.ts            # Funções auxiliares
├── public/
│   └── index.html            # Interface web
├── data/                     # Dados temporários e relatórios
└── package.json
```

## 🔧 Configuração

### Variáveis de Ambiente
```bash
NODE_ENV=development  # Ambiente de desenvolvimento
PORT=3000            # Porta do servidor
```

### Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm start           # Produção
npm run chrome-debug # Iniciar Chrome debug
```

## 📊 Relatórios

A aplicação gera relatórios detalhados em:
- **CSV**: `data/relatorio.csv`
- **JSON**: `data/relatorio.json`

### Estrutura do Relatório
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "config": {
    "cpf": "000.000.000-00",
    "perfil": "Servidor",
    "totalOrgaos": 10
  },
  "summary": {
    "total": 10,
    "sucessos": 8,
    "erros": 1,
    "jaIncluidos": 1,
    "estatisticas": {
      "percentualSucesso": 80.0,
      "percentualJaExistiam": 10.0,
      "percentualErros": 10.0
    }
  }
}
```

## 🚨 Troubleshooting

### Chrome não inicia
- Verifique se o Chrome está instalado
- Execute `npm run chrome-debug` manualmente
- Verifique se a porta 9222 está livre

### Automação não funciona
- Verifique se está logado no PJE
- Confirme se a URL está correta
- Verifique se o CPF está no formato correto

### Erros de CSV
- Verifique se o arquivo é válido
- Confirme a coluna dos órgãos
- Verifique se há cabeçalho

## 📝 Licença

Este projeto é de uso interno para automação de processos judiciais.

## 🤝 Contribuição

Para contribuir com melhorias:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

---

**PJE Bulk Automation** - Sistema profissional de automação para órgãos julgadores