"use strict";
/* Moteur commun des jeux « arcade » : un seul code, des dizaines de jeux grâce aux réglages de games.js.
   Chaque jeu a 10 niveaux, 3 vies, un record, les 20 personnages et la musique. */
const Arcade = (() => {
  const T = {}, D = {};   // T : modèles de jeu, D : mini-vidéos de démonstration
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function start(cfg) {
    const cv = document.getElementById("c"), ctx = cv.getContext("2d"), W = 800, H = 600, TOTAL = cfg.levels || 10;
    const G = { cfg, ctx, W, H, TOTAL, hero: heroIndexFromUrl(), state: "title", time: 0, level: 1, score: 0, lives: 3, best: 0, overT: 0, banner: 0, inv: 0, shake: 0, parts: [], floats: [], clamp, rnd, pick, shuffle };
    Object.defineProperty(G, "me", { get() { return HEROES[G.hero]; } });
    const key = "arc-best-" + cfg.id;
    try { G.best = +localStorage.getItem(key) || 0; } catch (e) {}
    G.text = (t, x, y, s, c, a) => Kit.text(ctx, t, x, y, s, c, a);
    G.em = (e, x, y, s, rot) => { ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.font = s + "px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(e, 0, 0); ctx.restore(); };
    G.bg = (top, bottom) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
    G.burst = (x, y, c, n = 10) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.3, s = 40 + Math.random() * 190; G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: .5 + Math.random() * .3, c }); } };
    G.float = (x, y, t, c) => G.floats.push({ x, y, t, c: c || "#ffd23f", life: 1 });
    G.save = () => { if (G.score > G.best) { G.best = G.score; try { localStorage.setItem(key, G.best); } catch (e) {} } };
    G.win = () => { G.state = "win"; G.overT = .8; Music.sfx("win"); G.save(); };
    G.lose = () => { G.state = "over"; G.overT = .8; Music.sfx("lose"); G.save(); };
    G.hurt = () => { if (G.inv > 0 || G.state !== "play") return false; G.lives--; G.inv = 2; G.shake = .3; Music.sfx("hit"); if (G.lives <= 0) G.lose(); return true; };
    G.levelDone = bonus => { G.score += bonus === undefined ? 50 * G.level : bonus; if (G.level >= TOTAL) { G.win(); return; } G.level++; Music.sfx("level"); G.banner = 1.6; G.inv = 1; M.init(); };
    G.retryLevel = () => { G.banner = 1.4; G.inv = 1; M.init(); };
    const M = T[cfg.type](G, cfg);
    G.sky = cfg.sky || ["#2a1458", "#0f3a5a"];

    function newGame() { G.level = 1; G.score = 0; G.lives = cfg.lives || 3; G.parts = []; G.floats = []; G.state = "play"; G.banner = 1.6; G.inv = 1; M.init(); }
    function update(dt) {
      G.time += dt; G.overT -= dt; G.shake = Math.max(0, G.shake - dt);
      for (let i = G.parts.length - 1; i >= 0; i--) { const p = G.parts[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; if (p.life <= 0) G.parts.splice(i, 1); }
      for (let i = G.floats.length - 1; i >= 0; i--) { G.floats[i].life -= dt; G.floats[i].y -= 40 * dt; if (G.floats[i].life <= 0) G.floats.splice(i, 1); }
      if (G.state !== "play" || Kit.paused) return;
      G.banner -= dt; if (G.inv > 0) G.inv -= dt;
      M.update(dt);
    }
    function overlay(title, sub, col, extra) {
      ctx.fillStyle = "rgba(0,0,0,.66)"; ctx.fillRect(0, 0, W, H); G.text(title, W / 2, 240, 60, col); G.text(sub, W / 2, 305, 24);
      if (extra) G.text(extra, W / 2, 345, 22, "#ffd23f"); G.text("ESPACE pour rejouer", W / 2, 405, 22, "#bde");
    }
    function draw() {
      if (G.state === "title") {
        G.bg(G.sky[0], G.sky[1]); ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(0, 0, W, H);
        G.em(cfg.emoji || "🎮", W / 2, 90, 84); G.text(cfg.name.toUpperCase(), W / 2, 175, cfg.name.length > 22 ? 36 : 46, "#ffd23f");
        G.text(cfg.desc, W / 2, 215, 20); G.text(M.controls, W / 2, 262, 14, "#cfe"); G.text("P : pause  •  M : musique  •  Échap : menu  •  " + TOTAL + " niveaux, 3 vies", W / 2, 285, 14, "#cfe");
        G.text("◀  " + G.me.name + "  ▶   (flèches, Tab ou clic)", W / 2, 345, 22, G.me.ship.color);
        ctx.save(); ctx.translate(W / 2, 425); ctx.scale(2.6, 2.6); heroTop(ctx, G.me, { x: 0, y: 1 }, Math.sin(G.time * 6), G.time); ctx.restore();
        G.text("Appuie sur ESPACE pour jouer", W / 2, 520, 26); if (G.best) G.text("Record : " + G.best, W / 2, 560, 18, "#bde");
        return;
      }
      ctx.save(); if (G.shake > 0) ctx.translate((Math.random() - .5) * G.shake * 18, (Math.random() - .5) * G.shake * 18);
      M.draw(); ctx.restore();
      for (const p of G.parts) { ctx.globalAlpha = Math.max(0, p.life * 2); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 4, 4); } ctx.globalAlpha = 1;
      for (const f of G.floats) { ctx.globalAlpha = Math.min(1, f.life * 2); G.text(f.t, f.x, f.y, 22, f.c); } ctx.globalAlpha = 1;
      if (!M.noHud) { G.text("Score " + G.score, 14, 32, 24, "#ffd23f", "left"); G.text("Niveau " + G.level + "/" + TOTAL, W / 2, 32, 22); G.text("♥".repeat(Math.max(0, G.lives)), W - 14, 32, 26, "#ff5a6e", "right"); }
      if (M.hud) M.hud();
      if (G.banner > 0 && G.state === "play") G.text("Niveau " + G.level, W / 2, 300, 54);
      if (Kit.paused) { ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.fillRect(0, 0, W, H); G.text("PAUSE", W / 2, H / 2, 60); }
      if (G.state === "win") overlay("BRAVO !", TOTAL + " niveaux terminés ! Score : " + G.score, "#ffd23f", G.score >= G.best ? "Nouveau record !" : "");
      if (G.state === "over") overlay("GAME OVER", "Score : " + G.score + "  •  Niveau " + G.level, "#ff5a6e", G.score >= G.best && G.score > 0 ? "Nouveau record !" : "");
    }
    Kit.install({
      canvas: cv, home: "index.html", song: cfg.song || "brick", getHero: () => G.hero, setHero: i => { G.hero = i; }, isTitle: () => G.state === "title", canPause: () => G.state === "play",
      keydown(e) {
        if (e.code === "Space" && (G.state === "title" || ((G.state === "over" || G.state === "win") && G.overT <= 0))) { newGame(); return; }
        if (G.state === "play" && !Kit.paused && M.key) M.key(e);
      },
      keyup(e) { if (G.state === "play" && M.keyup) M.keyup(e); },
    });
    Kit.loop(update, draw);
    return G;
  }

  /* ---------- Attrape (paniers, seaux, filets) ---------- */
  T.catch = (G, cfg) => {
    const { W, H } = G, GY = 548; let P, items, caught, spawnT, big, bigCd, combo;
    const quota = () => 6 + G.level * 2;
    return {
      controls: "← → : bouger  •  ESPACE : attrapeur géant (8 s d'attente)",
      init() { P = { x: W / 2, dir: 1, run: 0 }; items = []; caught = 0; spawnT = .5; big = 0; bigCd = 0; combo = 0; },
      update(dt) {
        const k = Kit.keys, dx = (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0); if (dx) { P.dir = dx; P.run += dt * 14; } P.x = clamp(P.x + dx * 360 * dt, 40, W - 40);
        big = Math.max(0, big - dt); bigCd = Math.max(0, bigCd - dt); spawnT -= dt;
        if (spawnT <= 0) {
          spawnT = Math.max(.28, .85 - G.level * .05) + Math.random() * .25; const r = Math.random(), bad = r < .15 + G.level * .012, bonus = !bad && r < .2 + G.level * .012;
          items.push({ x: rnd(40, W - 40), y: -30, vy: 150 + G.level * 22 + Math.random() * 60, kind: bad ? "bad" : bonus ? "bonus" : "good", e: bad ? pick(cfg.bad) : bonus ? cfg.bonus : pick(cfg.good), rot: 0 });
        }
        const rw = big > 0 ? 95 : 50;
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i]; it.y += it.vy * dt; it.rot += dt * 3;
          if (it.y > GY - 125 && it.y < GY - 40 && Math.abs(it.x - P.x) < rw) {
            items.splice(i, 1);
            if (it.kind === "bad") { combo = 0; G.burst(it.x, it.y, "#ff9a3c", 18); G.hurt(); }
            else { combo++; const pts = (it.kind === "bonus" ? 50 : 10) + Math.min(20, combo); G.score += pts; caught += it.kind === "bonus" ? 2 : 1; Music.sfx(it.kind === "bonus" ? "match" : "coin"); G.burst(it.x, it.y, "#fff", 6); G.float(it.x, it.y - 20, "+" + pts); }
          } else if (it.y > H + 30) { items.splice(i, 1); if (it.kind !== "bad") combo = 0; }
        }
        if (caught >= quota()) G.levelDone();
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.fillStyle = cfg.ground || "#4fa83a"; c.fillRect(0, GY + 20, W, H);
        for (const it of items) G.em(it.e, it.x, it.y, 36, Math.sin(it.rot) * .3);
        if (!(G.inv > 0 && Math.floor(G.time * 14) % 2)) { c.save(); c.translate(P.x, GY - 34); c.scale(1.3 * P.dir, 1.3); heroSide(c, G.me, Math.sin(P.run) * 5, true, G.time); c.restore(); G.em(cfg.catcher || "🧺", P.x, GY - 92, big > 0 ? 110 : 64); }
      },
      hud() { const c = G.ctx; c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(W / 2 - 100, 44, 200, 12); c.fillStyle = "#6ee06e"; c.fillRect(W / 2 - 100, 44, 200 * Math.min(1, caught / quota()), 12); G.text(caught + "/" + quota(), W / 2, 76, 14);
        if (combo > 2) G.text("Série x" + combo, 14, 62, 18, "#6ee06e", "left"); c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(14, H - 26, 120, 12); c.fillStyle = bigCd > 0 ? "#888" : "#ffe98a"; c.fillRect(14, H - 26, 120 * (1 - bigCd / 8), 12); G.text("GÉANT (espace)", 74, H - 32, 11); },
      key(e) { if (e.code === "Space" && bigCd <= 0) { big = 4; bigCd = 8; Music.sfx("power"); } },
    };
  };

  /* ---------- Esquive (pluie d'objets) ---------- */
  T.dodge = (G, cfg) => {
    const { W, H } = G, GY = 540; let P, hz, st, spawnT, dashCd, dashT, lvT;
    return {
      controls: "← → : courir  •  ESPACE : ruée éclair (esquive rapide)",
      init() { P = { x: W / 2, dir: 1, run: 0 }; hz = []; st = []; spawnT = .8; dashCd = 0; dashT = 0; lvT = 0; },
      update(dt) {
        lvT += dt; if (lvT >= 10) { G.levelDone(); return; }
        const k = Kit.keys, dx = (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0); if (dx) { P.dir = dx; P.run += dt * 12; } dashCd = Math.max(0, dashCd - dt); dashT = Math.max(0, dashT - dt);
        P.x = clamp(P.x + (dashT > 0 ? P.dir * 1100 : dx * 330) * dt, 24, W - 24);
        spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(.2, .8 - G.level * .055) + Math.random() * .2;
          if (Math.random() < .22) st.push({ x: rnd(30, W - 30), y: -20, vy: 170, heart: Math.random() < .08 });
          else { const s = pick([30, 36, 44]); hz.push({ x: rnd(30, W - 30), y: -50, vy: 190 + G.level * 22 + Math.random() * 90, vx: rnd(-60, 60), s, e: pick(cfg.hazard), rot: 0 }); } }
        for (let i = hz.length - 1; i >= 0; i--) { const h = hz[i]; h.y += h.vy * dt; h.x += h.vx * dt; h.rot += dt * 3; if (h.x < 10 || h.x > W - 10) h.vx = -h.vx;
          if (h.y > GY + 10) { G.burst(h.x, GY, "#ffb23a", 6); hz.splice(i, 1); G.score += 1; continue; }
          if (Math.hypot(h.x - P.x, h.y - (GY - 28)) < h.s * .45 + 16 && h.y < GY) { G.burst(h.x, h.y, "#ff7a3a", 14); hz.splice(i, 1); G.hurt(); } }
        for (let i = st.length - 1; i >= 0; i--) { const s = st[i]; s.y += s.vy * dt; if (s.y > H) { st.splice(i, 1); continue; }
          if (Math.hypot(s.x - P.x, s.y - (GY - 28)) < 34) { st.splice(i, 1); if (s.heart) { G.lives = Math.min(6, G.lives + 1); Music.sfx("power"); } else { G.score += 10; Music.sfx("coin"); } G.burst(s.x, s.y, "#ffd23f", 10); } }
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.fillStyle = cfg.ground || "#4a3a60"; c.fillRect(0, GY, W, H - GY); c.fillStyle = "rgba(255,255,255,.2)"; c.fillRect(0, GY, W, 5);
        for (const h of hz) G.em(h.e, h.x, h.y, h.s * 1.3, h.rot);
        for (const s of st) G.em(s.heart ? "❤️" : cfg.collect || "⭐", s.x, s.y, 34, Math.sin(G.time * 4));
        if (!(G.inv > 0 && Math.floor(G.time * 14) % 2)) { if (dashT > 0) { c.globalAlpha = .4; c.fillStyle = G.me.ship.color; c.fillRect(P.x - P.dir * 90, GY - 56, 90, 50); c.globalAlpha = 1; }
          c.save(); c.translate(P.x, GY - 42); c.scale(1.4 * P.dir, 1.4); heroSide(c, G.me, Math.sin(P.run) * 5, true, G.time); c.restore(); }
      },
      hud() { const c = G.ctx; G.text(Math.ceil(10 - lvT) + " s", W / 2, 62, 18); c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(14, H - 26, 120, 12); c.fillStyle = dashCd > 0 ? "#888" : "#ffe98a"; c.fillRect(14, H - 26, 120 * (1 - dashCd / 1.5), 12); G.text("RUÉE (espace)", 74, H - 32, 11); },
      key(e) { if (e.code === "Space" && dashCd <= 0) { dashT = .16; dashCd = 1.5; Music.sfx("jump"); } },
    };
  };

  /* ---------- Course sans fin (saute, baisse-toi) ---------- */
  T.runner = (G, cfg) => {
    const { W, H } = G, GY = 470, PX = 170; let P, obs, items, spawnT, dist, speed, scroll = 0;
    return {
      controls: "ESPACE ou ↑ : sauter (double saut)  •  ↓ : se baisser",
      init() { P = { y: GY, vy: 0, jumps: 0, duck: false, anim: 0 }; obs = []; items = []; spawnT = .8; dist = 0; speed = 300; },
      update(dt) {
        const k = Kit.keys; speed = 300 + G.level * 24; dist += speed * dt; scroll += speed * dt; P.anim += dt * speed * .03;
        if (dist >= 2000) { G.levelDone(); return; }
        P.duck = !!k.ArrowDown && P.y >= GY - 1; P.vy += 2300 * dt; P.y += P.vy * dt;
        const inPit = obs.some(o => o.t === "pit" && PX > o.x && PX < o.x + o.w), solid = !inPit || G.inv > 0;
        if (P.y >= GY && solid && P.vy >= 0) { P.y = GY; P.vy = 0; P.jumps = 0; }
        if (P.y > GY + 140) { G.hurt(); P.y = GY - 200; P.vy = 0; G.inv = Math.max(G.inv, 2); }
        spawnT -= dt; if (spawnT <= 0) { spawnT = 1.5 - Math.min(.7, speed / 950) + Math.random() * .5; const r = Math.random(), x = W + 60;
          if (r < .3) obs.push({ t: "low", x, w: 44, h: 40, e: pick(cfg.obst), s: 46 }); else if (r < .5) obs.push({ t: "tall", x, w: 40, h: 72, e: pick(cfg.obst), s: 72 });
          else if (r < .74) obs.push({ t: "pit", x, w: 130 + Math.random() * 60, h: 0 }); else obs.push({ t: "air", x, w: 40, h: 24, y: GY - 62, e: pick(cfg.air), s: 40 });
          const last = obs[obs.length - 1], n = 3 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) items.push({ x: x + last.w / 2 + (i - n / 2) * 36, y: (last.t === "air" ? GY - 120 : GY - 100 - Math.random() * 30) - Math.sin(i / (n - 1 || 1) * Math.PI) * 50 }); }
        const ph = P.duck ? 28 : 56, box = { x: PX - 13, y: P.y - ph, w: 26, h: ph };
        for (const o of obs) { o.x -= speed * dt; if (o.t === "pit") continue; const oy = o.t === "air" ? o.y : GY - o.h; if (box.x < o.x + o.w - 4 && box.x + box.w > o.x + 4 && box.y < oy + o.h && box.y + box.h > oy) G.hurt(); }
        obs = obs.filter(o => o.x + o.w > -60);
        for (const it of items) { it.x -= speed * dt; if (!it.got && Math.hypot(it.x - PX, it.y - (P.y - ph / 2)) < 30) { it.got = true; G.score += 5; Music.sfx("coin"); } }
        items = items.filter(i => i.x > -30 && !i.got);
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.fillStyle = cfg.hills || "rgba(0,0,0,.18)"; for (let i = -1; i < 6; i++) { const x = i * 190 - (scroll * .3) % 190; c.beginPath(); c.arc(x + 95, GY, 110, Math.PI, 0); c.fill(); }
        c.fillStyle = cfg.ground2 || "#7a4e2d"; c.fillRect(0, GY, W, H - GY); c.fillStyle = cfg.ground || "#58b04a"; c.fillRect(0, GY, W, 12);
        for (const o of obs) { if (o.t === "pit") { c.fillStyle = "#120a05"; c.fillRect(o.x, GY, o.w, H - GY); } else if (o.t === "air") G.em(o.e, o.x + o.w / 2, o.y + 12 + Math.sin(G.time * 8) * 4, o.s); else G.em(o.e, o.x + o.w / 2, GY - o.h / 2, o.s); }
        for (const it of items) G.em(cfg.coin || "🪙", it.x, it.y, 26);
        if (!(G.inv > 0 && Math.floor(G.time * 14) % 2)) { c.save(); c.translate(PX, P.y); c.scale(1.5, P.duck ? .85 : 1.5); c.translate(0, -30); heroSide(c, G.me, P.y >= GY ? Math.sin(P.anim * 2) * 6 : 0, P.y >= GY, G.time); c.restore(); }
      },
      hud() { G.text(Math.floor(dist / 10) + " / 200 m", W / 2, 62, 18); },
      key(e) { if ((e.code === "Space" || e.code === "ArrowUp") && P.jumps < 2) { P.vy = P.jumps === 0 ? -820 : -720; P.jumps++; Music.sfx("jump"); } },
    };
  };

  /* ---------- Vol (passe entre les obstacles) ---------- */
  T.flappy = (G, cfg) => {
    const { W, H } = G, GY = 540; let P, pil, spawnT, passed, scroll = 0;
    const gap = () => Math.max(150, 220 - G.level * 6), spd = () => 190 + G.level * 12;
    const pc = cfg.pillar || ["#e0883c", "#f0a050", "#9a4a14"];
    return {
      controls: "ESPACE ou ↑ : battre des ailes  •  ↓ : plonger",
      init() { P = { x: 230, y: 280, vy: 0 }; pil = []; spawnT = .6; passed = 0; },
      update(dt) {
        const k = Kit.keys; P.vy += (k.ArrowDown ? 1500 : 1000) * dt; P.vy = Math.min(P.vy, 600); P.y += P.vy * dt; scroll += spd() * dt;
        spawnT -= dt; if (spawnT <= 0) { spawnT = 1.6 - Math.min(.4, G.level * .04); const g = gap(); pil.push({ x: W + 40, w: 70, top: 70 + Math.random() * (GY - g - 140), gap: g, ok: false }); }
        for (const p of pil) { p.x -= spd() * dt;
          if (P.x + 14 > p.x && P.x - 14 < p.x + p.w && (P.y - 18 < p.top || P.y + 20 > p.top + p.gap)) { if (G.hurt()) { P.y = p.top + p.gap / 2; P.vy = 0; pil = pil.filter(q => q.x > P.x + 200 || q.x + q.w < P.x - 40); break; } }
          if (!p.ok && p.x + p.w < P.x - 14) { p.ok = true; passed++; G.score += 5; Music.sfx("pop"); } }
        pil = pil.filter(p => p.x > -100);
        if (P.y > GY - 20) { P.y = GY - 20; if (G.hurt()) P.vy = -300; } if (P.y < 20) { P.y = 20; P.vy = 0; }
        if (passed >= 5 + Math.floor(G.level / 2)) G.levelDone();
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.fillStyle = cfg.hills || "rgba(255,255,255,.35)"; for (let i = -1; i < 12; i++) { const x = i * 90 - (scroll * .3) % 90; c.beginPath(); c.arc(x + 45, GY, 70, Math.PI, 0); c.fill(); }
        for (const p of pil) { const g = c.createLinearGradient(p.x, 0, p.x + p.w, 0); g.addColorStop(0, pc[0]); g.addColorStop(.5, pc[1]); g.addColorStop(1, pc[2]); c.fillStyle = g; c.fillRect(p.x, 0, p.w, p.top); c.fillRect(p.x, p.top + p.gap, p.w, GY - p.top - p.gap); c.fillStyle = pc[2]; c.fillRect(p.x - 6, p.top - 22, p.w + 12, 22); c.fillRect(p.x - 6, p.top + p.gap, p.w + 12, 22); }
        c.fillStyle = cfg.ground || "#6ea838"; c.fillRect(0, GY, W, H - GY);
        if (!(G.inv > 0 && Math.floor(G.time * 14) % 2)) { c.save(); c.translate(P.x, P.y); c.rotate(clamp(P.vy / 700, -.5, .7)); if (cfg.ride) G.em(cfg.ride, 0, -34, 52); c.scale(1.2, 1.2); c.translate(0, -16); heroSide(c, G.me, 3 * Math.sin(G.time * 14), false, G.time); c.restore(); }
      },
      hud() { G.text(passed + "/" + (5 + Math.floor(G.level / 2)), W / 2, 62, 18); },
      key(e) { if (e.code === "Space" || e.code === "ArrowUp") { P.vy = -400; Music.sfx("flap"); } },
    };
  };

  /* ---------- Tir vertical (insectes, fantômes, robots…) ---------- */
  T.shooter = (G, cfg) => {
    const { W, H } = G, PY = 540; let P, bl, en, eb, pw, spawnT, kills, quota, boss;
    return {
      controls: "← → ↑ ↓ : piloter  •  ESPACE (maintenu) : tirer",
      init() { P = { x: W / 2, y: PY, cd: 0 }; bl = []; en = []; eb = []; pw = []; spawnT = 1; kills = 0; boss = null; quota = 8 + G.level * 2;
        if (G.level % 5 === 0) { quota = 1; boss = { x: W / 2, y: -80, hp: 30 + G.level * 6, max: 30 + G.level * 6, t: 0, cd: 1.5, r: 52 }; } },
      update(dt) {
        const k = Kit.keys; P.x = clamp(P.x + ((k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0)) * 340 * dt, 24, W - 24); P.y = clamp(P.y + ((k.ArrowDown ? 1 : 0) - (k.ArrowUp ? 1 : 0)) * 300 * dt, 300, H - 26); P.cd -= dt;
        if (k.Space && P.cd <= 0) { bl.push({ x: P.x, y: P.y - 20 }); P.cd = .2; Music.sfx("bounce"); }
        spawnT -= dt; if (!boss && spawnT <= 0 && en.length < 8) { spawnT = Math.max(.35, 1 - G.level * .06); en.push({ x: rnd(50, W - 50), y: -30, bx: 0, t: 0, hp: G.level >= 5 ? 2 : 1, e: pick(cfg.enemy), v: 80 + G.level * 9, cd: rnd(1, 3) }); en[en.length - 1].bx = en[en.length - 1].x; }
        for (const e of en) { e.t += dt; e.y += e.v * dt; e.x = e.bx + Math.sin(e.t * 2) * 50; e.cd -= dt; if (e.cd <= 0 && e.y > 0 && e.y < 380) { e.cd = rnd(1.4, 3) - G.level * .06; eb.push({ x: e.x, y: e.y + 16, vx: (P.x - e.x) * .25, vy: 200 + G.level * 8 }); } }
        if (boss) { boss.t += dt; if (boss.y < 110) boss.y += 60 * dt; boss.x = W / 2 + Math.sin(boss.t * .8) * 260; boss.cd -= dt; if (boss.cd <= 0) { boss.cd = Math.max(.6, 1.3 - G.level * .03); for (let a = -2; a <= 2; a++) eb.push({ x: boss.x, y: boss.y + 40, vx: a * 70, vy: 220 }); } }
        for (let i = bl.length - 1; i >= 0; i--) { const b = bl[i]; b.y -= 560 * dt; let gone = b.y < -10;
          for (let j = en.length - 1; j >= 0 && !gone; j--) { const e = en[j]; if (Math.abs(b.x - e.x) < 22 && Math.abs(b.y - e.y) < 22) { gone = true; if (--e.hp <= 0) { en.splice(j, 1); kills++; G.score += 10 * G.level; G.burst(e.x, e.y, "#ffd23f", 12); Music.sfx("brick"); if (Math.random() < .1) pw.push({ x: e.x, y: e.y }); } else Music.sfx("bounce"); } }
          if (boss && !gone && Math.abs(b.x - boss.x) < boss.r && Math.abs(b.y - boss.y) < boss.r) { gone = true; boss.hp--; G.burst(b.x, b.y, "#fff", 3); if (boss.hp <= 0) { G.burst(boss.x, boss.y, "#ff9a3c", 40); G.score += 200 * G.level; boss = null; kills = 1; } }
          if (gone) bl.splice(i, 1); }
        for (let i = eb.length - 1; i >= 0; i--) { const b = eb[i]; b.x += b.vx * dt; b.y += b.vy * dt; if (b.y > H + 10 || b.x < -10 || b.x > W + 10) { eb.splice(i, 1); continue; } if (Math.hypot(b.x - P.x, b.y - P.y) < 18) { eb.splice(i, 1); G.burst(P.x, P.y, "#ff9a3c", 16); G.hurt(); } }
        for (const e of en) if (Math.hypot(e.x - P.x, e.y - P.y) < 30) { e.hp = 0; G.hurt(); } en = en.filter(e => e.hp > 0 && e.y < H + 40);
        for (let i = pw.length - 1; i >= 0; i--) { const p = pw[i]; p.y += 100 * dt; if (Math.hypot(p.x - P.x, p.y - P.y) < 26) { pw.splice(i, 1); G.lives = Math.min(6, G.lives + 1); Music.sfx("power"); } else if (p.y > H) pw.splice(i, 1); }
        if (kills >= quota) G.levelDone();
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.fillStyle = "#fff"; for (let i = 0; i < 40; i++) { c.globalAlpha = .3 + .3 * Math.sin(G.time * 2 + i); c.fillRect((i * 131) % W, (i * 77 + G.time * 20) % H, 2, 2); } c.globalAlpha = 1;
        for (const e of en) G.em(e.e, e.x, e.y, 38); if (boss) { G.em(cfg.boss || "👹", boss.x, boss.y, 120); c.fillStyle = "rgba(0,0,0,.5)"; c.fillRect(W / 2 - 150, 50, 300, 10); c.fillStyle = "#ff4d5e"; c.fillRect(W / 2 - 150, 50, 300 * boss.hp / boss.max, 10); }
        c.fillStyle = cfg.bullet || "#7dffb0"; for (const b of bl) c.fillRect(b.x - 2, b.y - 8, 4, 14); for (const b of eb) { c.fillStyle = "#ff4d6d"; c.beginPath(); c.arc(b.x, b.y, 5, 0, 7); c.fill(); }
        for (const p of pw) G.em("❤️", p.x, p.y, 28);
        if (!(G.inv > 0 && Math.floor(G.time * 14) % 2)) { c.fillStyle = G.me.ship.color; c.beginPath(); c.moveTo(P.x - 22, P.y + 14); c.lineTo(P.x - 8, P.y - 2); c.lineTo(P.x, P.y - 18); c.lineTo(P.x + 8, P.y - 2); c.lineTo(P.x + 22, P.y + 14); c.fill(); c.save(); c.translate(P.x, P.y + 2); c.scale(.8, .8); heroTop(c, G.me, { x: 0, y: -1 }, 0, G.time); c.restore(); }
      },
      hud() { G.text(boss ? "BOSS !" : kills + "/" + quota, W / 2, 62, 18, boss ? "#ff5a6e" : "#fff"); },
    };
  };

  /* ---------- Chasse (taupes, fantômes, lapins…) ---------- */
  T.whack = (G, cfg) => {
    const { W, H } = G; let cur, swing, combo, holes, spawnT, left, lvStart, shake2 = 0;
    const pos = i => ({ x: 200 + (i % 3) * 200, y: 250 + Math.floor(i / 3) * 130 }), need = () => 40 + G.level * 16;
    return {
      controls: "← ↑ ↓ → : choisir le trou  •  ESPACE : taper !",
      init() { cur = 4; swing = 0; combo = 0; left = 25; spawnT = .5; lvStart = G.score; holes = Array.from({ length: 9 }, () => ({ life: 0, t: 0, kind: "", up: 0, hit: 0, e: "" })); },
      update(dt) {
        swing = Math.max(0, swing - dt); left -= dt;
        if (left <= 0) { if (G.score - lvStart >= need()) G.levelDone(0); else { G.score = Math.max(0, G.score); G.lives--; Music.sfx("nope"); if (G.lives <= 0) G.lose(); else G.retryLevel(); } return; }
        spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(.22, .85 - G.level * .05); const free = holes.map((h, i) => h.life <= 0 ? i : -1).filter(i => i >= 0);
          if (free.length) { const h = holes[pick(free)], r = Math.random(); h.kind = r < .12 ? "gold" : r < .27 ? "bomb" : "mole"; h.e = h.kind === "gold" ? cfg.gold : h.kind === "bomb" ? cfg.bomb : pick(cfg.pop); h.life = Math.max(.4, 1.5 - G.level * .08 - (25 - left) * .012) * (h.kind === "gold" ? .75 : 1); h.t = 0; h.hit = 0; } }
        for (const h of holes) { if (h.hit > 0) { h.hit -= dt; if (h.hit <= 0) { h.life = 0; h.up = 0; } else h.up = Math.max(0, h.up - dt * 3); continue; }
          if (h.life > 0) { h.t += dt; h.up = Math.min(1, h.t * 8, (h.life - h.t) * 8); if (h.t >= h.life) { if (h.kind !== "bomb") combo = 0; h.life = 0; h.up = 0; } } }
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.fillStyle = cfg.ground || "#5fb04a"; c.fillRect(0, 170, W, H);
        for (let i = 0; i < 9; i++) { const p = pos(i), h = holes[i]; c.fillStyle = "#3a2410"; c.beginPath(); c.ellipse(p.x, p.y + 20, 62, 22, 0, 0, 7); c.fill();
          if (h.up > .02) { c.save(); c.beginPath(); c.rect(p.x - 70, p.y - 100, 140, 120); c.clip(); G.em(h.hit > 0 ? "💫" : h.e, p.x, p.y + 20 - h.up * 62, 66); c.restore(); }
          c.fillStyle = cfg.rim || "#5a3a1a"; c.beginPath(); c.ellipse(p.x, p.y + 30, 66, 16, 0, 0, Math.PI); c.fill(); }
        const p = pos(cur), a = swing > 0 ? 1 - swing / .18 : 0; c.strokeStyle = G.me.ship.color; c.lineWidth = 5; c.setLineDash([10, 8]); c.beginPath(); c.ellipse(p.x, p.y + 20, 70, 28, 0, 0, 7); c.stroke(); c.setLineDash([]);
        c.save(); c.translate(p.x + 50, p.y - 70 + a * 40); c.rotate(-.6 + a * .9); c.fillStyle = "#8a5a2a"; c.fillRect(-4, 0, 8, 70); c.fillStyle = G.me.ship.color; c.fillRect(-20, -26, 40, 28); c.restore();
        c.save(); c.translate(p.x + 76, p.y - 30); c.scale(1.4, 1.4); heroTop(c, G.me, { x: -1, y: 0 }, 0, G.time); c.restore();
      },
      hud() { G.text("⏱ " + Math.ceil(left) + " s", W / 2, 62, 22, left < 6 ? "#ff5a6e" : "#fff"); G.text("Objectif : +" + need() + "  (" + Math.max(0, G.score - lvStart) + ")", W / 2, 90, 16); if (combo > 1) G.text("Combo x" + combo, W - 14, 62, 20, "#6ee06e", "right"); },
      key(e) {
        let x = cur % 3, y = Math.floor(cur / 3);
        if (e.code === "ArrowLeft") x = (x + 2) % 3; else if (e.code === "ArrowRight") x = (x + 1) % 3; else if (e.code === "ArrowUp") y = (y + 2) % 3; else if (e.code === "ArrowDown") y = (y + 1) % 3;
        else if (e.code === "Space") { if (swing > 0) return; swing = .18; const h = holes[cur];
          if (h.life > 0 && h.hit <= 0 && h.up > .5) { h.hit = .4; const p = pos(cur); if (h.kind === "bomb") { G.score = Math.max(0, G.score - 20); combo = 0; Music.sfx("hit"); G.shake = .3; G.float(p.x, p.y - 60, "-20 💥", "#ff5a6e"); }
            else { combo++; const pts = (h.kind === "gold" ? 30 : 10) + Math.min(20, (combo - 1) * 2); G.score += pts; Music.sfx(h.kind === "gold" ? "match" : "coin"); G.float(p.x, p.y - 60, "+" + pts); } }
          else { combo = 0; Music.sfx("bounce"); } return; } else return;
        cur = y * 3 + x;
      },
    };
  };

  return { start, T, D, clamp, rnd, pick, shuffle };
})();
