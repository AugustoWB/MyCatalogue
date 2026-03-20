const SHEET_ID = "1Z107sY8dE37j4rv6xFmnewFeWVPmiv6UeAOiaODgCWo";

function carregar(sheet) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheet}`;

  fetch(url)
    .then(res => res.text())
    .then(data => {
      const json = JSON.parse(data.substr(47).slice(0, -2));
      const rows = json.table.rows;

      const lista = document.getElementById("lista");
      lista.innerHTML = "";

      //r = row, c = column, v = value. Sim, que imbecil esse google

      rows.forEach(r => {
        if (!r.c || !r.c[1]) return; // evita linhas vazias

        let nome = r.c[1]?.v || "";
        let status = r.c[2]?.v || "";
        let nota = "";
        let extra = "";
        let imagem = "";
        let notaClasse = "";
        let statusClass = "";

        if (sheet === "jogos") {
          nota = r.c[4]?.v || "-";
          imagem = r.c[6]?.v || "";
          extra = "🎮 " + (r.c[7]?.v || 0) + "h";
        }

        if (sheet === "livros") {
          nota = r.c[3]?.v || "-";
          imagem = r.c[5]?.v || "";
          extra = "📖 " + (r.c[6]?.v || 0) + " páginas";
        }

        if (sheet === "video") {
          nota = r.c[3]?.v || "-";
          imagem = r.c[5]?.v || "";
          extra = "📺 " + (r.c[6]?.v || 0) + " eps";
        }

        const notaNumero = Number.parseFloat(String(nota).replace(",", "."));
        if (!Number.isNaN(notaNumero)) {
          if (notaNumero >= 5) {
            notaClasse = "nota-verde";
          } else if (notaNumero >= 3 && notaNumero < 5) {
            notaClasse = "nota-amarelo";
          } else if (notaNumero <= 2) {
            notaClasse = "nota-vermelho";
          }
        }

        const statusMap = {
          "completed": "Completo",
          "library": "Na Biblioteca",
          "playing": "Jogando",
          "dropped": "Abandonado",
        };
        
        const statusRaw = (r.c[2]?.v || "").toLowerCase().trim();
        const statusText = statusMap[statusRaw] || "Unknown status";

        if (statusRaw === "completed") {
          statusClass = "status-completed";
        } else if (statusRaw === "library") {
          statusClass = "status-library";
        } else if (statusRaw === "playing") {
          statusClass = "status-playing";
        } else if (statusRaw === "dropped") {
          statusClass = "status-dropped";
        } else {
          statusClass = "";
        }

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
        ${imagem ? `<img src="${imagem}">` : ""}

        <div class="info">
          <h3>${nome}</h3>

          <div class="meta">
            <span class="nota ${notaClasse}">${nota}</span>
            <span class="status ${statusClass}">${statusText}</span>
            <span>${extra}</span>
          </div>
        </div>
      `;

        lista.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Erro ao carregar:", err);
    });
}

// carrega jogos automaticamente ao abrir
carregar("jogos");
