document.addEventListener('DOMContentLoaded', () => {
  carregarCategorias();
  document.getElementById('form-transacao').addEventListener('submit', async (e) => {
    e.preventDefault();
    await salvarTransacao();
  });
});


async function carregarCategorias() {
  try {
    const token = localStorage.getItem('token'); 

    if (!token) {
      alert('Você precisa estar logado para carregar categorias.');
      window.location.href = 'login.html';
      return;
    }

    const response = await fetch('http://localhost:3000/categorias', {
      headers: {
        'Authorization': `Bearer ${token}`  
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar categorias');
    }

    const categorias = await response.json();

    const select = document.getElementById('categoria');
    select.innerHTML = '';

    categorias.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      option.textContent = c.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    alert('Erro ao carregar categorias, faça login novamente.');
    window.location.href = 'login.html';
  }
}



async function salvarTransacao() {
  const tipo = document.getElementById('tipo').value;
  const descricao = document.getElementById('descricao').value;
  const valor = document.getElementById('valor').value;
  const categoria_id = document.getElementById('categoria').value;

  const transacao = { tipo, descricao, valor, categoria_id };

  try {
    const token = localStorage.getItem('token');  
    
    if (!token) {
      alert('Você precisa estar logado para adicionar uma transação.');
      return;
    }

   
    const response = await fetch('http://localhost:3000/transacoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  
      },
      body: JSON.stringify(transacao),
    });

    if (response.ok) {
      window.location.href = 'index.html';  
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Erro ao salvar transação.');
    }
  } catch (error) {
    console.error('Erro ao salvar transação:', error);
  }
}
