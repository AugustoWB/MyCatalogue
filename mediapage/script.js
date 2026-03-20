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

      rows.forEach(r => {
        if (!r.c || !r.c[1]) return; // evita linhas vazias

        let nome = r.c[1]?.v || "";
        let status = r.c[2]?.v || "";
        let nota = "";
        let extra = "";
        let imagem = "";

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

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
          ${imagem ? `<img src="${imagem}" width="100%">` : ""}
          <h3>${nome}</h3>
          <p>⭐ ${nota}</p>
          <p>${status}</p>
          <p>${extra}</p>
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