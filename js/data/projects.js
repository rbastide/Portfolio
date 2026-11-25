// ============================================
// PROJETS
// ============================================
// Champs :
//   id        identifiant unique (utilisé par le chatbot et les filtres)
//   category  type de projet (filtre « Type »)
//   context   "Personnel", "Académique", "Grand Périgueux"... (filtre « Contexte »)
//   period    période de réalisation (optionnel)
//   featured  mis en avant en tête de liste
//   icon      icône Material Symbols affichée sur la carte
//   keywords  mots-clés supplémentaires pour le chatbot
const GITHUB = "https://github.com/rbastide";

export const projects = [
    {
        id: "llm", icon: "neurology",
        title: "LLM maison & fine-tuning Mistral",
        category: "IA", context: "Personnel", period: "2026", featured: true,
        desc: "Création d'un modèle de langage de 125 millions de paramètres en PyTorch, puis fine-tuning de trois modèles Mistral : deux de 14 milliards de paramètres (l'un généraliste, l'autre spécialisé en musculation) et un plus léger, optimisé pour la rapidité.",
        role: "Développeur IA : architecture et entraînement du modèle de 125M en PyTorch, préparation des jeux de données, fine-tuning et évaluation des modèles Mistral.",
        // Dépôt privé : retirer `private: true` et ajouter l'URL une fois le dépôt public.
        livrables: [{ nom: "Dépôt GitHub", private: true }],
        tech: ["Python", "PyTorch", "Mistral", "Fine-tuning"],
        keywords: ["llm", "ia", "intelligence artificielle", "pytorch", "mistral", "fine-tuning", "finetuning", "modele", "modèle", "125m", "14b", "transformer", "entrainement", "entraînement"]
    },
    {
        id: "pantheon", icon: "account_balance",
        title: "Le Panthéon",
        category: "IA", context: "Personnel", period: "En cours", featured: true,
        desc: "Interface de discussion avec des modèles d'IA locaux, conçue pour remplacer Open WebUI, sur le thème de la mythologie grecque : chaque modèle est une divinité du Panthéon.",
        role: "Développeur Fullstack : conception de l'interface (conversations, choix du modèle, réponses en streaming) et d'un backend qui relaie les requêtes vers les modèles servis en local.",
        livrables: [{ nom: "Dépôt GitHub", private: true }],
        tech: ["TypeScript", "SvelteKit", "Python", "FastAPI", "Ollama", "Docker"],
        keywords: ["pantheon", "panthéon", "openwebui", "open webui", "mythologie", "grec", "grecque", "interface", "chat", "ollama", "svelte", "sveltekit", "fastapi"]
    },
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
    },
    {
        id: "enough-items", icon: "deployed_code",
        title: "Enough Items",
        category: "Réaliser", context: "Personnel", period: "2026",
        desc: "Mod natif pour le jeu Horizon qui affiche tous les items dans un panneau à côté de l'inventaire, avec leurs recettes : recherche par nom, mod ou tag, navigation d'ingrédient en ingrédient et remplissage automatique de la grille de craft.",
        role: "Développeur : logique du mod en Rust injectée dans le jeu par mixins (indexation des recettes à chaque tick, gestion du panneau), et script Python d'empaquetage et d'installation.",
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/jei-like` }],
        tech: ["Rust", "Python"],
        keywords: ["enough items", "jei", "jei-like", "mod", "horizon", "rust", "recette", "craft", "minecraft", "jeu"]
    },
    {
        id: "bastideayeb", icon: "style",
        title: "BastideAyebApp",
        category: "Mobile", context: "Académique",
        desc: "Application multiplateforme en .NET MAUI réalisée en binôme avec Mostapha Ayeb : un carrousel de cartes à jouer chargées depuis une API, et des pages de navigation.",
        role: "Développeur : pages XAML et navigation Shell, modèles C# des cartes et appels à l'API, en collaboration avec Mostapha Ayeb.",
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/BastideAyebApp` }],
        tech: ["C#", ".NET MAUI", "XAML"],
        keywords: ["maui", ".net", "dotnet", "c#", "csharp", "xaml", "mobile", "carte", "ayeb", "bastideayeb"]
    },
    {
        id: "taskflow", icon: "task_alt",
        title: "TaskFlow",
        category: "Mobile", context: "Académique",
        desc: "Application Android de liste de tâches gamifiée : créer et modifier ses tâches, gagner des FlowCoins en les terminant et les dépenser dans une boutique d'animations.",
        role: "Développeur Android : écrans en Jetpack Compose (liste, création, édition, boutique), navigation et sauvegarde des données en Kotlin.",
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/TaskFlow` }],
        tech: ["Kotlin", "Jetpack Compose", "Android"],
        keywords: ["taskflow", "todo", "to-do", "tache", "tâche", "kotlin", "android", "compose", "mobile"]
    },
    {
        id: "reseau", icon: "lan",
        title: "Réseau d'entreprise sous Kathará",
        category: "Réseau", context: "Académique",
        desc: "Mise en place d'un réseau complet émulé avec Kathará : plusieurs sous-réseaux, routeurs, serveurs (web, fichiers, administration) et postes clients, lancés en une commande.",
        role: "Administrateur réseau : plan d'adressage, configuration des routeurs et des machines par scripts de démarrage, et tests de connectivité.",
        livrables: [{ nom: "Dépôt GitHub", url: `${GITHUB}/Reseau` }],
        tech: ["Kathará", "Linux", "Réseau"],
        keywords: ["reseau", "réseau", "kathara", "kathará", "routeur", "routage", "linux", "sous-reseau", "adressage", "infrastructure"]
    }
];

export function getCategories() {
    return [...new Set(projects.map(p => p.category))];
}

export function getContexts() {
    return [...new Set(projects.map(p => p.context))];
}

// Technologies des projets, de la plus utilisée à la moins utilisée.
export function getTechCounts() {
    const counts = new Map();
    projects.forEach(p => p.tech.forEach(t => counts.set(t, (counts.get(t) || 0) + 1)));
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr'));
}
