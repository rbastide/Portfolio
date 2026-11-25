// ============================================
// CONTRÔLEUR — Intro façon générique de film
// ============================================
// Une courte séquence plein écran à l'arrivée sur le site, dessinée sur un
// canvas (pas de fichier vidéo), dans l'esprit d'un générique d'ouverture :
//   1. trois cartons de crédits sur fond noir, en fondu :
//        « Un portfolio de » Rémi Bastide
//        « Formé à » l'IUT de Limoges
//        « En route vers » l'Intelligence Artificielle
//   2. le nom en très grand, révélé par un volet vertical, puis le sous-titre
//   3. tout s'efface, puis l'intro se fond dans l'accueil
// En fond, le réseau de neurones du site (controllers/neural.js), plus
// discret : des neurones qui dérivent, reliés quand ils sont proches, et de
// petits signaux. Une impulsion cyan le traverse de gauche à droite pendant
// toute l'intro et laisse une trace qui s'estompe. Un voile sombre garde les
// textes lisibles. À la fin, l'intro s'efface sur le même réseau, celui du site.
// Typographie : une serif à l'italique marqué (Instrument Serif) pour les
// noms, une mono discrète (IBM Plex Mono) pour les petites lignes. Grain,
// vignettage et bandes noires donnent l'aspect pellicule.
//
// Elle n'est jouée qu'une fois par session, jamais avec le mouvement réduit
// ni quand on arrive sur une ancre (#projects...) : c'est le script en ligne
// de index.html qui pose alors la classe .intro-pending, avant le premier
// affichage, pour que la page n'apparaisse pas un instant avant l'intro.
// On peut la passer au bouton, à la touche Échap ou d'un clic.

export const INTRO_KEY = 'intro-seen';

// Les horaires de la séquence (cartons, volet, néon...) sont écrits sur une
// timeline de 7 s, jouée en DURATION secondes réelles.
const TIMELINE = 7.0;     // durée de la timeline écrite
const DURATION = 5.0;     // durée réelle de la séquence, avant le fondu vers le site
const PACE = TIMELINE / DURATION;
const FADE_MS = 600;      // fondu de fin
const SKIP_FADE_MS = 350; // fondu quand on passe l'intro
const FONT_TIMEOUT = 1200; // attente maximale des polices avant de démarrer

const BG = [10, 10, 10], VIOLET = [242, 242, 242], CYAN = [189, 189, 189];
const MUTED = [140, 140, 140], TEXT = [236, 236, 236];

// Réseau de fond, réglé comme celui du site (controllers/neural.js).
const LINK_DISTANCE = 150;  // au-delà, deux neurones ne sont plus reliés
const AREA_PER_NODE = 14000; // un neurone pour X px²
const MAX_NODES = 90;
const AMBIENT_SIGNALS = 16;  // petits signaux, comme sur le site
const PATH_LENGTH = 18;      // neurones traversés par l'impulsion principale
const PATH_FROM = 0.4, PATH_TO = 6.4; // l'impulsion traverse l'écran pendant ce temps

// Cartons de crédits : petite ligne en mono, grande ligne en serif italique.
const CREDITS = [
    { from: 0.5, to: 2.3, small: 'Un portfolio de', big: 'Rémi Bastide' },
    { from: 2.5, to: 3.9, small: 'Formé à', big: 'l’IUT de Limoges' },
    { from: 4.1, to: 5.4, small: 'En route vers', big: 'l’Intelligence Artificielle' }
];
const SUBTITLE = 'Développeur fullstack — en route vers l’IA';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const mix = (a, b, t) => a + (b - a) * t;
const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${clamp(a)})`;
const wrap = (v, m) => ((v % m) + m) % m;

function seeded(seed) {
    let s = seed;
    return () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646);
}

// Réseau pour un écran w × h : neurones, petits signaux, et le chemin de
// l'impulsion principale (de proche en proche, de la gauche vers la droite).
function buildNetwork(w, h) {
    const rnd = seeded(77);
    const count = Math.min(MAX_NODES, Math.max(24, Math.round((w * h) / AREA_PER_NODE)));
    const nodes = Array.from({ length: count }, () => {
        const angle = rnd() * Math.PI * 2, speed = 6 + rnd() * 10; // px/s
        return { x0: rnd() * w, y0: rnd() * h, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 1.1 + rnd() * 1.4, x: 0, y: 0 };
    });
    const signals = Array.from({ length: AMBIENT_SIGNALS }, () => ({
        at: rnd() * TIMELINE, dur: 0.9 + rnd() * 0.6, from: nodes[Math.floor(rnd() * count)]
    }));

    const band = nodes.filter(n => n.y0 > h * 0.2 && n.y0 < h * 0.8);
    const path = [(band.length ? band : nodes).reduce((a, b) => (b.x0 < a.x0 ? b : a))];
    while (path.length < PATH_LENGTH) {
        const cur = path[path.length - 1];
        const next = nodes
            .filter(n => !path.includes(n) && n.x0 > cur.x0 + w * 0.025)
            .sort((a, b) => Math.hypot(a.x0 - cur.x0, a.y0 - cur.y0) - Math.hypot(b.x0 - cur.x0, b.y0 - cur.y0))[0];
        if (!next) break;
        path.push(next);
    }
    return { nodes, signals, path };
}

const SERIF = '"Instrument Serif", Georgia, serif';
const MONO = '"IBM Plex Mono", "JetBrains Mono", monospace';

function createRenderer(canvas) {
    const ctx = canvas.getContext('2d');
    const rnd = seeded(2026);
    const hasSpacing = 'letterSpacing' in ctx;
    let w = 0, h = 0, net = null;

    // Grain : quelques tuiles de bruit calculées une fois, décalées à chaque image.
    const grain = Array.from({ length: 4 }, () => {
        const tile = document.createElement('canvas');
        tile.width = tile.height = 160;
        const g = tile.getContext('2d');
        const img = g.createImageData(160, 160);
        for (let i = 0; i < img.data.length; i += 4) {
            const v = rnd() * 255;
            img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
            img.data[i + 3] = 255;
        }
        g.putImageData(img, 0, 0);
        return ctx.createPattern(tile, 'repeat');
    });

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        net = buildNetwork(w, h);
    }

    function circle(x, y, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
        ctx.fill();
    }

    function line(a, b, color, width = 1) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }

    // Point lumineux qui parcourt une connexion (p de 0 à 1).
    function pulse(a, b, p, alpha = 1) {
        const x = mix(a.x, b.x, p), y = mix(a.y, b.y, p);
        circle(x, y, 6, rgba(CYAN, 0.2 * alpha));
        circle(x, y, 2, rgba(CYAN, 0.95 * alpha));
    }

    // Voile sombre elliptique derrière un texte, pour qu'il reste lisible sur le réseau.
    function veil(x, y, rx, ry, a) {
        if (a <= 0) return;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, ry / rx);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        g.addColorStop(0, rgba(BG, 0.88 * a));
        g.addColorStop(0.55, rgba(BG, 0.6 * a));
        g.addColorStop(1, rgba(BG, 0));
        ctx.fillStyle = g;
        ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
        ctx.restore();
    }

    function drawNetwork(t) {
        const { nodes, signals, path } = net;
        for (const n of nodes) {
            n.x = wrap(n.x0 + n.vx * t, w + 80) - 40;
            n.y = wrap(n.y0 + n.vy * t, h + 80) - 40;
        }

        // Le réseau du site, un peu plus discret.
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                if (d < LINK_DISTANCE) line(nodes[i], nodes[j], rgba(VIOLET, 0.22 * (1 - d / LINK_DISTANCE)));
            }
        }
        for (const n of nodes) circle(n.x, n.y, n.r, rgba(VIOLET, 0.45));

        // Petits signaux d'ambiance, vers le voisin le plus proche.
        for (const s of signals) {
            const p = (t - s.at) / s.dur;
            if (p < 0 || p > 1) continue;
            let to = null, best = LINK_DISTANCE;
            for (const n of nodes) {
                const d = Math.hypot(n.x - s.from.x, n.y - s.from.y);
                if (n !== s.from && d < best) { best = d; to = n; }
            }
            if (to) pulse(s.from, to, p, 0.7 * Math.min(1, p * 5, (1 - p) * 5));
        }

        // L'impulsion principale et sa trace, qui s'estompe derrière elle.
        const progress = range(t, PATH_FROM, PATH_TO) * (path.length - 1);
        const head = Math.floor(progress);
        for (let i = 0; i < Math.min(head, path.length - 1); i++) {
            const age = progress - (i + 1);
            const a = Math.max(0.12, 1 - age * 0.18);
            line(path[i], path[i + 1], rgba(CYAN, 0.85 * a), 1.6);
            circle(path[i + 1].x, path[i + 1].y, 2.4, rgba(CYAN, 0.9 * a));
            circle(path[i + 1].x, path[i + 1].y, 9, rgba(CYAN, 0.12 * a * Math.max(0, 1 - age)));
        }
        if (head < path.length - 1) pulse(path[head], path[head + 1], progress - head);
    }

    function setFont(font, spacing = 0) {
        ctx.font = font;
        if (hasSpacing) ctx.letterSpacing = `${spacing}px`;
    }

    function text(str, x, y, font, color, spacing = 0, align = 'center') {
        setFont(font, spacing);
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(str, x, y);
    }

    // Taille de police qui tient dans `max` pixels de large.
    function fit(str, size, font, max) {
        setFont(`${font.replace('SIZE', size)}`);
        const width = ctx.measureText(str).width;
        return width > max ? size * max / width : size;
    }

    function draw(t) {
        if (!w || !h) return;
        const cx = w / 2, cy = h / 2;
        // Échelle : 1 sur un écran de 900 × 600, plafonnée sur les grands écrans.
        const u = Math.min(w / 900, h / 600, 1.3);
        const small = Math.max(11, 12 * u);
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = rgba(BG, 1);
        ctx.fillRect(0, 0, w, h);
        drawNetwork(t);

        // 1. Cartons de crédits, en fondu, avec une très légère montée.
        for (const c of CREDITS) {
            const a = Math.min(easeOut(range(t, c.from, c.from + 0.6)), 1 - range(t, c.to - 0.45, c.to));
            if (a <= 0) continue;
            const rise = (1 - easeOut(range(t, c.from, c.from + 1))) * 8;
            const size = fit(c.big, 60 * Math.max(u, 0.75), `italic 400 SIZEpx ${SERIF}`, w * 0.86);
            const rx = Math.min(w * 0.5, size * 7.5);
            veil(cx, cy - size * 0.15, rx, Math.max(size * 2.4, rx * 0.33), a);
            text(c.small.toUpperCase(), cx, cy - size * 0.75 + rise, `400 ${small}px ${MONO}`, rgba(MUTED, a), small * 0.3);
            text(c.big, cx, cy + size * 0.35 + rise, `italic 400 ${size}px ${SERIF}`, rgba(TEXT, a));
        }

        // 2. Le nom en grand, révélé par un volet vertical (5,5 s → fin).
        const out = easeInOut(range(t, 6.45, 6.95));
        if (t > 5.45 && out < 1) {
            const left = Math.max(24, Math.min(w * 0.08, 96));
            // Le nom occupe toute la largeur disponible, dans la limite de 190 px.
            const size = Math.min(fit('Bastide', 400, `italic 400 SIZEpx ${SERIF}`, w - left * 2), 190);
            const base2 = h * 0.74;
            const base1 = base2 - size * 0.86;
            const nameW = Math.min(w - left, size * 3.4);
            veil(left + nameW * 0.45, base2 - size * 0.55, nameW * 0.85, size * 1.5, range(t, 5.45, 5.9) * (1 - out));

            // Le volet balaie l'écran de gauche à droite ; le texte n'existe que derrière lui.
            const sweep = easeInOut(range(t, 5.5, 6.25));
            const edge = sweep * (w + 40);
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, edge, h);
            ctx.clip();
            ctx.globalAlpha = 1 - out;
            text('Rémi', left, base1, `400 ${size}px ${SERIF}`, rgba(TEXT, 1), -size * 0.02, 'left');
            text('Bastide', left, base2, `italic 400 ${size}px ${SERIF}`, rgba(CYAN, 1), -size * 0.01, 'left');
            ctx.restore();

            // Le fil du volet, qui s'éteint en arrivant au bord.
            const lineA = (1 - range(sweep, 0.85, 1)) * range(t, 5.5, 5.6);
            if (lineA > 0) {
                ctx.fillStyle = rgba(TEXT, 0.85 * lineA);
                ctx.fillRect(edge, h * 0.08, 1, h * 0.84);
            }

            const subA = range(t, 6.0, 6.35) * (1 - out);
            const subSize = Math.max(11, 13 * u);
            setFont(`400 ${subSize}px ${MONO}`, subSize * 0.14);
            const lines = ctx.measureText(SUBTITLE.toUpperCase()).width > w - left * 2
                ? SUBTITLE.split(' — ').map(s => s.toUpperCase())
                : [SUBTITLE.toUpperCase()];
            lines.forEach((l, i) => text(l, left, base2 + subSize * 3 + i * subSize * 1.8, `400 ${subSize}px ${MONO}`, rgba(MUTED, subA), subSize * 0.14, 'left'));
        }

        // Grain, vignettage et bandes noires : l'aspect pellicule.
        ctx.save();
        ctx.globalAlpha = 0.07;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = grain[Math.floor(t * 24) % grain.length];
        ctx.translate((t * 997) % 160, (t * 613) % 160);
        ctx.fillRect(-160, -160, w + 320, h + 320);
        ctx.restore();

        const vg = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.4, cx, cy, Math.max(w, h) * 0.75);
        vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vg.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);

        const bars = h * 0.064 * (1 - easeInOut(range(t, 6.3, 6.9)));
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, bars);
        ctx.fillRect(0, h - bars, w, bars);
    }

    return { resize, draw };
}

function remember() {
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch { /* stockage indisponible : l'intro reviendra */ }
}

export function initIntro() {
    const root = document.documentElement;
    if (!root.classList.contains('intro-pending')) return;

    document.body.insertAdjacentHTML('beforeend', `
    <div class="intro" id="intro">
        <canvas class="intro-canvas" aria-hidden="true"></canvas>
        <button type="button" class="intro-skip" id="intro-skip" aria-label="Passer l'introduction">Passer<span class="icon" aria-hidden="true">east</span></button>
    </div>`);

    const overlay = document.getElementById('intro');
    const skip = document.getElementById('intro-skip');
    const renderer = createRenderer(overlay.querySelector('.intro-canvas'));

    // L'intro couvre l'écran : la page peut maintenant s'afficher derrière.
    root.classList.remove('intro-pending');
    root.classList.add('intro-playing');
    renderer.resize();
    renderer.draw(0);

    let t = 0, last = 0, frame = 0, ended = false;

    function end(fade) {
        if (ended) return;
        ended = true;
        cancelAnimationFrame(frame);
        // Le parcours prend le relais : le néon arrive sur l'accueil (controllers/story.js).
        window.dispatchEvent(new Event('intro:end'));
        remember();
        root.classList.remove('intro-playing');
        overlay.style.transitionDuration = `${fade}ms`;
        overlay.classList.add('is-leaving');
        // Le focus était sur le bouton « Passer » : on le rend à la page.
        if (overlay.contains(document.activeElement)) document.activeElement.blur();
        setTimeout(() => {
            overlay.remove();
            window.removeEventListener('resize', onResize);
            document.removeEventListener('keydown', onKey);
        }, fade);
    }

    function tick(now) {
        // Pas de saut si l'onglet passe en arrière-plan.
        t += Math.min(0.05, (now - last) / 1000);
        last = now;
        renderer.draw(Math.min(t, DURATION) * PACE);
        if (t >= DURATION) end(FADE_MS);
        else frame = requestAnimationFrame(tick);
    }

    const onResize = () => { renderer.resize(); renderer.draw(Math.min(t, DURATION) * PACE); };
    const onKey = e => { if (e.key === 'Escape') end(SKIP_FADE_MS); };
    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', () => end(SKIP_FADE_MS));
    skip.addEventListener('click', e => { e.stopPropagation(); end(SKIP_FADE_MS); });

    // Démarre dès que les polices sont prêtes, sans les attendre trop longtemps.
    const fonts = document.fonts
        ? Promise.all([`400 40px ${SERIF}`, `italic 400 40px ${SERIF}`, `400 12px ${MONO}`].map(f => document.fonts.load(f)))
        : Promise.resolve();
    Promise.race([fonts, new Promise(r => setTimeout(r, FONT_TIMEOUT))]).then(() => {
        if (ended) return;
        last = performance.now();
        frame = requestAnimationFrame(tick);
    });
}
