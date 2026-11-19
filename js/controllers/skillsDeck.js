// ============================================
// CONTRÔLEUR — Compétences du BUT : cartes jetées sur la table
// ============================================
// Les cartes sont rendues à leur place dans la grille, puis ramenées par un
// transform en un paquet en haut de la grille. Quand le haut de la grille
// atteint le milieu de l'écran, elles partent une à une, dans l'ordre de
// lecture : la carte se soulève, tourne en l'air, retombe à sa place avec un
// léger rebond, et sa barre de niveau se remplit. Chaque carte garde ensuite
// une petite inclinaison (--tilt), comme posée à la main.
// En remontant au-dessus de la section, le paquet se reforme pour le
// prochain passage.
import { prefersReducedMotion } from '../utils/dom.js';

const THROW_MS = 950;
const STAGGER_MS = 130;
// Inclinaison de chaque carte une fois posée, puis dans le paquet (degrés).
const TILTS = [-1.6, 1.2, -0.8, 1.8, -1.3, 0.9];
const PILE_TILTS = [-4, 3, -2, 5, -6, 2];

const SHADOW_REST = '0 2px 8px rgba(0, 0, 0, 0.2)';
const SHADOW_AIR = '0 34px 60px rgba(0, 0, 0, 0.55)';
const SHADOW_LAND = '0 4px 12px rgba(0, 0, 0, 0.3)';

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

    let state = 'dealt';
    let animations = [];

    // Décalage qui amène chaque carte sur le paquet, en haut au centre de la
    // grille. Mesuré sur la mise en page (offset*, relatifs à la grille qui est
    // en position: relative), qui ignore les transforms.
    function pileOffsets() {
        const centerX = grid.clientWidth / 2;
        const centerY = cards[0].offsetHeight / 2;
        return cards.map((card, i) => ({
            x: centerX - (card.offsetLeft + card.offsetWidth / 2),
            y: centerY - (card.offsetTop + card.offsetHeight / 2) - i * 3,
            r: PILE_TILTS[i % PILE_TILTS.length]
        }));
    }

    const pileTransform = o => `translate(${o.x.toFixed(1)}px, ${o.y.toFixed(1)}px) rotate(${o.r}deg)`;

    function stack() {
        animations.forEach(a => a.cancel());
        animations = [];
        pileOffsets().forEach((o, i) => {
            const card = cards[i];
            card.style.transition = 'none';
            card.style.transform = pileTransform(o);
            // La première carte distribuée est sur le dessus du paquet.
            card.style.zIndex = String(cards.length - i);
            card.querySelectorAll('.skill-bar-fill').forEach(bar => bar.classList.remove('active'));
        });
        grid.classList.add('is-stacked');
        state = 'stacked';
    }

    function settle(card) {
        card.style.transform = '';
        card.style.zIndex = '';
        // Rend la transition CSS (redressement au survol) une fois la carte posée.
        requestAnimationFrame(() => { card.style.transition = ''; });
    }

    function deal({ instant = false } = {}) {
        if (state !== 'stacked') return;
        state = 'dealt';
        grid.classList.remove('is-stacked');

        if (instant) {
            cards.forEach(card => { settle(card); fillBars(card); });
            return;
        }

        animations = pileOffsets().map((o, i) => {
            const card = cards[i];
            const tilt = TILTS[i % TILTS.length];
            const spin = (i % 2 ? 1 : -1) * (8 + i * 2);
            const delay = i * STAGGER_MS;
            // Point haut de la trajectoire : un peu après la moitié du chemin, soulevée.
            const air = `translate(${(o.x * 0.55).toFixed(1)}px, ${(o.y * 0.55 - 36).toFixed(1)}px) rotate(${spin}deg) scale(1.07)`;

            card.style.transform = '';
            // Au-dessus des autres pendant son vol, puis elle reprend sa place.
            card.style.zIndex = String(cards.length * 2 - i);
            const anim = card.animate([
                { transform: pileTransform(o), boxShadow: SHADOW_REST, offset: 0 },
                { transform: air, boxShadow: SHADOW_AIR, offset: 0.42 },
                { transform: `rotate(${tilt * 0.4}deg) scale(0.985)`, boxShadow: SHADOW_LAND, offset: 0.82 },
                { transform: `rotate(${tilt}deg) scale(1)`, boxShadow: SHADOW_REST, offset: 1 }
            ], {
                duration: THROW_MS,
                delay,
                easing: 'cubic-bezier(0.3, 0.7, 0.25, 1)',
                fill: 'backwards'
            });
            anim.onfinish = () => settle(card);
            fillBars(card, delay + THROW_MS * 0.8);
            return anim;
        });
    }

    // Distribue quand le haut de la grille passe le milieu de l'écran.
    new IntersectionObserver(entries => {
        const entry = entries[0];
        if (entry.isIntersecting) deal();
        // Arrivé directement plus bas (lien d'ancre, rechargement) : déjà posées.
        else if (entry.boundingClientRect.bottom < 0) deal({ instant: true });
    }, { rootMargin: '0px 0px -45% 0px' }).observe(grid);

    // Reforme le paquet quand la grille repasse entièrement sous l'écran.
    new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0 && state === 'dealt') stack();
    }).observe(grid);

    // Un focus clavier sur une carte empilée la distribue tout de suite.
    grid.addEventListener('focusin', () => deal({ instant: true }));

    // Le paquet suit la mise en page tant qu'il n'est pas distribué.
    new ResizeObserver(() => {
        if (state !== 'stacked') return;
        pileOffsets().forEach((o, i) => { cards[i].style.transform = pileTransform(o); });
    }).observe(grid);

    stack();
}
