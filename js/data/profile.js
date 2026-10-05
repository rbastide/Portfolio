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
    lookingFor: "une alternance ou un stage",
    contact: {
        email: "remi.bastide29@gmail.com",
        github: "https://github.com/rbastide",
        linkedin: "https://www.linkedin.com/in/bremi/"
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
