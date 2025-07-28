const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('reload')) {
  localStorage.removeItem('transacoesCache');
}
if (window.dashboardLoaded) {
  console.warn('Dashboard já carregado - evitando duplicação');
  
}
window.dashboardLoaded = true;
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Iniciando dashboard...');
    
    // Verifica se as configurações foram carregadas
    if (!window.API_CONFIG) {
      throw new Error('Configurações da API não encontradas. Verifique se config.js está carregado corretamente.');
    }

    const token = localStorage.getItem('token');
    console.log('Verificando token...');
    
    if (!isValidToken(token)) {
      console.log('Token inválido ou não encontrado');
      throw new Error('Sessão inválida');
    }
    
    console.log('Token validado, iniciando carregamento...');
    await carregarDashboard(token);
  } catch (error) {
    console.error('Erro na inicialização:', error);
    if (error.message.includes('Servidor não está respondendo')) {
      alert('Erro: O servidor não está respondendo. Verifique se o backend está rodando.');
    } else {
      alert('Sessão expirada ou inválida. Por favor, faça login novamente.');
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    }
  }
});

let graficoPizza; // Sem inicialização

async function carregarDashboard(token){
  if (!token) {
    throw new Error('Token não fornecido');
     
  }

  try {
    if (!window.API_CONFIG || !window.API_CONFIG.API_BASE_URL) {
      throw new Error('Configurações da API não encontradas');
    }

    console.log('Iniciando carregamento do dashboard...');
    console.log('API URL:', API_BASE_URL);
    console.log('Token presente:', !!token);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    console.log('Headers configurados:', headers);

    const response = await fetch(`${API_BASE_URL}/transacoes`, {
      method: 'GET',
      headers: headers
    });

    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(e => ({ error: 'Erro ao processar resposta' }));
      console.error('Erro na resposta:', errorData);
      throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
    }

    const transacoes = await response.json();
    console.log('Transações recebidas:', transacoes);

    if (!Array.isArray(transacoes)) {
      console.error('Resposta não é um array:', transacoes);
      throw new Error('Formato de resposta inválido');
    }

    processarTransacoes(transacoes);

  } catch (error) {
    console.error('Erro detalhado ao carregar dashboard:', error);
    if (error.message.includes('Failed to fetch')) {
      alert('Erro de conexão com o servidor. Verifique se o backend está rodando.');
    } else {
      localStorage.removeItem('token');
      alert('Sessão expirada ou erro ao carregar informações. Faça login novamente.');
      window.location.href = 'login.html';
    }
  }
}

function processarTransacoes(transacoes) {
  if (!Array.isArray(transacoes)) {
    console.error('Dados inválidos recebidos:', transacoes);
    throw new Error('Formato de dados inválido');
  }

  console.log(`Processando ${transacoes.length} transações...`);
  
  let saldo = 0, totalReceitas = 0, totalDespesas = 0;
  const lista = document.getElementById('transacoes');
  if (!lista) {
    console.error('Elemento "transacoes" não encontrado no DOM');
    throw new Error('Elemento da lista não encontrado');
  }
  
  lista.innerHTML = '';
  
  const categorias = { receita: {}, despesa: {} };

  transacoes.forEach(t => {
    const li = document.createElement('li');
    li.textContent = `${formatarData(t.data)} - ${t.descricao} - ${formatarMoeda(t.valor)} (${t.tipo})`;
    li.style.color = t.tipo === 'receita' ? '#28a745' : '#dc3545';
    li.style.position = 'relative';

    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.id = `btn-editar-${t.id}`;
    btnEditar.className = 'btn-editar';
    btnEditar.onclick = () => editarTransacao(t);

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir';
    btnExcluir.id = `btn-excluir-${t.id}`;
    btnExcluir.className = 'btn-excluir';
    btnExcluir.onclick = () => excluirTransacao(t.id);

    li.appendChild(btnEditar);
    li.appendChild(btnExcluir);
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
  const canvas = document.getElementById('grafico-pizza');
  if (!canvas) {
    console.error('Elemento do gráfico não encontrado!');
    return;
  }
  const ctx = canvas.getContext('2d');
  console.log('Dados recebidos:', categorias);
  // Verifica se há dados para mostrar
  const temReceitas = Object.keys(categorias.receita).length > 0;
  console.log('temReceitas: ', temReceitas, categorias.receita);
  const temDespesas = Object.keys(categorias.despesa).length > 0;
  console.log('temDespesas: ', temDespesas, categorias.despesa);
  if (!temReceitas && !temDespesas) {
    canvas.style.display = 'none';
    return;
  }
  canvas.style.display = 'block';
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

  const config = {
    type: 'pie',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#000',
            padding: 10,
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
  if (typeof graficoPizza !== 'undefined' && graficoPizza !== null) {
    graficoPizza.destroy();
  }
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
    return dataString; 
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

// Função para excluir transação
async function excluirTransacao(id) {
  if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/transacoes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      alert('Transação excluída com sucesso!');
      await carregarDashboard(token); // Recarrega e atualiza gráfico
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Erro ao excluir transação.');
    }
  } catch (error) {
    alert('Erro ao excluir transação.');
  }
}

// Função para editar transação (inline)
function editarTransacao(transacao) {
  const lista = document.getElementById('transacoes');
  const li = Array.from(lista.children).find(el => el.textContent.includes(transacao.descricao));
  if (!li) return;
  // Cria formulário de edição inline
  li.innerHTML = `
    <input type="date" id="edit-data" value="${transacao.data ? transacao.data.split('T')[0] : ''}" style="width:110px;" />
    <input type="text" id="edit-descricao" value="${transacao.descricao}" style="width:110px;" />
    <input type="number" id="edit-valor" value="${transacao.valor}" style="width:80px;" step="0.01" />
    <select id="edit-tipo" style="width:90px;">
      <option value="receita" ${transacao.tipo === 'receita' ? 'selected' : ''}>Receita</option>
      <option value="despesa" ${transacao.tipo === 'despesa' ? 'selected' : ''}>Despesa</option>
    </select>
    <input type="text" id="edit-categoria" value="${transacao.categoria || ''}" style="width:110px;" />
    <button onclick="salvarEdicaoTransacao(${transacao.id})">Salvar</button>
    <button onclick="carregarDashboard(localStorage.getItem('token'))">Cancelar</button>
  `;
}

// Função para salvar edição
async function salvarEdicaoTransacao(id) {
  const token = localStorage.getItem('token');
  const data = document.getElementById('edit-data').value;
  const descricao = document.getElementById('edit-descricao').value;
  const valor = parseFloat(document.getElementById('edit-valor').value);
  const tipo = document.getElementById('edit-tipo').value;
  const categoria = document.getElementById('edit-categoria').value;
  if (!descricao || !valor || !tipo) {
    alert('Preencha todos os campos!');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/transacoes/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data,
        descricao,
        valor,
        tipo,
        categoria
      })
    });
    if (response.ok) {
      alert('Transação editada com sucesso!');
      await carregarDashboard(token); // Atualiza lista e gráfico
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Erro ao editar transação.');
    }
  } catch (error) {
    alert('Erro ao editar transação.');
  }
}