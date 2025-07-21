 
document.getElementById('formRecuperarSenha')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const mensagem = document.getElementById('mensagem');

  try {
    const response = await fetch('http://localhost:3000/usuarios/recuperar-senha',{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    mensagem.textContent = data.message || 'Verifique seu e-mail para o link de redefinição!';
  } catch (error) {
    mensagem.textContent = 'Erro ao solicitar recuperação: ' + error.message;
  }
});

document.getElementById('formRedefinirSenha')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const novaSenha = document.getElementById('novaSenha').value;
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const mensagem = document.getElementById('mensagem');

  if (!token) {
    return mensagem.textContent = 'Token inválido ou ausente!';
  }

  try {
    const response = await fetch('http://localhost:3000/usuarios/redefinir-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, novaSenha })
    });

    const data = await response.json();
    mensagem.textContent = data.message || 'Senha redefinida com sucesso!';
    setTimeout(() => window.location.href = 'login.html', 2000);
  } catch (error) {
    mensagem.textContent = 'Erro: ' + error.message;
  }
});