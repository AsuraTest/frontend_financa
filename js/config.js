// config.js
window.API_CONFIG = {
    API_BASE_URL: 'http://localhost:3000',
    DEBUG: true
};

// Função para verificar se o backend está acessível
async function checkApiHealth() {
    try {
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/usuarios/login`, {
            method: 'OPTIONS',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': window.location.origin
            }
        });
        return true; // Se não der erro, o servidor está respondendo
    } catch (error) {
        console.error('API não está acessível:', error);
        return false;
    }
}

// Função para validar token
function isValidToken(token) {
    if (!token) return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        // Verifica se o token não está expirado
        const payload = JSON.parse(atob(parts[1]));
        const expirationDate = new Date(payload.exp * 1000);
        return expirationDate > new Date();
    } catch {
        return false;
    }
}

// Exporta as constantes para uso global
const API_BASE_URL = window.API_CONFIG.API_BASE_URL;
