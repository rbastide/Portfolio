// ============================================
// VUE — Accueil (hero + assistant + bandeau de métriques)
// ============================================
import { BOT_AVATAR } from '../chatbot/avatar.js';

const PRESETS = [
    { icon: 'folder_special', label: 'Projets clés', query: 'Quels sont ses projets récents ?', accent: 'text-secondary' },
    { icon: 'work', label: 'Alternance', query: 'Est-ce que Rémi recherche une alternance ?', accent: 'text-tertiary' },
    { icon: 'build', label: 'Stack technique', query: 'Quelle est sa stack technique ?', accent: 'text-primary' }
];

function chatPanelHTML() {
    return `
    <div class="chat-placeholder" id="chatbot-placeholder" hidden>
        <span class="chat-avatar">${BOT_AVATAR}</span>
        <p>ReyMysterio est ouvert en fenêtre flottante.</p>
        <button type="button" class="btn btn-tonal" id="chatbot-return"><span class="icon">move_down</span>Ramener ici</button>
    </div>
    <div class="chat-panel" id="chatbot" tabindex="-1">
        <div class="chat-header">
            <div class="chat-header-id">
                <span class="chat-avatar">${BOT_AVATAR}</span>
                <div class="chat-header-text">
                    <div class="chat-title">ReyMysterio</div>
                    <div class="chat-meta">
                        <span class="text-tertiary"><span class="dot dot-sm dot-pulse"></span>Disponible</span>
                        <span>·</span>
                        <span>Répond à partir du contenu du portfolio</span>
                    </div>
                </div>
            </div>
            <div class="chat-header-actions">
                <button type="button" id="chatbot-reset" class="chat-icon-btn" aria-label="Réinitialiser la discussion" title="Nettoyer le chat">
                    <span class="icon">restart_alt</span>
                </button>
                <button type="button" id="chatbot-dock-close" class="chat-icon-btn" aria-label="Fermer la fenêtre de l'assistant" title="Fermer" hidden>
                    <span class="icon">close</span>
                </button>
            </div>
        </div>

        <div class="chat-messages" id="chatbot-messages"></div>
        <!-- Les réponses s'écrivent progressivement à l'écran : elles sont annoncées
             ici une seule fois, complètes, plutôt que fragment par fragment. -->
        <div class="sr-only" id="chatbot-announcer" aria-live="polite"></div>

        <div class="chat-presets">
            <span class="chat-presets-label">Questions rapides</span>
            <div class="chat-presets-list">
                ${PRESETS.map(p => `
                <button type="button" class="chat-preset ${p.accent}" data-query="${p.query}">
                    <span class="icon" aria-hidden="true">${p.icon}</span>${p.label}
                </button>`).join('')}
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
                <span>Entrée pour envoyer</span>
            </div>
        </form>
    </div>`;
}

// Repères en bas de l'accueil, posés sur une règle graduée comme celle du
// parcours qui suit : l'essentiel du profil en un coup d'œil.
function readoutHTML({ profile, projects }) {
    const items = [
        { key: 'Statut', value: 'Disponible', sub: 'Alternance', cls: 'text-tertiary' },
        { key: 'Terrain', value: 'Grand Périgueux', sub: 'Projets en conditions réelles' },
        { key: 'Formation', value: 'BUT Informatique', sub: profile.year.split(' de ')[0] },
        { key: 'Projets', value: `${projects.length} projets`, sub: 'Fullstack, systèmes & données' },
        { key: 'Objectif', value: 'Master IA', sub: 'Prochaine étape', cls: 'text-secondary' }
    ];

    return `
            <dl class="hero-readout reveal">
                ${items.map((m, i) => `
                <div class="hero-readout-item">
                    <dt class="hero-readout-key"><span class="hero-readout-index">${String(i + 1).padStart(2, '0')}</span>${m.key}</dt>
                    <dd class="hero-readout-value ${m.cls || ''}">${m.value}</dd>
                    <dd class="hero-readout-sub">${m.sub}</dd>
                </div>`).join('')}
            </dl>`;
}

// Accueil dans le langage visuel du parcours (css/story.css) : plein écran,
// fond sombre, sur-titres en mono, nom en très grand ancré en bas, règle de
// repères, invitation à défiler.
export function heroHTML(data) {
    const { profile } = data;

    return `
    <section id="home" class="hero">
        <div class="hero-stage">
            <div class="hero-grid">
                <div class="hero-main">
                    <span class="hero-kicker reveal">00 — Portfolio · ${new Date().getFullYear()}</span>
                    <h1 class="hero-name reveal">Rémi Bastide</h1>
                    <p class="hero-title reveal">
                        Développeur fullstack,
                        <span class="gradient-text">en route vers l'IA</span>
                    </p>
                    <p class="hero-bio reveal">${profile.bio}</p>

                    <div class="hero-ctas reveal">
                        <a href="#projects" class="btn btn-primary"><span class="icon">rocket_launch</span>Explorer les projets</a>
                        <a href="${profile.contact.github}" target="_blank" rel="noopener noreferrer" class="btn btn-tonal"><span class="icon text-secondary">code</span>Profil GitHub</a>
                        <a href="#contact" class="btn btn-ghost"><span class="icon">alternate_email</span>Me contacter</a>
                    </div>
                </div>

                <div class="hero-aside reveal">
                    <span class="hero-kicker">Assistant — une question ?</span>
                    <div class="hero-side" id="chatbot-home">${chatPanelHTML()}</div>
                </div>
            </div>
            ${readoutHTML(data)}
        </div>
        <div class="story-hint hero-hint" aria-hidden="true">
            <span>Faites défiler</span>
            <span class="story-hint-line"></span>
        </div>
    </section>`;
}
