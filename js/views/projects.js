// ============================================
// VUE — Projets
// ============================================
// Une scène collée à l'écran : en-tête, barre de filtres compacte (recherche
// + menus Type, Contexte, Technologie), puis une piste horizontale de cartes
// que le scroll vertical fait glisser (controllers/projectsTrack.js). Le
// filtrage est géré par initProjectFilters (controllers/interactions.js).
import { getCategories, getContexts, getTechCounts } from '../data/projects.js';

const normalize = text => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const pad = n => String(n).padStart(2, '0');

function livrableHTML(l) {
    return l.private
        ? `<span class="project-link is-private" title="Dépôt privé — bientôt public"><span class="icon">lock</span>${l.nom} (bientôt public)</span>`
        : `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="project-link">${l.nom}<span class="icon">arrow_outward</span></a>`;
}

function projectCardHTML(p, i) {
    const search = normalize([p.title, p.desc, p.role, p.context, p.category, ...p.tech, ...(p.keywords || [])].join(' '));
    return `
    <article class="project-row" data-category="${p.category}" data-context="${p.context}"
        data-tech="${p.tech.join('|')}" data-search="${search.replace(/"/g, '')}">
        <div class="project-top">
            <span class="project-index">${pad(i + 1)}</span>
            <span class="project-icon"><span class="icon">${p.icon || 'folder'}</span></span>
            <div class="project-side-text">
                ${p.period ? `<span class="project-period">${p.period}</span>` : ''}
                <span class="project-context">${p.context}</span>
                ${p.featured
                    ? '<span class="project-status"><span class="dot dot-sm"></span>Récent</span>'
                    : `<span class="project-level">Niveau ${p.level}</span>`}
            </div>
        </div>

        <div class="project-main">
            <div class="project-heading">
                <h3 class="project-title">${p.title}</h3>
                <span class="project-type">${p.category}</span>
            </div>
            <p class="project-desc">${p.desc}</p>
            <details class="project-role">
                <summary>Mon rôle<span class="icon">expand_more</span></summary>
                <p>${p.role}</p>
            </details>
            <div class="chip-row">
                ${p.tech.map(t => `<button type="button" class="chip chip-tech" data-tech="${t}" title="Voir les projets en ${t}">${t}</button>`).join('')}
                ${(p.tags || []).map(t => `<span class="chip ac">${t}</span>`).join('')}
            </div>
        </div>

        <div class="project-links">
            ${p.livrables.map(livrableHTML).join('')}
        </div>
    </article>`;
}

function optionHTML(group, value, label, count) {
    return `
            <button type="button" class="filter-btn" data-group="${group}" data-value="${value}" aria-pressed="false">
                ${label}<span class="filter-count">${count}</span>
            </button>`;
}

// Un menu déroulant par critère ; le bouton affiche le choix courant.
function dropHTML(group, label, options) {
    return `
        <details class="filter-drop">
            <summary class="filter-drop-btn">
                <span class="filter-drop-label">${label}</span>
                <span class="filter-drop-value" data-filter-current="${group}">Tous</span>
                <span class="icon" aria-hidden="true">expand_more</span>
            </summary>
            <div class="filter-drop-panel" role="group" aria-label="${label}">${options}
            </div>
        </details>`;
}

function filtersHTML(projects) {
    const count = (key, value) => projects.filter(p => p[key] === value).length;

    return `
    <div class="project-filters reveal">
        <label class="project-search">
            <span class="icon" aria-hidden="true">search</span>
            <input type="search" id="project-search" placeholder="Rechercher un projet, une techno..." autocomplete="off" aria-label="Rechercher un projet">
        </label>
        ${dropHTML('category', 'Type', getCategories().map(c => optionHTML('category', c, c, count('category', c))).join(''))}
        ${dropHTML('context', 'Contexte', getContexts().map(c => optionHTML('context', c, c, count('context', c))).join(''))}
        ${dropHTML('tech', 'Techno', getTechCounts().map(([t, n]) => optionHTML('tech', t, t, n)).join(''))}
        <div class="filter-summary">
            <span id="project-results" aria-live="polite">${projects.length} projets</span>
            <button type="button" class="filter-reset" id="filter-reset" disabled><span class="icon">filter_alt_off</span>Tout décocher</button>
        </div>
    </div>`;
}

export function projectsHTML({ projects }) {
    // Les projets mis en avant passent en tête, l'ordre d'origine est conservé sinon.
    const sorted = [...projects].sort((a, b) => (b.featured === true) - (a.featured === true));

    return `
    <section id="projects" class="projects-section">
        <div class="projects-pin">
            <div class="projects-top">
                <div class="section-head split reveal">
                    <h2 class="section-title">Projets &amp; Travaux Collaboratifs</h2>
                    <p class="section-aside">Applications web fullstack, outils déployés pour le Grand Périgueux, infrastructures Linux et projets académiques du BUT.</p>
                </div>
                ${filtersHTML(projects)}
            </div>

            <div class="project-viewport">
                <div class="project-list project-track">
                    ${sorted.map(projectCardHTML).join('')}
                    <div class="project-empty" id="project-empty" hidden>
                        <span class="icon">search_off</span>
                        <p>Aucun projet ne correspond à ces filtres.</p>
                        <button type="button" class="btn btn-tonal" data-reset-filters>Réinitialiser les filtres</button>
                    </div>
                </div>
            </div>

            <div class="project-progress" aria-hidden="true">
                <span class="project-count"><span data-project-count>01</span> / <span data-project-total>${pad(sorted.length)}</span></span>
                <span class="project-progress-bar"><span class="project-progress-fill"></span></span>
                <span class="project-hint">Défilez<span class="icon">east</span></span>
            </div>
        </div>
    </section>`;
}
