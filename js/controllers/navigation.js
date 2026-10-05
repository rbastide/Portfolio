// ============================================
// CONTRÔLEUR — Navigation
// ============================================
const SECTIONS = ['home', 'about', 'skills', 'projects', 'contact'];

// Surligne le lien de la section qui croise le milieu de l'écran.
// (L'ancien seuil de 30 % ne se déclenchait jamais sur les sections plus
// hautes que ~3 écrans, comme les compétences sur mobile.)
function initActiveLink() {
    const links = document.querySelectorAll('.nav-link[data-section]');
    const setActive = id => links.forEach(l => {
        const active = l.dataset.section === id;
        l.classList.toggle('active', active);
        if (active) l.setAttribute('aria-current', 'true');
        else l.removeAttribute('aria-current');
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

    SECTIONS.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });
}

function initMobileMenu() {
    const nav = document.getElementById('main-nav');
    const toggle = document.getElementById('nav-toggle');
    if (!toggle) return;

    const setOpen = open => {
        nav.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('menu-open')));
    nav.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
}

// Le contenu étant injecté après la séquence de démarrage, le navigateur
// n'a pas pu se positionner sur l'ancre de l'URL (#projects...) au chargement.
function scrollToInitialHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
}

export function initNavigation() {
    initActiveLink();
    initMobileMenu();
    scrollToInitialHash();
}
