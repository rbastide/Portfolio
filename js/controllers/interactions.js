// ============================================
// CONTRÔLEUR — Interactions des sections
// ============================================

// Apparition progressive des éléments .reveal + animation des barres de compétences.
// Les éléments qui entrent à l'écran ensemble apparaissent en cascade, dans l'ordre
// de lecture ; ceux qu'un saut d'ancre a fait passer sans les montrer s'affichent
// directement, pour ne jamais laisser de zone vide en remontant.
const STAGGER = 80;     // ms entre deux éléments d'un même groupe
const MAX_STAGGER = 6;  // au-delà, le reste du groupe arrive ensemble

function showReveal(el, delay = 0, instant = false) {
    el.style.setProperty('--reveal-delay', `${delay}ms`);
    el.classList.toggle('instant', instant);
    el.classList.add('visible');
    el.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
        setTimeout(() => bar.classList.add('active'), (instant ? 0 : delay + 250) + i * 90);
    });
}

export function initReveal() {
    const pending = new Set(document.querySelectorAll('.reveal'));
    const byDocumentOrder = (a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

    const observer = new IntersectionObserver(entries => {
        entries
            .filter(e => e.isIntersecting)
            .map(e => e.target)
            .sort(byDocumentOrder)
            .forEach((el, i) => {
                showReveal(el, Math.min(i, MAX_STAGGER) * STAGGER);
                pending.delete(el);
                observer.unobserve(el);
            });

        pending.forEach(el => {
            if (el.getBoundingClientRect().bottom > 0) return;
            showReveal(el, 0, true);
            pending.delete(el);
            observer.unobserve(el);
        });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

    pending.forEach(el => observer.observe(el));
    // Masque les éléments à révéler seulement maintenant que l'observateur tourne.
    document.documentElement.classList.add('reveal-ready');
}

// Ouverture / fermeture des détails d'une compétence (délégation d'événement).
export function initSkillDetails() {
    const grid = document.querySelector('.skills-grid');
    if (!grid) return;

    grid.addEventListener('click', e => {
        const btn = e.target.closest('.skill-toggle');
        if (!btn) return;
        const details = document.getElementById(`details-${btn.dataset.skill}`);
        const open = !btn.classList.contains('open');
        btn.classList.toggle('open', open);
        details.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
    });
}
