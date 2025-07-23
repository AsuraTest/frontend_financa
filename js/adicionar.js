if (!window.API_CONFIG) {
  alert('Configurações não carregadas. Redirecionando...');
  window.location.href = 'index.html';
}
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  console.log('Token encontrado:', token ? 'Sim' : 'Não');
  
  if (!token) {
    alert('Você precisa estar logado para adicionar transações');
    window.location.href = 'login.html';
    return;
  }

  carregarCategorias();
  document.getElementById('form-transacao').addEventListener('submit', async (e) => {
    e.preventDefault();
    await salvarTransacao();
  });
});


async function carregarCategorias() {
  try {
    const token = localStorage.getItem('token'); 
    console.log('Carregando categorias com token:', token ? 'Sim' : 'Não');

    if (!token) {
      alert('Você precisa estar logado para carregar categorias.');
      window.location.href = 'login.html';
      return;
    }

    const response = await fetch(`${API_BASE_URL}/categorias`, {
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
  try {
    const tipo = document.getElementById('tipo').value;
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const categoria_id = document.getElementById('categoria').value;

    if (!tipo || !descricao || !valor || !categoria_id) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const transacao = { 
      tipo, 
      descricao, 
      valor, 
      categoria_id: parseInt(categoria_id)
    };

    const token = localStorage.getItem('token');  
    console.log('Salvando transação:', transacao);
    console.log('Token presente:', !!token);
    
    if (!token) {
      alert('Você precisa estar logado para adicionar uma transação.');
      window.location.href = 'login.html';
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    console.log('Headers:', headers);
   
    const response = await fetch(`${API_BASE_URL}/transacoes`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(transacao),
    });

    console.log('Status da resposta:', response.status);
    
    if (response.ok) {
      alert('Transação salva com sucesso!');
      window.location.href = 'index.html?reload=' + Date.now(); 
    } else {
      const errorData = await response.json();
      console.error('Erro na resposta:', errorData);
      alert(errorData.error || 'Erro ao salvar transação. Tente novamente.');
    }
  } catch (error) {
    console.error('Erro ao salvar transação:', error);
    alert('Erro ao salvar transação. Verifique sua conexão e tente novamente.');
  }
}
