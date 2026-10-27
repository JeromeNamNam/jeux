"use strict";
/* Panneau du bas de chaque jeu : mini-vidéo « comment jouer », catégories, recherche et accès rapide aux autres jeux. */
(() => {
  const me = document.currentScript, base = me.src.replace(/dock\.js.*$/, "");
  const load = src => new Promise(res => { const s = document.createElement("script"); s.src = base + src; s.onload = res; s.onerror = res; document.body.appendChild(s); });
  (async () => {
    load("touch.js");
    if (typeof HEROES === "undefined") await load("heroes.js");
    if (typeof DEMOS === "undefined") { await load("demos.js"); await load("arcade-demos.js"); }
    if (typeof GAMES === "undefined") await load("games.js");
    if (typeof Catalog === "undefined") await load("catalog.js");
    if (typeof registerArcadeDemos === "function") registerArcadeDemos(GAMES);
    const hero = heroIndexFromUrl(), all = Catalog.all(), q = new URLSearchParams(location.search), gid = q.get("g");
    const here = all.find(g => gid ? g.id === gid : location.pathname.includes("/" + g.id + "/")) || all[0];
    let cat = here.cat, query = "";
    const style = document.createElement("style");
    style.textContent = `
      html,body{height:auto!important;min-height:100%;display:block!important;overflow-x:hidden!important;overflow-y:auto!important}
      canvas#c{display:block;margin:0 auto;width:min(100vw,calc(84vh*4/3))!important}
      #dock{box-sizing:border-box;max-width:1000px;margin:0 auto;padding:14px max(16px,env(safe-area-inset-right,0px)) 40px max(16px,env(safe-area-inset-left,0px));color:#f4f6ff;font-family:"Trebuchet MS",Verdana,sans-serif}
      #dock *{box-sizing:border-box}
      #dock h2{font-size:18px;margin:6px 0 12px;color:#ffd23f;text-align:center}
      #dock .cols{display:grid;grid-template-columns:minmax(260px,330px) 1fr;gap:18px;align-items:start}
      @media (max-width:760px){#dock .cols{grid-template-columns:1fr}}
      #dock .card{background:rgba(24,16,70,.8);border-radius:16px;padding:14px}
      #dock canvas.d{display:block;width:100%;aspect-ratio:16/9;border-radius:10px;background:#000}
      #dock ol{margin:10px 0 0;padding-left:20px;font-size:14px;line-height:1.5;color:#e6e9ff}
      #dock .chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
      #dock button,#dock input{font:inherit;color:#f4f6ff}
      #dock .chip{background:rgba(255,255,255,.08);border:2px solid transparent;border-radius:999px;padding:4px 12px;cursor:pointer;font-size:13px}
      #dock .chip[aria-pressed=true]{border-color:#ffd23f;color:#ffd23f;background:rgba(255,210,63,.12)}
      #dock .bar{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
      #dock .bar input{flex:1;min-width:150px;background:rgba(255,255,255,.1);border:2px solid #fff3;border-radius:999px;padding:6px 14px}
      #dock .act{background:#6df0b0;color:#0b2a1c!important;border:0;border-radius:999px;padding:6px 14px;font-weight:bold;cursor:pointer;text-decoration:none;font-size:13px}
      #dock .list{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;max-height:230px;overflow-y:auto;padding-right:4px}
      #dock a.t{display:block;text-decoration:none;color:#f4f6ff;background:rgba(255,255,255,.08);border:2px solid transparent;border-radius:12px;padding:8px 6px;text-align:center;font-size:12px;line-height:1.25}
      #dock a.t:hover{background:rgba(255,255,255,.18)}
      #dock a.t.cur{border-color:#ffd23f}
      #dock a.t b{display:block;font-size:22px;margin-bottom:2px}
      #dock .hint{font-size:12px;color:#cfd4ff;margin:8px 0 0;text-align:center}
      #dock a:focus-visible,#dock button:focus-visible,#dock input:focus-visible{outline:3px solid #fff;outline-offset:2px}`;
    document.head.appendChild(style);
    const dock = document.createElement("section"); dock.id = "dock"; dock.setAttribute("aria-label", "Explications et autres jeux");
    dock.innerHTML = `<h2>▼ Comment jouer, catégories et autres jeux</h2><div class="cols">
      <div class="card"><div style="font-weight:bold;margin-bottom:8px">🎬 ${here.emoji} ${here.name}</div><div id="dv"></div><ol id="steps"></ol></div>
      <div class="card"><div class="chips" id="dchips"></div>
        <div class="bar"><input id="dq" type="search" placeholder="🔎 Cherche un jeu" aria-label="Chercher un jeu"><a class="act" id="prev" href="#">◀ Avant</a><a class="act" id="next" href="#">Après ▶</a><a class="act" id="rand" href="#">🎲 Au hasard</a><a class="act" id="home" href="#">🏠 Salle de jeux</a></div>
        <div class="list" id="dlist"></div><p class="hint">Clique sur le jeu pour y aller. Les touches du clavier ne sont pas prises en compte ici : reclique sur le jeu pour jouer.</p></div></div>`;
    document.body.appendChild(dock);
    for (const ev of ["keydown", "keyup", "keypress"]) dock.addEventListener(ev, e => e.stopPropagation());
    const video = document.createElement("canvas"); video.className = "d"; dock.querySelector("#dv").appendChild(video);
    const d = typeof DEMOS !== "undefined" ? DEMOS[here.id] : null;
    if (d) { startDemo(video, here.id, () => hero); dock.querySelector("#steps").innerHTML = d.steps.map(s => `<li>${s[1]}</li>`).join(""); }
    else { video.remove(); dock.querySelector("#steps").innerHTML = `<li>${here.desc}</li>`; }
    const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const chips = dock.querySelector("#dchips"), list = dock.querySelector("#dlist"), search = dock.querySelector("#dq");
    const href = g => g.href(hero, base);
    const shown = () => all.filter(g => (cat === "Tous" || g.cat === cat) && (!query || norm(g.name + " " + g.cat + " " + g.desc).includes(norm(query))));
    function render() {
      chips.innerHTML = ""; Catalog.cats(all).forEach(c => { const b = document.createElement("button"); b.className = "chip"; b.setAttribute("aria-pressed", c === cat); b.textContent = c + (c === "Tous" ? " (" + all.length + ")" : " (" + all.filter(g => g.cat === c).length + ")"); b.onclick = () => { cat = c; render(); }; chips.appendChild(b); });
      list.innerHTML = ""; shown().forEach(g => { const a = document.createElement("a"); a.className = "t" + (g.id === here.id ? " cur" : ""); a.href = href(g); a.innerHTML = `<b>${g.emoji}</b>${g.name}`; list.appendChild(a); });
      const cur = list.querySelector(".cur"); if (cur) list.scrollTop = Math.max(0, cur.offsetTop - list.offsetTop - 8);
    }
    search.addEventListener("input", () => { query = search.value; render(); });
    const sameCat = all.filter(g => g.cat === here.cat), i = sameCat.findIndex(g => g.id === here.id);
    dock.querySelector("#prev").href = href(sameCat[(i + sameCat.length - 1) % sameCat.length]); dock.querySelector("#next").href = href(sameCat[(i + 1) % sameCat.length]);
    dock.querySelector("#home").href = base + "index.html?hero=" + hero;
    dock.querySelector("#rand").addEventListener("click", e => { e.preventDefault(); const pool = all.filter(g => g.id !== here.id); location.href = href(pool[Math.floor(Math.random() * pool.length)]); });
    render();
  })();
})();
