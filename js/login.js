document.getElementById('form-login').addEventListener('submit', async e => {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
  
    try {
      const res = await fetch('http://localhost:3000/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
  
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Erro no login');
        return;
      }
  
      const data = await res.json();
  
      console.log('Resposta do login:', data);
      localStorage.setItem('token', data.token);
      alert('Login realizado com sucesso!');
      window.location.href = 'index.html';
  
    } catch (err) {
      console.error(err);
      alert('Erro na requisição');
    }
  });
  document.getElementById('recuperar-senha').addEventListener('click', async e => {
  e.preventDefault();

  const email = document.getElementById('email').value;

  if (!email) {
    alert('Digite seu e-mail para recuperar a senha');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/usuarios/recuperar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Erro ao enviar e-mail de recuperação');
      return;
    }

    alert('E-mail de recuperação enviado! Verifique sua caixa de entrada.');

  } catch (err) {
    console.error(err);
    alert('Erro na requisição');
  }
});
