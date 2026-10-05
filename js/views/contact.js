// ============================================
// VUE — Contact
// ============================================
const ICONS = {
    github: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
    linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`
};

export function contactHTML({ profile }) {
    const { email, github, linkedin } = profile.contact;
    return `
    <section id="contact">
        <div class="section-header reveal">
            <span class="section-tag">&gt; ssh contact@bastide</span>
            <h2 class="section-title">Me <span class="highlight">Contacter</span></h2>
            <p class="section-desc">Envie de collaborer ou de discuter d'une opportunité ? N'hésitez pas à me joindre.</p>
        </div>
        <div class="contact-wrapper reveal delay-1">
            <div class="contact-inner">
                <div class="contact-info">
                    <h2 class="contact-title">Travaillons<br><span class="highlight">ensemble.</span></h2>
                    <p class="contact-text">
                        Je suis à la recherche d'${profile.lookingFor}. Si mon profil vous intéresse, n'hésitez pas à me laisser un message.
                    </p>
                    <a href="mailto:${email}" class="contact-link">
                        <span class="contact-link-icon">✉</span>
                        <span>${email}</span>
                    </a>
                    <div class="contact-socials">
                        <a href="${github}" target="_blank" rel="noopener noreferrer" class="social-btn" title="GitHub" aria-label="GitHub">${ICONS.github}</a>
                        <a href="${linkedin}" target="_blank" rel="noopener noreferrer" class="social-btn" title="LinkedIn" aria-label="LinkedIn">${ICONS.linkedin}</a>
                    </div>
                </div>
                <div class="contact-form-wrap">
                    <form id="contact-form" data-email="${email}">
                        <label for="cf-name">Votre Nom</label>
                        <input id="cf-name" name="name" type="text" placeholder="John Doe" required>
                        <label for="cf-email">Email</label>
                        <input id="cf-email" name="email" type="email" placeholder="john@example.com" required>
                        <label for="cf-message">Message</label>
                        <textarea id="cf-message" name="message" rows="4" placeholder="Votre message..." required></textarea>
                        <button type="submit" class="submit-btn">&gt; Envoyer_</button>
                        <p class="form-hint" aria-live="polite"></p>
                    </form>
                </div>
            </div>
        </div>
    </section>`;
}
