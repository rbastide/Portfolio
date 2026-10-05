// ============================================
// VUE — À propos
// ============================================
const FACT_ICONS = {
    formation: 'school',
    profil: 'badge',
    objectif: 'psychology',
    recherche: 'work',
    'expérience': 'apartment'
};

export function aboutHTML({ profile }) {
    const { paragraphs, facts, softSkills } = profile.about;

    return `
    <section id="about" class="section">
        <div class="container">
            <div class="section-head reveal">
                <span class="section-tag text-tertiary"><span class="icon">person</span>WHOAMI // PROFIL</span>
                <h2 class="section-title">À propos de moi</h2>
            </div>

            <div class="about-grid">
                <div class="about-text card reveal delay-1">
                    ${paragraphs.map(p => `<p>${p}</p>`).join('')}
                    <div class="about-soft">
                        <span class="label-sm text-outline">SAVOIR-ÊTRE</span>
                        <div class="chip-row">
                            ${softSkills.map(s => `<span class="chip">${s}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="about-facts reveal delay-2">
                    ${facts.map(f => `
                    <div class="about-fact">
                        <span class="about-fact-icon"><span class="icon">${FACT_ICONS[f.key] || 'chevron_right'}</span></span>
                        <div class="about-fact-text">
                            <span class="about-fact-key">${f.key}</span>
                            <span class="about-fact-value">${f.value}</span>
                        </div>
                    </div>`).join('')}
                </div>
            </div>
        </div>
    </section>`;
}
