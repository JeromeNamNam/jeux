"use strict";
/* Contrôles tactiles : croix directionnelle + boutons qui simulent les touches du clavier (les jeux ne voient pas la différence).
   Affichés seulement sur écran tactile (ou avec ?touch=1 dans l'adresse). */
(() => {
  const coarse = navigator.maxTouchPoints > 0 || matchMedia("(pointer:coarse)").matches;
  if (!coarse && !/[?&]touch=1/.test(location.search)) return;
  if (document.getElementById("tpad")) return;

  const down = new Set();
  const fire = (type, code, repeat) => {
    const key = code.startsWith("Arrow") ? code : code === "Space" ? " " : code.replace("Key", "").toLowerCase();
    document.dispatchEvent(new KeyboardEvent(type, { code, key, bubbles: true, cancelable: true, repeat: !!repeat }));
  };

  const style = document.createElement("style");
  style.textContent = `
    #tpad{position:fixed;left:0;right:0;bottom:0;z-index:50;pointer-events:none;display:flex;justify-content:space-between;align-items:flex-end;
      padding:0 max(14px,env(safe-area-inset-right,0px)) max(14px,env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));
      -webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:none;font-family:"Trebuchet MS",Verdana,sans-serif}
    canvas#c{position:sticky;top:0;z-index:40}
    #tpad.off .dpad,#tpad.off .acts{display:none}
    #tpad button{pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent;font:inherit;color:#fff;cursor:pointer;
      background:rgba(20,14,60,.55);border:2px solid rgba(255,255,255,.45);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
    #tpad button.on{background:rgba(255,210,63,.75);color:#2a1d00;border-color:#fff}
    #tpad .dpad{display:grid;grid-template-columns:repeat(3,58px);grid-template-rows:repeat(3,58px);gap:4px}
    #tpad .dpad button{border-radius:14px;font-size:24px}
    #tpad .acts{display:flex;flex-direction:column;align-items:flex-end;gap:10px}
    #tpad .acts .a{width:92px;height:92px;border-radius:50%;font-size:17px;font-weight:bold;background:rgba(109,240,176,.6);color:#06281a}
    #tpad .acts .row{display:flex;gap:8px}
    #tpad .acts .s{min-width:46px;height:40px;border-radius:999px;font-size:15px;padding:0 10px}
    #tpad .tog{position:absolute;left:50%;bottom:max(14px,env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:44px;height:34px;border-radius:999px;font-size:17px;padding:0}
    @media (max-height:430px){#tpad .dpad{grid-template-columns:repeat(3,48px);grid-template-rows:repeat(3,48px)}#tpad .acts .a{width:76px;height:76px}}`;
  document.head.appendChild(style);

  const pad = document.createElement("div"); pad.id = "tpad";
  pad.innerHTML = `
    <div class="dpad">
      <span></span><button data-k="ArrowUp" aria-label="Haut">▲</button><span></span>
      <button data-k="ArrowLeft" aria-label="Gauche">◀</button><span></span><button data-k="ArrowRight" aria-label="Droite">▶</button>
      <span></span><button data-k="ArrowDown" aria-label="Bas">▼</button><span></span>
    </div>
    <button class="tog" aria-label="Masquer ou afficher les contrôles">🎮</button>
    <div class="acts">
      <div class="row"><button class="s" data-k="KeyZ" data-hold="0" aria-label="Annuler">↩</button><button class="s" data-k="KeyP" data-hold="0" aria-label="Pause">⏸</button><button class="s" data-k="Escape" data-hold="0" aria-label="Menu">🏠</button></div>
      <button class="a" data-k="Space" aria-label="Action">GO</button>
    </div>`;
  document.body.appendChild(pad);

  /* Laisse de la place sous le panneau du bas pour que les contrôles ne cachent rien. */
  document.body.style.paddingBottom = "190px";

  const REPEAT_AFTER = 350, REPEAT_EVERY = 90;
  pad.querySelectorAll("button[data-k]").forEach(b => {
    const code = b.dataset.k, arrow = code.startsWith("Arrow");
    let t1 = 0, t2 = 0, id = null;
    const stop = () => { clearTimeout(t1); clearInterval(t2); b.classList.remove("on"); if (down.delete(code)) fire("keyup", code); id = null; };
    b.addEventListener("pointerdown", e => {
      e.preventDefault(); if (id !== null) return; id = e.pointerId;
      try { b.setPointerCapture(id); } catch (_) {}
      b.classList.add("on"); down.add(code); fire("keydown", code, false);
      if (b.dataset.hold === "0") { setTimeout(stop, 90); return; }
      if (arrow) t1 = setTimeout(() => { t2 = setInterval(() => fire("keydown", code, true), REPEAT_EVERY); }, REPEAT_AFTER);
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(ev => b.addEventListener(ev, e => { if (id !== null && (ev === "lostpointercapture" || e.pointerId === id)) stop(); }));
    b.addEventListener("contextmenu", e => e.preventDefault());
  });
  pad.querySelector(".tog").addEventListener("click", () => pad.classList.toggle("off"));
  addEventListener("blur", () => { [...down].forEach(c => fire("keyup", c)); down.clear(); pad.querySelectorAll(".on").forEach(b => b.classList.remove("on")); });

  /* Empêche le zoom par double-tap et le défilement quand on touche le jeu lui-même. */
  const cv = document.getElementById("c");
  if (cv) cv.style.touchAction = "manipulation";
})();
