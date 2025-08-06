# 🧪 Guia de Debug - Detecção de Perfis Já Cadastrados

## 🔍 Problema Identificado

### **Situação Atual:**
- ❌ Sistema não detecta perfis já cadastrados
- ❌ Todos os órgãos aparecem como "Sucesso" mesmo quando já existem
- ❌ Logs mostram que a verificação não está funcionando

### **Órgãos Testados:**
1. Vara do Trabalho de Lins ✅ (novo cadastro)
2. Vara do Trabalho de Rancharia ❌ (já tinha perfil)
3. Vara do Trabalho de Jales ❌ (já tinha perfil)  
4. Vara do Trabalho de Matão ❌ (já tinha perfil)

## 🔧 Melhorias Implementadas

### **1. Função de Verificação Aprimorada:**
- ✅ 7 estratégias diferentes de busca
- ✅ Debug detalhado da estrutura da página
- ✅ Logs mais informativos
- ✅ Tratamento de erros melhorado

### **2. Debug Adicionado:**
- ✅ Captura estrutura da página
- ✅ Mostra linhas encontradas
- ✅ Conta elementos com órgão e perfil
- ✅ Exibe texto encontrado

## 🧪 Como Testar Agora

### **Teste 1: Verificar Se a Detecção Funciona**

1. **Acesse**: http://localhost:3000
2. **Preencha os dados**:
   - URL do PJE: `https://pje.trt15.jus.br/pjekz/pessoa-fisica`
   - CPF: `530.361.406-97`
   - Perfil: `Diretor de Secretaria`
   - Órgãos: `Vara do Trabalho de Rancharia` (que você sabe que já tem o perfil)
3. **Clique em "🚀 Iniciar Automação"**
4. **Observe os logs** no terminal do servidor

### **Logs Esperados:**
```
🔍 Verificando se Diretor de Secretaria já está cadastrado em Vara do Trabalho de Rancharia
✅ Perfil "Diretor de Secretaria" já cadastrado em "Vara do Trabalho de Rancharia" (estratégia X)
📝 Texto encontrado: "Vara do Trabalho de Rancharia Diretor de Secretaria ..."
✓ Vara do Trabalho de Rancharia - perfil "Diretor de Secretaria" já cadastrado
```

### **Teste 2: Verificar Debug (Se Não Encontrar)**

Se a detecção não funcionar, observe os logs de debug:
```
❌ Perfil "Diretor de Secretaria" não encontrado em "Vara do Trabalho de Rancharia"
🔍 DEBUG: Analisando estrutura da página...
📊 Total de linhas encontradas: X
Linha 1 (visível: true): "Vara do Trabalho de Rancharia Diretor de Secretaria ..."
🔍 Elementos com "Vara do Trabalho de Rancharia": X
🔍 Elementos com "Diretor de Secretaria": X
```

## 🔍 Análise dos Logs

### **Se a Detecção Funcionar:**
- ✅ Sistema detecta perfis já cadastrados
- ✅ Órgãos aparecem na lista "Já Estavam Cadastrados"
- ✅ Mensagens detalhadas são exibidas

### **Se a Detecção Não Funcionar:**
- ❌ Precisamos analisar a estrutura da página
- ❌ Pode ser necessário ajustar as estratégias de busca
- ❌ Pode ser um problema de timing ou carregamento

## 🐛 Possíveis Problemas

### **Problema 1: Estrutura da Página Diferente**
**Sintoma**: Logs de debug mostram estrutura inesperada
**Solução**: Ajustar estratégias de busca baseado na estrutura real

### **Problema 2: Timing de Carregamento**
**Sintoma**: Página não carregou completamente
**Solução**: Aumentar tempo de espera ou adicionar waitFor

### **Problema 3: Nomes Diferentes**
**Sintoma**: Órgão/perfil tem nomes ligeiramente diferentes
**Solução**: Ajustar variações de nomes

## 📝 Logs de Debug Esperados

### **Estrutura da Página:**
```
📊 Total de linhas encontradas: 15
Linha 1 (visível: true): "Vara do Trabalho de Rancharia Diretor de Secretaria Ativo"
Linha 2 (visível: true): "Vara do Trabalho de Jales Assessor Ativo"
...
🔍 Elementos com "Vara do Trabalho de Rancharia": 3
🔍 Elementos com "Diretor de Secretaria": 2
```

### **Detecção Bem-sucedida:**
```
✅ Perfil "Diretor de Secretaria" já cadastrado em "Vara do Trabalho de Rancharia" (estratégia 2)
📝 Texto encontrado: "Vara do Trabalho de Rancharia Diretor de Secretaria Ativo"
```

## 🎯 Próximos Passos

1. **Execute o teste** com um órgão que você sabe que já tem o perfil
2. **Analise os logs** de debug
3. **Verifique se a detecção funciona**
4. **Se não funcionar**, analise a estrutura da página
5. **Ajuste as estratégias** conforme necessário

## ✅ Status das Melhorias

- ✅ **Função de verificação aprimorada**
- ✅ **Debug detalhado implementado**
- ✅ **7 estratégias de busca diferentes**
- ✅ **Logs mais informativos**
- ✅ **Tratamento de erros melhorado**

**Execute o teste e analise os logs para verificar se a detecção está funcionando!** 🔍 