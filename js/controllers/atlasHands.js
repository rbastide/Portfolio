// ============================================
// CONTRÔLEUR — Dessin des mains d'Atlas (trame de points)
// ============================================
// Dessine sur un canvas 2D les mains extraites de la maquette Figma (js/data/atlasHands.js) :
// une trame de petits carrés sur une grille de 6 px Figma, en 10 niveaux de densité.
// Le module ne garde aucun état d'animation : l'appelant fournit à chaque image la position,
// l'échelle, l'opacité, la teinte et le degré de dissolution. Seul un cache de points
// pré-calculés par image est conservé (rempli à la première utilisation).
//
//   drawHand(ctx, frame, { x, y, scale, mirror, flip, alpha, tint, dissolve })
//   drawSpeedLines(ctx, { x1, x2, y, height, alpha, scale })
//
// Les données sont celles de la main gauche ; la main droite en est le miroir autour du point
// d'appui (« grip »), donc l'appelant n'a qu'à poser le grip de chaque main.
// Les carrés sont regroupés par niveau : un seul fillStyle par niveau, pas de chemin par point.

import { ATLAS_HANDS } from '../data/atlasHands.js';

const { CELL, SIZES, frames } = ATLAS_HANDS;

// Couleurs du site.
const VIOLET = [242, 242, 242];
const CYAN = [189, 189, 189];

// Opacité d'un carré selon son niveau (0 = le plus petit et le plus clair, 9 = le plus dense).
// Courbe douce : les niveaux bas restent lisibles sur fond sombre, le cœur de la main se détache.
const LEVEL_ALPHA = [0.18, 0.26, 0.34, 0.43, 0.52, 0.61, 0.7, 0.79, 0.88, 0.95];
const LEVELS = LEVEL_ALPHA.length;

// Dissolution : part de la plage 0..1 réservée au gradient avant-bras -> doigts (le reste est
// du hasard par cellule), et durée de vie d'un point qui part (en fraction de la plage).
const DISSOLVE_ORDER = 0.65;
const DISSOLVE_LIFE = 0.3;
// Dérive maximale vers le bas d'un point qui part, en cellules.
const DISSOLVE_DRIFT = 5;

// ---- Aléa reproductible ----

// Hash entier -> [0, 1[ (variante de lowbias32), sans Math.random : même image, même résultat.
function hash(a, b, salt = 0) {
    let h = (Math.imul(a + 1, 0x9e3779b1) ^ Math.imul(b + 1, 0x85ebca6b) ^ Math.imul(salt + 1, 0xc2b2ae35)) >>> 0;
    h ^= h >>> 16; h = Math.imul(h, 0x7feb352d) >>> 0;
    h ^= h >>> 15; h = Math.imul(h, 0x846ca68b) >>> 0;
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
}

// ---- Cache des points par image ----

const cache = new Map();

// Points d'une image, triés par niveau : coordonnées en cellules relatives au grip (centre de
// cellule), seuil de dissolution et hasard propres à chaque cellule.
function pointsOf(name) {
    let entry = cache.get(name);
    if (entry) return entry;

    const f = frames[name];
    if (!f) throw new Error(`atlasHands : image inconnue « ${name} »`);

    const counts = new Array(LEVELS).fill(0);
    for (let i = 0; i < f.cells.length; i++) {
        const c = f.cells.charCodeAt(i) - 48;
        if (c >= 0 && c < LEVELS) counts[c]++;
    }
    const start = new Int32Array(LEVELS + 1);
    for (let l = 0; l < LEVELS; l++) start[l + 1] = start[l] + counts[l];
    const total = start[LEVELS];

    const px = new Float32Array(total);
    const py = new Float32Array(total);
    const thr = new Float32Array(total); // seuil de dissolution 0..1 : part tôt (bas) ou tard (doigts)
    const rnd = new Float32Array(total);
    const fill = start.slice(0, LEVELS);

    for (let r = 0; r < f.rows; r++) {
        for (let c = 0; c < f.cols; c++) {
            const lvl = f.cells.charCodeAt(r * f.cols + c) - 48;
            if (lvl < 0 || lvl >= LEVELS) continue;
            const i = fill[lvl]++;
            const rand = hash(f.col0 + c, f.row0 + r);
            px[i] = f.col0 + c - f.grip.col;
            py[i] = f.row0 + r - f.grip.row;
            // 0 en haut de la main (doigts), 1 en bas de l'avant-bras : le bas part en premier.
            const depth = f.rows > 1 ? r / (f.rows - 1) : 0;
            thr[i] = (1 - depth) * DISSOLVE_ORDER + rand * (1 - DISSOLVE_ORDER);
            rnd[i] = hash(f.col0 + c, f.row0 + r, 7);
        }
    }
    entry = { start, px, py, thr, rnd };
    cache.set(name, entry);
    return entry;
}

// ---- Couleurs ----

const mix = (a, b, t) => Math.round(a + (b - a) * t);

// rgba du niveau, violet du site mélangé vers le cyan selon la teinte.
function levelColor(level, tint, alpha) {
    const t = tint < 0 ? 0 : tint > 1 ? 1 : tint;
    const a = LEVEL_ALPHA[level] * alpha;
    return `rgba(${mix(VIOLET[0], CYAN[0], t)},${mix(VIOLET[1], CYAN[1], t)},${mix(VIOLET[2], CYAN[2], t)},${a.toFixed(3)})`;
}

// ---- API ----

/**
 * Dessine une main.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} frame  rest | elan | arme | prise | detente | projection
 * @param {object} o
 * @param {number} o.x, o.y   position écran du point d'appui (grip) de l'image
 * @param {number} [o.scale=1]    pixels écran par pixel Figma
 * @param {boolean} [o.mirror=false]  main droite : miroir horizontal autour du grip
 * @param {boolean} [o.flip=false]    main au-dessus : miroir vertical autour du grip
 * @param {number} [o.alpha=1]    opacité globale 0..1
 * @param {number} [o.tint=0]     0 = violet, 1 = cyan
 * @param {number} [o.dissolve=0] 0 = intacte, 1 = entièrement dissoute (de l'avant-bras vers les doigts)
 */
export function drawHand(ctx, frame, { x, y, scale = 1, mirror = false, flip = false, alpha = 1, tint = 0, dissolve = 0 } = {}) {
    if (alpha <= 0 || dissolve >= 1) return;
    const { start, px, py, thr, rnd } = pointsOf(frame);
    const cellPx = CELL * scale;
    const dir = mirror ? -1 : 1;
    // Retournement vertical (mains au-dessus du réseau) : y en miroir autour du
    // grip, et les points qui partent dérivent vers le haut, loin du réseau.
    const vy = flip ? -cellPx : cellPx;
    const d = dissolve < 0 ? 0 : dissolve;
    // Phase de scintillement : change par paliers avec la dissolution, sans horloge.
    const flick = Math.floor(d * 24);

    ctx.save();
    for (let l = 0; l < LEVELS; l++) {
        const from = start[l], to = start[l + 1];
        if (from === to) continue;
        const size = SIZES[l] * scale;
        const half = size / 2;
        ctx.fillStyle = levelColor(l, tint, alpha);

        if (d === 0) {
            for (let i = from; i < to; i++) {
                ctx.fillRect(x + px[i] * cellPx * dir - half, y + py[i] * vy - half, size, size);
            }
            continue;
        }

        // Dissolution : les points dont le seuil est dépassé rétrécissent, dérivent vers le bas et
        // scintillent jusqu'à disparaître. Le seuil est étalé pour que d = 1 les ait tous éteints.
        const range = 1 + DISSOLVE_LIFE;
        for (let i = from; i < to; i++) {
            const p = (d * range - thr[i]) / DISSOLVE_LIFE; // 0 = intact, 1 = disparu
            if (p >= 1) continue;
            if (p <= 0) {
                ctx.fillRect(x + px[i] * cellPx * dir - half, y + py[i] * vy - half, size, size);
                continue;
            }
            // Scintillement : un point sur deux s'éteint par instants, de plus en plus souvent.
            if (hash(i, flick, l) < p * 0.7) continue;
            const s = size * (1 - p * 0.6);
            const drift = p * DISSOLVE_DRIFT * (0.5 + rnd[i]) * vy;
            ctx.fillRect(x + px[i] * cellPx * dir - s / 2, y + py[i] * vy + drift - s / 2, s, s);
        }
    }
    ctx.restore();
}

/**
 * Traits de vitesse : tirets verticaux en trame de points, entre x1 et x2, centrés sur y.
 * @param {object} o
 * @param {number} o.x1, o.x2  bornes horizontales (écran)
 * @param {number} o.y         milieu vertical des traits
 * @param {number} o.height    hauteur maximale d'un trait
 * @param {number} [o.alpha=1]
 * @param {number} [o.scale=1]
 */
export function drawSpeedLines(ctx, { x1, x2, y, height, alpha = 1, scale = 1 } = {}) {
    if (alpha <= 0 || x2 <= x1 || height <= 0) return;
    const cellPx = CELL * scale;
    const cols = Math.floor((x2 - x1) / cellPx);
    const rows = Math.floor(height / cellPx);
    if (cols < 1 || rows < 1) return;

    ctx.save();
    // Un trait environ toutes les 2 colonnes ; hauteur et décalage propres à chaque colonne.
    // Trois paliers d'opacité (plus dense au milieu du trait, qui s'effile aux deux bouts) :
    // on repasse sur les colonnes une fois par palier, sans tableau intermédiaire.
    for (let t = 0; t < 3; t++) {
        ctx.fillStyle = `rgba(${VIOLET[0]},${VIOLET[1]},${VIOLET[2]},${([0.3, 0.55, 0.8][t] * alpha).toFixed(3)})`;
        const s = SIZES[[3, 5, 7][t]] * scale, h = s / 2;
        for (let c = 0; c < cols; c++) {
            if (hash(c, 3, 91) < 0.55) continue;
            const len = Math.max(3, Math.round(rows * (0.35 + 0.65 * hash(c, 5, 91))));
            const top = Math.round((rows - len) * hash(c, 9, 91));
            const cx = x1 + (c + 0.5) * cellPx;
            for (let r = 0; r < len; r++) {
                const m = 1 - Math.abs((r + 0.5) / len * 2 - 1);
                if ((m > 0.66 ? 2 : m > 0.33 ? 1 : 0) !== t) continue;
                ctx.fillRect(cx - h, y - height / 2 + (top + r + 0.5) * cellPx - h, s, s);
            }
        }
    }
    ctx.restore();
}
