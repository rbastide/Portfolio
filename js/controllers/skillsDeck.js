// ============================================
// CONTRÔLEUR — Compétences du BUT : cartes nées de flaques d'huile
// ============================================
// Même animation que la vitrine des projets (createFluid, controllers/showcase.js) :
// quand le haut de la grille atteint le milieu de l'écran, des éclats tombent
// au pied de la grille, fondent en une flaque d'huile qui se vide en filets
// vers chaque carte ; la carte apparaît sur sa flaque et sa barre de niveau se
// remplit. Chaque carte garde ensuite une petite inclinaison (--tilt).
// En remontant au-dessus de la section, les cartes se cachent pour le
// prochain passage.
import { prefersReducedMotion } from '../utils/dom.js';
import { createFluid } from './showcase.js';

// Inclinaison de chaque carte une fois posée (degrés).
const TILTS = [-1.6, 1.2, -0.8, 1.8, -1.3, 0.9];
const SHARDS = 18;

function fillBars(card, delay = 0) {
    card.querySelectorAll('.skill-bar-fill').forEach(bar => {
        setTimeout(() => bar.classList.add('active'), delay);
    });
}

export function initSkillsDeck() {
    const grid = document.querySelector('.skills-grid');
    if (!grid) return;
    const cards = [...grid.querySelectorAll('.skill-card')];
    if (!cards.length) return;

    // Mouvement réduit : cartes à plat, à leur place ; seules les barres se remplissent.
    if (prefersReducedMotion()) {
        new IntersectionObserver((entries, obs) => {
            if (!entries[0].isIntersecting) return;
            cards.forEach(card => fillBars(card));
            obs.disconnect();
        }, { rootMargin: '0px 0px -20% 0px' }).observe(grid);
        return;
    }

    cards.forEach((card, i) => card.style.setProperty('--tilt', `${TILTS[i % TILTS.length]}deg`));

    const canvas = document.createElement('canvas');
    canvas.className = 'skills-fluid';
    canvas.setAttribute('aria-hidden', 'true');
    grid.prepend(canvas);
    grid.classList.add('is-fluid');

    let state = 'hidden', timer = 0;
    const show = card => {
        if (card.classList.contains('is-in')) return;
        card.classList.add('is-in');
        fillBars(card, 300);
    };
    const showAll = () => cards.forEach(show);
    const fluid = createFluid(canvas, grid, cards, () => {}, i => show(cards[i]));

    function reveal({ instant = false } = {}) {
        if (state !== 'hidden') return;
        state = 'shown';
        if (instant) return showAll();
        // Pas de réseau ici : les éclats partent d'un amas en haut de la grille.
        const w = canvas.clientWidth;
        const nodes = Array.from({ length: SHARDS }, (_, i) => ({
            x: w / 2 + (Math.random() - 0.5) * w * 0.3,
            y: 40 + Math.random() * 80,
            r: 3,
            layer: i % 4
        }));
        try { fluid.start({ nodes, edges: [] }); } catch (err) { console.error(err); showAll(); }
        // Filet de sécurité : jamais de carte qui reste invisible.
        timer = setTimeout(showAll, 8000);
    }

    function reset() {
        clearTimeout(timer);
        fluid.stop();
        cards.forEach(card => {
            card.classList.remove('is-in');
            card.querySelectorAll('.skill-bar-fill').forEach(bar => bar.classList.remove('active'));
        });
        state = 'hidden';
    }

    // Révèle quand le haut de la grille passe le milieu de l'écran.
    new IntersectionObserver(entries => {
        const entry = entries[0];
        if (entry.isIntersecting) reveal();
        // Arrivé directement plus bas (lien d'ancre, rechargement) : déjà posées.
        else if (entry.boundingClientRect.bottom < 0) reveal({ instant: true });
    }, { rootMargin: '0px 0px -45% 0px' }).observe(grid);

    // Cache les cartes quand la grille repasse entièrement sous l'écran.
    new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0 && state === 'shown') reset();
    }).observe(grid);

    // Un focus clavier sur une carte encore cachée les montre toutes.
    grid.addEventListener('focusin', () => { state = 'shown'; showAll(); });
}
