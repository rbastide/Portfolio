// ============================================
// CHATBOT — Base de connaissances
// ============================================
// Les réponses sur le profil et les projets sont générées depuis les données :
// ajouter un projet dans data/projects.js suffit pour que le chatbot le connaisse.
import { getLevelInfo } from '../data/profile.js';

const listFr = items => items.length <= 1
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;

function profileTopics(profile, projects) {
    const { email, github, linkedin } = profile.contact;
    const gh = github.replace('https://', '');
    const li = linkedin.replace('https://www.', '');

    return {
        profil: {
            keys: ['qui', 'rémi', 'remi', 'profil', 'présent', 'present', 'parcours', 'formation', 'étud', 'etud', 'but', 'informatique', 'toi', 'about', 'à propos', 'a propos', 'whoami', 'c\'est qui'],
            answers: [                `Rémi Bastide est étudiant en ${profile.year}. Il est Développeur Junior & Administrateur Système. Il conçoit des solutions logicielles robustes et sécurisées, en alliant rigueur technique et créativité.`,
                `Bastide Rémi — ${profile.year}. Développeur Junior et Admin Système, il a déjà ${projects.length} projets à son actif et ${profile.yearsOfExperience} ans d'expérience dans le domaine.`,
            ]
        },
        contact: {
            keys: ['contact', 'mail', 'email', 'joindre', 'écrire', 'ecrire', 'linkedin', 'github', 'téléphone', 'telephone', 'adresse'],
            answers: [
                `Vous pouvez contacter Rémi par email : ${email}. Il est aussi sur GitHub (${gh}) et LinkedIn (${li}).`,
                `Pour joindre Rémi → email : ${email} | GitHub : ${gh} | LinkedIn : ${li}. N'hésitez pas, il est très réactif !`,
            ]
        },
        tech: {
            keys: ['technologie', 'langage', 'outil', 'tech', 'stack', 'framework'],
            answers: [
                `Côté technique, Rémi travaille avec : ${profile.about.stack.map(s => `${s.group.toLowerCase()} (${s.items.join(', ')})`).join(' ; ')}. Un profil polyvalent entre dev et admin système !`,
            ]
        },
        ia: {
            keys: ['ia', 'ai', 'intelligence artificielle', 'master', 'orientation', 'objectif', 'avenir', 'projet pro', 'machine learning'],
            answers: [
                `Rémi souhaite s'orienter vers l'Intelligence Artificielle. Il recherche actuellement ${profile.lookingFor} : contactez-le à ${email} si vous avez une opportunité !`,
            ]
        },
        savoirEtre: {
            keys: ['savoir-etre', 'savoir etre', 'soft skill', 'qualite', 'qualité', 'personnalite', 'personnalité'],
            answers: [
                `Côté savoir-être, Rémi met en avant : ${listFr(profile.about.softSkills.map(s => s.toLowerCase()))}.`,
            ]
        },
        alternance: {
            keys: ['alternance', 'stage', 'recherche', 'disponib', 'recrut', 'embauche', 'travail', 'poste', 'candidat', 'cv', 'hiring', 'hire'],
            answers: [
                `Rémi est actuellement à la recherche d'${profile.lookingFor} ! Si son profil vous intéresse, contactez-le à ${email}.`,
                `Bonne nouvelle, Rémi cherche ${profile.lookingFor} en ce moment. Vous pouvez le contacter via le formulaire en bas de page ou par email : ${email}.`,
            ]
        }
    };
}

function competenceTopics(competences) {
    const summary = competences
        .map(c => `${c.title} (${getLevelInfo(c.level).label})`);

    const topics = {
        competences: {
            keys: ['compétence', 'competence', 'skill', 'sait faire', 'capable', 'niveau', 'maîtrise', 'maitrise', 'expertise', 'fort'],
            answers: [
                `Rémi a ${competences.length} compétences clés du BUT Informatique : ${listFr(summary)}. Ses points forts sont le développement, la gestion de projet et la collaboration.`,
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
        const info = getLevelInfo(c.level);
        topics[`comp-${c.id}`] = {
            keys: [c.title.toLowerCase(), ...(extraKeys[c.id] || [])],
            answers: [
                `La compétence '${c.title}' est au niveau ${info.label} (${c.level}/4) : ${c.description.toLowerCase()} ${c.reflexion.savoirs}`,
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
                `Rémi a réalisé ${projects.length} projets : ${listFr(projects.map(p => p.tech.length ? `${p.title} (${p.tech.slice(0, 3).join('/')})` : p.title))}. Vous pouvez les explorer dans la section Projets !`,
            ]
        },
        recents: {
            keys: ['récent', 'recent', 'dernier', 'nouveau', 'actuel', 'en ce moment'],
            answers: [
                `Ses projets les plus récents : ${listFr(projects.filter(p => p.featured).map(p => p.title))}. Ils sont mis en avant en tête de la section Projets.`,
            ]
        },
    };

    projects.forEach(p => {
        const link = p.livrables[0] ? ` Lien : ${p.livrables[0].url}` : '';
        topics[`projet-${p.id}`] = {
            // Bonus de score : un projet nommé explicitement doit l'emporter sur les thèmes génériques.
            weight: 2,
            keys: [p.title.toLowerCase(), ...(p.keywords || [])],
            answers: [`${p.title} — ${p.desc} ${p.role}${link}`]
        };
    });

    return topics;
}

const smallTalk = {
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
            "Je peux répondre à vos questions sur Rémi ! Par exemple : ses compétences, ses projets (Overloady, Horaires Train & Bus...), ses technologies, comment le contacter, s'il cherche un stage/alternance... Demandez-moi ce qui vous intéresse !",
        ]
    }
};

export const fallbacks = [
    "Hmm, je ne suis pas sûr de comprendre. Essayez de me demander quelque chose sur les compétences, projets ou le parcours de Rémi !",
    "Je suis spécialisé sur le profil de Rémi. Essayez : 'Quelles sont ses compétences ?' ou 'Parle-moi de ses projets'.",
    "Bonne question, mais ça sort un peu de mon domaine. Je connais surtout le parcours, les compétences et les projets de Rémi. Tentez autre chose !",
    "Je n'ai pas la réponse à ça, mais demandez-moi des infos sur Rémi et je serai incollable !",
];

export function buildKnowledgeBase({ profile, competences, projects }) {
    return {
        ...profileTopics(profile, projects),
        ...competenceTopics(competences),
        ...projectTopics(projects),
        ...smallTalk
    };
}
