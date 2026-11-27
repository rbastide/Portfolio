// ============================================
// CONTRÔLEUR — Dock façon macOS (views/dock.js)
// ============================================
// Agrandissement des icônes sous la souris, rebond au lancement, point sous
// les applications ouvertes, vignettes des fenêtres réduites.
// Les liens vers les sections sont de simples ancres : la navigation et la
// vitrine des projets (controllers/showcase.js) les gèrent déjà.
import { prefersReducedMotion } from '../utils/dom.js';
import { dockHTML, dockMinHTML } from '../views/dock.js';

const BASE = 48, MAX = 76, RANGE = 150; // taille au repos, taille maxi, portée de l'effet (px)
const reduced = prefersReducedMotion();
let dock = null;

export function initDock() {
    document.body.insertAdjacentHTML('beforeend', dockHTML());
    dock = document.querySelector('.dock');

    // Lancer une section la fait rebondir ; une application déjà ouverte ne rebondit pas.
    dock.addEventListener('click', e => {
        const item = e.target.closest('.dock-apps .dock-item');
        if (item && !item.classList.contains('is-running')) bounce(item);
    });

    if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    // Agrandissement : chaque icône grossit selon sa distance à la souris, mesurée
    // sur les positions au repos (sinon l'effet se nourrit de lui-même et tremble).
    let centers = null;
    const items = () => [...dock.querySelectorAll('.dock-item')];
    dock.addEventListener('mouseenter', () => {
        centers = items().map(it => { const r = it.getBoundingClientRect(); return [it, r.left + r.width / 2]; });
    });
    dock.addEventListener('mousemove', e => {
        if (!centers) return;
        for (const [it, c] of centers) {
            const k = Math.cos(Math.min(Math.abs(e.clientX - c) / RANGE, 1) * Math.PI / 2);
            it.style.setProperty('--size', `${BASE + (MAX - BASE) * k}px`);
        }
    });
    dock.addEventListener('mouseleave', () => {
        centers = null;
        items().forEach(it => it.style.removeProperty('--size'));
    });
}

export const dockApp = app => dock?.querySelector(`[data-app="${app}"]`);

export function setRunning(app, on) {
    dockApp(app)?.classList.toggle('is-running', on);
}

export function bounce(item) {
    if (reduced) return;
    item.querySelector('.dock-icon').animate(
        [{ translate: '0 0' }, { translate: '0 -22px' }, { translate: '0 0' }, { translate: '0 -10px' }, { translate: '0 0' }],
        { duration: 700, easing: 'ease-in-out' });
}

// Ajoute la vignette d'une fenêtre réduite ; un clic dessus appelle onRestore(li).
export function addMinimized(label, onRestore) {
    const list = dock.querySelector('.dock-min');
    list.insertAdjacentHTML('beforeend', dockMinHTML(label));
    const li = list.lastElementChild;
    li.querySelector('button').addEventListener('click', () => onRestore(li));
    if (!reduced) li.animate([{ width: '0px', opacity: 0 }, { width: `${BASE}px`, opacity: 1 }], { duration: 250, easing: 'ease-out' });
    return li;
}

export function removeMinimized(li) {
    if (reduced) return li.remove();
    li.animate([{ width: `${li.offsetWidth}px`, opacity: 1 }, { width: '0px', opacity: 0 }], { duration: 200, easing: 'ease-in' })
        .finished.then(() => li.remove(), () => li.remove());
}
