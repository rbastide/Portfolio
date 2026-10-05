// ============================================
// CHATBOT — ReyMysterio (local, sans API)
// ============================================
import { buildKnowledgeBase, fallbacks } from './knowledge.js';
import { escapeHtml, pickRandom, sleep } from '../utils/dom.js';

const BOT_NAME = 'REYMYSTERIO';

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

        this.toggleBtn = document.getElementById('chatbot-toggle');
        this.panel = document.getElementById('chatbot');
        this.messagesEl = document.getElementById('chatbot-messages');
        this.input = document.getElementById('chatbot-input');
        this.sendBtn = document.getElementById('chatbot-send');
        this.closeBtn = document.getElementById('chatbot-close');
    }

    init() {
        this.toggleBtn.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());
        this.sendBtn.addEventListener('click', () => this.send());
        this.input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
            if (e.key === 'Escape') this.close();
        });

        this.addMessage('bot', "Salut ! Je suis ReyMysterio, l'assistant de Rémi. Posez-moi une question sur ses compétences, ses projets ou son parcours !");
    }

    open() {
        this.panel.classList.replace('chatbot-closed', 'chatbot-open');
        this.panel.setAttribute('aria-hidden', 'false');
        this.toggleBtn.classList.add('hidden');
        setTimeout(() => this.input.focus(), 300);
    }

    close() {
        this.panel.classList.replace('chatbot-open', 'chatbot-closed');
        this.panel.setAttribute('aria-hidden', 'true');
        this.toggleBtn.classList.remove('hidden');
        this.toggleBtn.focus();
    }

    addMessage(from, text) {
        const div = document.createElement('div');
        div.className = `chat-msg ${from}`;
        const prefix = from === 'bot'
            ? `<span class="bot-prefix">${BOT_NAME}</span>`
            : `<span class="user-prefix">VOUS</span>`;
        div.innerHTML = prefix + escapeHtml(text);
        this.messagesEl.appendChild(div);
        this.scrollToBottom();
    }

    showTyping() {
        const div = document.createElement('div');
        div.className = 'chat-msg bot typing';
        div.id = 'typing-indicator';
        div.innerHTML = `<span class="bot-prefix">${BOT_NAME}</span><div class="typing-dots"><span></span><span></span><span></span></div>`;
        this.messagesEl.appendChild(div);
        this.scrollToBottom();
    }

    removeTyping() {
        document.getElementById('typing-indicator')?.remove();
    }

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

    async send() {
        const text = this.input.value.trim();
        if (!text) return;

        this.input.value = '';
        this.addMessage('user', text);
        this.showTyping();

        await sleep(400 + Math.random() * 600);

        this.removeTyping();
        this.addMessage('bot', this.findBestMatch(text));
        this.input.focus();
    }
}
