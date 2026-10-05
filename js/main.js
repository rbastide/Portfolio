// ============================================
// POINT D'ENTRÉE
// ============================================
//   data/         contenu du portfolio (profil, compétences, projets)
//   views/        génération du HTML de chaque section
//   controllers/  comportements (boot, navigation, filtres, console...)
//   chatbot/      assistant local ReyMysterio
import { profile } from './data/profile.js';
import { competences } from './data/competences.js';
import { projects } from './data/projects.js';

import { heroHTML } from './views/hero.js';
import { aboutHTML } from './views/about.js';
import { skillsHTML } from './views/skills.js';
import { projectsHTML } from './views/projects.js';
import { contactHTML } from './views/contact.js';

import { runBootSequence } from './controllers/boot.js';
import { initNavigation } from './controllers/navigation.js';
import { initReveal, initSkillDetails, initProjectFilters, initConsole } from './controllers/interactions.js';
import { Chatbot } from './chatbot/chatbot.js';

const data = { profile, competences, projects };

function render() {
    document.getElementById('app').innerHTML = [
        heroHTML, aboutHTML, projectsHTML, skillsHTML, contactHTML
    ].map(view => view(data)).join('');
}

async function init() {
    await runBootSequence();
    render();
    // Le panneau du chatbot fait partie de l'accueil : il s'initialise après le rendu.
    new Chatbot(data).init();
    initReveal();
    initSkillDetails();
    initProjectFilters();
    initConsole();
    initNavigation();
}

init();
