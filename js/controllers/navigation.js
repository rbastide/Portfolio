// ============================================
// CONTRÔLEUR — Navigation
// ============================================
// Les projets sont un calque plein écran (controllers/showcase.js), pas une
// section du défilement : ils ne sont pas suivis ici.
const SECTIONS = ['about', 'skills', 'contact'];

// Pas d'en-tête sur le parcours d'ouverture : il apparaît une fois le parcours
// sorti par le haut de l'écran (et reste masqué sur la vitrine des projets).
function initHeaderVisibility() {
    const story = document.getElementById('story');
    if (!story) return;
    const root = document.documentElement;
    new IntersectionObserver(([entry]) => {
        root.classList.toggle('nav-hidden', entry.isIntersecting);
    }, { rootMargin: '0px 0px -99% 0px', threshold: 0 }).observe(story);
}

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

    const icon = toggle.querySelector('.icon');
    const setOpen = open => {
        nav.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        icon.textContent = open ? 'close' : 'menu';
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('menu-open')));
    nav.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', e => { if (!nav.contains(e.target)) setOpen(false); });
}

// Le contenu étant injecté après la séquence de démarrage, le navigateur
// n'a pas pu se positionner sur l'ancre de l'URL (#projects...) au chargement.
function scrollToInitialHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    // Les ancres de projets sont ouvertes par la vitrine.
    if (!id || id === 'projects' || id.startsWith('project-')) return;
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
}

export function initNavigation() {
    initHeaderVisibility();
    initActiveLink();
    initMobileMenu();
    scrollToInitialHash();
}
