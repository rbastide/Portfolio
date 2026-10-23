// ============================================
// POINT D'ENTRÉE
// ============================================
//   data/         contenu du portfolio (profil, compétences, projets)
//   views/        génération du HTML de chaque section
//   controllers/  comportements (navigation, filtres, apparitions, réseau de neurones, curseur...)
//   chatbot/      assistant local ReyMysterio
import { profile } from './data/profile.js';
import { competences } from './data/competences.js';
import { projects } from './data/projects.js';

import { heroHTML } from './views/hero.js';
import { aboutHTML } from './views/about.js';
import { skillsHTML } from './views/skills.js';
import { projectsHTML } from './views/projects.js';
import { contactHTML } from './views/contact.js';

import { initNavigation } from './controllers/navigation.js';
import { initBackdrop } from './controllers/backdrop.js';
import { initNeuralNetwork } from './controllers/neural.js';
import { initNeuralCursor } from './controllers/cursor.js';
import { initReveal, initSkillDetails, initProjectFilters } from './controllers/interactions.js';
import { Chatbot } from './chatbot/chatbot.js';
import { initChatDock } from './chatbot/dock.js';

const data = { profile, competences, projects };

function render() {
    document.getElementById('app').innerHTML = [
        heroHTML, projectsHTML, skillsHTML, aboutHTML, contactHTML
    ].map(view => view(data)).join('');
}

async function init() {
    render();
    // Le panneau du chatbot fait partie de l'accueil : il s'initialise après le rendu,
    // puis le dock le rend accessible depuis n'importe quelle section.
    const chatbot = new Chatbot(data);
    chatbot.init();
    initChatDock(chatbot);
    initBackdrop();
    initNeuralNetwork();
    initNeuralCursor();
    initReveal();
    initSkillDetails();
    initProjectFilters();
    initNavigation();
}

init();
