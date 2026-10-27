"use strict";
/* Boîte à outils commune aux nouveaux jeux : musique, bruitages, texte, clavier, boucle. */
const Music = (() => {
  let ac = null, master, noiseBuf, next = 0, step = 0, muted = false, S = null, mel = [], timer = null;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12), arp = [0, 1, 2, 1];
  const SONGS = {
    brick: { bpm: 128, lead: ["square", .04, 3200], drums: "full",
      bars: [[[79,2],[76,2],[79,2],[84,2],[83,4],[79,4]], [[81,2],[79,2],[76,2],[72,2],[76,8]], [[77,2],[81,2],[84,2],[81,2],[77,4],[72,4]], [[74,2],[79,2],[83,2],[79,2],[86,8]],
             [[84,4],[79,2],[76,2],[79,4],[84,4]], [[81,4],[76,2],[72,2],[76,4],[81,4]], [[77,2],[84,2],[81,2],[77,2],[74,4],[77,4]], [[79,2],[83,2],[86,2],[83,2],[79,8]]],
      roots: [48,45,41,43,48,45,41,43], chords: [[60,64,67],[57,60,64],[53,57,60],[55,59,62],[60,64,67],[57,60,64],[53,57,60],[55,59,62]] },
    fly: { bpm: 100, lead: ["triangle", .13, 0], drums: "soft",
      bars: [[[78,4],[81,4],[85,4],[81,4]], [[76,4],[81,4],[85,4],[81,4]], [[74,4],[78,4],[83,4],[78,4]], [[79,4],[83,4],[86,4],[83,4]],
             [[85,2],[83,2],[81,4],[78,4],[81,4]], [[85,4],[81,4],[76,4],[81,4]], [[83,2],[81,2],[78,4],[74,4],[78,4]], [[76,8],[81,8]]],
      roots: [50,45,47,43,50,45,47,45], chords: [[62,66,69],[57,61,64],[59,62,66],[55,59,62],[62,66,69],[57,61,64],[59,62,66],[57,61,64]] },
    calm: { bpm: 90, lead: ["triangle", .12, 0], drums: "soft",
      bars: [[[76,4],[79,4],[76,4],[72,4]], [[74,4],[79,4],[83,4],[79,4]], [[72,4],[76,4],[81,4],[76,4]], [[77,4],[81,4],[84,4],[81,4]],
             [[79,6],[76,2],[72,8]], [[74,4],[79,4],[74,4],[71,4]], [[76,6],[72,2],[69,8]], [[77,4],[72,4],[77,8]]],
      roots: [48,43,45,41,48,43,45,41], chords: [[60,64,67],[55,59,62],[57,60,64],[53,57,60],[60,64,67],[55,59,62],[57,60,64],[53,57,60]] },
    run: { bpm: 150, lead: ["square", .04, 3500], drums: "full",
      bars: [[[76,2],[79,2],[83,2],[79,2],[76,4],[71,4]], [[74,2],[78,2],[81,2],[78,2],[74,4],[69,4]], [[72,2],[76,2],[79,2],[76,2],[84,4],[79,4]], [[71,2],[75,2],[78,2],[75,2],[83,8]],
             [[88,4],[83,4],[79,4],[83,4]], [[86,4],[81,4],[78,4],[81,4]], [[84,4],[79,4],[76,4],[79,4]], [[83,4],[78,4],[75,4],[83,4]]],
      roots: [40,38,48,47,40,38,48,47], chords: [[64,67,71],[62,66,69],[60,64,67],[59,63,66],[64,67,71],[62,66,69],[60,64,67],[59,63,66]] },
    memory: { bpm: 110, lead: ["triangle", .13, 0], drums: "soft",
      bars: [[[77,2],[81,2],[84,2],[81,2],[77,8]], [[74,2],[77,2],[81,2],[77,2],[74,8]], [[82,2],[86,2],[89,2],[86,2],[82,8]], [[79,2],[84,2],[88,2],[84,2],[79,8]],
             [[84,4],[81,4],[77,4],[81,4]], [[81,4],[77,4],[74,4],[77,4]], [[82,4],[86,4],[82,4],[77,4]], [[79,4],[84,4],[79,4],[72,4]]],
      roots: [41,38,46,48,41,38,46,48], chords: [[57,60,65],[57,62,65],[58,62,65],[55,60,64],[57,60,65],[57,62,65],[58,62,65],[55,60,64]] },
  };
  let SD = 0.1;
  function tone(type, f, t, dur, vol, filt) {
    const o = ac.createOscillator(), g = ac.createGain(); let out = g;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    if (filt) { const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = filt; g.connect(lp); out = lp; }
    out.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, vol, hp, type) {
    const s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
    s.buffer = noiseBuf; f.type = type || "highpass"; f.frequency.value = hp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
  }
  function kick(t, v) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(v || 0.35, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2);
  }
  function sweep(type, f0, f1, dur, vol) {
    const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function playStep(s, t) {
    const bar = s >> 4, i = s & 15, m = mel[s];
    if (m) tone(S.lead[0], mtof(m[0]), t, m[1] * SD * 0.95, S.lead[1], S.lead[2]);
    if (i % 4 === 0) tone("triangle", mtof(S.roots[bar]), t, SD * 3, 0.28);
    if (i % 4 === 2 && S.drums === "full") tone("triangle", mtof(S.roots[bar] + 12), t, SD * 1.5, 0.14);
    tone("triangle", mtof(S.chords[bar][arp[i & 3]] + 12), t, SD * 0.9, 0.045);
    if (S.drums === "full") { if (i % 4 === 0) kick(t); if (i === 4 || i === 12) noise(t, 0.1, 0.1, 2000); if (i % 2) noise(t, 0.03, 0.025, 7000); }
    else { if (i === 0 || i === 8) kick(t, 0.22); if (i % 4 === 2) noise(t, 0.03, 0.02, 7000); }
  }
  function schedule() { while (next < ac.currentTime + 0.2) { playStep(step, next); next += SD; step = (step + 1) % 128; } }
  return {
    init(name) {
      if (ac) { if (ac.state === "suspended") ac.resume(); return; }
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      S = SONGS[name] || SONGS.calm; SD = 60 / S.bpm / 4; mel = new Array(128).fill(null);
      S.bars.forEach((b, i) => { let k = i * 16; b.forEach(([n, l]) => { mel[k] = [n, l]; k += l; }); });
      next = ac.currentTime + 0.1; timer = setInterval(schedule, 25);
    },
    toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.5; },
    get muted() { return muted; },
    note(m, d, type) { if (ac) tone(type || "triangle", mtof(m), ac.currentTime, d || 0.3, 0.16); },
    sfx(k) {
      if (!ac) return; const t = ac.currentTime;
      switch (k) {
        case "coin": tone("square", mtof(88), t, 0.06, 0.06); tone("square", mtof(95), t + 0.06, 0.14, 0.06); break;
        case "jump": sweep("square", 300, 700, 0.16, 0.07); break;
        case "flap": sweep("triangle", 250, 520, 0.12, 0.12); break;
        case "bounce": tone("square", mtof(72), t, 0.05, 0.05); break;
        case "brick": tone("square", mtof(84), t, 0.07, 0.06); break;
        case "pop": tone("sine", mtof(76), t, 0.12, 0.18); break;
        case "flip": tone("triangle", mtof(79), t, 0.08, 0.15); break;
        case "match": [84, 88, 91].forEach((n, j) => tone("square", mtof(n), t + j * 0.06, 0.12, 0.06)); break;
        case "nope": tone("square", 180, t, 0.18, 0.06); break;
        case "power": [76, 83, 88].forEach((n, j) => tone("square", mtof(n), t + j * 0.06, 0.12, 0.06)); break;
        case "hit": sweep("sawtooth", 350, 60, 0.45, 0.14); noise(t, 0.25, 0.14, 500, "lowpass"); break;
        case "level": [72, 76, 79, 84, 88].forEach((n, j) => tone("square", mtof(n), t + j * 0.09, 0.2, 0.07)); break;
        case "win": [72, 76, 79, 84, 79, 84, 88].forEach((n, j) => tone("square", mtof(n), t + j * 0.1, 0.25, 0.07)); break;
        case "lose": [76, 72, 67, 60].forEach((n, j) => tone("triangle", mtof(n), t + j * 0.15, 0.3, 0.14)); break;
      }
    },
  };
})();

const Kit = {
  keys: {}, paused: false,
  text(ctx, t, x, y, size, color, align) {
    ctx.font = `bold ${size}px "Trebuchet MS",Verdana,sans-serif`; ctx.textAlign = align || "center";
    ctx.lineWidth = 5; ctx.strokeStyle = "rgba(0,0,0,.7)"; ctx.lineJoin = "round"; ctx.strokeText(t, x, y); ctx.fillStyle = color || "#fff"; ctx.fillText(t, x, y);
  },
  loop(update, draw) {
    let last = performance.now();
    (function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; update(dt); draw(); requestAnimationFrame(frame); })(last);
  },
  /* o : canvas, song, getHero(), setHero(i), isTitle(), canPause(), keydown(e), keyup(e) */
  install(o) {
    const cycle = f => { o.setHero((o.getHero() + (f ? 1 : HEROES.length - 1)) % HEROES.length); try { sessionStorage.setItem("hero", o.getHero()); } catch (e) {} };
    addEventListener("keydown", e => {
      if (/^(Arrow(Up|Down|Left|Right)|Space|Tab)$/.test(e.code)) e.preventDefault();
      Music.init(o.song);
      if (e.code === "Escape") { location.href = (o.home || "../index.html") + "?hero=" + o.getHero(); return; }
      if (e.code === "KeyM") { Music.toggleMute(); return; }
      if (e.code === "KeyP" && o.canPause && o.canPause()) { Kit.paused = !Kit.paused; return; }
      if (o.isTitle() && /^Arrow|^Tab$/.test(e.code)) { cycle(e.code === "ArrowRight" || e.code === "ArrowDown" || e.code === "Tab"); return; }
      Kit.keys[e.code] = true;
      o.keydown && o.keydown(e);
    });
    addEventListener("keyup", e => { Kit.keys[e.code] = false; o.keyup && o.keyup(e); });
    addEventListener("blur", () => { for (const k in Kit.keys) Kit.keys[k] = false; if (o.canPause && o.canPause()) Kit.paused = true; });
    o.canvas.addEventListener("click", e => {
      Music.init(o.song);
      if (!o.isTitle()) return;
      const r = o.canvas.getBoundingClientRect(); cycle(e.clientX > r.left + r.width / 2);
    });
  },
};
