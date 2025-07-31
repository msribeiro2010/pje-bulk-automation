#!/bin/bash

# Teste da API em produção
echo "🧪 Testando API em produção..."

# Usar a URL principal do projeto
URL="https://pje-bulk-automation-blz5.vercel.app/api/run-automation"

# Dados de teste
DATA='{"pjeUrl":"https://pje.trt15.jus.br/pjekz/pessoa-fisica?pagina=1&tamanhoPagina=10&cpf=&situacao=1","cpf":"12345678901","perfil":"Servidor","orgaos":["Teste Orgao 1","Teste Orgao 2"]}'

echo "📤 Enviando dados: $DATA"
echo ""
echo "🌐 Fazendo requisição para: $URL"
echo ""

curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "$DATA" \
  -w "\n\n📊 Status HTTP: %{http_code}\n⏱️  Tempo total: %{time_total}s\n" \
  -s

echo ""
echo "✅ Teste concluído"