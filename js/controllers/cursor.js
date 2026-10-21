// ============================================
// CONTRÔLEUR — Curseur « neurone »
// ============================================
// Un point suit la souris exactement ; un anneau le rejoint avec un léger
// retard. Sur un élément cliquable, l'anneau s'agrandit ; au clic, il émet
// une onde. Dans un champ de saisie, le curseur texte natif reprend la main.
// Réservé aux souris (pas d'écran tactile) et désactivé si l'utilisateur
// demande moins d'animations.
import { prefersReducedMotion } from '../utils/dom.js';

const INTERACTIVE = 'a, button, label, select, summary, [role="button"], .project-card';
const TEXT_FIELD = 'input, textarea, [contenteditable="true"]';
const FOLLOW = 0.2; // part de la distance rattrapée par l'anneau à chaque image

export function initNeuralCursor() {
    if (!window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return;

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    for (const el of [dot, ring]) {
        el.setAttribute('aria-hidden', 'true');
        document.body.append(el);
    }
    document.documentElement.classList.add('has-neural-cursor');

    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let frame = null;

    function render() {
        ringPos.x += (target.x - ringPos.x) * FOLLOW;
        ringPos.y += (target.y - ringPos.y) * FOLLOW;
        dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
        ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
        // L'animation s'arrête d'elle-même une fois l'anneau arrivé.
        frame = Math.hypot(target.x - ringPos.x, target.y - ringPos.y) > 0.1
            ? requestAnimationFrame(render)
            : null;
    }

    window.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        target.x = e.clientX;
        target.y = e.clientY;
        document.documentElement.classList.remove('cursor-hidden');

        const el = e.target instanceof Element ? e.target : null;
        const typing = Boolean(el?.closest(TEXT_FIELD));
        document.documentElement.classList.toggle('cursor-typing', typing);
        ring.classList.toggle('is-hovering', !typing && Boolean(el?.closest(INTERACTIVE)));

        if (!frame) frame = requestAnimationFrame(render);
    }, { passive: true });

    document.documentElement.addEventListener('pointerleave', () => {
        document.documentElement.classList.add('cursor-hidden');
    });

    window.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'mouse') return;
        ring.classList.add('is-pressed');
        const wave = document.createElement('div');
        wave.className = 'cursor-wave';
        wave.setAttribute('aria-hidden', 'true');
        wave.style.left = `${e.clientX}px`;
        wave.style.top = `${e.clientY}px`;
        document.body.append(wave);
        wave.addEventListener('animationend', () => wave.remove(), { once: true });
    });

    window.addEventListener('pointerup', () => ring.classList.remove('is-pressed'));
}
