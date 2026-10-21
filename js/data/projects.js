// ============================================
// PROJETS
// ============================================
// Champs :
//   id        identifiant unique (utilisé par le chatbot et les filtres)
//   category  catégorie affichée + filtre
//   context   "Personnel", "Académique", "Professionnel"...
//   period    période de réalisation (optionnel)
//   featured  mis en avant en tête de liste
//   icon      icône Material Symbols affichée sur la carte
//   keywords  mots-clés supplémentaires pour le chatbot
const GITHUB = "https://github.com/rbastide";

export const projects = [
    {
        id: "overloady", icon: "fitness_center",
        title: "Overloady",
        category: "Fullstack", level: 3, context: "Personnel", period: "2026", featured: true,
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
        id: "horaires", icon: "directions_transit",
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
        id: "portail", icon: "apps",
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
        id: "unilim-edt", icon: "calendar_month",
        title: "Unilim EDT",
        category: "Fullstack", level: 3, context: "Personnel", period: "2026",
        desc: "Application web de génération d'emplois du temps pour l'Université de Limoges.",
        role: "Développeur Fullstack — Développement de l'application avec Laravel (PHP) et une interface Vue.js / TypeScript, le tout conteneurisé avec Docker.",
        // Dépôt privé pour l'instant : retirer `private: true` une fois le dépôt public.
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/unilim-edt`, private: true }],
        tech: ["Laravel", "PHP", "Vue.js", "TypeScript", "Python", "Docker"],
        tags: ["AC 12.02", "AC 12.04"],
        keywords: ["unilim", "edt", "emploi du temps", "emplois du temps", "limoges", "universite", "université", "planning", "laravel", "php", "generation", "génération"]
    },
    {
        id: "erp", icon: "inventory_2",
        title: "ERP Centralisé",
        category: "Fullstack", level: 3, context: "Académique",
        desc: "Application web de gestion centralisée des fiches ressources à destination des professeurs.",
        role: "Développeur Fullstack (orienté résolution de problèmes) — Développement de la connexion grâce à un CAS, création de l'API REST avec SpringBoot et du front-end en Vue.js.",
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/Erp` }],
        tech: ["Vue.js", "Docker", "SpringBoot"],
        tags: ["AC 12.04", "AC 41.03"],
        keywords: ["erp", "vue.js", "vuejs", "springboot", "spring boot", "cas", "fiche ressource"]
    },
    {
        id: "latice", icon: "grid_view",
        title: "Jeu Latice",
        category: "Réaliser", level: 3, context: "Académique",
        desc: "Jeu de société complet développé en Java.",
        role: "Développeur Lead — Conception de l'algorithme de validation des coups et création de l'interface utilisateur en JavaFX.",
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/latice` }],
        tech: ["Java", "JavaFX"],
        tags: ["AC 11.01", "AC 12.03"],
        keywords: ["latice", "jeu", "javafx", "java"]
    }
];

export function getCategories() {
    return [...new Set(projects.map(p => p.category))];
}
