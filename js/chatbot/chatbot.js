// ============================================
// CHATBOT — ReyMysterio (local, sans API)
// ============================================
import { buildKnowledgeBase, fallbacks } from './knowledge.js';
import { escapeHtml, pickRandom, sleep, prefersReducedMotion } from '../utils/dom.js';
import { BOT_AVATAR } from './avatar.js';

export const BOT_NAME = 'ReyMysterio';
const GREETING = `Bonjour ! Je suis ReyMysterio, l'assistant du portfolio de Rémi.

Posez-moi une question sur ses projets, sa stack ou sa recherche d'alternance.`;

// Vitesse d'écriture des réponses : caractères ajoutés par image.
const TYPE_SPEED = 4;

// Transforme le texte d'une réponse en HTML (voir le format dans knowledge.js).
// Le texte est échappé avant toute mise en forme.
function formatAnswer(text) {
    const inline = line => escapeHtml(line).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return text.trim().split(/\n\s*\n/).map(block => {
        const lines = block.split('\n');
        return lines.every(l => l.startsWith('- '))
            ? `<ul>${lines.map(l => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`
            : `<p>${lines.map(inline).join('<br>')}</p>`;
    }).join('');
}

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

        this.addMessage('bot', GREETING, "à l'instant");
    }

    reset() {
        this.messagesEl.innerHTML = '';
        this.addMessage('bot', "C'est reparti ! Que voulez-vous savoir sur Rémi ?", "à l'instant");
    }

    updateCounter() {
        this.counter.textContent = `${this.input.value.length} / ${this.input.maxLength}`;
    }

    addMessage(from, text, meta = "à l'instant") {
        const div = document.createElement('div');
        div.className = `chat-msg ${from}`;
        div.innerHTML = from === 'bot'
            ? `<span class="chat-msg-avatar">${BOT_AVATAR}</span>
               <div class="chat-msg-col">
                   <div class="chat-bubble chat-answer">${formatAnswer(text)}</div>
                   <span class="chat-msg-meta">${BOT_NAME} · ${meta}</span>
               </div>`
            : `<div class="chat-bubble">${escapeHtml(text)}</div>`;
        this.messagesEl.appendChild(div);
        this.scrollToBottom();
        return div.querySelector('.chat-bubble');
    }

    // Écrit la réponse progressivement, comme un assistant qui génère son texte.
    // Le HTML final est déjà en place : les blocs restent masqués jusqu'à ce
    // que l'écriture les atteigne, et un curseur suit le texte en cours.
    async typeOut(bubble) {
        if (prefersReducedMotion()) return;
        const walker = document.createTreeWalker(bubble, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push({ node: walker.currentNode, text: walker.currentNode.textContent });
        nodes.forEach(n => { n.node.textContent = ''; });

        const blocks = bubble.querySelectorAll('p, ul, li');
        blocks.forEach(el => { el.hidden = true; });
        const caret = document.createElement('span');
        caret.className = 'chat-caret';

        for (const n of nodes) {
            for (let el = n.node.parentElement; el && el !== bubble; el = el.parentElement) el.hidden = false;
            n.node.after(caret);
            for (let i = 0; i < n.text.length; i += TYPE_SPEED) {
                n.node.textContent = n.text.slice(0, i + TYPE_SPEED);
                this.scrollToBottom();
                await new Promise(requestAnimationFrame);
            }
        }
        caret.remove();
    }

    showTyping() {
        const div = document.createElement('div');
        div.className = 'chat-msg bot';
        div.id = 'typing-indicator';
        div.innerHTML = `<span class="chat-msg-avatar">${BOT_AVATAR}</span>
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
        await this.typeOut(this.addMessage('bot', this.findBestMatch(text)));
        this.busy = false;
        // Pas de focus automatique après un bouton : sur mobile, cela ouvrirait le clavier.
        if (!preset) this.input.focus({ preventScroll: true });
    }
}
