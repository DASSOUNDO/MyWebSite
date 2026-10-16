document.addEventListener('DOMContentLoaded', function() {
    // Navigation mobile
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
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
            header.addEventListener('click', function() {
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
            header.addEventListener('click', function() {
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

    const observer = new IntersectionObserver(function(entries) {
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
    const techObserver = new IntersectionObserver(function(entries) {
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
    window.addEventListener('scroll', function() {
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
        if (current === 'axes' || current === 'competences' || current === 'projets' || current === 'recherche' || current === 'education' || current === 'contact') {
            navProfileImg.classList.add('show');
        } else {
            navProfileImg.classList.remove('show');
        }
    });

    // Boutons de téléchargement
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
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
            switch(type) {
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


    function downloadCV() {
        // CV académique dans la langue affichée
        const file = currentLang === 'en' ? 'CV_These_DASSOUNDO_EN.pdf' : 'CV_These_DASSOUNDO.pdf';
        try {
            const link = document.createElement('a');
            link.href = `cv/${file}`;
            link.download = file;
            link.target = '_blank'; // Ouvre dans un nouvel onglet si le téléchargement échoue
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Erreur lors du téléchargement du CV:', error);
            window.open(`cv/${file}`, '_blank');
        }
    }



    document.querySelector('.download-btn[data-type="Recommendation"]').addEventListener('click', function(e) {
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
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // Traductions
    const translations = {
        fr: {
            'nav-home': 'Accueil',
            'nav-axes': 'Axes',
            'nav-skills': 'Compétences',
            'nav-projects': 'Projets',
            'nav-research': 'Recherche',
            'nav-education': 'Formation',
            'nav-contact': 'Contact',
            'hero-title': 'IA agentique, Systèmes multi-agents & Logiciel embarqué.',
            'hero-subtitle': 'Ingénieur IA / RAG – FastAPI chez Yieloo · Master of Science Data & IA – Epitech · Ingénieur ESEO (Logiciel embarqué & Cybersécurité)',
            'hero-description': "Ingénieur et chercheur alliant science des données et intelligence artificielle (IA générative, RAG, agents et systèmes multi-agents, LLM), logiciel embarqué, cybersécurité et développement logiciel, avec une expérience académique et industrielle (Renault, Thales, Université de Sherbrooke) et une orientation marquée vers l'innovation technologique.",
            'hero-status': '🎓 Candidat au doctorat (Ph.D.) – IA agentique, systèmes multi-agents et aide à la décision pour infrastructures critiques',
            'btn-download-cv': 'Télécharger CV (PDF)',
            'btn-download-Recommendation': 'Recommandations (PDF)',
            'btn-download-skills': 'Dossier Compétences (PDF)',
            'btn-location': '🇫🇷 France & 🇨🇦 Canada',
            'axes-title': 'Axes de recherche',
            'axes-intro': "Mes travaux portent sur la conception de systèmes intelligents autonomes et collaboratifs capables d'assister ou d'automatiser la prise de décision dans des environnements complexes et réglementés. Chaque axe ci-dessous est relié aux projets où je l'ai mis en pratique.",
            'skills-title': 'Mes Compétences',
            'main-skills': 'Compétences clés',
            'certifications': 'Certifications (7)',
            'programming-languages': 'Langages de programmation principaux',
            'experience-title': 'Expérience professionnelle',
            'projects-title': 'Principaux projets techniques et professionnels',
            'research-title': 'Mes principaux projets de recherche',
            'education-title': 'Formation',
            'contact-title': 'Contact'
        },
        en: {
            'nav-home': 'Home',
            'nav-axes': 'Research axes',
            'nav-skills': 'Skills',
            'nav-projects': 'Projects',
            'nav-research': 'Research',
            'nav-education': 'Education',
            'nav-contact': 'Contact',
            'hero-title': 'Agentic AI, Multi-Agent Systems & Embedded Software.',
            'hero-subtitle': 'AI / RAG – FastAPI Engineer at Yieloo · Master of Science in Data & AI – Epitech · ESEO Engineer (Embedded Software & Cybersecurity)',
            'hero-description': 'Engineer and researcher combining data science and artificial intelligence (generative AI, RAG, agents and multi-agent systems, LLMs), embedded software, cybersecurity and software development, with academic and industrial experience (Renault, Thales, Université de Sherbrooke) and a strong drive for technological innovation.',
            'hero-status': '🎓 Ph.D. candidate – agentic AI, multi-agent systems and decision support for critical infrastructures',
            'btn-download-cv': 'Download CV (PDF)',
            'btn-download-Recommendation': 'Recommendations (PDF)',
            'btn-download-skills': 'Skills Portfolio (PDF)',
            'btn-location': '🇫🇷 France & 🇨🇦 Canada',
            'axes-title': 'Research Axes',
            'axes-intro': 'My work focuses on designing autonomous, collaborative intelligent systems that assist or automate decision-making in complex, regulated environments. Each axis below is linked to the projects where I applied it.',
            'skills-title': 'My Skills',
            'main-skills': 'Core Skills',
            'certifications': 'Certifications (7)',
            'programming-languages': 'Main Programming Languages',
            'experience-title': 'Professional Experience',
            'projects-title': 'Main Technical & Professional Projects',
            'research-title': 'My Main Research Projects',
            'education-title': 'Education',
            'contact-title': 'Contact'
        }
    };

    // Langue courante - déclarée en global - CHANGED DEFAULT TO ENGLISH
    let currentLang = 'en';

    // Fonction pour initialiser la langue
    function initializeLanguage() {
        const savedLang = localStorage.getItem('preferred-language');
        const browserLang = navigator.language.startsWith('en') ? 'en' : 'fr';
        const initialLang = savedLang || 'fr'; // Default to English instead of browser language
        
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
        }, 150);
    }

    // Gestionnaire de changement de langue - amélioré
    const langButtons = document.querySelectorAll('.lang-btn');
    
    console.log('Boutons de langue trouvés:', langButtons.length);
    
    langButtons.forEach((button, index) => {
        console.log(`Bouton ${index}:`, button.getAttribute('data-lang-code'));
        
        button.addEventListener('click', function(e) {
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

    // Company logo click effects
    const companyLogos = document.querySelectorAll('.company-logo');
    
    companyLogos.forEach(logo => {
        logo.addEventListener('click', function(e) {
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
        logo.addEventListener('mouseenter', function() {
            this.style.zIndex = '20';
        });
        
        logo.addEventListener('mouseleave', function() {
            if (!this.classList.contains('logo-clicked')) {
                this.style.zIndex = '1';
            }
        });
    });

    // Export pour utilisation externe (doit rester dans cette closure : currentLang/changeLanguage y sont déclarés)
    window.changeLanguage = changeLanguage;
    window.getCurrentLanguage = function() {
        return currentLang;
    };
});



// Pour mon gif animé

// Chatbot Logic
window.chatScrollTo = function(id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const chatClose = document.getElementById('chatbot-close');
    const chatInput = document.getElementById('chatbot-input-field');
    const chatSend = document.getElementById('chatbot-send');
    const chatMessages = document.getElementById('chatbot-messages');

    if (!chatToggle || !chatWindow) return;

    const stripAccents = (str) => str.normalize('NFD').replace(/[̀-ͯ]/g, '');
    const normalize = (str) => stripAccents(str.toLowerCase());

    const lang = () => (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'fr');

    const link = (id, label) =>
        `<a href="#${id}" class="chat-link" onclick="chatScrollTo('${id}');return false;">${label}</a>`;

    // Base de connaissances construite à partir du contenu réel du site (index.html)
    const INTENTS = [
        {
            id: 'greeting',
            bonus: 0,
            keywords: ['bonjour', 'salut', 'coucou', 'bonsoir', 'hello', 'hi', 'hey'],
            fr: "Bonjour 👋 Je suis l'assistant du profil d'Adébayo (Sergio) DASSOUNDO. Demandez-moi ses <strong>compétences</strong>, <strong>projets</strong>, <strong>expérience</strong>, <strong>recherche</strong>, <strong>formation</strong> ou comment le <strong>contacter</strong>.",
            en: "Hello 👋 I'm Adébayo (Sergio) DASSOUNDO's profile assistant. Ask me about his <strong>skills</strong>, <strong>projects</strong>, <strong>experience</strong>, <strong>research</strong>, <strong>education</strong>, or how to <strong>contact</strong> him.",
            suggestions: true
        },
        {
            id: 'thanks',
            bonus: 0,
            keywords: ['merci', 'thanks', 'thank you', 'sympa', 'super'],
            fr: "Avec plaisir 😊 N'hésitez pas si vous avez d'autres questions sur son profil !",
            en: "You're welcome 😊 Feel free to ask if you have more questions about his profile!"
        },
        {
            id: 'help',
            bonus: 1,
            keywords: ['aide', 'help', 'menu', 'sujets', 'topics', 'que peux tu faire', 'what can you do'],
            fr: "Je peux vous renseigner sur : compétences, projets, expérience, recherche, formation, leadership, centres d'intérêt et contact.",
            en: "I can help with: skills, projects, experience, research, education, leadership, interests, and contact.",
            suggestions: true
        },
        {
            id: 'about',
            bonus: 2,
            keywords: ['qui es tu', 'who are you', 'presente toi', 'a propos', 'about him', 'qui est adebayo', 'qui est sergio', 'qui est dassoundo', 'profil'],
            fr: `<strong>Adébayo (Sergio) DASSOUNDO</strong> est ingénieur et chercheur en <strong>IA agentique, systèmes multi-agents, logiciel embarqué et cybersécurité</strong>. Il est actuellement Ingénieur IA / RAG chez <strong>Yieloo</strong> et en Master of Science Data & IA à <strong>Epitech</strong>. Basé entre 🇫🇷 France et 🇨🇦 Canada. <br><br>👉 ${link('accueil', "Voir le profil")}`,
            en: `<strong>Adébayo (Sergio) DASSOUNDO</strong> is an engineer and researcher in <strong>agentic AI, multi-agent systems, embedded software and cybersecurity</strong>. He is currently an AI / RAG Engineer at <strong>Yieloo</strong> and a Master of Science in Data & AI student at <strong>Epitech</strong>. Based between 🇫🇷 France and 🇨🇦 Canada. <br><br>👉 ${link('accueil', "View profile")}`
        },
        {
            id: 'phd',
            bonus: 5,
            keywords: ['these', 'doctorat', 'phd', 'ph.d', 'axe', 'axes', 'multi-agent', 'multi agents', 'multiagent', 'agentique', 'agentic', 'aide a la decision', 'decision support', 'souverain', 'sovereign', 'infrastructures critiques', 'critical infrastructure'],
            fr: `Il candidate à un <strong>doctorat (Ph.D.)</strong> en IA agentique et systèmes multi-agents. Ses axes : <strong>systèmes multi-agents & IA distribuée</strong>, <strong>agents autonomes basés sur les LLM</strong>, <strong>aide à la décision en environnement critique</strong>, <strong>IA fiable, explicable et résiliente</strong>, et <strong>IA souveraine</strong>. Deux projets de recherche 2026 en cours les illustrent. <br><br>👉 ${link('axes', "Voir ses axes de recherche")}`,
            en: `He is applying for a <strong>Ph.D.</strong> in agentic AI and multi-agent systems. His axes: <strong>multi-agent systems & distributed AI</strong>, <strong>LLM-based autonomous agents</strong>, <strong>decision support in critical environments</strong>, <strong>trustworthy, explainable and resilient AI</strong>, and <strong>sovereign AI</strong>. Two ongoing 2026 research projects illustrate them. <br><br>👉 ${link('axes', "View research axes")}`
        },
        {
            id: 'skills',
            bonus: 3,
            keywords: ['competence', 'competences', 'skill', 'skills', 'stack', 'techno', 'technologie', 'langage de programmation', 'savoir faire', 'genai', 'langchain', 'langgraph', 'rag', 'fastapi', 'machine learning'],
            fr: `Il combine <strong>IA générative & agents</strong> (RAG agentique, LangChain/LangGraph, routage multi-LLM, faithfulness scoring, FastAPI, pgvector), <strong>Systèmes Embarqués</strong> (ROS2, STM32, dSPACE, MATLAB/Simulink) et <strong>Cybersécurité</strong> (OAuth2, AES-256-GCM, TLS/SSH, multi-tenant). <br><br>👉 ${link('competences', "Voir ses compétences")}`,
            en: `He combines <strong>Generative AI & agents</strong> (agentic RAG, LangChain/LangGraph, multi-LLM routing, faithfulness scoring, FastAPI, pgvector), <strong>Embedded Systems</strong> (ROS2, STM32, dSPACE, MATLAB/Simulink) and <strong>Cybersecurity</strong> (OAuth2, AES-256-GCM, TLS/SSH, multi-tenant). <br><br>👉 ${link('competences', "View skills")}`
        },
        {
            id: 'experience',
            bonus: 3,
            keywords: ['experience', 'entreprise', 'entreprises', 'stage', 'stages', 'emploi', 'job', 'poste', 'carriere', 'career', 'apprenti', 'apprentissage', 'parcours professionnel', 'travail'],
            fr: `Il est actuellement <strong>Ingénieur IA / RAG chez Yieloo</strong> (2026–2028). Avant cela : <strong>Renault Group</strong> (intégration SW châssis, 2024–2026), <strong>Thales</strong> (projet de fin d'études), l'<strong>Université de Sherbrooke</strong> (recherche embarqué & IA au Canada), et co-fondation de <strong>DASIA</strong> (plateforme multi-agents). <br><br>👉 ${link('experience', "Voir ses expériences")}`,
            en: `He is currently an <strong>AI / RAG Engineer at Yieloo</strong> (2026–2028). Before that: <strong>Renault Group</strong> (chassis SW integration, 2024–2026), <strong>Thales</strong> (final year project), the <strong>Université de Sherbrooke</strong> (embedded & AI research in Canada), and co-founded <strong>DASIA</strong> (multi-agent platform). <br><br>👉 ${link('experience', "View experience")}`
        },
        {
            id: 'yieloo',
            bonus: 6,
            keywords: ['yieloo', 'aeroport', 'airport'],
            fr: `Chez <strong>Yieloo</strong> (éditeur de logiciels pour l'aéroportuaire), il fait partie du <strong>comité IA</strong> : stratégie d'intégration de l'IA, analyse des risques techniques et réglementaires, cadrage avec les clients (aéroports, laboratoires) et développement de modèles RAG exposés via FastAPI. <br><br>👉 ${link('projets', "Voir le détail")}`,
            en: `At <strong>Yieloo</strong> (software publisher for the airport sector), he sits on the <strong>AI committee</strong>: AI integration strategy, technical and regulatory risk assessment, scoping with clients (airports, labs), and building RAG models exposed via FastAPI. <br><br>👉 ${link('projets', "View details")}`
        },
        {
            id: 'epitech',
            bonus: 6,
            keywords: ['epitech', 'master', 'msc'],
            fr: `Il suit le <strong>Master of Science Intelligence Artificielle</strong> (parcours Science des Données & IA) à <strong>Epitech</strong> (2026–2028), en alternance chez Yieloo : LLM, RAG et systèmes multi-agents autonomes. <br><br>👉 ${link('education', "Voir sa formation")}`,
            en: `He is enrolled in the <strong>Master of Science in Artificial Intelligence</strong> (Data Science & AI track) at <strong>Epitech</strong> (2026–2028), work-study at Yieloo: LLMs, RAG and autonomous multi-agent systems. <br><br>👉 ${link('education', "View education")}`
        },
        {
            id: 'cv',
            bonus: 4,
            keywords: ['cv', 'resume', 'telecharger cv', 'download resume'],
            fr: `Vous pouvez télécharger son <strong>CV</strong> directement en haut de la page (bouton "Télécharger CV"). <br><br>👉 ${link('accueil', "Aller en haut de page")}`,
            en: `You can download his <strong>CV</strong> right at the top of the page ("Download CV" button). <br><br>👉 ${link('accueil', "Go to top")}`
        },
        {
            id: 'renault',
            bonus: 6,
            keywords: ['renault', 'ampere'],
            fr: `Chez <strong>Renault Group</strong> (Ampere Software Technology), il a été ingénieur développement SW et intégration <strong>châssis SW prototype véhicule</strong> (2024–2026) : portage vers ROS2/NUC, solution hybride dSPACE–ROS2, CI/CD GitLab, tests sur véhicules prototypes. <br><br>👉 ${link('projets', "Voir le détail du projet")}`,
            en: `At <strong>Renault Group</strong> (Ampere Software Technology), he was a software development and <strong>prototype vehicle chassis SW integration</strong> engineer (2024–2026): porting to ROS2/NUC, hybrid dSPACE–ROS2 solution, GitLab CI/CD, tests on prototype vehicles. <br><br>👉 ${link('projets', "View project details")}`
        },
        {
            id: 'thales',
            bonus: 6,
            keywords: ['thales'],
            fr: `Chez <strong>Thales</strong>, il a réalisé son <strong>projet de fin d'études</strong> (2025–2026) : architectures logicielles et algorithmes de recherche et de découverte en environnement inconnu pour robots autonomes (UML, C++, Python, simulation). <br><br>👉 ${link('projets', "Voir le détail du projet")}`,
            en: `At <strong>Thales</strong>, he completed his <strong>final year project</strong> (2025–2026): software architectures and search-and-discovery algorithms in unknown environments for autonomous robots (UML, C++, Python, simulation). <br><br>👉 ${link('projets', "View project details")}`
        },
        {
            id: 'dasia',
            bonus: 6,
            keywords: ['dasia'],
            fr: `<strong>DASIA</strong> est la start-up qu'il a co-fondée : une plateforme multi-agents (6 agents spécialisés) avec routeur intelligent entre 7 LLM, RAG agentique LangGraph exposé via FastAPI avec faithfulness scoring, et sécurité multi-tenant. Démo en ligne disponible. <br><br>👉 ${link('projets', "Voir le projet DASIA")}`,
            en: `<strong>DASIA</strong> is the start-up he co-founded: a multi-agent platform (6 specialized agents) with a smart router across 7 LLMs, agentic RAG with LangGraph exposed via FastAPI with faithfulness scoring, and multi-tenant security. Live demo available. <br><br>👉 ${link('projets', "View the DASIA project")}`
        },
        {
            id: 'sherbrooke',
            bonus: 6,
            keywords: ['sherbrooke', 'canada', 'bioreacteur', 'bioreactor'],
            fr: `À l'<strong>Université de Sherbrooke</strong> (Canada, 2025), il a mené un stage de recherche sur le contrôle temps réel d'un bioréacteur de décellularisation de tissus biologiques (Python, capteurs/pompes/valves). <br><br>👉 ${link('recherche', "Voir cette recherche")}`,
            en: `At the <strong>Université de Sherbrooke</strong> (Canada, 2025), he did a research internship on real-time control of a tissue decellularization bioreactor (Python, sensors/pumps/valves). <br><br>👉 ${link('recherche', "View this research")}`
        },
        {
            id: 'eseo',
            bonus: 5,
            keywords: ['eseo'],
            fr: `L'<strong>ESEO</strong> est sa grande école d'ingénieurs en France (2023–2026), spécialisation Logiciel Embarqué & Cybersécurité. Il y a réalisé des projets d'électronique (Altium, SolidWorks), a été ambassadeur des Relations Internationales et membre des clubs Robot, ESE'Auto et Football. <br><br>👉 ${link('education', "Voir sa formation")}`,
            en: `<strong>ESEO</strong> is his engineering school in France (2023–2026), specializing in Embedded Software & Cybersecurity. He worked on electronics projects there (Altium, SolidWorks), served as International Relations ambassador and was a member of the Robot, ESE'Auto and Football clubs. <br><br>👉 ${link('education', "View education")}`
        },
        {
            id: 'projects',
            bonus: 3,
            keywords: ['projet', 'projets', 'project', 'projects', 'realisation'],
            fr: `Parmi ses projets principaux : l'IA RAG pour l'aéroportuaire chez <strong>Yieloo</strong>, la plateforme multi-agents <strong>DASIA</strong>, l'intégration logicielle châssis chez <strong>Renault</strong>, l'exploration autonome chez <strong>Thales</strong>, et le contrôle de bioréacteur à <strong>Sherbrooke</strong>. <br><br>👉 ${link('projets', "Voir tous ses projets")}`,
            en: `Key projects include: RAG AI for the airport sector at <strong>Yieloo</strong>, the <strong>DASIA</strong> multi-agent platform, chassis software integration at <strong>Renault</strong>, autonomous exploration at <strong>Thales</strong>, and bioreactor control at <strong>Sherbrooke</strong>. <br><br>👉 ${link('projets', "View all projects")}`
        },
        {
            id: 'research',
            bonus: 4,
            keywords: ['recherche', 'research', 'publication', 'laboratoire'],
            fr: `Ses projets de recherche : un <strong>système multi-agents LLM d'aide à la décision en conformité réglementaire</strong> (2026), une <strong>architecture d'IA locale, fiable et souveraine pour infrastructures critiques</strong> (2026), la décellularisation automatisée (Sherbrooke, 2025) et l'architecture ROS2 pour le prototypage châssis (Ampere, 2024–2025). <br><br>👉 ${link('recherche', "Voir ses recherches")}`,
            en: `His research projects: an <strong>LLM multi-agent system for regulatory-compliance decision support</strong> (2026), a <strong>local, trustworthy and sovereign AI architecture for critical infrastructures</strong> (2026), automated decellularization (Sherbrooke, 2025) and ROS2 architecture for chassis prototyping (Ampere, 2024–2025). <br><br>👉 ${link('recherche', "View his research")}`
        },
        {
            id: 'education',
            bonus: 3,
            keywords: ['formation', 'etude', 'etudes', 'diplome', 'ecole', 'universite', 'education', 'degree', 'school', 'cpge'],
            fr: `<strong>Master of Science IA</strong> à Epitech (2026–2028), diplôme d'ingénieur en <strong>Logiciel Embarqué & Cybersécurité</strong> à l'ESEO (2023–2026), programme de recherche à l'<strong>Université de Sherbrooke</strong> (2025), formation en gestion/entrepreneuriat, et CPGE Maths/Physique à l'École Polytechnique du Bénin. <br><br>👉 ${link('education', "Voir sa formation")}`,
            en: `<strong>Master of Science in AI</strong> at Epitech (2026–2028), engineering degree in <strong>Embedded Software & Cybersecurity</strong> at ESEO (2023–2026), research program at the <strong>Université de Sherbrooke</strong> (2025), management/entrepreneurship training, and CPGE Math/Physics at École Polytechnique du Bénin. <br><br>👉 ${link('education', "View education")}`
        },
        {
            id: 'leadership',
            bonus: 4,
            keywords: ['leadership', 'association', 'benevole', 'benevolat', 'president', 'ambassadeur', 'ambassador', 'foot', 'football', 'ong', 'jpa', 'club'],
            fr: `Il a été <strong>Ambassadeur Relations Internationales</strong> de l'ESEO, <strong>Président de la Fondation Jeunesse Locale</strong> (ONG JPA, Bénin), entraîneur d'une équipe de football U12, et membre des clubs Robot, ESE'Auto et Football de l'ESEO. <br><br>👉 ${link('leadership', "Voir son leadership")}`,
            en: `He was ESEO's <strong>International Relations Ambassador</strong>, <strong>President of the Fondation Jeunesse Locale</strong> (JPA NGO, Benin), coached a U12 football team, and was a member of ESEO's Robot, ESE'Auto and Football clubs. <br><br>👉 ${link('leadership', "View leadership")}`
        },
        {
            id: 'interests',
            bonus: 4,
            keywords: ['interet', 'interets', 'hobby', 'hobbies', 'loisir', 'loisirs', 'passion', 'sport', 'aeronautique', 'automobile', 'voyage', 'humanitaire'],
            fr: `Ses centres d'intérêt : <strong>Sport, Automobile, Aéronautique, Humanitaire et Voyage</strong>. <br><br>👉 ${link('interets', "Voir ses centres d'intérêt")}`,
            en: `His interests: <strong>Sport, Automotive, Aeronautics, Humanitarian work and Travel</strong>. <br><br>👉 ${link('interets', "View his interests")}`
        },
        {
            id: 'contact',
            bonus: 4,
            keywords: ['contact', 'email', 'mail', 'joindre', 'contacter', 'telephone', 'linkedin', 'github', 'reseau'],
            fr: `Vous pouvez le contacter par email à <a href="mailto:sergiodassoundo2@gmail.com" class="chat-link">sergiodassoundo2@gmail.com</a>, sur <a href="https://www.linkedin.com/in/ad%C3%A9bayo-dassoundo-a9323a2a3/" target="_blank" class="chat-link">LinkedIn</a> ou <a href="https://github.com/DASSOUNDO" target="_blank" class="chat-link">GitHub</a>. <br><br>👉 ${link('contact', "Voir la section contact")}`,
            en: `You can reach him by email at <a href="mailto:sergiodassoundo2@gmail.com" class="chat-link">sergiodassoundo2@gmail.com</a>, on <a href="https://www.linkedin.com/in/ad%C3%A9bayo-dassoundo-a9323a2a3/" target="_blank" class="chat-link">LinkedIn</a> or <a href="https://github.com/DASSOUNDO" target="_blank" class="chat-link">GitHub</a>. <br><br>👉 ${link('contact', "View contact section")}`
        },
        {
            id: 'location',
            bonus: 5,
            keywords: ['ou habite', 'localisation', 'ou es tu', 'where is he', 'where are you', 'basé', 'base'],
            fr: `Il est basé entre 🇫🇷 <strong>France</strong> et 🇨🇦 <strong>Canada</strong>. <br><br>👉 ${link('contact', "Voir la section contact")}`,
            en: `He's based between 🇫🇷 <strong>France</strong> and 🇨🇦 <strong>Canada</strong>. <br><br>👉 ${link('contact', "View contact section")}`
        }
    ];

    const TOPIC_CHIPS = [
        { fr: 'Axes de recherche', en: 'Research axes', query: 'doctorat' },
        { fr: 'Compétences', en: 'Skills', query: 'compétences' },
        { fr: 'Projets', en: 'Projects', query: 'projets' },
        { fr: 'Expérience', en: 'Experience', query: 'expérience' },
        { fr: 'Recherche', en: 'Research', query: 'recherche' },
        { fr: 'Formation', en: 'Education', query: 'formation' },
        { fr: 'Contact', en: 'Contact', query: 'contact' }
    ];

    const addMessage = (text, isUser = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        msgDiv.innerHTML = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return msgDiv;
    };

    const addSuggestions = () => {
        const wrap = document.createElement('div');
        wrap.className = 'chat-suggestions';
        TOPIC_CHIPS.forEach(chip => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'chat-suggestion-btn';
            btn.textContent = lang() === 'en' ? chip.en : chip.fr;
            btn.addEventListener('click', () => {
                wrap.remove();
                addMessage(btn.textContent, true);
                setTimeout(() => respondToUser(normalize(chip.query)), 500);
            });
            wrap.appendChild(btn);
        });
        chatMessages.appendChild(wrap);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const respondToUser = (input) => {
        let best = null;
        let bestScore = 0;

        INTENTS.forEach(intent => {
            let score = 0;
            intent.keywords.forEach(kw => {
                if (input.includes(normalize(kw))) score += kw.length + (intent.bonus || 0);
            });
            if (score > bestScore) {
                bestScore = score;
                best = intent;
            }
        });

        if (best) {
            addMessage(lang() === 'en' ? best.en : best.fr);
            if (best.suggestions) addSuggestions();
        } else {
            addMessage(
                lang() === 'en'
                    ? "I'm here to guide recruiters through this profile. Ask me about <strong>skills</strong>, <strong>projects</strong>, <strong>experience</strong>, <strong>research</strong>, <strong>education</strong> or <strong>contact</strong>!"
                    : "Je suis un assistant conçu pour orienter les recruteurs. Demandez-moi ses <strong>compétences</strong>, ses <strong>projets</strong>, son <strong>expérience</strong>, sa <strong>recherche</strong>, sa <strong>formation</strong> ou son <strong>contact</strong> !"
            );
            addSuggestions();
        }
    };

    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    const handleUserInput = () => {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        chatInput.value = '';

        setTimeout(() => {
            respondToUser(normalize(text));
        }, 600);
    };

    chatSend.addEventListener('click', handleUserInput);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserInput();
    });

    // Suggestions de sujets dès l'ouverture du chat
    addSuggestions();
});
