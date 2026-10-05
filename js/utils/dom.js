// ============================================
// UTILITAIRES
// ============================================
export const sleep = ms => new Promise(r => setTimeout(r, ms));

export const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];
