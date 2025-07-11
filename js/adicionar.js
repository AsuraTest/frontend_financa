document.addEventListener('DOMContentLoaded', () => {
    carregarCategorias();
  
    document.getElementById('form-transacao').addEventListener('submit', async (e) => {
      e.preventDefault();
      await salvarTransacao();
    });
  });
  
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
  
  async function salvarTransacao() {
    const tipo = document.getElementById('tipo').value;
    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const categoria_id = document.getElementById('categoria').value;
  
    const transacao = { tipo, descricao, valor, categoria_id };
  
    try {
      await fetch('http://localhost:3000/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transacao),
      });
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  }
  