document.addEventListener('DOMContentLoaded', () => {
  carregarCategorias();

  // Evento para enviar o formulário de transação
  document.getElementById('form-transacao').addEventListener('submit', async (e) => {
    e.preventDefault();
    await salvarTransacao();
  });
});

// Função para carregar as categorias
async function carregarCategorias() {
  try {
    const response = await fetch('http://localhost:3000/categorias');
    const categorias = await response.json();

    const select = document.getElementById('categoria');
    categorias.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      option.textContent = c.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
}

// Função para salvar a transação
async function salvarTransacao() {
  const tipo = document.getElementById('tipo').value;
  const descricao = document.getElementById('descricao').value;
  const valor = document.getElementById('valor').value;
  const categoria_id = document.getElementById('categoria').value;

  const transacao = { tipo, descricao, valor, categoria_id };

  try {
    const token = localStorage.getItem('jwt_token');  // Supondo que o token esteja no localStorage
    
    if (!token) {
      alert('Você precisa estar logado para adicionar uma transação.');
      return;
    }

    // Requisição POST para salvar a transação
    const response = await fetch('http://localhost:3000/transacoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // Passando o token no cabeçalho Authorization
      },
      body: JSON.stringify(transacao),
    });

    if (response.ok) {
      window.location.href = 'index.html';  // Redireciona para a página inicial
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Erro ao salvar transação.');
    }
  } catch (error) {
    console.error('Erro ao salvar transação:', error);
  }
}
