"use strict";
/* Mini-vidéos de 5 secondes pour les jeux « arcade » : une scène par type de jeu, habillée avec les emojis du jeu. */
(() => {
  const bg = (c, cfg) => { const s = cfg.sky || [cfg.ground || "#8ec8ff", cfg.ground2 || "#e8f4ff"], g = c.createLinearGradient(0, 0, 0, 142); g.addColorStop(0, s[0]); g.addColorStop(1, s[1]); c.fillStyle = g; c.fillRect(0, 0, 320, 142); };
  const ease = (a, b, u) => a + (b - a) * u;
  const S = {
    trick: { steps: [[0, "ESPACE : prends la rampe", "␣"], [1.7, "En l'air : ← ↑ → ↓ = figures", "←→↑↓"], [3.4, "Atterris proprement : points !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); c.fillStyle = cfg.ground || "#6a6a76"; c.fillRect(0, 118, 320, 24);
        const rx = 250 - t * 80; c.fillStyle = cfg.ramp || "#a8712f"; c.beginPath(); c.moveTo(rx, 118); c.lineTo(rx + 70, 78); c.lineTo(rx + 70, 118); c.fill();
        const on = t > 2 && t < 2.45 ? 118 - _seg(t, 2, 2.45) * 40 : t >= 2.45 && t < 3.9 ? 78 - Math.sin(_seg(t, 2.45, 3.9) * Math.PI) * 50 : 118;
        const air = t >= 2.45 && t < 3.9; c.save(); c.translate(70, on); let sx = 1, rot = 0; if (air) { if (t > 2.8 && t < 3.3) sx = Math.cos(_seg(t, 2.8, 3.3) * Math.PI * 2); if (t > 3.3 && t < 3.85) rot = -_seg(t, 3.3, 3.85) * Math.PI * 2; }
        c.translate(0, -14); c.rotate(rot); c.scale(.55 * (Math.abs(sx) < .1 ? .1 : sx), .55); c.translate(0, -6); c.fillStyle = h.ship.color; c.beginPath(); c.roundRect(-24, 31, 48, 6, 3); c.fill(); c.fillStyle = "#222"; c.beginPath(); c.arc(-14, 40, 4.5, 0, 7); c.arc(14, 40, 4.5, 0, 7); c.fill(); heroSide(c, h, 0, !air, t); c.restore();
        if (t > 3.9) { c.fillStyle = "#ffd23f"; c.font = "bold 14px sans-serif"; c.textAlign = "center"; c.fillText("+300  COMBO x2", 120, 60); } } },
    lob: { steps: [[0, "↑ ↓ : vise", "↑↓"], [1.2, "ESPACE maintenu, puis relâche", "␣"], [3, "Marque !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); c.fillStyle = cfg.ground || "#5fb04a"; c.fillRect(0, 122, 320, 20); _side(c, h, 40, 122, .6, 1, 0, true, t);
        if (cfg.mode === "goal") { c.fillStyle = "#fff"; c.fillRect(270, 70, 3, 52); c.fillRect(270, 70, 40, 3); _emoji(c, "🧤", 285, 98 + Math.sin(t * 3) * 10, 22); }
        else if (cfg.mode === "darts") { [["#fff", 1], ["#222", .8], ["#e8283a", .6], ["#4aa3ff", .4], ["#ffd23f", .2]].forEach(([col, f]) => { c.fillStyle = col; c.beginPath(); c.ellipse(268, 62, 10 * f, 22 * f, 0, 0, 7); c.fill(); }); }
        else { c.strokeStyle = "#ff7a2a"; c.lineWidth = 3; c.beginPath(); c.moveTo(240, 62); c.lineTo(276, 62); c.stroke(); c.fillStyle = "#fff"; c.fillRect(278, 36, 4, 50); }
        if (t > 1.2 && t < 2.2) { c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(100, 128, 120, 8); c.fillStyle = "#6ee06e"; c.fillRect(100, 128, 120 * _seg(t, 1.2, 2.2), 8); }
        const u = _seg(t, 2.2, 3.2); const bx = t < 2.2 ? 56 : ease(56, 258, u), by = t < 2.2 ? 100 : 100 - Math.sin(u * Math.PI) * 60 - u * 36; _emoji(c, cfg.ball || "🏀", bx, by, 20);
        if (t > 3.2) { c.fillStyle = "#6ee06e"; c.font = "bold 16px sans-serif"; c.textAlign = "center"; c.fillText("BRAVO !", 200, 40); } } },
    penalty: { steps: [[0, "← ↑ ↓ → : vise le but", "←→↑↓"], [1.7, "ESPACE : tire !", "␣"], [3.4, "Marque ! 🥅", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); c.fillStyle = cfg.ground || "#3f9a3a"; c.fillRect(0, 92, 320, 50); c.strokeStyle = "#fff"; c.lineWidth = 4; c.strokeRect(80, 20, 160, 66);
        const ax = t < 1.7 ? 120 + Math.sin(t * 2) * 50 : 190, ay = 50, kx = t < 2.3 ? 160 : ease(160, 105, _seg(t, 2.3, 2.7)); _top(c, HEROES[(HEROES.indexOf(h) + 4) % HEROES.length], kx, 60, .6, { x: 0, y: 1 }, t);
        if (t < 2.2) { c.strokeStyle = h.ship.color; c.lineWidth = 2; c.beginPath(); c.arc(ax, ay, 8, 0, 7); c.moveTo(ax - 12, ay); c.lineTo(ax + 12, ay); c.moveTo(ax, ay - 12); c.lineTo(ax, ay + 12); c.stroke(); }
        const p = t < 2.2 ? 0 : Math.min(1, (t - 2.2) / .5); _emoji(c, "⚽", ease(160, 190, p), ease(120, 52, p) - Math.sin(p * Math.PI) * 8, 24 - 10 * p); _top(c, h, 120, 125, .6, { x: 1, y: -1 }, t);
        if (t > 2.8) { c.fillStyle = "#ffd23f"; c.font = "bold 16px sans-serif"; c.textAlign = "center"; c.fillText("BUUUT !", 160, 112); } } },
    sprint: { steps: [[0, "Alterne ← → très vite", "←→"], [1.7, "Garde le rythme !", "←→"], [3.4, "Termine dans les premiers !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); c.fillStyle = cfg.track || "#c8643a"; c.fillRect(0, 24, 320, 106); for (let i = 0; i < 5; i++) { c.fillStyle = "rgba(255,255,255,.6)"; c.fillRect(0, 24 + i * 21, 320, 2); }
        c.fillStyle = "#fff"; for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? "#fff" : "#222"; c.fillRect(296, 24 + i * 21, 8, 21); }
        const o = [HEROES.indexOf(h) + 3, HEROES.indexOf(h) + 8, HEROES.indexOf(h) + 13, HEROES.indexOf(h) + 17].map(i => HEROES[i % HEROES.length]), sp = [.8, .86, .74, .9];
        o.forEach((hh, i) => { const lane = i < 2 ? i : i + 1; _top(c, hh, 20 + t * 52 * sp[i] + Math.sin(t * 8 + i), 34 + lane * 21, .42, { x: 1, y: 0 }, t); });
        _top(c, h, 20 + t * 58, 34 + 2 * 21, .45, { x: 1, y: 0 }, t); if (cfg.vehicle) _emoji(c, cfg.vehicle, 20 + t * 58, 34 + 2 * 21 + 8, 14);
        c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(20, 134, 280, 5); c.fillStyle = "#6ee06e"; c.fillRect(20, 134, 280 * _seg(t, 0, 5), 5); } },
    slalom: { steps: [[0, "← → : tourne", "←→"], [1.7, "Passe entre les piquets", ""], [3.4, "Évite les obstacles !", ""]],
      scene(c, t, h, cfg) { c.fillStyle = cfg.ground || "#eef6ff"; c.fillRect(0, 0, 320, 142); c.fillStyle = cfg.mark || "rgba(120,160,200,.35)"; for (let i = 0; i < 8; i++) c.fillRect((i * 97) % 300, ((i * 40 + t * 90) % 170) - 20, 22, 3);
        for (let k = 0; k < 3; k++) { const y = ((k * 70 + t * 90) % 210) - 30, cx = 90 + (k * 83) % 150; c.fillStyle = "#e8283a"; c.fillRect(cx - 36, y - 14, 3, 20); c.fillStyle = "#2f6fe0"; c.fillRect(cx + 36, y - 14, 3, 20); }
        _emoji(c, cfg.obstacle || "🌲", ((t * 90) % 210 - 30 > 10 ? 250 : 60), ((t * 90 + 100) % 210) - 30, 26);
        const x = 160 + Math.sin(t * 1.8) * 70; c.save(); c.translate(x, 108); c.rotate(Math.cos(t * 1.8) * .3); _emoji(c, cfg.vehicle || "🎿", 0, 9, 28); c.scale(.6, .6); heroTop(c, h, { x: 0, y: 1 }, 0, t); c.restore(); } },
    juggle: { steps: [[0, "← → : place-toi sous la balle", "←→"], [1.7, "ESPACE : tape dans la balle", "␣"], [3.4, "Compte tes jongles !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); c.fillStyle = cfg.ground || "#4fa83a"; c.fillRect(0, 120, 320, 22); const bx = 160 + Math.sin(t * 1.4) * 60, by = 118 - Math.abs(Math.sin(t * 3.4)) * 90;
        _side(c, h, bx, 120, .6, 1, Math.sin(t * 8) * 3, true, t); _emoji(c, cfg.ball || "⚽", bx, by, 22); c.fillStyle = "#ffd23f"; c.font = "bold 13px sans-serif"; c.textAlign = "center"; c.fillText("Jongles : " + Math.min(12, Math.floor(t * 2.4)), 160, 18); } },
    catch: { steps: [[0, "← → : bouge", "←→"], [1.7, "Attrape les bons objets", ""], [3.4, "ESPACE : attrapeur géant !", "␣"]],
      scene(c, t, h, cfg) { bg(c, cfg); c.fillStyle = cfg.ground || "#4fa83a"; c.fillRect(0, 122, 320, 20); const bx = 160 + Math.sin(t * 1.7) * 95, big = t > 3.4 ? 1.6 : 1;
        for (let i = 0; i < 5; i++) { const x = 40 + i * 60, y = ((t * 62 + i * 41) % 170) - 20, e = i === 3 ? cfg.bad[0] : cfg.good[i % cfg.good.length]; if (y > 78 && Math.abs(x - bx) < 34 * big) continue; _emoji(c, e, x, y, 20); }
        _side(c, h, bx, 124, .45, 1, Math.sin(t * 10) * 3, true, t); _emoji(c, cfg.catcher || "🧺", bx, 80, 30 * big); } },
    dodge: { steps: [[0, "← → : cours", "←→"], [1.7, "Esquive ce qui tombe", ""], [3.4, "ESPACE : ruée éclair !", "␣"]],
      scene(c, t, h, cfg) { bg(c, cfg); c.fillStyle = cfg.ground || "#4a3a60"; c.fillRect(0, 122, 320, 20); const px = t < 1 ? 120 + t * 90 : t < 2 ? 210 - (t - 1) * 70 : t < 3.5 ? 140 + (t - 2) * 30 : 185 + _seg(t, 3.7, 3.9) * 110;
        const hz = (x, t0, v) => { const y = -10 + (t - t0) * v; if (t >= t0 && y < 116) _emoji(c, cfg.hazard[0], x, y, 24); }; hz(150, .2, 70); hz(235, 1.8, 80); hz(90, 2.4, 85); if (t > 2.6 && t < 3.9) _emoji(c, cfg.collect || "⭐", 165, -10 + (t - 2.6) * 70, 18);
        _side(c, h, px, 122, .6, t < 1 || (t >= 2 && t < 3.5) ? 1 : -1, Math.sin(t * 16) * 5, true, t); } },
    runner: { steps: [[0, "ESPACE : sauter (double saut)", "␣"], [1.7, "↓ : se baisser", "↓"], [3.4, "Ramasse les pièces !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); c.fillStyle = cfg.ground2 || "#7a4e2d"; c.fillRect(0, 118, 320, 24); c.fillStyle = cfg.ground || "#58b04a"; c.fillRect(0, 118, 320, 6);
        _emoji(c, cfg.obst[0], 70 + (1.3 - t) * 130, 100, 28); _emoji(c, cfg.air[0], 70 + (3.0 - t) * 130, 90, 24); for (const cx of [260, 280, 300]) _emoji(c, cfg.coin || "🪙", (cx - t * 40 + 320) % 320, 80, 14);
        const j = t > .8 && t < 1.8 ? Math.sin(_seg(t, .8, 1.8) * Math.PI) * 44 : 0, duck = t > 2.5 && t < 3.5; _side(c, h, 70, 118 - j, .7, 1, j === 0 ? Math.sin(t * 16) * 5 : 0, j === 0, t, duck ? .6 : 1); } },
    flappy: { steps: [[0, "ESPACE : bats des ailes", "␣"], [1.7, "Passe entre les obstacles", ""], [3.4, "↓ : plonger", "↓"]],
      scene(c, t, h, cfg) { bg(c, cfg); const pc = cfg.pillar || ["#e0883c", "#f0a050", "#9a4a14"]; c.fillStyle = cfg.ground || "#6ea838"; c.fillRect(0, 130, 320, 12);
        for (let k = 0; k < 2; k++) { const x = 330 - ((t * 80 + k * 190) % 380), top = 36 + k * 22; c.fillStyle = pc[1]; c.fillRect(x, 0, 36, top); c.fillRect(x, top + 62, 36, 130 - top - 62); c.fillStyle = pc[2]; c.fillRect(x - 3, top - 10, 42, 10); c.fillRect(x - 3, top + 62, 42, 10); }
        const y = 70 + Math.sin(t * 3.4) * 16 + (t > 3.4 ? _seg(t, 3.4, 4.2) * 24 : 0); c.save(); c.translate(80, y); c.rotate(Math.cos(t * 3.4) * .25); if (cfg.ride) _emoji(c, cfg.ride, 0, -22, 26); c.scale(.62, .62); c.translate(0, -16); heroSide(c, h, Math.sin(t * 14) * 3, false, t); c.restore(); } },
    shooter: { steps: [[0, "← ↑ ↓ → : pilote", "←→"], [1.7, "ESPACE : tire !", "␣"], [3.4, "Bats le boss !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); c.fillStyle = "#fff"; for (let i = 0; i < 24; i++) c.fillRect((i * 97) % 320, (i * 41 + t * 30) % 142, 1.5, 1.5);
        [[70, 28], [160, 22], [250, 30]].forEach(([ex, ey], i) => { if (t < 2.4 + i * .5) _emoji(c, cfg.enemy[i % cfg.enemy.length], ex, ey + Math.sin(t * 3 + i) * 4, 24); else _burst(c, ex, ey, _seg(t, 2.4 + i * .5, 2.9 + i * .5), "#ffd23f"); });
        const sx = 160 + Math.sin(t * 1.6) * 90; if (t > 1.7) for (let k = 0; k < 5; k++) { const bt = (t - 1.7 - k * .3) % 1.5; if (bt > 0 && bt < .9) { c.fillStyle = cfg.bullet || "#7dffb0"; c.fillRect(sx - 1, 116 - bt * 110, 3, 8); } }
        c.fillStyle = h.ship.color; c.beginPath(); c.moveTo(sx, 106); c.lineTo(sx + 14, 130); c.lineTo(sx, 124); c.lineTo(sx - 14, 130); c.fill(); if (t > 3.4) _emoji(c, cfg.boss || "👹", 160, 40, 46); } },
    whack: { steps: [[0, "← ↑ ↓ → : choisis un trou", "←→"], [1.7, "ESPACE : tape !", "␣"], [3.4, "Pas la bombe ! 💣", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); c.fillStyle = cfg.ground || "#5fb04a"; c.fillRect(0, 46, 320, 100); const hx = [70, 160, 250], cur = t < 1 ? 0 : t < 2.4 ? 1 : t < 3.1 ? 2 : 0;
        hx.forEach((x, i) => { c.fillStyle = "#3a2410"; c.beginPath(); c.ellipse(x, 100, 34, 12, 0, 0, 7); c.fill(); let up = 0, e = cfg.pop[0];
          if (i === 0 && t > 3.3) { up = _seg(t, 3.3, 3.6) * (1 - _seg(t, 4.5, 4.8)); e = cfg.bomb; } if (i === 1 && t > .5 && t < 2.2) up = _seg(t, .5, .8) * (1 - _seg(t, 1.9, 2.1)); if (i === 2 && t > 2.6 && t < 3.8) { up = _seg(t, 2.6, 2.9) * (1 - _seg(t, 3.5, 3.7)); e = cfg.gold; }
          if (up > 0) { c.save(); c.beginPath(); c.rect(x - 40, 20, 80, 82); c.clip(); _emoji(c, e, x, 100 - up * 36 + 8, 34); c.restore(); }
          if (cur === i) { c.strokeStyle = h.ship.color; c.lineWidth = 3; c.setLineDash([6, 4]); c.beginPath(); c.ellipse(x, 100, 38, 15, 0, 0, 7); c.stroke(); c.setLineDash([]); } });
        const ham = (t > 1.55 && t < 1.9) || (t > 3 && t < 3.35); c.save(); c.translate(hx[cur] + 24, 40 + (ham ? 30 : 0)); c.rotate(-.5 + (ham ? .8 : 0)); c.fillStyle = "#8a5a2a"; c.fillRect(-2, 0, 4, 34); c.fillStyle = h.ship.color; c.fillRect(-11, -12, 22, 14); c.restore(); _top(c, h, 300, 120, .6, { x: -1, y: 0 }, t); } },
    memory: { steps: [[0, "← ↑ ↓ → : déplace le curseur", "←→"], [1.7, "ESPACE retourne une carte", "␣"], [3.4, "Trouve les paires !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); const f = cfg.faces; const ids = [0, 1, 2, 2, 0, 1], fl = [_seg(t, .4, .9) - _seg(t, 4.3, 4.6), t > 2.6 ? _seg(t, 2.6, 3) - _seg(t, 4.3, 4.6) : 0, t > 3.4 ? _seg(t, 3.4, 3.8) - _seg(t, 4.3, 4.6) : 0, 0, _seg(t, 1.3, 1.8), 0];
        for (let i = 0; i < 6; i++) { const x = 60 + (i % 3) * 70, y = 20 + Math.floor(i / 3) * 56, k = Math.max(0, fl[i]), sx = Math.max(.05, Math.abs(Math.cos(k * Math.PI))); c.save(); c.translate(x + 24, y + 24); c.scale(sx, 1); c.fillStyle = k > .5 ? "#fff" : (cfg.back || "#3a5aa8"); c.beginPath(); c.roundRect(-24, -26, 48, 52, 8); c.fill(); if (k > .5) _emoji(c, f[ids[i]], 0, 2, 28); else { c.fillStyle = "rgba(255,255,255,.4)"; _emoji(c, "★", 0, 0, 20); } c.restore(); }
        const cur = t < 1.2 ? 0 : t < 2.4 ? 4 : t < 3.2 ? 1 : 2; c.strokeStyle = h.ship.color; c.lineWidth = 3; c.beginPath(); c.roundRect(60 + (cur % 3) * 70 - 3, 20 + Math.floor(cur / 3) * 56 - 3, 54, 58, 10); c.stroke(); } },
    quiz: { steps: [[0, "Regarde l'image", ""], [1.7, "← ↑ ↓ → puis ESPACE", "←→"], [3.4, "Réponds avant la fin du temps !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); const it = cfg.items[Math.floor(t / 2.5) % 2 ? 3 : 1]; _emoji(c, it[0], 160, 42, 52); c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(30, 8, 260, 5); c.fillStyle = "#6ee06e"; c.fillRect(30, 8, 260 * (1 - (t % 5) / 5), 5);
        const names = [cfg.items[0][1], it[1], cfg.items[2][1]], cur = t < 1.7 ? 0 : t < 2.6 ? 1 : 1; names.forEach((n, i) => { const x = 14 + i * 100, good = t > 3.2 && i === 1; c.fillStyle = good ? "#2fa84a" : i === cur ? h.ship.color : "#3a3a70"; c.beginPath(); c.roundRect(x, 88, 92, 34, 8); c.fill(); c.fillStyle = "#fff"; c.font = "bold 11px sans-serif"; c.textAlign = "center"; c.fillText((i + 1) + ". " + n.slice(0, 11), x + 46, 109); }); } },
    math: { steps: [[0, "Lis le calcul", ""], [1.7, "← → puis ESPACE (ou 1 2 3)", "←→"], [3.4, "Vite : le temps passe !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); const q = ["7 + 5", "6 × 4", "18 ÷ 3"][Math.floor(t / 1.7) % 3], a = ["12", "24", "6"][Math.floor(t / 1.7) % 3]; c.fillStyle = "#fff"; c.font = "bold 40px sans-serif"; c.textAlign = "center"; c.fillText(q, 160, 62);
        c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(30, 8, 260, 5); c.fillStyle = "#6ee06e"; c.fillRect(30, 8, 260 * (1 - (t % 5) / 5), 5); [String(+a - 2), a, String(+a + 3)].forEach((n, i) => { const x = 14 + i * 100, good = (t % 1.7) > 1.1 && i === 1; c.fillStyle = good ? "#2fa84a" : i === 1 ? h.ship.color : "#3a3a70"; c.beginPath(); c.roundRect(x, 88, 92, 34, 8); c.fill(); c.fillStyle = "#fff"; c.font = "bold 18px sans-serif"; c.fillText((i + 1) + ". " + n, x + 46, 112); }); } },
    invaders: { steps: [[0, "← → : bouge", "←→"], [1.7, "ESPACE : tire !", "␣"], [3.4, "Détruis-les tous !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) if (t < 2.4 + (k * 3 + r) * .1) _emoji(c, cfg.faces[r % cfg.faces.length], 62 + k * 38 + Math.sin(t * 1.2) * 14, 22 + r * 24, 20);
        const sx = 160 + Math.sin(t * 1.5) * 80; if (t > 1.7) for (let k = 0; k < 4; k++) { const bt = (t - 1.7 - k * .4) % 1.6; if (bt > 0 && bt < 1) { c.fillStyle = cfg.bullet || "#7dffb0"; c.fillRect(sx - 1, 112 - bt * 100, 3, 8); } }
        c.fillStyle = h.ship.color; c.beginPath(); c.moveTo(sx - 14, 134); c.lineTo(sx, 112); c.lineTo(sx + 14, 134); c.fill(); _top(c, h, sx, 126, .5, { x: 0, y: -1 }, t); } },
    breakout: { steps: [[0, "← → : bouge la raquette", "←→"], [1.7, "ESPACE : lance la balle", "␣"], [3.4, "Casse toutes les briques !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); const cols = cfg.colors || ["#ff5a6e", "#ff9a3c", "#ffd23f", "#6ee06e"]; for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) { if (t > 2.4 + k * .09 + r * .12 && r >= 2 - Math.floor((t - 2.4)) ) continue; c.fillStyle = cols[r % cols.length]; c.fillRect(20 + k * 35, 14 + r * 14, 32, 11); }
        const px = 160 + Math.sin(t * 1.8) * 90; c.fillStyle = h.ship.color; c.beginPath(); c.roundRect(px - 30, 126, 60, 8, 4); c.fill(); _top(c, h, px, 120, .5, { x: 0, y: -1 }, t);
        const bx = t < 1.7 ? px : 40 + Math.abs(((t - 1.7) * 90) % 480 - 240) * .8 + 40, by = t < 1.7 ? 114 : 114 - Math.abs(((t - 1.7) * 70) % 160 - 80) * 1.1; _emoji(c, cfg.ball || "⚪", bx, Math.max(30, by), 16); } },
    snake: { steps: [[0, "← ↑ ↓ → : tourne", "←→"], [1.7, "Mange pour grandir", ""], [3.4, "ESPACE : turbo !", "␣"]],
      scene(c, t, h, cfg) { for (let y = 0; y < 9; y++) for (let x = 0; x < 20; x++) { c.fillStyle = (x + y) % 2 ? cfg.tile1 || "#2f7a3a" : cfg.tile2 || "#37853f"; c.fillRect(x * 16, y * 16, 16, 16); }
        const path = []; for (let k = 0; k < 14; k++) path.push([1 + k, 4]); for (let k = 1; k <= 3; k++) path.push([14, 4 - k]); for (let k = 1; k <= 3; k++) path.push([14 + k, 1]); const head = Math.min(path.length - 1, Math.floor(t * (t > 3.4 ? 4.2 : 3.2))), len = head > 10 ? 6 : 5, sn = h.snake;
        if (head < 10) _emoji(c, cfg.food[0], 11 * 16 + 8, 4 * 16 + 8, 14); _emoji(c, cfg.food[1 % cfg.food.length], 14 * 16 + 8, 1 * 16 + 8, 14);
        for (let i = len - 1; i >= 0; i--) { const p = path[Math.max(0, head - i)]; c.fillStyle = sn.rainbow ? "hsl(" + (i * 40) + ",80%,60%)" : (i % 2 ? sn.b : sn.a); c.beginPath(); c.arc(p[0] * 16 + 8, p[1] * 16 + 8, 7.5 - i * .3, 0, 7); c.fill(); } } },
    stack: { steps: [[0, "Le bloc va et vient", ""], [1.7, "ESPACE : lâche-le !", "␣"], [3.4, "Aligne bien pour grimper !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); const pal = cfg.palette || ["#ff5a6e", "#ff9a3c", "#ffd23f", "#6ee06e"]; c.fillStyle = cfg.ground || "#4a3a2a"; c.fillRect(0, 126, 320, 16);
        const n = Math.min(4, 1 + Math.floor(t / 1.2)); for (let i = 0; i < n; i++) { c.fillStyle = pal[i % pal.length]; c.beginPath(); c.roundRect(110 + (i % 2) * 6, 126 - 18 * (i + 1), 100 - i * 6, 16, 4); c.fill(); if (cfg.layers) _emoji(c, cfg.layers[i % cfg.layers.length], 160, 126 - 18 * (i + 1) + 8, 12); }
        const x = 40 + Math.abs(((t * 150) % 440) - 220) * .9; c.fillStyle = pal[n % pal.length]; c.beginPath(); c.roundRect(x, 126 - 18 * (n + 1) - 6, 90, 16, 4); c.fill(); _top(c, h, x + 45, 126 - 18 * (n + 1) - 28, .5, { x: 0, y: 1 }, t); } },
    stop: { steps: [[0, "Le curseur va et vient", ""], [1.7, "ESPACE : arrête-le dans le vert !", "␣"], [3.4, "Parfait : plus de points !", ""]],
      scene(c, t, h, cfg) { bg(c, cfg); _emoji(c, cfg.big || "🎯", 160, 36, 46); c.fillStyle = "rgba(0,0,0,.45)"; c.beginPath(); c.roundRect(30, 76, 260, 26, 13); c.fill(); const zone = 180, hw = 24; c.fillStyle = "rgba(110,224,110,.85)"; c.fillRect(zone - hw, 80, hw * 2, 18); c.fillStyle = "#ffd23f"; c.fillRect(zone - 7, 80, 14, 18);
        const x = t < 2.6 ? 40 + Math.abs(((t * 190) % 440) - 220) * 1.1 : zone + 2; _emoji(c, cfg.target || "🎯", zone, 66, 16); _emoji(c, cfg.mark || "⚽", Math.min(280, Math.max(40, x)), 89, 22); if (t > 2.7) { c.fillStyle = "#6ee06e"; c.font = "bold 16px sans-serif"; c.textAlign = "center"; c.fillText("PARFAIT ! +100", 160, 128); } } },
  };
  window.registerArcadeDemos = games => { for (const g of games) { const d = S[g.type]; if (d) DEMOS[g.id] = { steps: d.steps, scene: (c, t, h) => d.scene(c, t, h, g) }; } };
})();
