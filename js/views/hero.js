// ============================================
// VUE — Accueil (hero + assistant + bandeau de métriques)
// ============================================
const PRESETS = [
    { emoji: '🚀', label: 'Projets clés', query: 'Quels sont ses projets récents ?', accent: 'text-secondary' },
    { emoji: '💼', label: 'Alternance', query: 'Est-ce que Rémi recherche une alternance ?', accent: 'text-tertiary' },
    { emoji: '🛠️', label: 'Stack technique', query: 'Quelle est sa stack technique ?', accent: 'text-primary' }
];

function chatPanelHTML({ profile }) {
    return `
    <div class="chat-panel" id="chatbot">
        <div class="chat-header">
            <div class="chat-header-id">
                <span class="chat-avatar"><span class="icon">neurology</span></span>
                <div class="chat-header-text">
                    <div class="chat-title">ReyMysterio // Assistant <span class="chat-version">local</span></div>
                    <div class="chat-meta">
                        <span class="text-tertiary"><span class="dot dot-sm dot-pulse"></span>ONLINE</span>
                        <span>•</span>
                        <span>Moteur à mots-clés · sans API</span>
                    </div>
                </div>
            </div>
            <div class="chat-header-actions">
                <button type="button" id="chatbot-reset" class="chat-icon-btn" aria-label="Réinitialiser la discussion" title="Nettoyer le chat">
                    <span class="icon">restart_alt</span>
                </button>
                <span class="chat-node">AI_NODE</span>
            </div>
        </div>

        <div class="chat-messages" id="chatbot-messages" aria-live="polite"></div>

        <div class="chat-presets">
            <span class="chat-presets-label">Questions rapides :</span>
            <div class="chat-presets-list">
                ${PRESETS.map(p => `
                <button type="button" class="chat-preset ${p.accent}" data-query="${p.query}">
                    <span aria-hidden="true">${p.emoji}</span>${p.label}
                </button>`).join('')}
                <a class="chat-preset" href="mailto:${profile.contact.email}?subject=${encodeURIComponent('Demande de CV')}">
                    <span aria-hidden="true">📄</span>Demander le CV
                </a>
            </div>
        </div>

        <form class="chat-form" id="chatbot-form">
            <div class="chat-input-wrap">
                <input type="text" id="chatbot-input" placeholder="Posez une question sur le parcours de Rémi..." autocomplete="off" aria-label="Votre question" maxlength="280">
                <button type="submit" id="chatbot-send" class="chat-send" aria-label="Envoyer">
                    <span class="icon">send</span>
                </button>
            </div>
            <div class="chat-form-meta">
                <span id="chatbot-count">0 / 280</span>
                <span class="text-tertiary"><span class="dot dot-sm"></span>Base générée depuis le portfolio</span>
            </div>
        </form>
    </div>`;
}

function metricsHTML({ profile, projects }) {
    const metrics = [
        { icon: 'school', accent: 'accent-primary', value: 'BUT Informatique', label: profile.year },
        { icon: 'hub', accent: 'accent-tertiary', value: `${projects.length} Projets`, label: 'Fullstack, systèmes & données' },
        { icon: 'apartment', accent: 'accent-secondary', value: 'Grand Périgueux', label: 'Projets en conditions réelles (2026)' },
        { icon: 'terminal', accent: 'accent-primary', value: 'Sys & Network', label: 'Linux, Docker, SSH, iptables' }
    ];

    return `
    <section class="metrics">
        <div class="metrics-grid">
            ${metrics.map(m => `
            <div class="metric ${m.accent}">
                <span class="metric-icon"><span class="icon">${m.icon}</span></span>
                <div class="metric-text">
                    <span class="metric-value">${m.value}</span>
                    <span class="metric-label">${m.label}</span>
                </div>
            </div>`).join('')}
        </div>
    </section>`;
}

export function heroHTML(data) {
    const { profile, projects } = data;
    const metas = [
        { key: 'STATUT', value: 'DISPONIBLE', sub: 'Alternance', cls: 'text-tertiary' },
        { key: 'DOMAINES', value: 'FULLSTACK', sub: '& Sys Admin', cls: 'text-primary' },
        { key: 'CAP', value: 'IA // MASTER', sub: 'Prochaine étape', cls: 'text-secondary' }
    ];

    return `
    <section id="home" class="hero">
        <div class="glow glow-primary" aria-hidden="true"></div>
        <div class="glow glow-secondary" aria-hidden="true"></div>

        <div class="container hero-container">
            <div class="telemetry reveal">
                <div class="telemetry-left">
                    <span class="telemetry-badge">
                        <span class="dot dot-sm dot-secondary dot-ping"></span>
                        &gt; INIT.FIRMWARE // BASTIDE_RÉMI_
                    </span>
                    <span class="telemetry-ok">[OK] SYSTEM_ONLINE :: KERNEL_READY</span>
                </div>
                <div class="telemetry-right">
                    <span><span class="icon text-tertiary">memory</span>BUT_INFO // ${projects.length}_PROJETS</span>
                    <span class="text-primary"><span class="icon">terminal</span>@${profile.handle.toUpperCase()}</span>
                </div>
            </div>

            <div class="hero-grid">
                <div class="hero-main">
                    <span class="pill text-primary reveal">
                        <span class="icon">code_blocks</span>
                        ${profile.year.toUpperCase()}
                    </span>
                    <h1 class="hero-title reveal delay-1">
                        Développement Logiciel &amp;
                        <span class="gradient-text">Administration Système</span>
                    </h1>
                    <p class="hero-bio reveal delay-1">${profile.bio}</p>

                    <div class="hero-ctas reveal delay-2">
                        <a href="#projects" class="btn btn-primary"><span class="icon">rocket_launch</span>Explorer les projets</a>
                        <a href="${profile.contact.github}" target="_blank" rel="noopener noreferrer" class="btn btn-tonal"><span class="icon text-secondary">terminal</span>Profil GitHub</a>
                        <a href="#contact" class="btn btn-ghost"><span class="icon">alternate_email</span>Me contacter</a>
                    </div>

                    <div class="hero-metas reveal delay-3">
                        ${metas.map(m => `
                        <div class="hero-meta">
                            <span class="hero-meta-key">${m.key}</span>
                            <span class="hero-meta-value ${m.cls}">${m.value}</span>
                            <span class="hero-meta-sub">${m.sub}</span>
                        </div>`).join('')}
                    </div>
                </div>

                <div class="hero-side reveal delay-2">${chatPanelHTML(data)}</div>
            </div>
        </div>
    </section>
    ${metricsHTML(data)}`;
}
