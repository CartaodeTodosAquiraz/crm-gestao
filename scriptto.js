let indicados = JSON.parse(localStorage.getItem("indicados") || "[]");
let indicadores = JSON.parse(localStorage.getItem("indicadores") || "[]");
let editandoIndex = null;
let editandoTipo = null;
let vendasPorConsultor = {};


let paginaIndicados = 1;
let paginaIndicadores = 1;
const itensPorPagina = 15;


function salvarDados() {
  localStorage.setItem("indicados", JSON.stringify(indicados));
  localStorage.setItem("indicadores", JSON.stringify(indicadores));
}

function atualizarMetricas() {
  const hoje = new Date().toISOString().split("T")[0];
  const ontem = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  document.getElementById("total-indicacoes").textContent = indicados.length;
  document.getElementById("indicacoes-hoje").textContent = indicados.filter(i => i.data === hoje).length;
  document.getElementById("indicacoes-ontem").textContent = indicados.filter(i => i.data === ontem).length;

  const contagem = {
    "Refuturiza": 0,
    "Filiado com aplicativo baixado": 0,
    "Matriculas endereço divergente do cadastro": 0,
    "Carteiras que ja havia sido pagas e enviado o comprovante para o consultor e ainda nao tinha sido entregues": 0,
    "Agendamentos de odontologia": 0,
    "Agendamentos de Consultas": 0,
    "Inclusão de dependentes": 0,
    "Retirada de Carteiras": 0
  };

  indicadores.forEach(ind => {
    if (ind.tratativa && contagem.hasOwnProperty(ind.tratativa)) {
      contagem[ind.tratativa]++;
    }
  });

document.getElementById("odontologia").textContent = contagem["Agendamentos de odontologia"];
document.getElementById("consultas").textContent = contagem["Agendamentos de Consultas"];
document.getElementById("dependentes").textContent = contagem["Inclusão de dependentes"];
document.getElementById("carteiras").textContent = contagem["Retirada de Carteiras"];
document.getElementById("refuturiza").textContent = contagem["Refuturiza"];
document.getElementById("app").textContent = contagem["Filiado com aplicativo baixado"];
document.getElementById("endereco").textContent = contagem["Matriculas endereço divergente do cadastro"];
document.getElementById("comprovante").textContent = contagem["Carteiras que ja havia sido pagas e enviado o comprovante para o consultor e ainda nao tinha sido entregues"];


  document.getElementById("vendas").textContent = indicados.filter(i => i.vendaFechada).length;
  atualizarTabelaVendas();
}

function atualizarTabelaVendas() {
  vendasPorConsultor = {};
  indicados.forEach(i => {
    if (i.vendaFechada && i.consultor) {
      vendasPorConsultor[i.consultor] = (vendasPorConsultor[i.consultor] || 0) + 1;
    }
  });

  const corpo = document.querySelector("#tabela-vendas tbody");
  corpo.innerHTML = "";
  for (let consultor in vendasPorConsultor) {
    corpo.innerHTML += `<tr><td>${consultor}</td><td>${vendasPorConsultor[consultor]}</td></tr>`;
  }
}

function renderizarTabelas() {
  // ---------- TABELA INDICADOS ----------
  const tabelaInd = document.getElementById("tabela-indicados");
  tabelaInd.innerHTML = "";

  const inicioI = (paginaIndicados - 1) * itensPorPagina;
  const fimI = inicioI + itensPorPagina;
  const paginaInd = indicados.slice(inicioI, fimI);

  paginaInd.forEach((item, i) => {
    const indexReal = inicioI + i;
    tabelaInd.innerHTML += `
      <tr>
        <td>${item.nome}</td><td>${item.telefone}</td><td>${item.indicador}</td><td>${item.obs}</td><td>${item.consultor}</td>
        <td>
          <button onclick="editar(${indexReal}, 'indicado')">✏️</button>
          <button onclick="excluir(${indexReal}, 'indicado')">🗑️</button>
        </td>
      </tr>`;
  });

  atualizarPaginacao("indicados");

  // ---------- TABELA INDICADORES ----------
  const tabelaIndicadores = document.getElementById("tabela-indicadores");
  tabelaIndicadores.innerHTML = "";

  const inicioR = (paginaIndicadores - 1) * itensPorPagina;
  const fimR = inicioR + itensPorPagina;
  const paginaIndicadoresAtual = indicadores.slice(inicioR, fimR);

  paginaIndicadoresAtual.forEach((item, i) => {
    const indexReal = inicioR + i;
    tabelaIndicadores.innerHTML += `
      <tr>
        <td>${item.filiado}</td><td>${item.matricula}</td><td>${item.obs}</td><td>${item.quantidade}</td><td>${item.tratativa}</td>
        <td>
          <button onclick="editar(${indexReal}, 'indicador')">✏️</button>
          <button onclick="excluir(${indexReal}, 'indicador')">🗑️</button>
        </td>
      </tr>`;
  });

  atualizarPaginacao("indicadores");

  atualizarMetricas();
}

function atualizarPaginacao(tipo) {
  let total, paginaAtual, divPaginacao;

  if (tipo === "indicados") {
    total = Math.ceil(indicados.length / itensPorPagina);
    paginaAtual = paginaIndicados;
    divPaginacao = document.getElementById("indicados-paginacao");
  } else {
    total = Math.ceil(indicadores.length / itensPorPagina);
    paginaAtual = paginaIndicadores;
    divPaginacao = document.getElementById("indicadores-paginacao");
  }

  divPaginacao.innerHTML = "";

  if (total <= 1) return;

  if (paginaAtual > 1) {
    const btnPrev = document.createElement("button");
    btnPrev.textContent = "◀️";
    btnPrev.onclick = () => {
      if (tipo === "indicados") paginaIndicados--;
      else paginaIndicadores--;
      renderizarTabelas();
    };
    divPaginacao.appendChild(btnPrev);
  }

  const span = document.createElement("span");
  span.style.color = "#fff";
  span.style.margin = "0 10px";
  span.textContent = `Página ${paginaAtual} de ${total}`;
  divPaginacao.appendChild(span);

  if (paginaAtual < total) {
    const btnNext = document.createElement("button");
    btnNext.textContent = "▶️";
    btnNext.onclick = () => {
      if (tipo === "indicados") paginaIndicados++;
      else paginaIndicadores++;
      renderizarTabelas();
    };
    divPaginacao.appendChild(btnNext);
  }
}


function editar(i, tipo) {
  editandoIndex = i;
  editandoTipo = tipo;
  document.getElementById("modal-edicao").style.display = "block";

  if (tipo === "indicado") {
    const item = indicados[i];
    document.getElementById("edit-nome").value = item.nome;
    document.getElementById("edit-telefone").value = item.telefone;
    document.getElementById("edit-indicador").value = item.indicador;
    document.getElementById("edit-obs-indicado").value = item.obs;
    document.getElementById("edit-consultor").value = item.consultor;
    document.getElementById("edicao-indicado").style.display = "block";
    document.getElementById("edicao-indicador").style.display = "none";
  } else {
    const item = indicadores[i];
    document.getElementById("edit-filiado").value = item.filiado;
    document.getElementById("edit-matricula").value = item.matricula;
    document.getElementById("edit-obs-indicador").value = item.obs;
    document.getElementById("edit-quantidade").value = item.quantidade;
    document.getElementById("edit-tratativa").value = item.tratativa;
    document.getElementById("edicao-indicador").style.display = "block";
    document.getElementById("edicao-indicado").style.display = "none";
  }
}

salvarDados();


function excluir(i, tipo) {
  if (tipo === "indicado") indicados.splice(i, 1);
  else indicadores.splice(i, 1);
  salvarDados();
  renderizarTabelas();
}

function fecharModal() {
  document.getElementById("modal-edicao").style.display = "none";
  editandoIndex = null;
  editandoTipo = null;
}

document.getElementById("form-organico").addEventListener("submit", e => {
  e.preventDefault();
  const tipo = document.getElementById("tipo").value;

  if (tipo === "indicado") {
    indicados.push({
      nome: document.getElementById("nome").value,
      telefone: document.getElementById("telefone").value,
      indicador: document.getElementById("indicador").value,
      obs: document.getElementById("obs-indicado").value,
      consultor: document.getElementById("consultor").value,
      data: new Date().toISOString().split("T")[0],
      vendaFechada: false
    });
  } else {
    indicadores.push({
      filiado: document.getElementById("filiado").value,
      matricula: document.getElementById("matricula").value,
      obs: document.getElementById("obs-indicador").value,
      quantidade: parseInt(document.getElementById("quantidade").value),
      tratativa: document.getElementById("tratativa").value
    });
  }

  salvarDados();
  e.target.reset();
  renderizarTabelas();
});

document.getElementById("form-editar").addEventListener("submit", e => {
  e.preventDefault();
  if (editandoTipo === "indicado") {
    const item = indicados[editandoIndex];
    item.nome = document.getElementById("edit-nome").value;
    item.telefone = document.getElementById("edit-telefone").value;
    item.indicador = document.getElementById("edit-indicador").value;
    item.obs = document.getElementById("edit-obs-indicado").value;
    item.consultor = document.getElementById("edit-consultor").value;
  } else {
    const item = indicadores[editandoIndex];
    item.filiado = document.getElementById("edit-filiado").value;
    item.matricula = document.getElementById("edit-matricula").value;
    item.obs = document.getElementById("edit-obs-indicador").value;
    item.quantidade = parseInt(document.getElementById("edit-quantidade").value);
    item.tratativa = document.getElementById("edit-tratativa").value;
  }
  salvarDados();
  fecharModal();
  salvarDados();
  renderizarTabelas();
});


salvarDados();

document.getElementById("botao-venda").addEventListener("click", () => {
  if (editandoTipo === "indicado") {
    indicados[editandoIndex].vendaFechada = true;
    salvarDados();
    alert("Venda marcada com sucesso!");
    fecharModal();
    renderizarTabelas();
  }
});

document.getElementById("tipo").addEventListener("change", e => {
  const val = e.target.value;
  document.getElementById("form-indicador").style.display = val === "indicador" ? "block" : "none";
  document.getElementById("form-indicado").style.display = val === "indicado" ? "block" : "none";
  salvarDados();
});

document.addEventListener("DOMContentLoaded", renderizarTabelas);