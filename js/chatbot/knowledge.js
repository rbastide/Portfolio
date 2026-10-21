// ============================================
// CHATBOT — Base de connaissances
// ============================================
// Les réponses sur le profil et les projets sont générées depuis les données :
// ajouter un projet dans data/projects.js suffit pour que le chatbot le connaisse.
//
// Mise en forme des réponses (interprétée par formatAnswer dans chatbot.js) :
//   ligne vide     → nouveau paragraphe
//   « - » en début → élément de liste
//   **texte**      → gras
import { getLevelInfo } from '../data/profile.js';

const listFr = items => items.length <= 1
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;

const bullets = items => items.map(i => `- ${i}`).join('\n');

function profileTopics(profile, projects) {
    const { email, github, linkedin } = profile.contact;
    const gh = github.replace('https://', '');
    const li = linkedin.replace('https://www.', '');

    return {
        profil: {
            keys: ['qui', 'rémi', 'remi', 'profil', 'présent', 'present', 'parcours', 'formation', 'étud', 'etud', 'but', 'informatique', 'toi', 'about', 'à propos', 'a propos', 'whoami', 'c\'est qui'],
            answers: [
                `Rémi Bastide est en **${profile.year}**.

Il développe des applications web complètes : base de données, API, interface, puis déploiement avec Docker. Il a déjà **${projects.length} projets** à son actif, dont deux utilisés au Grand Périgueux.

Sa prochaine étape : un **master en Intelligence Artificielle** en alternance.

Vous voulez que je vous présente ses projets ?`
            ]
        },
        contact: {
            keys: ['contact', 'mail', 'email', 'joindre', 'écrire', 'ecrire', 'linkedin', 'github', 'téléphone', 'telephone', 'adresse'],
            answers: [
                `Vous pouvez joindre Rémi ici :

${bullets([`**E-mail** : ${email}`, `**GitHub** : ${gh}`, `**LinkedIn** : ${li}`])}

L'e-mail reste le moyen le plus direct.`
            ]
        },
        tech: {
            keys: ['technologie', 'langage', 'outil', 'tech', 'stack', 'framework'],
            answers: [
                `Voici la stack de Rémi, par catégorie :

${bullets(profile.about.stack.map(s => `**${s.group}** : ${s.items.join(', ')}`))}

Ses projets les plus complets combinent React ou Vue.js, une API (NestJS, Laravel ou SpringBoot) et Docker.

Dans la section Stack, cliquez sur une techno pour voir les projets qui l'utilisent.`
            ]
        },
        ia: {
            keys: ['ia', 'ai', 'intelligence artificielle', 'master', 'orientation', 'objectif', 'avenir', 'projet pro', 'machine learning'],
            answers: [
                `L'objectif de Rémi, c'est l'**Intelligence Artificielle**.

Il recherche **${profile.lookingFor}**. Son idée : une IA utile en entreprise a besoin de données propres, d'API fiables et d'un déploiement maîtrisé, et c'est déjà ce qu'il sait faire.

Une opportunité à proposer ? Écrivez-lui à ${email}.`
            ]
        },
        savoirEtre: {
            keys: ['savoir-etre', 'savoir etre', 'soft skill', 'qualite', 'qualité', 'personnalite', 'personnalité'],
            answers: [
                `Côté savoir-être, Rémi met en avant :

${bullets(profile.about.softSkills)}`
            ]
        },
        alternance: {
            keys: ['alternance', 'stage', 'recherche', 'disponib', 'recrut', 'embauche', 'travail', 'poste', 'candidat', 'cv', 'hiring', 'hire'],
            answers: [
                `Oui ! Rémi est **disponible** et recherche **${profile.lookingFor}**.

Pour lui proposer un poste :

${bullets([`par e-mail : ${email}`, 'ou depuis la section Contact, en bas de la page'])}`
            ]
        }
    };
}

function competenceTopics(competences) {
    const topics = {
        competences: {
            keys: ['compétence', 'competence', 'skill', 'sait faire', 'capable', 'niveau', 'maîtrise', 'maitrise', 'expertise', 'fort'],
            answers: [
                `Rémi valide les **${competences.length} compétences du BUT Informatique** :

${bullets(competences.map(c => `**${c.title}** : ${c.description.charAt(0).toLowerCase()}${c.description.slice(1, -1)} (niveau ${c.level}, ${getLevelInfo(c.level).label.toLowerCase()})`))}

Demandez-moi le détail d'une compétence, par exemple « Administrer ».`
            ]
        }
    };

    const extraKeys = {
        1: ['coder', 'développ', 'developp', 'programm', 'code', 'logiciel'],
        2: ['optimi', 'algo', 'performance', 'complexité', 'complexite', 'structure de données'],
        3: ['administr', 'système', 'systeme', 'linux', 'serveur', 'ssh', 'bash', 'pare-feu', 'firewall', 'routage'],
        4: ['base de données', 'base de donnees', 'sql', 'bdd', 'sgbd', 'donnée', 'donnee', 'business intelligence'],
        5: ['agile', 'scrum', 'sprint', 'jira', 'trello', 'planif'],
        6: ['collabor', 'équipe', 'equipe', 'communic', 'anglais', 'oral', 'écoute', 'ecoute']
    };

    competences.forEach(c => {
        topics[`comp-${c.id}`] = {
            keys: [c.title.toLowerCase(), ...(extraKeys[c.id] || [])],
            answers: [
                `**${c.title}** : niveau ${c.level}, ${getLevelInfo(c.level).label.toLowerCase()}.

${c.description}

- **Ce qu'il a appris** : ${c.reflexion.savoirs}
- **Ce qui a été difficile** : ${c.reflexion.difficultes}`
            ]
        };
    });

    return topics;
}

function projectTopics(projects) {
    const topics = {
        projets: {
            keys: ['projet', 'réalisation', 'realisation', 'travaux', 'portfolio', 'fait quoi', 'créé', 'cree', 'construit'],
            answers: [
                `Rémi a réalisé **${projects.length} projets** :

${bullets(projects.map(p => `**${p.title}** (${p.context}) : ${p.tech.slice(0, 3).join(', ')}`))}

Demandez-moi le détail de l'un d'eux, par exemple « Parle-moi d'Overloady ».`
            ]
        },
        recents: {
            keys: ['récent', 'recent', 'dernier', 'nouveau', 'actuel', 'en ce moment'],
            answers: [
                `Ses projets les plus récents :

${bullets(projects.filter(p => p.featured).map(p => `**${p.title}**${p.period ? ` (${p.period})` : ''}`))}

Ils sont en tête de la section Projets.`
            ]
        },
    };

    projects.forEach(p => {
        const first = p.livrables[0];
        const link = !first ? '' : first.private
            ? '\n\nLe dépôt GitHub sera bientôt public.'
            : `\n\nLe code est ici : ${first.url}`;
        topics[`projet-${p.id}`] = {
            // Bonus de score : un projet nommé explicitement doit l'emporter sur les thèmes génériques.
            weight: 2,
            keys: [p.title.toLowerCase(), ...(p.keywords || [])],
            answers: [
                `**${p.title}**, ${p.context.toLowerCase() === 'personnel' ? 'un projet personnel' : `un projet ${p.context === 'Académique' ? 'académique' : `pour le ${p.context}`}`}${p.period ? ` (${p.period})` : ''}.

${p.desc}

**Son rôle** : ${p.role}

**Technologies** : ${p.tech.join(', ')}.${link}`
            ]
        };
    });

    return topics;
}

const smallTalk = {
    bonjour: {
        keys: ['bonjour', 'salut', 'hello', 'hey', 'coucou', 'yo', 'bonsoir', 'wesh', 'slt', 'bjr'],
        answers: [
            `Bonjour ! Je suis ReyMysterio, l'assistant du portfolio de Rémi.

Je peux vous parler de :

- ses **projets**
- sa **stack technique**
- ses **compétences**
- sa **recherche d'alternance**

Par quoi voulez-vous commencer ?`
        ]
    },
    merci: {
        keys: ['merci', 'thanks', 'thx', 'cool', 'super', 'parfait', 'genial', 'génial', 'top'],
        answers: [
            "Avec plaisir ! Autre chose que vous voulez savoir sur Rémi ?",
            "De rien ! Si son profil vous intéresse, la section Contact est en bas de la page."
        ]
    },
    aide: {
        keys: ['aide', 'help', 'quoi demander', 'tu fais quoi', 'tu sers à quoi', 'comment', 'fonctionn'],
        answers: [
            `Je réponds aux questions sur Rémi. Quelques exemples :

- « Quels sont ses projets ? »
- « Parle-moi d'Overloady »
- « Quelle est sa stack technique ? »
- « Est-ce qu'il cherche une alternance ? »

Je fonctionne avec des mots-clés, donc les questions courtes marchent le mieux.`
        ]
    }
};

export const fallbacks = [
    `Je n'ai pas bien compris, désolé.

Je connais surtout le parcours, les projets et les compétences de Rémi. Essayez par exemple « Quels sont ses projets ? ».`,
    `Ça sort un peu de ce que je connais.

Posez-moi plutôt une question sur Rémi : sa stack, ses projets ou sa recherche d'alternance.`
];

export function buildKnowledgeBase({ profile, competences, projects }) {
    return {
        ...profileTopics(profile, projects),
        ...competenceTopics(competences),
        ...projectTopics(projects),
        ...smallTalk
    };
}
