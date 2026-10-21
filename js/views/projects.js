// ============================================
// VUE — Projets
// ============================================
// Une barre de filtres (recherche, type, contexte, technologie) au-dessus
// d'une liste de projets présentés en lignes. Le filtrage lui-même est géré
// par initProjectFilters (controllers/interactions.js).
import { getCategories, getContexts, getTechCounts } from '../data/projects.js';

// Nombre de technologies visibles avant « Voir plus ».
const TECH_PREVIEW = 8;

const normalize = text => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function livrableHTML(l) {
    return l.private
        ? `<span class="project-link is-private" title="Dépôt privé — bientôt public"><span class="icon">lock</span>${l.nom} (bientôt public)</span>`
        : `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="project-link">${l.nom}<span class="icon">arrow_outward</span></a>`;
}

function projectRowHTML(p) {
    const search = normalize([p.title, p.desc, p.role, p.context, p.category, ...p.tech, ...(p.keywords || [])].join(' '));
    return `
    <article class="project-row reveal" data-category="${p.category}" data-context="${p.context}"
        data-tech="${p.tech.join('|')}" data-search="${search.replace(/"/g, '')}">
        <div class="project-side">
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

function optionHTML(group, value, label, count, extraClass = '') {
    return `
        <button type="button" class="filter-btn${extraClass}" data-group="${group}" data-value="${value}" aria-pressed="false">
            ${label}<span class="filter-count">${count}</span>
        </button>`;
}

function filtersHTML(projects) {
    const count = (key, value) => projects.filter(p => p[key] === value).length;
    const techs = getTechCounts();

    return `
    <div class="project-filters reveal">
        <label class="project-search">
            <span class="icon" aria-hidden="true">search</span>
            <input type="search" id="project-search" placeholder="Rechercher un projet, une techno..." autocomplete="off" aria-label="Rechercher un projet">
        </label>

        <div class="filter-group" role="group" aria-labelledby="filter-type">
            <span class="filter-label" id="filter-type">Type</span>
            <div class="filter-options">
                ${getCategories().map(c => optionHTML('category', c, c, count('category', c))).join('')}
            </div>
        </div>

        <div class="filter-group" role="group" aria-labelledby="filter-context">
            <span class="filter-label" id="filter-context">Contexte</span>
            <div class="filter-options">
                ${getContexts().map(c => optionHTML('context', c, c, count('context', c))).join('')}
            </div>
        </div>

        <div class="filter-group" role="group" aria-labelledby="filter-tech">
            <span class="filter-label" id="filter-tech">Technologie</span>
            <div class="filter-options" id="tech-options">
                ${techs.map(([t, n], i) => optionHTML('tech', t, t, n, i >= TECH_PREVIEW ? ' is-extra' : '')).join('')}
                ${techs.length > TECH_PREVIEW
                    ? `<button type="button" class="filter-more" id="tech-more" aria-expanded="false" aria-controls="tech-options">+ ${techs.length - TECH_PREVIEW} autres</button>`
                    : ''}
            </div>
        </div>

        <div class="filter-summary">
            <span id="project-results" aria-live="polite">${projects.length} projets</span>
            <button type="button" class="filter-reset" id="filter-reset" hidden><span class="icon">close</span>Réinitialiser</button>
        </div>
    </div>`;
}

export function projectsHTML({ projects }) {
    // Les projets mis en avant passent en tête, l'ordre d'origine est conservé sinon.
    const sorted = [...projects].sort((a, b) => (b.featured === true) - (a.featured === true));

    return `
    <section id="projects" class="section">
        <div class="container">
            <div class="section-head split reveal">
                <div class="section-head">
                    <h2 class="section-title">Projets &amp; Travaux Collaboratifs</h2>
                </div>
                <p class="section-aside">Applications web fullstack, outils déployés pour le Grand Périgueux, infrastructures Linux et projets académiques du BUT.</p>
            </div>
            ${filtersHTML(projects)}
            <div class="project-list">
                ${sorted.map(projectRowHTML).join('')}
                <div class="project-empty" id="project-empty" hidden>
                    <span class="icon">search_off</span>
                    <p>Aucun projet ne correspond à ces filtres.</p>
                    <button type="button" class="btn btn-tonal" data-reset-filters>Réinitialiser les filtres</button>
                </div>
            </div>
        </div>
    </section>`;
}
