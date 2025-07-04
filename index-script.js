// index-script.js

let leads = [];
let draggedId = null;

const db = firebase.database();
const leadsRef = db.ref("leads");

leadsRef.on("value", (snapshot) => {
  leads = [];
  snapshot.forEach((child) => {
    leads.push({ _id: child.key, ...child.val() });
  });
  renderBoard();
});

function abrirModal(card) {
  const id = card.dataset.id;
  const lead = leads.find(l => l._id === id);
  if (!lead) return;

  document.getElementById("editNome").value = lead.nome || "";
  document.getElementById("editTelefone").value = lead.telefone || "";
  document.getElementById("editObs").value = lead.obs || "";
  document.getElementById("editProximaAcao").value = lead.proximaAcao || "";
  document.getElementById("editTipoAcao").value = lead.tipoAcao || "Mensagem";

  document.getElementById("leadModal").dataset.id = id;
  document.getElementById("leadModal").style.display = "flex";
}

function fecharModal() {
  document.getElementById("leadModal").style.display = "none";
}

function salvarEdicao() {
  const id = document.getElementById("leadModal").dataset.id;
  if (!id) return;

  const data = {
    nome: document.getElementById("editNome").value,
    telefone: document.getElementById("editTelefone").value,
    obs: document.getElementById("editObs").value,
    proximaAcao: document.getElementById("editProximaAcao").value,
    tipoAcao: document.getElementById("editTipoAcao").value
  };

  db.ref(`leads/${id}`).update(data)
    .then(() => {
      alert("✅ Lead atualizado com sucesso!");
      fecharModal();
    })
    .catch(err => {
      console.error(err);
      alert("❌ Erro ao atualizar o lead!");
    });
}

function deletarLead(id) {
  if (confirm("Deseja apagar este lead?")) {
    db.ref(`leads/${id}`).remove();
  }
}

function drop(e) {
  e.preventDefault();
  const newStatus = e.currentTarget.closest(".column")?.dataset.status;
  if (draggedId && newStatus) {
    db.ref(`leads/${draggedId}`).update({ status: newStatus });
    draggedId = null;
  }
}

function renderBoard() {
  document.querySelectorAll(".lead-list").forEach(list => list.innerHTML = "");

  const hoje = new Date().toISOString().split("T")[0];
  const ontem = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  let countHoje = 0, countOntem = 0;

  leads.forEach(lead => {
    const card = document.createElement("div");
    card.className = "lead";
    card.draggable = true;
    card.dataset.id = lead._id;

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${lead.nome}</strong>
        <span class="delete-btn" title="Excluir Lead">🗑️</span>
      </div>
      📞 ${lead.telefone}<br>
      📌 Origem: ${lead.origem}<br>
      👤 Consultor: ${lead.consultor}<br>
      🧑‍💼 Gestor: ${lead.gestor}<br>
      🕐 Entrada: ${lead.dataHora ? new Date(lead.dataHora).toLocaleString() : '-'}<br>
      📝 ${lead.obs || 'Sem observações'}<br>
      🔁 Próx. ação: ${
        lead.proximaAcao
          ? `${lead.tipoAcao} em ${new Date(lead.proximaAcao).toLocaleString()}`
          : 'Não definida'
      }
    `;

    card.addEventListener("dragstart", e => {
      draggedId = lead._id;
      e.dataTransfer.setData("text/plain", draggedId);
      e.dataTransfer.effectAllowed = "move";
    });

    card.addEventListener("click", e => {
      if (e.target.classList.contains("delete-btn")) deletarLead(lead._id);
      else abrirModal(card);
    });

    let dataLead = "";
    if (lead.dataHora) {
      const dt = new Date(lead.dataHora);
      if (!isNaN(dt.getTime())) {
        dataLead = dt.toISOString().split("T")[0];
      }
    }


    if (dataLead === hoje) countHoje++;
    if (dataLead === ontem) countOntem++;

    console.log(`Total leads recebidos: ${leads.length}`);

    const status = (lead.status || "").trim().toLowerCase();
    const coluna = document.querySelector(`.column[data-status="${status}"] .lead-list`);
    if (coluna) coluna.appendChild(card);
    else console.warn("❗ Status inválido ou coluna não encontrada:", status);
  });

  document.getElementById("leads-hoje").textContent = countHoje;
  document.getElementById("leads-ontem").textContent = countOntem;

  document.querySelectorAll(".lead-list").forEach(list => {
    list.ondragover = e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };
    list.ondrop = drop;
  });
}

// Expondo para o HTML
window.fecharModal = fecharModal;
window.salvarEdicao = salvarEdicao;
