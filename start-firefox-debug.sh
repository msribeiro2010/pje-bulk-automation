#!/bin/bash

# Script para iniciar o Firefox com debugging habilitado
# Isso permite que o Playwright se conecte a uma sessão existente

echo "🦊 Iniciando Firefox com debugging habilitado..."
echo "📍 Porta CDP: 9223"
echo "🌐 Acesse: http://localhost:9223 para ver as abas disponíveis"
echo ""
echo "⚠️  IMPORTANTE: Deixe este terminal aberto enquanto usar a automação"
echo ""

# Mata processos Firefox existentes (opcional)
# pkill -f "firefox"

# Inicia Firefox com debugging
/Applications/Firefox.app/Contents/MacOS/firefox \
  --start-debugger-server=9223 \
  --profile /tmp/firefox-debug \
  --no-remote \
  --new-instance