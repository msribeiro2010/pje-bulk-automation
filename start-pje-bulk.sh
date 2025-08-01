#!/bin/bash

# Script para iniciar o PJe Bulk automaticamente
# Criado para facilitar o acesso à aplicação

echo "🚀 Iniciando PJe Bulk..."

# Navegar para o diretório do projeto
cd "$(dirname "$0")"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Parar qualquer instância anterior do servidor
echo "🔄 Parando instâncias anteriores..."
pkill -f 'ts-node src/server.ts' 2>/dev/null || true

# Aguardar um momento para garantir que o processo foi finalizado
sleep 2

# Iniciar o servidor em segundo plano
echo "🌐 Iniciando servidor..."
nohup node_modules/.bin/ts-node src/server.ts > server.log 2>&1 &
SERVER_PID=$!

# Aguardar o servidor inicializar
echo "⏳ Aguardando servidor inicializar..."
sleep 5

# Verificar se o servidor está rodando
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Servidor iniciado com sucesso!"
    echo "🌐 Abrindo aplicação no navegador..."
    
    # Abrir no Chrome (preferido para automação) ou navegador padrão
    if command -v "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" &> /dev/null; then
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "http://localhost:3000" &
    else
        # Se Chrome não estiver disponível, usar navegador padrão
        open "http://localhost:3000"
    fi
    
    echo "📱 PJe Bulk está rodando em: http://localhost:3000"
    echo "📋 Para parar o servidor, execute: pkill -f 'ts-node src/server.ts'"
    echo "📄 Logs do servidor: tail -f server.log"
else
    echo "❌ Erro ao iniciar o servidor. Verifique o arquivo server.log para mais detalhes."
    exit 1
fi