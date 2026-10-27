"use strict";
/* Catalogue de tous les jeux (partagé par la salle de jeux et par le panneau du bas de chaque jeu). */
const Catalog = (() => {
  const same = h => h.name;
  const LEGACY = [
    { dir: "jeu-trottinette", emoji: "🛴", name: "Trott' Park", cat: "Sport", desc: "Trottinette ultra réaliste : rider articulé, vraie physique, toutes les figures. Choisis ton skatepark parmi 6 !", as: same },
    { dir: "jeu-diego", emoji: "🏃", name: "La Quête de Diego", cat: "Aventure", desc: "Plateforme : saute, ramasse les pièces, écrase les slimes. 10 niveaux.", as: same },
    { dir: "jeu-espace", emoji: "🚀", name: "Défenseurs de l'Espace", cat: "Tir", desc: "Tire sur les ennemis, affronte les boss. 10 vagues.", as: h => "vaisseau " + h.ship.label },
    { dir: "jeu-serpent", emoji: "🐍", name: "Serpent Géant", cat: "Action", desc: "Mange des pommes, deviens énorme, évite les rochers. 10 niveaux.", as: h => h.snake.name },
    { dir: "jeu-labyrinthe", emoji: "🗝️", name: "Labyrinthe du Trésor", cat: "Aventure", desc: "Trouve les clés dans le noir, fuis les fantômes. 15 niveaux.", as: same },
    { dir: "jeu-briques", emoji: "🧱", name: "Casse-Briques Magique", cat: "Action", desc: "Fais rebondir la balle et casse toutes les briques. 10 niveaux.", as: same },
    { dir: "jeu-vol", emoji: "🕊️", name: "Vol Plané", cat: "Vol", desc: "Bats des ailes et passe entre les tours. 10 niveaux.", as: same },
    { dir: "jeu-2048", emoji: "🦄", name: "2048 Animaux", cat: "Réflexion", desc: "Fais fusionner les animaux jusqu'à la licorne ! 10 paliers.", as: same },
    { dir: "jeu-course", emoji: "🌴", name: "Course de la Jungle", cat: "Course", desc: "Cours, saute et baisse-toi sur 2500 m. 10 niveaux.", as: same },
    { dir: "jeu-memory", emoji: "🃏", name: "Memory des Héros", cat: "Mémoire", desc: "Retrouve les paires de personnages. 10 niveaux.", as: same },
    { dir: "jeu-pong", emoji: "🏓", name: "Pong Turbo", cat: "Sport", desc: "Bats 10 adversaires, avec un smash de feu !", as: same },
    { dir: "jeu-taupes", emoji: "🔨", name: "Chasse aux Taupes", cat: "Réflexe", desc: "Tape les taupes avant la fin du temps. 10 niveaux.", as: same },
    { dir: "jeu-simon", emoji: "🎵", name: "Mélodie Magique", cat: "Mémoire", desc: "Écoute la mélodie et rejoue-la. 10 niveaux.", as: same },
    { dir: "jeu-tetris", emoji: "🧩", name: "Blocs Magiques", cat: "Réflexion", desc: "Empile les blocs et complète des lignes. 10 niveaux.", as: same },
    { dir: "jeu-meteores", emoji: "☄️", name: "Pluie de Météores", cat: "Esquive", desc: "Esquive les météores et attrape les étoiles. 10 niveaux.", as: same },
    { dir: "jeu-invasion", emoji: "👾", name: "Invasion Alien", cat: "Tir", desc: "Tire sur les envahisseurs avant qu'ils atterrissent. 10 niveaux.", as: same },
    { dir: "jeu-panier", emoji: "🧺", name: "Panier Magique", cat: "Attrape", desc: "Attrape les fruits, évite les bombes. 10 niveaux.", as: same },
    { dir: "jeu-archer", emoji: "🏹", name: "Archer Magique", cat: "Sport", desc: "Vise, bande l'arc et touche le centre. 10 niveaux.", as: same },
    { dir: "jeu-montagne", emoji: "⛰️", name: "Montagne Magique", cat: "Aventure", desc: "Rebondis jusqu'au sommet de la montagne. 10 niveaux.", as: same },
    { dir: "jeu-autoroute", emoji: "🏎️", name: "Autoroute Turbo", cat: "Course", desc: "Double les voitures avec ton turbo. 10 niveaux.", as: same },
    { dir: "jeu-morpion", emoji: "⭕", name: "Morpion Malin", cat: "Réflexion", desc: "Bats 10 adversaires de plus en plus malins.", as: same },
  ].map(g => ({ ...g, id: g.dir, href: (n, base = "") => `${base}${g.dir}/index.html?hero=${n}` }));
  const all = () => [...LEGACY, ...GAMES.map(g => ({ ...g, as: same, href: (n, base = "") => `${base}play.html?g=${g.id}&hero=${n}` }))];
  const cats = list => ["Tous", ...[...new Set(list.map(g => g.cat))].sort((a, b) => (a === "Sport" ? -1 : b === "Sport" ? 1 : a.localeCompare(b)))];
  return { LEGACY, all, cats };
})();
