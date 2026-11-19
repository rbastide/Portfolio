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
// La progression affichée rattrape le scroll avec un léger retard : c'est ce
// qui donne de l'inertie au mouvement.
import { prefersReducedMotion } from '../utils/dom.js';

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
    let w = 0, h = 0;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

    function draw(t, clock = Infinity) {
        ctx.clearRect(0, 0, w, h);
        if (!w || !h) return;

        // t : progression de toute la section ; p : progression du parcours seul.
        const p = introEnd ? range(t, introEnd, 1) : t;
        const intro = introEnd ? ease(range(t, introEnd * 0.15, introEnd)) : 1;
        // Néon d'arrivée : seulement sur l'accueil, il s'efface dès qu'on défile.
        const feedAlpha = introEnd ? 1 - range(t, 0.005, introEnd * 0.45) : 0;
        const feed = feedAlpha > 0 ? feedState(clock) : { drawn: 0, head: -1, charge: 0 };

        const mobile = w <= MOBILE_MAX;
        const unit = mobile ? Math.min(w * 0.32, h * 0.15) : Math.min(w * 0.2, h * 0.25);
        const cam = cameraAt(mobile ? keys.mobile : keys.desktop, t);
        const cx = w / 2 + cam.x * w;
        const cy = h / 2 + cam.y * h;
        const k = unit * cam.zoom;
        const toScreen = (x, y) => [cx + x * k, cy + y * k];

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

    // Horloge du néon d'arrivée : elle démarre à la fin de l'intro, ou tout de
    // suite si l'intro ne se joue pas.
    let feedStart = null;
    const feedClock = () => (feedStart === null ? null : (performance.now() - feedStart) / 1000);
    // Tant que l'accueil est à l'écran, le néon s'anime même sans scroll.
    const live = () => feedStart !== null && visible && !document.hidden && current < introEnd * 0.45;
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
        visible = rect.bottom > 0 && rect.top < window.innerHeight;
    }

    function update(p) {
        renderer.draw(p, feedClock());
        stage.style.setProperty('--story-progress', `${(p * 100).toFixed(2)}%`);

        let best = 0;
        scenes.forEach((scene, i) => {
            const o = Math.round(sceneOpacity(i, scenes.length, p) * 1000) / 1000;
            if (o > sceneOpacity(best, scenes.length, p)) best = i;
            if (o === opacities[i]) return;
            opacities[i] = o;
            scene.style.opacity = o;
            scene.style.transform = `translateY(${((1 - o) * 20).toFixed(1)}px)`;
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
        if (!visible) { current = target; return; }
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
        const p = i === scenes.length - 1 ? 0.97 : (i + 0.5) / scenes.length;
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + scrollLength() * p, behavior: 'auto' });
    });

    new ResizeObserver(() => {
        renderer.resize();
        measure();
        current = target;
        update(current);
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
    update(current);
}
