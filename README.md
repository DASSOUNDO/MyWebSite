# 🌐 Portfolio — Adébayo DASSOUNDO

> Site web portfolio professionnel, moderne et interactif, présentant le parcours, les compétences et les projets d'un ingénieur spécialisé en **Systèmes Embarqués**, **Intelligence Artificielle** et **Cybersécurité**.

---

## 📁 Structure du projet


```
MyWebSite/
├── index.html          # Page principale (structure HTML complète)
├── style.css           # Feuille de styles (design, animations, thème)
├── script.js           # Logique JavaScript (interactions, animations, chatbot)
├── translations.js     # Traductions FR/EN (clés de texte multilingue)
│
├── images/             # Photos de profil, logos, etc.
├── cv/                 # Fichiers CV téléchargeables (PDF)
├── company/            # Logos des entreprises partenaires
├── Club/               # Ressources pour la section associative
├── GIF/                # Animations GIF pour démos embarquées
├── Recommendation/     # Lettre(s) de recommandation (PDF)
│
├── README.md           # Ce fichier — documentation générale
└── ARCHITECTURE.md     # Documentation technique détaillée
```

---

## 🚀 Fonctionnalités principales

### 🎨 Design & Expérience Utilisateur
- **Thème sombre luxueux** — palette "Dark Tech" (bleu nuit + slate + cyan néon)
- **Glassmorphism** — cartes translucides avec flou d'arrière-plan (backdrop-filter)
- **Entièrement responsive** — optimisé ordinateur, tablette et mobile
- **Typographie Inter** — via Google Fonts, pour un rendu propre et lisible

### ✨ Animations & Interactivité
- **Animation Hero Canvas** — symboles IA/tech flottants (AI, ML, ROS2, GPT...) connectés par un réseau neuronal dynamique
- **Curseur personnalisé** — halo néon qui suit le pointeur
- **Typed.js** — introduction animée "effet machine à écrire"
- **Apparition au scroll** — sections qui s'animent à l'entrée dans le viewport (Intersection Observer)
- **Barre de progression** — indique la position de lecture sur la page
- **Bouton Retour en haut** — apparaît après 400px de défilement

### 🌍 Multilingue
- Basculement dynamique **Français 🇫🇷 / Anglais 🇬🇧**
- Préférence sauvegardée dans `localStorage`
- Langues complètement définies dans `translations.js`

### 🤖 Chatbot Assistant IA
- **Widget flottant** en bas à droite de l'écran
- Répond aux questions sur les compétences, projets, contact, formation
- Simulation de "frappe" (effet typing) avant chaque réponse
- Actuellement basé sur des **règles JavaScript** (pas besoin de clé API)
- Prêt à être connecté à OpenAI/Gemini avec un backend sécurisé

---

## 📋 Sections du site

| Section | Description |
|---|---|
| **Accueil (Hero)** | Présentation, photo, boutons CV/Recommandation |
| **Compétences** | Langages, domaines techniques, certifications |
| **Projets** | Cartes dépliables avec description détaillée |
| **Recherche** | Travaux de recherche appliquée (Canada/France) |
| **Formation** | Parcours académique et programmes d'études |
| **Associations** | Clubs et engagements parascolaires |
| **Contact** | Email, LinkedIn, GitHub, localisation |

---

## 💻 Technologies utilisées

| Technologie | Rôle |
|---|---|
| `HTML5` | Structure sémantique de la page |
| `CSS3` | Mise en page, animations, variables CSS |
| `JavaScript ES6+` | Logique interactive, animations Canvas |
| `HTML5 Canvas` | Animation de fond : réseau de particules IA |
| `Typed.js` | Animation de texte "machine à écrire" |
| `Font Awesome 6` | Icônes vectorielles (nav, sections, boutons) |
| `Google Fonts (Inter)` | Typographie principale |
| `localStorage` | Sauvegarde des préférences utilisateur |
| `IntersectionObserver API` | Animations déclenchées au scroll |

---

## 🌍 Déploiement

- **Hébergement** : GitHub Pages
- **Branche de production** : `web_3`
- **URL** : `https://DASSOUNDO.github.io/MyWebSite/`

---

## 📖 Documentation complémentaire

👉 Voir [`ARCHITECTURE.md`](./ARCHITECTURE.md) pour la documentation technique complète :
- Architecture des fichiers
- Explication du code JS (Canvas, Chatbot, Observers...)
- Guide pour ajouter une vraie clé API au chatbot
- Conventions de code utilisées

---

## 👤 Auteur

**Adébayo Dassoundo**  
Étudiant Ingénieur — ESEO Angers (2023–2026)  
Spécialisation : Systèmes Embarqués · IA · Cybersécurité  
📧 adebayo.dassoundo@reseau.eseo.fr  
🔗 [LinkedIn](https://www.linkedin.com/in/adébayo-dassoundo-a9323a2a3/)  
💻 [GitHub](https://github.com/DASSOUNDO)








## xdg-open index.html
