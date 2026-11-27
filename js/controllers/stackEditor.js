// ============================================
// CONTRÔLEUR — Éditeur de la stack (views/skills.js)
// ============================================
// Onglets : une catégorie par fichier. Pastilles de fenêtre, reliées au Dock (controllers/dock.js) :
// - fermer : l'application quitte, l'icône « Stack » du Dock la relance sur le premier onglet ;
// - réduire : effet génie vers une vignette du Dock, qui la restaure telle quelle ;
// - agrandir : plein écran, comme un projet agrandi (Échap ou la pastille pour revenir).
import { prefersReducedMotion } from '../utils/dom.js';
import { dockApp, setRunning, addMinimized, removeMinimized, bounce } from './dock.js';

const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

export function initStackEditor() {
    const app = document.querySelector('.stack-app');
    if (!app) return;
    const editor = app.querySelector('.stack-editor');
    const tabs = [...app.querySelectorAll('.editor-tab')];
    const panels = [...app.querySelectorAll('.editor-panels > .editor-code')];
    const maxBtn = app.querySelector('[data-win="max"]');
    const root = document.documentElement;
    const reduced = prefersReducedMotion();

    // ---------- Onglets ----------
    function select(i, focus) {
        tabs.forEach((t, j) => {
            t.setAttribute('aria-selected', String(i === j));
            t.tabIndex = i === j ? 0 : -1;
            panels[j].classList.toggle('is-active', i === j);
        });
        app.querySelector('.editor-lang').textContent = tabs[i].dataset.lang;
        if (focus) tabs[i].focus();
        tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
        if (reduced) return;
        // Le fichier s'écrit ligne à ligne, comme à l'apparition de l'éditeur.
        panels[i].querySelectorAll('.code-line').forEach((line, k) => line.animate(
            [{ opacity: 0, translate: '-8px 0' }, { opacity: 1, translate: '0 0' }],
            { duration: 300, delay: k * 30, easing: EASE, fill: 'backwards' }));
    }

    tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
    app.querySelector('.editor-tabs').addEventListener('keydown', e => {
        const i = tabs.indexOf(document.activeElement);
        const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (i < 0 || next === undefined) return;
        e.preventDefault();
        select((next + tabs.length) % tabs.length, true);
    });

    // ---------- Plein écran ----------
    // FLIP : on passe dans l'état final, puis on anime depuis l'ancienne position.
    function flip(change) {
        const from = editor.getBoundingClientRect();
        change();
        if (reduced) return;
        const to = editor.getBoundingClientRect();
        editor.animate([
            { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`, transformOrigin: 'top left' },
            { transform: 'none', transformOrigin: 'top left' }
        ], { duration: 440, easing: EASE });
    }

    const isMax = () => editor.classList.contains('is-maximized');

    function setMax(on) {
        if (on === isMax()) return;
        flip(() => {
            // La place de l'éditeur reste réservée : la page ne saute pas.
            app.style.minHeight = on ? `${editor.offsetHeight}px` : '';
            editor.classList.toggle('is-maximized', on);
            root.classList.toggle('editor-max', on);
            root.classList.toggle('is-locked', on);
        });
        maxBtn.setAttribute('aria-pressed', String(on));
        maxBtn.setAttribute('aria-label', on ? "Quitter le plein écran" : "Agrandir l'éditeur en plein écran");
    }

    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isMax()) setMax(false); });
    // Une techno cliquée ouvre les projets (controllers/interactions.js) : on sort du plein écran d'abord.
    editor.addEventListener('click', e => { if (e.target.closest('[data-filter-tech]')) setMax(false); });

    // ---------- Réduire / fermer / relancer, via le Dock ----------
    // state : 'open', 'min' (vignette dans le Dock) ou 'closed' (application quittée).
    let state = 'open', tile = null;
    setRunning('stack', true);

    // Effet « génie » : le bas de la fenêtre se resserre vers la vignette, puis
    // toute la fenêtre s'y engouffre. À l'envers pour la restaurer.
    function genie(target, reverse) {
        const from = editor.getBoundingClientRect(), to = target.getBoundingClientRect();
        const cx = to.left + to.width / 2 - from.left, hw = to.width / 2;
        const bottom = `${cx + hw}px 100%, ${cx - hw}px 100%`;
        editor.style.transformOrigin = 'top';
        const anim = editor.animate([
            { clipPath: 'polygon(0px 0%, 100% 0%, 100% 100%, 0px 100%)', transform: 'none', opacity: 1 },
            { clipPath: `polygon(0px 0%, 100% 0%, ${bottom})`, transform: 'none', opacity: 1, offset: 0.4 },
            { clipPath: `polygon(${cx - hw}px 0%, ${cx + hw}px 0%, ${bottom})`, transform: `translateY(${to.top - from.top}px) scaleY(${to.height / from.height})`, opacity: 0.4 }
        ], { duration: 560, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', direction: reverse ? 'reverse' : 'normal' });
        const reset = () => { editor.style.transformOrigin = ''; };
        anim.finished.then(reset, reset);
        return anim;
    }

    const focusTab = () => tabs.find(t => t.tabIndex === 0).focus({ preventScroll: true });

    function minimize() {
        setMax(false);
        state = 'min';
        tile = addMinimized('stack.ts', restore);
        const done = () => { editor.hidden = true; tile.querySelector('button').focus(); };
        if (reduced) return done();
        genie(tile.querySelector('.dock-icon')).finished.then(done, done);
    }

    function restore() {
        if (state !== 'min') return;
        state = 'open';
        editor.hidden = false;
        editor.scrollIntoView({ block: 'center' });
        const li = tile;
        tile = null;
        const done = () => removeMinimized(li);
        focusTab();
        if (reduced) return done();
        genie(li.querySelector('.dock-icon'), true).finished.then(done, done);
    }

    // Fermer quitte l'application : plus de point dans le Dock.
    function close() {
        setMax(false);
        state = 'closed';
        setRunning('stack', false);
        const done = () => { editor.hidden = true; dockApp('stack')?.focus(); };
        if (reduced) return done();
        editor.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(0.96)', opacity: 0 }],
            { duration: 200, easing: 'ease-in' }).finished.then(done, done);
    }

    // Relancer : la fenêtre monte depuis le Dock, sur le premier onglet.
    function launch() {
        state = 'open';
        // Le Dock ne fait rebondir que les applications arrêtées, et celle-ci tourne déjà quand le clic lui parvient.
        bounce(dockApp('stack'));
        setRunning('stack', true);
        select(0);
        editor.hidden = false;
        focusTab();
        if (!reduced) editor.animate([{ transform: 'translateY(30%) scale(0.6)', opacity: 0 }, { transform: 'none', opacity: 1 }],
            { duration: 450, easing: EASE });
    }

    // L'icône « Stack » du Dock : un lien vers la section, qui rouvre ou restaure l'éditeur au passage.
    dockApp('stack')?.addEventListener('click', e => {
        if (state === 'closed') launch();
        else if (state === 'min') { e.preventDefault(); restore(); }
    });

    app.querySelector('[data-win="close"]').addEventListener('click', close);
    app.querySelector('[data-win="min"]').addEventListener('click', minimize);
    maxBtn.addEventListener('click', () => setMax(!isMax()));
}
