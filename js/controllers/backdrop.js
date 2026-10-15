// ============================================
// CONTRÔLEUR — Fond continu de la page
// ============================================
// Chaque section déclare sa teinte (--tone, voir layout.css). Les teintes sont
// peintes en un seul dégradé sur toute la hauteur de la page : chaque passage
// d'une section à la suivante devient un long fondu, quelle que soit la paire
// de sections. Le dégradé est recalculé dès que la hauteur de la page change
// (filtres de projets, détails de compétences, redimensionnement...).

// Largeur d'un fondu : environ la moitié de l'écran, bornée.
const seamSize = () => Math.min(Math.max(window.innerHeight * 0.55, 240), 560);

// Interpolation perceptuelle quand le navigateur la connaît : fondus plus réguliers.
const SPACE = CSS.supports('background-image', 'linear-gradient(in oklab, red, blue)') ? 'in oklab ' : '';

function paint() {
    const sections = [...document.querySelectorAll('#app > section, #footer')]
        .map(el => ({
            tone: getComputedStyle(el).getPropertyValue('--tone').trim(),
            top: el.getBoundingClientRect().top + window.scrollY,
            height: el.offsetHeight
        }))
        .filter(s => s.tone);
    if (!sections.length) return;

    const seam = seamSize();
    const stops = [`${sections[0].tone} 0px`];

    for (let i = 1; i < sections.length; i++) {
        const prev = sections[i - 1];
        const next = sections[i];
        // Un fondu ne mange jamais plus de 80 % d'une section courte.
        const half = Math.min(seam, prev.height * 0.8, next.height * 0.8) / 2;
        const edge = Math.round(next.top);
        stops.push(`${prev.tone} ${edge - half}px`, `${next.tone} ${edge + half}px`);
    }

    const height = Math.ceil(document.documentElement.scrollHeight);
    Object.assign(document.body.style, {
        backgroundImage: `linear-gradient(${SPACE}to bottom, ${stops.join(', ')})`,
        backgroundSize: `100% ${height}px`,
        backgroundRepeat: 'no-repeat'
    });
}

export function initBackdrop() {
    let frame = 0;
    const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(paint);
    };
    paint();
    new ResizeObserver(schedule).observe(document.body);
    window.addEventListener('resize', schedule);
}
