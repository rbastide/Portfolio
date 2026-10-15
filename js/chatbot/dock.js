// ============================================
// CHATBOT — Accès depuis toute la page
// ============================================
// Le panneau vit dans l'accueil. Dès qu'il sort de l'écran, un lanceur flottant
// apparaît : l'ouvrir déplace ce même panneau (et donc la conversation en cours)
// dans une fenêtre flottante ; la fermer le remet à sa place dans l'accueil.
import { BOT_NAME } from './chatbot.js';
import { prefersReducedMotion } from '../utils/dom.js';

// Durée de la transition de fermeture de .chat-dock (chatbot.css).
const CLOSE_DURATION = 450;

const hasFinePointer = () => window.matchMedia('(pointer: fine)').matches;

export function initChatDock(chatbot) {
    const panel = document.getElementById('chatbot');
    const home = document.getElementById('chatbot-home');
    const placeholder = document.getElementById('chatbot-placeholder');
    const closeBtn = document.getElementById('chatbot-dock-close');
    if (!panel || !home) return;

    document.body.insertAdjacentHTML('beforeend', `
    <button type="button" class="chat-launcher" id="chat-launcher" aria-controls="chat-dock" aria-expanded="false" aria-label="Ouvrir l'assistant ${BOT_NAME}">
        <span class="chat-launcher-avatar" aria-hidden="true"><span class="icon">neurology</span></span>
        <span class="chat-launcher-label" aria-hidden="true"><span class="chat-launcher-verb">Demander à </span>${BOT_NAME}</span>
    </button>
    <div class="chat-scrim" id="chat-scrim" aria-hidden="true"></div>
    <div class="chat-dock" id="chat-dock" role="dialog" aria-label="Assistant ${BOT_NAME}"></div>`);

    const launcher = document.getElementById('chat-launcher');
    const scrim = document.getElementById('chat-scrim');
    const dock = document.getElementById('chat-dock');

    let open = false;
    let homeVisible = true;
    let closeTimer = null;

    const syncLauncher = () => launcher.classList.toggle('is-visible', !open && !homeVisible);

    // La place du panneau est gardée dans l'accueil pour éviter un saut de mise en page.
    function moveToDock() {
        clearTimeout(closeTimer);
        if (panel.parentElement === dock) return;
        placeholder.style.height = `${panel.offsetHeight}px`;
        placeholder.hidden = false;
        dock.appendChild(panel);
        closeBtn.hidden = false;
    }

    function moveHome() {
        home.appendChild(panel);
        placeholder.hidden = true;
        placeholder.style.height = '';
        closeBtn.hidden = true;
        chatbot.scrollToBottom();
    }

    function setOpen(value) {
        open = value;
        dock.classList.toggle('is-open', value);
        scrim.classList.toggle('is-open', value);
        document.documentElement.classList.toggle('chat-dock-open', value);
        launcher.setAttribute('aria-expanded', String(value));
        syncLauncher();
    }

    function openDock() {
        if (open) return;
        moveToDock();
        setOpen(true);
        chatbot.scrollToBottom();
        // Sur écran tactile, focaliser le champ ouvrirait le clavier par-dessus la conversation.
        (hasFinePointer() ? chatbot.input : closeBtn).focus({ preventScroll: true });
    }

    function closeDock() {
        if (!open) return;
        setOpen(false);
        if (!homeVisible) launcher.focus({ preventScroll: true });

        closeTimer = setTimeout(() => {
            moveHome();
            if (homeVisible) (hasFinePointer() ? chatbot.input : panel).focus({ preventScroll: true });
        }, prefersReducedMotion() ? 0 : CLOSE_DURATION);
    }

    launcher.addEventListener('click', openDock);
    closeBtn.addEventListener('click', closeDock);
    scrim.addEventListener('click', closeDock);
    document.getElementById('chatbot-return').addEventListener('click', closeDock);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDock(); });

    // Le lanceur n'apparaît que lorsque le panneau de l'accueil est presque sorti de l'écran.
    new IntersectionObserver(([entry]) => {
        homeVisible = entry.intersectionRatio >= 0.25;
        syncLauncher();
    }, { threshold: [0, 0.25, 0.5] }).observe(home);
}
