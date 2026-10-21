// ============================================
// VUE — Stack & Compétences
// ============================================
import { getLevelInfo } from '../data/profile.js';

const ACCENTS = ['accent-primary', 'accent-secondary', 'accent-tertiary'];

const GROUP_ICONS = {
    'Langages': 'code',
    'Front-end': 'web',
    'Back-end': 'dns',
    'Bases de données': 'database',
    'Système & DevOps': 'dns',
    'Méthodes': 'architecture'
};

function stackCardHTML(s, i) {
    return `
    <div class="stack-card card ${ACCENTS[i % ACCENTS.length]} reveal">
        <div class="stack-card-head">
            <span class="stack-card-title"><span class="icon">${GROUP_ICONS[s.group] || 'layers'}</span>${s.group}</span>
            <span class="label-sm text-outline">${s.items.length} outils</span>
        </div>
        <div class="stack-items">
            ${s.items.map(item => `<span class="stack-item">${item}</span>`).join('')}
        </div>
    </div>`;
}

function skillCardHTML(c, i) {
    const info = getLevelInfo(c.level);
    return `
    <article class="skill-card card ${ACCENTS[i % ACCENTS.length]} reveal">
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
    return `
    <section id="skills" class="section">
        <div class="container">
            <div class="section-head reveal">
                <h2 class="section-title">Langages, Frameworks &amp; Environnements</h2>
                <p class="section-desc">Compétences acquises à travers les SAÉ du BUT Informatique, les projets pour le Grand Périgueux et des développements personnels.</p>
            </div>

            <div class="stack-grid">${profile.about.stack.map(stackCardHTML).join('')}</div>

            <div class="section-head reveal">
                <h3 class="section-subtitle">Les 6 compétences du BUT</h3>
            </div>

            <div class="skills-grid">${competences.map(skillCardHTML).join('')}</div>
        </div>
    </section>`;
}
