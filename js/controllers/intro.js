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
// Typographie : une serif à l'italique marqué (Instrument Serif) pour les
// noms, une mono discrète (IBM Plex Mono) pour les petites lignes. Pas de
// halo ni de dégradé : seulement le grain, le vignettage et les bandes noires
// d'une pellicule.
//
// Elle n'est jouée qu'une fois par session, jamais avec le mouvement réduit
// ni quand on arrive sur une ancre (#projects...) : c'est le script en ligne
// de index.html qui pose alors la classe .intro-pending, avant le premier
// affichage, pour que la page n'apparaisse pas un instant avant l'intro.
// On peut la passer au bouton, à la touche Échap ou d'un clic.

export const INTRO_KEY = 'intro-seen';

const DURATION = 7.0;     // fin de la séquence, avant le fondu vers le site
const FADE_MS = 600;      // fondu de fin
const SKIP_FADE_MS = 350; // fondu quand on passe l'intro
const FONT_TIMEOUT = 1200; // attente maximale des polices avant de démarrer

const BG = [12, 12, 15], CYAN = [76, 215, 246], MUTED = [141, 135, 154], TEXT = [227, 225, 233];

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
const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${clamp(a)})`;

function seeded(seed) {
    let s = seed;
    return () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646);
}

const SERIF = '"Instrument Serif", Georgia, serif';
const MONO = '"IBM Plex Mono", "JetBrains Mono", monospace';

function createRenderer(canvas) {
    const ctx = canvas.getContext('2d');
    const rnd = seeded(2026);
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

        // 1. Cartons de crédits, en fondu, avec une très légère montée.
        for (const c of CREDITS) {
            const a = Math.min(easeOut(range(t, c.from, c.from + 0.6)), 1 - range(t, c.to - 0.45, c.to));
            if (a <= 0) continue;
            const rise = (1 - easeOut(range(t, c.from, c.from + 1))) * 8;
            const size = fit(c.big, 60 * Math.max(u, 0.75), `italic 400 SIZEpx ${SERIF}`, w * 0.86);
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
        ? Promise.all([`400 40px ${SERIF}`, `italic 400 40px ${SERIF}`, `400 12px ${MONO}`].map(f => document.fonts.load(f)))
        : Promise.resolve();
    Promise.race([fonts, new Promise(r => setTimeout(r, FONT_TIMEOUT))]).then(() => {
        if (ended) return;
        last = performance.now();
        frame = requestAnimationFrame(tick);
    });
}
