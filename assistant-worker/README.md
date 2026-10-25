# Assistant IA du portfolio – proxy Cloudflare Worker

Ce petit serveur relie l'assistant du portfolio à des modèles d'IA gratuits, sans jamais exposer les clés API dans le site.

```
Visiteur → portfolio (GitHub Pages) → ce proxy (Cloudflare Worker) → Gemini, ou Groq en secours
                                       └ lit le profil publié : /assistant/knowledge.md
```

- **Clés API secrètes** : stockées comme secrets Cloudflare, jamais dans le code ni dans le site.
- **Ancrage** : le modèle ne répond qu'à partir du profil généré depuis `index.html`.
- **Résilience** : chaîne de modèles gratuits (Gemini 3 Flash, puis GPT-OSS 120B et Qwen3 sur Groq), chacun avec son propre quota, puis l'assistant hors ligne du site.
- **Garde-fous** : seuls les sites listés dans `ALLOWED_ORIGINS` peuvent l'appeler, 8 questions par minute et par visiteur, taille des messages limitée.
- **Tableau de bord** : mesure d'audience anonyme et questions posées à l'assistant, stockées dans une base D1 et consultables sur `admin.html` (voir plus bas).

## Déploiement (une seule fois, environ 15 minutes)

### 1. Récupérer les clés API gratuites
- **Gemini** : https://aistudio.google.com/apikey, puis « Create API key ».
- **Groq** : https://console.groq.com/keys, puis « Create API Key ».

La chaîne de modèles est réglée dans `wrangler.toml` (`PROVIDERS`). Modèles vérifiés en conditions réelles le 22/10/2026 : `gemini-3-flash-preview` (Google), `openai/gpt-oss-120b` et `qwen/qwen3.8-27b` (Groq). Si un modèle disparaît des niveaux gratuits, remplace-le simplement dans cette liste.

### 2. Créer un compte Cloudflare
https://dash.cloudflare.com/sign-up (gratuit, sans carte bancaire).

### 3. Déployer depuis ce dossier
```bash
cd assistant-worker
npx wrangler login                    # ouvre le navigateur pour connecter ton compte
npx wrangler secret put GEMINI_API_KEY   # colle la clé Gemini quand c'est demandé
npx wrangler secret put GROQ_API_KEY     # colle la clé Groq
npx wrangler deploy
```
À la fin, Wrangler affiche l'adresse du proxy, par exemple `https://portfolio-assistant.<ton-sous-domaine>.workers.dev`.

### 4. Brancher le site sur le proxy
Dans `script.js`, renseigne l'adresse en ajoutant `/chat` à la fin :
```js
const ASSISTANT_API = window.ASSISTANT_API_OVERRIDE || 'https://portfolio-assistant.<ton-sous-domaine>.workers.dev/chat';
```
Puis commite et pousse : l'assistant IA est en ligne.

### 5. Sécurité conseillée
Dans Google AI Studio et Groq, garde le niveau gratuit (sans facturation) : en cas d'abus, les quotas s'épuisent, et l'assistant bascule simplement en mode hors ligne, sans aucun coût.

## Mettre à jour les connaissances de l'assistant
Après chaque modification du contenu du portfolio :
```bash
python3 tools/build_knowledge.py   # depuis la racine du dépôt
```
Puis commite les fichiers `assistant/knowledge*.md`. Le proxy relit le profil toutes les 10 minutes, sans redéploiement.

## Tableau de bord admin (mesure d'audience)

Le site envoie au proxy (`POST /track`) une mesure anonyme de chaque visite : sections lues et temps passé, défilement, actions (CV, LinkedIn, assistant…), origine (site référent, lien `?ref=` de candidature), pays, ville et réseau approximatifs. Aucun cookie ; l'adresse IP n'est jamais stockée (le visiteur est reconnu pour la journée par une empreinte salée). Les robots, les navigateurs qui demandent à ne pas être suivis et l'appareil de l'admin sont ignorés. Données conservées 12 mois.

La page `admin.html` du site affiche le tableau de bord (`GET /admin/stats`). Le mot de passe n'est envoyé qu'une fois (`POST /admin/login`) : le proxy renvoie un jeton signé (HMAC) valable 24 h, ou 30 jours avec « Rester connecté », seul conservé par le navigateur. Changer le mot de passe invalide tous les jetons. Après 10 mauvais mots de passe en 15 minutes, le réseau concerné est bloqué 15 minutes. Elle permet aussi de créer un lien personnel par candidature (`POST /admin/applications`) pour savoir si le recruteur l'a ouvert.

Mise en place (une seule fois) :
```bash
npx wrangler d1 create portfolio-analytics            # puis reporter l'identifiant dans wrangler.toml
npx wrangler d1 execute portfolio-analytics --remote --file=migrations/0001_analytics.sql
npx wrangler secret put ADMIN_PASSWORD                # mot de passe du tableau de bord
npx wrangler secret put ANALYTICS_SALT                # longue valeur aléatoire (anonymisation)
npx wrangler deploy
```
Pour changer de mot de passe, relancer `npx wrangler secret put ADMIN_PASSWORD`.

## Tests
```bash
cd assistant-worker
npm test
```
Les tests simulent Gemini et Groq, et utilisent une base SQLite en mémoire à la place de D1. Ils ne consomment aucun quota et ne demandent aucune clé.
