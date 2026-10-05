// ============================================
// PROJETS
// ============================================
// Champs :
//   id        identifiant unique (utilisé par le chatbot et les filtres)
//   category  catégorie affichée + filtre
//   context   "Personnel", "Académique", "Professionnel"...
//   period    période de réalisation (optionnel)
//   featured  mis en avant en tête de liste
//   keywords  mots-clés supplémentaires pour le chatbot
const GITHUB = "https://github.com/rbastide";

export const projects = [
    {
        id: "overloady",
        title: "Overloady",
        category: "Fullstack", level: 4, context: "Personnel", period: "2026", featured: true,
        desc: "Application web de suivi d'entraînement basée sur la surcharge progressive : séances en direct, recommandations automatiques de charge, programmes, calculatrices (1RM, disques, échauffement), records et statistiques.",
        role: "Développeur Fullstack — Conception de l'API REST NestJS (authentification JWT, Prisma ORM, PostgreSQL sous Docker) et de l'interface React 19 / TypeScript, dont l'algorithme de surcharge progressive (+2,5 kg ou +1 rép.).",
        livrables: [
            { nom: "Démo en ligne", url: "https://overloady.vercel.app" },
            { nom: "Dépôt GitHub", url: `${GITHUB}/Overloady` }
        ],
        tech: ["React", "TypeScript", "NestJS", "Prisma", "PostgreSQL", "Docker"],
        tags: ["AC 12.02", "AC 12.04", "AC 41.03"],
        keywords: ["overloady", "overload", "muscu", "musculation", "sport", "entrainement", "entraînement", "react", "nestjs", "prisma", "postgres", "typescript"]
    },
    {
        id: "horaires",
        title: "Horaires Train & Bus",
        category: "Fullstack", level: 3, context: "Grand Périgueux", period: "Avr. – Juin 2026", featured: true,
        desc: "Écran d'affichage dynamique des prochains départs de trains depuis la gare de Périgueux et des bus du réseau PériMouv, avec rotation automatique des sections.",
        role: "Développeur Fullstack — Backend Node.js / Express interrogeant l'API SNCF (Navitia) et une base MySQL pour les bus, puis front-end en JavaScript natif avec chargement de composants et tableaux de départs en temps réel.",
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/Horaires-Train-et-Bus` }],
        tech: ["Node.js", "Express", "MySQL", "API SNCF", "JavaScript"],
        tags: ["AC 12.01", "AC 12.04", "AC 41.01"],
        keywords: ["horaire", "train", "bus", "sncf", "navitia", "perimouv", "périmouv", "perigueux", "périgueux", "gare", "express", "node"]
    },
    {
        id: "portail",
        title: "Portail des applications internes",
        category: "Réaliser", level: 3, context: "Grand Périgueux", period: "Avr. – Juin 2026", featured: true,
        desc: "Intranet regroupant les applications internes du Grand Périgueux, avec un affichage adapté à chaque structure, des catégories, des groupes d'applications, des favoris et un thème clair / sombre.",
        role: "Développeur Front-end — Conception d'une architecture configurable (métadonnées, structures, outils communs), gestion des favoris et du thème, et rédaction de la documentation d'ajout d'applications.",
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/Portail-des-applications-internes` }],
        tech: ["JavaScript", "HTML", "CSS"],
        tags: ["AC 12.01", "AC 12.02", "AC 62.02"],
        keywords: ["portail", "intranet", "application interne", "applications internes", "grand perigueux", "grand périgueux", "favori"]
    },
    {
        id: "unilim-edt",
        title: "Unilim EDT",
        category: "Réaliser", level: 3, context: "Personnel", period: "2026",
        // TODO : dépôt privé — compléter la description, le rôle et les technologies.
        desc: "Application de consultation de l'emploi du temps de l'Université de Limoges.",
        role: "Développeur — Conception et développement de l'application.",
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/unilim-edt` }],
        tech: [],
        tags: ["AC 12.03"],
        keywords: ["unilim", "edt", "emploi du temps", "limoges", "universite", "université", "planning"]
    },
    {
        id: "erp",
        title: "ERP Centralisé",
        category: "Fullstack", level: 4, context: "Académique",
        desc: "Application web de gestion centralisée des fiches ressources à destination des professeurs.",
        role: "Développeur Fullstack (orienté résolution de problèmes) — Développement de la connexion grâce à un CAS, création de l'API REST avec SpringBoot et du front-end en Vue.js.",
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/Erp` }],
        tech: ["Vue.js", "Docker", "SpringBoot"],
        tags: ["AC 12.04", "AC 41.03"],
        keywords: ["erp", "vue.js", "vuejs", "springboot", "spring boot", "cas", "fiche ressource"]
    },
    {
        id: "latice",
        title: "Jeu Latice",
        category: "Réaliser", level: 3, context: "Académique",
        desc: "Jeu de société complet développé en Java.",
        role: "Développeur Lead — Conception de l'algorithme de validation des coups et création de l'interface utilisateur en JavaFX.",
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/latice` }],
        tech: ["Java", "JavaFX"],
        tags: ["AC 11.01", "AC 12.03"],
        keywords: ["latice", "jeu", "javafx", "java"]
    },
    {
        id: "sql",
        title: "Optimisation SQL",
        category: "Optimiser", level: 3, context: "Académique",
        desc: "Amélioration des requêtes SQL et refonte partielle d'une base de données existante.",
        role: "Administrateur de la Base — Analyse des goulets d'étranglement, restructuration du schéma et ajout d'index.",
        livrables: [{ nom: "Compte-Rendu", url: "https://docs.google.com/document/d/1MkoOj10LHxPi9Ie-tQKfuMqT1fgx-wu88fBNFWs4SAw/edit?usp=sharing" }],
        tech: ["Python", "SQL"],
        tags: ["AC 21.01", "AC 42.01"],
        keywords: ["optimisation sql", "index", "requete", "requête"]
    },
    {
        id: "reseau",
        title: "Réseau Sécurisé",
        category: "Administrer", level: 4, context: "Académique",
        desc: "Mise en place d'une architecture réseau virtuelle complète et sécurisée.",
        role: "Administrateur Système — Configuration des machines virtuelles, du routage interne et des règles iptables.",
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/Reseau` }],
        tech: ["Linux", "SSH"],
        tags: ["AC 31.03", "AC 32.04"],
        keywords: ["réseau sécurisé", "reseau securise", "architecture réseau", "architecture reseau", "machine virtuelle", "iptables", "kathara"]
    },
    {
        id: "bibliotheque",
        title: "Bibliothèque",
        category: "Gérer", level: 4, context: "Académique",
        desc: "Création de scripts d'automatisation pour la gestion d'une bibliothèque.",
        role: "Développeur de Scripts — Automatisation du processus de sauvegarde des bases et gestion des logs applicatifs.",
        livrables: [{ nom: "Compte-Rendu", url: "https://docs.google.com/document/d/1L1QfFlK6oreZq4vJf2hF_2ptG4T0Kd8z_afSNKuYrWo/edit?tab=t.0" }],
        tech: ["Bash"],
        tags: ["AC 41.01"],
        keywords: ["bibliothèque", "bibliotheque", "script", "automatisation", "sauvegarde", "log"]
    },
    {
        id: "gestion-projet",
        title: "Gestion de projet",
        category: "Conduire", level: 4, context: "Académique",
        desc: "Création complète d'un plan de projet pour une entreprise fictive dans le cadre d'un module d'études.",
        role: "Scrum Master — Découpage du projet en user stories, animation des rituels agiles et suivi de l'avancement global.",
        livrables: [{ nom: "Compte-Rendu", url: "https://docs.google.com/document/d/104-1ie-kug6LXTbefCX5LY-iyqoJ5MWg1y1rLxulLbw/edit?usp=sharing" }],
        tech: ["Méthodes Agiles", "PowerPoint"],
        tags: ["AC 51.03", "AC 52.02"],
        keywords: ["gestion de projet", "plan de projet", "scrum master", "user stories"]
    }
];

export function getCategories() {
    return [...new Set(projects.map(p => p.category))];
}
