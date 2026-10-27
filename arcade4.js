"use strict";
/* Modèles de jeu, suite : envahisseurs, casse-briques, serpent, tour à empiler. */
(() => {
  const { T, clamp, rnd, pick, shuffle } = Arcade;

  /* ---------- Envahisseurs ---------- */
  T.invaders = (G, cfg) => {
    const { W, H } = G, COLS = 8, PY = 548; let P, al, ox, oy, dir, bl, ab, blocks, total, fireT, ufo, ufoT;
    const ax = a => ox + a.c * 56, ay = a => oy + a.r * 46;
    return {
      controls: "← → : bouger  •  ESPACE (maintenu) : tirer  •  cache-toi derrière les boucliers",
      init() { const rows = Math.min(5, 2 + Math.ceil(G.level / 3)); P = { x: W / 2, cd: 0 }; al = []; ox = 80; oy = 70 + Math.min(G.level, 5) * 6; dir = 1; bl = []; ab = []; ufo = null; ufoT = 8; fireT = 1.5;
        for (let r = 0; r < rows; r++) for (let c = 0; c < COLS; c++) al.push({ c, r, alive: true, e: cfg.faces[(r + G.level) % cfg.faces.length] }); total = al.length; blocks = [];
        for (let s = 0; s < 4; s++) for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { if (r === 2 && (c === 2 || c === 3)) continue; blocks.push({ x: 100 + s * 170 + c * 11, y: 450 + r * 10, hp: 3 }); } },
      update(dt) {
        const k = Kit.keys; P.x = clamp(P.x + ((k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0)) * 340 * dt, 24, W - 24); P.cd -= dt;
        if (k.Space && P.cd <= 0 && bl.length < 3) { bl.push({ x: P.x, y: PY - 20 }); P.cd = .33; Music.sfx("bounce"); }
        const alive = al.filter(a => a.alive), sp = (26 + G.level * 8) * (1 + (total - alive.length) / total * 2); ox += dir * sp * dt;
        if (alive.some(a => ax(a) > W - 30) || alive.some(a => ax(a) < 30)) { dir = -dir; ox += dir * 4; oy += 20; }
        fireT -= dt; if (fireT <= 0 && alive.length) { fireT = Math.max(.35, 1.3 - G.level * .08) * (.6 + Math.random() * .8); const col = pick(alive).c, low = alive.filter(a => a.c === col).sort((a, b) => b.r - a.r)[0]; ab.push({ x: ax(low), y: ay(low) + 14, vy: 170 + G.level * 14 }); }
        for (let i = bl.length - 1; i >= 0; i--) { const b = bl[i]; b.y -= 520 * dt; let gone = b.y < -10;
          for (const a of alive) if (a.alive && Math.abs(b.x - ax(a)) < 20 && Math.abs(b.y - ay(a)) < 18) { a.alive = false; G.score += 10 * G.level; gone = true; G.burst(ax(a), ay(a), "#7dffb0", 10); Music.sfx("brick"); break; }
          if (!gone && ufo && Math.abs(b.x - ufo.x) < 26 && Math.abs(b.y - 40) < 16) { G.score += 100; G.burst(ufo.x, 40, "#ffd23f", 20); Music.sfx("match"); ufo = null; gone = true; }
          if (!gone) for (const s of blocks) if (s.hp > 0 && Math.abs(b.x - s.x - 5) < 7 && Math.abs(b.y - s.y - 4) < 7) { s.hp--; gone = true; break; }
          if (gone) bl.splice(i, 1); }
        for (let i = ab.length - 1; i >= 0; i--) { const b = ab[i]; b.y += b.vy * dt; let gone = b.y > H + 10;
          for (const s of blocks) if (!gone && s.hp > 0 && Math.abs(b.x - s.x - 5) < 7 && Math.abs(b.y - s.y - 4) < 8) { s.hp--; gone = true; }
          if (!gone && Math.abs(b.x - P.x) < 18 && Math.abs(b.y - PY) < 18) { gone = true; G.burst(P.x, PY, "#ff9a3c", 16); if (G.hurt()) ab = []; }
          if (gone) ab.splice(i, 1); }
        ufoT -= dt; if (ufoT <= 0 && !ufo) { ufo = { x: -30, v: 140 }; ufoT = 14; } if (ufo) { ufo.x += ufo.v * dt; if (ufo.x > W + 40) ufo = null; }
        if (alive.some(a => ay(a) > PY - 36)) { G.lives = 0; G.lose(); return; }
        if (!alive.length) G.levelDone(100 * G.level);
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.fillStyle = "#fff"; for (let i = 0; i < 40; i++) { c.globalAlpha = .3 + .3 * Math.sin(G.time * 2 + i); c.fillRect((i * 131) % W, (i * 77) % H, 2, 2); } c.globalAlpha = 1;
        for (const a of al) if (a.alive) G.em(a.e, ax(a), ay(a) + Math.sin(G.time * 6 + a.c) * 2, 32); if (ufo) G.em(cfg.ufo || "🛸", ufo.x, 40, 34);
        for (const s of blocks) if (s.hp > 0) { c.fillStyle = ["#e04a4a", "#e0a03a", "#4ac84a"][s.hp - 1]; c.fillRect(s.x, s.y, 10, 9); }
        c.fillStyle = cfg.bullet || "#7dffb0"; for (const b of bl) c.fillRect(b.x - 2, b.y - 8, 4, 14); for (const b of ab) { c.fillStyle = "#ff4d6d"; c.beginPath(); c.arc(b.x, b.y, 5, 0, 7); c.fill(); }
        if (!(G.inv > 0 && Math.floor(G.time * 14) % 2)) { c.fillStyle = G.me.ship.color; c.beginPath(); c.moveTo(P.x - 22, PY + 14); c.lineTo(P.x - 8, PY - 2); c.lineTo(P.x, PY - 18); c.lineTo(P.x + 8, PY - 2); c.lineTo(P.x + 22, PY + 14); c.fill(); c.save(); c.translate(P.x, PY + 2); c.scale(.8, .8); heroTop(c, G.me, { x: 0, y: -1 }, 0, G.time); c.restore(); }
      },
    };
  };

  /* ---------- Casse-briques ---------- */
  T.breakout = (G, cfg) => {
    const { W, H } = G, COLS = 12, BW = 60, BH = 26, BX = 40, BY = 80, PY = 548; let pad, balls, bricks, drops;
    const pal = cfg.colors || ["#ff5a6e", "#ff9a3c", "#ffd23f", "#6ee06e", "#4aa3ff", "#b07dff", "#ff7ab8", "#7df0ff"], spd = () => 330 + G.level * 28;
    const pattern = (r, c) => { const hard = G.level >= 3 && (r + c) % 4 === 0 ? 2 : 1; switch ((G.level - 1) % 5) { case 0: return 1; case 1: return (r + c) % 2 ? 0 : hard; case 2: return c >= r && c < COLS - r ? hard : 0; case 3: return c % 3 === 1 ? 0 : hard; default: return (r * 7 + c * 3) % 5 === 0 ? 0 : hard; } };
    const reset = () => { balls = [{ x: pad.x, y: PY - 14, vx: 0, vy: 0, stuck: true, r: 9 }]; };
    return {
      controls: "← → : bouger la raquette  •  ESPACE : lancer la balle  •  W raquette géante, ♥ vie en plus",
      init() { pad = { x: W / 2, w: 110, wide: 0 }; drops = []; bricks = []; const rows = Math.min(8, 4 + Math.floor(G.level / 2)); for (let r = 0; r < rows; r++) for (let c = 0; c < COLS; c++) { const t = pattern(r, c); if (t) bricks.push({ x: BX + c * BW, y: BY + r * (BH + 2), w: BW - 2, h: BH, hp: t, max: t, col: pal[r % pal.length] }); } reset(); },
      update(dt) {
        const k = Kit.keys; pad.w = pad.wide > 0 ? 170 : 110; pad.wide = Math.max(0, pad.wide - dt); pad.x = clamp(pad.x + ((k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0)) * 560 * dt, pad.w / 2, W - pad.w / 2);
        for (let bi = balls.length - 1; bi >= 0; bi--) { const b = balls[bi]; if (b.stuck) { b.x = pad.x; b.y = PY - 14; continue; }
          for (let s = 0; s < 3; s++) { b.x += b.vx * dt / 3; b.y += b.vy * dt / 3;
            if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); Music.sfx("bounce"); } if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx); Music.sfx("bounce"); } if (b.y < b.r + 44) { b.y = b.r + 44; b.vy = Math.abs(b.vy); Music.sfx("bounce"); }
            if (b.vy > 0 && b.y + b.r >= PY && b.y - b.r <= PY + 14 && Math.abs(b.x - pad.x) <= pad.w / 2 + b.r) { const off = (b.x - pad.x) / (pad.w / 2), a = -Math.PI / 2 + off * 1.05, sp = Math.min(spd(), 760); b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; b.y = PY - b.r; Music.sfx("bounce"); }
            for (const br of bricks) { if (br.hp <= 0) continue; if (b.x + b.r > br.x && b.x - b.r < br.x + br.w && b.y + b.r > br.y && b.y - b.r < br.y + br.h) {
              const ox = Math.min(b.x + b.r - br.x, br.x + br.w - (b.x - b.r)), oy = Math.min(b.y + b.r - br.y, br.y + br.h - (b.y - b.r)); if (ox < oy) b.vx = -b.vx; else b.vy = -b.vy;
              br.hp--; G.score += br.hp <= 0 ? 10 * G.level : 3; Music.sfx("brick"); G.burst(b.x, b.y, br.col, br.hp <= 0 ? 8 : 3); if (br.hp <= 0 && Math.random() < .12) drops.push({ x: br.x + br.w / 2, y: br.y, k: Math.random() < .6 ? "W" : "H" }); break; } } }
          if (b.y > H + 20) balls.splice(bi, 1); }
        if (!balls.length) { if (G.hurt()) { pad.wide = 0; reset(); } else if (G.state === "play") reset(); }
        for (let i = drops.length - 1; i >= 0; i--) { const d = drops[i]; d.y += 140 * dt; if (d.y > H) { drops.splice(i, 1); continue; } if (d.y > PY - 10 && d.y < PY + 20 && Math.abs(d.x - pad.x) < pad.w / 2 + 12) { drops.splice(i, 1); Music.sfx("power"); G.score += 20; if (d.k === "W") pad.wide = 12; else G.lives = Math.min(6, G.lives + 1); } }
        if (bricks.every(b => b.hp <= 0)) G.levelDone(100 * G.level);
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; for (const b of bricks) if (b.hp > 0) { c.fillStyle = b.hp > 1 ? "#cfd6e4" : b.col; c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 5); c.fill(); c.fillStyle = "rgba(255,255,255,.3)"; c.fillRect(b.x + 3, b.y + 3, b.w - 6, 5); if (b.max > 1) { c.strokeStyle = b.col; c.lineWidth = 3; c.stroke(); } }
        for (const d of drops) { c.fillStyle = d.k === "W" ? "#ffd23f" : "#ff5a7a"; c.beginPath(); c.arc(d.x, d.y, 13, 0, 7); c.fill(); G.text(d.k === "H" ? "♥" : "W", d.x, d.y + 6, 15, "#101020"); }
        const hc = G.me.ship.color; c.fillStyle = hc; c.beginPath(); c.roundRect(pad.x - pad.w / 2, PY, pad.w, 14, 7); c.fill(); c.save(); c.translate(pad.x, PY - 2); c.scale(1.2, 1.2); heroTop(c, G.me, { x: 0, y: -1 }, 0, G.time); c.restore();
        for (const b of balls) { c.shadowColor = hc; c.shadowBlur = 12; G.em(cfg.ball || "⚪", b.x, b.y, 22); c.shadowBlur = 0; }
        if (balls.some(b => b.stuck)) G.text("ESPACE pour lancer", W / 2, 420, 24);
      },
      key(e) { if (e.code === "Space") { const b = balls.find(b => b.stuck); if (b) { b.stuck = false; const a = -Math.PI / 2 + (Math.random() - .5) * .6; b.vx = Math.cos(a) * spd(); b.vy = Math.sin(a) * spd(); Music.sfx("bounce"); } } },
    };
  };

  /* ---------- Serpent (chenille, dragon, poisson…) ---------- */
  T.snake = (G, cfg) => {
    const { W, H } = G, CS = 25, COLS = 32, ROWS = 22, TOP = 50; let sn, dir, dirQ, grow, acc, food, rocks, eaten, energy, flash;
    const rx = n => Math.floor(Math.random() * n), px = x => x * CS + CS / 2, py = y => TOP + y * CS + CS / 2, quota = () => 5 + G.level;
    const free = (x, y) => !sn.some(s => s.x === x && s.y === y) && !rocks.some(r => r.x === x && r.y === y) && !(food && food.x === x && food.y === y);
    const spot = (minD = 0) => { for (let i = 0; i < 300; i++) { const x = rx(COLS), y = rx(ROWS); if (free(x, y) && Math.abs(x - sn[0].x) + Math.abs(y - sn[0].y) > minD) return { x, y }; } return { x: 0, y: 0 }; };
    const respawn = () => { const cx = COLS >> 1, cy = ROWS >> 1; sn = [0, 1, 2, 3].map(i => ({ x: cx - i, y: cy })); dir = { x: 1, y: 0 }; dirQ = []; grow = 0; acc = 0; rocks = rocks.filter(r => Math.abs(r.x - cx) > 6 || Math.abs(r.y - cy) > 4); };
    return {
      noHud: false, controls: "← ↑ ↓ → : tourner  •  ESPACE (maintenu) : turbo  •  les bords sont des tunnels",
      init() { rocks = []; eaten = 0; energy = 1; flash = 0; for (let i = 0; i < Math.min(14, G.level * 2 - 1); i++) { const cx = COLS >> 1, cy = ROWS >> 1, r = { x: rx(COLS), y: rx(ROWS) }; if (Math.abs(r.x - cx) > 6 || Math.abs(r.y - cy) > 4) rocks.push(r); } respawn(); food = null; food = { ...spot(), e: pick(cfg.food) }; },
      update(dt) {
        const turbo = Kit.keys.Space && energy > 0; energy = clamp(energy + (turbo ? -.7 : .25) * dt, 0, 1); const iv = Math.max(.07, .16 - G.level * .008) * (turbo ? .5 : 1); acc += dt;
        while (acc >= iv && G.state === "play") { acc -= iv; if (dirQ.length) dir = dirQ.shift();
          const nx = (sn[0].x + dir.x + COLS) % COLS, ny = (sn[0].y + dir.y + ROWS) % ROWS, tailOk = grow <= 0 ? 1 : 0;
          if (G.inv <= 0 && (rocks.some(r => r.x === nx && r.y === ny) || sn.some((s, i) => s.x === nx && s.y === ny && !(tailOk && i === sn.length - 1)))) { if (G.hurt()) { G.burst(px(sn[0].x), py(sn[0].y), "#ff9a3c", 20); if (G.state === "play") respawn(); } break; }
          sn.unshift({ x: nx, y: ny }); if (grow > 0) grow--; else sn.pop();
          if (nx === food.x && ny === food.y) { grow++; eaten++; G.score += 10 * G.level; Music.sfx("coin"); G.burst(px(nx), py(ny), "#ffd23f", 8); food = { ...spot(), e: pick(cfg.food) }; if (eaten >= quota()) { G.levelDone(); return; } } }
      },
      draw() {
        const c = G.ctx; for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { c.fillStyle = (x + y) % 2 ? cfg.tile1 || "#2f7a3a" : cfg.tile2 || "#37853f"; c.fillRect(x * CS, TOP + y * CS, CS, CS); }
        for (const r of rocks) G.em(cfg.rock || "🪨", px(r.x), py(r.y), 24); G.em(food.e, px(food.x), py(food.y) + Math.sin(G.time * 6) * 2, 24);
        const sk = G.me.snake; for (let i = sn.length - 1; i >= 0; i--) { c.fillStyle = sk.rainbow ? "hsl(" + (i * 28 + G.time * 60) % 360 + ",80%,58%)" : (i % 2 ? sk.b : sk.a); c.beginPath(); c.arc(px(sn[i].x), py(sn[i].y), CS * (.5 - .1 * i / sn.length) + (i === 0 ? 2 : 0), 0, 7); c.fill(); }
        const h = sn[0]; c.fillStyle = "#fff"; c.beginPath(); c.arc(px(h.x) + dir.x * 4 - dir.y * 6, py(h.y) + dir.y * 4 + dir.x * 6, 4, 0, 7); c.arc(px(h.x) + dir.x * 4 + dir.y * 6, py(h.y) + dir.y * 4 - dir.x * 6, 4, 0, 7); c.fill();
      },
      hud() { G.text(eaten + " / " + quota(), W / 2 + 130, 32, 18); const c = G.ctx; c.fillStyle = "rgba(0,0,0,.45)"; c.fillRect(W / 2 + 190, 20, 100, 12); c.fillStyle = Kit.keys.Space && energy > 0 ? "#ffd23f" : "#4af0a0"; c.fillRect(W / 2 + 190, 20, 100 * energy, 12); },
      key(e) { const D = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } }[e.code]; if (!D) return; const last = dirQ.length ? dirQ[dirQ.length - 1] : dir; if (!(D.x === -last.x && D.y === -last.y) && !(D.x === last.x && D.y === last.y) && dirQ.length < 2) dirQ.push(D); },
    };
  };

  /* ---------- Tour à empiler ---------- */
  T.stack = (G, cfg) => {
    const { W, H } = G, BHT = 30, BASE = 540; let tower, cur, dirx, fall, camY, perfect;
    const target = () => 5 + G.level, pal = cfg.palette || ["#ff5a6e", "#ff9a3c", "#ffd23f", "#6ee06e", "#4aa3ff", "#b07dff"], spd = () => 190 + G.level * 28;
    const newBlock = () => { const top = tower[tower.length - 1]; cur = { x: 0, w: top.w, y: BASE - BHT * (tower.length + 1) }; dirx = 1; };
    return {
      controls: "ESPACE : lâche le bloc au bon moment  •  plus c'est bien aligné, plus la tour reste large",
      init() { tower = [{ x: W / 2 - 150, w: 300, y: BASE - BHT }]; fall = null; camY = 0; perfect = 0; newBlock(); },
      update(dt) {
        cur.x += dirx * spd() * dt; if (cur.x + cur.w > W - 20) { cur.x = W - 20 - cur.w; dirx = -1; } if (cur.x < 20) { cur.x = 20; dirx = 1; }
        const wantCam = Math.max(0, (tower.length - 8) * BHT); camY += (wantCam - camY) * Math.min(1, dt * 4); if (fall) { fall.y += 500 * dt; if (fall.y > BASE + 300) fall = null; }
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.save(); c.translate(0, camY); c.fillStyle = cfg.ground || "#4a3a2a"; c.fillRect(0, BASE, W, H + camY);
        const blk = (b, i) => { c.fillStyle = pal[i % pal.length]; c.beginPath(); c.roundRect(b.x, b.y, b.w, BHT - 2, 6); c.fill(); c.fillStyle = "rgba(255,255,255,.3)"; c.fillRect(b.x + 4, b.y + 3, b.w - 8, 5); if (cfg.layers && b.w > 40) G.em(cfg.layers[i % cfg.layers.length], b.x + b.w / 2, b.y + BHT / 2, 22); };
        tower.forEach(blk); if (fall) { c.globalAlpha = .7; blk(fall, tower.length); c.globalAlpha = 1; } blk(cur, tower.length);
        c.save(); c.translate(cur.x + cur.w / 2, cur.y - 30); c.scale(1.1, 1.1); heroTop(c, G.me, { x: 0, y: 1 }, Math.sin(G.time * 5), G.time); c.restore(); c.restore();
      },
      hud() { G.text("Étages : " + (tower.length - 1) + " / " + target(), W / 2, 62, 18); if (perfect > 1) G.text("Parfait x" + perfect + " !", W - 14, 62, 20, "#6ee06e", "right"); },
      key(e) {
        if (e.code !== "Space") return; const top = tower[tower.length - 1], l = Math.max(cur.x, top.x), r = Math.min(cur.x + cur.w, top.x + top.w), ov = r - l;
        if (ov <= 6) { fall = { ...cur }; Music.sfx("hit"); G.lives--; G.shake = .3; if (G.lives <= 0) G.lose(); else G.retryLevel(); return; }
        if (Math.abs(cur.x - top.x) < 7) { perfect++; tower.push({ x: top.x, w: top.w, y: cur.y }); G.score += 30 + perfect * 10; Music.sfx("match"); G.float(cur.x + cur.w / 2, cur.y - 40 + camY, "PARFAIT !", "#6ee06e"); }
        else { perfect = 0; fall = { x: cur.x < top.x ? cur.x : r, w: cur.w - ov, y: cur.y }; tower.push({ x: l, w: ov, y: cur.y }); G.score += 10; Music.sfx("bounce"); }
        if (tower.length - 1 >= target()) { G.levelDone(); return; } newBlock();
      },
    };
  };
})();
