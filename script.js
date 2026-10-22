document.addEventListener('DOMContentLoaded', function() {
    const root = document.documentElement;
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const progress = document.querySelector('.scroll-progress');
    const backToTop = document.querySelector('.back-to-top');

    const storage = {
        get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
    };

    // Navigation mobile
    const closeMenu = () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    };

    hamburger.addEventListener('click', () => {
        const open = navMenu.classList.toggle('active');
        hamburger.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
    });

    navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

    // Thème clair / sombre
    const themeBtn = document.querySelector('.theme-toggle');
    // Clair par défaut : le sombre ne s'active que sur choix du visiteur (mémorisé)
    const isDark = () => root.getAttribute('data-theme') === 'dark';
    const syncThemeIcon = () => {
        themeBtn.querySelector('i').className = isDark() ? 'fas fa-sun' : 'fas fa-moon';
    };

    themeBtn.addEventListener('click', () => {
        const next = isDark() ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        storage.set('preferred-theme', next);
        syncThemeIcon();
    });
    syncThemeIcon();

    // Scroll : barre de progression, navbar, retour en haut, lien actif
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));

    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        navbar.classList.toggle('scrolled', y > 10);
        backToTop.classList.toggle('visible', y > 700);

        let current = '';
        sections.forEach(section => {
            if (y >= section.offsetTop - 140) current = section.id;
        });
        // Les sous-sections sans lien de menu héritent du lien précédent
        if (current === 'leadership') current = 'education';
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Compteur animé des chiffres clés (« 6 · 7 » compte chaque nombre)
    const countUp = el => {
        const target = el.textContent;
        if (reduceMotion || !/\d/.test(target) || /[A-Za-z]/.test(target)) return;
        const start = performance.now();
        const duration = 1200;
        const tick = now => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = target.replace(/\d+/g, n => Math.round(Number(n) * eased));
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        };
        requestAnimationFrame(tick);
    };

    // Cascade : chaque carte d'une même grille arrive un peu après la précédente
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
        const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
        const delay = Math.min(siblings.indexOf(el), 6) * 80;
        if (delay) {
            el.style.transitionDelay = `${delay}ms`;
            // Le délai ne doit pas ralentir les effets de survol ensuite
            el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
        }
    });

    const kickers = document.querySelectorAll('.section-kicker');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    entry.target.querySelectorAll('.fact-value').forEach(countUp);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(el => observer.observe(el));
        kickers.forEach(el => observer.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('is-visible'));
        kickers.forEach(el => el.classList.add('is-visible'));
    }

    // Reflet qui suit la souris sur les cartes en verre
    if (!reduceMotion) {
        document.querySelectorAll('.axis-card, .project-card, .research-card, .leader-card, .skill-group').forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                card.style.setProperty('--my', `${e.clientY - r.top}px`);
            });
        });
    }

    // Cartes projets dépliables
    document.querySelectorAll('.project-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.project-card');
            const open = card.classList.toggle('open');
            btn.setAttribute('aria-expanded', String(open));
        });
    });

    // Filtres de projets
    const chips = document.querySelectorAll('.filter-chip');
    const filterable = document.querySelectorAll('#projects-grid .project-card');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const filter = chip.dataset.filter;
            chips.forEach(c => c.classList.toggle('active', c === chip));
            filterable.forEach(card => {
                const show = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('is-hidden', !show);
                if (show) card.classList.add('is-visible');
            });
        });
    });

    // Aperçu entreprise : survol en CSS, tap sur écran tactile, Entrée au clavier
    const logoWraps = document.querySelectorAll('.logo-wrap');
    const noHover = window.matchMedia('(hover: none)');
    const closePreviews = except => logoWraps.forEach(w => { if (w !== except) w.classList.remove('show'); });

    logoWraps.forEach(wrap => {
        const tile = wrap.querySelector('.logo-tile');
        tile.addEventListener('click', e => {
            if (!noHover.matches) return;
            e.stopPropagation();
            closePreviews(wrap);
            wrap.classList.toggle('show');
        });
        tile.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closePreviews(wrap);
                wrap.classList.toggle('show');
            }
        });
    });
    document.addEventListener('click', e => {
        if (!e.target.closest('.logo-wrap')) closePreviews();
    });

    // Menus déroulants (CV FR/EN, recommandations)
    const dropdowns = Array.from(document.querySelectorAll('[data-dropdown]')).map(toggle => ({
        toggle,
        menu: document.getElementById(toggle.dataset.dropdown)
    }));
    const setDropdown = (dd, open) => {
        dd.menu.hidden = !open;
        dd.toggle.setAttribute('aria-expanded', String(open));
    };
    const closeDropdowns = except => dropdowns.forEach(dd => { if (dd !== except) setDropdown(dd, false); });
    dropdowns.forEach(dd => {
        dd.toggle.addEventListener('click', e => {
            e.stopPropagation();
            closeDropdowns(dd);
            setDropdown(dd, dd.menu.hidden);
        });
    });
    document.addEventListener('click', e => {
        dropdowns.forEach(dd => { if (!dd.menu.hidden && !dd.menu.contains(e.target)) setDropdown(dd, false); });
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeDropdowns(); closeMenu(); closePreviews(); }
    });

    // Traductions
    const translations = {
        fr: {
            'nav-axes': 'Axes',
            'nav-experience': 'Parcours',
            'nav-projects': 'Projets',
            'nav-research': 'Recherche',
            'nav-skills': 'Compétences',
            'nav-education': 'Formation',
            'nav-contact': 'Contact',
            'hero-status': 'Candidat au doctorat (Ph.D.) – IA agentique, systèmes multi-agents et aide à la décision',
            'hero-title': 'IA agentique, Systèmes multi-agents & Logiciel embarqué.',
            'hero-subtitle': 'Ingénieur IA / RAG – FastAPI chez Yieloo · Master of Science Data & IA – Epitech · Ingénieur ESEO (Logiciel embarqué & Cybersécurité)',
            'hero-description': "Ingénieur et chercheur alliant science des données et intelligence artificielle (IA générative, RAG, agents et systèmes multi-agents, LLM), logiciel embarqué, cybersécurité et développement logiciel, avec une expérience académique et industrielle (Renault, Thales, Université de Sherbrooke) et une orientation marquée vers l'innovation technologique.",
            'btn-download-cv': 'Télécharger CV (PDF)',
            'btn-download-Recommendation': 'Recommandations (PDF)',
            'btn-axes': 'Mes axes de recherche',
            'btn-location': 'France & Canada',
            'fact-research': "projets de recherche en cours (2026) sur les systèmes multi-agents et l'IA souveraine",
            'fact-agents': 'agents spécialisés et LLM orchestrés sur la plateforme DASIA',
            'fact-countries': 'pays de formation et de travail : Bénin, France, Canada',
            'fact-industry': 'expérience industrielle en automobile, défense et aéroportuaire',
            'axes-title': 'Axes de recherche',
            'axes-intro': "Mes travaux portent sur la conception de systèmes intelligents autonomes et collaboratifs capables d'assister ou d'automatiser la prise de décision dans des environnements complexes et réglementés. Chaque axe ci-dessous est relié aux projets où je l'ai mis en pratique.",
            'proof': 'Mis en pratique :',
            'diagram-label': 'Architecture étudiée',
            'diagram-title': "Système multi-agents LLM pour l'aide à la décision en conformité réglementaire",
            'diagram-hint': 'Faire défiler le schéma',
            'experience-title': 'Expérience professionnelle',
            'current': 'en cours',
            'projects-title': 'Principaux projets techniques et professionnels',
            'projects-note': 'Certains projets réalisés en entreprise sont soumis à des clauses de confidentialité : seuls les aspects techniques généraux et les compétences mises en œuvre sont présentés.',
            'filter-all': 'Tous',
            'filter-ai': 'IA & agents',
            'filter-embedded': 'Embarqué & robotique',
            'filter-engineering': 'Ingénierie & industrie',
            'details': 'Détails',
            'live-demo': 'Démo en direct',
            'research-title': 'Mes principaux projets de recherche',
            'ongoing': 'En cours · 2026',
            'personal-research': 'Recherche appliquée personnelle',
            'skills-title': 'Compétences',
            'certifications': 'Certifications (7)',
            'certs-linkedin': 'Voir sur LinkedIn',
            'tech-details': 'Détail technique par domaine',
            'education-title': 'Formation',
            'leadership-title': 'Qualités personnelles et leadership',
            'clubs-title': 'Vie associative · ESEO Angers (2023 – 2026)',
            'interests-title': 'Centres d’intérêt',
            'contact-title': 'Contact',
            'contact-text': 'Ouvert aux opportunités de doctorat (Ph.D.) en IA agentique, systèmes multi-agents et aide à la décision. Références académiques et industrielles disponibles sur demande.',
            'skip-link': 'Aller au contenu',
            'ai-powered': 'IA générative · réponses basées uniquement sur ce portfolio',
            'ai-how-title': 'Comment ça marche ?',
            'ai-how-1': 'Votre question part vers un proxy sécurisé (Cloudflare Worker) qui protège les clés API et limite les abus.',
            'ai-how-2': 'Le proxy fournit au modèle le contenu de ce portfolio comme seule source de vérité.',
            'ai-how-3': "Google Gemini répond ; s'il est indisponible, bascule automatique vers Groq (Llama), puis vers l'assistant hors ligne.",
            'ai-how-4': 'La réponse s\'affiche en temps réel, avec des liens vers les sections sources.',
            'ai-privacy': "Aucune conversation n'est enregistrée. Ne partagez pas d'informations personnelles.",
            'kbd-esc': 'Échap',
            'kbd-enter': 'Entrée',
            'search-nav': 'naviguer',
            'search-go': 'ouvrir',
            'search-close': 'fermer',
            'footer-rights': 'Tous droits réservés.',
            'photo-credits': 'Crédits photos',
            'footer-dev': 'Site conçu et développé par moi-même — code source sur'
        },
        en: {
            'nav-axes': 'Research axes',
            'nav-experience': 'Experience',
            'nav-projects': 'Projects',
            'nav-research': 'Research',
            'nav-skills': 'Skills',
            'nav-education': 'Education',
            'nav-contact': 'Contact',
            'hero-status': 'Ph.D. candidate – agentic AI, multi-agent systems and decision support',
            'hero-title': 'Agentic AI, Multi-Agent Systems & Embedded Software.',
            'hero-subtitle': 'AI / RAG – FastAPI Engineer at Yieloo · Master of Science in Data & AI – Epitech · ESEO Engineer (Embedded Software & Cybersecurity)',
            'hero-description': 'Engineer and researcher combining data science and artificial intelligence (generative AI, RAG, agents and multi-agent systems, LLMs), embedded software, cybersecurity and software development, with academic and industrial experience (Renault, Thales, Université de Sherbrooke) and a strong drive for technological innovation.',
            'btn-download-cv': 'Download CV (PDF)',
            'btn-download-Recommendation': 'Recommendations (PDF)',
            'btn-axes': 'My research axes',
            'btn-location': 'France & Canada',
            'fact-research': 'ongoing research projects (2026) on multi-agent systems and sovereign AI',
            'fact-agents': 'specialized agents and LLMs orchestrated on the DASIA platform',
            'fact-countries': 'countries of study and work: Benin, France, Canada',
            'fact-industry': 'industrial experience in automotive, defense and airports',
            'axes-title': 'Research Axes',
            'axes-intro': 'My work focuses on designing autonomous, collaborative intelligent systems that assist or automate decision-making in complex, regulated environments. Each axis below is linked to the projects where I applied it.',
            'proof': 'Applied in:',
            'diagram-label': 'Architecture under study',
            'diagram-title': 'LLM multi-agent system for regulatory-compliance decision support',
            'diagram-hint': 'Scroll the diagram',
            'experience-title': 'Professional Experience',
            'current': 'ongoing',
            'projects-title': 'Main Technical & Professional Projects',
            'projects-note': 'Some industry projects are covered by confidentiality agreements: only general technical aspects and the skills involved are presented.',
            'filter-all': 'All',
            'filter-ai': 'AI & agents',
            'filter-embedded': 'Embedded & robotics',
            'filter-engineering': 'Engineering & industry',
            'details': 'Details',
            'live-demo': 'Live demo',
            'research-title': 'My Main Research Projects',
            'ongoing': 'Ongoing · 2026',
            'personal-research': 'Independent applied research',
            'skills-title': 'Skills',
            'certifications': 'Certifications (7)',
            'certs-linkedin': 'View on LinkedIn',
            'tech-details': 'Technical detail by domain',
            'education-title': 'Education',
            'leadership-title': 'Personal Qualities & Leadership',
            'clubs-title': 'Student clubs · ESEO Angers (2023 – 2026)',
            'interests-title': 'Interests',
            'contact-title': 'Contact',
            'contact-text': 'Open to Ph.D. opportunities in agentic AI, multi-agent systems and decision support. Academic and industry references available on request.',
            'skip-link': 'Skip to content',
            'ai-powered': 'Generative AI · answers based only on this portfolio',
            'ai-how-title': 'How does it work?',
            'ai-how-1': 'Your question goes to a secure proxy (Cloudflare Worker) that protects the API keys and limits abuse.',
            'ai-how-2': 'The proxy gives the model the content of this portfolio as its only source of truth.',
            'ai-how-3': 'Google Gemini answers; if it is unavailable, it automatically fails over to Groq (Llama), then to the offline assistant.',
            'ai-how-4': 'The answer streams in real time, with links to the source sections.',
            'ai-privacy': 'No conversation is stored. Please do not share personal information.',
            'kbd-esc': 'Esc',
            'kbd-enter': 'Enter',
            'search-nav': 'navigate',
            'search-go': 'open',
            'search-close': 'close',
            'footer-rights': 'All rights reserved.',
            'photo-credits': 'Photo credits',
            'footer-dev': 'Designed and built by me — source code on'
        }
    };

    let currentLang = 'fr';

    // Traduction du contenu : chaque nœud texte et attribut garde son original français,
    // remplacé par l'anglais de I18N_EN (i18n-en.js) puis restauré au retour en FR.
    const originalText = new WeakMap();
    const originalAttrs = new WeakMap();
    const originalMeta = {
        title: document.title,
        description: document.querySelector('meta[name="description"]').content
    };
    const TRANSLATED_ATTRS = ['aria-label', 'title', 'placeholder', 'alt'];

    function translateContent(lang) {
        const dict = typeof I18N_EN !== 'undefined' ? I18N_EN : null;
        if (!dict) return;
        const toEn = lang === 'en';

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!parent || parent.closest('script, style, [data-lang]')) continue;
            if (!originalText.has(node)) {
                // Un nœud créé pendant que l'anglais est affiché (ex. chatbot) est déjà dans la bonne langue
                if (!toEn) continue;
                originalText.set(node, node.textContent);
            }
            const original = originalText.get(node);
            const key = original.replace(/\s+/g, ' ').trim();
            const en = toEn && dict.text[key];
            if (en) {
                const lead = original.match(/^\s*/)[0];
                const trail = original.match(/\s*$/)[0];
                node.textContent = lead + en + trail;
            } else {
                node.textContent = original;
            }
        }

        document.querySelectorAll(TRANSLATED_ATTRS.map(a => `[${a}]`).join(',')).forEach(el => {
            if (!originalAttrs.has(el)) {
                const saved = {};
                TRANSLATED_ATTRS.forEach(a => { if (el.hasAttribute(a)) saved[a] = el.getAttribute(a); });
                originalAttrs.set(el, saved);
            }
            const saved = originalAttrs.get(el);
            Object.entries(saved).forEach(([a, value]) => {
                el.setAttribute(a, (toEn && dict.attr[value]) || value);
            });
        });

        document.title = toEn ? dict.meta.title : originalMeta.title;
        document.querySelector('meta[name="description"]').content = toEn ? dict.meta.description : originalMeta.description;
    }

    function changeLanguage(newLang) {
        if (!translations[newLang]) return;
        document.body.classList.add('lang-switching');

        setTimeout(() => {
            currentLang = newLang;
            translateContent(currentLang);
            document.querySelectorAll('[data-lang]').forEach(element => {
                const value = translations[currentLang][element.getAttribute('data-lang')];
                if (value) element.textContent = value;
            });
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang-code') === currentLang);
            });
            document.documentElement.lang = currentLang;
            storage.set('preferred-language', currentLang);
            document.body.classList.remove('lang-switching');
        }, 150);
    }

    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
            const newLang = button.getAttribute('data-lang-code');
            if (newLang && newLang !== currentLang) changeLanguage(newLang);
        });
    });

    const savedLang = storage.get('preferred-language');
    if (savedLang && savedLang !== currentLang) changeLanguage(savedLang);

    // Export pour le chatbot (currentLang/changeLanguage sont déclarés dans cette closure)
    window.changeLanguage = changeLanguage;
    window.getCurrentLanguage = function() {
        return currentLang;
    };
});

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

    // --- Assistant IA (proxy Cloudflare Worker, dossier assistant-worker/) -------------------
    // URL du proxy déployé, se terminant par /chat. Vide = assistant hors ligne uniquement.
    const ASSISTANT_API = window.ASSISTANT_API_OVERRIDE || '';
    const aiEnabled = Boolean(ASSISTANT_API);
    const PROVIDER_LABELS = { gemini: 'Gemini', groq: 'Groq · Llama' };
    const chatInfo = document.getElementById('chatbot-info');
    if (aiEnabled && chatInfo) chatInfo.hidden = false;
    const history = [];
    let busy = false;

    const RECRUITER_CHIPS = [
        { fr: 'Résume son profil en 30 secondes', en: 'Summarize his profile in 30 seconds' },
        { fr: 'Quelles preuves en systèmes multi-agents ?', en: 'What evidence of multi-agent systems work?' },
        { fr: 'Pourquoi ce profil pour un doctorat en IA agentique ?', en: 'Why is he a fit for a PhD in agentic AI?' },
        { fr: 'Quelle est son expérience industrielle ?', en: 'What is his industry experience?' },
    ];

    const escapeHtml = (str) => str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // Markdown minimal et sûr (le texte est échappé avant toute mise en forme) :
    // **gras**, `code`, listes « - », liens vers une section (#id) ou une page https.
    const renderMarkdown = (md) => {
        const inline = (txt) => escapeHtml(txt)
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\[([^\]]+)\]\((#[a-z-]+|https:\/\/[^\s)]+)\)/g, (m, label, href) => href.startsWith('#')
                ? `<a href="${href}" class="chat-link" data-section="${href.slice(1)}">${label}</a>`
                : `<a href="${href}" class="chat-link" target="_blank" rel="noopener">${label}</a>`);
        let html = '';
        let list = [];
        let para = [];
        const flushPara = () => { if (para.length) { html += `<p>${para.join('<br>')}</p>`; para = []; } };
        const flushList = () => { if (list.length) { html += `<ul>${list.map(li => `<li>${li}</li>`).join('')}</ul>`; list = []; } };
        md.split('\n').forEach(raw => {
            const line = raw.trim();
            const item = line.match(/^[-*•]\s+(.*)$/);
            if (item) { flushPara(); list.push(inline(item[1])); }
            else if (!line) { flushPara(); flushList(); }
            else { flushList(); para.push(inline(line)); }
        });
        flushPara();
        flushList();
        return html;
    };

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
            id: 'citiz',
            bonus: 6,
            keywords: ['citiz', 'autopartage', 'car-sharing', 'carsharing', 'rennes', 'fabric', 'power bi', 'streamlit', 'stations', 'mobilite', 'mobility'],
            fr: `Projet de recherche appliquée en IA avec <strong>Epitech, Citiz et Microsoft</strong> (équipe de 5, Rennes Métropole) : un outil d'aide à la décision pour choisir où ouvrir de nouvelles stations d'autopartage. Random forest validé par validation croisée spatiale (<strong>AUC 0,946</strong> contre 0,899 pour la baseline), puis optimisation de la couverture sous budget avec contraintes d'équité : <strong>500 000 € → 14 stations, ~43 000 nouveaux habitants desservis</strong>. Pipeline industrialisé sur Microsoft Fabric et Power BI. <br><br>👉 ${link('recherche', "Voir le projet")} · <a href="https://mobility-rennes.streamlit.app" target="_blank" rel="noopener" class="chat-link">Démo</a>`,
            en: `Applied AI research project with <strong>Epitech, Citiz and Microsoft</strong> (team of 5, Rennes Métropole): a decision-support tool to choose where to open new car-sharing stations. Random forest validated with spatial cross-validation (<strong>AUC 0.946</strong> vs. 0.899 for the baseline), then budget-constrained coverage optimization with equity constraints: <strong>€500,000 → 14 stations, ~43,000 newly served residents</strong>. Pipeline industrialized on Microsoft Fabric and Power BI. <br><br>👉 ${link('recherche', "View the project")} · <a href="https://mobility-rennes.streamlit.app" target="_blank" rel="noopener" class="chat-link">Demo</a>`
        },
        {
            id: 'research',
            bonus: 4,
            keywords: ['recherche', 'research', 'publication', 'laboratoire'],
            fr: `Ses projets de recherche : l'<strong>implantation de stations d'autopartage à Rennes</strong> avec Epitech, Citiz et Microsoft (aide à la décision sous budget et contraintes d'équité), un <strong>système multi-agents LLM d'aide à la décision en conformité réglementaire</strong> (2026), une <strong>architecture d'IA locale, fiable et souveraine pour infrastructures critiques</strong> (2026), la décellularisation automatisée (Sherbrooke, 2025) et l'architecture ROS2 pour le prototypage châssis (Ampere, 2024–2025). <br><br>👉 ${link('recherche', "Voir ses recherches")}`,
            en: `His research projects: <strong>car-sharing station siting in Rennes</strong> with Epitech, Citiz and Microsoft (decision support under budget and equity constraints), an <strong>LLM multi-agent system for regulatory-compliance decision support</strong> (2026), a <strong>local, trustworthy and sovereign AI architecture for critical infrastructures</strong> (2026), automated decellularization (Sherbrooke, 2025) and ROS2 architecture for chassis prototyping (Ampere, 2024–2025). <br><br>👉 ${link('recherche', "View his research")}`
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
            keywords: ['interet', 'interets', 'hobby', 'hobbies', 'loisir', 'loisirs', 'passion', 'sport', 'veille', 'voyage', 'humanitaire'],
            fr: `Ses centres d'intérêt : <strong>Sport, Veille IA, Humanitaire et Voyage</strong>. <br><br>👉 ${link('interets', "Voir ses centres d'intérêt")}`,
            en: `His interests: <strong>Sport, AI watch, Humanitarian work and Travel</strong>. <br><br>👉 ${link('interets', "View his interests")}`
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
        const chips = aiEnabled ? RECRUITER_CHIPS : TOPIC_CHIPS;
        chips.forEach(chip => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'chat-suggestion-btn';
            btn.textContent = lang() === 'en' ? chip.en : chip.fr;
            btn.addEventListener('click', () => {
                if (busy) return;
                wrap.remove();
                if (aiEnabled) sendQuestion(btn.textContent);
                else {
                    addMessage(escapeHtml(btn.textContent), true);
                    setTimeout(() => respondToUser(normalize(chip.query)), 500);
                }
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

    // Question à l'IA : réponse en streaming (SSE) ; en cas d'échec, réponse du mode hors ligne
    const askAI = async (question) => {
        busy = true;
        chatSend.disabled = true;
        history.push({ role: 'user', content: question });
        const bubble = addMessage('<span class="typing" aria-hidden="true"><span></span><span></span><span></span></span>');
        bubble.classList.add('ai-message');
        let answer = '';
        let provider = '';
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 45000);
        try {
            const response = await fetch(ASSISTANT_API, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ lang: lang(), messages: history.slice(-10) }),
                signal: controller.signal,
            });
            if (!response.ok || !response.body) throw new Error(response.status === 429 ? 'rate_limited' : `http_${response.status}`);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let finished = false;
            while (!finished) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                let index;
                while ((index = buffer.indexOf('\n\n')) >= 0) {
                    const block = buffer.slice(0, index);
                    buffer = buffer.slice(index + 2);
                    const event = (block.match(/^event: (.*)$/m) || [])[1] || 'message';
                    const raw = (block.match(/^data: (.*)$/m) || [])[1];
                    if (!raw) continue;
                    const data = JSON.parse(raw);
                    if (event === 'meta') provider = data.provider;
                    else if (event === 'error') throw new Error(data.error || 'error');
                    else if (event === 'done') finished = true;
                    else if (data.t) {
                        answer += data.t;
                        bubble.innerHTML = renderMarkdown(answer) + '<span class="ai-cursor" aria-hidden="true"></span>';
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                }
            }
            if (!answer) throw new Error('empty');
            const via = provider ? `<span class="ai-provider">via ${escapeHtml(PROVIDER_LABELS[provider] || provider)}</span>` : '';
            bubble.innerHTML = renderMarkdown(answer) + via;
            history.push({ role: 'assistant', content: answer });
        } catch (error) {
            history.pop(); // une question sans réponse ne reste pas dans l'historique
            bubble.remove();
            const fr = error.message === 'rate_limited'
                ? 'Beaucoup de questions en peu de temps : voici une réponse du mode hors ligne.'
                : "L'assistant IA est momentanément indisponible : voici une réponse du mode hors ligne.";
            const en = error.message === 'rate_limited'
                ? 'Many questions in a short time: here is an answer from offline mode.'
                : 'The AI assistant is temporarily unavailable: here is an answer from offline mode.';
            addMessage(`<span class="ai-note">${lang() === 'en' ? en : fr}</span>`);
            respondToUser(normalize(question));
        } finally {
            clearTimeout(timer);
            while (history.length > 10) history.shift();
            busy = false;
            chatSend.disabled = false;
        }
    };

    const sendQuestion = (text) => {
        if (busy) return;
        addMessage(escapeHtml(text), true);
        if (aiEnabled) askAI(text);
        else setTimeout(() => respondToUser(normalize(text)), 600);
    };

    const handleUserInput = () => {
        const text = chatInput.value.trim().slice(0, 1000);
        if (!text || busy) return;
        chatInput.value = '';
        sendQuestion(text);
    };

    // Liens vers une section dans les réponses : défilement (et fermeture du chat sur mobile)
    chatMessages.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-section]');
        if (!a) return;
        e.preventDefault();
        chatScrollTo(a.dataset.section);
        if (window.innerWidth < 640) chatWindow.classList.remove('active');
    });

    chatSend.addEventListener('click', handleUserInput);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserInput();
    });

    // Suggestions de sujets dès l'ouverture du chat
    addSuggestions();
});

// Recherche dans le portfolio (Ctrl/Cmd + K ou « / »)
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    const list = document.getElementById('search-results');
    const openBtn = document.getElementById('search-open');
    const closeBtn = document.getElementById('search-close');
    if (!overlay || !input || !list) return;

    // Sur Mac, le raccourci s'affiche avec la touche Commande
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
        const mod = document.querySelector('.search-mod');
        if (mod) mod.textContent = '⌘';
        openBtn.title = openBtn.title.replace('Ctrl', '⌘');
    }

    const lang = () => (typeof window.getCurrentLanguage === 'function' ? window.getCurrentLanguage() : 'fr');
    // Même longueur que le texte d'origine : les indices trouvés s'appliquent directement à l'original
    const fold = str => str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().normalize('NFC');
    const foldSameLength = str => Array.from(str).map(ch => {
        const f = fold(ch);
        return f.length === 1 ? f : ch.toLowerCase();
    }).join('');
    const escapeHtml = str => str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const UNITS = '.axis-card, .diagram, .exp-item, .project-card, .research-card, .skill-group, .certs-card, .tech-category, .edu-item, .leader-card, .extras-card, .contact-card, .key-facts li';
    const SUGGESTIONS = ['LangGraph', 'RAG', 'ROS2', 'Citiz', 'Renault', 'Sherbrooke', 'FastAPI', 'Power BI'];

    let results = [];
    let active = 0;
    let lastFocus = null;

    const sectionName = el => {
        const section = el.closest('section');
        const title = section && section.querySelector('.section-title');
        if (title) return title.textContent.trim();
        return lang() === 'en' ? 'Home' : 'Accueil';
    };
    const titleOf = el => {
        const h = el.querySelector('h3, h4, .fact-value, figcaption strong, .section-title');
        return (h ? h.textContent : el.textContent).replace(/\s+/g, ' ').trim().slice(0, 110);
    };

    // Texte d'un bloc, avec un espace entre éléments voisins (« Sherbrooke 2025 » et non « Sherbrooke2025 »)
    const textOf = el => {
        const parts = [];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) parts.push(node.textContent);
        return parts.join(' ').replace(/\s+/g, ' ').trim();
    };

    function search(query) {
        const terms = fold(query).split(/\s+/).filter(t => t.length > 0);
        if (!terms.length) return [];
        const found = [];
        document.querySelectorAll(UNITS).forEach(el => {
            const text = textOf(el);
            const folded = foldSameLength(text);
            if (!terms.every(t => folded.includes(t))) return;
            const title = titleOf(el);
            const foldedTitle = fold(title);
            let score = 0;
            terms.forEach(t => {
                score += folded.split(t).length - 1;
                if (foldedTitle.includes(t)) score += 6;
            });
            found.push({ el, text, folded, title, section: sectionName(el), score, terms });
        });
        return found.sort((a, b) => b.score - a.score).slice(0, 12);
    }

    // Extrait autour de la première occurrence, avec les termes surlignés
    function snippet(r) {
        const first = Math.min(...r.terms.map(t => r.folded.indexOf(t)).filter(i => i >= 0));
        let start = Math.max(0, first - 60);
        let end = Math.min(r.text.length, first + 120);
        // Commencer et finir sur des mots entiers
        if (start > 0) {
            const space = r.text.indexOf(' ', start);
            if (space !== -1 && space < first) start = space + 1;
        }
        if (end < r.text.length) {
            const space = r.text.lastIndexOf(' ', end);
            if (space > first) end = space;
        }
        const piece = r.text.slice(start, end);
        const foldedPiece = r.folded.slice(start, end);
        const marks = [];
        r.terms.forEach(t => {
            let i = foldedPiece.indexOf(t);
            while (i >= 0) { marks.push([i, i + t.length]); i = foldedPiece.indexOf(t, i + t.length); }
        });
        marks.sort((a, b) => a[0] - b[0]);
        let html = '', pos = 0;
        marks.forEach(([a, b]) => {
            if (a < pos) return;
            html += escapeHtml(piece.slice(pos, a)) + '<mark>' + escapeHtml(piece.slice(a, b)) + '</mark>';
            pos = b;
        });
        html += escapeHtml(piece.slice(pos));
        return (start > 0 ? '… ' : '') + html + (end < r.text.length ? ' …' : '');
    }

    function render() {
        const q = input.value.trim();
        list.innerHTML = '';
        if (!q) {
            const li = document.createElement('li');
            li.className = 'search-empty';
            li.innerHTML = `<span>${lang() === 'en' ? 'Try for example:' : 'Essayez par exemple :'}</span>`;
            SUGGESTIONS.forEach(word => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'search-suggestion';
                b.textContent = word;
                b.addEventListener('click', () => { input.value = word; update(); input.focus(); });
                li.appendChild(b);
            });
            list.appendChild(li);
            results = [];
            return;
        }
        results = search(q);
        active = 0;
        if (!results.length) {
            const li = document.createElement('li');
            li.className = 'search-empty';
            li.textContent = lang() === 'en' ? `No results for “${q}”.` : `Aucun résultat pour « ${q} ».`;
            list.appendChild(li);
            return;
        }
        results.forEach((r, i) => {
            const li = document.createElement('li');
            li.className = 'search-result';
            li.id = `search-result-${i}`;
            li.setAttribute('role', 'option');
            li.innerHTML = `<span class="search-section">${escapeHtml(r.section)}</span>
                <span class="search-title">${escapeHtml(r.title)}</span>
                <span class="search-snippet">${snippet(r)}</span>`;
            li.addEventListener('click', () => go(i));
            li.addEventListener('mousemove', () => setActive(i));
            list.appendChild(li);
        });
        setActive(0);
    }

    function setActive(i) {
        active = i;
        list.querySelectorAll('.search-result').forEach((li, j) => {
            li.classList.toggle('active', j === i);
            li.setAttribute('aria-selected', String(j === i));
        });
        const el = document.getElementById(`search-result-${i}`);
        if (el) {
            input.setAttribute('aria-activedescendant', el.id);
            el.scrollIntoView({ block: 'nearest' });
        }
    }

    let timer;
    const update = () => { clearTimeout(timer); timer = setTimeout(render, 80); };

    // Surlignage des mots trouvés dans la page (CSS Custom Highlight API si disponible)
    let clearTimer;
    function highlightInPage(el, terms) {
        if (!('highlights' in CSS) || typeof Highlight === 'undefined') return;
        const ranges = [];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            if (node.parentElement.closest('.company-preview')) continue;
            const folded = foldSameLength(node.textContent);
            terms.forEach(t => {
                let i = folded.indexOf(t);
                while (i >= 0) {
                    const range = new Range();
                    range.setStart(node, i);
                    range.setEnd(node, i + t.length);
                    ranges.push(range);
                    i = folded.indexOf(t, i + t.length);
                }
            });
        }
        CSS.highlights.set('search-hit', new Highlight(...ranges));
        clearTimeout(clearTimer);
        clearTimer = setTimeout(() => CSS.highlights.delete('search-hit'), 6000);
    }

    function reveal(el) {
        // Projet masqué par un filtre : revenir à « Tous »
        if (el.classList.contains('is-hidden')) {
            const all = document.querySelector('.filter-chip[data-filter="all"]');
            if (all) all.click();
        }
        const details = el.closest('details');
        if (details) details.open = true;
        el.classList.add('is-visible');
    }

    function go(i) {
        const r = results[i];
        if (!r) return;
        close(false);
        reveal(r.el);
        // Ouvre les détails d'un projet si le mot n'est pas déjà visible dans son résumé
        const toggle = r.el.querySelector('.project-toggle');
        const content = r.el.querySelector('.project-content');
        if (toggle && content && !r.el.classList.contains('open')) {
            const inDetails = r.terms.some(t => foldSameLength(content.textContent).includes(t));
            const visible = foldSameLength(r.el.textContent.replace(content.textContent, ''));
            if (inDetails && !r.terms.every(t => visible.includes(t))) toggle.click();
        }
        const target = r.el.classList.contains('exp-item') ? r.el.querySelector('.exp-body') : r.el;
        setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.classList.remove('search-flash');
            void target.offsetWidth;
            target.classList.add('search-flash');
            highlightInPage(r.el, r.terms);
        }, 60);
    }

    function open() {
        lastFocus = document.activeElement;
        overlay.hidden = false;
        document.body.classList.add('search-open');
        render();
        requestAnimationFrame(() => { input.focus(); input.select(); });
    }

    function close(restoreFocus = true) {
        overlay.hidden = true;
        document.body.classList.remove('search-open');
        if (restoreFocus && lastFocus) lastFocus.focus();
    }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', () => close());
    overlay.addEventListener('mousedown', e => { if (e.target === overlay) close(); });
    input.addEventListener('input', update);
    input.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' && results.length) { e.preventDefault(); setActive((active + 1) % results.length); }
        else if (e.key === 'ArrowUp' && results.length) { e.preventDefault(); setActive((active - 1 + results.length) % results.length); }
        else if (e.key === 'Enter') { e.preventDefault(); go(active); }
        else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
    document.addEventListener('keydown', e => {
        const typing = /^(input|textarea|select)$/i.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
        if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            overlay.hidden ? open() : close();
        } else if (e.key === '/' && !typing && overlay.hidden) {
            e.preventDefault();
            open();
        }
    });
});
