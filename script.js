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
        if (current === 'competences' || current === 'projets' || current === 'recherche' || current === 'education' || current === 'contact') {
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
            'nav-skills': 'Compétences',
            'nav-projects': 'Projets',
            'nav-research': 'Recherche',
            'nav-education': 'Formation',
            'nav-contact': 'Contact',
            'hero-title': 'Logiciel Embarqué, Cybersécurité, Data & IA.',
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
            'hero-title': 'Embedded Software, Cybersecurity, Data & AI.',
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
});

// Fonction pour obtenir la langue courante
function getCurrentLanguage() {
    return currentLang;
}

// Export pour utilisation externe
window.changeLanguage = changeLanguage;
window.getCurrentLanguage = getCurrentLanguage;



// Pour mon gif animé

// Chatbot Logic
document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const chatClose = document.getElementById('chatbot-close');
    const chatInput = document.getElementById('chatbot-input-field');
    const chatSend = document.getElementById('chatbot-send');
    const chatMessages = document.getElementById('chatbot-messages');

    if(chatToggle && chatWindow) {
        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('active');
        });

        chatClose.addEventListener('click', () => {
            chatWindow.classList.remove('active');
        });

        const addMessage = (text, isUser = false) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            msgDiv.innerHTML = text;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const handleUserInput = () => {
            const text = chatInput.value.trim();
            if(!text) return;
            
            addMessage(text, true);
            chatInput.value = '';

            // Simulate typing delay
            setTimeout(() => {
                respondToUser(text.toLowerCase());
            }, 600);
        };

        chatSend.addEventListener('click', handleUserInput);
        chatInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') handleUserInput();
        });

        const respondToUser = (input) => {
            if(input.includes('projet') || input.includes('dasia')) {
                addMessage("Dassoundo a travaillé sur plusieurs projets impressionnants, dont <strong>DASIA</strong>, une plateforme GenIA B2B. <br><br>👉 <a href='#projets' class='chat-link' onclick='document.getElementById(\"projets\").scrollIntoView({behavior: \"smooth\"});'>Voir ses projets</a>");
            } else if(input.includes('compétence') || input.includes('ia') || input.includes('embarqué') || input.includes('data') || input.includes('skill')) {
                addMessage("Il possède une double compétence rare : <strong>Logiciel Embarqué</strong> (ROS2, STM32) et <strong>Data & IA</strong> (GenAI, LangChain, RAG). <br><br>👉 <a href='#competences' class='chat-link' onclick='document.getElementById(\"competences\").scrollIntoView({behavior: \"smooth\"});'>Voir ses compétences</a>");
            } else if(input.includes('expérience') || input.includes('cv') || input.includes('entreprise') || input.includes('stage')) {
                addMessage("Il a de l'expérience chez Renault Group, Thales, et a fondé la startup DASIA. Vous pouvez télécharger son CV en haut de la page. <br><br>👉 <a href='#experience' class='chat-link' onclick='document.getElementById(\"experience\").scrollIntoView({behavior: \"smooth\"});'>Voir ses expériences</a>");
            } else if(input.includes('contact') || input.includes('mail') || input.includes('linkedin') || input.includes('github')) {
                addMessage("Vous pouvez le contacter via LinkedIn ou Github ! <br><br>👉 <a href='#contact' class='chat-link' onclick='document.getElementById(\"contact\").scrollIntoView({behavior: \"smooth\"});'>Aller en bas de page</a>");
            } else {
                addMessage("Je suis un assistant conçu pour orienter les recruteurs. Demandez-moi ses <strong>compétences</strong>, ses <strong>projets</strong> ou son <strong>expérience</strong> !");
            }
        };
    }
});
