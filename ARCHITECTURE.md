# 🏗️ ARCHITECTURE.md — Documentation Technique

> Document de référence technique du portfolio d'Adébayo Dassoundo.  
> Explique l'architecture des fichiers, la logique des modules JS, le système CSS, et les pistes d'évolution.

---

## 📐 Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────┐
│                  index.html                     │
│  (Structure HTML : contenu, sections, widgets)  │
│                     │                           │
│         ┌───────────┴────────────┐              │
│         ▼                        ▼              │
│     style.css               script.js           │
│  (Styles, thème,         (Logique interactive,  │
│   animations CSS)         Canvas, Chatbot)      │
│                                  │              │
│                        translations.js           │
│                  (Dictionnaire FR / EN)          │
└─────────────────────────────────────────────────┘
```

---

## 📄 Fichier : `index.html`

### Rôle
Fichier principal. Il définit la **structure complète** de la page web et importe tous les scripts et styles nécessaires.

### Organisation des sections HTML
```html
<head>
    <!-- Métadonnées SEO, Google Fonts, FontAwesome -->

<body>
    <!-- NAVIGATION FIXE (.navbar) -->
    <!-- HERO SECTION (#accueil) → Photo, titre animé, boutons CTA -->
    <!-- COMPÉTENCES (#competences) → Grilles de compétences -->
    <!-- PROJETS (#projets) → Cartes dépliables -->
    <!-- RECHERCHE (#recherche) → Publications et travaux -->
    <!-- FORMATION (#education) → Parcours scolaire -->
    <!-- ASSOCIATIONS (#associations) → Clubs et engagements -->
    <!-- CONTACT (#contact) → Email, réseaux, localisation -->
    <!-- FOOTER → Résumé + liens rapides -->

    <!-- CHATBOT WIDGET (inline, position fixed) -->

    <script src="script.js"></script>
    <script src="translations.js"></script>
    <script> /* Init chatbot inline */ </script>
```

### Conventions importantes
- Chaque section a un `id` pour les ancres de navigation (ex: `id="projets"`)
- Les textes traduisibles portent un attribut `data-lang="clé_de_traduction"`
- Le canvas IA est injecté dynamiquement dans `<div id="particles-js">`

---

## 🎨 Fichier : `style.css`

### Organisation CSS (par ordre dans le fichier)

```
:root { ... }          → Variables globales (couleurs, espacements)
  │
  ├── Reset & Base     → Styles de base (*, body, html)
  ├── Navigation       → .navbar, .nav-menu, .hamburger
  ├── Hero Section     → .hero, .hero-content, .typed-text
  ├── Canvas           → #particles-js, #tech-canvas
  ├── Sections         → .section-title, séparateurs
  ├── Compétences      → .skill-card, .skill-bar
  ├── Projets          → .project-card, .project-header
  ├── Recherche        → .research-card
  ├── Formation        → .education-card
  ├── Associations     → .club-card (glassmorphism)
  ├── Centres d'intérêt → .interest-item (glassmorphism)
  ├── Contact          → .contact-info, .contact-form
  ├── Footer           → .footer, .footer-bottom
  ├── Curseur custom   → .cursor-dot, .cursor-outline
  ├── Scroll Progress  → #scroll-progress
  ├── Bouton Top       → #back-to-top
  ├── GIF Section      → .gif-grid, .gif-container
  └── Chatbot Widget   → .chatbot-toggle, .chatbot-window
```

### Variables CSS Principales (`:root`)
```css
:root {
    --primary-blue: #38bdf8;   /* Bleu principal (cyan néon) */
    --warm-blue:    #818cf8;   /* Bleu violet pour dégradés */
    --accent-green: #34d399;   /* Vert pour statuts "En ligne" */
    --dark-bg:      #0a0f1e;   /* Fond très sombre */
    --white:        #111827;   /* "Blanc" du thème sombre */
    --gray-600:     #94a3b8;   /* Gris pour textes secondaires */
}
```

### Glassmorphism (effet verre givré)
Appliqué sur `.club-card` et `.interest-item` :
```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

---

## ⚙️ Fichier : `script.js`

### Architecture du fichier JS

```
script.js
│
├── [Bloc DOMContentLoaded] ─────────────────────────────────────
│   ├── 1. Navigation mobile (hamburger menu)
│   ├── 2. Smooth scroll (défilement fluide vers les sections)
│   ├── 3. Projets dépliables (accordion pattern)
│   ├── 4. Recherches dépliables (même pattern)
│   ├── 5. IntersectionObserver (animations au scroll)
│   ├── 6. Téléchargements (gestion des clics + feedback)
│   ├── 7. Gestion des langues (changeLanguage, initializeLanguage)
│   ├── 8. Typed.js (animation "machine à écrire")
│   └── 9. Animation Canvas IA/Tech ─────────────────────────────
│           ├── Création du canvas
│           ├── SYMBOLS : liste des symboles IA/tech flottants
│           ├── COLORS  : palette de couleurs néon
│           ├── createNodes() : génère les particules
│           ├── drawLines()   : connexions entre nœuds proches
│           ├── drawNode()    : affiche chaque symbole
│           ├── animate()     : boucle principale 60fps
│           └── Events : mousemove (attraction) | click (explosion)
│
├── [Hors DOMContentLoaded] ─────────────────────────────────────
│   ├── getCurrentLanguage() / changeLanguage()
│   └── window.changeLanguage / window.getCurrentLanguage (exports)
│
└── [IIFE Chatbot — exécution immédiate] ───────────────────────
    ├── Récupération des éléments DOM du widget
    ├── openClose()     : ouvre/ferme la fenêtre de chat
    ├── addMsg()        : crée une bulle de message
    ├── getReply()      : logique de réponse (mots-clés)
    ├── send()          : envoie la question + affiche réponse
    └── Events : click sur toggle/close/submit, keypress Enter
```

### 🖼️ Comment fonctionne l'animation Canvas

1. Un élément `<canvas>` est créé et injecté dans `#particles-js`
2. À chaque frame (via `requestAnimationFrame`), le canvas est **effacé**
3. Pour chaque nœud (symbole) :
   - Sa position est mise à jour (`x += vx`, `y += vy`)
   - Son alpha (opacité) pulse doucement entre min et max
   - Sa taille (scale) pulse légèrement pour un effet "respiration"
   - Si la souris est proche (<220px), le nœud est **attiré** vers elle
   - Un rebond se produit sur les bords du canvas
4. Pour chaque paire de nœuds à moins de 180px, une **ligne de connexion** est tracée avec une opacité proportionnelle à la distance
5. Au **clic** : tous les nœuds dans un rayon de 250px sont **repoussés** fortement

### 🤖 Comment fonctionne le Chatbot

Le chatbot est un système de **correspondance de mots-clés** (sans IA générative) :
```
Question de l'utilisateur
        ↓
   text.toLowerCase()
        ↓
   Vérification séquentielle des conditions if/includes()
        ↓
   Réponse pré-définie retournée
        ↓
   Affichée dans la bulle avec délai simulé (effet "typing")
```

**Mots-clés reconnus :**
| Mots-clés | Réponse |
|---|---|
| "cv", "télécharger" | Lien vers le PDF CV |
| "compétence", "skill", "techno" | Liste des compétences |
| "projet", "portfolio" | Liste des projets |
| "eseo", "école", "parcours" | Info sur la formation |
| "contact", "mail", "linkedin" | Coordonnées |
| "bonjour", "salut", "hello" | Accueil |
| "ia", "intelligence" | Expertise IA |
| "embarqué", "embedded" | Expertise embarquée |
| *(aucun match)* | Réponse générique |

---

## 🌐 Fichier : `translations.js`

Contient un objet `extendedTranslations` avec deux sous-objets `fr` et `en`.  
Chaque clé correspond à un attribut `data-lang="clé"` dans le HTML.

```javascript
const extendedTranslations = {
    fr: { 'nav-home': 'Accueil', ... },
    en: { 'nav-home': 'Home',    ... }
};
```

**Comment ajouter une nouvelle traduction :**
1. Dans `index.html`, ajouter `data-lang="ma-cle"` sur l'élément
2. Dans `translations.js`, ajouter `'ma-cle': 'Texte FR'` dans `fr` et `'ma-cle': 'Text EN'` dans `en`
3. La mise à jour est automatique lors du changement de langue

---

## 🔮 Pistes d'évolution

### A. Connecter le chatbot à une vraie IA (OpenAI/Gemini)

**Problème :** On ne peut pas mettre une clé API dans le frontend (visible dans le code source).

**Solution recommandée — Backend Serverless :**

```
index.html
    │ fetch('/api/chat', { body: question })
    ▼
Vercel Serverless Function (/api/chat.js)    ← clé API stockée dans les env vars Vercel
    │ appel sécurisé à OpenAI API
    ▼
Réponse JSON → affichée dans la bulle du chatbot
```

**Étapes concrètes :**
1. Créer un compte sur [Vercel](https://vercel.com) (gratuit)
2. Déployer le projet sur Vercel (import GitHub)
3. Créer le fichier `/api/chat.js` (Node.js)
4. Stocker la clé OpenAI dans **Environment Variables** de Vercel
5. Dans le chatbot, remplacer `getReply()` par un `fetch('/api/chat')`

### B. Internationalisation complète (i18n)

Toutes les clés de `translations.js` peuvent être enrichies.  
À terme, ajouter une troisième langue (ex: espagnol) ne demande qu'un nouvel objet `es: { ... }`.

### C. Mode Clair / Mode Sombre

Les variables CSS dans `:root` sont prêtes pour une bascule.  
Il suffirait d'ajouter : `body.light-theme { --dark-bg: #f8fafc; ... }`

---

## 📝 Conventions de code

| Règle | Détail |
|---|---|
| Langue des commentaires | **Français** dans tous les fichiers |
| Variables CSS | Utiliser uniquement les `var(--...)` définis dans `:root` |
| IDs HTML | Snake-case (ex: `chatbot-toggle`, `scroll-progress`) |
| Classes CSS | Kebab-case (ex: `.project-card`, `.nav-menu`) |
| Fonctions JS | camelCase (ex: `createNodes()`, `getBotResponse()`) |
| Sections CSS | Séparées par des commentaires de bloc `/* === TITRE === */` |

---

*Document rédigé en Français — Dernière mise à jour : Avril 2026*
