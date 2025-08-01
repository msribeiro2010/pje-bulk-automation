-- Script AppleScript para iniciar o PJe Bulk
-- Este script pode ser salvo como aplicativo (.app) no Script Editor

tell application "Terminal"
	activate
	set projectPath to "/Users/marceloribeiro/Desktop/MESA-ICLOUD/PROJETOS_EM_ANDAMENTO/pje-bulk-kz"
	
	-- Criar nova janela do terminal
	do script "cd '" & projectPath & "' && ./start-pje-bulk.sh"
end tell

-- Aguardar um pouco para o servidor iniciar
delay 8

-- Abrir no Chrome (preferido para automação) ou navegador padrão
try
	tell application "Google Chrome"
		activate
		open location "http://localhost:3000"
	end tell
on error
	-- Se Chrome não estiver disponível, usar navegador padrão
	do shell script "open 'http://localhost:3000'"
end try