const SHEET_ID = "1Z107sY8dE37j4rv6xFmnewFeWVPmiv6UeAOiaODgCWo";

function parseSheetDate(cell) {
  const rawValue = cell?.v;
  const formattedValue = cell?.f;

  if (rawValue instanceof Date) {
    return rawValue.getTime();
  }

  if (typeof rawValue === "number") {
    return rawValue;
  }

  const textValue = typeof rawValue === "string" && rawValue.trim()
    ? rawValue.trim()
    : typeof formattedValue === "string" && formattedValue.trim()
      ? formattedValue.trim()
      : "";

  if (!textValue) {
    return null;
  }

  const dateMatch = textValue.match(/Date\((\d+),(\d+),(\d+)/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return new Date(Number(year), Number(month), Number(day)).getTime();
  }

  const parsedDate = Date.parse(textValue);
  return Number.isNaN(parsedDate) ? null : parsedDate;
}

function getEndedDisplay(cell) {
  if (typeof cell?.f === "string" && cell.f.trim()) {
    return cell.f.trim();
  }

  if (cell?.v instanceof Date) {
    return cell.v.toLocaleDateString("pt-BR");
  }

  if (typeof cell?.v === "string" && cell.v.trim()) {
    return cell.v.trim();
  }

  return "";
}

function carregar(sheet) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheet}`;

  fetch(url)
    .then(res => res.text())
    .then(data => {
      const json = JSON.parse(data.substr(47).slice(0, -2));
      const rows = json.table.rows;
      const statusConfig = {
        jogos: {
          order: {
            playing: 0,
            completed: 1,
            dropped: 2,
            library: 3,
          },
          labels: {
            completed: "Completo",
            library: "Na Biblioteca",
            playing: "Jogando",
            dropped: "Abandonado",
          },
          endedColumn: 8,
        },
        video: {
          order: {
            watching: 0,
            watched: 1,
            dropped: 2,
            library: 3,
          },
          labels: {
            watching: "Assistindo",
            watched: "Assistido",
            dropped: "Abandonado",
            library: "Na Biblioteca",
          },
          endedColumn: 8,
        },
        livros: {
          order: {
            reading: 0,
            readed: 1,
            dropped: 2,
            library: 3,
          },
          labels: {
            reading: "Lendo",
            readed: "Lido",
            dropped: "Abandonado",
            library: "Na Biblioteca",
          },
          endedColumn: 9,
        },
      };
      const currentStatusConfig = statusConfig[sheet] || statusConfig.jogos;

      const lista = document.getElementById("lista");
      lista.innerHTML = "";

      //r = row, c = column, v = value. Sim, que imbecil esse google
      rows
        .slice()
        .sort((a, b) => {
          const statusA = (a.c?.[2]?.v || "").toLowerCase().trim();
          const statusB = (b.c?.[2]?.v || "").toLowerCase().trim();

          const orderA = currentStatusConfig.order[statusA] ?? Number.MAX_SAFE_INTEGER;
          const orderB = currentStatusConfig.order[statusB] ?? Number.MAX_SAFE_INTEGER;

          if (orderA !== orderB) {
            return orderA - orderB;
          }

          const endedA = parseSheetDate(a.c?.[currentStatusConfig.endedColumn]);
          const endedB = parseSheetDate(b.c?.[currentStatusConfig.endedColumn]);

          if (endedA === endedB) {
            return 0;
          }

          if (endedA === null) {
            return 1;
          }

          if (endedB === null) {
            return -1;
          }

          return endedB - endedA;
        })
        .forEach(r => {
          if (!r.c || !r.c[1]) return; // evita linhas vazias

          let nome = r.c[1]?.v || "";
          let status = r.c[2]?.v || "";
          let nota = "";
          let extra = "";
          let imagem = "";
          let notaClasse = "";
          let statusClass = "";
          const endedText = getEndedDisplay(r.c?.[currentStatusConfig.endedColumn]);

          if (sheet === "jogos") {
            nota = r.c[4]?.v || "-";
            imagem = r.c[6]?.v || "";
            extra = "🎮 " + (r.c[7]?.v || 0) + "h";
          }

          if (sheet === "livros") {
            nota = r.c[4]?.v || "-";
            imagem = r.c[6]?.v || "";
            extra = "📖 " + (r.c[7]?.v || 0) + " páginas";
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

          const statusRaw = (status || "").toLowerCase().trim();
          const statusText = currentStatusConfig.labels[statusRaw] || "Unknown status";

          if (statusRaw === "completed" || statusRaw === "watched" || statusRaw === "readed") {
            statusClass = "status-completed";
          } else if (statusRaw === "library") {
            statusClass = "status-library";
          } else if (statusRaw === "playing" || statusRaw === "watching" || statusRaw === "reading") {
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
          ${endedText ? `<p class="ended">Finalizado em ${endedText}</p>` : ""}
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
