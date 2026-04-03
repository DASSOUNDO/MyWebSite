document.addEventListener('DOMContentLoaded', function () {
    // Navigation mobile
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scroll pour les liens de navigation
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

    // Projets dépliables
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

    // Recherche dépliable (même logique que les projets)
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

    // Animation au scroll
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

    // Navigation active
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

    // Boutons de téléchargement
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


    document.querySelector('.download-btn[data-type="cv"]').addEventListener('click', function (e) {
        e.preventDefault();

        // Configuration de tes documents
        const cvList = [
            { label: "CV_Adébayo_DASSOUNDO-recherche", file: "CV_Adébayo_DASSOUNDO.pdf" },
            { label: "CV_Adébayo_DASSOUNDO-Master2-IA", file: "CV_Adébayo_DASSOUNDO-Master2-IA.pdf" },
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
    });






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
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 10px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
    `;

        // Ajout des liens dans le menu
        docs.forEach(doc => {
            const item = document.createElement('a');
            item.href = `Recommendation/${doc.file}`;
            item.download = doc.file;
            item.textContent = doc.name;
            item.style.cssText = `
            color: #333;
            text-decoration: none;
            padding: 8px 15px;
            border-radius: 4px;
            transition: background 0.2s;
            font-size: 14px;
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

    // Animation au chargement
    window.addEventListener('load', function () {
        document.body.classList.add('loaded');
    });

    // Traductions
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

    // Langue courante - changée par défaut en Français
    let currentLang = 'fr';

    // Fonction pour initialiser la langue
    function initializeLanguage() {
        const savedLang = localStorage.getItem('preferred-language');
        const browserLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
        const initialLang = savedLang || 'fr'; // Défaut renforcé en Français

        if (initialLang !== currentLang) {
            changeLanguage(initialLang);
        }
    }

    // Fonction pour changer la langue
    function changeLanguage(newLang) {
        if (!translations[newLang]) return;

        console.log(`Changement de langue vers: ${newLang}`);

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

            console.log(`Langue changée vers: ${currentLang}`);

            // Relancer l'animation Typed si elle existe
            if (typeof initTyped === 'function') initTyped(currentLang);
        }, 150);
    }

    // Gestionnaire de changement de langue - amélioré
    const langButtons = document.querySelectorAll('.lang-btn');

    console.log('Boutons de langue trouvés:', langButtons.length);

    langButtons.forEach((button, index) => {
        console.log(`Bouton ${index}:`, button.getAttribute('data-lang-code'));

        button.addEventListener('click', function (e) {
            e.preventDefault();
            const newLang = this.getAttribute('data-lang-code');
            console.log(`Clic sur bouton langue: ${newLang}, langue actuelle: ${currentLang}`);

            if (newLang && newLang !== currentLang) {
                changeLanguage(newLang);
            }
        });
    });

    // Initialiser la langue après le chargement
    initializeLanguage();

    // Initialisation Typed.js
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

    // --- Animation IA/Tech (Custom Canvas) ---
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
        }, { duration: 500, fill: "forwards" });
    });

    // Hover effect on links for custom cursor
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .research-card, .hover-target');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '50px';
            cursorOutline.style.height = '50px';
            cursorOutline.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '30px';
            cursorOutline.style.height = '30px';
            cursorOutline.style.backgroundColor = 'transparent';
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
            scrollProgress.style.width = `${scrolled}%`;
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

});

// Fonction pour obtenir la langue courante
function getCurrentLanguage() {
    return currentLang;
}

// Export pour utilisation externe
window.changeLanguage = changeLanguage;
window.getCurrentLanguage = getCurrentLanguage;

// ============================================
// CHATBOT WIDGET LOGIC (Rule-based JS Bot)
// ============================================

(function () {
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const chatClose = document.getElementById('chatbot-close');
    const chatInput = document.getElementById('chat-input');
    const chatSubmit = document.getElementById('chat-submit');
    const chatMessages = document.getElementById('chatbot-messages');

    if (!chatToggle || !chatWindow) return;

    chatToggle.addEventListener('click', function () {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) chatInput.focus();
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
            return "Vous pouvez télécharger le CV PDF dans la section Accueil ! 📄";
        if (text.includes('école') || text.includes('eseo') || text.includes('parcours') || text.includes('etude'))
            return "Adébayo est étudiant ingénieur à l'ESEO Angers (2023-2026), spécialisé en Systèmes Embarqués, IA et Cybersécurité. 🎓";
        if (text.includes('compétence') || text.includes('skills') || text.includes('technos'))
            return "Compétences clés :<br>💻 Python, C, C++, Rust<br>🧠 PyTorch, TensorFlow, Edge AI<br>⚙️ ROS2, RTOS, IoT<br>🔐 Wireshark, Cybersécurité";
        if (text.includes('projet') || text.includes('portfolio'))
            return "Projets phares :<br>🚁 Drone Surveillance (ROS2)<br>✈️ Simulateur de Vol IA<br>🤖 LLM sur microcontrôleur<br>Consultez la section Projets !";
        if (text.includes('contact') || text.includes('mail') || text.includes('linkedin') || text.includes('joindre'))
            return "Contactez Adébayo via <strong>adebayo.dassoundo@reseau.eseo.fr</strong> ou sur LinkedIn (lien dans le footer). ✉️";
        if (text.includes('bonjour') || text.includes('salut') || text.includes('hello'))
            return "Bonjour ! Comment puis-je vous aider ? Posez des questions sur son parcours, ses compétences ou ses projets 😊";
        if (text.includes('ia') || text.includes('intelligence artificielle'))
            return "Adébayo est passionné par l'Edge AI : il entraîne des modèles PyTorch/TF pour MCU très contraints. 🤖";
        if (text.includes('embarqué') || text.includes('embedded'))
            return "L'embarqué est son cœur de métier : Bare-Metal, RTOS, C/Rust, architectures proches du hardware. 🔧";
        if (text.includes('qui') && (text.includes('tu') || text.includes('es')))
            return "Je suis l'assistant virtuel d'Adébayo ! Je tourne en pur JavaScript, bientôt connecté à une vraie IA 😉";
        return "Bonne question ! Explorez le site ou contactez Adébayo directement pour plus d'infos !";
    }

    function processMessage() {
        const text = chatInput.value.trim();
        if (!text) return;
        addUserMessage(text);
        chatInput.value = '';
        showTyping();
        setTimeout(function () {
            removeTyping();
            addBotMessage(getBotResponse(text));
        }, 900 + Math.random() * 600);
    }

    chatSubmit.addEventListener('click', processMessage);
    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') processMessage();
    });
})();

// Pour mon gif animé
