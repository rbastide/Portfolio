// ============================================
// CONTRÔLEUR — Projets : piste horizontale pilotée par le scroll
// ============================================
// La scène (.projects-pin) reste collée à l'écran pendant que la section
// défile ; le scroll vertical fait glisser la piste de cartes de droite à
// gauche. La hauteur de la section vaut la hauteur de la scène + la longueur
// à parcourir, recalculée quand les filtres changent le nombre de cartes.
// Comme pour le parcours, la piste rattrape le scroll avec un léger retard.
import { prefersReducedMotion } from '../utils/dom.js';

const SMOOTHING = 8;  // vitesse de rattrapage du scroll (plus haut = plus sec)
// Pauses, en part de la hauteur de la scène : la piste reste immobile un
// moment avant de glisser, puis sur le dernier projet avant que la page ne
// reprenne son défilement, le temps de le lire.
const HOLD_START = 0.2;
const HOLD_END = 0.7;

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const pad = n => String(n).padStart(2, '0');

export function initProjectsTrack() {
    const section = document.getElementById('projects');
    const pin = section?.querySelector('.projects-pin');
    const viewport = section?.querySelector('.project-viewport');
    const track = section?.querySelector('.project-track');
    if (!pin || !viewport || !track) return;

    const rows = [...track.querySelectorAll('.project-row')];
    const counter = section.querySelector('[data-project-count]');
    const total = section.querySelector('[data-project-total]');
    const fill = section.querySelector('.project-progress-fill');
    const visibleRows = () => rows.filter(r => !r.hidden);

    // Mouvement réduit : pas de scène collée, la piste défile à la main.
    if (prefersReducedMotion()) {
        section.classList.add('is-static');
        return;
    }
    section.classList.add('is-pinned');

    let travel = 0, holdStart = 0, target = 0, current = 0, frame = 0, last = 0;
    let shownCount = visibleRows().length;

    const sectionTop = () => section.getBoundingClientRect().top + window.scrollY;

    function layout() {
        travel = Math.max(0, track.offsetWidth - viewport.clientWidth);
        // Sans glissement (peu de cartes après un filtre), pas de pause non plus.
        const height = pin.offsetHeight;
        holdStart = travel > 0 ? height * HOLD_START : 0;
        const holdEnd = travel > 0 ? height * HOLD_END : 0;
        section.style.height = `${height + holdStart + travel + holdEnd}px`;
    }

    function measure() {
        const scrolled = -section.getBoundingClientRect().top - holdStart;
        target = travel > 0 ? clamp(scrolled / travel) : 0;
    }

    function apply(p) {
        track.style.transform = `translate3d(${(-p * travel).toFixed(1)}px, 0, 0)`;
        fill.style.transform = `scaleX(${p.toFixed(4)})`;
        const count = visibleRows().length;
        counter.textContent = pad(count ? Math.round(p * (count - 1)) + 1 : 0);
        total.textContent = pad(count);
        section.classList.toggle('is-end', p > 0.98 || travel === 0);
    }

    function tick(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        current += (target - current) * (1 - Math.exp(-SMOOTHING * dt));
        if (Math.abs(target - current) < 0.0005) current = target;
        apply(current);
        frame = current === target ? 0 : requestAnimationFrame(tick);
    }

    function wake() {
        measure();
        const rect = section.getBoundingClientRect();
        // Hors de l'écran, inutile d'animer : on se cale directement.
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
            current = target;
            apply(current);
            return;
        }
        if (!frame) {
            last = performance.now();
            frame = requestAnimationFrame(tick);
        }
    }

    function relayout() {
        const count = visibleRows().length;
        const filtered = count !== shownCount;
        shownCount = count;
        layout();
        // Un filtre change la longueur de la piste : on revient au début
        // des résultats si on était déjà dans la section.
        if (filtered && section.getBoundingClientRect().top < 0) {
            window.scrollTo({ top: sectionTop(), behavior: 'auto' });
        }
        measure();
        current = target;
        apply(current);
    }

    // Un focus clavier sur une carte hors champ amène le scroll jusqu'à elle.
    // La piste n'est déplacée que par transform : le navigateur ne doit pas
    // faire défiler la fenêtre de la piste lui-même.
    track.addEventListener('focusin', e => {
        viewport.scrollLeft = 0;
        const card = e.target.closest('.project-row');
        if (!card || !travel) return;
        const start = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        const p = clamp((card.offsetLeft - start) / travel);
        window.scrollTo({ top: sectionTop() + holdStart + p * travel, behavior: 'auto' });
    });
    viewport.addEventListener('scroll', () => { viewport.scrollLeft = 0; });

    const resize = new ResizeObserver(relayout);
    resize.observe(track);
    resize.observe(pin);

    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    relayout();
}
