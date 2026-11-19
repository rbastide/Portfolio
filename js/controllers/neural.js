// ============================================
// CONTRÔLEUR — Réseau de neurones en fond de page
// ============================================
// Des neurones dérivent lentement derrière toute la page ; ceux qui sont proches
// se relient. De temps en temps, un signal part d'un neurone et suit une
// connexion jusqu'à son voisin, qui peut le relayer à son tour. La souris
// agit comme un neurone de plus : elle se relie à ceux qui l'entourent.
// Les cadres néon (.neon-frame : à propos, contact) sont alimentés par le
// réseau : quand l'un d'eux est à l'écran, les neurones proches s'y relient,
// et des impulsions partent vers son contour, qui s'éclaire à leur arrivée.
// Rien n'est dessiné sous les cadres, et les neurones qui s'y trouvent en
// sont chassés à son arrivée quand il y a de la place autour, pour ne pas
// gêner la lecture. Quand un cadre arrive au milieu de l'écran, quelques neurones
// se rassemblent à côté en un gros neurone, qui le recharge d'un faisceau
// d'impulsions, puis se sépare.
// Le canvas est fixe : il couvre l'écran et le contenu défile par-dessus.
// L'animation s'arrête quand l'onglet est caché.
import { prefersReducedMotion } from '../utils/dom.js';

const LINK_DISTANCE = 150;      // au-delà, deux neurones ne sont plus reliés
const POINTER_DISTANCE = 190;   // rayon d'influence de la souris
const AREA_PER_NODE = 14000;    // densité : un neurone pour X px²
const MAX_NODES = 90;
const SPEED = 0.18;             // dérive en px par image
const SIGNAL_SPEED = 0.022;     // part d'une connexion parcourue par image
const SIGNAL_RATE = 0.035;      // probabilité qu'un signal parte à chaque image
const MAX_SIGNALS = 14;

// Alimentation des cadres néon.
const FEED_LINK = 140;          // un neurone plus proche que ça se relie au cadre
const EJECT_ROOM = 100;
const EJECT_TIME = 90;          // images pendant lesquelles un cadre qui arrive chasse les neurones         // place minimale dehors pour expulser un neurone caché
const FEED_RANGE = 280;         // distance maximale d'où part une impulsion
const FEED_RATE = 0.08;         // probabilité qu'une impulsion parte à chaque image
const FEED_SPEED = 0.03;
const MAX_FEEDS = 6;
const HUB_SIZE = 7;             // petits neurones qui forment le gros neurone
const HUB_GATHER = 70;          // images pour se rassembler
const HUB_CHARGE = 210;         // images de recharge du cadre
const HUB_FADE = 40;            // images pour se séparer
const HUB_PULSE = 20;           // une impulsion du faisceau toutes les X images
const HUB_OFFSET = 40;          // distance entre le gros neurone et le cadre

// Couleurs du thème (base.css) : lignes violettes, signaux cyan.
const LINE = [208, 188, 255];
const SIGNAL = [76, 215, 246];
const rgba = ([r, g, b], a) => `rgba(${r}, ${g}, ${b}, ${a})`;

// Couleur --neon d'un cadre, en [r, g, b] (repli : cyan).
function neonColor(el) {
    const value = getComputedStyle(el).getPropertyValue('--neon').trim();
    const hex = value.match(/^#([0-9a-f]{6})$/i);
    if (hex) return [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16));
    const rgb = value.match(/\d+(\.\d+)?/g);
    return rgb && rgb.length >= 3 ? rgb.slice(0, 3).map(Number) : SIGNAL;
}

// Point du contour d'un rectangle le plus proche de (x, y), et sa distance
// (négative si le point est à l'intérieur).
function closestOnBorder(r, x, y) {
    const inside = x > r.left && x < r.right && y > r.top && y < r.bottom;
    if (!inside) {
        const px = Math.min(r.right, Math.max(r.left, x));
        const py = Math.min(r.bottom, Math.max(r.top, y));
        return { x: px, y: py, d: Math.hypot(px - x, py - y) };
    }
    const edges = [
        { x, y: r.top, d: y - r.top }, { x, y: r.bottom, d: r.bottom - y },
        { x: r.left, y, d: x - r.left }, { x: r.right, y, d: r.right - x }
    ];
    const e = edges.reduce((a, b) => (b.d < a.d ? b : a));
    return { x: e.x, y: e.y, d: -e.d };
}

// Un neurone caché derrière un cadre ne l'alimente pas.
const insideAny = (frames, n) => frames.some(f => n.x > f.rect.left && n.x < f.rect.right && n.y > f.rect.top && n.y < f.rect.bottom);

function createNodes(width, height) {
    const count = Math.min(MAX_NODES, Math.round((width * height) / AREA_PER_NODE));
    return Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = SPEED * (0.4 + Math.random() * 0.6);
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: 1.2 + Math.random() * 1.4,
            glow: 0 // s'illumine quand un signal arrive
        };
    });
}

// Voisins reliés d'un neurone, du plus proche au plus lointain.
function neighbours(nodes, node) {
    return nodes
        .filter(n => n !== node && Math.hypot(n.x - node.x, n.y - node.y) < LINK_DISTANCE)
        .sort((a, b) => Math.hypot(a.x - node.x, a.y - node.y) - Math.hypot(b.x - node.x, b.y - node.y));
}

export function initNeuralNetwork() {
    const canvas = document.createElement('canvas');
    canvas.className = 'neural-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let width = 0, height = 0, nodes = [], signals = [];
    let pointer = null, frame = null;
    let frames = [], framesAge = Infinity, feeds = [], hubs = [], tick = 0;

    // Cadres néon à l'écran, avec leur rectangle et leur couleur.
    function visibleFrames() {
        if (++framesAge > 60) {
            framesAge = 0;
            const known = new Map(frames.map(f => [f.el, f]));
            frames = [...document.querySelectorAll('.neon-frame')].map(el => known.get(el) ?? { el, color: null });
        }
        const out = [];
        for (const f of frames) {
            const r = f.el.getBoundingClientRect();
            // Hors de l'écran : on oublie son rectangle, pour ne pas le masquer à tort.
            if (r.bottom < 0 || r.top > height || r.width === 0) { f.rect = null; continue; }
            f.rect = r;
            f.color ??= neonColor(f.el);
            out.push(f);
        }
        return out;
    }

    // Le contour du cadre s'éclaire brièvement à l'arrivée d'une impulsion.
    function flash(el, strength = 1.9) {
        if (el.dataset.fed || !el.animate) return;
        el.dataset.fed = '1';
        try {
            el.animate(
                [{ filter: `brightness(${strength}) saturate(1.3)` }, { filter: 'brightness(1)' }],
                { duration: 650, easing: 'ease-out', pseudoElement: '::after' }
            ).finished.finally(() => delete el.dataset.fed);
        } catch { delete el.dataset.fed; }
    }

    // Les quatre emplacements possibles du gros neurone, autour du cadre.
    function spots(r) {
        const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
        return [
            { x: r.right + HUB_OFFSET, y: cy }, { x: r.left - HUB_OFFSET, y: cy },
            { x: cx, y: r.bottom + HUB_OFFSET }, { x: cx, y: r.top - HUB_OFFSET }
        ];
    }

    // Le premier emplacement à l'écran et hors des autres cadres (ou -1).
    function hubSide(f, lit) {
        return spots(f.rect).findIndex(p =>
            p.x > 16 && p.x < width - 16 && p.y > 70 && p.y < height - 16 &&
            !lit.some(o => p.x > o.rect.left - 14 && p.x < o.rect.right + 14 && p.y > o.rect.top - 14 && p.y < o.rect.bottom + 14));
    }

    const spotAt = hub => spots(hub.frame.rect)[hub.side];

    function createHub(f, lit) {
        const side = hubSide(f, lit);
        if (side < 0) return;
        const hub = { frame: f, side, age: 0, pulses: [], members: [] };
        const spot = spotAt(hub);
        hub.members = nodes
            .filter(n => !n.hub && !n.hidden)
            .sort((a, b) => Math.hypot(a.x - spot.x, a.y - spot.y) - Math.hypot(b.x - spot.x, b.y - spot.y))
            .slice(0, HUB_SIZE);
        hub.members.forEach((n, i) => { n.hub = hub; n.slot = (i / HUB_SIZE) * Math.PI * 2; });
        hubs.push(hub);
    }

    // Les petits neurones repartent chacun de leur côté.
    function releaseHub(hub) {
        for (const n of hub.members) {
            const a = Math.random() * Math.PI * 2;
            n.vx = Math.cos(a) * 2.4;
            n.vy = Math.sin(a) * 2.4;
            n.kick = 45;
            n.hub = null;
        }
    }

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        nodes = createNodes(width, height);
        signals = [];
        feeds = [];
        hubs = [];
    }

    function step() {
        const lit = visibleFrames();
        tick++;

        // Un cadre qui arrive au milieu de l'écran appelle un gros neurone.
        for (const f of frames) {
            const centered = lit.includes(f) && f.rect.top < height * 0.7 && f.rect.bottom > height * 0.3;
            if (centered && !f.centered) {
                f.clearUntil = tick + EJECT_TIME;
                if (!hubs.some(h => h.frame === f)) createHub(f, lit);
            }
            f.centered = centered;
        }
        hubs = hubs.filter(hub => {
            hub.age++;
            const end = HUB_GATHER + HUB_CHARGE;
            if (!lit.includes(hub.frame) || hub.age > end + HUB_FADE) { releaseHub(hub); return false; }
            // Recharge : des impulsions partent du gros neurone vers le cadre.
            if (hub.age > HUB_GATHER && hub.age < end && (hub.age - HUB_GATHER) % HUB_PULSE === 0) hub.pulses.push(0);
            hub.pulses = hub.pulses.map(t => t + 0.05).filter(t => {
                if (t < 1) return true;
                flash(hub.frame.el, 2.6);
                return false;
            });
            return true;
        });

        for (const n of nodes) {
            n.hidden = insideAny(lit, n);
            // Les neurones du gros neurone tournent serrés autour de son centre.
            if (n.hub) {
                const spot = spotAt(n.hub);
                const spin = n.slot + n.hub.age * 0.03;
                n.x += (spot.x + Math.cos(spin) * 6 - n.x) * 0.07;
                n.y += (spot.y + Math.sin(spin) * 6 - n.y) * 0.07;
                n.glow = Math.max(n.glow, 0.8);
                continue;
            }
            // Derrière un cadre, le neurone est poussé dehors par le bord le plus
            // proche, s'il y a de la place de l'autre côté (sinon il reste caché :
            // rien n'est dessiné sous les cadres).
            n.ejecting = false;
            if (n.hidden) {
                const over = lit.find(f => n.x > f.rect.left && n.x < f.rect.right && n.y > f.rect.top && n.y < f.rect.bottom);
                const c = closestOnBorder(over.rect, n.x, n.y);
                const d = Math.max(1, -c.d);
                const ux = (c.x - n.x) / d, uy = (c.y - n.y) / d;
                const out = { x: c.x + ux * EJECT_ROOM, y: c.y + uy * EJECT_ROOM };
                if (tick < (over.clearUntil || 0) && out.x > 0 && out.x < width && out.y > 0 && out.y < height && !insideAny(lit, out)) {
                    n.ejecting = true;
                    n.kick = 45; // élan après la sortie, pour ne pas rester collé au bord
                    n.vx += ux * 0.15;
                    n.vy += uy * 0.15;
                }
            }
            // Vitesse bornée, sauf pendant l'expulsion et l'élan qui la suit.
            n.kick = Math.max(0, (n.kick || 0) - 1);
            const v = Math.hypot(n.vx, n.vy), max = n.ejecting ? 3 : SPEED * 1.3 + 2.2 * (n.kick / 45);
            if (v > max) { n.vx *= max / v; n.vy *= max / v; }

            n.x += n.vx;
            n.y += n.vy;
            // Rebond doux sur les bords plutôt qu'une téléportation.
            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;
            n.glow *= 0.94;
        }

        if (signals.length < MAX_SIGNALS && Math.random() < SIGNAL_RATE && nodes.length) {
            const from = nodes[Math.floor(Math.random() * nodes.length)];
            const [to] = neighbours(nodes, from);
            if (to) signals.push({ from, to, t: 0, hops: 2 + Math.floor(Math.random() * 3) });
        }

        // Impulsions vers les cadres : d'un neurone proche vers le contour.
        if (lit.length && feeds.length < MAX_FEEDS && Math.random() < FEED_RATE) {
            const f = lit[Math.floor(Math.random() * lit.length)];
            let best = null, bestD = FEED_RANGE;
            for (const n of nodes) {
                const d = closestOnBorder(f.rect, n.x, n.y).d;
                if (!n.hidden && !n.hub && d > 0 && d < bestD && !feeds.some(e => e.node === n)) { best = n; bestD = d; }
            }
            if (best) feeds.push({ node: best, frame: f, t: 0 });
        }
        feeds = feeds.filter(e => {
            if (!e.frame.rect) return false; // le cadre a quitté l'écran
            e.t += FEED_SPEED;
            if (e.t < 1) return true;
            flash(e.frame.el);
            return false;
        });

        signals = signals.filter(s => {
            s.t += SIGNAL_SPEED;
            if (s.t < 1) return true;
            s.to.glow = 1;
            // Le neurone atteint relaie parfois le signal vers un autre voisin.
            if (--s.hops > 0) {
                const next = neighbours(nodes, s.to).find(n => n !== s.from);
                if (next) Object.assign(s, { from: s.to, to: next, t: 0 });
                return Boolean(next);
            }
            return false;
        });
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 1;

        // Rien n'est dessiné sous les cadres néon : le texte reste lisible.
        const lit = frames.filter(f => f.rect && f.rect.bottom > 0 && f.rect.top < height);
        ctx.save();
        if (lit.length) {
            ctx.beginPath();
            ctx.rect(0, 0, width, height);
            for (const f of lit) ctx.rect(f.rect.left + 1, f.rect.top + 1, f.rect.width - 2, f.rect.height - 2);
            ctx.clip('evenodd');
        }

        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d >= LINK_DISTANCE) continue;
                ctx.strokeStyle = rgba(LINE, (1 - d / LINK_DISTANCE) * 0.24);
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }

            if (pointer) {
                const d = Math.hypot(a.x - pointer.x, a.y - pointer.y);
                if (d < POINTER_DISTANCE) {
                    ctx.strokeStyle = rgba(SIGNAL, (1 - d / POINTER_DISTANCE) * 0.3);
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(pointer.x, pointer.y);
                    ctx.stroke();
                }
            }
        }

        // Filaments : chaque neurone proche se relie à son cadre le plus proche.
        for (const n of lit.length ? nodes : []) {
            if (n.hidden || n.hub) continue;
            let f = null, c = null;
            for (const o of lit) {
                const p = closestOnBorder(o.rect, n.x, n.y);
                if (!c || p.d < c.d) { c = p; f = o; }
            }
            if (c.d > 8 && c.d < FEED_LINK) {
                ctx.strokeStyle = rgba(f.color, (1 - c.d / FEED_LINK) * 0.6);
                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.lineTo(c.x, c.y);
                ctx.stroke();
            }
        }

        // Impulsions qui alimentent les cadres.
        for (const e of feeds) {
            const c = closestOnBorder(e.frame.rect, e.node.x, e.node.y);
            const col = e.frame.color;
            ctx.strokeStyle = rgba(col, 0.8 * Math.min(1, e.t * 4));
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(e.node.x, e.node.y);
            ctx.lineTo(c.x, c.y);
            ctx.stroke();
            ctx.lineWidth = 1;
            const x = e.node.x + (c.x - e.node.x) * e.t;
            const y = e.node.y + (c.y - e.node.y) * e.t;
            ctx.fillStyle = rgba(col, 0.25);
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = rgba(col, 0.95);
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
            e.node.glow = Math.max(e.node.glow, 0.6);
        }

        // Gros neurones : un cœur lumineux et un faisceau vers le cadre.
        for (const hub of hubs) {
            const spot = spotAt(hub), col = hub.frame.color;
            const end = HUB_GATHER + HUB_CHARGE;
            const g = Math.min(1, Math.max(0, (hub.age - 15) / (HUB_GATHER - 15))) *
                (1 - Math.min(1, Math.max(0, (hub.age - end) / HUB_FADE)));
            if (g <= 0) continue;
            const c = closestOnBorder(hub.frame.rect, spot.x, spot.y);

            if (hub.age > HUB_GATHER && hub.age < end + 10) {
                ctx.save();
                ctx.lineCap = 'round';
                ctx.shadowColor = rgba(col, g);
                ctx.shadowBlur = 12;
                ctx.strokeStyle = rgba(col, 0.75 * g);
                ctx.lineWidth = 2.6;
                ctx.beginPath();
                ctx.moveTo(spot.x, spot.y);
                ctx.lineTo(c.x, c.y);
                ctx.stroke();
                ctx.restore();
                for (const t of hub.pulses) {
                    const x = spot.x + (c.x - spot.x) * t, y = spot.y + (c.y - spot.y) * t;
                    ctx.fillStyle = rgba(col, 0.3);
                    ctx.beginPath();
                    ctx.arc(x, y, 7, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                    ctx.beginPath();
                    ctx.arc(x, y, 2.4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            const beat = 1 + Math.sin(hub.age * 0.15) * 0.08;
            const radius = (18 + 18 * g) * beat;
            const halo = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, radius);
            halo.addColorStop(0, rgba(col, 0.55 * g));
            halo.addColorStop(0.4, rgba(col, 0.2 * g));
            halo.addColorStop(1, rgba(col, 0));
            ctx.fillStyle = halo;
            ctx.fillRect(spot.x - radius, spot.y - radius, radius * 2, radius * 2);
            ctx.fillStyle = rgba(col, 0.95 * g);
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, (3 + 4 * g) * beat, 0, Math.PI * 2);
            ctx.fill();
        }

        for (const n of nodes) {
            ctx.fillStyle = rgba(LINE, 0.5 + n.glow * 0.5);
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r + n.glow * 1.6, 0, Math.PI * 2);
            ctx.fill();
            if (n.glow > 0.05) {
                ctx.fillStyle = rgba(SIGNAL, n.glow * 0.18);
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r + 7 * n.glow, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (const s of signals) {
            const x = s.from.x + (s.to.x - s.from.x) * s.t;
            const y = s.from.y + (s.to.y - s.from.y) * s.t;
            ctx.fillStyle = rgba(SIGNAL, 0.22);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = rgba(SIGNAL, 0.9);
            ctx.beginPath();
            ctx.arc(x, y, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function loop() {
        step();
        draw();
        frame = requestAnimationFrame(loop);
    }

    const start = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(loop); };
    const stop = () => { if (frame) cancelAnimationFrame(frame); frame = null; };

    resize();

    // Mouvement réduit : le réseau reste affiché, mais immobile.
    if (prefersReducedMotion()) {
        draw();
        window.addEventListener('resize', () => { resize(); draw(); });
        return;
    }

    // Sur mobile, la barre d'adresse change la hauteur en défilant : on ne
    // régénère le réseau que si la taille change vraiment.
    let lastWidth = width;
    window.addEventListener('resize', () => {
        if (window.innerWidth !== lastWidth || Math.abs(window.innerHeight - height) > 120) {
            lastWidth = window.innerWidth;
            resize();
        }
    });

    window.addEventListener('pointermove', e => { pointer = { x: e.clientX, y: e.clientY }; }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { pointer = null; });

    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    start();
}
