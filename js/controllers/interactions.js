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

// Filtres de projets : recherche texte + type, contexte et technologie.
// Les critères se cumulent ; recliquer sur une option active la désactive.
// Les technologies de la section Stack et des lignes de projet appliquent
// aussi le filtre « Technologie » (attribut data-tech / data-filter-tech).
export function initProjectFilters() {
    const bar = document.querySelector('.project-filters');
    if (!bar) return;

    const rows = [...document.querySelectorAll('.project-row')];
    const options = [...bar.querySelectorAll('.filter-btn')];
    const search = bar.querySelector('#project-search');
    const results = bar.querySelector('#project-results');
    const reset = bar.querySelector('#filter-reset');
    const more = bar.querySelector('#tech-more');
    const empty = document.getElementById('project-empty');

    const state = { category: null, context: null, tech: null, query: '' };
    const normalize = text => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

    const matches = (row, s) =>
        (!s.category || row.dataset.category === s.category) &&
        (!s.context || row.dataset.context === s.context) &&
        (!s.tech || row.dataset.tech.split('|').includes(s.tech)) &&
        (!s.query || s.query.split(/\s+/).every(word => row.dataset.search.includes(word)));

    function update() {
        let shown = 0;
        rows.forEach(row => {
            const match = matches(row, state);
            row.hidden = !match;
            // Une ligne jamais vue mais révélée par le filtre doit apparaître directement.
            if (match) { row.classList.add('visible'); shown++; }
        });

        // Chaque option affiche combien de projets elle donnerait avec les autres critères.
        options.forEach(btn => {
            const { group, value } = btn.dataset;
            const active = state[group] === value;
            const count = rows.filter(row => matches(row, { ...state, [group]: value })).length;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
            btn.querySelector('.filter-count').textContent = count;
            btn.disabled = !active && count === 0;
        });

        const filtered = Boolean(state.category || state.context || state.tech || state.query);
        results.textContent = filtered
            ? `${shown} projet${shown > 1 ? 's' : ''} sur ${rows.length}`
            : `${rows.length} projets`;
        reset.disabled = !filtered;
        empty.hidden = shown > 0;
    }

    function toggleMore(open = more.getAttribute('aria-expanded') !== 'true') {
        bar.classList.toggle('show-all-tech', open);
        more.setAttribute('aria-expanded', String(open));
        more.textContent = open ? 'Voir moins' : `+ ${options.filter(b => b.classList.contains('is-extra')).length} autres`;
    }

    function setTech(tech) {
        state.tech = tech;
        // Une techno masquée derrière « Voir plus » doit rester visible une fois choisie.
        if (more && options.some(b => b.dataset.value === tech && b.classList.contains('is-extra'))) toggleMore(true);
        update();
    }

    function clear() {
        Object.assign(state, { category: null, context: null, tech: null, query: '' });
        search.value = '';
        update();
    }

    bar.addEventListener('click', e => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        const { group, value } = btn.dataset;
        state[group] = state[group] === value ? null : value;
        update();
    });

    search.addEventListener('input', () => {
        state.query = normalize(search.value);
        update();
    });

    reset.addEventListener('click', clear);
    more?.addEventListener('click', () => toggleMore());

    document.addEventListener('click', e => {
        if (e.target.closest('[data-reset-filters]')) { clear(); return; }

        const chip = e.target.closest('.chip-tech, [data-filter-tech]');
        if (!chip) return;
        const tech = chip.dataset.tech || chip.dataset.filterTech;
        setTech(state.tech === tech && chip.classList.contains('chip-tech') ? null : tech);
        // Depuis la section Stack, on emmène le visiteur jusqu'aux projets filtrés.
        if (chip.dataset.filterTech) {
            document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
        }
    });

    update();
}

