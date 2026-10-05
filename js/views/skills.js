// ============================================
// VUE — Compétences
// ============================================
import { getLevelInfo } from '../data/profile.js';

function skillCardHTML(c, i) {
    const info = getLevelInfo(c.level);
    const fill = c.level / 4;
    return `
    <article class="skill-card reveal delay-${(i % 3) + 1}">
        <div class="skill-card-header">
            <div class="skill-icon">${c.icon}</div>
            <span class="skill-level ${info.color}">NIV.${c.level} — ${info.label.toUpperCase()}</span>
        </div>
        <h3 class="skill-title">${c.title}</h3>
        <p class="skill-desc">${c.description}</p>
        <div class="skill-bar-track">
            <div class="skill-bar-fill" style="--fill: ${fill}"></div>
        </div>
        <button class="skill-details-toggle" type="button" data-skill="${c.id}"
                aria-expanded="false" aria-controls="details-${c.id}">
            <span>// voir les détails</span>
            <span class="chevron">▼</span>
        </button>
        <div class="skill-details" id="details-${c.id}">
            <h4>Apprentissages Critiques</h4>
            ${c.acs.map(ac => `<div class="ac-item"><span class="ac-code">${ac.code}</span><span class="ac-label">${ac.label}</span></div>`).join('')}
            <div class="reflexion-block">
                <h4>Analyse Réflexive</h4>
                <p><strong>Difficultés :</strong> ${c.reflexion.difficultes}</p>
                <p><strong>Savoirs :</strong> ${c.reflexion.savoirs}</p>
            </div>
        </div>
    </article>`;
}

export function skillsHTML({ competences }) {
    return `
    <section id="skills">
        <div class="section-header reveal">
            <span class="section-tag">&gt; cat /skills</span>
            <h2 class="section-title">Compé<span class="highlight">tences</span></h2>
            <p class="section-desc">Une expertise technique acquise au fil des projets et validée par le référentiel national.</p>
        </div>
        <div class="skills-grid">${competences.map(skillCardHTML).join('')}</div>
    </section>`;
}
