// ============================================
// VUE — Dock façon macOS (controllers/dock.js)
// ============================================
// Une icône par section. « Stack » est aussi l'application de l'éditeur de la
// stack : un point dessous quand elle est ouverte. À droite du séparateur, les
// fenêtres réduites.
const ITEMS = [
    { id: 'story', label: 'Accueil', icon: 'home' },
    { id: 'projects', label: 'Projets', icon: 'folder_open' },
    { id: 'skills', label: 'Stack', icon: 'terminal', app: 'stack' },
    { id: 'about', label: 'À propos', icon: 'person' },
    { id: 'contact', label: 'Contact', icon: 'mail' }
];

export function dockHTML() {
    return `
    <nav class="dock" aria-label="Dock">
        <ul class="dock-apps" role="list">
            ${ITEMS.map(i => `
            <li><a class="dock-item" href="#${i.id}" data-label="${i.label}"${i.app ? ` data-app="${i.app}"` : ''}>
                <span class="dock-icon"><span class="icon" aria-hidden="true">${i.icon}</span></span>
                <span class="sr-only">${i.label}</span>
            </a></li>`).join('')}
        </ul>
        <span class="dock-sep" aria-hidden="true"></span>
        <ul class="dock-min" role="list" aria-label="Fenêtres réduites"></ul>
    </nav>`;
}

// Vignette d'une fenêtre réduite.
export function dockMinHTML(label) {
    return `
            <li><button type="button" class="dock-item" data-label="${label}" aria-label="Restaurer ${label}">
                <span class="dock-icon dock-thumb" aria-hidden="true"><span class="dock-thumb-bar"><i></i><i></i><i></i></span><span class="dock-thumb-lines"></span></span>
            </button></li>`;
}
