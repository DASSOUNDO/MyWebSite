# Portfolio – Adébayo Sergio DASSOUNDO

Portfolio d'ingénieur et de chercheur en **IA agentique, systèmes multi-agents et logiciel embarqué**, candidat au doctorat (Ph.D.). Il présente mon parcours (Renault, Thales, Yieloo, Université de Sherbrooke), mes projets (DASIA, Citiz), mes axes de recherche, et intègre un **assistant IA** qui répond aux questions des recruteurs à partir du contenu du site.

**Site en ligne :** https://dassoundo.github.io/MyWebSite/

## Fonctionnalités

### Assistant IA pour les recruteurs
- **Panneau latéral** à la manière des IA génératives : écran d'accueil avec suggestions, réponses en temps réel (streaming), questions de relance cliquables, liens vers les sections du site.
- **Analyse de fiche de poste** : le recruteur colle une offre, l'assistant produit une analyse d'adéquation exigence par exigence (points forts avec preuves, exigences couvertes, points à approfondir en entretien).
- **Réponses ancrées** : le modèle ne s'appuie que sur le contenu du portfolio, avec des règles strictes contre l'invention.
- **Résilience** : chaîne de modèles gratuits (Gemini 3 Flash, puis GPT-OSS 120B et Qwen3 via Groq), puis un assistant hors ligne par mots-clés si aucun modèle ne répond.
- **Sécurité** : clés API conservées comme secrets côté serveur (Cloudflare Worker), origines autorisées, limitation du débit.

### Tableau de bord privé (`admin.html`)
- **Audience** : visiteurs uniques, visites par jour, durée, défilement, sections lues et temps passé sur chacune.
- **Origine** : site référent (LinkedIn, Google, e-mail…), pays, ville et réseau (université, entreprise).
- **Suivi des candidatures** : un lien personnel par candidature ; le tableau indique s'il a été ouvert, quand, ce qui a été lu et si le CV a été téléchargé.
- **Assistant IA** : questions posées, fiches de poste analysées, modèle utilisé.
- **Vie privée** : mesure anonyme sans cookie, IP jamais stockée, accès protégé par un mot de passe vérifié côté serveur.

### Site
- Sections : Accueil, Axes de recherche, Parcours, Projets, Recherche, Compétences, Formation, Engagement, Contact.
- **Bilingue FR / EN**, avec mémorisation du choix.
- **Recherche intégrée** (`Ctrl + K` ou `/`) avec surlignage des résultats dans la page.
- Thème clair par défaut, **thème sombre** au choix.
- Aperçus visuels au survol des expériences, animation propre à chaque expérience à son arrivée à l'écran (vraies photos détourées : avion, voiture, robot…), cartes de projets dépliables.
- Téléchargement du CV (FR / EN) et des lettres de recommandation.
- Responsive (ordinateur, tablette, mobile) et accessible (navigation au clavier, attributs ARIA).

## Technologies

| Partie | Technologies |
| --- | --- |
| Site | HTML5, CSS3 (variables, Grid, Flexbox), JavaScript ES6+ sans framework |
| Interface | Font Awesome, Google Fonts (Inter, Outfit, JetBrains Mono) |
| Assistant IA | Cloudflare Workers, Gemini API, Groq API, Server-Sent Events |
| Tableau de bord | Cloudflare D1 (SQLite), graphiques SVG sans bibliothèque |
| Outillage | Python (génération de la base de connaissances), Node.js (tests), Wrangler |
| Hébergement | GitHub Pages |

## Structure du dépôt

```
index.html              Page unique du portfolio
style.css               Styles (thèmes clair et sombre)
script.js               Interactions, traduction, recherche, assistant IA, mesure d'audience
admin.html, admin.js    Tableau de bord privé (audience, candidatures, assistant)
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

### Crédits des photos animées du Parcours (`images/anim/`)

Photos de Wikimedia Commons, détourées et réduites :

| Fichier | Photo d'origine | Auteur | Licence |
| --- | --- | --- | --- |
| plane.webp | [Airbus A350-941 Qatar Airways](https://commons.wikimedia.org/wiki/File:A7-ALN_Airbus_A350-941_A359_c_n_47_-_QTR_(32184771827).jpg) | Markus Eigenheer | CC BY-SA 2.0 |
| car.webp | [Renault Clio IV Estate](https://commons.wikimedia.org/wiki/File:Renault_Clio_IV_Estate_(side).JPG) | Overlaet | CC BY-SA 3.0 |
| gpu.webp | [Nvidia GeForce RTX 5060 Ti](https://commons.wikimedia.org/wiki/File:Nvidia_GeForce_RTX_5060_Ti_16GB,_PNY_Overclocked_Dual_Fan,_rear.jpg) | FreeMediaKid! | CC BY-SA 4.0 |
| flask.webp | [Erlenmeyer flasks](https://commons.wikimedia.org/wiki/File:Erlenmeyer_flask_ben.jpg) | Maytouch L. | CC BY-SA 4.0 |
| robot.webp | [THeMIS UGV](https://commons.wikimedia.org/wiki/File:THeMIS_5th_generation_UGV.jpg) | Milrem Robotics | CC BY-SA 4.0 |
| raspberry.webp | [Raspberry Pi 4 B](https://commons.wikimedia.org/wiki/File:Raspberry_Pi_4_B.png) | Batocera Team | CC0 |
| arduino.webp | [Arduino Uno](https://commons.wikimedia.org/wiki/File:Arduino_Uno_board.jpg) | JrawX | CC0 |
| handshake.webp | [Hermandad – friendship](https://commons.wikimedia.org/wiki/File:Hermandad_-_friendship.jpg) | Rufino | CC BY-SA 2.0 |
| caliper.webp | [Suwmiarka cyfrowa](https://commons.wikimedia.org/wiki/File:2020_Suwmiarka_cyfrowa.jpg) | Jacek Halicki | CC BY-SA 4.0 |

Ces versions détourées sont diffusées sous les mêmes licences que les originaux.
