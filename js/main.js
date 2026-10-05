// ============================================
// POINT D'ENTRÉE
// ============================================
//   data/         contenu du portfolio (profil, compétences, projets)
//   views/        génération du HTML de chaque section
//   controllers/  comportements (boot, navigation, filtres, formulaire...)
//   chatbot/      assistant local ReyMysterio
import { profile } from './data/profile.js';
import { competences } from './data/competences.js';
import { projects } from './data/projects.js';

import { heroHTML } from './views/hero.js';
import { skillsHTML } from './views/skills.js';
import { projectsHTML } from './views/projects.js';
import { contactHTML } from './views/contact.js';

import { runBootSequence } from './controllers/boot.js';
import { initNavigation } from './controllers/navigation.js';
import { initReveal, initSkillDetails, initProjectFilters, initContactForm } from './controllers/interactions.js';
import { Chatbot } from './chatbot/chatbot.js';

const data = { profile, competences, projects };

function render() {
    document.getElementById('app').innerHTML = [
        heroHTML, skillsHTML, projectsHTML, contactHTML
    ].map(view => view(data)).join('');
}

async function init() {
    new Chatbot(data).init();
    await runBootSequence();
    render();
    initReveal();
    initSkillDetails();
    initProjectFilters();
    initContactForm();
    initNavigation();
}

init();
