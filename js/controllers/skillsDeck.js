// ============================================
// CONTRÔLEUR — Compétences du BUT : graphe de dépendances
// ============================================
// Quand le haut du graphe atteint le milieu de l'écran, le nœud « BUT »
// apparaît et envoie une piste de circuit vers chaque carte, l'une après
// l'autre. À l'arrivée d'une piste, la bordure de la carte se dessine, la
// carte apparaît et sa barre de niveau se remplit ; des pointillés relient
// ensuite les compétences voisines. Survoler une carte éclaire sa piste.
// Les pistes passent dans les gouttières de la grille : elles sont recalculées
// à chaque changement de taille (redimensionnement, détails dépliés).
// En remontant au-dessus de la section, tout se cache pour le prochain passage.
import { prefersReducedMotion } from '../utils/dom.js';

const NS = 'http://www.w3.org/2000/svg';
const LINKS = [[0, 1], [2, 3], [4, 5]]; // Réaliser–Optimiser, Administrer–Gérer, Conduire–Collaborer
const START = 350, STEP = 160, TRACE = 650, BORDER = 450; // ms, accordés au CSS (.trace, .trace-border)

function fillBars(card, delay = 0) {
    card.querySelectorAll('.skill-bar-fill').forEach(bar => {
        setTimeout(() => bar.classList.add('active'), delay);
    });
}

function svgEl(tag, cls, attrs) {
    const el = document.createElementNS(NS, tag);
    el.setAttribute('class', cls);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
}

export function initSkillsDeck() {
    const graph = document.querySelector('.skills-graph');
    if (!graph) return;
    const grid = graph.querySelector('.skills-grid');
    const hub = graph.querySelector('.skills-hub');
    const svg = graph.querySelector('.skills-traces');
    const cards = [...grid.querySelectorAll('.skill-card')];
    if (!cards.length) return;

    let traces = [], borders = [], links = [];
    let state = 'hidden', timers = [];

    // Pistes : du bas du nœud jusqu'à un « bus » horizontal, puis vers le haut de
    // chaque carte. Les cartes des rangées suivantes descendent par la gouttière
    // à leur gauche, puis longent la gouttière au-dessus d'elles.
    function build() {
        // Positions de mise en page (offset*) : le décalage des cartes encore cachées ne compte pas.
        const rel = el => ({ l: el.offsetLeft, t: el.offsetTop, r: el.offsetLeft + el.offsetWidth, b: el.offsetTop + el.offsetHeight, w: el.offsetWidth, h: el.offsetHeight });
        const hb = rel(hub);
        const rects = cards.map(rel);
        const gap = parseFloat(getComputedStyle(grid).rowGap) || 16;
        const radius = parseFloat(getComputedStyle(cards[0]).borderTopLeftRadius) || 12;
        const firstTop = Math.min(...rects.map(r => r.t));
        const hx = hb.l + hb.w / 2, bus = (hb.b + firstTop) / 2;
        const sameRow = (a, b) => Math.abs(a.t - b.t) < 2;

        traces = rects.map(r => {
            const cx = r.l + r.w / 2;
            const d = sameRow(r, rects[0])
                ? `M${hx} ${hb.b} V${bus} H${cx} V${r.t}`
                : `M${hx} ${hb.b} V${bus} H${r.l - gap / 2} V${r.t - gap / 2} H${cx} V${r.t}`;
            return svgEl('path', 'trace', { d });
        });
        borders = rects.map(r => svgEl('rect', 'trace-border', { x: r.l, y: r.t, width: r.w, height: r.h, rx: radius }));
        links = LINKS.filter(([a, b]) => rects[b] && sameRow(rects[a], rects[b])).map(([a, b]) => {
            const y = rects[a].t + 28;
            return svgEl('path', 'trace-link', { d: `M${rects[a].r} ${y} H${rects[b].l}` });
        });

        svg.replaceChildren(...traces, ...links, ...borders);
        for (const el of [...traces, ...borders]) el.style.setProperty('--len', el.getTotalLength());
        // Reconstruit pendant ou après l'animation : tout est tracé d'emblée.
        graph.classList.toggle('is-drawn', state === 'shown');
    }

    let frame = 0;
    new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(build);
    }).observe(graph);

    const show = card => {
        if (card.classList.contains('is-in')) return;
        card.classList.add('is-in');
        fillBars(card, 250);
    };
    const showAll = () => {
        state = 'shown';
        graph.classList.add('is-drawn');
        cards.forEach(show);
    };

    // Mouvement réduit : graphe déjà tracé, seules les barres se remplissent.
    if (prefersReducedMotion()) {
        state = 'shown';
        graph.classList.add('is-drawn');
        new IntersectionObserver((entries, obs) => {
            if (!entries[0].isIntersecting) return;
            cards.forEach(card => fillBars(card));
            obs.disconnect();
        }, { rootMargin: '0px 0px -20% 0px' }).observe(graph);
        return;
    }

    graph.classList.add('is-armed');

    function reveal({ instant = false } = {}) {
        if (state !== 'hidden') return;
        if (instant) return showAll();
        state = 'shown';
        graph.classList.add('is-live');
        const at = (ms, fn) => timers.push(setTimeout(fn, ms));
        cards.forEach((card, i) => {
            const t0 = START + i * STEP;
            at(t0, () => traces[i]?.classList.add('is-on'));
            at(t0 + TRACE, () => borders[i]?.classList.add('is-on'));
            at(t0 + TRACE + BORDER * 0.6, () => show(card));
        });
        at(START + cards.length * STEP + TRACE + BORDER, () => links.forEach(l => l.classList.add('is-on')));
    }

    function reset() {
        timers.forEach(clearTimeout);
        timers = [];
        state = 'hidden';
        graph.classList.remove('is-live', 'is-drawn');
        svg.querySelectorAll('.is-on').forEach(el => el.classList.remove('is-on'));
        cards.forEach(card => {
            card.classList.remove('is-in');
            card.querySelectorAll('.skill-bar-fill').forEach(bar => bar.classList.remove('active'));
        });
    }

    // Révèle quand le haut du graphe passe le milieu de l'écran.
    new IntersectionObserver(entries => {
        const entry = entries[0];
        if (entry.isIntersecting) reveal();
        // Arrivé directement plus bas (lien d'ancre, rechargement) : déjà tracé.
        else if (entry.boundingClientRect.bottom < 0) reveal({ instant: true });
    }, { rootMargin: '0px 0px -45% 0px' }).observe(graph);

    // Cache tout quand le graphe repasse entièrement sous l'écran.
    new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0 && state === 'shown') reset();
    }).observe(graph);

    // Un focus clavier sur une carte encore cachée montre tout.
    grid.addEventListener('focusin', showAll);

    // Survoler une carte éclaire sa piste.
    cards.forEach((card, i) => {
        card.addEventListener('mouseenter', () => traces[i]?.classList.add('is-hot'));
        card.addEventListener('mouseleave', () => traces[i]?.classList.remove('is-hot'));
    });
}
