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
                setTimeout(() => bar.classList.add('active'), i * 100);
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
        const btn = e.target.closest('.skill-details-toggle');
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

// Le formulaire ouvre le client mail avec les champs pré-remplis
// (pas de backend : l'ancien formulaire affichait "envoyé" sans rien envoyer).
export function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const hint = form.querySelector('.form-hint');

    form.addEventListener('submit', e => {
        e.preventDefault();
        const data = new FormData(form);
        const subject = `Contact portfolio — ${data.get('name')}`;
        const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
        window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        hint.textContent = '> Ouverture de votre client mail...';
    });
}
