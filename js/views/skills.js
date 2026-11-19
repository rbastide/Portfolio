// ============================================
// VUE — Stack & Compétences
// ============================================
import { getLevelInfo } from '../data/profile.js';
import { getTechCounts } from '../data/projects.js';

const ACCENTS = ['accent-primary', 'accent-secondary', 'accent-tertiary'];

// La stack s'affiche comme un fichier stack.ts ouvert dans un éditeur : une
// ligne de code par groupe. Chaque groupe y devient une clé.
const GROUP_KEYS = {
    'Langages': 'langages',
    'Front-end': 'front',
    'Back-end': 'back',
    'Bases de données': 'données',
    'Système & DevOps': 'devops',
    'Tests & qualité': 'qualité',
    'Méthodes': 'méthodes'
};

const groupKey = group => GROUP_KEYS[group] || group.toLowerCase().replace(/[^\p{L}]+/gu, '');

// Ponctuation du code : visible, mais pas lue par les lecteurs d'écran.
const punct = text => `<span class="tok-p" aria-hidden="true">${text}</span>`;

// Une techno de la stack est reliée aux projets si l'un de ses noms
// (« Node.js / Express » → Node.js, Express) apparaît dans leurs technos.
function projectTech(item, techCounts) {
    const names = item.split(' / ').map(n => n.trim().toLowerCase());
    return [...techCounts].find(([t]) => names.includes(t.toLowerCase()));
}

// Une techno = une chaîne ; reliée à des projets, elle devient un bouton
// qui filtre la liste des projets (controllers/interactions.js).
function stackItemHTML(item, techCounts) {
    const linked = projectTech(item, techCounts);
    if (!linked) return `<span class="tok-str">${item}</span>`;
    const [tech, count] = linked;
    return `<button type="button" class="tok-str is-linked" data-filter-tech="${tech}"
        title="Voir ${count > 1 ? `les ${count} projets` : 'le projet'} en ${tech}">${item}<sup class="tok-count">${count}</sup></button>`;
}

function stackLineHTML(s, i, techCounts) {
    // Chaque techno garde sa virgule (ou le crochet final) : un retour à la
    // ligne ne laisse jamais de ponctuation seule en début de ligne.
    const last = s.items.length - 1;
    const items = s.items
        .map((item, j) => `<span class="tok-item">${stackItemHTML(item, techCounts)}${punct(j < last ? ',' : '],')}</span>`)
        .join(' ');
    return `
                <div class="code-line is-group" role="listitem" style="--i: ${i + 2}">
                    <span class="sr-only">${s.group} : </span><span class="tok-key" aria-hidden="true">${groupKey(s.group)}</span>${punct(': [')}${items}
                </div>`;
}

function stackEditorHTML(stack, techCounts) {
    const total = stack.reduce((n, g) => n + g.items.length, 0);
    const last = stack.length + 2;
    return `
            <div class="stack-editor reveal">
                <div class="editor-bar" aria-hidden="true">
                    <span class="editor-dots"><span></span><span></span><span></span></span>
                    <span class="editor-tab"><span class="editor-tab-lang">TS</span>stack.ts</span>
                </div>
                <div class="editor-code" role="list" aria-label="Technologies par domaine">
                    <div class="code-line is-comment" aria-hidden="true" style="--i: 0">// chiffre = projets qui l'utilisent, cliquez pour filtrer</div>
                    <div class="code-line" aria-hidden="true" style="--i: 1"><span class="tok-kw">export const</span> <span class="tok-var">stack</span> ${punct('= {')}</div>
                    ${stack.map((g, i) => stackLineHTML(g, i, techCounts)).join('')}
                    <div class="code-line" aria-hidden="true" style="--i: ${last}">${punct('};')}<span class="editor-caret"></span></div>
                </div>
                <div class="editor-status" aria-hidden="true">
                    <span>${stack.length} groupes · ${total} technos</span>
                    <span>TypeScript · UTF-8</span>
                </div>
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
    return `
    <section id="skills" class="section">
        <div class="container">
            <div class="section-head reveal">
                <h2 class="section-title">Langages, Frameworks &amp; Environnements</h2>
                <p class="section-desc">Compétences acquises à travers les SAÉ du BUT Informatique, les projets pour le Grand Périgueux et des développements personnels.</p>
            </div>

            ${stackEditorHTML(profile.about.stack, techCounts)}

            <div class="section-head reveal">
                <h3 class="section-subtitle">Les 6 compétences du BUT</h3>
            </div>

            <div class="skills-grid">${competences.map(skillCardHTML).join('')}</div>
        </div>
    </section>`;
}
