// ============================================
// CONTRÔLEUR — Intro en motion design
// ============================================
// Une courte séquence plein écran à l'arrivée sur le site, dessinée sur un
// canvas (pas de fichier vidéo) :
//   1. une règle graduée se trace, compteur 000 → 100
//   2. coupes rapides : Interface, API, Données, Serveur, IA
//   3. plongée dans un champ d'étoiles
//   4. le nom monte lettre par lettre, s'efface, puis l'intro se fond dans
//      l'accueil
// Grain de pellicule, vignettage et bandes noires lui donnent l'aspect d'une
// vidéo.
//
// Elle n'est jouée qu'une fois par session, jamais avec le mouvement réduit
// ni quand on arrive sur une ancre (#projects...) : c'est le script en ligne
// de index.html qui pose alors la classe .intro-pending, avant le premier
// affichage, pour que la page n'apparaisse pas un instant avant l'intro.
// On peut la passer au bouton, à la touche Échap ou d'un clic.

export const INTRO_KEY = 'intro-seen';

const DURATION = 6.5;     // fin de la séquence, avant le fondu vers le site
const FADE_MS = 600;      // fondu de fin
const SKIP_FADE_MS = 350; // fondu quand on passe l'intro
const FONT_TIMEOUT = 900; // attente maximale des polices avant de démarrer

const BG = [13, 14, 19], VIOLET = [208, 188, 255], CYAN = [76, 215, 246], GREEN = [78, 222, 163];
const MUTED = [179, 173, 189], TEXT = [227, 225, 233];
const WORDS = [
    { word: 'Interface', color: VIOLET }, { word: 'API', color: CYAN }, { word: 'Données', color: VIOLET },
    { word: 'Serveur', color: GREEN }, { word: 'IA', color: CYAN }
];
const TITLE = 'Rémi Bastide';
const SUBTITLE = ['Développeur fullstack', "en route vers l'IA"];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const mix = (a, b, t) => a + (b - a) * t;
const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${clamp(a)})`;

function seeded(seed) {
    let s = seed;
    return () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646);
}

const DISPLAY = '"Space Grotesk", system-ui, sans-serif';
const MONO = '"JetBrains Mono", monospace';

function createRenderer(canvas) {
    const ctx = canvas.getContext('2d');
    const rnd = seeded(2026);
    const stars = Array.from({ length: 220 }, () => ({ a: rnd() * Math.PI * 2, d: rnd(), s: mix(0.4, 1, rnd()) }));
    const hasSpacing = 'letterSpacing' in ctx;
    let w = 0, h = 0;

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
    }

    function glow(x, y, r, c, a) {
        if (a <= 0) return;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba(c, a));
        g.addColorStop(1, rgba(c, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
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
    function fit(str, size, weight, max, spacingRatio) {
        setFont(`${weight} ${size}px ${DISPLAY}`, size * spacingRatio);
        const width = ctx.measureText(str).width;
        return width > max ? size * max / width : size;
    }

    function draw(t) {
        if (!w || !h) return;
        const cx = w / 2, cy = h / 2;
        // Échelle : 1 sur un écran de 900 × 600, plafonnée sur les grands écrans.
        const u = Math.min(w / 900, h / 600, 1.3);
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = rgba(BG, 1);
        ctx.fillRect(0, 0, w, h);

        // 1. Ligne de lumière et règle graduée (0 → 1,4 s).
        const trace = easeInOut(range(t, 0.1, 1.0));
        const lineOut = range(t, 1.1, 1.4);
        if (trace > 0 && lineOut < 1) {
            const span = Math.min(560 * u, w * 0.44);
            const half = span * trace, a = 1 - lineOut;
            const g = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
            g.addColorStop(0, rgba(VIOLET, 0));
            g.addColorStop(0.5, rgba(TEXT, 0.9 * a));
            g.addColorStop(1, rgba(CYAN, 0));
            ctx.fillStyle = g;
            ctx.fillRect(cx - half, cy, half * 2, 1.5);
            const step = span / 20;
            for (let i = -20; i <= 20; i++) {
                const x = i * step;
                if (Math.abs(x) > half) continue;
                const major = i % 5 === 0;
                ctx.fillStyle = rgba(TEXT, (major ? 0.7 : 0.3) * a * (1 - Math.abs(x) / (span * 1.08)));
                ctx.fillRect(cx + x, cy - (major ? 14 : 6), 1, major ? 14 : 6);
            }
            glow(cx, cy, 260 * u * trace, VIOLET, 0.18 * a);
            text(String(Math.round(trace * 100)).padStart(3, '0'), cx, cy + 40, `500 13px ${MONO}`, rgba(MUTED, 0.8 * a), 2);
        }

        // 2. Mots-clés en coupes rapides, avec un zoom lent (1,3 → 3,3 s).
        WORDS.forEach((o, i) => {
            const start = 1.3 + i * 0.4;
            const p = range(t, start, start + 0.4);
            if (p <= 0 || p >= 1) return;
            const a = Math.min(range(p, 0, 0.15), 1 - range(p, 0.8, 1));
            const size = fit(o.word, (o.word.length < 4 ? 190 : 140) * u, 700, w * 0.86, -0.035);
            ctx.save();
            ctx.translate(cx, cy);
            const scale = mix(1.08, 1, easeOut(p));
            ctx.scale(scale, scale);
            glow(0, -size * 0.2, 320 * u, o.color, 0.16 * a);
            text(`${String(i + 1).padStart(2, '0')} / 05`, 0, -size * 0.85, `500 13px ${MONO}`, rgba(o.color, a), 3);
            text(o.word, 0, size * 0.15, `700 ${size}px ${DISPLAY}`, rgba(TEXT, a), -size * 0.035);
            ctx.restore();
        });

        // 3. Plongée dans un champ d'étoiles, sur une aurore (3,3 → 4,9 s).
        const dive = range(t, 3.3, 4.7);
        if (dive > 0) {
            const a = Math.min(range(t, 3.3, 3.5), 1 - range(t, 4.5, 4.9));
            const far = Math.max(w, h) * 0.75;
            glow(cx - 220 * u, cy + 40 * u, 520 * u, VIOLET, 0.22 * a);
            glow(cx + 260 * u, cy - 60 * u, 460 * u, CYAN, 0.16 * a);
            ctx.lineCap = 'round';
            for (const s of stars) {
                const d = (s.d + dive * 1.6 * s.s) % 1;
                const dist = Math.pow(d, 2.2) * far;
                const len = (2 + d * 26 * s.s) * u;
                ctx.strokeStyle = rgba(d > 0.6 ? CYAN : VIOLET, a * d);
                ctx.lineWidth = 1 + d * 1.5;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(s.a) * dist, cy + Math.sin(s.a) * dist);
                ctx.lineTo(cx + Math.cos(s.a) * (dist + len), cy + Math.sin(s.a) * (dist + len));
                ctx.stroke();
            }
        }

        // 4. Le nom : chaque lettre monte derrière un masque (4,4 s → fin).
        // Il s'efface avant le fondu final, pour ne pas se superposer au nom de l'accueil.
        const out = range(t, 6.0, 6.45);
        if (t > 4.4 && out < 1) {
            const size = fit(TITLE, 120 * u, 700, w * 0.9, -0.033);
            const spacing = -size * 0.033;
            setFont(`700 ${size}px ${DISPLAY}`, spacing);
            let x = cx - ctx.measureText(TITLE).width / 2;
            const base = cy + size * 0.17;
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, base - size * 1.05, w, size * 1.3);
            ctx.clip();
            [...TITLE].forEach((ch, i) => {
                const p = easeOut(range(t, 4.45 + i * 0.045, 4.95 + i * 0.045));
                setFont(`700 ${size}px ${DISPLAY}`, spacing);
                const cw = ctx.measureText(ch).width;
                text(ch, x, base + (1 - p) * size * 1.1 - out * size * 0.12, `700 ${size}px ${DISPLAY}`, rgba(TEXT, 1 - out), spacing, 'left');
                x += cw;
            });
            ctx.restore();

            const lineW = Math.min(240 * u, w * 0.36) * easeOut(range(t, 5.1, 5.6));
            const g = ctx.createLinearGradient(cx - lineW, 0, cx + lineW, 0);
            g.addColorStop(0, rgba(VIOLET, 0));
            g.addColorStop(0.5, rgba(CYAN, 0.9 * (1 - out)));
            g.addColorStop(1, rgba(GREEN, 0));
            ctx.fillStyle = g;
            ctx.fillRect(cx - lineW, base + 30 * u, lineW * 2, 1.5);

            // Sous-titre en mono, sur deux lignes s'il ne tient pas sur une.
            const sub = range(t, 5.25, 5.7) * (1 - out);
            const font = `500 ${Math.max(11, 14 * u)}px ${MONO}`;
            const oneLine = SUBTITLE.join(' · ').toUpperCase();
            setFont(font, 4);
            const lines = ctx.measureText(oneLine).width > w * 0.9 ? SUBTITLE.map(s => s.toUpperCase()) : [oneLine];
            lines.forEach((l, i) => text(l, cx, base + 30 * u + 36 + i * 22, font, rgba(MUTED, sub), 4));
            glow(cx, cy - 20, 420 * u, VIOLET, 0.12 * sub);
        }

        // Grain, vignettage et bandes noires : l'aspect « vidéo ».
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = grain[Math.floor(t * 24) % grain.length];
        ctx.translate((t * 997) % 160, (t * 613) % 160);
        ctx.fillRect(-160, -160, w + 320, h + 320);
        ctx.restore();

        const vg = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.35, cx, cy, Math.max(w, h) * 0.7);
        vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vg.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);

        const bars = h * 0.064 * (1 - easeInOut(range(t, 5.4, 6.0)));
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
        renderer.draw(Math.min(t, DURATION));
        if (t >= DURATION) end(FADE_MS);
        else frame = requestAnimationFrame(tick);
    }

    const onResize = () => { renderer.resize(); renderer.draw(Math.min(t, DURATION)); };
    const onKey = e => { if (e.key === 'Escape') end(SKIP_FADE_MS); };
    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', () => end(SKIP_FADE_MS));
    skip.addEventListener('click', e => { e.stopPropagation(); end(SKIP_FADE_MS); });

    // Démarre dès que les polices sont prêtes, sans les attendre trop longtemps.
    const fonts = document.fonts
        ? Promise.all([`700 40px ${DISPLAY}`, `500 13px ${MONO}`].map(f => document.fonts.load(f)))
        : Promise.resolve();
    Promise.race([fonts, new Promise(r => setTimeout(r, FONT_TIMEOUT))]).then(() => {
        if (ended) return;
        last = performance.now();
        frame = requestAnimationFrame(tick);
    });
}
