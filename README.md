# Portfolio – Adébayo Sergio DASSOUNDO

Portfolio d'ingénieur et de chercheur en **IA agentique, systèmes multi-agents et logiciel embarqué**, candidat au doctorat (Ph.D.). Il présente mon parcours (Renault, Thales, Yieloo, Université de Sherbrooke), mes projets (DASIA, Citiz), mes axes de recherche, et intègre un **assistant IA** qui répond aux questions des recruteurs à partir du contenu du site.

**Site en ligne :** https://dassoundo.github.io/MyWebSite/

## Fonctionnalités

### Assistant IA pour les recruteurs
- **Panneau latéral** à la manière des IA génératives : écran d'accueil avec suggestions, réponses en temps réel (streaming), questions de relance cliquables, liens vers les sections du site.
- **Analyse de fiche de poste** : le recruteur colle une offre, l'assistant produit une analyse d'adéquation exigence par exigence (points forts avec preuves, exigences couvertes, points à approfondir en entretien).
- **Réponses ancrées** : le modèle ne s'appuie que sur le contenu du portfolio, avec des règles strictes contre l'invention.
- **Résilience** : chaîne de modèles gratuits (Gemini 3 Flash, puis GPT-OSS 120B et Qwen3 via Groq), puis un assistant hors ligne par mots-clés si aucun modèle ne répond.
- **Sécurité** : clés API conservées comme secrets côté serveur (Cloudflare Worker), origines autorisées, limitation du débit, aucune conversation enregistrée.

### Site
- Sections : Accueil, Axes de recherche, Parcours, Projets, Recherche, Compétences, Formation, Engagement, Contact.
- **Bilingue FR / EN**, avec mémorisation du choix.
- **Recherche intégrée** (`Ctrl + K` ou `/`) avec surlignage des résultats dans la page.
- Thème clair par défaut, **thème sombre** au choix.
- Aperçus visuels au survol des expériences, animation propre à chaque expérience à son arrivée à l'écran (avion, voiture, robot…), cartes de projets dépliables.
- Téléchargement du CV (FR / EN) et des lettres de recommandation.
- Responsive (ordinateur, tablette, mobile) et accessible (navigation au clavier, attributs ARIA).

## Technologies

| Partie | Technologies |
| --- | --- |
| Site | HTML5, CSS3 (variables, Grid, Flexbox), JavaScript ES6+ sans framework |
| Interface | Font Awesome, Google Fonts (Inter, Outfit, JetBrains Mono) |
| Assistant IA | Cloudflare Workers, Gemini API, Groq API, Server-Sent Events |
| Outillage | Python (génération de la base de connaissances), Node.js (tests), Wrangler |
| Hébergement | GitHub Pages |

## Structure du dépôt

```
index.html              Page unique du portfolio
style.css               Styles (thèmes clair et sombre)
script.js               Interactions, traduction, recherche, assistant IA
i18n-en.js              Traductions anglaises
assistant/              Base de connaissances de l'assistant (générée)
assistant-worker/       Proxy Cloudflare Worker de l'assistant IA (code, tests, guide)
tools/build_knowledge.py  Génère la base de connaissances à partir d'index.html
cv/                     CV en PDF
Recommendation/         Lettres de recommandation en PDF
images/, company/       Photos, logos et visuels
```

## Lancer le site en local

```bash
python3 -m http.server 8765
```
Puis ouvrir http://localhost:8765. L'assistant IA fonctionne aussi en local : cette adresse est autorisée par le proxy.

## Mettre à jour l'assistant IA

Après chaque modification du contenu du site, régénérer sa base de connaissances :
```bash
python3 tools/build_knowledge.py
```
Puis commiter les fichiers `assistant/knowledge*.md`. Le proxy les relit automatiquement toutes les 10 minutes.

Le déploiement du proxy, la configuration des clés API et les tests sont décrits dans [assistant-worker/README.md](assistant-worker/README.md).

## Déploiement

Le site est publié par GitHub Pages depuis la branche `web_5`.

## Licence

Code sous licence [MIT](LICENSE). Les contenus personnels (CV, lettres de recommandation, photos) ne sont pas réutilisables sans autorisation.

Les images animées du Parcours (`images/anim/`) proviennent de [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) de Microsoft, sous licence MIT.
