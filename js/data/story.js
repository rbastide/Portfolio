// ============================================
// PARCOURS — scènes du scrollytelling (views/story.js)
// ============================================
// Une scène par étape, dans l'ordre du scroll. `position` place le texte à
// l'écran (bottom-left, bottom-right, center-left, center-right, bottom-center,
// hero) ;
// le réseau animé se décale du côté opposé pour lui laisser la place.
// `intro: true` : scène d'ouverture, avant que le réseau ne se forme.
// `hero: true` : la scène affiche l'accueil complet (présentation + assistant).
// `tags` : technos affichées sous le texte ; `project` : id d'un projet
// (data/projects.js) vers lequel la scène renvoie.
export const story = [
    {
        // Scène d'accueil : présentation et assistant (views/hero.js).
        kicker: `Portfolio · ${new Date().getFullYear()}`,
        position: 'hero',
        intro: true,
        hero: true
    },
    {
        kicker: 'Les bases',
        position: 'bottom-left',
        title: 'Comprendre avant de construire',
        text: "Bac général avec les spécialités NSI et mathématiques, puis BUT Informatique à l'IUT de Limoges, parcours Réalisation d'applications. Trois ans d'algorithmique, de bases de données, de réseaux et de gestion de projet en équipe, avec un projet à livrer à chaque semestre.",
        tags: ['Java', 'Python', 'SQL', 'Algorithmique', 'Scrum'],
        project: 'erp'
    },
    {
        kicker: 'Fullstack',
        position: 'center-right',
        title: "Chaque couche d'une application",
        text: "L'interface en React ou Vue.js, l'API en NestJS, SpringBoot ou Laravel, les données en PostgreSQL ou MySQL. Je conçois les trois couches et je les fais tenir ensemble : authentification JWT, accès aux données avec Prisma, TypeScript de l'interface jusqu'à l'API.",
        tags: ['React', 'Vue.js', 'TypeScript', 'NestJS', 'SpringBoot', 'PostgreSQL'],
        project: 'overloady'
    },
    {
        kicker: 'Déploiement',
        position: 'bottom-left',
        title: "Jusqu'au serveur",
        text: "Docker, Kubernetes, CI/CD, Linux : je mets en ligne ce que je développe, j'automatise les déploiements et je sécurise les machines qui le font tourner. Overloady et Unilim EDT tournent dans des conteneurs Docker, base de données comprise.",
        tags: ['Docker', 'Docker Compose', 'Kubernetes', 'CI/CD', 'Linux', 'SSH'],
        project: 'unilim-edt'
    },
    {
        kicker: 'Conditions réelles',
        position: 'bottom-right',
        title: 'Au Grand Périgueux, depuis 2026',
        text: "Stage de développeur d'avril à juin 2026, puis alternance. Pour cette collectivité de 500 agents, j'ai livré l'écran des prochains départs train et bus, affiché à l'accueil à la place de l'ancien affichage, et le portail des applications internes. Aujourd'hui, je développe l'intranet en WordPress, une application sensible que je sécurise, et j'encadre le projet d'outil de gestion des plannings des chauffeurs de bus.",
        tags: ['Node.js', 'Express', 'API SNCF Navitia', 'MySQL', 'WordPress'],
        project: 'horaires'
    },
    {
        kicker: 'Prochaine étape',
        position: 'bottom-center',
        title: "Mettre ces bases au service de l'IA",
        text: "J'ai déjà commencé : ReyMysterio, l'assistant de ce portfolio, répond grâce à un LLM appelé par API, et je crée un LLM orienté musculation pour Overloady. Je me forme au deep learning et au fonctionnement des réseaux de neurones, et je développe au quotidien avec l'IA. Prochaine étape : une alternance en master Intelligence Artificielle.",
        tags: ['LLM', 'API IA', 'Réseaux de neurones', 'Deep learning', 'Python'],
        ctas: [
            { href: '#projects', label: 'Voir les projets', icon: 'rocket_launch', cls: 'btn-primary' },
            { href: '#contact', label: 'Me contacter', icon: 'alternate_email', cls: 'btn-tonal' }
        ]
    }
];
