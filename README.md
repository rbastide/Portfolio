# Portfolio
Voici mon portfolio en ligne : https://rbastide.github.io/Portfolio

Contexte produit et contraintes : [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md)

## Structure

```text
index.html              squelette de la page
css/
  base.css              design tokens (Dark Aurora), reset, boot, animations
  layout.css            en-tête, sections, boutons, pied de page
  sections.css          accueil, compétences, projets, contact
  chatbot.css           assistant ReyMysterio (accueil + fenêtre flottante)
js/
  main.js               point d'entrée
  data/                 contenu : profil, compétences, projets
  views/                génération du HTML de chaque section
  controllers/          boot, navigation, filtres, mini-terminal...
  chatbot/              assistant ReyMysterio : LLM Groq via worker/, réponses locales en secours
  utils/                fonctions utilitaires
worker/                 proxy Cloudflare Worker vers Groq (garde la clé API secrète)
```

## Ajouter un projet

Ajouter une entrée dans `js/data/projects.js`. Le compteur, les filtres et le chatbot se mettent à jour automatiquement.

## Chatbot (Groq)

ReyMysterio répond avec un LLM Groq une fois le proxy déployé (voir [worker/README.md](worker/README.md)) et son adresse renseignée dans `CHATBOT_ENDPOINT` (`js/chatbot/llm.js`). Sans proxy, ou si Groq ne répond pas, il utilise ses réponses locales.

## Lancer en local

Le site utilise des modules ES : il doit être servi en HTTP (ouvrir `index.html` en double-clic ne fonctionne pas).

```bash
npx serve .
# ou
python -m http.server
```
