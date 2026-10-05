// ============================================
// CHATBOT — ReyMysterio (local, sans API)
// ============================================
import { buildKnowledgeBase, fallbacks } from './knowledge.js';
import { escapeHtml, pickRandom, sleep } from '../utils/dom.js';

const BOT_NAME = 'ReyMysterio';
const GREETING = "Salut ! Je suis ReyMysterio, l'assistant de Rémi. Posez-moi une question sur ses compétences, ses projets ou son parcours !";

function normalize(str) {
    return str.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s'.]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export class Chatbot {
    constructor(data) {
        // Les mots-clés sont normalisés une seule fois, pas à chaque message.
        this.kb = Object.entries(buildKnowledgeBase(data)).map(([topic, t]) => ({
            topic,
            weight: t.weight || 1,
            answers: t.answers,
            keys: t.keys.map(normalize)
        }));
        this.busy = false;
    }

    // Le panneau est rendu par la vue d'accueil : init() doit être appelé après le rendu.
    init() {
        this.panel = document.getElementById('chatbot');
        if (!this.panel) return;
        this.messagesEl = document.getElementById('chatbot-messages');
        this.form = document.getElementById('chatbot-form');
        this.input = document.getElementById('chatbot-input');
        this.counter = document.getElementById('chatbot-count');

        this.form.addEventListener('submit', e => { e.preventDefault(); this.send(); });
        this.input.addEventListener('input', () => this.updateCounter());
        document.getElementById('chatbot-reset').addEventListener('click', () => this.reset());
        this.panel.querySelectorAll('.chat-preset[data-query]').forEach(btn =>
            btn.addEventListener('click', () => this.send(btn.dataset.query)));

        this.addMessage('bot', GREETING, 'System Ready');
    }

    reset() {
        this.messagesEl.innerHTML = '';
        this.addMessage('bot', 'Session réinitialisée. Posez une question sur le parcours ou les projets de Rémi !', 'System Ready');
    }

    updateCounter() {
        this.counter.textContent = `${this.input.value.length} / ${this.input.maxLength}`;
    }

    addMessage(from, text, meta = "à l'instant") {
        const div = document.createElement('div');
        div.className = `chat-msg ${from}`;
        div.innerHTML = from === 'bot'
            ? `<span class="chat-msg-avatar"><span class="icon">smart_toy</span></span>
               <div class="chat-msg-col">
                   <div class="chat-bubble">${escapeHtml(text)}</div>
                   <span class="chat-msg-meta">${BOT_NAME} • ${meta}</span>
               </div>`
            : `<div class="chat-bubble">${escapeHtml(text)}</div>`;
        this.messagesEl.appendChild(div);
        this.scrollToBottom();
    }

    showTyping() {
        const div = document.createElement('div');
        div.className = 'chat-msg bot';
        div.id = 'typing-indicator';
        div.innerHTML = `<span class="chat-msg-avatar"><span class="icon">smart_toy</span></span>
            <div class="chat-msg-col"><div class="chat-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div></div>`;
        this.messagesEl.appendChild(div);
        this.scrollToBottom();
    }

    removeTyping() {
        document.getElementById('typing-indicator')?.remove();
    }

    // Défile uniquement la zone de messages, jamais la page entière.
    scrollToBottom() {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    findBestMatch(input) {
        const norm = ` ${normalize(input)} `;
        let best = null;
        let bestScore = 0;

        for (const entry of this.kb) {
            let score = 0;
            for (const key of entry.keys) {
                // Les mots-clés courts (yo, cv, but...) doivent être des mots entiers,
                // sinon "yo" matcherait "voyons" et "but" matcherait "début".
                // L'apostrophe compte aussi comme séparateur : "l'ia" doit matcher "ia".
                const hit = key.length <= 3 ? norm.replace(/'/g, ' ').includes(` ${key} `) : norm.includes(key);
                if (hit) score += key.length;
            }
            score *= entry.weight;
            if (score > bestScore) {
                bestScore = score;
                best = entry;
            }
        }

        return best ? pickRandom(best.answers) : pickRandom(fallbacks);
    }

    async send(preset) {
        const text = (preset ?? this.input.value).trim();
        if (!text || this.busy) return;

        this.busy = true;
        this.input.value = '';
        this.updateCounter();
        this.addMessage('user', text);
        this.showTyping();

        await sleep(400 + Math.random() * 600);

        this.removeTyping();
        this.addMessage('bot', this.findBestMatch(text));
        this.busy = false;
        // Pas de focus automatique après un bouton : sur mobile, cela ouvrirait le clavier.
        if (!preset) this.input.focus({ preventScroll: true });
    }
}
