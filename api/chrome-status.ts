export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // Verificar se o Chrome está rodando na porta 9222
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://localhost:9222/json/version', {
            timeout: 3000
        });
        
        if (response.ok) {
            const data = await response.json();
            return res.status(200).json({ 
                running: true, 
                version: data,
                debugUrl: 'http://localhost:9222'
            });
        } else {
            return res.status(200).json({ running: false });
        }
    } catch (error) {
        return res.status(200).json({ running: false });
    }
}