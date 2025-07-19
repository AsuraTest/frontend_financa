document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Você precisa estar logado para acessar o dashboard');
    window.location.href = 'login.html';
    return;
  }

  carregarDashboard(token); 
});

async function carregarDashboard(token) {
  try {
    const response = await fetch('http://localhost:3000/transacoes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Falha na autenticação ou no servidor');
    }

    const transacoes = await response.json();

    let saldo = 0;
    let totalReceitas = 0;
    let totalDespesas = 0;

    const lista = document.getElementById('transacoes');
    lista.innerHTML = ''; 

    transacoes.forEach(t => {
      const li = document.createElement('li');
      li.textContent = `${t.data} - ${t.descricao} - ${formatarMoeda(t.valor)} (${t.tipo})`;

      if (t.tipo === 'receita') {
        li.style.color = '#28a745'; 
      } else if (t.tipo === 'despesa') {
        li.style.color = '#dc3545'; 
      }
      
      lista.appendChild(li);

      if (t.tipo === 'receita') totalReceitas += parseFloat(t.valor);
      if (t.tipo === 'despesa') totalDespesas += parseFloat(t.valor);
    });

    saldo = totalReceitas - totalDespesas;

    const saldoElement = document.getElementById('valor-saldo');
    saldoElement.textContent = formatarMoeda(saldo);

    if (saldo > 0) {
      saldoElement.style.color = '#28a745'; 
    } else if (saldo < 0) {
      saldoElement.style.color = '#dc3545'; 
    } else {
      saldoElement.style.color = '#6c757d';
    }

    const receitasElement = document.getElementById('total-receitas');
    receitasElement.textContent = formatarMoeda(totalReceitas);
    if (totalReceitas > 0) {
      receitasElement.style.color = '#28a745';
    } else if (totalReceitas < 0) {
      receitasElement.style.color = '#dc3545'; 
    } else {
      receitasElement.style.color = '#6c757d'; 
    }

    const despesasElement = document.getElementById('total-despesas');
    despesasElement.textContent = formatarMoeda(totalDespesas);
    if (totalDespesas > 0) {
      despesasElement.style.color = '#dc3545'; 
    } else if (totalDespesas < 0) {
      despesasElement.style.color = '#28a745'; 
    } else {
      despesasElement.style.color = '#6c757d'; 
    }

  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    localStorage.removeItem('token'); 
    alert('Sessão expirada ou erro ao carregar informações. Faça login novamente.');
    window.location.href = 'login.html';
  }
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function openNav() {
  document.getElementById("sidebar").style.width = "150px";
  document.getElementById("main").style.marginRight = "150px";
}

function closeNav() {
  document.getElementById("sidebar").style.width = "0";
  document.getElementById("main").style.marginRight = "0";
}

function toggleNav() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar.style.width === "150px") {
    closeNav();
  } else {
    openNav();
  }
}
