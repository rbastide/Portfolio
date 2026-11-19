// ============================================
// PARCOURS — scènes du scrollytelling (views/story.js)
// ============================================
// Une scène par étape, dans l'ordre du scroll. `position` place le texte à
// l'écran (bottom-left, bottom-right, center-left, center-right, bottom-center) ;
// le réseau animé se décale du côté opposé pour lui laisser la place.
// `intro: true` : scène d'ouverture, avant que le réseau ne se forme.
export const story = [
    {
        kicker: 'Présentation',
        position: 'bottom-center',
        intro: true,
        title: 'Rémi Bastide',
        text: 'Développeur fullstack en 3ème année de BUT Informatique, <span class="gradient-text">en route vers l\'IA</span>.'
    },
    {
        kicker: 'Les bases',
        position: 'bottom-left',
        title: 'Comprendre avant de construire',
        text: "Trois ans de BUT Informatique : algorithmique, bases de données, réseaux et gestion de projet en équipe."
    },
    {
        kicker: 'Fullstack',
        position: 'center-right',
        title: "Chaque couche d'une application",
        text: "L'interface en React ou Vue.js, l'API en NestJS ou SpringBoot, les données en PostgreSQL ou MySQL. Je conçois les trois et je les fais tenir ensemble."
    },
    {
        kicker: 'Déploiement',
        position: 'bottom-left',
        title: "Jusqu'au serveur",
        text: "Docker, Linux, SSH, iptables : je mets en ligne ce que je développe et je sécurise les machines qui le font tourner."
    },
    {
        kicker: 'Conditions réelles',
        position: 'bottom-right',
        title: 'Au Grand Périgueux, en 2026',
        text: "D'avril à juin, j'ai livré l'écran des prochains départs train et bus et le portail des applications internes de la collectivité."
    },
    {
        kicker: 'Prochaine étape',
        position: 'bottom-center',
        title: "Mettre ces bases au service de l'IA",
        text: "Je cherche une alternance en master Intelligence Artificielle. Une IA utile a besoin de données propres, d'API fiables et d'un déploiement maîtrisé : c'est déjà mon terrain.",
        ctas: [
            { href: '#projects', label: 'Voir les projets', icon: 'rocket_launch', cls: 'btn-primary' },
            { href: '#contact', label: 'Me contacter', icon: 'alternate_email', cls: 'btn-tonal' }
        ]
    }
];
