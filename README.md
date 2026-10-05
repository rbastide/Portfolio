# Portfolio
Voici mon portfolio en ligne : https://rbastide.github.io/Portfolio/#home

## Structure

```text
index.html              squelette de la page
css/
  base.css              design tokens (Dark Aurora), reset, boot, animations
  layout.css            en-tête, sections, boutons, pied de page
  sections.css          accueil, compétences, projets, contact
  chatbot.css           assistant ReyMysterio (intégré à l'accueil)
js/
  main.js               point d'entrée
  data/                 contenu : profil, compétences, projets
  views/                génération du HTML de chaque section
  controllers/          boot, navigation, filtres, mini-terminal...
  chatbot/              assistant local (base de connaissances générée depuis data/)
  utils/                fonctions utilitaires
```

## Ajouter un projet

Ajouter une entrée dans `js/data/projects.js`. Le compteur, les filtres et le chatbot se mettent à jour automatiquement.

## Lancer en local

Le site utilise des modules ES : il doit être servi en HTTP (ouvrir `index.html` en double-clic ne fonctionne pas).

```bash
npx serve .
# ou
python -m http.server
```
