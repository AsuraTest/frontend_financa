document.getElementById('form-registro').addEventListener('submit', async e => {
    e.preventDefault();
  
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
  
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });
  
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Erro no registro');
        return;
      }
  
      alert('Usuário registrado com sucesso! Faça login.');
      window.location.href = 'login.html';
  
    } catch (err) {
      console.error(err);
      alert('Erro na requisição');
    }
  });
  