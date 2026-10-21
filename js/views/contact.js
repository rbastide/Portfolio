// ============================================
// VUE — Objectif + Contact
// ============================================
function calloutHTML({ profile }) {
    const { email, github } = profile.contact;
    const subject = encodeURIComponent('Opportunité d\'alternance — Master IA');

    return `
    <section class="section callout-section">
        <div class="callout reveal">
            <div class="glow glow-callout" aria-hidden="true"></div>
            <div class="callout-grid">
                <div class="callout-text">
                    <h3 class="section-title">Prêt pour de nouveaux défis, cap sur l'IA</h3>
                    <p>Je recherche ${profile.lookingFor}. Mon objectif : mettre mes bases en développement fullstack, en données et en administration système au service de l'Intelligence Artificielle.</p>
                </div>
                <div class="callout-actions">
                    <a href="mailto:${email}?subject=${subject}" class="btn btn-light"><span class="icon">send</span>Proposer une alternance</a>
                    <a href="${github}" target="_blank" rel="noopener noreferrer" class="btn btn-dark"><span class="icon text-secondary">open_in_new</span>Explorer mon code GitHub</a>
                </div>
            </div>
        </div>
    </section>`;
}

export function contactHTML(data) {
    const { email, github, linkedin } = data.profile.contact;
    const channels = [
        { href: `mailto:${email}`, icon: 'mail', accent: 'accent-primary', key: 'E-mail', value: email, sub: 'Le moyen le plus direct' },
        { href: github, icon: 'code', accent: 'accent-secondary', key: 'GitHub', value: github.replace('https://', ''), sub: 'Dépôts personnels & académiques', external: true },
        { href: linkedin, icon: 'link', accent: 'accent-tertiary', key: 'LinkedIn', value: linkedin.replace('https://www.', ''), sub: 'Parcours & expériences', external: true }
    ];

    return `
    ${calloutHTML(data)}
    <section id="contact" class="section">
        <div class="container">
            <div class="section-head split reveal">
                <div class="section-head">
                    <h2 class="section-title">Prise de contact &amp; coordonnées</h2>
                    <p class="section-desc">Envie de collaborer ou de discuter d'une opportunité ? N'hésitez pas à me joindre.</p>
                </div>
                <span class="contact-status"><span class="dot dot-pulse"></span>Réponse rapide</span>
            </div>

            <div class="contact-grid">
                ${channels.map(c => `
                <a href="${c.href}" class="contact-card ${c.accent} reveal"${c.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
                    <span class="contact-icon"><span class="icon">${c.icon}</span></span>
                    <span class="label-sm text-outline">${c.key}</span>
                    <span class="contact-value">${c.value}</span>
                    <span class="label-sm text-outline">${c.sub}</span>
                </a>`).join('')}
            </div>
        </div>
    </section>`;
}
