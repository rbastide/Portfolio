// ============================================
// VUE — Projets : vitrine plein écran
// ============================================
// Tous les projets tiennent sur un seul écran, sans scroll ni carrousel : une
// grille de cartes compactes. Au bout du parcours, le réseau lancé par les
// mains s'écrase au sol et ses éclats forment des flaques d'huile qui font
// apparaître les cartes une à une (controllers/showcase.js). Un clic sur une
// carte l'agrandit en plein écran (.sc-zoom) ; « Continuer » rend la page.
// Les filtres sont repliés derrière un seul bouton discret.
import { getCategories, getContexts } from '../data/projects.js';

const pad = n => String(n).padStart(2, '0');

// Projets mis en avant en tête, l'ordre d'origine est conservé sinon.
export const sortProjects = projects =>
    [...projects].sort((a, b) => (b.featured === true) - (a.featured === true));

function cardHTML(p, i) {
    return `
        <li class="sc-cell" data-category="${p.category}" data-context="${p.context}" data-tech="${p.tech.join('|')}">
            <button type="button" class="sc-card" id="project-${p.id}" data-project="${p.id}" aria-haspopup="dialog"
                aria-label="${p.title} — voir le détail">
                <span class="sc-card-top">
                    <span class="sc-index">${pad(i + 1)}</span>
                    <span class="sc-icon icon" aria-hidden="true">${p.icon || 'folder'}</span>
                </span>
                <span class="sc-title">${p.title}</span>
                <span class="sc-meta">${[p.category, p.period || p.context].filter(Boolean).join(' · ')}</span>
                <span class="sc-desc">${p.desc}</span>
                <span class="sc-tech">${p.tech.slice(0, 4).map(t => `<span>${t}</span>`).join('')}</span>
                <span class="sc-open icon" aria-hidden="true">open_in_full</span>
            </button>
        </li>`;
}

function filterGroupHTML(group, label, values) {
    return `
            <div class="sc-filter-group" role="group" aria-label="${label}">
                <span class="sc-filter-label">${label}</span>
                ${values.map(v => `<button type="button" class="sc-filter-opt" data-group="${group}" data-value="${v}" aria-pressed="false">${v}</button>`).join('')}
            </div>`;
}

export function projectsHTML({ projects }) {
    const sorted = sortProjects(projects);

    return `
    <section id="projects" class="showcase" aria-labelledby="projects-heading" style="--count: ${sorted.length}">
        <canvas class="sc-bg" aria-hidden="true"></canvas>
        <canvas class="sc-canvas" aria-hidden="true"></canvas>

        <div class="sc-inner">
            <header class="sc-head">
                <h2 id="projects-heading" class="sc-heading">Projets <span class="sc-total">${pad(sorted.length)}</span></h2>
                <div class="sc-filters">
                    <button type="button" class="sc-filter-toggle" aria-expanded="false" aria-controls="sc-filter-panel">
                        <span class="icon" aria-hidden="true">tune</span><span class="sc-filter-state">Filtrer</span>
                    </button>
                    <div class="sc-filter-panel" id="sc-filter-panel" hidden>
                        ${filterGroupHTML('category', 'Type', getCategories())}
                        ${filterGroupHTML('context', 'Contexte', getContexts())}
                        <button type="button" class="sc-filter-reset" disabled>Tout afficher</button>
                    </div>
                </div>
            </header>

            <ul class="sc-grid" role="list">
                ${sorted.map(cardHTML).join('')}
            </ul>

            <footer class="sc-foot">
                <button type="button" class="sc-skip">Passer l'animation<span class="icon" aria-hidden="true">fast_forward</span></button>
                <button type="button" class="btn btn-primary sc-continue">Continuer<span class="icon" aria-hidden="true">south</span></button>
            </footer>
        </div>

        <div class="sc-zoom" role="dialog" aria-modal="true" aria-labelledby="sc-zoom-title" hidden>
            <canvas class="sc-zoom-ink" aria-hidden="true"></canvas>
            <div class="sc-zoom-body" tabindex="-1"></div>
            <button type="button" class="sc-zoom-close" aria-label="Fermer le projet"><span class="icon" aria-hidden="true">close</span></button>
        </div>
    </section>`;
}

function livrableHTML(l) {
    return l.private || !l.url
        ? `<span class="sc-link is-private"><span class="icon" aria-hidden="true">lock</span>${l.nom} (privé, bientôt public)</span>`
        : `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="sc-link">${l.nom}<span class="icon" aria-hidden="true">arrow_outward</span></a>`;
}

// Contenu du projet agrandi.
export function projectDetailHTML(p, i) {
    return `
            <div class="sc-detail">
                <div class="sc-detail-top">
                    <span class="sc-index">${pad(i + 1)}</span>
                    <span class="sc-icon icon" aria-hidden="true">${p.icon || 'folder'}</span>
                    <span class="sc-meta">${[p.category, p.context, p.period].filter(Boolean).join(' · ')}</span>
                </div>
                <h3 id="sc-zoom-title" class="sc-detail-title">${p.title}</h3>
                <p class="sc-detail-desc">${p.desc}</p>
                <div class="sc-detail-role">
                    <span class="sc-filter-label">Mon rôle</span>
                    <p>${p.role}</p>
                </div>
                <ul class="sc-detail-tech" aria-label="Technologies">
                    ${p.tech.map(t => `<li>${t}</li>`).join('')}
                    ${(p.tags || []).map(t => `<li class="is-ac">${t}</li>`).join('')}
                </ul>
                <div class="sc-detail-links">${p.livrables.map(livrableHTML).join('')}</div>
            </div>`;
}
