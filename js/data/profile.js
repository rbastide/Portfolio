// ============================================
// PROFIL — informations personnelles
// ============================================
export const profile = {
    name: "Bastide Rémi",
    handle: "rbastide",
    role: "Développeur Junior // Administrateur Système",
    year: "3ème année de BUT Informatique",
    bio: "Étudiant en 3ème année de BUT Informatique. Je conçois des solutions logicielles robustes et sécurisées, en alliant rigueur technique et créativité.",
    yearsOfExperience: 2,
    level: "N2",
    lookingFor: "une alternance pour un master en Intelligence Artificielle",
    contact: {
        email: "remi.bastide29@gmail.com",
        github: "https://github.com/rbastide",
        linkedin: "https://www.linkedin.com/in/bremi/"
    },
    about: {
        paragraphs: [
            "Je suis Rémi, étudiant en 3ème année de BUT Informatique. Mon profil se situe entre le développement logiciel et l'administration système : j'aime autant concevoir une API ou une interface que configurer un réseau ou automatiser un déploiement.",
            "Au fil de mes projets, académiques comme personnels, j'ai travaillé sur des applications web fullstack (React, Vue.js, NestJS, SpringBoot), des outils utilisés en conditions réelles pour le Grand Périgueux, et des infrastructures Linux sécurisées.",
            "Je souhaite désormais m'orienter vers l'Intelligence Artificielle, et je recherche actuellement une alternance pour intégrer un master en IA, afin de mettre mes bases en développement et en données au service de ce domaine."
        ],
        facts: [
            { key: "formation", value: "BUT Informatique — 3ème année" },
            { key: "profil", value: "Développeur fullstack & admin système" },
            { key: "objectif", value: "M'orienter vers l'Intelligence Artificielle" },
            { key: "recherche", value: "Alternance — master en IA" },
            { key: "expérience", value: "Projets pour le Grand Périgueux (2026)" }
        ],
        stack: [
            { group: "Langages", items: ["Java", "JavaScript", "TypeScript", "Python", "SQL", "Bash", "Kotlin"] },
            { group: "Front-end", items: ["React", "Vue.js", "JavaFX", "HTML / CSS"] },
            { group: "Back-end", items: ["NestJS", "Node.js / Express", "SpringBoot", "Prisma", ".NET MAUI"] },
            { group: "Bases de données", items: ["PostgreSQL", "MySQL"] },
            { group: "Système & DevOps", items: ["Linux", "Docker", "Git", "SSH", "iptables"] },
            { group: "Méthodes", items: ["Scrum", "Jira", "Trello"] }
        ],
        softSkills: ["Travail en équipe", "Communication écrite & orale", "Écoute active", "Anglais technique"]
    }
};

export const levelDefinitions = {
    1: { label: "Basique", color: "level-1" },
    2: { label: "Acquis", color: "level-2" },
    3: { label: "Maîtrisé", color: "level-3" },
    4: { label: "Expert", color: "level-4" }
};

export function getLevelInfo(n) {
    return levelDefinitions[n] || { label: "—", color: "" };
}
