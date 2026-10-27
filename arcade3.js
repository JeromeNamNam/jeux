"use strict";
/* Modèles de jeu, suite : sports (basket, penalty, course, slalom, jonglage). */
(() => {
  const { T, clamp, rnd, pick, shuffle } = Arcade;

  /* ---------- Tir en cloche : panier de basket, coup franc, fléchettes ---------- */
  T.lob = (G, cfg) => {
    const { W, H } = G, GY = 520, SX = 130, SY = 440, mode = cfg.mode || "hoop", GX = 690;
    let ang, power, charging, armed, shots, hits, ball, phase, wait, tgt, kt, wallOn;
    const need = () => Math.min(4, 1 + Math.ceil(G.level / 3)), TOTALSHOTS = 5, GRAV = mode === "darts" ? 520 : 620;
    const ty = () => tgt.y + Math.sin(G.time * tgt.sp) * tgt.amp;
    const shoot = () => { charging = false; if (power < .08) { power = 0; return; } const v = 280 + power * 640; ball = { x: SX + 24, y: SY, vx: Math.cos(ang) * v, vy: -Math.sin(ang) * v, px: SX + 24, py: SY, hit: false }; phase = "fly"; shots++; Music.sfx("jump"); };
    const done = (ok, label) => { if (ok) { hits++; G.score += 50 * (mode === "darts" ? 1 : 2); Music.sfx("match"); G.float(Math.min(ball.x, W - 80), Math.min(ball.y, GY) - 30, label || "BRAVO !", "#6ee06e"); G.burst(ball.x, ball.y, "#ffd23f", 16); } else { Music.sfx("nope"); G.float(Math.min(ball.x, W - 80), Math.min(ball.y, GY - 30) - 30, label || "raté", "#fff"); } ball = null; phase = "wait"; wait = .9; };
    return {
      controls: "↑ ↓ : viser  •  ESPACE (maintenu) : charger, relâche pour tirer  •  5 tirs par niveau",
      init() { ang = .75; power = 0; charging = armed = false; shots = 0; hits = 0; ball = null; phase = "aim"; wait = 0; wallOn = mode === "goal" && G.level >= 3;
        tgt = { x: 520 + Math.random() * 190, y: 200 + Math.random() * 130, amp: G.level >= 4 ? 8 + G.level * 5 : 0, sp: 1 + G.level * .15, r: Math.max(26, 54 - G.level * 3) }; kt = 0; },
      update(dt) {
        const k = Kit.keys; kt += dt;
        if (phase === "aim") { ang = clamp(ang + ((k.ArrowUp ? 1 : 0) - (k.ArrowDown ? 1 : 0)) * dt, .08, 1.4); if (k.Space && armed) { charging = true; power = Math.min(1, power + dt * .85); } else if (!k.Space && charging) shoot(); }
        else if (phase === "fly" && ball) {
          ball.px = ball.x; ball.py = ball.y; ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.vy += GRAV * dt;
          if (mode === "hoop") { const tx = tgt.x, y0 = ty();
            if (ball.x > tx + 34 && ball.x < tx + 52 && ball.y > y0 - 90 && ball.y < y0 + 14) { ball.vx = -Math.abs(ball.vx) * .4; ball.x = tx + 33; Music.sfx("bounce"); }
            if (ball.vy > 0 && ball.py < y0 && ball.y >= y0 && Math.abs(ball.x - tx) < 28) { done(true, "SWISH ! 🏀"); return; }
            for (const sx of [-32, 32]) if (Math.hypot(ball.x - (tx + sx), ball.y - y0) < 9) { ball.vy = -Math.abs(ball.vy) * .5; ball.vx *= .6; Music.sfx("bounce"); } }
          else if (mode === "goal") { const gy0 = GY - 150, ky = GY - 80 - Math.sin(kt * (1.4 + G.level * .25)) * 40;
            if (wallOn && ball.px < 340 && ball.x >= 340 && ball.y > GY - 110) { done(false, "Mur ! 🧱"); return; }
            if (ball.px < GX && ball.x >= GX) { const f = (GX - ball.px) / (ball.x - ball.px), y = ball.py + (ball.y - ball.py) * f; if (y > gy0 && y < GY) { if (Math.abs(y - ky) < 36) done(false, "Arrêté ! 🧤"); else done(true, "BUUUT ! ⚽"); return; } else { done(false, y <= gy0 ? "Trop haut !" : "Raté"); return; } } }
          else { const tx = tgt.x; if (ball.px < tx && ball.x >= tx) { const f = (tx - ball.px) / (ball.x - ball.px), y = ball.py + (ball.y - ball.py) * f, d = Math.abs(y - ty());
            if (d < tgt.r) { if (d < tgt.r * .22) G.score += 30; done(true, d < tgt.r * .22 ? "CENTRE ! 🎯" : "Touché !"); return; } } }
          if (ball.y > GY || ball.x > W + 40) done(false);
        } else if (phase === "wait") { wait -= dt; if (wait <= 0) { power = 0; if (shots >= TOTALSHOTS) { if (hits >= need()) G.levelDone(); else { G.lives--; Music.sfx("nope"); if (G.lives <= 0) G.lose(); else G.retryLevel(); } } else phase = "aim"; } }
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.fillStyle = cfg.ground || "#5fb04a"; c.fillRect(0, GY, W, H - GY); if (cfg.court) { c.fillStyle = cfg.court; c.fillRect(0, GY, W, 14); }
        const y0 = ty();
        if (mode === "hoop") { const tx = tgt.x; c.fillStyle = "#fff"; c.fillRect(tx + 36, y0 - 90, 8, 100); c.fillStyle = "#cfd6e4"; c.fillRect(tx + 24, y0 - 70, 14, 4); c.strokeStyle = "#ff7a2a"; c.lineWidth = 6; c.beginPath(); c.moveTo(tx - 34, y0); c.lineTo(tx + 34, y0); c.stroke(); c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = 2; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(tx + i * 10, y0); c.lineTo(tx + i * 6, y0 + 38); c.stroke(); } c.fillStyle = "#6a4a2a"; c.fillRect(tx + 38, y0 + 10, 4, GY - y0 - 10); }
        else if (mode === "goal") { c.fillStyle = "rgba(255,255,255,.9)"; c.fillRect(GX, GY - 150, 6, 150); c.fillRect(GX, GY - 150, 70, 6); c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 1; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(GX, GY - 150 + i * 19); c.lineTo(GX + 70, GY - 150 + i * 19); c.stroke(); }
          const ky = GY - 80 - Math.sin(kt * (1.4 + G.level * .25)) * 40; G.em("🧤", GX + 20, ky, 60); if (wallOn) for (let i = 0; i < 3; i++) G.em("🧍", 350, GY - 28 - i * 34, 46); }
        else { const tx = tgt.x; c.fillStyle = "#8a5a2a"; c.fillRect(tx - 4, y0, 8, GY - y0); [["#fff", 1], ["#222", .8], ["#e8283a", .6], ["#4aa3ff", .4], ["#ffd23f", .2]].forEach(([col, f]) => { c.fillStyle = col; c.beginPath(); c.ellipse(tx, y0, tgt.r * f * .5, tgt.r * f, 0, 0, 7); c.fill(); }); }
        c.save(); c.translate(SX, GY - 36 * 1.5 + 6); c.scale(1.5, 1.5); heroSide(c, G.me, 0, true, G.time); c.restore();
        if (phase === "aim") { G.em(cfg.ball || "🏀", SX + 24 + Math.cos(ang) * 10 - (charging ? power * 10 : 0), SY - Math.sin(ang) * 10, 30);
          if (G.level <= 3 && charging) { c.fillStyle = "rgba(255,255,255,.75)"; const v = 280 + power * 640; let x = SX + 24, y = SY, vx = Math.cos(ang) * v, vy = -Math.sin(ang) * v; for (let i = 0; i < 16; i++) { for (let s = 0; s < 3; s++) { x += vx * .012; y += vy * .012; vy += GRAV * .012; } c.fillRect(x, y, 4, 4); } }
          c.strokeStyle = "rgba(255,255,255,.6)"; c.lineWidth = 3; c.beginPath(); c.moveTo(SX + 24, SY); c.lineTo(SX + 24 + Math.cos(ang) * 50, SY - Math.sin(ang) * 50); c.stroke(); }
        if (ball) G.em(cfg.ball || "🏀", ball.x, ball.y, mode === "darts" ? 30 : 34, G.time * 8);
      },
      hud() { const c = G.ctx; G.text("Réussis : " + hits + " / " + need() + "   •   Tirs restants : " + (TOTALSHOTS - shots), W / 2, 66, 18, hits >= need() ? "#6ee06e" : "#fff"); c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(40, H - 30, 200, 14); c.fillStyle = power > .8 ? "#ff5a6e" : "#6ee06e"; c.fillRect(40, H - 30, 200 * power, 14); G.text("Puissance", 140, H - 36, 12); G.text("Angle " + Math.round(ang * 57.3) + "°", 300, H - 18, 14); },
      key(e) { if (e.code === "Space" && phase === "aim" && !e.repeat) armed = true; },
      keyup(e) { if (e.code === "Space") { if (charging) shoot(); armed = false; } },
    };
  };

  /* ---------- Penalty ---------- */
  T.penalty = (G, cfg) => {
    const { W, H } = G, GL = 200, GR = 600, GT = 170, GB = 330; let ax, ay, pw, pdir, shots, goals, phase, t, ball, kx, ky, ktx, kty, fb, fbT, keep;
    const need = () => Math.min(4, 1 + Math.ceil(G.level / 3));
    return {
      controls: "← ↑ ↓ → : viser dans le but  •  ESPACE : tirer (le milieu de la jauge = tir parfait)  •  5 tirs par niveau",
      init() { ax = 400; ay = 250; pw = 0; pdir = 1; shots = 0; goals = 0; phase = "aim"; fb = ""; fbT = 0; kx = 400; ky = 290; keep = (G.hero + G.level * 3 + 7) % HEROES.length; },
      update(dt) {
        fbT -= dt; const k = Kit.keys;
        if (phase === "aim") { ax = clamp(ax + ((k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0)) * 300 * dt, GL + 10, GR - 10); ay = clamp(ay + ((k.ArrowDown ? 1 : 0) - (k.ArrowUp ? 1 : 0)) * 220 * dt, GT + 10, GB - 6); pw += pdir * (1.3 + G.level * .12) * dt; if (pw > 1) { pw = 1; pdir = -1; } if (pw < 0) { pw = 0; pdir = 1; } }
        else if (phase === "kick") { t += dt; kx += (ktx - kx) * Math.min(1, dt * 7); ky += (kty - ky) * Math.min(1, dt * 7);
          if (t >= .55) { const over = pw > .93, weak = pw < .2, saved = !over && Math.abs(kx - ax) < (weak ? 80 : 50) && Math.abs(ky - ay) < 62;
            if (over) { fb = "Au-dessus ! 😬"; Music.sfx("nope"); } else if (saved) { fb = "Arrêté ! 🧤"; Music.sfx("hit"); } else { goals++; G.score += 60 + Math.round((1 - Math.abs(pw - .55)) * 40); fb = "BUUUT ! ⚽"; Music.sfx("win"); G.burst(ax, ay, "#ffd23f", 24); }
            fbT = 1; phase = "wait"; t = 0; } }
        else { t += dt; if (t > 1.2) { kx = 400; ky = 290; pw = 0;
          if (shots >= 5) { if (goals >= need()) G.levelDone(); else { G.lives--; Music.sfx("nope"); if (G.lives <= 0) G.lose(); else G.retryLevel(); } } else phase = "aim"; } }
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.fillStyle = cfg.ground || "#3f9a3a"; c.fillRect(0, GB + 6, W, H); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)"; c.fillRect(0, GB + 6 + i * 36, W, 36); }
        c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1; for (let x = GL; x <= GR; x += 20) { c.beginPath(); c.moveTo(x, GT); c.lineTo(x, GB); c.stroke(); } for (let y = GT; y <= GB; y += 20) { c.beginPath(); c.moveTo(GL, y); c.lineTo(GR, y); c.stroke(); }
        c.strokeStyle = "#fff"; c.lineWidth = 8; c.beginPath(); c.moveTo(GL, GB); c.lineTo(GL, GT); c.lineTo(GR, GT); c.lineTo(GR, GB); c.stroke();
        c.save(); c.translate(kx, ky); c.scale(1.6, 1.6); heroTop(c, HEROES[keep], { x: 0, y: 1 }, 0, G.time); c.restore(); G.em("🧤", kx - 38, ky - 4, 30); G.em("🧤", kx + 38, ky - 4, 30);
        if (phase === "aim") { c.strokeStyle = G.me.ship.color; c.lineWidth = 4; c.beginPath(); c.arc(ax, ay, 18, 0, 7); c.moveTo(ax - 28, ay); c.lineTo(ax + 28, ay); c.moveTo(ax, ay - 28); c.lineTo(ax, ay + 28); c.stroke(); }
        const p = phase === "aim" ? 0 : Math.min(1, t / .55), bx = 400 + (ax - 400) * p, by = 500 + (ay - 500) * p - Math.sin(p * Math.PI) * 30; G.em(cfg.ball || "⚽", bx, by, 52 - 30 * p, p * 12);
        c.save(); c.translate(330, 520); c.scale(1.7, 1.7); heroTop(c, G.me, { x: 1, y: -1 }, 0, G.time); c.restore();
        c.fillStyle = "rgba(0,0,0,.45)"; c.fillRect(W - 60, 200, 22, 300); c.fillStyle = "#6ee06e"; c.fillRect(W - 60, 200 + 300 * (.4) * 0 + 300 * .38, 22, 300 * .3 * .5 + 0); c.fillStyle = "#ffd23f"; c.fillRect(W - 62, 500 - 300 * pw - 3, 26, 6); G.text("Force", W - 49, 190, 13);
        if (fbT > 0) G.text(fb, W / 2, 420, 46, fb.startsWith("BUUUT") ? "#ffd23f" : "#fff");
      },
      hud() { G.text("Buts : " + goals + " / " + need() + "   •   Tirs restants : " + (5 - shots), W / 2, 66, 18, goals >= need() ? "#6ee06e" : "#fff"); },
      key(e) {
        if (e.code !== "Space" || phase !== "aim") return; shots++; phase = "kick"; t = 0; Music.sfx("jump");
        const side = Math.random() < Math.min(.8, .2 + G.level * .06) ? Math.sign(ax - 400) || 1 : (Math.random() < .5 ? -1 : 1); ktx = 400 + side * rnd(60, 170); kty = clamp(ay + rnd(-40, 40), GT + 30, GB - 10);
        if (Math.random() < Math.min(.55, .05 + G.level * .05)) { ktx = ax + rnd(-30, 30); kty = ay + rnd(-30, 30); }
      },
    };
  };

  /* ---------- Course : alterne ← → pour courir, nager, pédaler ---------- */
  T.sprint = (G, cfg) => {
    const { W, H } = G, X0 = 90, X1 = 710, D = cfg.meters || 100; let d, v, last, ais, cd, race, place, hurd, jump, fbT, fb, time0, finished;
    const needPlace = () => G.level <= 4 ? 3 : G.level <= 8 ? 2 : 1, laneY = i => 205 + i * 62;
    return {
      controls: "alterne ← → très vite pour avancer" + (cfg.hurdles ? "  •  ESPACE : sauter les haies" : "") + "  •  termine dans les " + "premiers !",
      init() { d = 0; v = 0; last = ""; cd = 2.4; race = 0; place = 0; jump = 0; fb = ""; fbT = 0; finished = false;
        const opp = shuffle(HEROES.map((_, i) => i).filter(i => i !== G.hero)).slice(0, 4); ais = opp.map((h, i) => ({ h, d: 0, v: 0, base: 5.3 + G.level * .33 + rnd(-.5, .5), ph: rnd(0, 6), done: false, lane: i < 2 ? i : i + 1 }));
        hurd = cfg.hurdles ? Array.from({ length: Math.floor(D / 18) }, (_, i) => 20 + i * 18).filter(x => x < D - 6).map(x => ({ x })) : []; },
      update(dt) {
        fbT -= dt; if (cd > 0) { cd -= dt; return; } race += dt;
        if (!finished) { v = Math.max(0, v - 2.6 * dt); jump = Math.max(0, jump - dt); d += v * dt;
          for (const h of hurd) if (!h.hit && d >= h.x && d < h.x + .6) { h.hit = true; if (jump <= 0) { v *= .3; fb = "Aïe ! 🚧"; fbT = .8; Music.sfx("nope"); } else { G.score += 15; Music.sfx("coin"); } } }
        for (const a of ais) { if (a.done) continue; a.v += (a.base + Math.sin(race * 2 + a.ph) * .8 - a.v) * Math.min(1, dt * 2); a.d += a.v * dt; if (a.d >= D) { a.done = true; a.t = race; } }
        if (!finished && d >= D) { finished = true; place = 1 + ais.filter(a => a.done).length; fbT = 2; fb = place === 1 ? "1er ! 🥇" : place === 2 ? "2e ! 🥈" : place === 3 ? "3e ! 🥉" : place + "e…"; Music.sfx(place <= needPlace() ? "win" : "nope"); cd = -.01; setTimeout(() => { if (G.state !== "play") return; if (place <= needPlace()) G.levelDone(100 * (6 - place)); else { G.lives--; if (G.lives <= 0) G.lose(); else G.retryLevel(); } }, 1700); }
      },
      draw() {
        const c = G.ctx; G.bg(...G.sky); c.fillStyle = cfg.track || "#c8643a"; c.fillRect(0, 170, W, 5 * 62 + 20);
        for (let i = 0; i < 6; i++) { c.fillStyle = "rgba(255,255,255,.7)"; c.fillRect(0, laneY(i) - 30, W, 3); }
        c.fillStyle = "#fff"; for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? "#fff" : "#222"; c.fillRect(X1 + 30, 172 + i * 26, 12, 26); }
        for (const h of hurd) { const x = X0 + (h.x / D) * (X1 - X0); c.fillStyle = "#e8283a"; c.fillRect(x, laneY(2) - 22, 6, 26); c.fillRect(x - 8, laneY(2) - 24, 24, 5); }
        const draw1 = (hh, dd, lane, vv, me) => { const x = X0 + clamp(dd / D, 0, 1) * (X1 - X0), y = laneY(lane) + (me && jump > 0 ? -Math.sin(jump / .5 * Math.PI) * 38 : 0); c.save(); c.translate(x, y); c.scale(.85, .85); if (cfg.vehicle) G.em(cfg.vehicle, 0, 14, 46); heroTop(c, HEROES[hh], { x: 1, y: 0 }, Math.sin(G.time * (4 + vv * 1.6)) * 1.6, G.time); c.restore(); if (me) { c.fillStyle = G.me.ship.color; c.beginPath(); c.moveTo(x - 6, y - 34); c.lineTo(x + 6, y - 34); c.lineTo(x, y - 24); c.fill(); } };
        for (const a of ais) draw1(a.h, a.d, a.lane, a.v, false); draw1(G.hero, d, 2, v, true);
        c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(X0, 512, X1 - X0, 12); c.fillStyle = "#6ee06e"; c.fillRect(X0, 512, (X1 - X0) * clamp(d / D, 0, 1), 12); G.text(Math.floor(d) + " / " + D + " m", W / 2, 548, 18);
        G.text("Vitesse", 70, 90 + 0, 14, "#fff", "left"); c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(140, 76, 160, 14); c.fillStyle = v > 8 ? "#ffd23f" : "#6ee06e"; c.fillRect(140, 76, 160 * clamp(v / 12, 0, 1), 14);
        if (cd > 0) G.text(cd > 1.6 ? "À vos marques…" : cd > .8 ? "Prêts ?" : "PARTEZ !", W / 2, 130, 52, "#ffd23f");
        if (fbT > 0) G.text(fb, W / 2, 130, 48, "#fff");
      },
      hud() { G.text("Objectif : finir " + (needPlace() === 1 ? "1er" : "dans les " + needPlace() + " premiers"), W / 2, 62, 18); },
      key(e) {
        if (cd > 0 || finished) return;
        if ((e.code === "ArrowLeft" || e.code === "ArrowRight") && e.code !== last) { last = e.code; v = Math.min(12, v + .85); Music.sfx("bounce"); }
        else if (e.code === "Space" && cfg.hurdles && jump <= 0) { jump = .5; Music.sfx("jump"); }
      },
    };
  };

  /* ---------- Slalom (ski, snowboard, kayak, luge, VTT…) ---------- */
  T.slalom = (G, cfg) => {
    const { W, H } = G, PY = 470; let x, vx, gates, obs, spawnT, passed, combo, slow, scroll = 0, side = 0;
    const need = () => 7 + G.level;
    return {
      controls: "← → : tourner  •  passe entre les deux piquets  •  évite les obstacles  •  ESPACE : coup d'accélérateur",
      init() { x = W / 2; vx = 0; gates = []; obs = []; spawnT = .6; passed = 0; combo = 0; slow = 0; },
      update(dt) {
        const k = Kit.keys, dir = (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0); vx += dir * 1500 * dt; vx *= Math.pow(.02, dt); x = clamp(x + vx * dt, 40, W - 40); side = clamp(vx / 400, -1, 1);
        slow = Math.max(0, slow - dt); const sp = (230 + G.level * 28) * (slow > 0 ? .55 : 1) * (G.boost > 0 ? 1.4 : 1); if (G.boost > 0) G.boost -= dt; scroll += sp * dt;
        spawnT -= dt; if (spawnT <= 0) { spawnT = 250 / sp; if (Math.random() < .75) gates.push({ cx: rnd(150, W - 150), y: -30, gap: Math.max(110, 190 - G.level * 6), ok: false }); else obs.push({ x: rnd(50, W - 50), y: -30 }); if (Math.random() < .5) obs.push({ x: rnd(50, W - 50), y: -80 }); }
        for (const g of gates) { g.y += sp * dt; if (!g.ok && g.y > PY) { g.ok = true; if (Math.abs(x - g.cx) < g.gap / 2 - 6) { passed++; combo++; const pts = 20 + combo * 5; G.score += pts; Music.sfx("coin"); G.float(g.cx, PY - 40, "+" + pts); } else { combo = 0; slow = .8; Music.sfx("nope"); G.float(g.cx, PY - 40, "manqué !", "#ff9a9a"); } } }
        for (const o of obs) { o.y += sp * dt; if (Math.abs(o.x - x) < 28 && Math.abs(o.y - PY) < 30 && !o.hit) { o.hit = true; combo = 0; slow = 1; G.burst(o.x, o.y, "#fff", 14); G.hurt(); } }
        gates = gates.filter(g => g.y < H + 40); obs = obs.filter(o => o.y < H + 40);
        if (passed >= need()) G.levelDone();
      },
      draw() {
        const c = G.ctx; c.fillStyle = cfg.ground || "#eef6ff"; c.fillRect(0, 0, W, H); G.bg(cfg.ground || "#eef6ff", cfg.ground2 || "#cfe3f7");
        c.fillStyle = cfg.mark || "rgba(120,160,200,.35)"; for (let i = 0; i < 14; i++) { const y = ((i * 60 + scroll) % (H + 60)) - 30; c.fillRect(((i * 197) % W), y, 36, 4); c.fillRect(((i * 97 + 300) % W), y + 24, 24, 3); }
        for (const o of obs) G.em(cfg.obstacle || "🌲", o.x, o.y, 50);
        for (const g of gates) { const l = g.cx - g.gap / 2, r = g.cx + g.gap / 2; c.fillStyle = "#e8283a"; c.fillRect(l - 3, g.y - 30, 6, 40); c.fillStyle = "#2f6fe0"; c.fillRect(r - 3, g.y - 30, 6, 40); c.fillStyle = g.ok ? "rgba(110,224,110,.5)" : "rgba(255,210,63,.5)"; c.fillRect(l + 4, g.y - 4, g.gap - 8, 4); }
        if (!(G.inv > 0 && Math.floor(G.time * 14) % 2)) { c.save(); c.translate(x, PY); c.rotate(side * .35); G.em(cfg.vehicle || "🎿", 0, 18, 54); c.scale(1.1, 1.1); heroTop(c, G.me, { x: 0, y: 1 }, Math.sin(G.time * 8) * .8, G.time); c.restore(); }
      },
      hud() { G.text("Portes : " + passed + " / " + need() + (combo > 1 ? "   •   Série x" + combo : ""), W / 2, 62, 18); },
      key(e) { if (e.code === "Space" && !(G.boost > 0)) { G.boost = 1; Music.sfx("jump"); } },
    };
  };

  /* ---------- Jonglage (foot, volley, tennis, basket) ---------- */
  T.juggle = (G, cfg) => {
    const { W, H } = G, GY = 520; let P, ball, kicks, streak, miss;
    const need = () => 4 + G.level * 2, grav = () => 1050 + G.level * 70;
    const reset = () => { ball = { x: P.x + rnd(-30, 30), y: 220, vx: rnd(-40, 40), vy: 0 }; streak = 0; };
    return {
      controls: "← → : te placer sous la balle  •  ESPACE : taper dans la balle quand elle arrive à tes pieds",
      init() { P = { x: W / 2, dir: 1, run: 0 }; kicks = 0; miss = 0; reset(); },
      update(dt) {
        const k = Kit.keys, dx = (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0); if (dx) { P.dir = dx; P.run += dt * 12; } P.x = clamp(P.x + dx * 330 * dt, 40, W - 40);
        ball.vy += grav() * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; if (ball.x < 20) { ball.x = 20; ball.vx = Math.abs(ball.vx); } if (ball.x > W - 20) { ball.x = W - 20; ball.vx = -Math.abs(ball.vx); }
        if (ball.y > GY) { G.burst(ball.x, GY, "#fff", 8); Music.sfx("nope"); G.hurt(); reset(); }
        if (kicks >= need()) G.levelDone();
      },
      draw() {
        G.bg(...G.sky); const c = G.ctx; c.fillStyle = cfg.ground || "#4fa83a"; c.fillRect(0, GY + 10, W, H); c.fillStyle = "rgba(255,255,255,.4)"; c.fillRect(0, GY + 10, W, 4);
        c.fillStyle = "rgba(0,0,0,.2)"; c.beginPath(); c.ellipse(ball.x, GY + 14, 22 * Math.max(.4, 1 - (GY - ball.y) / 700), 6, 0, 0, 7); c.fill();
        G.em(cfg.ball || "⚽", ball.x, ball.y, 44, G.time * 5 + ball.x * .02);
        if (!(G.inv > 0 && Math.floor(G.time * 14) % 2)) { c.save(); c.translate(P.x, GY - 40 + 10); c.scale(1.4 * P.dir, 1.4); heroSide(c, G.me, Math.sin(P.run) * 5, true, G.time); c.restore(); }
        if (Math.abs(ball.x - P.x) < 70 && ball.y > GY - 150 && ball.vy > 0) { c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = 3; c.beginPath(); c.arc(P.x, GY - 30, 56, 0, 7); c.stroke(); }
      },
      hud() { G.text("Jongles : " + kicks + " / " + need(), W / 2, 62, 18, "#fff"); if (streak > 2) G.text("Série x" + streak, W - 14, 62, 20, "#6ee06e", "right"); },
      key(e) { if (e.code !== "Space") return; const dxb = ball.x - P.x;
        if (ball.vy > -200 && ball.y > GY - 150 && Math.abs(dxb) < 62) { ball.vy = -(640 + rnd(0, 90) + G.level * 12); ball.vx = dxb * 5 + rnd(-40, 40); kicks++; streak++; const pts = 10 + Math.min(30, streak * 2); G.score += pts; Music.sfx("coin"); G.float(ball.x, ball.y - 30, "+" + pts); }
        else Music.sfx("bounce"); },
    };
  };
})();
