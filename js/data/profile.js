// ============================================
// PROFIL — informations personnelles
// ============================================
export const profile = {
    name: "Bastide Rémi",
    handle: "rbastide",
    role: "Développeur fullstack // En route vers l'IA",
    year: "3ème année de BUT Informatique",
    bio: "Étudiant en 3ème année de BUT Informatique, je développe des applications web complètes, du back-end au déploiement. Je cherche une <strong>alternance en master Intelligence Artificielle</strong> pour mettre ces bases au service de projets IA.",
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
            "Je suis Rémi, étudiant en 3ème année de BUT Informatique. Je développe des applications de bout en bout : conception de la base de données, API, interface, puis déploiement avec Docker sur des serveurs Linux.",
            "Au fil de mes projets, académiques comme personnels, j'ai travaillé sur des applications web fullstack (React, Vue.js, NestJS, SpringBoot), des outils utilisés en conditions réelles pour le Grand Périgueux, et des infrastructures Linux sécurisées.",
            "Mon objectif est maintenant l'Intelligence Artificielle. Je recherche une alternance pour intégrer un master en IA : une IA utile en entreprise a besoin de données propres, d'API fiables et d'un déploiement maîtrisé, et c'est ce que je sais déjà faire."
        ],
        facts: [
            { key: "formation", value: "BUT Informatique — 3ème année" },
            { key: "profil", value: "Développeur fullstack, bases en admin système" },
            { key: "objectif", value: "M'orienter vers l'Intelligence Artificielle" },
            { key: "recherche", value: "Alternance — master en IA" },
            { key: "expérience", value: "Projets pour le Grand Périgueux (2026)" }
        ],
        stack: [
            { group: "Langages", items: ["Java", "JavaScript", "TypeScript", "Python", "PHP", "SQL", "Bash", "Kotlin"] },
            { group: "Front-end", items: ["React", "React Native (Expo)", "Vue.js", "Pinia", "Inertia.js", "Tailwind CSS", "Vite", "JavaFX", "HTML / CSS"] },
            { group: "Back-end", items: ["NestJS", "Laravel", "Node.js / Express", "SpringBoot", "Spring Security", "Spring Data JPA", "Flask", "Prisma", "OR-Tools", ".NET MAUI"] },
            { group: "Bases de données", items: ["PostgreSQL", "MySQL", "MariaDB"] },
            { group: "Système & DevOps", items: ["Linux", "Docker", "Docker Compose", "Git", "SSH", "iptables", "Maven", "Gradle"] },
            { group: "Tests & qualité", items: ["Jest", "JUnit", "PHPUnit", "ESLint", "Prettier"] },
            { group: "Méthodes", items: ["Scrum", "Jira", "Trello"] }
        ],
        softSkills: ["Travail en équipe", "Communication écrite & orale", "Écoute active", "Anglais technique"]
    }
};

export const levelDefinitions = {
    1: { label: "Basique", color: "level-1" },
    2: { label: "Acquis", color: "level-2" },
    3: { label: "Maîtrisé", color: "level-3" }
};

export function getLevelInfo(n) {
    return levelDefinitions[n] || { label: "—", color: "" };
}
