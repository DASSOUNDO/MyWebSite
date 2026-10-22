# Assistant IA du portfolio – proxy Cloudflare Worker

Ce petit serveur relie l'assistant du portfolio à des modèles d'IA gratuits, sans jamais exposer les clés API dans le site.

```
Visiteur → portfolio (GitHub Pages) → ce proxy (Cloudflare Worker) → Gemini, ou Groq en secours
                                       └ lit le profil publié : /assistant/knowledge.md
```

- **Clés API secrètes** : stockées comme secrets Cloudflare, jamais dans le code ni dans le site.
- **Ancrage** : le modèle ne répond qu'à partir du profil généré depuis `index.html`.
- **Résilience** : chaîne de modèles gratuits (Gemini 3 Flash, puis GPT-OSS 120B et Qwen3 sur Groq), chacun avec son propre quota, puis l'assistant hors ligne du site.
- **Garde-fous** : seuls les sites listés dans `ALLOWED_ORIGINS` peuvent l'appeler, 8 questions par minute et par visiteur, taille des messages limitée, aucune conversation enregistrée.

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

## Tests
```bash
cd assistant-worker
npm test
```
Les tests simulent Gemini et Groq. Ils ne consomment aucun quota et ne demandent aucune clé.
