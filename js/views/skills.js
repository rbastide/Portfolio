// ============================================
// VUE — Stack & Compétences
// ============================================
import { getLevelInfo } from '../data/profile.js';
import { getTechCounts } from '../data/projects.js';

const ACCENTS = ['accent-primary', 'accent-secondary', 'accent-tertiary'];

const GROUP_ICONS = {
    'Langages': 'code',
    'Front-end': 'web',
    'Back-end': 'dns',
    'Bases de données': 'database',
    'Système & DevOps': 'dns',
    'Tests & qualité': 'fact_check',
    'Méthodes': 'architecture'
};

// Une techno de la stack est reliée aux projets si l'un de ses noms
// (« Node.js / Express » → Node.js, Express) apparaît dans leurs technos.
function projectTech(item, techCounts) {
    const names = item.split(' / ').map(n => n.trim().toLowerCase());
    return [...techCounts].find(([t]) => names.includes(t.toLowerCase()));
}

function stackItemHTML(item, techCounts) {
    const linked = projectTech(item, techCounts);
    if (!linked) return `<li><span class="stack-item">${item}</span></li>`;
    const [tech, count] = linked;
    return `
            <li><button type="button" class="stack-item is-linked" data-filter-tech="${tech}"
                title="Voir ${count > 1 ? `les ${count} projets` : 'le projet'} en ${tech}">
                ${item}<span class="stack-item-count">${count}</span>
            </button></li>`;
}

// Largeur des tuiles de la grille bento (3 colonnes sur grand écran) : un groupe
// de 8 technos ou plus prend 2 colonnes, puis les plus gros groupes s'élargissent
// jusqu'à ce que les lignes soient pleines, sans trou en fin de grille.
const BENTO_COLUMNS = 3;

function bentoSpans(stack) {
    const spans = stack.map(g => (g.items.length >= 8 ? 2 : 1));
    const bySize = stack.map((g, i) => i).sort((a, b) => stack[b].items.length - stack[a].items.length);
    let total = spans.reduce((a, b) => a + b, 0);
    for (const i of bySize) {
        if (total % BENTO_COLUMNS === 0) break;
        const grow = Math.min(BENTO_COLUMNS - spans[i], BENTO_COLUMNS - (total % BENTO_COLUMNS));
        spans[i] += grow;
        total += grow;
    }
    return spans;
}

function stackRowHTML(s, i, techCounts, span = 1) {
    return `
    <div class="stack-row ${ACCENTS[i % ACCENTS.length]}" style="--span: ${span}">
        <h3 class="stack-row-title"><span class="icon">${GROUP_ICONS[s.group] || 'layers'}</span>${s.group}</h3>
        <ul class="stack-items">${s.items.map(item => stackItemHTML(item, techCounts)).join('')}</ul>
    </div>`;
}

function skillCardHTML(c, i) {
    const info = getLevelInfo(c.level);
    return `
    <article class="skill-card card ${ACCENTS[i % ACCENTS.length]}">
        <div class="skill-head">
            <span class="skill-icon"><span class="icon">${c.icon}</span></span>
            <span class="skill-level">Niveau ${c.level} · ${info.label}</span>
        </div>
        <h3 class="skill-title">${c.title}</h3>
        <p class="skill-desc">${c.description}</p>
        <div class="skill-bar" role="meter" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${c.level}" aria-label="Niveau ${c.level} sur 3">
            <div class="skill-bar-fill" style="--fill: ${c.level / 3}"></div>
        </div>
        <button class="skill-toggle" type="button" data-skill="${c.id}" aria-expanded="false" aria-controls="details-${c.id}">
            <span>Apprentissages critiques &amp; analyse</span>
            <span class="icon">expand_more</span>
        </button>
        <div class="skill-details" id="details-${c.id}">
            <div class="skill-details-inner">
                <div class="ac-list">
                    ${c.acs.map(ac => `<div class="ac-item"><span class="ac-code">${ac.code}</span><span>${ac.label}</span></div>`).join('')}
                </div>
                <div class="reflexion">
                    <p><strong>Difficultés :</strong> ${c.reflexion.difficultes}</p>
                    <p><strong>Savoirs :</strong> ${c.reflexion.savoirs}</p>
                </div>
            </div>
        </div>
    </article>`;
}

export function skillsHTML({ profile, competences }) {
    const techCounts = getTechCounts();
    const spans = bentoSpans(profile.about.stack);
    return `
    <section id="skills" class="section">
        <div class="container">
            <div class="section-head reveal">
                <h2 class="section-title">Langages, Frameworks &amp; Environnements</h2>
                <p class="section-desc">Compétences acquises à travers les SAÉ du BUT Informatique, les projets pour le Grand Périgueux et des développements personnels.</p>
            </div>

            <div class="stack-sheet reveal">
                ${profile.about.stack.map((g, i) => stackRowHTML(g, i, techCounts, spans[i])).join('')}
                <p class="stack-legend"><span class="stack-item-count" aria-hidden="true">2</span>Nombre de projets qui l'utilisent : cliquez pour les voir.</p>
            </div>

            <div class="section-head reveal">
                <h3 class="section-subtitle">Les 6 compétences du BUT</h3>
            </div>

            <div class="skills-grid">${competences.map(skillCardHTML).join('')}</div>
        </div>
    </section>`;
}
