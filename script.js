// ============================================
// MODEL — Data Layer
// ============================================
const Model = {
    levelDefinitions: {
        1: { label: "Basique", color: "level-1" },
        2: { label: "Acquis", color: "level-2" },
        3: { label: "Maîtrisé", color: "level-3" },
        4: { label: "Expert", color: "level-4" }
    },
    data: {
        profile: {
            name: "Bastide Rémi",
            role: "Développeur Junior // Administrateur Système",
            bio: "Étudiant en 2ème année de BUT Informatique. Je conçois des solutions logicielles robustes et sécurisées, en alliant rigueur technique et créativité.",
            stats: { projects: 6, years: 2, level: "N2" }
        },
        competences: [
            {
                id: 1, title: "Réaliser", icon: "&lt;/&gt;", level: 4, description: "Concevoir, coder, tester et intégrer.",
                acs: [
                    { code: "AC 11.01", label: "Implémenter des conceptions simples" },
                    { code: "AC 11.02", label: "Élaborer des conceptions simples" },
                    { code: "AC 11.03", label: "Essais et validation" },
                    { code: "AC 12.01", label: "Analyser les besoins client" },
                    { code: "AC 12.02", label: "Conception technique" },
                    { code: "AC 12.03", label: "Coder et tester" },
                    { code: "AC 12.04", label: "Déployer une application" }
                ],
                reflexion: {
                    difficultes: "Appréhender l'architecture MVC sur des projets complexes et gérer les conflits Git en équipe.",
                    savoirs: "Maîtrise des design patterns de base, bonnes pratiques de tests unitaires et code propre."
                }
            },
            {
                id: 2, title: "Optimiser", icon: "⚡", level: 3, description: "Améliorer performances et algorithmes.",
                acs: [
                    { code: "AC 21.01", label: "Analyser un problème" },
                    { code: "AC 21.02", label: "Comparer des algorithmes" },
                    { code: "AC 22.01", label: "Structures de données complexes" },
                    { code: "AC 22.02", label: "Techniques algorithmiques" },
                    { code: "AC 22.03", label: "Enjeux d'optimisation" }
                ],
                reflexion: {
                    difficultes: "Choisir la structure de données la plus adaptée face à des volumes importants d'informations.",
                    savoirs: "Compréhension fine de la complexité algorithmique temporelle et spatiale."
                }
            },
            {
                id: 3, title: "Administrer", icon: "◈", level: 3, description: "Gérer systèmes et réseaux.",
                acs: [
                    { code: "AC 31.01", label: "Installer poste de travail" },
                    { code: "AC 31.02", label: "Réseau local simple" },
                    { code: "AC 31.03", label: "Sécuriser poste et données" },
                    { code: "AC 32.01", label: "Architecture réseau" },
                    { code: "AC 32.02", label: "Services réseaux" },
                    { code: "AC 32.03", label: "Admin système" },
                    { code: "AC 32.04", label: "Surveillance et sécurité" }
                ],
                reflexion: {
                    difficultes: "Configuration avancée des règles de routage et de pare-feu sous Linux.",
                    savoirs: "Automatisation de déploiement via des scripts Bash et sécurisation des accès SSH."
                }
            },
            {
                id: 4, title: "Gérer", icon: "⬡", level: 3, description: "Exploiter les données d'entreprise.",
                acs: [
                    { code: "AC 41.01", label: "SQL et Mises à jour" },
                    { code: "AC 41.02", label: "Reporting simple" },
                    { code: "AC 41.03", label: "Conception BD simple" },
                    { code: "AC 42.01", label: "Optimisation modèles/requêtes" },
                    { code: "AC 42.02", label: "Sécurité des données" },
                    { code: "AC 42.03", label: "Business Intelligence" },
                    { code: "AC 42.04", label: "Admin SGBD" }
                ],
                reflexion: {
                    difficultes: "Éviter les redondances de données lors de la conception de schémas complexes.",
                    savoirs: "Normalisation des bases de données et optimisation des requêtes via l'indexation."
                }
            },
            {
                id: 5, title: "Conduire", icon: "▦", level: 4, description: "Gestion de projet et besoins.",
                acs: [
                    { code: "AC 51.01", label: "Identifier besoins métiers" },
                    { code: "AC 51.02", label: "Cycle de développement" },
                    { code: "AC 51.03", label: "Gestion de projet basique" },
                    { code: "AC 52.01", label: "Conception et planification" },
                    { code: "AC 52.02", label: "Méthodes Agiles" },
                    { code: "AC 52.03", label: "Qualité et tests" }
                ],
                reflexion: {
                    difficultes: "Estimer correctement la charge de travail initiale et respecter les délais des sprints.",
                    savoirs: "Pratique courante de la méthode Scrum, et utilisation d'outils comme Jira ou Trello."
                }
            },
            {
                id: 6, title: "Collaborer", icon: "◎", level: 4, description: "Travail d'équipe et communication.",
                acs: [
                    { code: "AC 61.01", label: "Communication écrite/orale" },
                    { code: "AC 61.02", label: "Droit et éthique" },
                    { code: "AC 61.03", label: "Anglais technique" },
                    { code: "AC 62.01", label: "Travail collaboratif" },
                    { code: "AC 62.02", label: "Environnement pro" },
                    { code: "AC 62.03", label: "Projet professionnel" }
                ],
                reflexion: {
                    difficultes: "Coordonner efficacement le travail d'une équipe avec des niveaux techniques hétérogènes.",
                    savoirs: "Développement de l'écoute active, communication assertive et aisance lors des présentations orales."
                }
            }
        ],
        projects: [
            { 
                title: "Jeu Latice", category: "Réaliser", level: 3, 
                desc: "Jeu de société complet développé en Java.", 
                role: "Développeur Lead — Conception de l'algorithme de validation des coups et création de l'interface utilisateur en JavaFX.",
                livrables: [{ nom: "Dépôt GitHub", url: "https://github.com/rbastide/latice" }],
                tech: ["Java", "JavaFX"], tags: ["AC 11.01", "AC 12.03"] 
            },
            { 
                title: "Optimisation SQL", category: "Optimiser", level: 3, 
                desc: "Amélioration des requêtes SQL et refonte partielle d'une base de données existante.", 
                role: "Administrateur de la Base — Analyse des goulets d'étranglement, restructuration du schéma et ajout d'index.",
                livrables: [{ nom: "Compte-Rendu", url: "https://docs.google.com/document/d/1MkoOj10LHxPi9Ie-tQKfuMqT1fgx-wu88fBNFWs4SAw/edit?usp=sharing" }],
                tech: ["Python", "SQL"], tags: ["AC 21.01", "AC 42.01"] 
            },
            { 
                title: "Réseau Sécurisé", category: "Administrer", level: 4, 
                desc: "Mise en place d'une architecture réseau virtuelle complète et sécurisée.", 
                role: "Administrateur Système — Configuration des machines virtuelles, du routage interne et des règles iptables.",
                livrables: [{ nom: "Dépôt GitHub", url: "https://github.com/rbastide/Reseau" }],
                tech: ["Linux", "SSH"], tags: ["AC 31.03", "AC 32.04"] 
            },
            { 
                title: "Bibliothèque", category: "Gérer", level: 4, 
                desc: "Création de scripts d'automatisation pour la gestion d'une bibliothèque.", 
                role: "Développeur de Scripts — Automatisation du processus de sauvegarde des bases et gestion des logs applicatifs.",
                livrables: [{ nom: "Compte-Rendu", url: "https://docs.google.com/document/d/1L1QfFlK6oreZq4vJf2hF_2ptG4T0Kd8z_afSNKuYrWo/edit?tab=t.0" }],
                tech: ["Bash"], tags: ["AC 41.01"] 
            },
            { 
                title: "ERP Centralisé", category: "Fullstack", level: 4, 
                desc: "Application web de gestion centralisée des fiches ressources à destination des professeurs.", 
                role: "Développeur Fullstack — Développement de l'API REST avec SpringBoot et de l'interface front-end réactive en Vue.js.",
                livrables: [{ nom: "Dépôt GitHub", url: "https://github.com/rbastide/sae_erp" }],
                tech: ["Vue.js", "Docker", "SpringBoot"], tags: ["AC 12.04", "AC 41.03"] 
            },
            { 
                title: "Gestion de projet", category: "Conduire", level: 4, 
                desc: "Création complète d'un plan de projet pour une entreprise fictive dans le cadre d'un module d'études.", 
                role: "Scrum Master — Découpage du projet en user stories, animation des rituels agiles et suivi de l'avancement global.",
                livrables: [{ nom: "Compte-Rendu", url: "https://docs.google.com/document/d/104-1ie-kug6LXTbefCX5LY-iyqoJ5MWg1y1rLxulLbw/edit?usp=sharing" }],
                tech: ["Méthodes Agiles", "PowerPoint"], tags: ["AC 51.03", "AC 52.02"] 
            }
        ]
    },
    getData() { return this.data; },
    getLevelInfo(n) { return this.levelDefinitions[n] || { label: "—", color: "" }; }
};


// ============================================
// VIEW — Rendering Layer
// ============================================
const View = {
    app: document.getElementById('app'),

    renderAll() {
        const d = Model.getData();
        this.app.innerHTML = 
            this.heroHTML(d) +
            this.skillsHTML(d) +
            this.projectsHTML(d) +
            this.contactHTML(d);
    },

    heroHTML(d) {
        const p = d.profile;
        return `
        <section id="home">
            <div class="hero-content">
                <div class="hero-pre reveal">
<span class="cmd">&gt;</span> INIT.FIRMWARE // BASTIDE_RÉMI_
<span class="cmd">&gt;</span> [OK] MOD_DÉVELOPPEMENT......... [ACTIVE]
<span class="cmd">&gt;</span> [OK] MOD_ADMINISTRATION........ [ONLINE]
<span class="cmd">&gt;</span> [OK] MOD_GESTION_PROJET........ [LOADED]
<span class="cmd">&gt;</span> SILICON_READY. HANDING_CONTROL_TO_KERNEL...
                </div>
                <h1 class="hero-name reveal delay-1">BASTIDE<br><span class="accent">RÉMI;</span></h1>
                <p class="hero-role reveal delay-2">${p.role}</p>
                <p class="hero-bio reveal delay-2">${p.bio}</p>
                <div class="hero-stats reveal delay-3">
                    <div class="stat">
                        <span class="stat-value">${p.stats.projects}</span>
                        <span class="stat-label">Projets</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${p.stats.years}</span>
                        <span class="stat-label">Années</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${p.stats.level}</span>
                        <span class="stat-label">Niveau</span>
                    </div>
                </div>
                <a href="#projects" class="hero-cta reveal delay-4">
                    Découvrir mon travail <span class="arrow">↓</span>
                </a>
            </div>
        </section>`;
    },

    skillsHTML(d) {
        const cards = d.competences.map((c, i) => {
            const info = Model.getLevelInfo(c.level);
            const fill = c.level / 4;
            return `
            <div class="skill-card reveal delay-${(i % 3) + 1}">
                <div class="skill-card-header">
                    <div class="skill-icon">${c.icon}</div>
                    <span class="skill-level ${info.color}">NIV.${c.level} — ${info.label.toUpperCase()}</span>
                </div>
                <h3 class="skill-title">${c.title}</h3>
                <p class="skill-desc">${c.description}</p>
                <div class="skill-bar-track">
                    <div class="skill-bar-fill" style="--fill: ${fill}" data-fill="${fill}"></div>
                </div>
                <button class="skill-details-toggle" onclick="Controller.toggleDetails(${c.id})">
                    <span>// voir les détails</span>
                    <span class="chevron" id="chevron-${c.id}">▼</span>
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
            </div>`;
        }).join('');

        return `
        <section id="skills">
            <div class="section-header reveal">
                <span class="section-tag">&gt; cat /skills</span>
                <h2 class="section-title">Compé<span class="highlight">tences</span></h2>
                <p class="section-desc">Une expertise technique acquise au fil des projets et validée par le référentiel national.</p>
            </div>
            <div class="skills-grid">${cards}</div>
        </section>`;
    },

    projectsHTML(d) {
        const cards = d.projects.map((p, i) => `
            <div class="project-card reveal delay-${(i % 2) + 1}">
                <div class="project-meta">
                    <span class="project-category">${p.category}</span>
                    <span class="project-level">N${p.level}</span>
                </div>
                <h3 class="project-title">${p.title}</h3>
                <div class="project-info">
                    <p><strong>Description :</strong> ${p.desc}</p>
                    <p><strong>Mon rôle :</strong> ${p.role}</p>
                </div>
                <div class="project-livrables">
                    <div class="project-livrables-label">Livrables :</div>
                    ${p.livrables.map(l => `<a href="${l.url}" target="_blank" class="livrable-link">↗ ${l.nom}</a>`).join('')}
                </div>
                <div class="project-tags">
                    ${p.tech.map(t => `<span class="tag-tech">${t}</span>`).join('')}
                    ${(p.tags || []).map(t => `<span class="tag-ac">${t}</span>`).join('')}
                </div>
            </div>
        `).join('');

        return `
        <section id="projects">
            <div class="projects-header reveal">
                <div class="section-header" style="margin-bottom:0">
                    <span class="section-tag">&gt; ls ~/projects</span>
                    <h2 class="section-title">Projets <span class="highlight">Récents</span></h2>
                    <p class="section-desc">Sélection de réalisations concrètes en développement et administration.</p>
                </div>
                <a href="https://github.com/rbastide" target="_blank" rel="noopener noreferrer" class="github-link">
                    Voir GitHub →
                </a>
            </div>
            <div class="projects-grid">${cards}</div>
        </section>`;
    },

    contactHTML() {
        return `
        <section id="contact">
            <div class="section-header reveal">
                <span class="section-tag">&gt; ssh contact@bastide</span>
            </div>
            <div class="contact-wrapper reveal delay-1">
                <div class="contact-inner">
                    <div class="contact-info">
                        <h2 class="contact-title">Travaillons<br><span class="highlight">ensemble.</span></h2>
                        <p class="contact-text">
                            Je suis à la recherche d'une alternance ou d'un stage. Si mon profil vous intéresse, n'hésitez pas à me laisser un message.
                        </p>
                        <a href="mailto:remi.bastide29@gmail.com" class="contact-link">
                            <span class="contact-link-icon">✉</span>
                            <span>remi.bastide29@gmail.com</span>
                        </a>
                        <div class="contact-socials">
                            <a href="https://github.com/rbastide" target="_blank" rel="noopener noreferrer" class="social-btn" title="GitHub">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                            </a>
                            <a href="https://www.linkedin.com/in/bremi/" target="_blank" rel="noopener noreferrer" class="social-btn" title="LinkedIn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                            </a>
                        </div>
                    </div>
                    <div class="contact-form-wrap">
                        <form onsubmit="event.preventDefault(); alert('Message envoyé !');">
                            <label>Votre Nom</label>
                            <input type="text" placeholder="John Doe">
                            <label>Email</label>
                            <input type="email" placeholder="john@example.com">
                            <label>Message</label>
                            <textarea rows="4" placeholder="Votre message..."></textarea>
                            <button type="submit" class="submit-btn">&gt; Envoyer_</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>`;
    }
};


// ============================================
// CONTROLLER — Logic Layer
// ============================================
const Controller = {
    init() {
        this.runBootSequence().then(() => {
            View.renderAll();
            this.initObserver();
            this.initNavHighlight();
        });
    },

    async runBootSequence() {
        const overlay = document.getElementById('boot-overlay');
        const log = document.getElementById('boot-log');

        // Skip boot on reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            overlay.classList.add('hidden');
            return;
        }

        const lines = [
            { text: '> INIT.FIRMWARE // BASTIDE_RÉMI_', cls: 'line-info', delay: 100 },
            { text: '', cls: '', delay: 200 },
            { text: '> [OK] SPI_FLASH_UEFI_MOUNTED', cls: 'line-ok', delay: 80 },
            { text: '> [OK] CPU_MICROCODE_PATCHED', cls: 'line-ok', delay: 80 },
            { text: '> [OK] IMC_PCIe_LANES_CALIBRATED', cls: 'line-ok', delay: 80 },
            { text: '', cls: '', delay: 150 },
            { text: '> [OK] MOD_DÉVELOPPEMENT......... [ACTIVE]', cls: 'line-module', delay: 120 },
            { text: '> [OK] MOD_ADMINISTRATION........ [ONLINE]', cls: 'line-module', delay: 120 },
            { text: '> [OK] MOD_GESTION_PROJET........ [LOADED]', cls: 'line-module', delay: 120 },
            { text: '> [OK] MOD_COLLABORATION......... [LOADED]', cls: 'line-module', delay: 120 },
            { text: '', cls: '', delay: 200 },
            { text: '> SILICON_READY. HANDING_CONTROL_TO_KERNEL...', cls: 'line-info', delay: 300 },
            { text: '', cls: '', delay: 150 },
            { text: '> Press F10 to load profile... █', cls: 'line-warn', delay: 400 },
            { text: '', cls: '', delay: 100 },
            { text: '> ./init-portfolio.sh', cls: 'line-info', delay: 600 },
        ];

        for (const line of lines) {
            await this.sleep(line.delay);
            const span = document.createElement('div');
            span.className = line.cls;
            span.textContent = line.text;
            log.appendChild(span);
            log.scrollTop = log.scrollHeight;
        }

        await this.sleep(400);
        overlay.classList.add('hidden');
    },

    sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    },

    toggleDetails(id) {
        const el = document.getElementById(`details-${id}`);
        const chevron = document.getElementById(`chevron-${id}`);
        const btn = chevron.closest('.skill-details-toggle');
        
        el.classList.toggle('open');
        btn.classList.toggle('open');
    },

    initObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Animate skill bars
                    entry.target.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
                        setTimeout(() => bar.classList.add('active'), i * 100);
                    });
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    },

    initNavHighlight() {
        const links = document.querySelectorAll('.nav-link[data-section]');
        const sections = ['home', 'skills', 'projects', 'contact'].map(id => document.getElementById(id));

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    links.forEach(l => l.classList.remove('active'));
                    const active = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
                    if (active) active.classList.add('active');
                }
            });
        }, { threshold: 0.3 });

        sections.forEach(s => { if (s) observer.observe(s); });
    }
};


// ============================================
// CHATBOT — ReyMysterio (local, no API)
// ============================================
const Chatbot = {
    isOpen: false,
    botName: 'REYMYSTERIO',

    // Knowledge base built from Model data
    kb: {
        profil: {
            keys: ['qui', 'rémi', 'remi', 'profil', 'présent', 'present', 'parcours', 'formation', 'étud', 'etud', 'but', 'informatique', 'toi', 'about', 'à propos', 'c\'est qui'],
            answers: [
                "Rémi Bastide est étudiant en 2ème année de BUT Informatique. Il est Développeur Junior & Administrateur Système. Il conçoit des solutions logicielles robustes et sécurisées, en alliant rigueur technique et créativité.",
                "Bastide Rémi — 2ème année de BUT Informatique. Développeur Junior et Admin Système, il a déjà 6 projets à son actif et 2 ans d'expérience dans le domaine.",
            ]
        },
        contact: {
            keys: ['contact', 'mail', 'email', 'joindre', 'écrire', 'ecrire', 'recrut', 'embauche', 'linkedin', 'github', 'téléphone', 'telephone', 'adresse'],
            answers: [
                "Vous pouvez contacter Rémi par email : remi.bastide29@gmail.com. Il est aussi sur GitHub (github.com/rbastide) et LinkedIn (linkedin.com/in/bremi/).",
                "Pour joindre Rémi → email : remi.bastide29@gmail.com | GitHub : github.com/rbastide | LinkedIn : linkedin.com/in/bremi/. N'hésitez pas, il est très réactif !",
            ]
        },
        alternance: {
            keys: ['alternance', 'stage', 'recherche', 'disponib', 'recrut', 'embauche', 'travail', 'poste', 'candidat', 'cv', 'hiring', 'hire'],
            answers: [
                "Rémi est actuellement à la recherche d'une alternance ou d'un stage ! Si son profil vous intéresse, contactez-le à remi.bastide29@gmail.com.",
                "Bonne nouvelle, Rémi cherche une alternance ou un stage en ce moment. Vous pouvez le contacter via le formulaire en bas de page ou par email : remi.bastide29@gmail.com.",
            ]
        },
        competences: {
            keys: ['compétence', 'competence', 'skill', 'sait faire', 'capable', 'niveau', 'maîtrise', 'maitrise', 'expertise', 'fort'],
            answers: [
                "Rémi a 6 compétences clés du BUT Informatique : Réaliser (Expert), Optimiser (Maîtrisé), Administrer (Maîtrisé), Gérer (Maîtrisé), Conduire (Expert) et Collaborer (Expert). Ses points forts sont le développement, la gestion de projet et la collaboration.",
                "Côté compétences, Rémi excelle en développement logiciel (Réaliser — Niv.4), gestion de projet agile (Conduire — Niv.4) et travail d'équipe (Collaborer — Niv.4). Il maîtrise aussi l'administration système, l'optimisation et la gestion de données (Niv.3 chacun).",
            ]
        },
        realiser: {
            keys: ['réaliser', 'realiser', 'coder', 'développ', 'developp', 'programm', 'code', 'logiciel', 'application'],
            answers: [
                "La compétence 'Réaliser' est au niveau Expert (4/4). Rémi sait concevoir, coder, tester et intégrer des applications. Il maîtrise les design patterns, les tests unitaires et le code propre. Technologies : Java, JavaFX, Vue.js, SpringBoot.",
            ]
        },
        optimiser: {
            keys: ['optimi', 'algo', 'performance', 'complexité', 'complexite', 'structure de données', 'structure de donnees'],
            answers: [
                "La compétence 'Optimiser' est au niveau Maîtrisé (3/4). Rémi sait analyser des problèmes, comparer des algorithmes et comprend la complexité algorithmique temporelle et spatiale. Il travaille sur l'optimisation de requêtes SQL et le choix de structures de données.",
            ]
        },
        administrer: {
            keys: ['administr', 'système', 'systeme', 'réseau', 'reseau', 'linux', 'serveur', 'ssh', 'bash', 'iptable', 'pare-feu', 'firewall', 'routage'],
            answers: [
                "La compétence 'Administrer' est au niveau Maîtrisé (3/4). Rémi gère systèmes et réseaux : configuration de machines virtuelles, routage, règles iptables, automatisation Bash et sécurisation SSH.",
            ]
        },
        gerer: {
            keys: ['gérer', 'gerer', 'base de données', 'base de donnees', 'sql', 'bdd', 'sgbd', 'requête', 'requete', 'donnée', 'donnee', 'business intelligence'],
            answers: [
                "La compétence 'Gérer' est au niveau Maîtrisé (3/4). Rémi exploite les données d'entreprise : SQL, normalisation de bases de données, optimisation de requêtes via l'indexation et administration SGBD.",
            ]
        },
        conduire: {
            keys: ['conduire', 'projet', 'agile', 'scrum', 'sprint', 'jira', 'trello', 'gestion de projet', 'planif'],
            answers: [
                "La compétence 'Conduire' est au niveau Expert (4/4). Rémi gère des projets en méthode Scrum, utilise Jira et Trello, découpe en user stories et anime les rituels agiles. Il a été Scrum Master sur un projet complet.",
            ]
        },
        collaborer: {
            keys: ['collabor', 'équipe', 'equipe', 'communic', 'travail d\'équipe', 'travail d\'equipe', 'anglais', 'oral', 'écoute', 'ecoute'],
            answers: [
                "La compétence 'Collaborer' est au niveau Expert (4/4). Rémi excelle en communication écrite et orale, écoute active et communication assertive. Il sait coordonner des équipes et maîtrise l'anglais technique.",
            ]
        },
        projets: {
            keys: ['projet', 'réalisation', 'realisation', 'travaux', 'portfolio', 'fait quoi', 'créé', 'cree', 'construit'],
            answers: [
                "Rémi a réalisé 6 projets majeurs : Jeu Latice (Java/JavaFX), Optimisation SQL (Python/SQL), Réseau Sécurisé (Linux/SSH), Bibliothèque (Bash), ERP Centralisé (Vue.js/Docker/SpringBoot) et Gestion de projet (Méthodes Agiles). Vous pouvez les explorer dans la section Projets !",
                "Parmi ses projets phares : un jeu de société en Java, une app web fullstack (Vue.js + SpringBoot + Docker), une architecture réseau sécurisée, et de l'automatisation en Bash. Tout est visible dans la section Projets ci-dessus.",
            ]
        },
        latice: {
            keys: ['latice', 'jeu', 'javafx', 'java'],
            answers: [
                "Le Jeu Latice est un jeu de société complet développé en Java avec JavaFX. Rémi était Développeur Lead : il a conçu l'algorithme de validation des coups et créé l'interface utilisateur. Le code est dispo sur GitHub !",
            ]
        },
        erp: {
            keys: ['erp', 'vue.js', 'vuejs', 'springboot', 'spring boot', 'docker', 'fullstack', 'full stack', 'api rest'],
            answers: [
                "L'ERP Centralisé est une application web de gestion des fiches ressources pour les professeurs. Rémi a développé l'API REST avec SpringBoot et le front-end en Vue.js, le tout conteneurisé avec Docker. Un vrai projet fullstack !",
            ]
        },
        reseau: {
            keys: ['réseau sécurisé', 'reseau securise', 'architecture réseau', 'architecture reseau', 'machine virtuelle', 'iptables'],
            answers: [
                "Le projet Réseau Sécurisé consiste en la mise en place d'une architecture réseau virtuelle complète et sécurisée. Rémi a configuré les machines virtuelles, le routage interne et les règles iptables en tant qu'Administrateur Système.",
            ]
        },
        bibliotheque: {
            keys: ['bibliothèque', 'bibliotheque', 'script', 'automatisation', 'sauvegarde', 'log'],
            answers: [
                "Le projet Bibliothèque porte sur la création de scripts Bash d'automatisation pour gérer une bibliothèque : sauvegarde automatique des bases de données et gestion des logs applicatifs.",
            ]
        },
        tech: {
            keys: ['technologie', 'langage', 'outil', 'tech', 'stack', 'framework', 'python', 'docker', 'vue'],
            answers: [
                "Rémi maîtrise plusieurs technologies : Java, JavaFX, Python, SQL, Vue.js, SpringBoot, Docker, Linux, Bash, SSH. Côté méthodologie : Scrum, Jira, Trello. Un profil polyvalent entre dev et admin système !",
            ]
        },
        bonjour: {
            keys: ['bonjour', 'salut', 'hello', 'hey', 'coucou', 'yo', 'bonsoir', 'wesh', 'slt', 'bjr'],
            answers: [
                "Hey ! Bienvenue sur le portfolio de Rémi. Je suis ReyMysterio, son assistant. Posez-moi vos questions sur ses compétences, projets ou parcours !",
                "Salut ! ReyMysterio à votre service. Que voulez-vous savoir sur Rémi ? Ses projets, compétences, ou comment le contacter ?",
                "Yo ! Je suis ReyMysterio, l'assistant de Rémi. Demandez-moi ce que vous voulez savoir !",
            ]
        },
        merci: {
            keys: ['merci', 'thanks', 'thx', 'cool', 'super', 'parfait', 'genial', 'génial', 'top'],
            answers: [
                "Avec plaisir ! N'hésitez pas si vous avez d'autres questions sur Rémi.",
                "De rien ! Si le profil de Rémi vous intéresse, pensez à le contacter via le formulaire en bas de page.",
            ]
        },
        aide: {
            keys: ['aide', 'help', 'quoi demander', 'tu fais quoi', 'tu sers à quoi', 'comment', 'fonctionn'],
            answers: [
                "Je peux répondre à vos questions sur Rémi ! Par exemple : ses compétences, ses projets, ses technologies, comment le contacter, s'il cherche un stage/alternance... Demandez-moi ce qui vous intéresse !",
            ]
        }
    },

    fallbacks: [
        "Hmm, je ne suis pas sûr de comprendre. Essayez de me demander quelque chose sur les compétences, projets ou le parcours de Rémi !",
        "Je suis spécialisé sur le profil de Rémi. Essayez : 'Quelles sont ses compétences ?' ou 'Parle-moi de ses projets'.",
        "Bonne question, mais ça sort un peu de mon domaine. Je connais surtout le parcours, les compétences et les projets de Rémi. Tentez autre chose !",
        "Je n'ai pas la réponse à ça, mais demandez-moi des infos sur Rémi et je serai incollable !",
    ],

    init() {
        this.toggleBtn = document.getElementById('chatbot-toggle');
        this.chatbot = document.getElementById('chatbot');
        this.messagesEl = document.getElementById('chatbot-messages');
        this.input = document.getElementById('chatbot-input');
        this.sendBtn = document.getElementById('chatbot-send');
        this.closeBtn = document.getElementById('chatbot-close');

        this.toggleBtn.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());
        this.sendBtn.addEventListener('click', () => this.send());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
        });

        this.addBotMessage("Salut ! Je suis ReyMysterio, l'assistant de Rémi. Posez-moi une question sur ses compétences, ses projets ou son parcours !");
    },

    open() {
        this.isOpen = true;
        this.chatbot.classList.remove('chatbot-closed');
        this.chatbot.classList.add('chatbot-open');
        this.toggleBtn.classList.add('hidden');
        setTimeout(() => this.input.focus(), 300);
    },

    close() {
        this.isOpen = false;
        this.chatbot.classList.remove('chatbot-open');
        this.chatbot.classList.add('chatbot-closed');
        this.toggleBtn.classList.remove('hidden');
    },

    addBotMessage(text) {
        const div = document.createElement('div');
        div.className = 'chat-msg bot';
        div.innerHTML = `<span class="bot-prefix">${this.botName}</span>${this.escapeHtml(text)}`;
        this.messagesEl.appendChild(div);
        this.scrollToBottom();
    },

    addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'chat-msg user';
        div.innerHTML = `<span class="user-prefix">VOUS</span>${this.escapeHtml(text)}`;
        this.messagesEl.appendChild(div);
        this.scrollToBottom();
    },

    showTyping() {
        const div = document.createElement('div');
        div.className = 'chat-msg bot typing';
        div.id = 'typing-indicator';
        div.innerHTML = `<span class="bot-prefix">${this.botName}</span><div class="typing-dots"><span></span><span></span><span></span></div>`;
        this.messagesEl.appendChild(div);
        this.scrollToBottom();
    },

    removeTyping() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    },

    scrollToBottom() {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    normalize(str) {
        return str.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s']/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    findBestMatch(input) {
        const norm = this.normalize(input);
        let bestTopic = null;
        let bestScore = 0;

        for (const [topic, data] of Object.entries(this.kb)) {
            let score = 0;
            for (const key of data.keys) {
                const normKey = this.normalize(key);
                if (norm.includes(normKey)) {
                    // Longer keyword matches = higher score
                    score += normKey.length;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestTopic = topic;
            }
        }

        if (bestTopic && bestScore > 0) {
            const answers = this.kb[bestTopic].answers;
            return answers[Math.floor(Math.random() * answers.length)];
        }

        return this.fallbacks[Math.floor(Math.random() * this.fallbacks.length)];
    },

    async send() {
        const text = this.input.value.trim();
        if (!text) return;

        this.input.value = '';
        this.addUserMessage(text);
        this.showTyping();

        // Simulate slight delay for natural feel
        const delay = 400 + Math.random() * 600;
        await new Promise(r => setTimeout(r, delay));

        this.removeTyping();
        const reply = this.findBestMatch(text);
        this.addBotMessage(reply);
        this.input.focus();
    }
};


// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    Controller.init();
    Chatbot.init();
});
