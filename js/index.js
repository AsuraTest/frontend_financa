document.addEventListener('DOMContentLoaded', () => {
    carregarDashboard();
  });
  
  async function carregarDashboard() {
    try {
      const response = await fetch('http://localhost:3000/transacoes');
      const transacoes = await response.json();
  
      let saldo = 0;
      let totalReceitas = 0;
      let totalDespesas = 0;
  
      const lista = document.getElementById('transacoes');
      lista.innerHTML = '';
  
      transacoes.forEach(t => {
        const li = document.createElement('li');
        li.textContent = `${t.data} - ${t.descricao} - R$ ${t.valor} (${t.tipo})`;
        lista.appendChild(li);
  
        if (t.tipo === 'receita') totalReceitas += parseFloat(t.valor);
        if (t.tipo === 'despesa') totalDespesas += parseFloat(t.valor);
      });
  
      saldo = totalReceitas - totalDespesas;
  
      document.getElementById('valor-saldo').textContent = saldo.toFixed(2);
      document.getElementById('total-receitas').textContent = totalReceitas.toFixed(2);
      document.getElementById('total-despesas').textContent = totalDespesas.toFixed(2);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  }
  