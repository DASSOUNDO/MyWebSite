/**
 * =============================================================
 *  script.js — Logique interactive du portfolio
 * =============================================================
 *  Auteur      : Adébayo DASSOUNDO
 *  Projet      : Portfolio personnel (systèmes embarqués, IA, Cyber)
 *  Dépendances : Typed.js (v2.0.12), FontAwesome
 *  Description : Ce fichier gère toutes les interactions de la page :
 *                navigation, animations, téléchargements, traduction,
 *                animation Canvas IA/Tech, chatbot assistant.
 * =============================================================
 */

/* ============================================================
   BLOC PRINCIPAL — Exécuté après le chargement complet du DOM
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    // ──────────────────────────────────────────────────────
    // SECTION 1 : NAVIGATION MOBILE (menu hamburger)
    // ──────────────────────────────────────────────────────
    // Au clic sur le bouton hamburger, on bascule les classes .active
    // sur le menu et le bouton pour déclencher les animations CSS.
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // ──────────────────────────────────────────────────────
    // SECTION 2 : SMOOTH SCROLL (défilement fluide)
    // ──────────────────────────────────────────────────────
    // Tous les liens commençant par '#' scrollent vers la section ciblée
    // de manière fluide (behavior: 'smooth'). Le menu mobile est
    // automatiquement refermé après la navigation.
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Fermer le menu mobile si ouvert
                if (navMenu) navMenu.classList.remove('active');
                if (hamburger) hamburger.classList.remove('active');
            }
        });
    });

    // ──────────────────────────────────────────────────────
    // SECTION 3 : PROJETS DÉPLIABLES (pattern accordion)
    // ──────────────────────────────────────────────────────
    // Chaque carte projet peut être ouverte (toggle .active).
    // Cliquer sur une carte ferme automatiquement toutes les autres
    // (comportement accordion : une seule carte ouverte à la fois).
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const header = card.querySelector('.project-header');

        if (header) {
            header.addEventListener('click', function () {
                // Fermer tous les autres projets
                projectCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('active');
                    }
                });

                // Toggle le projet actuel
                card.classList.toggle('active');
            });
        }
    });

    // ──────────────────────────────────────────────────────
    // SECTION 4 : RECHERCHES DÉPLIABLES (même pattern)
    // ──────────────────────────────────────────────────────
    // Identique aux projets : cliquer sur un axe de recherche
    // l'ouvre et ferme les autres.
    const researchCards = document.querySelectorAll('.research-card');

    researchCards.forEach(card => {
        const header = card.querySelector('.research-header');

        if (header) {
            header.addEventListener('click', function () {
                // Fermer toutes les autres recherches
                researchCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('active');
                    }
                });

                // Toggle la recherche actuelle
                card.classList.toggle('active');
            });
        }
    });

    // ──────────────────────────────────────────────────────
    // SECTION 5 : ANIMATIONS AU SCROLL (IntersectionObserver)
    // ──────────────────────────────────────────────────────
    // L'IntersectionObserver surveille la visibilité des éléments.
    // Quand un élément entre dans le viewport (+ 10% visible),
    // on lui ajoute la classe .fade-in pour déclencher l'animation CSS.
    // Seuil (threshold) : 0.1 = au moins 10% de l'élément doit être visible.
    // rootMargin : décale de -50px en bas pour un effet de révélation légèrement anticipé.
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');

                // Animation spéciale pour les éléments de timeline
                if (entry.target.classList.contains('timeline-item')) {
                    entry.target.classList.add('animate');
                }

                // Animation pour les highlights
                if (entry.target.classList.contains('highlight-item')) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 200);
                }
            }
        });
    }, observerOptions);

    // Observer les éléments à animer
    document.querySelectorAll('.skill-category, .overview-card, .tech-category, .company-item, .project-card, .research-card, .contact-item, .timeline-item, .highlight-item, .education-card').forEach(el => {
        observer.observe(el);

        // Préparer les highlight-items pour l'animation
        if (el.classList.contains('highlight-item')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
        }
    });

    // Animation en cascade pour les catégories tech
    const techObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const techCategories = document.querySelectorAll('.tech-category');
                techCategories.forEach((category, index) => {
                    setTimeout(() => {
                        category.classList.add('fade-in');
                    }, index * 100);
                });
                techObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    const skillsSection = document.querySelector('.skills');
    if (skillsSection) {
        techObserver.observe(skillsSection);
    }

    // ──────────────────────────────────────────────────────
    // SECTION 6 : NAVIGATION ACTIVE (lien surligné au scroll)
    // ──────────────────────────────────────────────────────
    // À chaque événement scroll, on détermine quelle section est
    // actuellement visible à l'écran, puis on met à jour le lien
    // de navigation correspondant avec la classe .active.
    // On affiche aussi la photo de profil dans la navbar quand
    // l'utilisateur quitte la section Accueil.
    window.addEventListener('scroll', function () {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const navProfileImg = document.querySelector('.nav-profile-img');

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        // Afficher/masquer la photo selon la section
        if (current === 'competences' || current === 'projets' || current === 'recherche' || current === 'education' || current === 'contact') {
            navProfileImg.classList.add('show');
        } else {
            navProfileImg.classList.remove('show');
        }
    });

    // ──────────────────────────────────────────────────────
    // SECTION 7 : TÉLÉCHARGEMENTS (CV, Recommandation, etc.)
    // ──────────────────────────────────────────────────────
    // Les boutons .download-btn portent un attribut data-type
    // qui indique le type de fichier. Chaque clic déclenche :
    //   1. Un effet visuel d'attente sur le bouton (spinner)
    //   2. Un délai simulé de 1 seconde
    //   3. Le téléchargement réel du fichier PDF
    //   4. Un retour visuel de succès pendant 2 secondes
    const downloadButtons = document.querySelectorAll('.download-btn');

    downloadButtons.forEach(button => {
        button.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            handleDownload(type);
        });
    });

    function handleDownload(type) {
        // Effet visuel du bouton
        const button = document.querySelector(`[data-type="${type}"]`);
        const originalText = button.innerHTML;

        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Téléchargement...';
        button.disabled = true;

        // Simulation du téléchargement
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-check"></i> Téléchargé !';

            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);

            // Logique de téléchargement selon le type
            switch (type) {
                case 'cv':
                    downloadCV();
                    break;
                case 'recommandations':
                    downloadRecommendation();
                    break;
                case 'competences':
                    downloadCompetences();
                    break;
                case 'projets':
                    downloadProjets();
                    break;

            }
        }, 1000);
    }


    // ──────────────────────────────────────────────────────
    // SECTION 8 : SÉLECTEUR DE CV (menu modal de choix)
    // ──────────────────────────────────────────────────────
    // Le bouton CV ouvre une mini-fenêtre modale permettant de
    // choisir quelle version du CV télécharger (recherche, master, etc.).
    // La fenêtre est générée dynamiquement en JavaScript.
    function downloadCV() {
        //const cvList = [
            //c{ label: "CV_Adébayo_DASSOUNDO-recherche", file: "CV_Adébayo_DASSOUNDO.pdf" },
           //c { label: "CV_Adébayo_DASSOUNDO-Master2-IA", file: "CV_Adébayo_DASSOUNDO-Master2-IA.pdf" },
        //c];

        // Configuration de tes documents
        const cvList = [
            { label: "CV_Sergio", file: "CV_Sergio.pdf" },
            { label: "CV_détailler_Sergio", file: "CV_détailler_Sergio.pdf" },
        ];

        // On crée dynamiquement une petite fenêtre de choix
        let menuHtml = `
            <div id="cv-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;">
                <div style="background:white; padding:20px; border-radius:10px; min-width:250px; text-align:center;">
                    <h3 style="margin-bottom:15px; color:#333;">Choisir une version</h3>
                    ${cvList.map((cv, index) => `
                        <button class="btn-select-cv" data-file="${cv.file}" style="display:block; width:100%; margin:10px 0; padding:10px; cursor:pointer; border:1px solid #ddd; border-radius:5px; background:#f9f9f9;">
                            ${cv.label}
                        </button>
                    `).join('')}
                    <button id="close-cv-modal" style="margin-top:10px; background:none; border:none; color:red; cursor:pointer;">Annuler</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', menuHtml);

        // Gestion du clic sur une option
        document.querySelectorAll('.btn-select-cv').forEach(btn => {
            btn.addEventListener('click', function () {
                const fileName = this.getAttribute('data-file');
                const link = document.createElement('a');
                link.href = `cv/${fileName}`;
                link.download = fileName;
                link.click();
                document.getElementById('cv-modal').remove();
            });
        });

        // Fermer la modale
        document.getElementById('close-cv-modal').onclick = () => document.getElementById('cv-modal').remove();
    }







    /* function downloadCV() {
         try {
             // Télécharger le fichier PDF directement
             const link = document.createElement('a');
             link.href = 'cv/CV_Adébayo_DASSOUNDO.pdf'; // Changé de 'documents/' à 'resume/'
             link.download = 'CV_Adébayo_DASSOUNDO.pdf';
             link.target = '_blank'; // Ouvre dans un nouvel onglet si le téléchargement échoue
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
         } catch (error) {
             console.error('Erreur lors du téléchargement du CV:', error);
             // Fallback: essayer d'ouvrir le fichier dans un nouvel onglet
             window.open('cv/CV_Adébayo_DASSOUNDO.pdf', '_blank');
         }
     }*/



    document.querySelector('.download-btn[data-type="Recommendation"]').addEventListener('click', function (e) {
        const btn = e.currentTarget;

        // Si le menu existe déjà, on le ferme
        if (document.getElementById('reco-menu')) {
            document.getElementById('reco-menu').remove();
            return;
        }

        // Liste de tes documents (ajoute autant que tu veux ici)
        const docs = [
            { name: "Recommendation-1_Adébayo_DASSOUNDO", file: "Recommendation-1_Adébayo_DASSOUNDO.pdf" },
            { name: "Recommendation-2_Adébayo_DASSOUNDO", file: "Recommendation-2_Adébayo_DASSOUNDO.pdf" },
        ];

        // Création du menu
        const menu = document.createElement('div');
        menu.id = 'reco-menu';
        menu.style.cssText = `
                position: absolute;
                background: #ffffff;
                border: 1px solid #ddd;
                border - radius: 8px;
                box - shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 10px;
                z - index: 1000;
                display: flex;
                flex - direction: column;
                gap: 8px;
                margin - top: 10px;
                `;

        // Ajout des liens dans le menu
        docs.forEach(doc => {
            const item = document.createElement('a');
            item.href = `Recommendation / ${doc.file} `;
            item.download = doc.file;
            item.textContent = doc.name;
            item.style.cssText = `
                color: #333;
                text - decoration: none;
                padding: 8px 15px;
                border - radius: 4px;
                transition: background 0.2s;
                font - size: 14px;
                border: 1px solid #eee;
                `;
            item.onmouseover = () => item.style.background = '#f5f5f5';
            item.onmouseout = () => item.style.background = 'transparent';

            menu.appendChild(item);
        });

        // Positionnement du menu par rapport au bouton
        btn.parentElement.style.position = 'relative';
        btn.parentElement.appendChild(menu);

        // Fermer le menu si on clique ailleurs
        setTimeout(() => {
            window.onclick = (event) => {
                if (!menu.contains(event.target) && event.target !== btn) {
                    menu.remove();
                    window.onclick = null;
                }
            };
        }, 100);
    });



    /*function downloadRecommendation() {
        try {
                // Télécharger le fichier PDF directement
                const link = document.createElement('a');
                link.href = 'recommendation/Recommendation_Adébayo_DASSOUNDO.pdf'; // Changé de 'documents/' à 'resume/'
                link.download = 'Recommendation_Adébayo_DASSOUNDO.pdf';
                link.target = '_blank'; // Ouvre dans un nouvel onglet si le téléchargement échoue
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Erreur lors du téléchargement de la recommendation:', error);
                // Fallback: essayer d'ouvrir le fichier dans un nouvel onglet
                window.open('recommendation/Recommendation_Adébayo_DASSOUNDO.pdf', '_blank');
            }
    }*/


    function downloadCompetences() {
        try {
            // Télécharger le fichier PDF directement
            const link = document.createElement('a');
            link.href = 'documents/Adébayo_DASSOUNDO_Competences.pdf';
            link.download = 'Adébayo_DASSOUNDO_Competences.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Erreur lors du téléchargement des compétences:', error);
            alert('Erreur lors du téléchargement du dossier de compétences. Veuillez réessayer.');
        }
    }

    // ──────────────────────────────────────────────────────
    // SECTION 9 : CHARGEMENT DE LA PAGE
    // ──────────────────────────────────────────────────────
    // Au chargement complet des ressources (images, scripts...),
    // on ajoute la classe .loaded au body pour déclencher
    // les animations d'entrée de page via CSS.
    window.addEventListener('load', function () {
        document.body.classList.add('loaded');
    });

    // ──────────────────────────────────────────────────────
    // SECTION 10 : SYSTÈME DE TRADUCTIONS (FR / EN)
    // ──────────────────────────────────────────────────────
    // L'objet 'translations' contient deux sous-objets (fr, en).
    // Chaque clé correspond à un attribut data-lang="clé" dans le HTML.
    // changeLanguage(lang) met à jour tous les textes du site
    // et sauvegarde la préférence dans localStorage.
    //
    // Langue par défaut : Français ('fr'), sauf si une préférence
    // a déjà été sauvegardée dans le navigateur.
    // ──────────────────────────────────────────────────────

    // Dictionnaire de traductions complet
    const translations = {
        fr: {
            'nav-home': 'Accueil',
            'nav-skills': 'Compétences',
            'nav-projects': 'Projets',
            'nav-research': 'Recherche',
            'nav-education': 'Formation',
            'nav-contact': 'Contact',
            'hero-title': 'Logiciel Embarqué, Cybersécurité et IA.',
            'hero-description': 'Ingénieur et chercheur alliant compétences académiques et industrielles en logiciel embarqué, cybersécurité, intelligence artificielle, développement logiciel et innovation technologique.',
            'btn-download-cv': 'Télécharger CV (PDF)',
            'btn-download-Recommendation': 'Recommendation (PDF)',
            'btn-download-skills': 'Dossier Compétences (PDF)',
            'btn-location': '🇫🇷 France & 🇨🇦 Canada',
            'skills-title': 'Mes Compétences',
            'main-skills': 'Grandes Compétences',
            'certifications': 'Certifications (6)',
            'programming-languages': 'Langages de programmation principaux',
            'experience-title': 'Expérience Professionnelle',
            'projects-title': 'Mes Projets',
            'research-title': 'Mes Axes de Recherche',
            'education-title': 'Formation',
            'contact-title': 'Contact'
        },
        en: {
            'nav-home': 'Home',
            'nav-skills': 'Skills',
            'nav-projects': 'Projects',
            'nav-research': 'Research',
            'nav-education': 'Education',
            'nav-contact': 'Contact',
            'hero-title': 'Embedded Software, Cybersecurity, and AI.',
            'hero-description': 'Engineer and researcher combining academic and industrial expertise in embedded software, cybersecurity, artificial intelligence, software development, and technological innovation.',
            'btn-download-cv': 'Download CV (PDF)',
            'btn-download-recommendation': 'Recommandation (PDF)',
            'btn-download-skills': 'Skills Portfolio (PDF)',
            'btn-location': '🇫🇷 France & 🇨🇦 Canada',
            'skills-title': 'My Skills',
            'main-skills': 'Core Skills',
            'certifications': 'Certifications (6)',
            'programming-languages': 'Main Programming Languages',
            'experience-title': 'Professional Experience',
            'projects-title': 'My Projects',
            'research-title': 'My Research Areas',
            'education-title': 'Education',
            'contact-title': 'Contact'
        }
    };
    // Langue active (modifiée par changeLanguage)
    let currentLang = 'fr';

    /**
     * initializeLanguage()
     * Lit la langue sauvegardée dans localStorage et applique la langue initiale.
     * Si aucune préférence n'existe, la langue par défaut est le Français.
     */
    function initializeLanguage() {
        const savedLang = localStorage.getItem('preferred-language');
        const browserLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
        const initialLang = savedLang || 'fr'; // Défaut renforcé en Français

        if (initialLang !== currentLang) {
            changeLanguage(initialLang);
        }
    }

    /**
     * changeLanguage(newLang)
     * Applique dynamiquement la langue choisie :
     *   1. Ajoute une classe CSS transitoire pour une animation de fondu
     *   2. Met à jour tous les éléments [data-lang] avec les textes traduits
     *   3. Marque visuellement le bouton de langue actif
     *   4. Sauvegarde la préférence dans localStorage
     *   5. Relance Typed.js si nécessaire
     * @param {string} newLang - Code de langue ('fr' ou 'en')
     */
    function changeLanguage(newLang) {
        if (!translations[newLang]) return;

        console.log(`Changement de langue vers: ${newLang} `);

        // Animation de transition
        document.body.classList.add('lang-switching');

        setTimeout(() => {
            currentLang = newLang;

            // Mettre à jour tous les éléments avec data-lang
            document.querySelectorAll('[data-lang]').forEach(element => {
                const key = element.getAttribute('data-lang');
                if (translations[currentLang][key]) {
                    element.textContent = translations[currentLang][key];
                }
            });

            // Mettre à jour les boutons de langue
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-lang-code') === currentLang) {
                    btn.classList.add('active');
                }
            });

            // Sauvegarder la préférence
            localStorage.setItem('preferred-language', currentLang);

            // Mettre à jour l'attribut lang du document
            document.documentElement.lang = currentLang;

            // Animation de fin
            document.body.classList.remove('lang-switching');
            document.body.classList.add('lang-switched');

            setTimeout(() => {
                document.body.classList.remove('lang-switched');
            }, 500);

            console.log(`Langue changée vers: ${currentLang} `);

            // Relancer l'animation Typed si elle existe
            if (typeof initTyped === 'function') initTyped(currentLang);
        }, 150);
    }

    // ──────────────────────────────────────────────────────
    // SECTION 11 : GESTION DES BOUTONS DE LANGUE
    // ──────────────────────────────────────────────────────
    // Les boutons .lang-btn portent un attribut data-lang-code
    // ('fr' ou 'en'). Au clic, si la langue choisie est différente
    // de la langue courante, on appelle changeLanguage().
    const langButtons = document.querySelectorAll('.lang-btn');

    console.log('Boutons de langue trouvés:', langButtons.length);

    langButtons.forEach((button, index) => {
        console.log(`Bouton ${index}: `, button.getAttribute('data-lang-code'));

        button.addEventListener('click', function (e) {
            e.preventDefault();
            const newLang = this.getAttribute('data-lang-code');
            console.log(`Clic sur bouton langue: ${newLang}, langue actuelle: ${currentLang} `);

            if (newLang && newLang !== currentLang) {
                changeLanguage(newLang);
            }
        });
    });

    // Initialiser la langue après le chargement
    initializeLanguage();

    // ──────────────────────────────────────────────────────
    // SECTION 12 : TYPED.JS (animation "machine à écrire")
    // ──────────────────────────────────────────────────────
    // initTyped() crée ou recrée l'animation de texte dans .typed-text.
    // Elle est appelée au chargement ET à chaque changement de langue
    // pour que le texte animé soit dans la bonne langue.
    // Paramètres : typeSpeed (vitesse d'écriture), backSpeed (effacement)
    window.initTyped = function (lang) {
        if (window.typed) window.typed.destroy();
        const textToType = translations[lang] && translations[lang]['hero-title'] ? translations[lang]['hero-title'] : 'Logiciel Embarqué, Cybersécurité et IA.';
        window.typed = new Typed('.typed-text', {
            strings: [textToType],
            typeSpeed: 50,
            backSpeed: 30,
            showCursor: true,
            cursorChar: '|',
            loop: false
        });
    }
    initTyped(currentLang);

    // ────────────────────────────────────────────────────────────────
    // SECTION 13 : ANIMATION CANVAS IA/TECH (réseau de particules)
    // ────────────────────────────────────────────────────────────────
    // Un élément <canvas> est créé et injecté dans le div #particles-js
    // qui sert de fond à la section Hero.
    //
    // FONCTIONNEMENT :
    //   1. Les nœuds (symboles IA/tech) flottent aléatoirement
    //   2. Chaque frame, les positions sont mises à jour
    //   3. Les nœuds proches (<180px) sont reliés par des traits
    //   4. La souris attire les nœuds proches (rayon 220px)
    //   5. Un clic repousse les nœuds dans toutes les directions
    // ────────────────────────────────────────────────────────────────
    const canvas = document.createElement('canvas');
    canvas.id = 'tech-canvas';
    Object.assign(canvas.style, {
        position: 'absolute', top: '0', left: '0',
        width: '100%', height: '100%', zIndex: '0', pointerEvents: 'all'
    });
    const particlesContainer = document.getElementById('particles-js');
    if (particlesContainer) {
        particlesContainer.innerHTML = '';
        particlesContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // AI / New tech themed symbols only
        const SYMBOLS = [
            'AI', 'ML', 'GPT', 'LLM', 'NLP',
            'IA', 'AGI', 'ANN', 'CNN', 'GAN',
            'CUDA', 'IoT', 'ROS2', 'ARM',
            'λ', '∑', '∂', '∇', 'σ',
            '</>', '{}', '01', '0x1F',
            '⚙', '📡', '🔬', '🧠', '⚡'
        ];

        const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#a78bfa'];

        let nodes = [];
        let mouse = { x: -9999, y: -9999 };

        function resize() {
            canvas.width = particlesContainer.offsetWidth;
            canvas.height = particlesContainer.offsetHeight;
        }

        function createNodes(count) {
            nodes = [];
            for (let i = 0; i < count; i++) {
                const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                const isShort = symbol.length <= 2;
                nodes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5,
                    symbol,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    fontSize: isShort ? (14 + Math.random() * 8) : (10 + Math.random() * 6),
                    alpha: 0.25 + Math.random() * 0.5,
                    alphaDir: Math.random() > 0.5 ? 1 : -1,
                    alphaSpeed: 0.005 + Math.random() * 0.008,
                    scale: 1,
                    scaleDir: Math.random() > 0.5 ? 1 : -1,
                    scaleSpeed: 0.004 + Math.random() * 0.004
                });
            }
        }

        function drawLines() {
            const LINK_DIST = 180;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < LINK_DIST) {
                        const opacity = (1 - dist / LINK_DIST) * 0.45;
                        ctx.save();
                        ctx.globalAlpha = opacity;
                        ctx.strokeStyle = nodes[i].color;
                        ctx.lineWidth = 0.8;
                        ctx.shadowColor = nodes[i].color;
                        ctx.shadowBlur = 5;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }
        }

        function drawNode(n) {
            const size = n.fontSize * n.scale;
            ctx.save();
            ctx.globalAlpha = n.alpha;
            ctx.fillStyle = n.color;
            ctx.font = `bold ${size}px 'Inter', monospace`;
            ctx.shadowColor = n.color;
            ctx.shadowBlur = 10;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(n.symbol, n.x, n.y);
            ctx.restore();
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawLines();

            for (const n of nodes) {
                // Pulse alpha
                n.alpha += n.alphaDir * n.alphaSpeed;
                if (n.alpha > 0.8 || n.alpha < 0.15) n.alphaDir *= -1;

                // Pulse scale
                n.scale += n.scaleDir * n.scaleSpeed;
                if (n.scale > 1.2 || n.scale < 0.85) n.scaleDir *= -1;

                // Mouse attraction
                const dx = mouse.x - n.x;
                const dy = mouse.y - n.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                if (dist < 220) {
                    n.vx += (dx / dist) * 0.08;
                    n.vy += (dy / dist) * 0.08;
                }

                n.vx *= 0.985;
                n.vy *= 0.985;

                const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
                if (spd > 2.5) { n.vx = n.vx / spd * 2.5; n.vy = n.vy / spd * 2.5; }

                n.x += n.vx;
                n.y += n.vy;

                if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

                drawNode(n);
            }
            requestAnimationFrame(animate);
        }

        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

        canvas.addEventListener('click', e => {
            const rect = canvas.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;
            for (const n of nodes) {
                const dx = n.x - cx;
                const dy = n.y - cy;
                const d = Math.sqrt(dx * dx + dy * dy) || 1;
                if (d < 250) {
                    n.vx -= (dx / d) * (10 * (1 - d / 250));
                    n.vy -= (dy / d) * (10 * (1 - d / 250));
                }
            }
        });

        resize();
        createNodes(95);
        animate();
        window.addEventListener('resize', () => { resize(); createNodes(95); });
    }


    // Company logo click effects
    const companyLogos = document.querySelectorAll('.company-logo');

    companyLogos.forEach(logo => {
        logo.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all logos
            companyLogos.forEach(otherLogo => {
                otherLogo.classList.remove('logo-clicked');
            });

            // Add active class to clicked logo
            this.classList.add('logo-clicked');

            // Remove the class after animation
            setTimeout(() => {
                this.classList.remove('logo-clicked');
            }, 3000);
        });

        // Add hover effect enhancement
        logo.addEventListener('mouseenter', function () {
            this.style.zIndex = '20';
        });

        logo.addEventListener('mouseleave', function () {
            if (!this.classList.contains('logo-clicked')) {
                this.style.zIndex = '1';
            }
        });
    });
    // --- Nouvelles features interactives ---

    // Custom Cursor
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');

    window.addEventListener('mousemove', function (e) {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Animation de l'outline (avec petit délai ou direct)
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 150, fill: "forwards" });
    });

    // Hover effect on links for custom cursor
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .research-card, .hover-target');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '60px';
            cursorOutline.style.height = '60px';
            cursorOutline.style.backgroundColor = 'rgba(56, 189, 248, 0.4)';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '36px';
            cursorOutline.style.height = '36px';
            cursorOutline.style.backgroundColor = 'rgba(56, 189, 248, 0.2)';
        });
    });

    // Scroll progress bar
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        // Calculer la progression
        const scrollPx = document.documentElement.scrollTop;
        const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollPx / winHeightPx) * 100;

        if (scrollProgress) {
            scrollProgress.style.width = `${scrolled}% `;
        }

        // Afficher/Cacher le bouton Back To Top
        if (backToTopBtn) {
            if (scrollPx > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    });

    // Bouton retour en haut
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* ============================================================
       FONCTIONS GLOBALES
       Accessibles depuis la console et depuis index.html
       ============================================================ */

    /** Retourne le code de la langue actuellement active ('fr' ou 'en') */
    function getCurrentLanguage() {
        return currentLang;
    }

    // Export pour utilisation externe
    window.changeLanguage = changeLanguage;
    window.getCurrentLanguage = getCurrentLanguage;

});


/* ============================================================
   SECTION 14 : CHATBOT WIDGET (assistant IA pré-programmé)
   ============================================================
   Ce bloc est une IIFE (fonction auto-exécutante) placée
   en dehors du DOMContentLoaded car les scripts sont chargés
   APRÈS le HTML du widget dans index.html. Les éléments
   #chatbot-toggle, #chatbot-window etc. existent donc déjà
   quand ce code s'exécute.

   LOGIQUE DE RÉPONSE :
   La fonction getReply() applique des correspondances de mots-clés
   (text.includes) sur la question de l'utilisateur pour retourner
   une réponse pré-définie. Ce n'est PAS une vraie IA générative.
   Pour connecter à OpenAI/Gemini, voir ARCHITECTURE.md.
   ============================================================ */

(function () {
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const chatClose = document.getElementById('chatbot-close');
    const chatInput = document.getElementById('chat-input');
    const chatSubmit = document.getElementById('chat-submit');
    const chatMessages = document.getElementById('chatbot-messages');
    const quickReplies = document.querySelectorAll('.quick-reply-btn');

    if (!chatToggle || !chatWindow) return;

    chatToggle.addEventListener('click', function () {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    chatClose.addEventListener('click', function () {
        chatWindow.classList.add('hidden');
    });

    function scrollToBottom() { chatMessages.scrollTop = chatMessages.scrollHeight; }

    function addUserMessage(text) {
        const d = document.createElement('div');
        d.className = 'message user-message';
        d.textContent = text;
        chatMessages.appendChild(d);
        scrollToBottom();
    }

    function addBotMessage(html) {
        const d = document.createElement('div');
        d.className = 'message bot-message';
        d.innerHTML = html;
        chatMessages.appendChild(d);
        scrollToBottom();
    }

    function showTyping() {
        const t = document.createElement('div');
        t.className = 'typing-indicator';
        t.id = 'typing-indicator';
        t.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chatMessages.appendChild(t);
        scrollToBottom();
    }

    function removeTyping() {
        const t = document.getElementById('typing-indicator');
        if (t) t.remove();
    }

    function getBotResponse(input) {
        const text = input.toLowerCase();
        if (text.includes('cv') || text.includes('télécharger'))
            return "Vous pouvez télécharger le CV PDF dans la section Accueil ! 📄<br><a href='#accueil' style='color:#38bdf8;text-decoration:underline;'>Aller à l'accueil</a>";
        if (text.includes('école') || text.includes('eseo') || text.includes('parcours') || text.includes('etude') || text.includes('formation'))
            return "Adébayo est étudiant ingénieur à l'ESEO Angers (2023-2026), spécialisé en Systèmes Embarqués, IA et Cybersécurité. 🎓<br><a href='#education' style='color:#38bdf8;text-decoration:underline;'>Voir la formation</a>";
        if (text.includes('compétence') || text.includes('skills') || text.includes('technos'))
            return "Compétences clés :<br>💻 Python, C, C++, Rust<br>🧠 PyTorch, TensorFlow, Edge AI<br>⚙️ ROS2, RTOS, IoT<br>🔐 Wireshark, Cybersécurité<br><a href='#competences' style='color:#38bdf8;text-decoration:underline;'>Voir tout</a>";
        if (text.includes('projet') || text.includes('portfolio') || text.includes('projets'))
            return "Projets phares :<br>🚁 Drone Surveillance (ROS2)<br>✈️ Simulateur de Vol IA<br>🤖 LLM sur microcontrôleur<br><a href='#projets' style='color:#38bdf8;text-decoration:underline;'>Consulter les projets</a>";
        if (text.includes('contact') || text.includes('mail') || text.includes('linkedin') || text.includes('joindre'))
            return "Contactez Adébayo via <strong>adebayo.dassoundo@reseau.eseo.fr</strong> ou sur LinkedIn (lien dans le footer). ✉️<br><a href='#contact' style='color:#38bdf8;text-decoration:underline;'>Aller au contact</a>";
        if (text.includes('bonjour') || text.includes('salut') || text.includes('hello'))
            return "Bonjour ! Comment puis-je vous aider ? Posez des questions sur son parcours, ses compétences ou ses projets 😊";
        if (text.includes('ia') || text.includes('intelligence artificielle'))
            return "Adébayo est passionné par l'Edge AI : il entraîne des modèles PyTorch/TF pour MCU très contraints. 🤖";
        if (text.includes('embarqué') || text.includes('embedded'))
            return "L'embarqué est son cœur de métier : Bare-Metal, RTOS, C/Rust, architectures proches du hardware. 🔧";
        if (text.includes('qui') && (text.includes('tu') || text.includes('es')))
            return "Je suis l'assistant virtuel d'Adébayo ! Je suis là pour vous guider sur son portfolio 😉";
        return "Bonne question ! Explorez le site ou contactez Adébayo directement pour plus d'infos !";
    }

    async function processMessage(textOverride) {
        let text = "";
        if (typeof textOverride === 'string' && textOverride.trim() !== '') {
            text = textOverride;
        } else {
            text = chatInput.value.trim();
        }

        if (!text) return;

        addUserMessage(text);
        if (typeof textOverride !== 'string') chatInput.value = '';

        // Remove quick replies when user starts chatting to save space
        const qrContainer = document.getElementById('quick-replies');
        if (qrContainer) qrContainer.style.display = 'none';

        showTyping();

        try {
            // Tente de contacter le backend Python (LLM API)
            const response = await fetch('http://127.0.0.1:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (response.ok) {
                const data = await response.json();
                removeTyping();
                addBotMessage(data.reply);
                return;
            }
        } catch (error) {
            console.log("Le backend Python n'est pas actif. Utilisation des réponses de base locales (fallback).");
        }

        setTimeout(function () {
            removeTyping();
            addBotMessage(getBotResponse(text));
        }, 900 + Math.random() * 600);
    }

    chatSubmit.addEventListener('click', processMessage);
    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') processMessage();
    });

    quickReplies.forEach(btn => {
        btn.addEventListener('click', function () {
            const query = this.getAttribute('data-query');
            processMessage(query);
        });
    });
})();

// Pour mon gif animé
