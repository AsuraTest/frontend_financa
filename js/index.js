require('dotenv').config();
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Você precisa estar logado para acessar o dashboard');
    window.location.href = 'login.html';
    return;
  }

  carregarDashboard(token); 
});

let graficoPizza = null;

async function carregarDashboard(token) {
  try {
    const response = await fetch('http://localhost:3000/transacoes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Falha na autenticação ou no servidor');
    const transacoes = await response.json();

    processarTransacoes(transacoes);

  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    localStorage.removeItem('token'); 
    alert('Sessão expirada ou erro ao carregar informações. Faça login novamente.');
    window.location.href = 'login.html';
  }
}

function processarTransacoes(transacoes) {
  let saldo = 0, totalReceitas = 0, totalDespesas = 0;
  const lista = document.getElementById('transacoes');
  lista.innerHTML = '';
  
  const categorias = { receita: {}, despesa: {} };

  transacoes.forEach(t => {
    const li = document.createElement('li');
    li.textContent = `${formatarData(t.data)} - ${t.descricao} - ${formatarMoeda(t.valor)} (${t.tipo})`;
    li.style.color = t.tipo === 'receita' ? '#28a745' : '#dc3545';
    lista.appendChild(li);

    const valor = parseFloat(t.valor);
    const categoria = t.categoria || (t.tipo === 'receita' ? 'Outras Receitas' : 'Outras Despesas');
    
    if (t.tipo === 'receita') {
      totalReceitas += valor;
      categorias.receita[categoria] = (categorias.receita[categoria] || 0) + valor;
    } else {
      totalDespesas += valor;
      categorias.despesa[categoria] = (categorias.despesa[categoria] || 0) + valor;
    }
  });

  saldo = totalReceitas - totalDespesas;
  atualizarValores(saldo, totalReceitas, totalDespesas);
  atualizarGraficoPizza(categorias);
}

function atualizarGraficoPizza(categorias) {
  const ctx = document.getElementById('grafico-pizza');
  if (!ctx) {
    console.error('Elemento do gráfico não encontrado!');
    return;
  }

  // Verifica se há dados para mostrar
  const temReceitas = Object.keys(categorias.receita).length > 0;
  const temDespesas = Object.keys(categorias.despesa).length > 0;

  if (!temReceitas && !temDespesas) {
    ctx.style.display = 'none'; // Esconde o canvas se não houver dados
    const container = document.getElementById('grafico-container');
    if (container) {
      container.innerHTML += '<p style="text-align: center;">Nenhum dado disponível para o gráfico</p>';
    }
    return;
  }

  ctx.style.display = 'block';

  const data = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: '#fff',
      borderWidth: 1
    }]
  };

  // Adiciona receitas (verde)
  Object.entries(categorias.receita).forEach(([categoria, valor]) => {
    data.labels.push(`Receita: ${categoria}`);
    data.datasets[0].data.push(valor);
    data.datasets[0].backgroundColor.push('#4CAF50'); // Verde mais vibrante
  });

  // Adiciona despesas (vermelho)
  Object.entries(categorias.despesa).forEach(([categoria, valor]) => {
    data.labels.push(`Despesa: ${categoria}`);
    data.datasets[0].data.push(valor);
    data.datasets[0].backgroundColor.push('#F44336'); // Vermelho mais vibrante
  });

  // Se não houver dados
  if (data.datasets[0].data.length === 0) {
    data.labels.push('Sem dados disponíveis');
    data.datasets[0].data.push(1);
    data.datasets[0].backgroundColor.push('#9E9E9E'); // Cinza
  }

  // Configurações do gráfico
 const config = {
  type: 'pie',
  data: data,
  options: {
    responsive: true,
    maintainAspectRatio: false, // Isso é crucial!
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#000',
          padding: 10, // Reduzi o padding
          font: { 
            size: 12,
            family: 'Arial'
          },
          boxWidth: 12
        }
      },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${formatarMoeda(value)} (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  };

  // Destrói e recria o gráfico
  if (graficoPizza) graficoPizza.destroy();
  graficoPizza = new Chart(ctx, config);
}

function formatarData(dataString) {
  if (!dataString) return 'Data não informada';
  
  try {
    const data = dataString.includes('-') ? 
      new Date(dataString) : 
      new Date(dataString.split('/').reverse().join('-'));
    
    return data.toLocaleDateString('pt-BR');
  } catch {
    return dataString; // Retorna o original se não conseguir converter
  }
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function atualizarValores(saldo, totalReceitas, totalDespesas) {
  const saldoElement = document.getElementById('valor-saldo');
  if (saldoElement) {
    saldoElement.textContent = formatarMoeda(saldo);
    saldoElement.style.color = saldo > 0 ? '#28a745' : saldo < 0 ? '#dc3545' : '#6c757d';
  }

  const receitasElement = document.getElementById('total-receitas');
  if (receitasElement) {
    receitasElement.textContent = formatarMoeda(totalReceitas);
    receitasElement.style.color = '#28a745';
  }

  const despesasElement = document.getElementById('total-despesas');
  if (despesasElement) {
    despesasElement.textContent = formatarMoeda(totalDespesas);
    despesasElement.style.color = '#dc3545';
  }
}

// Funções do menu lateral
function openNav() {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  if (sidebar && main) {
    sidebar.style.width = "150px";
    main.style.marginRight = "150px";
  }
}

function closeNav() {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  if (sidebar && main) {
    sidebar.style.width = "0";
    main.style.marginRight = "0";
  }
}

function toggleNav() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    if (sidebar.style.width === "150px") {
      closeNav();
    } else {
      openNav();
    }
  }
}