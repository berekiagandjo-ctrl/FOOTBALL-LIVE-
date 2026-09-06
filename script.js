// ----------------------------------------------------
// CONFIG API
// ----------------------------------------------------
// Inscris-toi gratuitement sur https://www.football-data.org/
// pour obtenir une clé API, puis colle-la ci-dessous.
const API_KEY = ""; // <-- mets ta clé ici
const API_BASE = "https://api.football-data.org/v4";

// Codes de compétitions football-data.org
const LEAGUE_CODES = {
  PL: "PL",   // Premier League
  FL1: "FL1", // Ligue 1
  PD: "PD"    // Liga
};

let currentLeague = "PL";

// ----------------------------------------------------
// DONNEES D'EXEMPLE (utilisées tant qu'il n'y a pas de clé API)
// ----------------------------------------------------
const SAMPLE_MATCHES = {
  PL: [
    { home: "Arsenal FC", away: "Coventry City", homeScore: 3, awayScore: 0, status: "FINISHED" },
    { home: "Hull City", away: "Manchester United", homeScore: 2, awayScore: 0, status: "FINISHED" },
    { home: "Everton FC", away: "Crystal Palace", homeScore: 2, awayScore: 0, status: "FINISHED" },
    { home: "Brighton", away: "Aston Villa", homeScore: null, awayScore: null, status: "SCHEDULED", time: "Dim 14:00" },
    { home: "Manchester City", away: "Bournemouth", homeScore: null, awayScore: null, status: "SCHEDULED", time: "Dim 14:00" },
    { home: "Newcastle", away: "Liverpool FC", homeScore: null, awayScore: null, status: "SCHEDULED", time: "Dim 16:30" }
  ],
  FL1: [
    { home: "PSG", away: "Marseille", homeScore: 2, awayScore: 1, status: "FINISHED" },
    { home: "Lyon", away: "Monaco", homeScore: null, awayScore: null, status: "SCHEDULED", time: "Dim 17:00" }
  ],
  PD: [
    { home: "Real Madrid", away: "Barcelona", homeScore: 1, awayScore: 1, status: "FINISHED" },
    { home: "Atletico Madrid", away: "Sevilla", homeScore: null, awayScore: null, status: "SCHEDULED", time: "Dim 20:00" }
  ]
};

// ----------------------------------------------------
// AFFICHAGE
// ----------------------------------------------------
function renderMatches(matches) {
  const list = document.getElementById("matches-list");
  list.innerHTML = "";

  if (!matches || matches.length === 0) {
    list.innerHTML = '<p class="loading">Aucun match trouvé.</p>';
    return;
  }

  matches.forEach(m => {
    const card = document.createElement("div");
    card.className = "match-card";

    const isFinished = m.status === "FINISHED";
    const statusLabel = isFinished ? "Terminé" : (m.time || "À venir");

    card.innerHTML = `
      <div class="match-teams">
        <div class="team">
          <span class="team-name">${m.home}</span>
          <span class="team-score">${m.homeScore ?? "-"}</span>
        </div>
        <div class="team">
          <span class="team-name">${m.away}</span>
          <span class="team-score">${m.awayScore ?? "-"}</span>
        </div>
      </div>
      <span class="match-status ${isFinished ? "finished" : ""}">${statusLabel}</span>
    `;
    list.appendChild(card);
  });
}

// ----------------------------------------------------
// RECUPERATION DES DONNEES
// ----------------------------------------------------
async function loadMatches(league) {
  const list = document.getElementById("matches-list");
  list.innerHTML = '<p class="loading">Chargement des matchs...</p>';

  // Si pas de clé API configurée, on utilise les données d'exemple
  if (!API_KEY) {
    setTimeout(() => renderMatches(SAMPLE_MATCHES[league]), 300);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/competitions/${LEAGUE_CODES[league]}/matches?status=SCHEDULED,FINISHED,LIVE`, {
      headers: { "X-Auth-Token": API_KEY }
    });

    if (!response.ok) throw new Error("Erreur API: " + response.status);

    const data = await response.json();
    const matches = data.matches.map(m => ({
      home: m.homeTeam.name,
      away: m.awayTeam.name,
      homeScore: m.score.fullTime.home,
      awayScore: m.score.fullTime.away,
      status: m.status,
      time: new Date(m.utcDate).toLocaleString("fr-FR", { weekday: "short", hour: "2-digit", minute: "2-digit" })
    }));

    renderMatches(matches);
  } catch (err) {
    console.error(err);
    list.innerHTML = `<p class="loading">Erreur de chargement. Vérifie ta clé API.</p>`;
  }
}

// ----------------------------------------------------
// EVENEMENTS
// ----------------------------------------------------
document.getElementById("league-tabs").addEventListener("click", (e) => {
  if (!e.target.classList.contains("tab")) return;

  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  e.target.classList.add("active");

  currentLeague = e.target.dataset.league;
  loadMatches(currentLeague);
});

document.getElementById("refresh-btn").addEventListener("click", () => {
  loadMatches(currentLeague);
});

// Chargement initial
loadMatches(currentLeague);
