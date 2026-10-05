// ============================================
// VUE — Projets
// ============================================
import { getCategories } from '../data/projects.js';

function projectCardHTML(p, i) {
    return `
    <article class="project-card reveal delay-${(i % 2) + 1}${p.featured ? ' is-featured' : ''}" data-category="${p.category}">
        <div class="project-meta">
            <span class="project-category">${p.category}</span>
            <span class="project-badges">
                ${p.featured ? '<span class="project-new">NEW</span>' : ''}
                <span class="project-level">N${p.level}</span>
            </span>
        </div>
        <h3 class="project-title">${p.title}</h3>
        <div class="project-context">
            <span>// ${p.context}</span>${p.period ? `<span>${p.period}</span>` : ''}
        </div>
        <div class="project-info">
            <p><strong>Description :</strong> ${p.desc}</p>
            <p><strong>Mon rôle :</strong> ${p.role}</p>
        </div>
        <div class="project-footer">
            <div class="project-livrables">
                <div class="project-livrables-label">Livrables :</div>
                <div class="project-livrables-list">
                    ${p.livrables.map(l => l.private
                        ? `<span class="livrable-link is-private" title="Dépôt privé — bientôt public">🔒 ${l.nom} (bientôt public)</span>`
                        : `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="livrable-link">↗ ${l.nom}</a>`).join('')}
                </div>
            </div>
            <div class="project-tags">
                ${p.tech.map(t => `<span class="tag-tech">${t}</span>`).join('')}
                ${(p.tags || []).map(t => `<span class="tag-ac">${t}</span>`).join('')}
            </div>
        </div>
    </article>`;
}

function filtersHTML(projects) {
    const filters = [{ value: 'all', label: 'tous', count: projects.length }]
        .concat(getCategories().map(c => ({
            value: c,
            label: c.toLowerCase(),
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

export function projectsHTML({ projects, profile }) {
    // Les projets mis en avant passent en tête, l'ordre d'origine est conservé sinon.
    const sorted = [...projects].sort((a, b) => (b.featured === true) - (a.featured === true));

    return `
    <section id="projects">
        <div class="projects-header reveal">
            <div class="section-header">
                <span class="section-tag">&gt; ls ~/projects</span>
                <h2 class="section-title">Projets <span class="highlight">Récents</span></h2>
                <p class="section-desc">Sélection de réalisations concrètes en développement et administration.</p>
            </div>
            <a href="${profile.contact.github}" target="_blank" rel="noopener noreferrer" class="github-link">
                Voir GitHub →
            </a>
        </div>
        ${filtersHTML(projects)}
        <div class="projects-grid">${sorted.map(projectCardHTML).join('')}</div>
    </section>`;
}
