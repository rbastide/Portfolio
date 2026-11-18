# Proxy ReyMysterio (Groq)

Le chatbot du portfolio appelle ce Cloudflare Worker, qui appelle Groq. La clé Groq reste dans le Worker : elle n'est jamais envoyée au navigateur.
Si le Worker ne répond pas (quota, panne, pas encore déployé), le chatbot utilise ses réponses locales.

## Déployer (une seule fois)

1. Créer une clé sur https://console.groq.com/keys (gratuit).
2. Depuis ce dossier `worker/` :

   ```bash
   npx wrangler login
   npx wrangler secret put GROQ_API_KEY   # coller la clé Groq
   npx wrangler deploy
   ```

   Sur le réseau du travail, `registry.npmjs.org` est bloqué : ajouter `--registry=https://registry.npmmirror.com` après `npx`.

3. Copier l'URL affichée (`https://reymysterio.<compte>.workers.dev`) dans `CHATBOT_ENDPOINT` de `js/chatbot/llm.js`, puis commiter.

## Réglages (`wrangler.toml`)

- `ALLOWED_ORIGINS` : sites autorisés à appeler le Worker.
- `MODEL` : modèle Groq utilisé.
- `ratelimits` : nombre de questions par minute et par visiteur.

Après une modification : `npx wrangler deploy`.

## Ce que le Worker accepte

`POST` en JSON : `{ "context": "...", "messages": [{ "role": "user", "content": "..." }] }`
Réponse : `{ "answer": "...", "model": "..." }`, ou `{ "error": "..." }` avec un code 4xx/5xx.
Les consignes données au modèle sont dans `src/index.js` : le navigateur ne peut pas les remplacer.
