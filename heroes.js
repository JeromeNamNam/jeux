"use strict";
/* Les 10 personnages, partagés par tous les jeux. */
const HEROES = [
  { name: "Diego l'explorateur", emoji: "🧭", body: "#2f6fe0", skin: "#ffcf9f", accent: "#c8281e", hat: "cap",
    ship: { label: "Faucon", color: "#4aa3ff", shape: 0, speed: 330, cd: 0.17 }, snake: { name: "Vipère verte", a: "#57c85c", b: "#3fae4a", dots: true } },
  { name: "Mistigri le chat", emoji: "🐱", body: "#3b3b55", skin: "#3b3b55", accent: "#d8282e", hat: "ears",
    ship: { label: "Fusée Rouge", color: "#ff5a4a", shape: 1, speed: 430, cd: 0.24 }, snake: { name: "Serpent arc-en-ciel", rainbow: true } },
  { name: "Robo-D le robot", emoji: "🤖", body: "#aab4c8", skin: "#c4cddd", accent: "#3df0ff", hat: "antenna",
    ship: { label: "Cristal", color: "#4af0a0", shape: 2, speed: 270, cd: 0.11 }, snake: { name: "Serpent mécanique", a: "#aab4c8", b: "#6f7a90" } },
  { name: "Luna la princesse", emoji: "👸", body: "#ff7ab8", skin: "#ffcf9f", accent: "#ffd23f", hat: "crown",
    ship: { label: "Étoile rose", color: "#ff7ab8", shape: 3, speed: 340, cd: 0.16 }, snake: { name: "Serpent rose", a: "#ff7ab8", b: "#e0509a", dots: true } },
  { name: "Draco le dragon", emoji: "🐲", body: "#3fae4a", skin: "#57c85c", accent: "#ff8a2a", hat: "horns",
    ship: { label: "Dragon", color: "#ff8a2a", shape: 4, speed: 300, cd: 0.14 }, snake: { name: "Dragon rouge", a: "#e84a2a", b: "#c8281e", spikes: true } },
  { name: "Kuro le ninja", emoji: "🥷", body: "#22222e", skin: "#ffcf9f", accent: "#e11d2e", hat: "band",
    ship: { label: "Ombre", color: "#9a7dff", shape: 1, speed: 400, cd: 0.2 }, snake: { name: "Serpent d'ombre", a: "#44445a", b: "#2a2a3a" } },
  { name: "Capitaine Barbe-Rouge", emoji: "🏴‍☠️", body: "#b3262e", skin: "#ffcf9f", accent: "#e0a030", hat: "pirate",
    ship: { label: "Galion", color: "#c98a3a", shape: 0, speed: 290, cd: 0.13 }, snake: { name: "Serpent pirate", a: "#c98a3a", b: "#7a4e2d" } },
  { name: "Astro l'astronaute", emoji: "👨‍🚀", body: "#f2f4ff", skin: "#ffcf9f", accent: "#4aa3ff", hat: "helmet",
    ship: { label: "Navette", color: "#e8ecff", shape: 2, speed: 320, cd: 0.15 }, snake: { name: "Serpent cosmique", a: "#7d6bd0", b: "#4a3b8a", dots: true } },
  { name: "Merlin le magicien", emoji: "🧙", body: "#6a3fc4", skin: "#ffcf9f", accent: "#ffd23f", hat: "wizard",
    ship: { label: "Comète", color: "#b07dff", shape: 3, speed: 350, cd: 0.18 }, snake: { name: "Serpent magique", a: "#8a5fe0", b: "#5a2fb0", dots: true } },
  { name: "Pingo le pingouin", emoji: "🐧", body: "#2a3550", skin: "#2a3550", accent: "#ff9a1f", hat: "penguin",
    ship: { label: "Glaçon", color: "#7df0ff", shape: 4, speed: 310, cd: 0.15 }, snake: { name: "Serpent des glaces", a: "#7df0ff", b: "#4ab8d8" } },
  { name: "Tex le shérif", emoji: "🤠", body: "#a8712f", skin: "#ffcf9f", accent: "#c8281e", hat: "cowboy",
    ship: { label: "Diligence", color: "#d9a441", shape: 4, speed: 300, cd: 0.14 }, snake: { name: "Serpent à sonnettes", a: "#d9a441", b: "#8a5a2a", dots: true } },
  { name: "Chef Pizzaiolo", emoji: "👨‍🍳", body: "#ffffff", skin: "#ffcf9f", accent: "#e11d2e", hat: "chef",
    ship: { label: "Pizza volante", color: "#ffb03a", shape: 3, speed: 330, cd: 0.15 }, snake: { name: "Serpent spaghetti", a: "#ffe28a", b: "#ffb03a" } },
  { name: "Captain Éclair", emoji: "🦸", body: "#2f6fe0", skin: "#ffcf9f", accent: "#ff3d3d", hat: "hero",
    ship: { label: "Éclair", color: "#ffd23f", shape: 1, speed: 420, cd: 0.2 }, snake: { name: "Serpent éclair", a: "#ffd23f", b: "#ff9a1f", dots: true } },
  { name: "Spectro le fantôme", emoji: "👻", body: "#ffffff", skin: "#ffffff", accent: "#111111", hat: "ghost",
    ship: { label: "Brume", color: "#d8e4ff", shape: 2, speed: 360, cd: 0.17 }, snake: { name: "Serpent fantôme", a: "#e8eeff", b: "#b8c4e8", dots: true } },
  { name: "Bouboule le clown", emoji: "🤡", body: "#ffd23f", skin: "#ffffff", accent: "#e11d2e", hat: "clown",
    ship: { label: "Ballon", color: "#ff5a8a", shape: 0, speed: 320, cd: 0.15 }, snake: { name: "Serpent confettis", rainbow: true } },
  { name: "Choco le lapin", emoji: "🐰", body: "#e8d0b0", skin: "#e8d0b0", accent: "#ff8fb0", hat: "bunny",
    ship: { label: "Carotte", color: "#ff8a2a", shape: 1, speed: 410, cd: 0.22 }, snake: { name: "Serpent carotte", a: "#ff8a2a", b: "#4fc24a" } },
  { name: "Bjorn le viking", emoji: "🪓", body: "#7a4e2d", skin: "#ffcf9f", accent: "#e08a2a", hat: "viking",
    ship: { label: "Drakkar", color: "#a0703c", shape: 4, speed: 280, cd: 0.12 }, snake: { name: "Serpent viking", a: "#a0703c", b: "#6a4a2a", spikes: true } },
  { name: "Sam le pompier", emoji: "🧑‍🚒", body: "#e07a10", skin: "#ffcf9f", accent: "#d8282e", hat: "fire",
    ship: { label: "Camion volant", color: "#ff4a3a", shape: 0, speed: 310, cd: 0.14 }, snake: { name: "Serpent pompier", a: "#ff4a3a", b: "#ffd23f" } },
  { name: "Zorg l'extraterrestre", emoji: "👽", body: "#7d6bd0", skin: "#6ee06e", accent: "#ff5ad0", hat: "alien",
    ship: { label: "Soucoupe", color: "#6ee06e", shape: 2, speed: 350, cd: 0.13 }, snake: { name: "Serpent martien", a: "#6ee06e", b: "#3fae4a", dots: true } },
  { name: "Flocon le bonhomme de neige", emoji: "⛄", body: "#f4f8ff", skin: "#f4f8ff", accent: "#d8282e", hat: "snowman",
    ship: { label: "Boule de neige", color: "#cfe8ff", shape: 3, speed: 300, cd: 0.16 }, snake: { name: "Serpent glacé", a: "#cfe8ff", b: "#8ac8f0" } },
];

function heroIndexFromUrl() {
  const q = new URLSearchParams(location.search);
  let n = q.has("hero") ? +q.get("hero") : NaN;
  if (isNaN(n)) { try { n = +sessionStorage.getItem("hero"); } catch (e) {} }
  return Math.max(0, Math.min(HEROES.length - 1, n || 0));
}

/* Vue de côté (jeu de plateforme). Repère : x de -11 à 11, y de -9 à 30, regarde vers la droite. */
function heroSide(c, h, sw, ground, time) {
  const tri = (a, b, d, e, f, g) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.lineTo(f, g); c.fill(); };
  c.fillStyle = h.hat === "penguin" ? "#ff9a1f" : h.hat === "band" ? "#14141c" : "#4a3320";
  c.fillRect(-8 + sw, 24, 7, 6); c.fillRect(1 - sw, 24, 7, 6);                          // pieds
  if (h.hat === "horns") { c.fillStyle = h.accent; for (let k = 0; k < 3; k++) tri(-10, 14 + k * 5, -16, 17 + k * 5, -10, 19 + k * 5); }
  if (h.hat === "ears") { c.fillStyle = h.body; c.fillRect(-18, 16, 8, 3); c.fillRect(-18, 11, 3, 8); }
  if (h.hat === "helmet") { c.fillStyle = "#cfd6ee"; c.fillRect(-15, 12, 6, 12); }
  c.fillStyle = h.body; c.fillRect(-10, 12, 20, 13);                                    // corps
  if (h.hat === "penguin") { c.fillStyle = "#fff"; c.beginPath(); c.ellipse(3, 19, 7, 8, 0, 0, 7); c.fill(); }
  else { c.fillStyle = h.hat === "pirate" ? "#e0a030" : h.accent; c.fillRect(-10, 21, 20, 3); }  // ceinture
  c.fillStyle = h.skin; c.fillRect(-9, 1, 18, 13);                                      // tête
  let eye = "#111";
  switch (h.hat) {
    case "cap":
      c.fillStyle = h.accent; c.fillRect(-11, -4, 22, 7); c.fillRect(-6, -9, 13, 6);
      c.fillStyle = "#fff"; c.fillRect(7, -9, 8, 3); break;
    case "ears":
      c.fillStyle = h.body; tri(-9, 2, -7, -9, -1, 0); tri(9, 2, 7, -9, 1, 0);
      c.fillStyle = "#ff8fb0"; c.fillRect(-7, -4, 2, 4); c.fillRect(5, -4, 2, 4);
      c.fillStyle = h.accent; c.fillRect(-10, 4, 20, 3); eye = "#ffe24a"; break;
    case "antenna":
      c.fillStyle = "#111a2a"; c.fillRect(-7, 3, 16, 6);
      c.fillStyle = h.accent; c.fillRect(2, 4, 5, 4); c.fillRect(-5, 4, 5, 4);
      c.fillStyle = "#777"; c.fillRect(-1, -7, 2, 8);
      c.fillStyle = Math.floor(time * 3) % 2 ? "#ff4d4d" : "#ffd23f"; c.fillRect(-3, -10, 6, 4); eye = null; break;
    case "crown":
      c.fillStyle = "#e8a030"; c.fillRect(-11, -1, 4, 18);
      c.fillStyle = h.accent; c.beginPath(); c.moveTo(-8, 1); c.lineTo(-8, -6); c.lineTo(-4, -2); c.lineTo(0, -8); c.lineTo(4, -2); c.lineTo(8, -6); c.lineTo(8, 1); c.fill(); break;
    case "horns":
      c.fillStyle = "#fff3d0"; tri(-8, 2, -6, -9, -3, 2); tri(3, 2, 6, -9, 8, 2);
      c.fillStyle = "#9be58a"; c.fillRect(4, 7, 6, 6); break;
    case "band":
      c.fillStyle = h.body; c.fillRect(-10, -3, 20, 7); c.fillRect(-10, -3, 4, 17);
      c.fillStyle = h.accent; c.fillRect(-10, 0, 20, 3); c.fillRect(-17, 0, 7, 2); c.fillRect(-16, 3, 6, 2); break;
    case "pirate":
      c.fillStyle = "#7a2a1a"; c.fillRect(-9, 10, 18, 5);
      c.fillStyle = "#1b1b22"; c.fillRect(-12, -5, 24, 5); tri(-8, -5, 0, -14, 8, -5);
      c.fillStyle = "#fff"; c.beginPath(); c.arc(0, -6, 2, 0, 7); c.fill();
      c.fillStyle = "#111"; c.fillRect(-6, 4, 6, 5); c.fillRect(-9, 3, 18, 1); break;
    case "helmet":
      c.fillStyle = "rgba(120,200,255,.35)"; c.strokeStyle = "#fff"; c.lineWidth = 2.5;
      c.beginPath(); c.arc(0, 7, 13, 0, 7); c.fill(); c.stroke(); break;
    case "wizard":
      c.fillStyle = "#f4f4f4"; tri(-8, 9, 8, 9, 0, 25);
      c.fillStyle = h.body; tri(-13, 2, -1, -24, 13, 2);
      c.fillStyle = "#4a2a9a"; c.fillRect(-14, 0, 28, 4);
      c.fillStyle = h.accent; c.beginPath(); c.arc(2, -8, 2.5, 0, 7); c.fill(); break;
    case "cowboy":
      c.fillStyle = h.accent; tri(-7, 12, 7, 12, 0, 19);
      c.fillStyle = "#8a5a2a"; c.fillRect(-15, -2, 30, 3); c.fillRect(-8, -9, 16, 8);
      c.fillStyle = "#5a3a1a"; c.fillRect(-8, -4, 16, 2); break;
    case "chef":
      c.fillStyle = "#fff"; c.fillRect(-8, -4, 16, 6);
      c.beginPath(); c.arc(-6, -6, 5, 0, 7); c.arc(0, -9, 6, 0, 7); c.arc(6, -6, 5, 0, 7); c.fill();
      c.fillStyle = h.accent; c.fillRect(-6, 12, 12, 3); break;
    case "hero":
      c.fillStyle = h.accent; tri(-10, 12, -19, 30, -10, 26);
      c.fillRect(-9, 3, 18, 5);
      c.fillStyle = "#fff"; c.fillRect(1, 4, 5, 3); eye = null;
      c.fillStyle = "#111"; c.fillRect(3, 4, 2, 3);
      c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(0, 18, 3.5, 0, 7); c.fill(); break;
    case "ghost":
      c.fillStyle = "#fff"; c.beginPath(); c.arc(0, 6, 11, Math.PI, 0); c.lineTo(11, 28); c.lineTo(6, 25); c.lineTo(2, 29);
      c.lineTo(-2, 25); c.lineTo(-6, 29); c.lineTo(-11, 26); c.fill();
      c.fillStyle = "#222"; c.fillRect(-5, 3, 3, 6); c.fillRect(2, 3, 3, 6); c.beginPath(); c.arc(-1, 12, 2, 0, 7); c.fill(); eye = null; break;
    case "clown":
      c.fillStyle = "#ff5a5a"; c.beginPath(); c.arc(-8, 0, 5, 0, 7); c.fill();
      c.fillStyle = "#4aa3ff"; c.beginPath(); c.arc(8, 0, 5, 0, 7); c.fill();
      c.fillStyle = "#6ee06e"; c.beginPath(); c.arc(0, -4, 6, 0, 7); c.fill();
      c.fillStyle = h.accent; c.beginPath(); c.arc(8, 8, 3.5, 0, 7); c.fill(); c.fillRect(0, 11, 7, 2); break;
    case "bunny":
      c.fillStyle = h.body; c.beginPath(); c.ellipse(-4, -10, 3, 10, 0, 0, 7); c.ellipse(4, -12, 3, 10, 0, 0, 7); c.arc(-13, 22, 4, 0, 7); c.fill();
      c.fillStyle = h.accent; c.beginPath(); c.ellipse(-4, -9, 1.3, 7, 0, 0, 7); c.ellipse(4, -11, 1.3, 7, 0, 0, 7); c.arc(9, 8, 2, 0, 7); c.fill(); break;
    case "viking":
      c.fillStyle = h.accent; c.fillRect(-9, 10, 18, 7);
      c.fillStyle = "#9aa0aa"; c.beginPath(); c.arc(0, 3, 10, Math.PI, 0); c.fill(); c.fillRect(-10, 1, 20, 3);
      c.fillStyle = "#fff"; tri(-10, 1, -17, -10, -7, -3); tri(10, 1, 17, -10, 7, -3); break;
    case "fire":
      c.fillStyle = "#ffe24a"; c.fillRect(-10, 17, 20, 2);
      c.fillStyle = h.accent; c.beginPath(); c.arc(0, 3, 10, Math.PI, 0); c.fill(); c.fillRect(-13, 1, 26, 3);
      c.fillStyle = "#ffe24a"; c.fillRect(-2, -6, 4, 4); break;
    case "alien":
      c.fillStyle = h.skin; c.fillRect(-5, -7, 2, 8); c.fillRect(3, -7, 2, 8);
      c.fillStyle = h.accent; c.beginPath(); c.arc(-4, -8, 3, 0, 7); c.arc(4, -8, 3, 0, 7); c.fill();
      c.fillStyle = "#111"; c.beginPath(); c.ellipse(3, 7, 5.5, 4, -0.3, 0, 7); c.fill();
      c.fillStyle = "#fff"; c.fillRect(4, 5, 2, 2); eye = null; break;
    case "snowman":
      c.fillStyle = h.accent; c.fillRect(-10, 11, 20, 3);
      c.fillStyle = "#111"; c.fillRect(-12, -2, 24, 3); c.fillRect(-8, -12, 16, 10);
      c.fillStyle = h.accent; c.fillRect(-8, -5, 16, 2);
      c.fillStyle = "#ff8a2a"; tri(9, 7, 18, 9, 9, 11);
      c.fillStyle = "#111"; c.beginPath(); c.arc(0, 17, 1.6, 0, 7); c.arc(0, 22, 1.6, 0, 7); c.fill(); break;
    case "penguin":
      c.fillStyle = h.body; c.fillRect(-9, 1, 18, 13);
      c.fillStyle = "#fff"; c.beginPath(); c.ellipse(3, 8, 6, 5, 0, 0, 7); c.fill();
      c.fillStyle = h.accent; tri(8, 8, 16, 10, 8, 12);
      c.fillStyle = "#fff"; c.fillRect(1, 4, 5, 5); c.fillStyle = "#111"; c.fillRect(3, 5, 2, 3); eye = null; break;
  }
  if (eye) { c.fillStyle = eye; c.fillRect(2, 5, 3, 4); }
  c.fillStyle = h.hat === "penguin" || h.hat === "ears" ? h.body : h.skin;               // bras
  c.fillRect(ground ? 6 : 8, ground ? 15 : 8, 5, 6);
}

/* Vue de dessus (labyrinthe). Repère : centre en (0,0), rayon 11. */
function heroTop(c, h, dir, bob, time) {
  const tri = (a, b, d, e, f, g) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.lineTo(f, g); c.fill(); };
  c.fillStyle = "rgba(0,0,0,.3)"; c.beginPath(); c.ellipse(0, 10, 11, 5, 0, 0, 7); c.fill();
  c.fillStyle = h.body; c.beginPath(); c.arc(0, bob, 11, 0, 7); c.fill();
  c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 1.5; c.stroke();
  if (h.hat === "penguin") { c.fillStyle = "#fff"; c.beginPath(); c.ellipse(0, 3 + bob, 7, 7, 0, 0, 7); c.fill(); }
  let eyeCol = "#fff", noEyes = false;
  switch (h.hat) {
    case "cap": c.fillStyle = h.accent; c.beginPath(); c.arc(0, -4 + bob, 9, Math.PI, 0); c.fill(); c.fillRect(-12, -4 + bob, 24, 3); break;
    case "ears": c.fillStyle = h.body; tri(-10, -3 + bob, -7, -14 + bob, -1, -9 + bob); tri(10, -3 + bob, 7, -14 + bob, 1, -9 + bob); break;
    case "antenna":
      c.fillStyle = "#777"; c.fillRect(-1, -17 + bob, 2, 7);
      c.fillStyle = Math.floor(time * 3) % 2 ? "#ff4d4d" : "#ffd23f"; c.beginPath(); c.arc(0, -18 + bob, 3, 0, 7); c.fill(); eyeCol = h.accent; break;
    case "crown":
      c.fillStyle = h.accent; c.beginPath(); c.moveTo(-7, -8 + bob); c.lineTo(-7, -15 + bob); c.lineTo(-3.5, -11 + bob); c.lineTo(0, -16 + bob);
      c.lineTo(3.5, -11 + bob); c.lineTo(7, -15 + bob); c.lineTo(7, -8 + bob); c.fill(); break;
    case "horns": c.fillStyle = "#fff3d0"; tri(-8, -6 + bob, -7, -15 + bob, -3, -8 + bob); tri(8, -6 + bob, 7, -15 + bob, 3, -8 + bob); break;
    case "band": c.fillStyle = h.accent; c.fillRect(-11, -3 + bob, 22, 4); c.fillRect(-17, -2 + bob, 7, 2); break;
    case "pirate":
      c.fillStyle = "#1b1b22"; c.beginPath(); c.arc(0, -3 + bob, 11, Math.PI, 0); c.fill(); c.fillRect(-13, -4 + bob, 26, 3);
      c.fillStyle = "#fff"; c.beginPath(); c.arc(0, -8 + bob, 2, 0, 7); c.fill(); break;
    case "helmet":
      c.fillStyle = "rgba(120,200,255,.3)"; c.strokeStyle = "#fff"; c.lineWidth = 2; c.beginPath(); c.arc(0, bob, 13, 0, 7); c.fill(); c.stroke(); break;
    case "wizard":
      c.fillStyle = "#4a2a9a"; tri(-10, -3 + bob, 0, -22 + bob, 10, -3 + bob); c.fillRect(-13, -4 + bob, 26, 3);
      c.fillStyle = h.accent; c.beginPath(); c.arc(1, -11 + bob, 2.2, 0, 7); c.fill(); break;
    case "cowboy": c.fillStyle = "#8a5a2a"; c.beginPath(); c.ellipse(0, -3 + bob, 14, 6, 0, 0, 7); c.fill(); c.beginPath(); c.arc(0, -5 + bob, 7, Math.PI, 0); c.fill(); break;
    case "chef": c.fillStyle = "#fff"; c.beginPath(); c.arc(-5, -9 + bob, 5, 0, 7); c.arc(0, -12 + bob, 6, 0, 7); c.arc(5, -9 + bob, 5, 0, 7); c.fill(); eyeCol = "#fff"; break;
    case "hero": c.fillStyle = h.accent; tri(-9, 8 + bob, 9, 8 + bob, 0, 17 + bob); c.fillRect(-10, -1 + bob, 20, 4); break;
    case "ghost":
      c.fillStyle = "#fff"; for (let k = -2; k <= 2; k++) { c.beginPath(); c.arc(k * 5, 10 + bob, 3, 0, 7); c.fill(); }
      c.fillStyle = "#222"; c.beginPath(); c.ellipse(-4 + dir.x * 3, 0 + dir.y * 2 + bob, 2.5, 4, 0, 0, 7); c.ellipse(4 + dir.x * 3, 0 + dir.y * 2 + bob, 2.5, 4, 0, 0, 7); c.fill(); noEyes = true; break;
    case "clown":
      c.fillStyle = "#ff5a5a"; c.beginPath(); c.arc(-9, -6 + bob, 5, 0, 7); c.fill(); c.fillStyle = "#4aa3ff"; c.beginPath(); c.arc(9, -6 + bob, 5, 0, 7); c.fill();
      c.fillStyle = "#6ee06e"; c.beginPath(); c.arc(0, -10 + bob, 6, 0, 7); c.fill();
      c.fillStyle = h.accent; c.beginPath(); c.arc(dir.x * 9, dir.y * 8 + 2 + bob, 3, 0, 7); c.fill(); break;
    case "bunny":
      c.fillStyle = h.body; c.beginPath(); c.ellipse(-5, -14 + bob, 3, 8, 0, 0, 7); c.ellipse(5, -14 + bob, 3, 8, 0, 0, 7); c.fill();
      c.fillStyle = h.accent; c.beginPath(); c.ellipse(-5, -14 + bob, 1.2, 6, 0, 0, 7); c.ellipse(5, -14 + bob, 1.2, 6, 0, 0, 7); c.fill(); break;
    case "viking":
      c.fillStyle = "#9aa0aa"; c.beginPath(); c.arc(0, -2 + bob, 11, Math.PI, 0); c.fill();
      c.fillStyle = "#fff"; tri(-10, -4 + bob, -17, -12 + bob, -8, -9 + bob); tri(10, -4 + bob, 17, -12 + bob, 8, -9 + bob); break;
    case "fire": c.fillStyle = h.accent; c.beginPath(); c.arc(0, -3 + bob, 11, Math.PI, 0); c.fill(); c.fillRect(-13, -4 + bob, 26, 3); break;
    case "alien":
      c.strokeStyle = h.skin; c.lineWidth = 2; c.beginPath(); c.moveTo(-4, -9 + bob); c.lineTo(-6, -15 + bob); c.moveTo(4, -9 + bob); c.lineTo(6, -15 + bob); c.stroke();
      c.fillStyle = h.accent; c.beginPath(); c.arc(-6, -16 + bob, 3, 0, 7); c.arc(6, -16 + bob, 3, 0, 7); c.fill();
      c.fillStyle = "#111"; c.beginPath(); c.ellipse(-4 + dir.x * 2, 1 + dir.y * 2 + bob, 3.5, 5, 0, 0, 7); c.ellipse(4 + dir.x * 2, 1 + dir.y * 2 + bob, 3.5, 5, 0, 0, 7); c.fill(); noEyes = true; break;
    case "snowman":
      c.fillStyle = "#111"; c.fillRect(-9, -15 + bob, 18, 9); c.fillRect(-12, -7 + bob, 24, 3);
      c.fillStyle = h.accent; c.fillRect(-9, -9 + bob, 18, 2);
      c.fillStyle = "#ff8a2a"; c.beginPath(); c.arc(dir.x * 9, dir.y * 7 + 2 + bob, 2.5, 0, 7); c.fill(); break;
    case "penguin": c.fillStyle = h.accent; c.beginPath(); c.arc(dir.x * 9, dir.y * 7 + 3 + bob, 3, 0, 7); c.fill(); break;
  }
  if (noEyes) return;
  const ex = dir.x * 4, ey = dir.y * 3;
  c.fillStyle = eyeCol; c.beginPath(); c.arc(ex - 4, ey + 1 + bob, 3.2, 0, 7); c.arc(ex + 4, ey + 1 + bob, 3.2, 0, 7); c.fill();
  c.fillStyle = "#111"; c.beginPath(); c.arc(ex - 4 + dir.x * 1.2, ey + 1 + bob + dir.y * 1.2, 1.5, 0, 7); c.arc(ex + 4 + dir.x * 1.2, ey + 1 + bob + dir.y * 1.2, 1.5, 0, 7); c.fill();
}
