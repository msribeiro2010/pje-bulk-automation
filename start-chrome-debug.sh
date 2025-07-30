#!/bin/bash

# Script para iniciar o Chrome com debugging habilitado
# Isso permite que o Playwright se conecte a uma sessão existente

echo "🚀 Iniciando Chrome com debugging habilitado..."
echo "📍 Porta CDP: 9222"
echo "🌐 Acesse: http://localhost:9222 para ver as abas disponíveis"
echo ""
echo "⚠️  IMPORTANTE: Deixe este terminal aberto enquanto usar a automação"
echo ""

# Mata processos Chrome existentes (opcional)
# pkill -f "Google Chrome"

# Inicia Chrome com debugging
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug \
  --no-first-run \
  --no-default-browser-check \
  --disable-web-security \
  --disable-features=VizDisplayCompositor