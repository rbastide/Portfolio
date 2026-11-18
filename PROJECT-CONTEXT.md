# Contexte projet

- **Projet** : portfolio de Rémi Bastide, étudiant en BUT Informatique et développeur fullstack, en recherche d'alternance en master IA. Public principal : recruteurs (lecture rapide, environ 30 secondes).
- **Stack** : HTML statique, CSS natif (`css/base.css`, `layout.css`, `sections.css`, `chatbot.css`), modules ES sans framework ni build. Hébergé sur GitHub Pages, avec un Cloudflare Worker (`worker/`) pour le chatbot. Pas de suite de tests : la validation se fait dans le navigateur.
- **Phase actuelle** : finitions visuelles du thème sombre Aurora UI (aurore animée, réseau de neurones en canvas, chatbot « ReyMysterio » : LLM Groq via un proxy Cloudflare Worker, réponses locales par mots-clés en secours).
- **Contraintes** : aucune dépendance, contenu en français, page rapide sur mobile milieu de gamme, accessibilité (contraste 4.5:1, clavier, mouvement réduit). La clé Groq ne doit jamais être dans le code du site, uniquement dans le Worker. Sous chaque réponse, le chatbot indique la source (modèle ou réponse locale).
- **Terminé quand** : le propriétaire valide visuellement la branche à 375, 768, 1024 et 1440 px, puis elle est mergée dans `main`.
