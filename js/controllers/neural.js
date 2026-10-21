// ============================================
// CONTRÔLEUR — Réseau de neurones en fond de page
// ============================================
// Des neurones dérivent lentement derrière toute la page ; ceux qui sont proches
// se relient. De temps en temps, un signal part d'un neurone et suit une
// connexion jusqu'à son voisin, qui peut le relayer à son tour. La souris
// agit comme un neurone de plus : elle se relie à ceux qui l'entourent.
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

// Couleurs du thème (base.css) : lignes violettes, signaux cyan.
const LINE = [208, 188, 255];
const SIGNAL = [76, 215, 246];
const rgba = ([r, g, b], a) => `rgba(${r}, ${g}, ${b}, ${a})`;

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

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        nodes = createNodes(width, height);
        signals = [];
    }

    function step() {
        for (const n of nodes) {
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
