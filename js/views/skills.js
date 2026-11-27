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
    'Mobile': 'mobile',
    'IA': 'ia',
    'Bases de données': 'données',
    'Système & DevOps': 'devops',
    'Tests & qualité': 'qualité',
    'Méthodes': 'méthodes'
};

const groupKey = group => GROUP_KEYS[group] || group.toLowerCase().replace(/[^\p{L}]+/gu, '');

// Ponctuation du code : visible, mais pas lue par les lecteurs d'écran.
const punct = text => `<span class="tok-p" aria-hidden="true">${text}</span>`;

const kw = text => `<span class="tok-kw">${text}</span>`;
const v = text => `<span class="tok-var">${text}</span>`;

// Chaque onglet est écrit dans un langage différent : ouverture, fin, commentaire,
// séparateur (`last` pour le dernier élément), préfixe d'élément et guillemets (q).
const TS = { ext: 'ts', name: 'TypeScript', badge: 'TS', color: '#4b9bf0', c: ['//'], open: k => `${kw('export const')} ${v(k)} ${punct('= [')}`, close: '];', sep: ',' };
const LANGS = {
    langages: TS,
    front: { ext: 'jsonc', name: 'JSON with Comments', badge: '{}', color: '#cbcb41', c: ['//'], q: 'double', open: k => `${punct('{')} <span class="tok-key">"${k}"</span>${punct(': [')}`, close: ']}', sep: ',', last: '' },
    back: { ext: 'java', name: 'Java', badge: 'JV', color: '#f89820', c: ['//'], q: 'double', open: k => `${kw('List')}${punct('&lt;')}${kw('String')}${punct('&gt;')} ${v(k)} ${punct('= List.of(')}`, close: ');', sep: ',', last: '' },
    mobile: { ext: 'kt', name: 'Kotlin', badge: 'KT', color: '#b794ff', c: ['//'], q: 'double', open: k => `${kw('val')} ${v(k)} ${punct('= listOf(')}`, close: ')', sep: ',', last: '' },
    ia: { ext: 'py', name: 'Python', badge: 'PY', color: '#ffd43b', c: ['#'], open: k => `${v(k)} ${punct('= [')}`, close: ']', sep: ',' },
    données: { ext: 'sql', name: 'SQL', badge: 'SQL', color: '#e38c00', c: ['--'], open: () => `${kw('SELECT')} * ${kw('FROM')} ${v('stack')} ${kw('WHERE')} techno ${kw('IN')} ${punct('(')}`, close: ');', sep: ',', last: '' },
    devops: { ext: 'yml', name: 'YAML', badge: 'YML', color: '#ff6b6b', c: ['#'], q: 'none', open: k => `<span class="tok-key">${k}</span>${punct(':')}`, close: '', pre: '- ' },
    qualité: { ext: 'php', name: 'PHP', badge: 'PHP', color: '#a5a9e0', c: ['//'], open: k => `${v('$' + k)} ${punct('= [')}`, close: '];', sep: ',' },
    méthodes: { ext: 'md', name: 'Markdown', badge: 'MD', color: '#6cc1e8', c: ['&lt;!--', ' --&gt;'], q: 'none', open: k => `${kw('##')} ${v(k)}`, close: '', pre: '- ' }
};
const langOf = key => LANGS[key] || TS;

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

// Un onglet = un groupe, ouvert comme un fichier <clé>.<ext> : une techno par ligne.
function stackPanelHTML(s, i, techCounts) {
    const key = groupKey(s.group);
    const L = langOf(key);
    const n = s.items.length;
    const sep = j => j === n - 1 ? (L.last ?? L.sep ?? '') : (L.sep ?? '');
    return `
                <div class="editor-code${i ? '' : ' is-active'}" role="tabpanel" id="stack-panel-${i}" aria-labelledby="stack-tab-${i}"${L.q ? ` data-q="${L.q}"` : ''}>
                    <div class="code-line is-comment" aria-hidden="true" style="--i: 0">${L.c[0]} ${n} technos · chiffre = projets qui l'utilisent, cliquez pour filtrer${L.c[1] || ''}</div>
                    <div class="code-line" aria-hidden="true" style="--i: 1">${L.open(key)}</div>
                    <div role="list" aria-label="${s.group}">
                        ${s.items.map((item, j) => `<div class="code-line is-group" role="listitem" style="--i: ${j + 2}">${L.pre ? punct(L.pre) : ''}${stackItemHTML(item, techCounts)}${sep(j) && punct(sep(j))}</div>`).join('')}
                    </div>
                    <div class="code-line" aria-hidden="true" style="--i: ${n + 2}">${L.close && punct(L.close)}<span class="editor-caret"></span></div>
                </div>`;
}

function stackEditorHTML(stack, techCounts) {
    const total = stack.reduce((n, g) => n + g.items.length, 0);
    return `
            <div class="stack-app">
            <div class="stack-editor reveal" role="region" aria-label="Éditeur de la stack">
                <div class="editor-bar">
                    <span class="editor-dots">
                        <button type="button" class="editor-dot is-close" data-win="close" aria-label="Fermer l'éditeur"></button>
                        <button type="button" class="editor-dot is-min" data-win="min" aria-label="Réduire l'éditeur dans le Dock"></button>
                        <button type="button" class="editor-dot is-max" data-win="max" aria-label="Agrandir l'éditeur en plein écran" aria-pressed="false"></button>
                    </span>
                    <div class="editor-tabs" role="tablist" aria-label="Catégories de la stack">
                        ${stack.map((g, i) => { const k = groupKey(g.group), L = langOf(k); return `<button type="button" class="editor-tab" role="tab" id="stack-tab-${i}" aria-controls="stack-panel-${i}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}" data-lang="${L.name}"><span class="editor-tab-lang" aria-hidden="true" style="background: ${L.color}">${L.badge}</span>${k}.${L.ext}</button>`; }).join('')}
                    </div>
                </div>
                <div class="editor-panels">${stack.map((g, i) => stackPanelHTML(g, i, techCounts)).join('')}</div>
                <div class="editor-status" aria-hidden="true">
                    <span>${stack.length} groupes · ${total} technos</span>
                    <span><span class="editor-lang">${langOf(groupKey(stack[0].group)).name}</span> · UTF-8</span>
                </div>
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

            <div class="skills-graph">
                <div class="skills-hub" aria-hidden="true"><span class="skills-hub-dot"></span>BUT Informatique</div>
                <svg class="skills-traces" aria-hidden="true"></svg>
                <div class="skills-grid">${competences.map(skillCardHTML).join('')}</div>
            </div>
        </div>
    </section>`;
}
