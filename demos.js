"use strict";
/* Mini-vidéos de 5 secondes (animées en direct) qui expliquent comment jouer à chaque jeu. */
const DEMO_W = 320, DEMO_H = 180, DEMO_SCENE_H = 142, DEMO_LEN = 5;

const _clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const _seg = (t, a, b) => _clamp((t - a) / (b - a), 0, 1);
function _side(c, h, x, feet, s, flip, sw, ground, t, sy) {
  c.save(); c.translate(x, feet); c.scale(s * (flip || 1), s * (sy || 1)); c.translate(0, -30); heroSide(c, h, sw || 0, ground !== false, t); c.restore();
}
function _top(c, h, x, y, s, dir, t) { c.save(); c.translate(x, y); c.scale(s, s); heroTop(c, h, dir || { x: 0, y: 1 }, Math.sin(t * 6), t); c.restore(); }
function _emoji(c, e, x, y, size) { c.font = size + "px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(e, x, y); c.textBaseline = "alphabetic"; }
function _burst(c, x, y, p, col) { if (p <= 0 || p >= 1) return; c.fillStyle = col; for (let i = 0; i < 8; i++) { const a = i * .785; c.globalAlpha = 1 - p; c.fillRect(x + Math.cos(a) * p * 18, y + Math.sin(a) * p * 18, 3, 3); } c.globalAlpha = 1; }

const DEMOS = {
  "jeu-diego": { steps: [[0, "Cours avec ← →", "←→"], [1.7, "Saute avec ESPACE", "␣"], [3.4, "Ramasse les pièces !", ""]],
    scene(c, t, h) {
      c.fillStyle = "#7fd0ff"; c.fillRect(0, 0, 320, 142); c.fillStyle = "#b8e8ff"; c.beginPath(); c.arc(60, 40, 18, 0, 7); c.arc(80, 36, 14, 0, 7); c.fill();
      c.fillStyle = "#4fc24a"; c.fillRect(0, 118, 150, 24); c.fillRect(190, 118, 130, 24); c.fillStyle = "#7a4e2d"; c.fillRect(0, 126, 150, 16); c.fillRect(190, 126, 130, 16);
      const x = 30 + t * 52, j = t > 2 && t < 2.8 ? Math.sin((t - 2) / .8 * Math.PI) * 48 : 0;
      for (const cx of [215, 235, 255]) if (x < cx - 8) { c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(cx, 84, 6, 0, 7); c.fill(); }
      _side(c, h, x, 118 - j, .75, 1, t < 2 || t > 2.8 ? Math.sin(t * 14) * 4 : 0, j === 0, t);
    } },
  "jeu-espace": { steps: [[0, "Pilote avec ← ↑ ↓ →", "←→"], [1.7, "Tire avec ESPACE", "␣"], [3.4, "Détruis les ennemis !", ""]],
    scene(c, t, h) {
      c.fillStyle = "#0a0a2a"; c.fillRect(0, 0, 320, 142); c.fillStyle = "#fff"; for (let i = 0; i < 30; i++) c.fillRect((i * 97) % 320, (i * 41 + t * 30) % 142, 1.5, 1.5);
      const sx = 160 + Math.sin(t * 1.6) * 90; const col = h.ship.color;
      [[80, 28], [160, 22], [240, 30]].forEach(([ex, ey], i) => { const dead = t > 2.4 + i * .5; if (!dead) { c.fillStyle = "#9a5cff"; c.beginPath(); c.ellipse(ex, ey + Math.sin(t * 3 + i) * 3, 14, 7, 0, 0, 7); c.fill(); } else _burst(c, ex, ey, _seg(t, 2.4 + i * .5, 2.9 + i * .5), "#ffd23f"); });
      if (t > 1.7) for (let k = 0; k < 6; k++) { const bt = (t - 1.7 - k * .25) % 1.5; if (bt > 0 && bt < .9) { c.fillStyle = "#7dffb0"; c.fillRect(sx - 2 + Math.sin((t - bt) * 1.6) * 90 - Math.sin(t * 1.6) * 90, 118 - bt * 110, 3, 9); } }
      c.fillStyle = col; c.beginPath(); c.moveTo(sx, 104); c.lineTo(sx + 14, 130); c.lineTo(sx, 124); c.lineTo(sx - 14, 130); c.fill();
    } },
  "jeu-serpent": { steps: [[0, "Tourne avec ← ↑ ↓ →", "←→"], [1.7, "Mange les pommes 🍎", ""], [3.4, "ESPACE = turbo !", "␣"]],
    scene(c, t, h) {
      for (let y = 0; y < 9; y++) for (let x = 0; x < 20; x++) { c.fillStyle = (x + y) % 2 ? "#2f7a3a" : "#37853f"; c.fillRect(x * 16, y * 16, 16, 16); }
      const path = []; for (let k = 0; k < 14; k++) path.push([1 + k, 4]); for (let k = 1; k <= 3; k++) path.push([14, 4 - k]); for (let k = 1; k <= 3; k++) path.push([14 + k, 1]);
      const head = Math.min(path.length - 1, Math.floor(t * (t > 3.4 ? 4.2 : 3.2))), len = head > 10 ? 6 : 5, sn = h.snake;
      if (head < 10) { c.fillStyle = "#e8283a"; c.beginPath(); c.arc(11 * 16 + 8, 4 * 16 + 8, 6, 0, 7); c.fill(); }
      for (let i = len - 1; i >= 0; i--) { const p = path[Math.max(0, head - i)]; c.fillStyle = sn.rainbow ? "hsl(" + (i * 40) + ",80%,60%)" : (i % 2 ? sn.b : sn.a); c.beginPath(); c.arc(p[0] * 16 + 8, p[1] * 16 + 8, 7.5 - i * .3, 0, 7); c.fill(); }
      const hp = path[head]; c.fillStyle = "#fff"; c.beginPath(); c.arc(hp[0] * 16 + 11, hp[1] * 16 + 5, 2.2, 0, 7); c.arc(hp[0] * 16 + 11, hp[1] * 16 + 11, 2.2, 0, 7); c.fill();
      c.fillStyle = "#e8283a"; c.beginPath(); c.arc(14 * 16 + 8, 1 * 16 + 8, 6, 0, 7); c.fill();
    } },
  "jeu-labyrinthe": { steps: [[0, "Marche avec ← ↑ ↓ →", "←→"], [1.7, "Trouve les clés 🗝", ""], [3.4, "ESPACE : éclair !", "␣"]],
    scene(c, t, h) {
      c.fillStyle = "#40404b"; c.fillRect(0, 0, 320, 142); c.fillStyle = "#6e5642";
      [[0, 0, 320, 14], [0, 128, 320, 14], [0, 0, 14, 142], [306, 0, 14, 142], [60, 30, 14, 98], [120, 14, 14, 70], [190, 60, 14, 68], [250, 14, 14, 70]].forEach(([x, y, w, hh]) => c.fillRect(x, y, w, hh));
      const px = t < 1.4 ? 30 + t * 28 : t < 3 ? 69 + (t - 1.4) * 40 : 133, py = t < 1.4 ? 110 - t * 34 : 62;
      if (t < 3) { c.fillStyle = "#ffd23f"; c.fillRect(162, 90, 10, 3); c.beginPath(); c.arc(160, 91, 6, 0, 7); c.stroke(); }
      const gx = 180 + Math.sin(t * 2) * 6, gy = 100; if (!(t > 3.8 && t < 4.4 && false)) { c.fillStyle = t > 4 ? "#9aa" : "#b07dff"; c.beginPath(); c.arc(gx, gy, 8, Math.PI, 0); c.lineTo(gx + 8, gy + 8); c.lineTo(gx - 8, gy + 8); c.fill(); }
      const R = 38 + (t > 3.6 && t < 4.4 ? Math.sin(_seg(t, 3.6, 4.4) * Math.PI) * 60 : 0);
      c.save(); c.beginPath(); c.rect(0, 0, 320, 142); c.arc(px, py, R, 0, 7, true); c.clip("evenodd"); c.fillStyle = "rgba(0,0,0,.9)"; c.fillRect(0, 0, 320, 142); c.restore();
      _top(c, h, px, py, .8, { x: 1, y: 0 }, t);
      if (t > 3.6 && t < 4.4) { c.strokeStyle = "rgba(255,240,160," + (1 - _seg(t, 3.6, 4.4)) + ")"; c.lineWidth = 3; c.beginPath(); c.arc(px, py, 10 + _seg(t, 3.6, 4.4) * 90, 0, 7); c.stroke(); }
    } },
  "jeu-briques": { steps: [[0, "Bouge avec ← →", "←→"], [1.7, "ESPACE lance la balle", "␣"], [3.4, "Casse toutes les briques !", ""]],
    scene(c, t, h) {
      c.fillStyle = "#1a1050"; c.fillRect(0, 0, 320, 142);
      const cols = ["#ff5a6e", "#ff9a3c", "#ffd23f", "#6ee06e"]; for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) { if (t > 2.4 + (k * .09 + r * .12) && r >= 2 - Math.floor((t - 2.4) / 1) ) continue; c.fillStyle = cols[r]; c.fillRect(20 + k * 35, 14 + r * 14, 32, 11); }
      const px = 160 + Math.sin(t * 1.8) * 90; c.fillStyle = h.ship.color; c.beginPath(); c.roundRect(px - 30, 126, 60, 8, 4); c.fill(); _top(c, h, px, 120, .55, { x: 0, y: -1 }, t);
      const bx = t < 1.7 ? px : 40 + Math.abs(((t - 1.7) * 90) % 480 - 240) * .8 + 40, by = t < 1.7 ? 114 : 114 - Math.abs(((t - 1.7) * 70) % 160 - 80) * 1.1 + 10 * 0;
      c.fillStyle = "#fff"; c.beginPath(); c.arc(bx, Math.max(20, by), 4, 0, 7); c.fill();
    } },
  "jeu-vol": { steps: [[0, "ESPACE : battre des ailes", "␣"], [1.7, "Passe entre les tours", ""], [3.4, "↓ pour plonger", "↓"]],
    scene(c, t, h) {
      c.fillStyle = "#4aa3ff"; c.fillRect(0, 0, 320, 142); c.fillStyle = "#d8f0ff"; c.beginPath(); c.ellipse(70, 30, 30, 10, 0, 0, 7); c.ellipse(240, 50, 34, 11, 0, 0, 7); c.fill();
      c.fillStyle = "#6ea838"; c.fillRect(0, 130, 320, 12);
      for (let k = 0; k < 2; k++) { const x = 330 - ((t * 80 + k * 190) % 380), top = 36 + k * 22; c.fillStyle = "#e0883c"; c.fillRect(x, 0, 36, top); c.fillRect(x, top + 62, 36, 130 - top - 62); c.fillStyle = "#9a4a14"; c.fillRect(x - 3, top - 10, 42, 10); c.fillRect(x - 3, top + 62, 42, 10); }
      const y = 70 + Math.sin(t * 3.4) * 16 + (t > 3.4 ? _seg(t, 3.4, 4.2) * 24 : 0), tilt = Math.cos(t * 3.4) * .25;
      c.save(); c.translate(80, y); c.rotate(tilt); c.scale(.62, .62); c.translate(0, -16); heroSide(c, h, Math.sin(t * 14) * 3, false, t); c.restore();
      if (t % .6 < .1) { c.fillStyle = "#fff"; c.font = "bold 12px sans-serif"; c.textAlign = "center"; c.fillText("ESPACE !", 80, y - 24); }
    } },
  "jeu-2048": { steps: [[0, "Glisse avec ← ↑ ↓ →", "←→"], [1.7, "Deux pareils fusionnent !", ""], [3.4, "Vise la licorne 🦄", ""]],
    scene(c, t, h) {
      c.fillStyle = "#2a1458"; c.fillRect(0, 0, 320, 142); c.fillStyle = "rgba(0,0,0,.35)"; c.beginPath(); c.roundRect(50, 44, 220, 56, 10); c.fill();
      for (let k = 0; k < 4; k++) { c.fillStyle = "rgba(255,255,255,.1)"; c.beginPath(); c.roundRect(56 + k * 54, 50, 48, 44, 8); c.fill(); }
      const tile = (col, e, v) => { const x = 56 + col * 54; c.fillStyle = "hsl(" + ((v * 32 + 190) % 360) + ",70%,62%)"; c.beginPath(); c.roundRect(x, 50, 48, 44, 8); c.fill(); c.fillStyle = "#fff"; _emoji(c, e, x + 24, 69, 26); c.font = "bold 10px sans-serif"; c.textAlign = "center"; c.fillText(2 ** v, x + 24, 90); };
      const m = _seg(t, .8, 1.5), a = t < 1.5 ? 0 : 0, b = 3 - 3 * m;
      tile(0, "🐛", 1); if (t < 1.5) tile(b, "🐛", 1); else tile(0, "🐜", 2);
      if (t > 2.2) tile(3 - 3 * _seg(t, 3.0, 3.6) * 0 , "🐛", 1);
      if (t > 3.0) { c.fillStyle = "#ffd23f"; c.font = "bold 13px sans-serif"; c.textAlign = "center"; c.fillText("🐜 + 🐜 = 🐞", 160, 120); }
    } },
  "jeu-course": { steps: [[0, "ESPACE : sauter (double saut !)", "␣"], [1.7, "↓ : se baisser sous l'oiseau", "↓"], [3.4, "Ramasse les pièces !", ""]],
    scene(c, t, h) {
      c.fillStyle = "#74d6a0"; c.fillRect(0, 0, 320, 142); c.fillStyle = "#2a7a4a"; for (let i = 0; i < 6; i++) { const x = (i * 70 - t * 25 + 320) % 390 - 40; c.fillRect(x, 50, 8, 70); c.beginPath(); c.arc(x + 4, 50, 22, 0, 7); c.fill(); }
      c.fillStyle = "#7a4e2d"; c.fillRect(0, 118, 320, 24); c.fillStyle = "#58b04a"; c.fillRect(0, 118, 320, 6);
      const rx = 70 + (1.3 - t) * 130, bx = 70 + (3.0 - t) * 130;
      c.fillStyle = "#7a808c"; c.beginPath(); c.ellipse(rx, 108, 14, 12, 0, 0, 7); c.fill();
      c.fillStyle = "#6a3fc4"; c.beginPath(); c.ellipse(bx, 90, 13, 8, 0, 0, 7); c.fill(); c.fillStyle = "#b07dff"; c.beginPath(); c.moveTo(bx - 5, 86); c.lineTo(bx, 76 + Math.sin(t * 14) * 5); c.lineTo(bx + 6, 86); c.fill();
      const j = t > .8 && t < 1.8 ? Math.sin(_seg(t, .8, 1.8) * Math.PI) * 44 : 0, duck = t > 2.5 && t < 3.5;
      for (const cx of [260, 280, 300]) { c.fillStyle = "#ffd23f"; c.beginPath(); c.ellipse((cx - t * 40 + 320) % 320, 80, Math.abs(Math.cos(t * 5)) * 5 + 1, 6, 0, 0, 7); c.fill(); }
      _side(c, h, 70, 118 - j, .72, 1, j === 0 ? Math.sin(t * 16) * 5 : 0, j === 0, t, duck ? .6 : 1);
    } },
  "jeu-memory": { steps: [[0, "Déplace avec ← ↑ ↓ →", "←→"], [1.7, "ESPACE retourne une carte", "␣"], [3.4, "Trouve les paires !", ""]],
    scene(c, t, h) {
      c.fillStyle = "#1e3a5f"; c.fillRect(0, 0, 320, 142);
      const ids = [HEROES.indexOf(h), (HEROES.indexOf(h) + 5) % HEROES.length, (HEROES.indexOf(h) + 11) % HEROES.length], layout = [0, 1, 2, 2, 0, 1];
      const flips = [_seg(t, .4, .9) - _seg(t, 4.3, 4.6), 0, 0, 0, _seg(t, 1.3, 1.8), 0]; flips[1] = _seg(t, 2.6, 3.0) - _seg(t, 4.3, 4.6); flips[2] = _seg(t, 3.4, 3.8) - _seg(t, 4.3, 4.6); flips[2] = Math.max(0, flips[2]); flips[0] = Math.max(flips[0], 0);
      for (let i = 0; i < 6; i++) {
        const x = 60 + (i % 3) * 70, y = 20 + Math.floor(i / 3) * 56, f = i === 0 || i === 4 ? (i === 0 ? (t < 4.3 ? _seg(t, .4, .9) : 1 - _seg(t, 4.3, 4.6)) : _seg(t, 1.3, 1.8)) : (i === 1 ? (t > 2.6 ? (t < 4.3 ? _seg(t, 2.6, 3) : 1 - _seg(t, 4.3, 4.6)) : 0) : (i === 2 ? (t > 3.4 ? (t < 4.3 ? _seg(t, 3.4, 3.8) : 1 - _seg(t, 4.3, 4.6)) : 0) : 0));
        const sx = Math.max(.05, Math.abs(Math.cos(f * Math.PI)));
        c.save(); c.translate(x + 24, y + 24); c.scale(sx, 1); c.fillStyle = f > .5 ? "#fff" : "#3a5aa8"; c.beginPath(); c.roundRect(-24, -26, 48, 52, 8); c.fill();
        if (f > .5) { c.scale(.9, .9); heroTop(c, HEROES[ids[layout[i]]], { x: 0, y: 1 }, 0, t); } else { c.fillStyle = "rgba(255,255,255,.4)"; _emoji(c, "★", 0, 0, 20); }
        c.restore();
      }
      if (t > 1.9 && t < 3) { c.fillStyle = "#ffd23f"; c.font = "bold 13px sans-serif"; c.textAlign = "center"; c.fillText("Paire trouvée ! ✨", 160, 14); }
      const cur = t < 1.2 ? 0 : t < 2.4 ? 4 : t < 3.2 ? 1 : 2; c.strokeStyle = h.ship.color; c.lineWidth = 3; c.beginPath(); c.roundRect(60 + (cur % 3) * 70 - 3, 20 + Math.floor(cur / 3) * 56 - 3, 54, 58, 10); c.stroke();
    } },
  "jeu-pong": { steps: [[0, "↑ ↓ : bouge la raquette", "↑↓"], [1.7, "ESPACE : smash de feu !", "␣"], [3.4, "Premier à 7 points !", ""]],
    scene(c, t, h) {
      c.fillStyle = "#101a3c"; c.fillRect(0, 0, 320, 142); c.strokeStyle = "rgba(255,255,255,.25)"; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(160, 0); c.lineTo(160, 142); c.stroke(); c.setLineDash([]);
      const ph = ((t * 1.3) % 2); const bx = 24 + Math.abs(((t * 130) % 544) - 272) * (272 - 24 > 0 ? 1.08 : 1) * .9 + 10, by = 71 + Math.sin(t * 2.2) * 46;
      const fire = t > 2.4; c.fillStyle = h.ship.color; c.fillRect(14, by - 20 + Math.sin(t * 2.2) * 0 - (bx < 160 ? 0 : 0), 7, 40); c.fillStyle = "#ff9a3c"; c.fillRect(299, 71 + Math.sin(t * 2.2 + .6) * 44 - 20, 7, 40);
      c.fillStyle = fire ? "#ffcf6a" : "#fff"; c.shadowColor = fire ? "#ff5a1a" : "#fff"; c.shadowBlur = 10; c.beginPath(); c.arc(Math.min(296, Math.max(24, bx)), by, 5, 0, 7); c.fill(); c.shadowBlur = 0;
      c.fillStyle = "#fff"; c.font = "bold 28px sans-serif"; c.textAlign = "center"; c.fillText(t > 3.4 ? "4" : "3", 130, 36); c.fillText(t > 3.4 ? "2" : "2", 190, 36);
      _top(c, h, 6, by, .5, { x: 1, y: 0 }, t);
    } },
  "jeu-taupes": { steps: [[0, "Choisis un trou ← ↑ ↓ →", "←→"], [1.7, "ESPACE : tape la taupe !", "␣"], [3.4, "Évite les bombes 💣", ""]],
    scene(c, t, h) {
      c.fillStyle = "#6ec04a"; c.fillRect(0, 0, 320, 142); c.fillStyle = "#c8f0ff"; c.fillRect(0, 0, 320, 28);
      const hx = [70, 160, 250], cur = t < 1 ? 0 : t < 2.4 ? 1 : t < 3.1 ? 2 : 0;
      hx.forEach((x, i) => {
        c.fillStyle = "#3a2410"; c.beginPath(); c.ellipse(x, 100, 34, 12, 0, 0, 7); c.fill();
        let up = 0, kind = "mole", hit = false;
        if (i === 0 && t > 3.3) { up = _seg(t, 3.3, 3.6) * (1 - _seg(t, 4.5, 4.8)); kind = "bomb"; }
        if (i === 1 && t > .5 && t < 2.2) { up = _seg(t, .5, .8) * (1 - _seg(t, 1.9, 2.1)); hit = t > 1.75; }
        if (i === 2 && t > 2.6 && t < 3.8) { up = _seg(t, 2.6, 2.9) * (1 - _seg(t, 3.5, 3.7)); kind = "gold"; hit = t > 3.2; }
        if (up > 0) { const y0 = 100 - up * 34; c.save(); c.beginPath(); c.rect(x - 40, 20, 80, 82); c.clip();
          if (kind === "bomb") { c.fillStyle = "#222"; c.beginPath(); c.arc(x, y0 + 8, 16, 0, 7); c.fill(); c.fillStyle = "#ff5a1a"; c.beginPath(); c.arc(x + 10, y0 - 10, 4, 0, 7); c.fill(); }
          else { c.fillStyle = kind === "gold" ? "#ffd23f" : "#8a5a3a"; c.beginPath(); c.arc(x, y0 + 10, 16, 0, 7); c.fill(); c.fillStyle = "#111"; c.fillRect(x - 8, y0 + 4, 3, 3); c.fillRect(x + 5, y0 + 4, 3, 3); }
          c.restore(); }
        if (cur === i) { c.strokeStyle = h.ship.color; c.lineWidth = 3; c.setLineDash([6, 4]); c.beginPath(); c.ellipse(x, 100, 38, 15, 0, 0, 7); c.stroke(); c.setLineDash([]); }
      });
      const ham = (t > 1.55 && t < 1.9) || (t > 3.0 && t < 3.35); const hx2 = hx[cur] + 24, a = ham ? 1 : 0;
      c.save(); c.translate(hx2, 40 + a * 30); c.rotate(-.5 + a * .8); c.fillStyle = "#8a5a2a"; c.fillRect(-2, 0, 4, 34); c.fillStyle = h.ship.color; c.fillRect(-11, -12, 22, 14); c.restore();
      _top(c, h, 300, 120, .7, { x: -1, y: 0 }, t);
    } },
  "jeu-simon": { steps: [[0, "Écoute la mélodie", ""], [1.9, "Rejoue avec ↑ → ↓ ←", "←→↑↓"], [3.8, "Elle s'allonge à chaque tour !", ""]],
    scene(c, t, h) {
      c.fillStyle = "#150f2a"; c.fillRect(0, 0, 320, 142);
      const pads = [[160, 28, "#ff4d5e", "#7a1f2a"], [226, 71, "#4aa3ff", "#1f3f7a"], [160, 114, "#4af07a", "#1f7a3a"], [94, 71, "#ffd23f", "#7a621f"]];
      const lit = (() => { const seq = [[.4, 0], [.95, 1], [1.5, 3], [2.4, 0], [2.95, 1], [3.5, 3], [4.2, 2]]; for (const [s, p] of seq) if (t >= s && t < s + .4) return p; return -1; })();
      pads.forEach(([x, y, on, off], i) => { c.fillStyle = lit === i ? on : off; if (lit === i) { c.shadowColor = on; c.shadowBlur = 18; } c.beginPath(); c.roundRect(x - 30, y - 22, 60, 44, 12); c.fill(); c.shadowBlur = 0; });
      c.fillStyle = "#1a1038"; c.beginPath(); c.arc(160, 71, 26, 0, 7); c.fill(); _top(c, h, 160, 71, 1.1, { x: 0, y: 1 }, t);
    } },
  "jeu-tetris": { steps: [[0, "← → bouge, ↑ tourne", "←→↑"], [1.7, "ESPACE : tout en bas !", "␣"], [3.4, "Complète des lignes !", ""]],
    scene(c, t, h) {
      c.fillStyle = "#1a1448"; c.fillRect(0, 0, 320, 142); const S = 11, bx = 110, by = 2; c.fillStyle = "rgba(0,0,0,.5)"; c.fillRect(bx, by, 10 * S, 12 * S + 6);
      const flash = t > 3.5 && t < 4.4 && Math.floor(t * 14) % 2;
      for (let col = 0; col < 10; col++) { if (col === 5) continue; c.fillStyle = flash ? "#fff" : ["#4aa3ff", "#ffd23f", "#b07dff", "#4af07a", "#ff5a6e"][col % 5]; c.fillRect(bx + col * S + 1, by + 11 * S + 1, S - 2, S - 2); }
      if (t < 3.5) {
        const vertical = t > 1.4, colx = t < 2.2 ? 3 : t < 2.6 ? 4 : 5, fall = t < 2.8 ? t * 1.9 : Math.min(7.9, 2.8 * 1.9 + (t - 2.8) * 30);
        const cells = vertical ? [[0, 0], [0, 1], [0, 2], [0, 3]] : [[0, 0], [1, 0], [2, 0], [3, 0]];
        c.fillStyle = "#4af0ff"; cells.forEach(([dx, dy]) => { if (Math.floor(fall) + dy <= 10) c.fillRect(bx + (colx + dx) * S + 1, by + (Math.floor(fall) + dy) * S + 1, S - 2, S - 2); });
      }
      c.fillStyle = "#fff"; c.font = "bold 12px sans-serif"; c.textAlign = "center"; c.fillText(t > 3.5 ? "LIGNE !" : "", 160, 134 - 6);
      _top(c, h, 40, 70, 1.3, { x: 1, y: 0 }, t);
    } },
  "jeu-meteores": { steps: [[0, "Cours avec ← →", "←→"], [1.7, "Esquive les météores !", ""], [3.4, "ESPACE : ruée éclair", "␣"]],
    scene(c, t, h) {
      c.fillStyle = "#0a0a2a"; c.fillRect(0, 0, 320, 142); c.fillStyle = "#fff"; for (let i = 0; i < 24; i++) c.fillRect((i * 97) % 320, (i * 41) % 100, 1.5, 1.5);
      c.fillStyle = "#4a3a60"; c.fillRect(0, 124, 320, 18);
      const px = t < 1 ? 120 + t * 90 : t < 2 ? 210 - (t - 1) * 70 : t < 3.5 ? 140 + (t - 2) * 30 : 185 + _seg(t, 3.7, 3.9) * 110;
      const rock = (x, y0, tt, v) => { const y = y0 + (t - tt) * v; if (t < tt || y > 118) return; c.fillStyle = "rgba(255,140,40,.4)"; c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x, y - 40); c.lineTo(x + 9, y); c.fill(); c.fillStyle = "#8a6a5a"; c.beginPath(); c.arc(x, y, 11, 0, 7); c.fill(); };
      rock(150, -10, .2, 70); rock(235, -10, 1.8, 80); rock(90, -10, 2.4, 85);
      if (t > 2.6 && t < 3.9) { const sy = -10 + (t - 2.6) * 70; c.fillStyle = "#ffd23f"; c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 4 : 10, a = k * Math.PI / 5 - Math.PI / 2 + t * 2; c.lineTo(165 + Math.cos(a) * r, sy + Math.sin(a) * r); } c.fill(); }
      if (t > 3.7 && t < 4.3) { c.globalAlpha = .4; c.fillStyle = h.ship.color; c.fillRect(185, 90, 110 * _seg(t, 3.7, 3.9), 30); c.globalAlpha = 1; }
      _side(c, h, px, 124, .72, t < 1 || (t >= 2 && t < 3.5) ? 1 : -1, Math.sin(t * 16) * 5, true, t);
    } },
};

function startDemo(canvas, id, getHero) {
  const d = DEMOS[id]; if (!d) return;
  canvas.width = DEMO_W; canvas.height = DEMO_H; const c = canvas.getContext("2d");
  function frame(now) {
    if (!canvas.isConnected) return;
    requestAnimationFrame(frame);
    const r = canvas.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const t = (now / 1000) % DEMO_LEN, h = HEROES[getHero()];
    c.save(); c.beginPath(); c.rect(0, 0, DEMO_W, DEMO_SCENE_H); c.clip(); d.scene(c, t, h); c.restore();
    c.fillStyle = "#0b0b1c"; c.fillRect(0, DEMO_SCENE_H, DEMO_W, DEMO_H - DEMO_SCENE_H);
    let step = d.steps[0]; for (const s of d.steps) if (t >= s[0]) step = s;
    c.fillStyle = "#fff"; c.font = "bold 13px 'Trebuchet MS',Verdana,sans-serif"; c.textAlign = "center"; c.fillText(step[1], DEMO_W / 2, DEMO_SCENE_H + 18);
    const caps = ["←", "↑", "↓", "→", "␣"], on = step[2] || "", w = 22, x0 = DEMO_W / 2 - (caps.length * (w + 4) - 4) / 2;
    caps.forEach((k, i) => {
      const act = on.includes(k) || (k === "→" && on.includes("→")); c.fillStyle = act ? "#ffd23f" : "rgba(255,255,255,.14)"; c.beginPath(); c.roundRect(x0 + i * (w + 4), DEMO_SCENE_H + 24, k === "␣" ? w + 12 : w, 12, 3); c.fill();
      c.fillStyle = act ? "#222" : "rgba(255,255,255,.55)"; c.font = "bold 9px sans-serif"; c.fillText(k === "␣" ? "espace" : k, x0 + i * (w + 4) + (k === "␣" ? (w + 12) / 2 : w / 2), DEMO_SCENE_H + 33);
    });
    c.fillStyle = "rgba(255,255,255,.2)"; c.fillRect(0, DEMO_H - 3, DEMO_W, 3); c.fillStyle = "#6df0b0"; c.fillRect(0, DEMO_H - 3, DEMO_W * (t / DEMO_LEN), 3);
    c.fillStyle = "rgba(0,0,0,.55)"; c.beginPath(); c.roundRect(6, 6, 52, 16, 8); c.fill(); c.fillStyle = "#fff"; c.font = "bold 10px sans-serif"; c.textAlign = "left"; c.fillText("▶ " + Math.ceil(DEMO_LEN - t) + " s", 12, 18);
  }
  requestAnimationFrame(frame);
}

Object.assign(DEMOS, {
  "jeu-invasion": { steps: [[0, "Bouge avec ← →", "←→"], [1.7, "ESPACE : tire !", "␣"], [3.4, "Détruis tous les envahisseurs !", ""]],
    scene(c, t, h) {
      c.fillStyle = "#0b0630"; c.fillRect(0, 0, 320, 142); c.fillStyle = "#fff"; for (let i = 0; i < 26; i++) c.fillRect((i * 97) % 320, (i * 41) % 142, 1.5, 1.5);
      const faces = ["👾", "👽", "🤖"], sx = 160 + Math.sin(t * 1.5) * 80;
      for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) if (t < 2.4 + (k * 3 + r) * .1) _emoji(c, faces[r], 62 + k * 38 + Math.sin(t * 1.2) * 14, 22 + r * 24, 20);
      if (t > 1.7) for (let k = 0; k < 4; k++) { const bt = (t - 1.7 - k * .4) % 1.6; if (bt > 0 && bt < 1) { c.fillStyle = "#7dffb0"; c.fillRect(sx - 1 + Math.sin((t - bt) * 1.5) * 80 - Math.sin(t * 1.5) * 80, 112 - bt * 100, 3, 8); } }
      c.fillStyle = h.ship.color; c.beginPath(); c.moveTo(sx - 14, 134); c.lineTo(sx - 5, 122); c.lineTo(sx, 112); c.lineTo(sx + 5, 122); c.lineTo(sx + 14, 134); c.fill(); _top(c, h, sx, 126, .5, { x: 0, y: -1 }, t);
    } },
  "jeu-panier": { steps: [[0, "Bouge avec ← →", "←→"], [1.7, "Attrape les fruits 🍎", ""], [3.4, "ESPACE : panier géant ! Évite 💣", "␣"]],
    scene(c, t, h) {
      c.fillStyle = "#9fdcff"; c.fillRect(0, 0, 320, 142); c.fillStyle = "#4fa83a"; c.fillRect(0, 124, 320, 18);
      const bx = 160 + Math.sin(t * 1.7) * 95, big = t > 3.4 ? 1.7 : 1, em = ["🍎", "🍌", "🍇", "🍓", "🍉"];
      for (let i = 0; i < 5; i++) { const x = 40 + i * 60, y = ((t * 62 + i * 41) % 170) - 20; if (y > 100 && Math.abs(x - bx) < 34 * big) continue; _emoji(c, i === 3 ? "💣" : em[i], x, y, 20); }
      _side(c, h, bx + 2, 124, .5, 1, Math.sin(t * 10) * 3, true, t);
      c.fillStyle = "#a8712f"; c.beginPath(); c.moveTo(bx - 32 * big, 100); c.lineTo(bx + 32 * big, 100); c.lineTo(bx + 24 * big, 122); c.lineTo(bx - 24 * big, 122); c.fill(); c.fillStyle = "#8a5a1a"; c.fillRect(bx - 32 * big, 98, 64 * big, 5);
    } },
  "jeu-archer": { steps: [[0, "↑ ↓ : vise", "↑↓"], [1.7, "ESPACE maintenu, puis relâche !", "␣"], [3.4, "Touche le centre : 50 points !", ""]],
    scene(c, t, h) {
      c.fillStyle = "#74c8ff"; c.fillRect(0, 0, 320, 142); c.fillStyle = "#5fb04a"; c.fillRect(0, 120, 320, 22);
      _side(c, h, 44, 120, .6, 1, 0, true, t);
      const ang = t < 1.7 ? .25 + Math.sin(t * 2.4) * .18 : .35; c.save(); c.translate(58, 84); c.rotate(-ang); c.strokeStyle = "#8a5a2a"; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 18, -1.2, 1.2); c.stroke(); c.restore();
      c.fillStyle = "#8a5a2a"; c.fillRect(266, 70, 4, 52); [["#fff", 1], ["#222", .8], ["#4aa3ff", .6], ["#e8283a", .4], ["#ffd23f", .2]].forEach(([col, f]) => { c.fillStyle = col; c.beginPath(); c.ellipse(268, 70, 12 * f, 24 * f, 0, 0, 7); c.fill(); });
      if (t > 1.7 && t < 2.8) { c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(100, 128, 120, 8); c.fillStyle = "#6ee06e"; c.fillRect(100, 128, 120 * _seg(t, 1.7, 2.8), 8); }
      if (t > 2.8) { const u = _seg(t, 2.8, 3.6), ax = 62 + u * 206, ay = 84 - Math.sin(u * Math.PI) * 38 - u * 14; c.save(); c.translate(ax, ay); c.rotate(-Math.cos(u * Math.PI) * .5 * (1 - u * .1)); c.strokeStyle = "#8a5a2a"; c.lineWidth = 2; c.beginPath(); c.moveTo(-18, 0); c.lineTo(0, 0); c.stroke(); c.fillStyle = "#cfd6e4"; c.beginPath(); c.moveTo(6, 0); c.lineTo(0, -3); c.lineTo(0, 3); c.fill(); c.restore();
        if (u >= 1) { c.fillStyle = "#ffd23f"; c.font = "bold 14px sans-serif"; c.textAlign = "center"; c.fillText("+50 !", 268, 36); } }
    } },
  "jeu-montagne": { steps: [[0, "← → : bouge", "←→"], [1.7, "Rebondis de plateforme en plateforme", ""], [3.4, "ESPACE : super bond !", "␣"]],
    scene(c, t, h) {
      const g = c.createLinearGradient(0, 0, 0, 142); g.addColorStop(0, "#3a6aa8"); g.addColorStop(1, "#9fd0ff"); c.fillStyle = g; c.fillRect(0, 0, 320, 142);
      const cols = ["#4ac84a", "#4aa3ff", "#4ac84a", "#e8283a", "#a8712f", "#4ac84a"];
      for (let k = 0; k < 6; k++) { const y = ((k * 46 + t * 36) % 276) - 20, x = 30 + ((k * 97) % 220); c.fillStyle = cols[k]; c.beginPath(); c.roundRect(x + (cols[k] === "#4aa3ff" ? Math.sin(t * 2) * 20 : 0), y, 64, 9, 4); c.fill(); }
      const hy = 112 - Math.abs(Math.sin(t * 3.1)) * 64 - (t > 3.4 ? _seg(t, 3.4, 4.2) * 30 : 0), hx = 160 + Math.sin(t * 1.3) * 90;
      _side(c, h, hx, hy, .55, Math.cos(t * 1.3) > 0 ? 1 : -1, 3, false, t);
      if (t > 3.4 && t < 4.2) { c.fillStyle = "rgba(255,170,40,.7)"; c.beginPath(); c.moveTo(hx - 6, hy + 4); c.lineTo(hx, hy + 22); c.lineTo(hx + 6, hy + 4); c.fill(); }
    } },
  "jeu-autoroute": { steps: [[0, "← → : change de voie", "←→"], [1.7, "↑ ↓ : accélère / freine", "↑↓"], [3.4, "ESPACE : turbo !", "␣"]],
    scene(c, t, h) {
      c.fillStyle = "#3f8a2a"; c.fillRect(0, 0, 320, 142); c.fillStyle = "#3a3a44"; c.fillRect(70, 0, 180, 142); c.fillStyle = "#fff"; c.fillRect(66, 0, 4, 142); c.fillRect(250, 0, 4, 142);
      c.fillStyle = "rgba(255,255,255,.6)"; for (let l = 1; l < 5; l++) for (let i = -1; i < 5; i++) c.fillRect(70 + l * 36 - 1, ((i * 40 + t * (t > 3.4 ? 260 : 150)) % 200) - 30, 2, 18);
      const lx = l => 70 + l * 36 + 18, car = (x, y, col) => { c.fillStyle = col; c.beginPath(); c.roundRect(x - 11, y - 18, 22, 36, 5); c.fill(); c.fillStyle = "#9fd8ff"; c.fillRect(x - 8, y - 8, 16, 8); };
      car(lx(1), ((t * 70) % 190) - 30, "#ffd23f"); car(lx(3), ((t * 50 + 80) % 190) - 30, "#b07dff"); car(lx(4), ((t * 90 + 40) % 190) - 30, "#ff9a3c");
      const px = lx(t < 1 ? 2 : t < 1.5 ? 2 + _seg(t, 1, 1.5) : 3), py = 110 - (t > 1.7 && t < 3 ? 8 : 0);
      if (t > 3.4) { c.fillStyle = "rgba(255,160,40,.8)"; c.beginPath(); c.moveTo(px - 6, py + 18); c.lineTo(px, py + 40 + Math.random() * 8); c.lineTo(px + 6, py + 18); c.fill(); }
      car(px, py, h.ship.color); c.fillStyle = "#222"; c.fillRect(px - 8, py - 6, 16, 14); _top(c, h, px, py + 1, .5, { x: 0, y: -1 }, t);
      for (const [lane, off] of [[3, 0], [3, 1], [3, 2]]) { c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(lx(lane), ((t * 150 + off * 40) % 220) - 30, 4, 0, 7); c.fill(); }
    } },
  "jeu-morpion": { steps: [[0, "← ↑ ↓ → : choisis la case", "←→"], [1.7, "ESPACE : joue ici", "␣"], [3.4, "Aligne 3 personnages !", ""]],
    scene(c, t, h) {
      c.fillStyle = "#241a5a"; c.fillRect(0, 0, 320, 142); const S = 40, bx = 100, by = 10; c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 3; c.lineCap = "round";
      for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(bx + i * S, by + 4); c.lineTo(bx + i * S, by + 3 * S - 4); c.moveTo(bx + 4, by + i * S); c.lineTo(bx + 3 * S - 4, by + i * S); c.stroke(); }
      const op = HEROES[(HEROES.indexOf(h) + 5) % HEROES.length], moves = [[.5, 4, 1], [1.1, 0, 2], [1.7, 6, 1], [2.3, 1, 2], [2.9, 2, 1]];
      for (const [s, i, who] of moves) if (t >= s) { const x = bx + (i % 3) * S + S / 2, y = by + Math.floor(i / 3) * S + S / 2, k = Math.min(1, (t - s) * 5); c.save(); c.translate(x, y); c.scale(.75 * k, .75 * k); heroTop(c, who === 1 ? h : op, { x: 0, y: 1 }, 0, t); c.restore(); }
      const cur = t < .5 ? 4 : t < 1.7 ? 6 : t < 2.9 ? 2 : 2; if (t < 2.9 || true) { c.strokeStyle = h.ship.color; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath(); c.roundRect(bx + (cur % 3) * S + 3, by + Math.floor(cur / 3) * S + 3, S - 6, S - 6, 6); c.stroke(); c.setLineDash([]); }
      if (t > 3.3) { c.strokeStyle = "#ffd23f"; c.lineWidth = 5; c.beginPath(); c.moveTo(bx + 2 * S + S / 2, by + S / 2); c.lineTo(bx + S / 2, by + 2 * S + S / 2); c.stroke(); c.fillStyle = "#6ee06e"; c.font = "bold 14px sans-serif"; c.textAlign = "center"; c.fillText("Gagné ! 🎉", 160, 136); }
    } },
});

DEMOS["jeu-trottinette"] = { steps: [[0, "→ pousse, ESPACE saute", "→␣"], [1.7, "En l'air : ← → salto, ↑ tailwhip, ESPACE barspin", "←→↑␣"], [3.4, "Choisis ton skatepark !", ""]],
  scene(c, t, h) { const g = c.createLinearGradient(0, 0, 0, 142); g.addColorStop(0, "#6ec6ff"); g.addColorStop(1, "#d8f0ff"); c.fillStyle = g; c.fillRect(0, 0, 320, 142);
    c.fillStyle = "rgba(60,90,140,.35)"; for (let i = 0; i < 6; i++) c.fillRect(((i * 70 - t * 12 + 420) % 420) - 60, 50 + (i * 17) % 40, 50, 100);
    c.fillStyle = "#8a8a96"; c.fillRect(0, 118, 320, 24); const rx = 230 - t * 80; c.fillStyle = "#8a8a96"; c.beginPath(); c.moveTo(rx, 118); c.lineTo(rx + 80, 76); c.lineTo(rx + 80, 118); c.fill(); c.strokeStyle = "#dfe6f0"; c.lineWidth = 2; c.beginPath(); c.moveTo(rx + 130, 98); c.lineTo(rx + 200, 98); c.stroke();
    const u = _seg(t, 2.35, 3.9), y = t < 2.05 ? 118 : t < 2.35 ? 118 - _seg(t, 2.05, 2.35) * 42 : t < 3.9 ? 76 - Math.sin(u * Math.PI) * 52 : 118, rot = t > 2.9 && t < 3.7 ? -_seg(t, 2.9, 3.7) * Math.PI * 2 : t > 2.05 && t < 2.35 ? -.5 : 0;
    c.save(); c.translate(70, y); c.rotate(rot); c.strokeStyle = "#cfd6e4"; c.lineWidth = 2; c.beginPath(); c.moveTo(12, -4); c.lineTo(10, -26); c.stroke(); c.fillStyle = h.ship.color; c.fillRect(-14, -9, 28, 3); c.fillStyle = "#14141c"; c.beginPath(); c.arc(-12, -4, 4, 0, 7); c.arc(12, -4, 4, 0, 7); c.fill(); c.translate(-1, -9); c.scale(.62, .62); c.translate(0, -30); heroSide(c, h, 0, true, t); c.restore();
    if (t > 3.9) { c.fillStyle = "#ffd23f"; c.font = "bold 14px sans-serif"; c.textAlign = "center"; c.fillText("+850  BACKFLIP !", 110, 40); } } };
