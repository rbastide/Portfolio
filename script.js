const Model = {
    levelDefinitions: {
        1: { label: "Compétences Basiques", color: "bg-blue-400", desc: "Niveau novice." },
        2: { label: "Compétences Acquises", color: "bg-green-400", desc: "Niveau intermédiaire." },
        3: { label: "Compétences Maîtrisées", color: "bg-indigo-500", desc: "Niveau avancé." },
        4: { label: "Compétences Expertes", color: "bg-purple-600", desc: "Niveau expert." }
    },
    data: {
        profile: {
            name: "Bastide Rémi",
            role: "Développeur Junior & Administrateur Système",
            bio: "Étudiant en 2ème année de BUT Informatique. Je conçois des solutions logicielles robustes et sécurisées, en alliant rigueur technique et créativité.",
            stats: { projects: 12, years: 2, cups_of_coffee: 450 }
        },
        competences: [
            {
                id: 1, title: "Réaliser", icon: "code-2", level: 4, description: "Concevoir, coder, tester et intégrer.",
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
                id: 2, title: "Optimiser", icon: "zap", level: 3, description: "Améliorer performances et algorithmes.",
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
                id: 3, title: "Administrer", icon: "server", level: 3, description: "Gérer systèmes et réseaux.",
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
                id: 4, title: "Gérer", icon: "database", level: 3, description: "Exploiter les données d'entreprise.",
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
                id: 5, title: "Conduire", icon: "kanban", level: 4, description: "Gestion de projet et besoins.",
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
                id: 6, title: "Collaborer", icon: "users", level: 4, description: "Travail d'équipe et communication.",
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
                role: "Développeur Lead - Conception de l'algorithme de validation des coups et création de l'interface utilisateur en JavaFX.",
                livrables: [{ nom: "Dépôt GitHub", url: "#" }, { nom: "Documentation JavaDoc", url: "#" }],
                tech: ["Java", "JavaFX"], tags: ["AC 11.01", "AC 12.03"] 
            },
            { 
                title: "Optimisation SQL", category: "Optimiser", level: 3, 
                desc: "Amélioration des requêtes SQL et refonte partielle d'une base de données existante.", 
                role: "Administrateur de la Base - Analyse des goulets d'étranglement, restructuration du schéma et ajout d'index.",
                livrables: [{ nom: "Scripts SQL", url: "#" }, { nom: "Rapport d'optimisation", url: "#" }],
                tech: ["Python", "SQL"], tags: ["AC 21.01", "AC 42.01"] 
            },
            { 
                title: "Réseau Sécurisé", category: "Administrer", level: 4, 
                desc: "Mise en place d'une architecture réseau virtuelle complète et sécurisée.", 
                role: "Administrateur Système - Configuration des machines virtuelles, du routage interne et des règles iptables.",
                livrables: [{ nom: "Schéma Topologique", url: "#" }, { nom: "Document de recette", url: "#" }],
                tech: ["Linux", "SSH"], tags: ["AC 31.03", "AC 32.04"] 
            },
            { 
                title: "Bibliothèque", category: "Gérer", level: 4, 
                desc: "Création de scripts d'automatisation pour la gestion d'une bibliothèque.", 
                role: "Développeur de Scripts - Automatisation du processus de sauvegarde des bases et gestion des logs applicatifs.",
                livrables: [{ nom: "Scripts Bash", url: "#" }],
                tech: ["Bash"], tags: ["AC 41.01"] 
            },
            { 
                title: "ERP Centralisé", category: "Fullstack", level: 4, 
                desc: "Application web de gestion centralisée des fiches ressources à destination des professeurs.", 
                role: "Développeur Fullstack - Développement de l'API REST avec SpringBoot et de l'interface front-end réactive en Vue.js.",
                livrables: [{ nom: "Lien de l'application", url: "#" }, { nom: "Code Source Front", url: "#" }],
                tech: ["Vue.js", "Docker", "SpringBoot"], tags: ["AC 12.04", "AC 41.03"] 
            },
            { 
                title: "Gestion de projet", category: "Conduire", level: 4, 
                desc: "Création complète d'un plan de projet pour une entreprise fictive dans le cadre d'un module d'études.", 
                role: "Scrum Master - Découpage du projet en user stories, animation des rituels agiles et suivi de l'avancement global.",
                livrables: [{ nom: "Présentation de soutenance", url: "#" }, { nom: "Tableau Trello/Jira", url: "#" }],
                tech: ["Méthodes Agiles","PowerPoint"], tags: ["AC 51.03", "AC 52.02"] 
            }
        ]
    },
    getData() { return this.data; },
    getLevelInfo(levelNumber) {
        return this.levelDefinitions[levelNumber] || { label: "Non défini", color: "bg-gray-300" };
    }
};

const View = {
    appContainer: document.getElementById('app'),
    navContainer: document.getElementById('desktop-nav'),

    init() {
        this.renderNav();
        this.renderAllSections();
    },

    renderNav() {
        const links = [
            { id: 'home', label: 'Accueil' },
            { id: 'skills', label: 'Compétences' },
            { id: 'projects', label: 'Projets' },
            { id: 'contact', label: 'Contact' }
        ];
        
        let navHtml = links.map(link => `
            <a href="#${link.id}" class="hidden md:inline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                ${link.label}
            </a>
        `).join('');

        navHtml += `
            <button onclick="Controller.toggleTheme()" class="ml-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <i data-lucide="moon" class="w-5 h-5 block dark:hidden"></i>
                <i data-lucide="sun" class="w-5 h-5 hidden dark:block"></i>
            </button>
        `;
        
        this.navContainer.innerHTML = navHtml;
    },

    renderAllSections() {
        const data = Model.getData();
        let html = '';
        html += this.getHomeHTML(data);
        html += this.getSkillsHTML(data);
        html += this.getProjectsHTML(data);
        html += this.getContactHTML(data);
        
        this.appContainer.innerHTML = html;
        lucide.createIcons();
        Controller.initObserver();
    },

    getHomeHTML(data) {
        return `
            <section id="home" class="min-h-screen flex flex-col justify-center items-center py-20">
                <div class="text-center max-w-3xl mx-auto px-4 reveal">
                    <div class="mb-8 inline-block p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl shadow-sm rotate-3 hover:rotate-0 transition-all duration-500">
                        <i data-lucide="terminal" class="w-16 h-16 text-indigo-600 dark:text-indigo-400"></i>
                    </div>
                    <h1 class="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight transition-colors">
                        ${data.profile.name}
                    </h1>
                    <div class="inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-full text-base font-medium mb-8 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 reveal delay-100 transition-colors">
                        ${data.profile.role}
                    </div>
                    <p class="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-12 reveal delay-200 transition-colors">
                        ${data.profile.bio}
                    </p>
                    <div class="grid grid-cols-3 gap-8 mb-16 border-t border-b border-slate-100 dark:border-slate-800 py-8 reveal delay-300 transition-colors">
                        <div><span class="block text-4xl font-bold text-slate-900 dark:text-white">${data.profile.stats.projects}</span><span class="text-sm text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Projets</span></div>
                        <div><span class="block text-4xl font-bold text-slate-900 dark:text-white">${data.profile.stats.years}</span><span class="text-sm text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Années</span></div>
                        <div><span class="block text-4xl font-bold text-slate-900 dark:text-white">N2</span><span class="text-sm text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Niveau</span></div>
                    </div>
                    <div class="reveal delay-300">
                        <a href="#projects" class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-200 bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full hover:bg-slate-800 dark:hover:bg-slate-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-white dark:focus:ring-offset-slate-900">
                            Découvrir mon travail
                            <i data-lucide="arrow-down" class="ml-2 w-5 h-5"></i>
                        </a>
                    </div>
                </div>
            </section>
        `;
    },

    getSkillsHTML(data) {
        const skillsCards = data.competences.map((comp, index) => {
            const levelInfo = Model.getLevelInfo(comp.level);
            const percentage = (comp.level / 4) * 100;
            const delayClass = index % 3 === 0 ? '' : (index % 3 === 1 ? 'delay-100' : 'delay-200');

            return `
            <div class="group bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 reveal ${delayClass}">
                <div class="flex items-center justify-between mb-6">
                    <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                        <i data-lucide="${comp.icon}" class="w-8 h-8"></i>
                    </div>
                    <span class="text-sm font-bold px-3 py-1 rounded-full ${levelInfo.color} text-white">
                        Niv ${comp.level}
                    </span>
                </div>
                
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">${comp.title}</h3>
                <p class="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 transition-colors">${comp.description}</p>
                
                <div class="mb-6">
                    <div class="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden level-bar-container">
                        <div class="h-full ${levelInfo.color} level-bar-fill" style="--scale: ${percentage/100}"></div>
                    </div>
                </div>

                <div class="border-t border-slate-50 dark:border-slate-700 pt-4 transition-colors">
                    <button onclick="Controller.toggleDetails(${comp.id})" class="flex items-center justify-between w-full text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group-btn">
                        <span>Voir les détails</span>
                        <i id="icon-${comp.id}" data-lucide="chevron-down" class="w-4 h-4 transition-transform duration-300"></i>
                    </button>
                    <div id="details-${comp.id}" class="hidden mt-4 space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-sm transition-colors">
                        <div class="space-y-2">
                            <h4 class="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">Apprentissages Critiques</h4>
                            ${comp.acs.map(ac => `<div class="flex gap-2"><span class="font-bold text-slate-700 dark:text-slate-300 min-w-[60px]">${ac.code}</span><span class="text-slate-600 dark:text-slate-400">${ac.label}</span></div>`).join('')}
                        </div>
                        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                            <h4 class="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide text-xs">Analyse Réflexive</h4>
                            <p class="text-slate-600 dark:text-slate-400"><strong class="text-slate-800 dark:text-slate-200">Difficultés :</strong> ${comp.reflexion.difficultes}</p>
                            <p class="text-slate-600 dark:text-slate-400"><strong class="text-slate-800 dark:text-slate-200">Savoirs :</strong> ${comp.reflexion.savoirs}</p>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        return `
            <section id="skills" class="min-h-screen py-24 bg-slate-50/50 dark:bg-slate-900/50 transition-colors duration-300">
                <div class="max-w-6xl mx-auto px-6">
                    <div class="text-center max-w-2xl mx-auto mb-16 reveal">
                        <h2 class="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors">Compétences</h2>
                        <p class="text-lg text-slate-500 dark:text-slate-400 transition-colors">Une expertise technique acquise au fil des projets et validée par le référentiel national.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                        ${skillsCards}
                    </div>
                </div>
            </section>
        `;
    },

    getProjectsHTML(data) {
        const projectsCards = data.projects.map((proj, index) => {
            const delayClass = index % 2 === 0 ? '' : 'delay-100';
            return `
            <div class="relative group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all duration-500 reveal ${delayClass}">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div class="p-8">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">${proj.category}</p>
                            <h3 class="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">${proj.title}</h3>
                        </div>
                        <span class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded transition-colors">N${proj.level}</span>
                    </div>
                    
                    <div class="mb-6 space-y-2">
                        <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors"><strong class="text-slate-900 dark:text-slate-200">Description :</strong> ${proj.desc}</p>
                        <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors"><strong class="text-slate-900 dark:text-slate-200">Mon rôle :</strong> ${proj.role}</p>
                    </div>

                    <div class="mb-6">
                        <strong class="block text-sm text-slate-900 dark:text-slate-200 mb-2 transition-colors">Livrables :</strong>
                        <div class="flex flex-wrap gap-2">
                            ${proj.livrables.map(l => `<a href="${l.url}" target="_blank" class="inline-flex items-center text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-colors duration-200">${l.nom}</a>`).join('')}
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-700 transition-colors">
                        ${proj.tech.map(t => `<span class="px-3 py-1 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-600 transition-colors">${t}</span>`).join('')}
                        ${proj.tags ? proj.tags.map(tag => `<span class="px-3 py-1 bg-slate-800 dark:bg-slate-600 text-white text-xs font-bold rounded-full transition-colors">${tag}</span>`).join('') : ''}
                    </div>
                </div>
            </div>
            `;
        }).join('');

        return `
            <section id="projects" class="min-h-screen py-24">
                <div class="max-w-6xl mx-auto px-6">
                    <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 reveal">
                        <div class="max-w-2xl">
                            <h2 class="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors">Projets Récents</h2>
                            <p class="text-lg text-slate-500 dark:text-slate-400 transition-colors">Sélection de réalisations concrètes en développement et administration.</p>
                        </div>
                        <a href="https://github.com/rbastide" target="_blank" rel="noopener noreferrer" class="hidden md:inline-flex items-center font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mt-4 md:mt-0">
                            Voir GitHub <i data-lucide="arrow-right" class="ml-2 w-4 h-4"></i>
                        </a>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        ${projectsCards}
                    </div>
                </div>
            </section>
        `;
    },

    getContactHTML(data) {
        return `
            <section id="contact" class="min-h-[80vh] flex items-center py-24 bg-slate-900 dark:bg-slate-950 text-white rounded-t-[3rem] mt-12 transition-colors duration-300">
                <div class="max-w-4xl mx-auto px-6 w-full">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div class="reveal">
                            <h2 class="text-4xl md:text-5xl font-extrabold mb-6">Travaillons <br/><span class="text-indigo-400">ensemble.</span></h2>
                            <p class="text-slate-400 text-lg mb-8 leading-relaxed">
                                Je suis à la recherche d'une alternance ou d'un stage. Si mon profil vous intéresse, n'hésitez pas à me laisser un message.
                            </p>
                            <div class="space-y-4">
                                <a href="mailto:remi.bastide@gmail.com" class="flex items-center gap-4 text-slate-300 hover:text-white transition-colors p-4 rounded-2xl bg-white/5 hover:bg-white/10">
                                    <i data-lucide="mail" class="w-6 h-6 text-indigo-400"></i>
                                    <span class="text-lg">remi.bastide@gmail.com</span>
                                </a>
                                <div class="flex gap-4 mt-8">
                                    <a href="https://github.com/rbastide" target="_blank" rel="noopener noreferrer" class="p-4 bg-white/5 rounded-2xl hover:bg-indigo-600 transition-all duration-300 hover:scale-110"><i data-lucide="github" class="w-6 h-6"></i></a>
                                    <a href="https://www.linkedin.com/in/bremi/" target="_blank" rel="noopener noreferrer" class="p-4 bg-white/5 rounded-2xl hover:bg-indigo-600 transition-all duration-300 hover:scale-110"><i data-lucide="linkedin" class="w-6 h-6"></i></a>
                                </div>
                            </div>
                        </div>

                        <form onsubmit="event.preventDefault(); alert('Message envoyé !');" class="bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-8 rounded-3xl shadow-2xl reveal delay-200 transition-colors">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-bold mb-2">Votre Nom</label>
                                    <input type="text" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="John Doe">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold mb-2">Email</label>
                                    <input type="email" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="john@example.com">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold mb-2">Message</label>
                                    <textarea rows="4" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Votre message..."></textarea>
                                </div>
                                <button class="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-[1.02]">
                                    Envoyer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        `;
    }
};

const Controller = {
    init() {
        View.init();
    },

    toggleDetails(id) {
        const content = document.getElementById(`details-${id}`);
        const icon = document.getElementById(`icon-${id}`);
        content.classList.toggle('hidden');
        icon.classList.toggle('rotated');
    },

    // Nouvelle fonction pour gérer le bouton de thème
    toggleTheme() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    },

    initObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting) {
                    el.classList.add('active');
                    try {
                        el.querySelectorAll('.level-bar-fill').forEach((bar, idx) => {
                            bar._shouldFill = true;
                            setTimeout(() => {
                                if (bar._shouldFill) bar.classList.add('fill-active');
                            }, idx * 80);
                        });
                    } catch(e) {}
                } else {
                    el.classList.remove('active');
                    try {
                        el.querySelectorAll('.level-bar-fill').forEach((bar) => {
                            bar._shouldFill = false;
                            bar.classList.remove('fill-active');
                        });
                    } catch(e) {}
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => {
            observer.observe(el);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => Controller.init());