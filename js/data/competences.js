// ============================================
// COMPÉTENCES — référentiel BUT Informatique
// ============================================
export const competences = [
    {
        id: 1, title: "Réaliser", icon: "code", level: 4, description: "Concevoir, coder, tester et intégrer.",
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
        id: 2, title: "Optimiser", icon: "bolt", level: 3, description: "Améliorer performances et algorithmes.",
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
        id: 3, title: "Administrer", icon: "dns", level: 3, description: "Gérer systèmes et réseaux.",
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
        id: 5, title: "Conduire", icon: "view_kanban", level: 4, description: "Gestion de projet et besoins.",
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
        id: 6, title: "Collaborer", icon: "groups", level: 4, description: "Travail d'équipe et communication.",
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
];
