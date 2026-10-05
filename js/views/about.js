// ============================================
// VUE — À propos
// ============================================
export function aboutHTML({ profile }) {
    const { paragraphs, facts, stack, softSkills } = profile.about;

    return `
    <section id="about">
        <div class="section-header reveal">
            <span class="section-tag">&gt; whoami</span>
            <h2 class="section-title">À <span class="highlight">propos</span></h2>
        </div>
        <div class="about-grid">
            <div class="about-text reveal delay-1">
                ${paragraphs.map(p => `<p>${p}</p>`).join('')}
                <div class="about-facts">
                    ${facts.map(f => `
                    <div class="about-fact">
                        <span class="about-fact-key">${f.key}</span>
                        <span class="about-fact-value">${f.value}</span>
                    </div>`).join('')}
                </div>
            </div>
            <div class="about-skills reveal delay-2">
                <div class="about-skills-header">
                    <span class="about-skills-title">// compétences</span>
                </div>
                ${stack.map(s => `
                <div class="stack-group">
                    <h3 class="stack-group-title">${s.group}</h3>
                    <div class="stack-items">
                        ${s.items.map(i => `<span class="tag-tech">${i}</span>`).join('')}
                    </div>
                </div>`).join('')}
                <div class="stack-group">
                    <h3 class="stack-group-title">Savoir-être</h3>
                    <div class="stack-items">
                        ${softSkills.map(i => `<span class="tag-ac">${i}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>`;
}
