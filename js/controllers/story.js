// ============================================
// CONTRÔLEUR — Parcours en scrollytelling
// ============================================
// La scène reste collée à l'écran (position: sticky) pendant que la section
// défile. L'avancement du scroll dans la section donne une progression p
// entre 0 et 1, et chaque image du canvas est une fonction de p seule : comme
// une séquence vidéo, la même position de scroll donne toujours la même image,
// à l'aller comme au retour.
//
// Le réseau raconte le parcours en cinq temps :
//   1. des neurones épars        (les bases)
//   2. ils s'alignent en couches  (fullstack : interface, API, données, serveur)
//   3. un conteneur les entoure   (déploiement)
//   4. des signaux les traversent (conditions réelles)
//   5. tout s'allume              (l'IA)
//
// À l'arrivée sur l'accueil, l'impulsion de l'intro (controllers/intro.js)
// continue : un néon cyan entre par la gauche de l'écran, passe de neurone en
// neurone et vient charger le noyau central, qui s'illumine. Le néon reste
// ensuite tracé, et de petites impulsions continuent d'alimenter le noyau.
// Il s'efface dès qu'on quitte l'accueil.
//
// Puis un 6e temps, Atlas, sur un segment de scroll ajouté après la dernière
// scène (ATLAS_SPAN) : les scènes gardent leur rythme sur [0, storyEnd], le
// segment occupe [storyEnd, 1] avec sa propre progression a (0 à 1).
//   - a 0 → 0.35 : le texte de la dernière scène s'efface, le réseau se
//     recentre dans le haut de l'écran et deux mains en trame de points
//     (controllers/atlasHands.js) entrent par les côtés pour le tenir par en
//     dessous, comme Atlas porte la voûte céleste ;
//   - a 0.35 → 0.8 : l'élan, au scroll : repos → élan → armé, le réseau
//     descend avec le bout des doigts (les avant-bras ne bougent pas) ;
//   - au-delà de LAUNCH_AT : le lancer se joue en temps réel, aux durées de la
//     maquette Figma (prise 70 ms → détente 80 ms → projection 220 ms), le
//     réseau sort par le haut avec une traînée de points et les mains se
//     dissolvent. L'état « lancé » est gardé ;
//   - en remontant sous RETURN_AT : « le ciel revient », en temps réel aussi :
//     le réseau redescend dans les mains, qui se reforment et l'amortissent,
//     puis le scroll reprend la main.
// En mouvement réduit, pas de segment ni de mains.
//
// La progression affichée rattrape le scroll avec un léger retard : c'est ce
// qui donne de l'inertie au mouvement.
import { prefersReducedMotion } from '../utils/dom.js';
import { ATLAS_HANDS } from '../data/atlasHands.js';
import { drawHand, drawSpeedLines } from './atlasHands.js';

const LAYERS = [4, 6, 6, 3];
const LAYER_LABELS = ['INTERFACE', 'API', 'DONNÉES', 'SERVEUR'];
const DUST_COUNT = 46;

// Néon d'arrivée (secondes, depuis la fin de l'intro).
const FEED_DELAY = 0.25;      // laisse l'intro finir de s'effacer
const FEED_TRAVEL = 1.5;      // traversée de l'écran jusqu'au noyau
const FEED_FLASH = 1.4;       // durée de l'éclat quand le noyau est chargé
const FEED_PULSE = 3.2;       // une petite impulsion toutes les X secondes ensuite
const RELAYS = 5;             // neurones relais sur le trajet
const SMOOTHING = 6;          // vitesse de rattrapage du scroll (plus haut = plus sec)
const SCENE_FADE = 0.04;      // part de la progression pour un fondu de texte
const MOBILE_MAX = 820;       // en dessous, textes centrés en bas et réseau en haut

// Couleurs du thème (base.css).
const VIOLET = [208, 188, 255];
const CYAN = [76, 215, 246];
const GREEN = [78, 222, 163];
const MUTED = [179, 173, 189];

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const range = (p, from, to) => clamp((p - from) / (to - from));
const ease = t => t * t * (3 - 2 * t);
const mix = (a, b, t) => a + (b - a) * t;
const mixColor = (c1, c2, t) => c1.map((v, i) => Math.round(mix(v, c2[i], t)));
const rgba = ([r, g, b], a) => `rgba(${r}, ${g}, ${b}, ${clamp(a)})`;

// ---- Atlas : les mains qui lancent le réseau ----
const ATLAS_SPAN = 0.8;       // longueur du segment, en hauteurs d'écran (80svh)
const ENTER_END = 0.35;       // a : fin de l'entrée des mains
const ELAN_AT = 0.47;         // a : image « élan »
const ARME_AT = 0.62;         // a : image « armé »
const LAUNCH_AT = 0.8;        // a : le lancer part, en temps réel
const RETURN_AT = 0.6;        // a : en remontant, le ciel revient
const STEP_BLEND = 0.03;      // demi-largeur (en a) du glissement du réseau entre deux images
const PRISE_MS = 70;          // durées de la maquette Figma
const DETENTE_MS = 80;
const PROJECTION_MS = 220;
const DISSOLVE_MS = 400;      // dissolution des mains, depuis la projection
const THROW_MS = 300;         // course du réseau vers le haut, depuis la détente
const LAUNCH_MS = PRISE_MS + DETENTE_MS + DISSOLVE_MS;
const RETURN_FALL = 300;      // le ciel revient : chute du réseau dans les mains
const RETURN_CATCH = 120;     // amorti (image élan)
const RETURN_MS = 600;
// Cadrage : marge haute (sous l'en-tête), hauteur de maquette à faire tenir
// à l'écran (du haut du réseau au poignet de l'image « armé », px Figma) et
// taille du réseau par rapport aux mains.
const ATLAS_TOP = 80;
const ATLAS_VIEW_H = 850;
const NET_UNIT = 245;         // unité du réseau, en px Figma
const NET_ABOVE = 0.8;        // centre du réseau sous la marge haute (en unités)
const GRIP_BELOW = 0.62;      // bout des doigts sous le centre du réseau (en unités) : juste
                              // sous les neurones du bas des colonnes extrêmes
const GRIP_AT = 0.95;         // bout des doigts sous les colonnes extrêmes (en unités)
const MAX_STRETCH = 1.5;      // étirement horizontal maximal du réseau
const MOBILE_HAND = 1.1;      // mains un peu plus grandes que la stricte mise à l'échelle sur mobile
const MOBILE_REACH = 0.15;    // part de l'avant-bras qui peut sortir par le côté, sur mobile
const ARM_FADE = 110;         // fondu de la coupe de l'avant-bras (px Figma)
const TRAIL_MS = 24;          // écart pour mesurer la vitesse du réseau (traînée)
const SINK = 0.05;            // le réseau s'enfonce entre les doigts à la prise (en unités)
const HANDS = ATLAS_HANDS.frames;
const CELL = ATLAS_HANDS.CELL;
// Traits de vitesse de l'image 7, dans le repère de la maquette (px Figma).
const SPEED = { x: 280, y: 205, height: 210 };

const outCubic = t => 1 - Math.pow(1 - t, 3);
const inQuad = t => t * t;

// Image de la main pilotée par le scroll.
const scrollFrame = a => (a < ELAN_AT ? 'rest' : a < ARME_AT ? 'elan' : 'arme');

// Mise en place du segment selon l'écran : échelle des mains (px écran par px
// Figma), repère de la maquette (ox, oy = coin haut-gauche de l'image de la
// main gauche), centre et unités du réseau (kx peut être un peu plus large
// que ky pour que le bout des doigts reste sous les bords du réseau).
function atlasLayout(w, h) {
    const mobile = w <= MOBILE_MAX;
    const s = Math.min(w / ATLAS_HANDS.FRAME.w, (h - ATLAS_TOP) / ATLAS_VIEW_H) * (mobile ? MOBILE_HAND : 1);
    const ky = NET_UNIT * s;
    const surplus = Math.max(0, h - ATLAS_TOP - ATLAS_VIEW_H * s);
    const cy = ATLAS_TOP + NET_ABOVE * ky + surplus * 0.3;
    const rest = HANDS.rest.grip;
    // Sur mobile, les avant-bras sortent davantage par les côtés : plus de
    // place pour le réseau entre les mains.
    const restX = (rest.col * CELL + CELL / 2) * s * (mobile ? 1 - MOBILE_REACH : 1);
    const kx = clamp((w / 2 - restX) / GRIP_AT / ky, 1, MAX_STRETCH) * ky;
    const ox = w / 2 - GRIP_AT * kx - (rest.col * CELL + CELL / 2) * s;
    const oy = cy + GRIP_BELOW * ky - (rest.row * CELL + CELL / 2) * s;
    return { s, kx, ky, cx: w / 2, cy, ox, oy };
}

// Point d'appui d'une image, main gauche, dans le repère de la maquette posé à l'écran.
function gripOf(L, frame) {
    const g = HANDS[frame].grip;
    return { x: L.ox + (g.col * CELL + CELL / 2) * L.s, y: L.oy + (g.row * CELL + CELL / 2) * L.s };
}

// Descente du réseau quand la main prend l'image `frame` (px écran).
const dropOf = (L, frame) => gripOf(L, frame).y - gripOf(L, 'rest').y;

// Descente pilotée par le scroll : le réseau glisse d'une image à l'autre
// autour de chaque seuil plutôt que de sauter.
function scrollDrop(L, a) {
    return mix(0, dropOf(L, 'elan'), ease(range(a, ELAN_AT - STEP_BLEND, ELAN_AT + STEP_BLEND))) +
        (dropOf(L, 'arme') - dropOf(L, 'elan')) * ease(range(a, ARME_AT - STEP_BLEND, ARME_AT + STEP_BLEND));
}

// Pose du segment Atlas à un instant : { a, mode, u } vient du contrôleur
// (mode : scroll | launch | launched | return ; u : ms depuis le début de la
// séquence temps réel). Fonction pure : renvoie le cadrage du réseau (net :
// part du recentrage, dy : décalage vertical), l'image des mains et leurs
// effets.
function atlasPose(L, { a, mode, u }) {
    const enter = ease(range(a, 0.02, ENTER_END));
    const pose = {
        net: ease(range(a, 0, ENTER_END)),
        enter,
        alpha: range(a, 0.02, 0.14),
        frame: scrollFrame(a),
        dy: scrollDrop(L, a) * enter,
        dissolve: 0, tint: 0, speed: 0
    };
    // Hauteur à parcourir pour que le réseau (halo compris) sorte par le haut.
    const away = L.cy + dropOf(L, 'prise') + 2.6 * L.ky;

    if (mode === 'launch' || mode === 'launched') {
        const t = mode === 'launched' ? LAUNCH_MS : u;
        const grip = dropOf(L, 'prise') + SINK * L.ky;
        if (t < PRISE_MS) {
            // Prise : les mains remontent en tenant le réseau.
            pose.frame = 'prise';
            pose.dy = mix(dropOf(L, 'arme'), grip, ease(t / PRISE_MS));
            pose.tint = 0.5 * t / PRISE_MS;
        } else {
            // Détente puis projection : départ très sec, puis sortie par le haut.
            pose.dy = grip - away * outCubic(range(t, PRISE_MS, PRISE_MS + THROW_MS));
            const since = t - PRISE_MS - DETENTE_MS;
            pose.frame = since < 0 ? 'detente' : 'projection';
            pose.tint = since < 0 ? 1 : mix(1, 0.4, range(since, 0, DISSOLVE_MS));
            pose.speed = since < 0 ? 1 : 1 - range(since, 0, PROJECTION_MS * 0.7);
            pose.dissolve = since < 0 ? 0 : range(since, 0, DISSOLVE_MS);
        }
    } else if (mode === 'return') {
        const base = 0, elan = dropOf(L, 'elan') * enter;
        if (u < RETURN_FALL) {
            // Le réseau retombe ; les mains se reforment, au repos.
            pose.frame = 'rest';
            pose.dy = mix(base - L.cy - 1.1 * L.ky, base, inQuad(u / RETURN_FALL));
            pose.dissolve = 1 - range(u, 0, RETURN_FALL * 0.85);
        } else if (u < RETURN_FALL + RETURN_CATCH) {
            // Amorti : les mains plient brièvement sous le choc.
            pose.frame = 'elan';
            pose.dy = mix(rest, elan, outCubic(range(u, RETURN_FALL, RETURN_FALL + RETURN_CATCH * 0.5)));
        } else {
            // Retour à la pose que donne le scroll.
            pose.dy = mix(elan, pose.dy, ease(range(u, RETURN_FALL + RETURN_CATCH, RETURN_MS)));
        }
    }
    return pose;
}

// Hasard reproductible : le réseau est le même à chaque visite.
function seeded(seed) {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function buildNetwork() {
    const rnd = seeded(20260);
    const nodes = [];
    LAYERS.forEach((count, layer) => {
        for (let i = 0; i < count; i++) {
            nodes.push({
                layer,
                // Position finale : une colonne par couche.
                lx: mix(-1, 1, layer / (LAYERS.length - 1)),
                ly: (i - (count - 1) / 2) * 0.3,
                // Position de départ : éparpillé.
                sx: mix(-1.7, 1.7, rnd()),
                sy: mix(-0.95, 0.95, rnd()),
                r: 2.4 + rnd() * 1.4,
                phase: rnd() * Math.PI * 2
            });
        }
    });

    const edges = [];
    for (const a of nodes) {
        for (const b of nodes) {
            if (b.layer === a.layer + 1) edges.push({ a, b, weight: rnd(), delay: rnd() });
        }
    }

    // Liens du réseau éparpillé du début, entre voisins proches.
    const loose = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const d = Math.hypot(nodes[i].sx - nodes[j].sx, nodes[i].sy - nodes[j].sy);
            if (d < 0.75) loose.push({ a: nodes[i], b: nodes[j], strength: 1 - d / 0.75 });
        }
    }

    const dust = Array.from({ length: DUST_COUNT }, () => ({
        x: mix(-2.4, 2.4, rnd()),
        y: mix(-1.5, 1.5, rnd()),
        z: mix(0.3, 1, rnd()),
        r: mix(0.6, 1.6, rnd())
    }));

    // Relais du néon : position le long du trajet (0 = bord gauche, 1 = noyau)
    // et petit écart vertical, pour une ligne qui ondule doucement.
    const relays = Array.from({ length: RELAYS }, (_, i) => ({
        at: (i + 1) / (RELAYS + 1) + mix(-0.04, 0.04, rnd()),
        dy: mix(-1, 1, rnd())
    }));

    return { nodes, edges, loose, dust, relays };
}

// Cadrage de chaque scène : le réseau se décale à l'opposé du texte.
const SHIFT_X = { 'bottom-left': 0.19, 'center-left': 0.2, 'bottom-right': -0.19, 'center-right': -0.2, 'bottom-center': 0, hero: 0 };

function cameraKeys(positions, mobile) {
    const last = positions.length - 1;
    return positions.map((pos, i) => ({
        at: (i + 0.5) / positions.length,
        x: mobile ? 0 : SHIFT_X[pos] ?? 0,
        // Sur mobile, le texte occupe le bas de l'écran : le réseau reste en haut.
        // La dernière scène a le texte le plus long : le réseau remonte et rétrécit.
        y: (mobile ? -0.24 : pos.startsWith('center') ? -0.02 : -0.07) - (i === last ? (mobile ? 0.02 : 0.2) : 0),
        zoom: i === last ? 0.82 : mix(0.85, 1, i / Math.max(1, last))
    }));
}

function cameraAt(keys, p) {
    if (p <= keys[0].at) return keys[0];
    const last = keys[keys.length - 1];
    if (p >= last.at) return last;
    const i = keys.findIndex(k => k.at > p) - 1;
    const a = keys[i], b = keys[i + 1];
    const t = ease((p - a.at) / (b.at - a.at));
    return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), zoom: mix(a.zoom, b.zoom, t) };
}

// introEnd : part de la progression occupée par les scènes d'ouverture. Pendant
// celles-ci, le réseau est un noyau lumineux qui s'ouvre ; les cinq temps du
// parcours se jouent ensuite sur le reste de la progression.
function createRenderer(canvas, positions, introEnd = 0) {
    const ctx = canvas.getContext('2d');
    const net = buildNetwork();
    const keys = { desktop: cameraKeys(positions, false), mobile: cameraKeys(positions, true) };
    // Calque des mains : elles y sont dessinées puis la coupe de l'avant-bras
    // (bord gauche de la maquette) y est fondue, avant de passer sur le canvas.
    // Créé à la première main dessinée : inutile en mouvement réduit.
    let layer = null, lctx = null, dpr = 1;
    let w = 0, h = 0;

    function sizeLayer() {
        layer.width = Math.round(w * dpr);
        layer.height = Math.round(h * dpr);
        lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (layer) sizeLayer();
    }

    // Les deux mains (la droite en miroir par rapport au centre de l'écran),
    // les traits de vitesse et le fondu de la coupe des avant-bras.
    function drawHands(L, pose) {
        if (pose.alpha <= 0 || pose.dissolve >= 1) return;
        if (!layer) {
            layer = document.createElement('canvas');
            lctx = layer.getContext('2d');
            sizeLayer();
        }
        const f = HANDS[pose.frame];
        const shift = -(1 - pose.enter) * (L.ox + (f.col0 + f.cols + 1) * CELL * L.s + 24);
        const rise = (1 - pose.enter) * h * 0.08;
        const g = gripOf(L, pose.frame);
        const opts = { scale: L.s, alpha: 1, tint: pose.tint, dissolve: pose.dissolve };
        lctx.clearRect(0, 0, w, h);
        drawHand(lctx, pose.frame, { ...opts, x: g.x + shift, y: g.y + rise });
        drawHand(lctx, pose.frame, { ...opts, x: w - g.x - shift, y: g.y + rise, mirror: true });

        const cut = L.ox + shift, fade = ARM_FADE * L.s;
        if (cut + fade > 0) {
            lctx.save();
            lctx.globalCompositeOperation = 'destination-out';
            for (const side of [1, -1]) {
                const from = side > 0 ? cut : w - cut, to = from + side * fade;
                const grad = lctx.createLinearGradient(from, 0, to, 0);
                grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                lctx.fillStyle = grad;
                lctx.fillRect(side > 0 ? -1 : to, 0, side > 0 ? to + 1 : w + 1 - to, h);
            }
            lctx.restore();
        }
        ctx.save();
        ctx.globalAlpha = pose.alpha;
        ctx.drawImage(layer, 0, 0, w, h);
        ctx.restore();

        if (pose.speed > 0) {
            drawSpeedLines(ctx, {
                x1: L.ox + SPEED.x * L.s,
                x2: w - L.ox - SPEED.x * L.s,
                y: L.oy + SPEED.y * L.s,
                height: SPEED.height * L.s,
                alpha: pose.speed * 0.9,
                scale: L.s
            });
        }
    }

    function circle(x, y, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    function line(x1, y1, x2, y2, color, width = 1) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Fil néon : un halo flou, puis un trait fin et clair au centre.
    function neon(points, alpha) {
        ctx.save();
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.beginPath();
        points.forEach((n, i) => (i ? ctx.lineTo(n.x, n.y) : ctx.moveTo(n.x, n.y)));
        ctx.shadowColor = rgba(CYAN, alpha);
        ctx.shadowBlur = 14;
        ctx.strokeStyle = rgba(CYAN, 0.75 * alpha);
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = rgba(mixColor(CYAN, [255, 255, 255], 0.55), 0.9 * alpha);
        ctx.lineWidth = 0.9;
        ctx.stroke();
        ctx.restore();
    }

    // Trajet du néon, du bord gauche au noyau, lissé en une courbe (Catmull-Rom).
    function feedPath(ox, oy, mobile) {
        const amp = mobile ? h * 0.01 : h * 0.03;
        const pts = [{ x: -10, y: oy + amp * 0.4 }];
        for (const r of net.relays) pts.push({ x: mix(-10, ox, r.at), y: oy + r.dy * amp, relay: true });
        pts.push({ x: ox, y: oy });
        const curve = [];
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
            for (let s = 0; s < 12; s++) {
                const u = s / 12, u2 = u * u, u3 = u2 * u;
                const f = (a, b, c, d) => 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (3 * b - a - 3 * c + d) * u3);
                curve.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) });
            }
        }
        curve.push(pts[pts.length - 1]);
        // Longueur cumulée, pour avancer à vitesse constante.
        let len = 0;
        curve.forEach((c, i) => { if (i) len += Math.hypot(c.x - curve[i - 1].x, c.y - curve[i - 1].y); c.d = len; });
        return { curve, len, relays: pts.filter(p => p.relay) };
    }

    function pointAt(path, d) {
        const c = path.curve;
        const i = Math.max(1, c.findIndex(p => p.d >= d));
        if (i < 0) return c[c.length - 1];
        const a = c[i - 1], b = c[i], u = clamp((d - a.d) / Math.max(1e-6, b.d - a.d));
        return { x: mix(a.x, b.x, u), y: mix(a.y, b.y, u) };
    }

    // Énergie du néon à l'instant `clock` (secondes depuis la fin de l'intro) :
    // drawn = part du trajet tracée, head = position de l'impulsion (ou -1),
    // charge = éclat du noyau (0 à 1).
    function feedState(clock) {
        if (clock === null) return { drawn: 0, head: -1, charge: 0 };
        if (clock === Infinity) return { drawn: 1, head: -1, charge: 0.25 };
        const c = clock - FEED_DELAY;
        if (c < 0) return { drawn: 0, head: -1, charge: 0 };
        const arrive = c / FEED_TRAVEL;
        if (arrive < 1) { const e = 1 - Math.pow(1 - arrive, 2); return { drawn: e, head: e, charge: 0 }; }
        const since = c - FEED_TRAVEL;
        const flash = Math.max(0, 1 - since / FEED_FLASH);
        // Ensuite, une petite impulsion par cycle, qui ravive un peu le noyau.
        const cycle = since % FEED_PULSE, travel = FEED_TRAVEL * 0.8;
        const head = since > FEED_FLASH && cycle < travel ? ease(cycle / travel) : -1;
        const pulseFlash = since > FEED_FLASH && cycle >= travel ? Math.max(0, 1 - (cycle - travel) / 0.7) * 0.4 : 0;
        return { drawn: 1, head, charge: Math.max(flash, pulseFlash, 0.25) };
    }

    // atlas : état du segment Atlas ({ a, mode, u }, voir atlasPose), ou null.
    function draw(t, clock = Infinity, atlas = null) {
        ctx.clearRect(0, 0, w, h);
        if (!w || !h) return;

        // t : progression des scènes, sur [0, 1] ; p : celle du parcours seul.
        const p = introEnd ? range(t, introEnd, 1) : t;
        const intro = introEnd ? ease(range(t, introEnd * 0.15, introEnd)) : 1;
        // Néon d'arrivée : seulement sur l'accueil, il s'efface dès qu'on défile.
        const feedAlpha = introEnd ? 1 - range(t, 0.005, introEnd * 0.45) : 0;
        const feed = feedAlpha > 0 ? feedState(clock) : { drawn: 0, head: -1, charge: 0 };

        const mobile = w <= MOBILE_MAX;
        const unit = mobile ? Math.min(w * 0.32, h * 0.15) : Math.min(w * 0.2, h * 0.25);
        const cam = cameraAt(mobile ? keys.mobile : keys.desktop, t);
        let cx = w / 2 + cam.x * w;
        let cy = h / 2 + cam.y * h;
        let k = unit * cam.zoom, kx = k;
        // Segment Atlas : le réseau se recadre au-dessus des mains et suit le
        // bout de leurs doigts.
        const L = atlas && (atlas.a > 0 || atlas.mode !== 'scroll') ? atlasLayout(w, h) : null;
        const pose = L ? atlasPose(L, atlas) : null;
        if (pose) {
            cx = mix(cx, L.cx, pose.net);
            cy = mix(cy, L.cy, pose.net) + pose.dy;
            kx = mix(k, L.kx, pose.net);
            k = mix(k, L.ky, pose.net);
        }
        const toScreen = (x, y) => [cx + x * kx, cy + y * k];

        // Phases (voir l'en-tête du fichier).
        const gather = p0 => ease(range(p, 0.13 + p0, 0.31 + p0));
        const looseAlpha = 1 - range(p, 0.1, 0.24);
        const labelsAlpha = range(p, 0.3, 0.38) * (1 - range(p, 0.86, 0.94));
        const box = ease(range(p, 0.42, 0.55));
        const boxFade = (1 - 0.6 * range(p, 0.62, 0.7)) * (1 - range(p, 0.8, 0.88));
        const signalsOn = range(p, 0.57, 0.61) * (1 - range(p, 0.81, 0.85));
        const front = (range(p, 0.57, 0.85) * 3 % 1) * (LAYERS.length + 0.4) - 0.7;
        const finale = ease(range(p, 0.82, 0.97));
        const tint = mixColor(VIOLET, CYAN, finale * 0.7);

        // Poussière en arrière-plan : elle glisse avec le scroll, plus vite au premier plan.
        for (const d of net.dust) {
            const x = (((d.x - t * 1.2 * d.z + 2.4) % 4.8) + 4.8) % 4.8 - 2.4;
            const sx = w / 2 + cam.x * w * d.z + x * unit * 1.1;
            const sy = h / 2 + cam.y * h * d.z + d.y * unit;
            circle(sx, sy, d.r, rgba(VIOLET, 0.08 + 0.22 * d.z));
        }

        // Neurones : d'un noyau serré (ouverture) à l'éparpillement, puis aux
        // colonnes, avec une légère respiration.
        const spread = mix(0.04, 1, intro);
        for (const n of net.nodes) {
            const m = gather(n.layer * 0.025);
            const breathe = Math.sin(t * 14 + n.phase) * 0.025 * Math.max(m, 1 - intro);
            [n.x, n.y] = toScreen(mix(n.sx * spread, n.lx, m), mix(n.sy * spread, n.ly, m) + breathe);
            const wave = signalsOn * Math.max(0, 1 - Math.abs(front - n.layer) * 1.4);
            n.glow = Math.max(wave, finale * 0.8, (1 - intro) * mix(0.45, 1, feed.charge * feedAlpha));
        }

        // Ouverture : un halo autour du noyau, qui s'éteint en s'ouvrant.
        if (intro < 1) {
            const [ox, oy] = toScreen(0, 0);
            const radius = k * mix(0.5, 1.4, intro);
            const halo = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
            halo.addColorStop(0, rgba(VIOLET, 0.066 * (1 - intro)));
            halo.addColorStop(1, rgba(VIOLET, 0));
            ctx.fillStyle = halo;
            ctx.fillRect(ox - radius, oy - radius, radius * 2, radius * 2);
        }

        if (feedAlpha > 0 && feed.drawn > 0) {
            const [ox, oy] = toScreen(0, 0);
            // Le néon se branche sur le neurone le plus à gauche du noyau.
            const entry = net.nodes.reduce((a, b) => (b.x < a.x ? b : a));
            const path = feedPath(entry.x, entry.y, mobile);
            const end = feed.drawn * path.len;
            const pts = path.curve.filter(c => c.d < end);
            pts.push(pointAt(path, end));
            neon(pts, feedAlpha * 0.9);

            // Relais : ils s'allument au passage du néon.
            for (const r of path.relays) {
                const d = path.curve.reduce((best, c) => (Math.abs(c.x - r.x) < Math.abs(best.x - r.x) ? c : best)).d;
                const lit = d <= end ? 1 : 0.25;
                circle(r.x, r.y, 5, rgba(CYAN, 0.14 * lit * feedAlpha));
                circle(r.x, r.y, 1.9, rgba(CYAN, 0.9 * lit * feedAlpha));
            }

            // L'impulsion, en tête.
            if (feed.head >= 0) {
                const hp = pointAt(path, feed.head * path.len);
                circle(hp.x, hp.y, 10, rgba(CYAN, 0.18 * feedAlpha));
                circle(hp.x, hp.y, 2.6, rgba([235, 252, 255], feedAlpha));
            }

            // Le noyau chargé : un éclat cyan qui s'ouvre puis retombe.
            if (feed.charge > 0) {
                const radius = k * mix(0.45, 1.1, feed.charge);
                const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
                glow.addColorStop(0, rgba(CYAN, 0.096 * feed.charge * feedAlpha));
                glow.addColorStop(1, rgba(CYAN, 0));
                ctx.fillStyle = glow;
                ctx.fillRect(ox - radius, oy - radius, radius * 2, radius * 2);
            }
        }

        if (looseAlpha > 0) {
            for (const l of net.loose) {
                line(l.a.x, l.a.y, l.b.x, l.b.y, rgba(VIOLET, l.strength * 0.4 * looseAlpha));
            }
        }

        // Conteneur : un cadre qui se trace autour du réseau.
        if (box > 0) {
            const [x1, y1] = toScreen(-1.35, -1.05);
            const [x2, y2] = toScreen(1.35, 1.2);
            const perimeter = 2 * (x2 - x1 + y2 - y1);
            ctx.save();
            ctx.setLineDash([perimeter * box, perimeter]);
            ctx.strokeStyle = rgba(GREEN, 0.5 * boxFade);
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(x1, y1, x2 - x1, y2 - y1, 14);
            else ctx.rect(x1, y1, x2 - x1, y2 - y1);
            ctx.stroke();
            ctx.restore();

            ctx.font = `500 ${mobile ? 10 : 11}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'left';
            ctx.fillStyle = rgba(GREEN, box * boxFade * 0.9);
            ctx.fillText('docker · kubernetes · ci/cd', x1 + 4, y1 - 10);
        }

        // Connexions : elles se tracent couche après couche.
        for (const e of net.edges) {
            const start = 0.27 + e.a.layer * 0.04 + e.delay * 0.05;
            const grow = ease(range(p, start, start + 0.08));
            if (grow <= 0) continue;
            const x = mix(e.a.x, e.b.x, grow);
            const y = mix(e.a.y, e.b.y, grow);
            const lit = Math.min(e.a.glow, e.b.glow);
            const alpha = (0.07 + e.weight * 0.2) * (1 + finale * 0.5) + lit * 0.25;
            line(e.a.x, e.a.y, x, y, rgba(mixColor(tint, CYAN, lit), alpha));
        }

        // Signaux : des vagues qui traversent le réseau de gauche à droite.
        if (signalsOn > 0) {
            for (const e of net.edges) {
                if (e.weight < 0.4) continue;
                const t = front - e.a.layer;
                if (t < 0 || t > 1) continue;
                const x = mix(e.a.x, e.b.x, t);
                const y = mix(e.a.y, e.b.y, t);
                circle(x, y, 5, rgba(CYAN, 0.22 * signalsOn));
                circle(x, y, 1.8, rgba(CYAN, 0.95 * signalsOn));
            }
        }

        // Final : un halo et des ondes au centre du réseau.
        if (finale > 0) {
            const [ox, oy] = toScreen(0, 0);
            const radius = k * (0.8 + 1.2 * finale);
            const halo = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
            halo.addColorStop(0, rgba(CYAN, 0.16 * finale));
            halo.addColorStop(1, rgba(CYAN, 0));
            ctx.fillStyle = halo;
            ctx.fillRect(ox - radius, oy - radius, radius * 2, radius * 2);

            const rings = range(p, 0.86, 1) * 2;
            for (let j = 0; j < 2; j++) {
                const q = (rings + j * 0.5) % 1;
                ctx.strokeStyle = rgba(GREEN, (1 - q) * 0.35 * finale);
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(ox, oy, k * (0.6 + q * 1.8), 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // Lancer et retour : une traînée de points verticale derrière chaque
        // neurone, d'autant plus longue que le réseau va vite.
        if (pose && (atlas.mode === 'launch' || atlas.mode === 'return')) {
            const before = atlasPose(L, { ...atlas, u: Math.max(0, atlas.u - TRAIL_MS) });
            const speed = before.dy - pose.dy; // > 0 : le réseau monte
            const len = Math.min(Math.abs(speed) * 1.6, h * 0.45);
            const step = CELL * L.s * 1.5;
            if (len > step) {
                const dir = Math.sign(speed);
                const dots = Math.floor(len / step);
                const size = Math.max(1.2, 2.6 * L.s);
                for (let j = 1; j <= dots; j++) {
                    ctx.fillStyle = rgba(mixColor(VIOLET, CYAN, pose.tint), 0.75 * (1 - j / (dots + 1)));
                    for (const n of net.nodes) ctx.fillRect(n.x - size / 2, n.y + dir * j * step - size / 2, size, size);
                }
            }
        }

        for (const n of net.nodes) {
            const out = n.layer === LAYERS.length - 1 ? finale : 0;
            const color = mixColor(mixColor(tint, CYAN, n.glow), GREEN, out);
            const alpha = mix(0.55, 1, range(p, 0, 0.15));
            if (n.glow > 0.05) circle(n.x, n.y, n.r + 8 * n.glow, rgba(color, n.glow * 0.2));
            circle(n.x, n.y, n.r + n.glow * 1.5, rgba(color, alpha));
        }

        if (labelsAlpha > 0) {
            ctx.font = `500 ${mobile ? 10 : 11}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.fillStyle = rgba(MUTED, labelsAlpha * 0.85);
            LAYER_LABELS.forEach((label, layer) => {
                const [x, y] = toScreen(mix(-1, 1, layer / (LAYERS.length - 1)), 1.0);
                ctx.fillText(label, x, y);
            });
        }

        if (pose) drawHands(L, pose);
    }

    return { resize, draw };
}

// Opacité d'une scène de texte : la première est visible dès le départ,
// la dernière reste affichée jusqu'à la fin.
function sceneOpacity(i, count, p) {
    const from = i / count;
    const to = (i + 1) / count;
    const fadeIn = i === 0 ? 1 : range(p, from + 0.01, from + 0.01 + SCENE_FADE);
    const fadeOut = i === count - 1 ? 1 : 1 - range(p, to - SCENE_FADE, to);
    return Math.min(fadeIn, fadeOut);
}

export function initStory() {
    const section = document.getElementById('story');
    if (!section) return;
    const stage = section.querySelector('.story-stage');
    const canvas = section.querySelector('.story-canvas');
    const scenes = [...section.querySelectorAll('.story-scene')];
    const counter = section.querySelector('[data-story-count]');
    const hint = section.querySelector('.story-hint');
    const skip = section.querySelector('.story-skip');
    const introCount = scenes.filter(s => s.classList.contains('is-intro')).length;
    const renderer = createRenderer(
        canvas,
        scenes.map(s => s.className.match(/pos-([\w-]+)/)?.[1] ?? 'bottom-left'),
        introCount / scenes.length
    );

    // Mouvement réduit : pas de scène collée, les textes s'empilent et le
    // canvas reste figé sur l'image finale, en décor.
    if (prefersReducedMotion()) {
        section.classList.add('is-static');
        const still = () => { renderer.resize(); renderer.draw(0.93); };
        still();
        new ResizeObserver(still).observe(stage);
        return;
    }

    let target = 0, current = 0, frame = 0, last = 0, visible = false;
    const introEnd = introCount / scenes.length;

    // Segment Atlas : il allonge la section ; storyEnd = part de la progression
    // occupée par les scènes (recalculée à chaque mesure).
    section.style.setProperty('--story-atlas', `${ATLAS_SPAN * 100}svh`);
    let storyEnd = 1;
    const sceneProgress = t => clamp(t / storyEnd);
    const atlasProgress = t => (storyEnd < 1 ? range(t, storyEnd, 1) : 0);

    // Séquences temps réel du segment : le lancer (launch → launched) et le
    // retour (return → scroll). atlasStart : début de la séquence en cours.
    let atlasMode = 'scroll', atlasStart = 0;
    const atlasBusy = () => atlasMode === 'launch' || atlasMode === 'return';
    function atlasState(t) {
        const a = atlasProgress(t);
        const now = performance.now();
        if (atlasMode === 'launch' && now - atlasStart >= LAUNCH_MS) atlasMode = 'launched';
        if (atlasMode === 'return' && now - atlasStart >= RETURN_MS) atlasMode = 'scroll';
        if (atlasMode === 'scroll' && a >= LAUNCH_AT) {
            atlasMode = 'launch';
            atlasStart = now;
        } else if ((atlasMode === 'launch' || atlasMode === 'launched') && a < RETURN_AT) {
            // Réseau encore en main, ou retour à la scène 5 : pas de chute.
            const inHand = atlasMode === 'launch' && now - atlasStart < PRISE_MS + DETENTE_MS;
            atlasMode = inHand || a < 0.02 ? 'scroll' : 'return';
            atlasStart = now;
        }
        if (atlasMode === 'return' && a < 0.02) atlasMode = 'scroll';
        return { a, mode: atlasMode, u: now - atlasStart };
    }
    // Saut sans animation (hors écran, chargement) : on se cale sur l'état final.
    function settleAtlas() {
        const a = atlasProgress(target);
        if (a >= LAUNCH_AT) atlasMode = 'launched';
        else if (a < RETURN_AT || atlasMode === 'scroll') atlasMode = 'scroll';
    }

    // Horloge du néon d'arrivée : elle démarre à la fin de l'intro, ou tout de
    // suite si l'intro ne se joue pas.
    let feedStart = null;
    const feedClock = () => (feedStart === null ? null : (performance.now() - feedStart) / 1000);
    // Tant que l'accueil est à l'écran, le néon s'anime même sans scroll.
    // Idem pendant le lancer et le retour des mains d'Atlas.
    const live = () => visible && !document.hidden &&
        ((feedStart !== null && sceneProgress(current) < introEnd * 0.45) || atlasBusy());
    function startFeed() {
        if (feedStart !== null) return;
        feedStart = performance.now();
        wake();
    }
    let active = -1;
    const opacities = scenes.map(() => -1);

    const scrollLength = () => section.offsetHeight - stage.offsetHeight;

    function measure() {
        const rect = section.getBoundingClientRect();
        const total = scrollLength();
        target = total > 0 ? clamp(-rect.top / total) : 0;
        storyEnd = total > 0 ? clamp(1 - stage.offsetHeight * ATLAS_SPAN / total, 0.01) : 1;
        visible = rect.bottom > 0 && rect.top < window.innerHeight;
    }

    // t : progression de toute la section ; p : celle des scènes, sur [0, storyEnd].
    function update(t) {
        const p = sceneProgress(t);
        const atlas = atlasState(t);
        renderer.draw(p, feedClock(), atlas);
        stage.style.setProperty('--story-progress', `${(p * 100).toFixed(2)}%`);

        // Le texte de la dernière scène s'efface en montant quand les mains arrivent.
        const leave = range(atlas.a, 0, 0.12);
        let best = 0;
        scenes.forEach((scene, i) => {
            const isLast = i === scenes.length - 1;
            const fade = isLast ? 1 - leave : 1;
            const shown = Math.round(sceneOpacity(i, scenes.length, p) * 1000) / 1000;
            const o = Math.round(shown * fade * 1000) / 1000;
            if (shown > sceneOpacity(best, scenes.length, p)) best = i;
            if (o === opacities[i]) return;
            opacities[i] = o;
            scene.style.opacity = o;
            const dy = isLast && leave > 0 ? -leave * 24 : (1 - o) * 20;
            scene.style.transform = `translateY(${dy.toFixed(1)}px)`;
            scene.classList.toggle('is-active', o > 0.5);
        });

        if (best !== active) {
            active = best;
            counter.textContent = String(best + 1).padStart(2, '0');
        }
        hint.style.opacity = 1 - range(p, 0, 0.025);
        skip.classList.toggle('is-hidden', p > 0.9);
    }

    function tick(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        current += (target - current) * (1 - Math.exp(-SMOOTHING * dt));
        if (Math.abs(target - current) < 0.0004) current = target;
        update(current);
        frame = current === target && !live() ? 0 : requestAnimationFrame(tick);
    }

    function wake() {
        measure();
        // Hors de l'écran, inutile de dessiner : on se cale directement.
        if (!visible) { current = target; settleAtlas(); return; }
        if (!frame && current === target && !live()) return;
        if (!frame) {
            last = performance.now();
            frame = requestAnimationFrame(tick);
        }
    }

    // Un focus clavier dans une scène cachée (bouton de la dernière scène)
    // amène le scroll jusqu'à cette scène pour qu'elle soit visible.
    section.addEventListener('focusin', e => {
        const scene = e.target.closest('.story-scene');
        if (!scene) return;
        const i = Number(scene.dataset.scene);
        const p = (i === scenes.length - 1 ? 0.97 : (i + 0.5) / scenes.length) * storyEnd;
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + scrollLength() * p, behavior: 'auto' });
    });

    new ResizeObserver(() => {
        renderer.resize();
        measure();
        current = target;
        update(current);
        wake();
    }).observe(stage);

    if (document.documentElement.classList.contains('intro-playing')) {
        window.addEventListener('intro:end', startFeed, { once: true });
    } else {
        requestAnimationFrame(startFeed);
    }
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    renderer.resize();
    measure();
    current = target;
    settleAtlas();
    update(current);
}
