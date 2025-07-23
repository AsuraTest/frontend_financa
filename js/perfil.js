document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carregar dados do usuário
    const loadUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Erro ao carregar perfil');
            
            const userData = await response.json();
            
            // Preencher dados
            document.getElementById('user-name').textContent = userData.nome;
            document.getElementById('user-email').textContent = userData.email;
            document.getElementById('edit-name').value = userData.nome;
            document.getElementById('edit-email').value = userData.email;
            
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao carregar dados do usuário');
        }
    };

    // 2. Editar perfil
    document.getElementById('form-edit-profile').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const newData = {
            nome: document.getElementById('edit-name').value,
            email: document.getElementById('edit-email').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newData)
            });

            if (!response.ok) throw new Error('Erro ao atualizar perfil');
            
            alert('Perfil atualizado com sucesso!');
            loadUserData(); // Recarregar dados
            
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    });

    // 3. Alterar senha
    document.getElementById('form-change-password').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const passwords = {
            senhaAtual: document.getElementById('current-password').value,
            novaSenha: document.getElementById('new-password').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/usuarios/alterar-senha`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passwords)
            });

            const result = await response.json();
            
            if (!response.ok) throw new Error(result.error || 'Erro ao alterar senha');
            
            alert('Senha alterada com sucesso!');
            e.target.reset();
            
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    });

    // 4. Excluir conta
    document.getElementById('delete-account-btn').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir sua conta? TODOS seus dados serão apagados permanentemente!')) {
            deleteAccount();
        }
    });

    const deleteAccount = async () => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Erro ao excluir conta');
            
            localStorage.removeItem('token');
            alert('Conta excluída com sucesso. Redirecionando...');
            window.location.href = 'login.html';
            
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    };

    // Carregar dados iniciais
    loadUserData();
});