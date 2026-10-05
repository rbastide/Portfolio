// ============================================
// CONTRÔLEUR — Interactions des sections
// ============================================

// Apparition progressive des éléments .reveal + animation des barres de compétences.
export function initReveal() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            entry.target.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
                setTimeout(() => bar.classList.add('active'), 200 + i * 100);
            });
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
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

// Filtres de projets par catégorie.
export function initProjectFilters() {
    const bar = document.querySelector('.project-filters');
    if (!bar) return;
    const cards = document.querySelectorAll('.project-card');

    bar.addEventListener('click', e => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        const filter = btn.dataset.filter;

        bar.querySelectorAll('.filter-btn').forEach(b => {
            const active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', String(active));
        });

        cards.forEach(card => {
            const match = filter === 'all' || card.dataset.category === filter;
            card.hidden = !match;
            // Une carte jamais vue mais révélée par le filtre doit apparaître directement.
            if (match) card.classList.add('visible');
        });
    });
}

// Mini-terminal de la section contact.
export function initConsole() {
    const root = document.querySelector('.console');
    if (!root) return;
    const input = root.querySelector('#console-input');
    const out = root.querySelector('#console-response');
    const { email, github } = root.dataset;

    const print = (text, cls = 'text-tertiary') => {
        out.textContent = text;
        out.className = cls;
    };

    const commands = {
        help: () => print('[COMMANDES : status, cv, github, mail, clear]', 'text-primary'),
        status: () => print('[SYSTEM: OPTIMAL // BUT INFO // RECHERCHE ALTERNANCE MASTER IA]'),
        cv: () => {
            print(`[CV : ouverture d'un mail vers ${email}...]`, 'text-secondary');
            window.location.href = `mailto:${email}?subject=${encodeURIComponent('Demande de CV')}`;
        },
        mail: () => {
            print(`[MAIL : ${email}]`, 'text-secondary');
            window.location.href = `mailto:${email}`;
        },
        github: () => {
            print(`[REDIRECTION : ${github.replace('https://', '')}...]`, 'text-secondary');
            window.open(github, '_blank', 'noopener');
        },
        clear: () => print('[OK: READY FOR QUERY]')
    };

    input.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const cmd = input.value.trim().toLowerCase();
        input.value = '';
        if (!cmd) return;
        if (commands[cmd]) commands[cmd]();
        else print(`[COMMANDE INTROUVABLE : ${cmd}] — essayez 'help'`, 'is-error');
    });
}
