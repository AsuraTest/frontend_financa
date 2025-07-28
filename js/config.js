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
        return true; 
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

// Funções da sidebar para uso global
window.toggleNav = function() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        if (sidebar.style.width === "150px") {
            closeNav();
        } else {
            openNav();
        }
    }
};

window.openNav = function() {
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("main");
    if (sidebar && main) {
        sidebar.style.width = "150px";
        main.style.marginRight = "150px";
    }
};

window.closeNav = function() {
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("main");
    if (sidebar && main) {
        sidebar.style.width = "0";
        main.style.marginRight = "0";
    }
};

const API_BASE_URL = window.API_CONFIG.API_BASE_URL;
