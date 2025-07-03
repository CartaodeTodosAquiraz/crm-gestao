
// scriptto.js atualizado para Firebase
import { db, ref, set, push, onValue, update, remove } from './firebase-init.js';

let indicados = [];
let indicadores = [];
let editandoIndex = null;
let editandoTipo = null;
let vendasPorConsultor = {};

let paginaIndicados = 1;
let paginaIndicadores = 1;
const itensPorPagina = 15;

// Referências do Firebase
const indicadosRef = ref(db, "indicados");
const indicadoresRef = ref(db, "indicadores");

// Carregar dados em tempo real
onValue(indicadosRef, snapshot => {
  indicados = [];
  snapshot.forEach(child => {
    indicados.push({ ...child.val(), _id: child.key });
  });
  renderizarTabelas();
});

onValue(indicadoresRef, snapshot => {
  indicadores = [];
  snapshot.forEach(child => {
    indicadores.push({ ...child.val(), _id: child.key });
  });
  renderizarTabelas();
});

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
          <button onclick="excluir('${item._id}', 'indicado')">🗑️</button>
        </td>
      </tr>`;
  });

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
          <button onclick="excluir('${item._id}', 'indicador')">🗑️</button>
        </td>
      </tr>`;
  });

  atualizarMetricas();
}

function excluir(id, tipo) {
  const targetRef = tipo === "indicado" ? ref(db, `indicados/${id}`) : ref(db, `indicadores/${id}`);
  remove(targetRef);
}

document.getElementById("form-organico").addEventListener("submit", e => {
  e.preventDefault();
  const tipo = document.getElementById("tipo").value;

  if (tipo === "indicado") {
    const novo = {
      nome: document.getElementById("nome").value,
      telefone: document.getElementById("telefone").value,
      indicador: document.getElementById("indicador").value,
      obs: document.getElementById("obs-indicado").value,
      consultor: document.getElementById("consultor").value,
      data: new Date().toISOString().split("T")[0],
      vendaFechada: false
    };
    push(indicadosRef, novo);
  } else {
    const novo = {
      filiado: document.getElementById("filiado").value,
      matricula: document.getElementById("matricula").value,
      obs: document.getElementById("obs-indicador").value,
      quantidade: parseInt(document.getElementById("quantidade").value),
      tratativa: document.getElementById("tratativa").value
    };
    push(indicadoresRef, novo);
  }

  e.target.reset();
});
