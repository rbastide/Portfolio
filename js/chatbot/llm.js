// ============================================
// CHATBOT — Réponses par LLM (Groq, via le proxy worker/)
// ============================================
// Adresse du proxy Cloudflare Worker (voir worker/README.md). Vide : le
// chatbot n'utilise que ses réponses locales (knowledge.js).
export const CHATBOT_ENDPOINT = '';

// Nom affiché sous les réponses générées par le modèle.
export const LLM_LABEL = 'Llama 3.3 via Groq';

const TIMEOUT_MS = 12000;
const HISTORY = 8;  // messages de la conversation envoyés au modèle

const stripHtml = text => text.replace(/<[^>]+>/g, '');

// Résumé du portfolio envoyé au modèle, généré depuis data/ : ajouter un
// projet suffit pour que le modèle le connaisse.
export function buildContext({ profile, projects, competences }) {
    const { about, contact } = profile;
    const project = p => [
        `### ${p.title} (${[p.category, p.context, p.period].filter(Boolean).join(', ')})`,
        p.desc,
        `Rôle : ${p.role}`,
        `Technologies : ${p.tech.join(', ')}`,
        ...p.livrables.map(l => `${l.nom} : ${l.private ? 'dépôt privé, bientôt public' : l.url}`)
    ].join('\n');

    return [
        `## Profil`,
        `${profile.name}, ${profile.year}. ${stripHtml(profile.bio)}`,
        `Recherche : ${profile.lookingFor}.`,
        ...about.paragraphs,
        ...about.facts.map(f => `- ${f.key} : ${f.value}`),
        `Contact : ${contact.email}, ${contact.github}, ${contact.linkedin}`,
        `## Stack`,
        ...about.stack.map(g => `- ${g.group} : ${g.items.join(', ')}`),
        `Savoir-être : ${about.softSkills.join(', ')}`,
        `## Projets (${projects.length})`,
        ...projects.map(project),
        `## Compétences du BUT Informatique`,
        ...competences.map(c => `- ${c.title} (niveau ${c.level}/3) : ${c.description}`)
    ].join('\n');
}

// Pose la question au modèle. Lève une erreur si le proxy n'est pas configuré,
// ne répond pas à temps ou renvoie une erreur : l'appelant répond alors en local.
export async function askLLM(context, messages) {
    if (!CHATBOT_ENDPOINT) throw new Error('LLM non configuré');

    const response = await fetch(CHATBOT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, messages: messages.slice(-HISTORY) }),
        signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!response.ok) throw new Error(`Proxy LLM : ${response.status}`);

    const { answer } = await response.json();
    if (!answer) throw new Error('Réponse vide');
    return answer;
}
