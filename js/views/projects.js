// ============================================
// VUE — Projets
// ============================================
import { getCategories } from '../data/projects.js';

// Les cartes alternent les trois accents de la palette.
const ACCENTS = ['accent-primary', 'accent-secondary', 'accent-tertiary'];

function livrableHTML(l) {
    return l.private
        ? `<span class="project-link is-private" title="Dépôt privé — bientôt public"><span class="icon">lock</span>${l.nom} (bientôt public)</span>`
        : `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="project-link">${l.nom}<span class="icon">arrow_forward</span></a>`;
}

function projectCardHTML(p, i) {
    return `
    <article class="project-card card-glow ${ACCENTS[i % ACCENTS.length]} reveal delay-${(i % 3) + 1}" data-category="${p.category}">
        <div class="project-body">
            <div class="project-meta">
                <span class="project-category">${p.category} • ${p.context}</span>
                ${p.featured
                    ? '<span class="project-status"><span class="dot dot-sm"></span>Récent</span>'
                    : `<span class="project-level">NIV.${p.level}</span>`}
            </div>
            <div class="project-heading">
                <span class="project-icon"><span class="icon">${p.icon || 'folder'}</span></span>
                <div>
                    <h3 class="project-title">${p.title}</h3>
                    ${p.period ? `<span class="project-period">${p.period}</span>` : ''}
                </div>
            </div>
            <p class="project-desc">${p.desc}</p>
            <details class="project-role">
                <summary>Mon rôle<span class="icon">expand_more</span></summary>
                <p>${p.role}</p>
            </details>
            <div class="chip-row">
                ${p.tech.map((t, j) => `<span class="chip${j === 0 ? ' accent' : ''}">${t}</span>`).join('')}
                ${(p.tags || []).map(t => `<span class="chip ac">${t}</span>`).join('')}
            </div>
        </div>
        <div class="project-footer">
            ${p.livrables.map(livrableHTML).join('')}
        </div>
    </article>`;
}

function filtersHTML(projects) {
    const filters = [{ value: 'all', label: 'Tous', count: projects.length }]
        .concat(getCategories().map(c => ({
            value: c,
            label: c,
            count: projects.filter(p => p.category === c).length
        })));

    return `
    <div class="project-filters reveal" role="toolbar" aria-label="Filtrer les projets">
        ${filters.map((f, i) => `
        <button type="button" class="filter-btn${i === 0 ? ' active' : ''}" data-filter="${f.value}" aria-pressed="${i === 0}">
            ${f.label}<span class="filter-count">${f.count}</span>
        </button>`).join('')}
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
                    <span class="section-tag text-secondary"><span class="icon">folder_special</span>INDEX // RÉALISATIONS LOGICIELLES</span>
                    <h2 class="section-title">Projets &amp; Travaux Collaboratifs</h2>
                </div>
                <p class="section-aside">Applications web fullstack, outils déployés pour le Grand Périgueux, infrastructures Linux et projets académiques du BUT.</p>
            </div>
            ${filtersHTML(projects)}
            <div class="projects-grid">${sorted.map(projectCardHTML).join('')}</div>
        </div>
    </section>`;
}
