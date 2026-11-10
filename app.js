const sampleGames = [
 {league:"NFL",status:"FINAL",home:"Cincinnati Bengals",away:"Pittsburgh Steelers",hs:24,as:20},
 {league:"NBA",status:"UPCOMING",home:"Cleveland Cavaliers",away:"Boston Celtics",hs:"—",as:"—"},
 {league:"MLB",status:"UPCOMING",home:"Cleveland Guardians",away:"Detroit Tigers",hs:"—",as:"—"},
 {league:"NHL",status:"UPCOMING",home:"Columbus Blue Jackets",away:"Pittsburgh Penguins",hs:"—",as:"—"},
 {league:"NCAAF",status:"FINAL",home:"Ohio State",away:"Michigan",hs:31,as:24},
 {league:"NCAAB",status:"UPCOMING",home:"Ohio State",away:"Duke",hs:"—",as:"—"},
 {league:"Soccer",status:"LIVE",home:"Home Club",away:"Away Club",hs:2,as:1}
];
let selectedLeague = "all";
let refreshTimer;
const $ = (id) => document.getElementById(id);

function showMessage(title, message) {
  $("dialogTitle").textContent = title;
  $("dialogMessage").textContent = message;
  $("messageDialog").showModal();
}
function renderGames(games) {
  const grid = $("scoreGrid");
  grid.innerHTML = "";
  const filtered = selectedLeague === "all" ? games : games.filter(g => g.league === selectedLeague);
  if (!filtered.length) {
    grid.innerHTML = '<div class="score-card">No games found for this sport.</div>';
    return;
  }
  filtered.forEach(g => {
    const card = document.createElement("article");
    card.className = "score-card";
    const top = document.createElement("div"); top.className = "score-top";
    const league = document.createElement("span"); league.textContent = g.league;
    const status = document.createElement("span"); status.className = "status"; status.textContent = g.status;
    top.append(league,status);
    card.append(top);
    [[g.home,g.hs],[g.away,g.as]].forEach(([name,score]) => {
      const row = document.createElement("div"); row.className = "team";
      const team = document.createElement("span"); team.textContent = name;
      const points = document.createElement("span"); points.className = "team-score"; points.textContent = score;
      row.append(team,points); card.append(row);
    });
    grid.append(card);
  });
}
async function refreshScores() {
  // Configure a backend endpoint after obtaining a commercial data license.
  // The endpoint should return: { games: [{league,status,home,away,hs,as}] }
  const endpoint = window.LSC_CONFIG?.scoresEndpoint;
  if (!endpoint) {
    renderGames(sampleGames);
    $("updateText").textContent = "Preview mode";
    return;
  }
  try {
    const response = await fetch(endpoint, {cache:"no-store"});
    if (!response.ok) throw new Error("Score service unavailable");
    const payload = await response.json();
    if (!Array.isArray(payload.games)) throw new Error("Unexpected score response");
    renderGames(payload.games);
    $("updateText").textContent = "Updated " + new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});
    $("dataNote").textContent = "Scores supplied by the connected data provider. Refreshes automatically while the app is open.";
  } catch (err) {
    $("updateText").textContent = "Scores temporarily unavailable";
  }
}
function setLeague(league) {
  selectedLeague = league;
  document.querySelectorAll(".league-tab").forEach(btn => btn.classList.toggle("active",btn.dataset.league===league));
  refreshScores();
}
document.querySelectorAll(".league-tab").forEach(btn => btn.addEventListener("click",()=>setLeague(btn.dataset.league)));
["trialButton","trialButtonBottom"].forEach(id => $(id).addEventListener("click",()=>{
  showMessage("Membership checkout not connected yet","The app preview is ready. Before accepting customers, connect a Stripe account, create the $9.99/year price with a 7-day trial, and connect account access to verified subscription status. Do not collect payments from this preview.");
}));
$("accountButton").addEventListener("click",()=>showMessage("Accounts coming next","Account creation and secure sign-in will be connected with the membership system before launch."));
$("closeDialog").addEventListener("click",()=>$("messageDialog").close());
$("dialogOk").addEventListener("click",()=>$("messageDialog").close());
$("year").textContent = new Date().getFullYear();
refreshScores();
refreshTimer = setInterval(refreshScores,30000);
if ("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
