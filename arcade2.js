"use strict";
/* Modèles de jeu, suite : mémoire, questions, timing et figures de sport (skate, trottinette, BMX…). */
(() => {
  const { T, clamp, rnd, pick, shuffle } = Arcade;

  /* ---------- Memory avec des emojis ---------- */
  T.memory = (G, cfg) => {
    const { W, H } = G, LEVELS = [[4, 3], [4, 4], [5, 4], [6, 4], [5, 6], [6, 6], [8, 4], [8, 5], [8, 5], [8, 5]];
    let cards, cols, rows, cur, first, second, wait, streak, moves, lvT;
    const geom = () => { const cw = Math.min(110, (W - 90) / cols - 12, (H - 190) / rows - 12), ch = cw * 1.12; return { cw, ch, x0: (W - cols * (cw + 12) + 12) / 2, y0: 110 + ((H - 130) - rows * (ch + 12) + 12) / 2 }; };
    return {
      noHud: true, controls: "← ↑ ↓ → : curseur  •  ESPACE : retourner une carte  •  trouve toutes les paires",
      init() { [cols, rows] = LEVELS[G.level - 1]; const pairs = cols * rows / 2; cards = shuffle(shuffle(cfg.faces.slice()).slice(0, pairs).flatMap(f => [f, f])).map(f => ({ f, flip: 0, up: false, done: false })); cur = 0; first = second = -1; wait = 0; streak = 0; moves = 0; lvT = 0; },
      update(dt) {
        lvT += dt; for (const c of cards) c.flip += ((c.up || c.done ? 1 : 0) - c.flip) * Math.min(1, dt * 14);
        if (wait > 0) { wait -= dt; if (wait <= 0 && second >= 0) { const a = cards[first], b = cards[second];
          if (a.f === b.f) { a.done = b.done = true; streak++; G.score += 100 + 50 * (streak - 1); Music.sfx("match"); const g = geom(); [first, second].forEach(i => G.burst(g.x0 + (i % cols) * (g.cw + 12) + g.cw / 2, g.y0 + Math.floor(i / cols) * (g.ch + 12) + g.ch / 2, "#ffd23f", 10));
            if (cards.every(c => c.done)) G.levelDone(Math.max(0, Math.round(200 - lvT * 2 - moves * 3)) + 100 * G.level); }
          else { a.up = b.up = false; Music.sfx("nope"); } first = second = -1; } }
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx, g = geom();
        cards.forEach((cd, i) => { const x = g.x0 + (i % cols) * (g.cw + 12), y = g.y0 + Math.floor(i / cols) * (g.ch + 12), sx = Math.max(.05, Math.abs(Math.cos(cd.flip * Math.PI))), face = cd.flip > .5;
          c.save(); c.translate(x + g.cw / 2, y + g.ch / 2); c.scale(sx, 1); c.fillStyle = face ? (cd.done ? "#d8ffd8" : "#fff") : (cfg.back || "#3a5aa8"); c.beginPath(); c.roundRect(-g.cw / 2, -g.ch / 2, g.cw, g.ch, 12); c.fill();
          if (face) G.em(cd.f, 0, 2, g.cw * .6); else { c.fillStyle = "rgba(255,255,255,.4)"; G.em("★", 0, 0, g.cw * .45); } c.restore();
          if (i === cur) { c.strokeStyle = G.me.ship.color; c.lineWidth = 5; c.beginPath(); c.roundRect(x - 5, y - 5, g.cw + 10, g.ch + 10, 15); c.stroke(); } });
      },
      hud() { G.text("Score " + G.score, 14, 34, 24, "#ffd23f", "left"); G.text("Niveau " + G.level + "/" + G.TOTAL, W / 2, 34, 22); G.text("Coups " + moves + " • " + Math.floor(lvT) + " s", W - 14, 34, 18, "#fff", "right"); if (streak > 1) G.text("Série x" + streak, W / 2, 72, 20, "#6ee06e"); },
      key(e) {
        let x = cur % cols, y = Math.floor(cur / cols);
        if (e.code === "ArrowLeft") x = (x + cols - 1) % cols; else if (e.code === "ArrowRight") x = (x + 1) % cols; else if (e.code === "ArrowUp") y = (y + rows - 1) % rows; else if (e.code === "ArrowDown") y = (y + 1) % rows;
        else if (e.code === "Space") { const cd = cards[cur]; if (wait > 0 || cd.up || cd.done) return; cd.up = true; Music.sfx("flip"); if (first < 0) first = cur; else { second = cur; moves++; wait = cards[first].f === cd.f ? .5 : Math.max(.45, 1 - G.level * .06); if (cards[first].f !== cd.f) streak = 0; } return; } else return;
        cur = y * cols + x;
      },
    };
  };

  /* ---------- Questions à choix (quiz et calcul) ---------- */
  function choice(G, cfg, makeQ) {
    const { W, H } = G; let q, qi, cur, tLeft, tMax, fb, picked;
    const PER = 6, layout = n => n === 3 ? [0, 1, 2].map(i => ({ x: 70 + i * 230, y: 400, w: 210, h: 90 })) : [0, 1, 2, 3].map(i => ({ x: 120 + (i % 2) * 290, y: 360 + Math.floor(i / 2) * 105, w: 270, h: 88 }));
    const next = () => { q = makeQ(G.level); cur = 0; tMax = tLeft = Math.max(4, (cfg.time || 13) - G.level); fb = 0; picked = -1; };
    const answer = i => {
      if (fb > 0 || i >= q.answers.length) return; picked = i; fb = .9;
      if (i === q.correct) { const pts = 10 * G.level + Math.round(tLeft * 2); G.score += pts; Music.sfx("coin"); G.float(W / 2, 330, "+" + pts, "#6ee06e"); }
      else { Music.sfx("nope"); G.lives--; G.shake = .25; if (G.lives <= 0) G.lose(); }
    };
    return {
      controls: "← ↑ ↓ → : choisir  •  ESPACE ou 1 2 3 4 : répondre  •  " + PER + " questions par niveau",
      init() { qi = 0; next(); },
      update(dt) {
        if (fb > 0) { fb -= dt; if (fb <= 0 && G.state === "play") { qi++; if (qi >= PER) G.levelDone(); else next(); } return; }
        tLeft -= dt; if (tLeft <= 0) { picked = -2; fb = .9; Music.sfx("nope"); G.lives--; G.shake = .25; if (G.lives <= 0) G.lose(); }
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.fillStyle = "rgba(255,255,255,.1)"; c.beginPath(); c.roundRect(60, 70, W - 120, 270, 24); c.fill();
        if (q.emoji) { G.em(q.emoji, W / 2, 190, 130); G.text(q.prompt, W / 2, 310, 26); } else G.text(q.prompt, W / 2, 230, q.prompt.length > 12 ? 56 : 76);
        c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(60, 56, W - 120, 10); c.fillStyle = tLeft / tMax < .3 ? "#ff5a6e" : "#6ee06e"; c.fillRect(60, 56, (W - 120) * Math.max(0, tLeft / tMax), 10);
        layout(q.answers.length).forEach((b, i) => { const good = fb > 0 && i === q.correct, bad = fb > 0 && i === picked && i !== q.correct;
          c.fillStyle = good ? "#2fa84a" : bad ? "#c8283a" : i === cur ? G.me.ship.color : "#3a3a70"; c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 18); c.fill(); c.strokeStyle = i === cur ? "#fff" : "rgba(255,255,255,.3)"; c.lineWidth = 4; c.stroke();
          G.text((i + 1) + ". " + q.answers[i], b.x + b.w / 2, b.y + b.h / 2 + 12, String(q.answers[i]).length > 12 ? 24 : 34, "#fff"); });
        for (let i = 0; i < PER; i++) { c.fillStyle = i < qi ? "#6ee06e" : i === qi ? "#ffd23f" : "rgba(255,255,255,.25)"; c.beginPath(); c.arc(W / 2 - (PER - 1) * 14 + i * 28, 100, 7, 0, 7); c.fill(); }
        if (fb > 0 && picked === -2) G.text("Trop lent ! C'était : " + q.answers[q.correct], W / 2, 335, 22, "#ff9a9a");
      },
      key(e) {
        if (fb > 0) return; const n = q.answers.length; let [x, y] = n === 3 ? [cur, 0] : [cur % 2, Math.floor(cur / 2)];
        if (e.code === "Space") { answer(cur); return; } const d = /^Digit([1-4])$/.exec(e.code); if (d) { answer(+d[1] - 1); return; }
        if (n === 3) { if (e.code === "ArrowLeft") cur = (cur + 2) % 3; else if (e.code === "ArrowRight") cur = (cur + 1) % 3; return; }
        if (e.code === "ArrowLeft") x = (x + 1) % 2; else if (e.code === "ArrowRight") x = (x + 1) % 2; else if (e.code === "ArrowUp") y = (y + 1) % 2; else if (e.code === "ArrowDown") y = (y + 1) % 2; else return;
        cur = y * 2 + x;
      },
    };
  }
  T.quiz = (G, cfg) => choice(G, { ...cfg, time: 13 }, level => {
    const n = level >= 4 ? 4 : 3, it = pick(cfg.items), wrong = shuffle(cfg.items.filter(x => x[1] !== it[1])).slice(0, n - 1).map(x => x[1]), answers = shuffle([it[1], ...wrong]);
    return { emoji: it[0], prompt: cfg.question || "Qu'est-ce que c'est ?", answers, correct: answers.indexOf(it[1]) };
  });
  T.math = (G, cfg) => choice(G, { ...cfg, time: 15 }, level => {
    const R = (a, b) => Math.floor(rnd(a, b + 1)); let kind = cfg.kind; if (kind === "mix") kind = pick(["add", "sub", "mul", "div", "double", "missing"]);
    const top = 8 + level * 6; let prompt, ans;
    if (kind === "add") { const a = R(2, top), b = R(2, top); prompt = a + " + " + b; ans = a + b; }
    else if (kind === "sub") { const a = R(5, top + 5), b = R(1, a); prompt = a + " − " + b; ans = a - b; }
    else if (kind === "mul") { const a = R(2, Math.min(10, 2 + level)), b = R(2, 10); prompt = a + " × " + b; ans = a * b; }
    else if (kind === "div") { const b = R(2, Math.min(10, 2 + level)), r = R(2, 10); prompt = (b * r) + " ÷ " + b; ans = r; }
    else if (kind === "double") { const a = R(2, top); prompt = "Le double de " + a; ans = 2 * a; }
    else if (kind === "half") { const a = R(2, top) * 2; prompt = "La moitié de " + a; ans = a / 2; }
    else if (kind === "missing") { const a = R(2, top), b = R(2, top); prompt = a + " + ? = " + (a + b); ans = b; }
    else if (kind === "complement") { const tg = level <= 3 ? 10 : level <= 6 ? 20 : 100, a = R(1, tg - 1); prompt = a + " + ? = " + tg; ans = tg - a; }
    else { const a = R(1, 9 + level * 3), b = R(1, 9 + level * 3), mode = R(0, 1); const l = mode ? a * 2 : a + 1, r = mode ? b + 3 : b * 2; prompt = (mode ? a + " × 2" : a + " + 1") + "  ?  " + (mode ? b + " + 3" : b + " × 2"); ans = l < r ? "<" : l > r ? ">" : "="; return { prompt, answers: ["<", "=", ">"], correct: ["<", "=", ">"].indexOf(ans) }; }
    const set = new Set([ans]); while (set.size < (level >= 4 ? 4 : 3)) { const d = R(1, Math.max(3, Math.round(ans * .3) + 2)) * (Math.random() < .5 ? -1 : 1), v = ans + d; if (v >= 0) set.add(v); }
    const answers = shuffle([...set]); return { prompt, answers, correct: answers.indexOf(ans) };
  });

  /* ---------- Timing : arrête la barre au bon moment ---------- */
  T.stop = (G, cfg) => {
    const { W, H } = G, BX = 100, BW = 600, BY = 330; let x, dir, zone, tries, hits, fb, fbT, spd;
    const half = () => Math.max(14, 62 - G.level * 4.5), need = () => 3;
    const newZone = () => { zone = rnd(BX + 100, BX + BW - 100); };
    return {
      controls: "ESPACE : arrête le curseur dans la zone verte  •  5 essais par niveau, il en faut " + 3 + " réussis",
      init() { x = BX; dir = 1; tries = 0; hits = 0; fb = ""; fbT = 0; newZone(); },
      update(dt) { fbT -= dt; spd = 260 + G.level * 62; x += dir * spd * dt; if (x > BX + BW) { x = BX + BW; dir = -1; } if (x < BX) { x = BX; dir = 1; } },
      draw() {
        G.bg(...G.sky); const c = G.ctx; G.em(cfg.big || "🎯", W / 2, 170, 120); c.fillStyle = "rgba(0,0,0,.45)"; c.beginPath(); c.roundRect(BX - 10, BY - 26, BW + 20, 52, 26); c.fill();
        c.fillStyle = "rgba(110,224,110,.85)"; c.fillRect(zone - half(), BY - 20, half() * 2, 40); c.fillStyle = "#ffd23f"; c.fillRect(zone - half() * .3, BY - 20, half() * .6, 40);
        G.em(cfg.target || "🎯", zone, BY - 46, 34); G.em(cfg.mark || "⚽", x, BY, 44);
        G.text("Réussis : " + hits + " / " + need() + "     Essais : " + (5 - tries) + " restants", W / 2, 430, 24); if (fbT > 0) G.text(fb, W / 2, 490, 40, fb.startsWith("Raté") ? "#ff9a9a" : "#6ee06e");
        c.save(); c.translate(W / 2, 540); c.scale(1.6, 1.6); heroTop(c, G.me, { x: 0, y: 1 }, Math.sin(G.time * 5), G.time); c.restore();
      },
      key(e) {
        if (e.code !== "Space" || fbT > .7) return; tries++; const d = Math.abs(x - zone);
        if (d <= half()) { hits++; const pts = d < half() * .3 ? 100 : 50; G.score += pts * G.level / 2 | 0 || pts; fb = d < half() * .3 ? "PARFAIT ! +" + pts : "Bien ! +" + pts; Music.sfx(d < half() * .3 ? "match" : "coin"); G.burst(x, BY, "#ffd23f", 12); } else { fb = "Raté…"; Music.sfx("nope"); }
        fbT = 1; newZone();
        if (hits >= need()) { G.levelDone(); } else if (tries >= 5) { G.lives--; Music.sfx("hit"); if (G.lives <= 0) G.lose(); else G.retryLevel(); }
      },
    };
  };

  /* ---------- Figures de sport : skate, trottinette, BMX, roller, snowboard, surf ---------- */
  T.trick = (G, cfg) => {
    const { W, H } = G, GY = 470, PX = 210, TR = { ArrowLeft: ["Tour 360°", 100, .55, "spin"], ArrowUp: ["Salto arrière", 200, .72, "flip"], ArrowRight: ["Kickflip", 120, .45, "board"], ArrowDown: ["Grab", 80, .4, "grab"] };
    let P, ramps, cones, nextX, speed, pending, nTricks, trick, queued, lvPts, scroll = 0, fall = 0;
    const target = () => 250 + 180 * G.level;
    function addFeatures() { while (nextX < W + 900) { const r = Math.random(); if (r < .72) { const h = 60 + Math.min(70, G.level * 6) + Math.random() * 20; ramps.push({ x: nextX, len: 160, h }); nextX += 160 + 380 + Math.random() * 220; } else { cones.push({ x: nextX }); nextX += 300 + Math.random() * 200; } } }
    function land(crash) {
      P.air = false; P.y = GY; P.vy = 0;
      if (crash || (trick && trick.t > .08)) { G.hurt(); pending = 0; nTricks = 0; trick = null; queued = null; fall = .7; G.burst(PX, GY, "#ff9a3c", 18); G.float(PX, GY - 90, "Aïe ! 💥", "#ff9a9a"); return; }
      trick = null; if (pending > 0) { const pts = pending; G.score += pts; lvPts += pts; Music.sfx(pts >= 400 ? "win" : "match"); G.float(PX + 60, GY - 120, "+" + pts + (nTricks > 1 ? "  COMBO x" + nTricks : ""), "#ffd23f"); G.burst(PX, GY, "#ffd23f", 14); } else Music.sfx("bounce");
      pending = 0; nTricks = 0; if (lvPts >= target()) { G.levelDone(); }
    }
    function startTrick(k) { const t = TR[k]; trick = { name: t[0], pts: t[1], dur: t[2], kind: t[3], t: t[2], tot: t[2] }; nTricks++; pending += t[1] * nTricks; Music.sfx("flip"); G.float(PX + 40, P.y - 80, t[0] + "!", "#fff"); }
    function drawRide(c, kind, rot) {
      c.save(); c.translate(0, 31); if (rot) c.scale(1, rot);
      if (kind === "skate") { c.fillStyle = G.me.ship.color; c.beginPath(); c.roundRect(-24, 0, 48, 6, 3); c.fill(); c.fillStyle = "#222"; c.beginPath(); c.arc(-14, 9, 4.5, 0, 7); c.arc(14, 9, 4.5, 0, 7); c.fill(); }
      else if (kind === "scooter") { c.fillStyle = G.me.ship.color; c.fillRect(-22, 0, 44, 5); c.fillStyle = "#cfd6e4"; c.fillRect(16, -34, 3, 36); c.fillRect(9, -36, 17, 3); c.fillStyle = "#222"; c.beginPath(); c.arc(-20, 9, 6, 0, 7); c.arc(22, 9, 6, 0, 7); c.fill(); }
      else if (kind === "bmx") { c.strokeStyle = "#222"; c.lineWidth = 3; c.beginPath(); c.arc(-24, 4, 13, 0, 7); c.arc(24, 4, 13, 0, 7); c.stroke(); c.strokeStyle = G.me.ship.color; c.lineWidth = 4; c.beginPath(); c.moveTo(-24, 4); c.lineTo(-4, -16); c.lineTo(14, -16); c.lineTo(24, 4); c.moveTo(-4, -16); c.lineTo(2, 4); c.lineTo(-24, 4); c.stroke(); c.fillStyle = "#222"; c.fillRect(10, -24, 16, 3); }
      else if (kind === "roller") { c.fillStyle = G.me.ship.color; c.fillRect(-14, -2, 14, 8); c.fillRect(2, -2, 14, 8); c.fillStyle = "#222"; for (const x of [-12, -4, 4, 12]) { c.beginPath(); c.arc(x, 9, 3.2, 0, 7); c.fill(); } }
      else if (kind === "snow") { c.fillStyle = G.me.ship.color; c.beginPath(); c.ellipse(0, 4, 32, 5, 0, 0, 7); c.fill(); c.fillStyle = "#fff"; c.fillRect(-18, 0, 6, 4); c.fillRect(12, 0, 6, 4); }
      else { c.fillStyle = G.me.ship.color; c.beginPath(); c.ellipse(0, 5, 34, 6, 0, 0, 7); c.fill(); c.fillStyle = "#fff"; c.fillRect(-4, 3, 8, 3); }
      c.restore();
    }
    return {
      controls: "ESPACE : sauter / pousser à la fin de la rampe  •  en l'air : ← tour  ↑ salto  → kickflip  ↓ grab  •  atterris proprement !",
      init() { P = { y: GY, vy: 0, air: false, onRamp: null }; ramps = []; cones = []; nextX = W; speed = 300 + G.level * 16; pending = 0; nTricks = 0; trick = null; queued = null; lvPts = 0; fall = 0; addFeatures(); },
      update(dt) {
        speed = 300 + G.level * 16; scroll += speed * dt; fall = Math.max(0, fall - dt); for (const r of ramps) r.x -= speed * dt; for (const k of cones) k.x -= speed * dt; nextX -= speed * dt; addFeatures();
        ramps = ramps.filter(r => r.x + r.len > -50); cones = cones.filter(k => k.x > -50);
        if (trick) { trick.t -= dt; if (trick.t <= 0) { trick.t = 0; if (queued) { const q = queued; queued = null; startTrick(q); } } }
        if (!P.air) {
          const r = ramps.find(r => PX >= r.x && PX <= r.x + r.len);
          if (r) { P.y = GY - (PX - r.x) / r.len * r.h; P.onRamp = r; }
          else { if (P.onRamp) { const r2 = P.onRamp; P.onRamp = null; P.air = true; P.vy = -(430 + r2.h * 4.2 + (P.pop > 0 ? 190 : 0)); Music.sfx("jump"); G.burst(PX, P.y, "#fff", 6); } P.y = GY; }
          P.pop = Math.max(0, (P.pop || 0) - dt);
          for (const k of cones) if (Math.abs(k.x - PX) < 22 && P.y > GY - 16) { k.x = -999; G.hurt(); pending = 0; fall = .6; G.float(PX, GY - 80, "Aïe ! 🚧", "#ff9a9a"); }
        } else { P.vy += 1700 * dt; P.y += P.vy * dt; if (P.y >= GY) land(false); }
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.fillStyle = cfg.hills || "rgba(0,0,0,.16)"; for (let i = -1; i < 7; i++) { const x = i * 170 - (scroll * .25) % 170; c.fillRect(x, GY - 130 - (i * 37 % 60), 90, 140 + (i * 37 % 60)); }
        c.fillStyle = cfg.ground || "#5a5a66"; c.fillRect(0, GY + 36, W, H - GY - 36); c.fillStyle = cfg.line || "rgba(255,255,255,.3)"; for (let i = -1; i < 12; i++) c.fillRect(i * 90 - (scroll % 90), GY + 70, 50, 5);
        for (const r of ramps) { c.fillStyle = cfg.ramp || "#a8712f"; c.beginPath(); c.moveTo(r.x, GY + 36); c.lineTo(r.x + r.len, GY + 36 - r.h); c.lineTo(r.x + r.len, GY + 36); c.fill(); c.fillStyle = "rgba(255,255,255,.25)"; c.beginPath(); c.moveTo(r.x, GY + 36); c.lineTo(r.x + r.len, GY + 36 - r.h); c.lineTo(r.x + r.len, GY + 30 - r.h); c.lineTo(r.x, GY + 30); c.fill(); }
        for (const k of cones) G.em("🚧", k.x, GY + 14, 44);
        if (!(G.inv > 0 && Math.floor(G.time * 14) % 2)) {
          c.save(); c.translate(PX, P.y - 36 + 36);
          let sx = 1, rot = 0, sy = 1, rideRot = 0, bob = 0;
          if (fall > 0) rot = Math.sin(fall * 30) * .5;
          if (trick) { const p = 1 - trick.t / trick.tot; if (trick.kind === "spin") sx = Math.cos(p * Math.PI * 2); else if (trick.kind === "flip") rot = -p * Math.PI * 2; else if (trick.kind === "board") rideRot = Math.cos(p * Math.PI * 2); else sy = .82; }
          c.translate(0, -16); c.rotate(rot); c.scale(1.15 * (Math.abs(sx) < .12 ? .12 * Math.sign(sx || 1) : sx), 1.15 * sy); c.translate(0, -14);
          drawRide(c, cfg.ride || "skate", rideRot); heroSide(c, G.me, P.air ? 4 : 0, !P.air, G.time); c.restore();
        }
      },
      hud() { const c = G.ctx; G.text("Points du niveau : " + lvPts + " / " + target(), W / 2, 62, 18, lvPts >= target() ? "#6ee06e" : "#ffd23f"); c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(W / 2 - 150, 74, 300, 8); c.fillStyle = "#6ee06e"; c.fillRect(W / 2 - 150, 74, 300 * Math.min(1, lvPts / target()), 8);
        if (pending > 0) G.text("En l'air : +" + pending + (nTricks > 1 ? "  (combo x" + nTricks + ")" : ""), W / 2, 120, 22, "#fff"); if (!P.air) G.text("← 360°    ↑ salto    → kickflip    ↓ grab  (en l'air)", W / 2, H - 20, 15, "rgba(255,255,255,.8)"); },
      key(e) {
        if (e.code === "Space") { if (!P.air) { if (P.onRamp) P.pop = .3; else { P.air = true; P.vy = -520; P.onRamp = null; Music.sfx("jump"); } } return; }
        if (P.air && TR[e.code]) { if (!trick) startTrick(e.code); else if (!queued && trick.t < .2) queued = e.code; }
      },
    };
  };
})();
