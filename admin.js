// Tableau de bord du portfolio : lit les statistiques du proxy (/admin/stats), protégées par mot de passe.
(() => {
    // Jamais affiché à l'intérieur d'un autre site (protection contre le « clickjacking »)
    if (window.top !== window.self) { document.body.innerHTML = ''; return; }
    const API = (window.ASSISTANT_API_OVERRIDE || 'https://portfolio-assistant.portfolio-assistant.workers.dev/chat').replace(/\/chat$/, '');
    const SITE = 'https://dassoundo.github.io/MyWebSite/';
    const SECTION_NAMES = {
        accueil: 'Accueil', axes: 'Axes de recherche', experience: 'Parcours', projets: 'Projets', recherche: 'Recherche',
        competences: 'Compétences', education: 'Formation', leadership: 'Engagement', contact: 'Contact',
    };
    const EVENT_NAMES = {
        cv_fr: ['CV téléchargé (FR)', 'fa-file-arrow-down'], cv_en: ['CV téléchargé (EN)', 'fa-file-arrow-down'],
        reco: ['Lettre de recommandation ouverte', 'fa-envelope-open-text'], linkedin: ['Clic vers LinkedIn', 'fa-linkedin'],
        github: ['Clic vers GitHub', 'fa-github'], email: ['Clic sur un e-mail', 'fa-envelope'], demo: ['Démo DASIA ouverte', 'fa-play'],
        project_open: ['Détails de projet ouverts', 'fa-folder-open'], preview: ['Aperçus d\'entreprise survolés', 'fa-building'],
        search: ['Recherche utilisée', 'fa-magnifying-glass'], lang_en: ['Passage en anglais', 'fa-language'], theme: ['Thème changé', 'fa-moon'],
        chat_open: ['Assistant ouvert', 'fa-robot'], chat_question: ['Questions à l\'assistant', 'fa-comment'],
        chat_job: ['Fiches de poste analysées', 'fa-clipboard-list'], chat_file: ['Fichiers joints', 'fa-paperclip'],
        chat_followup: ['Relances cliquées', 'fa-reply'],
    };
    const DEVICE_NAMES = { desktop: 'Ordinateur', tablet: 'Tablette', mobile: 'Mobile' };
    const regionName = (() => {
        try { const names = new Intl.DisplayNames(['fr'], { type: 'region' }); return code => (code ? names.of(code) : 'Inconnu'); }
        catch { return code => code || 'Inconnu'; }
    })();

    const $ = id => document.getElementById(id);
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmtDuration = s => {
        if (!s) return '0 s';
        if (s < 60) return `${s} s`;
        const m = Math.floor(s / 60);
        if (m < 60) return `${m} min ${String(s % 60).padStart(2, '0')}`;
        return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
    };
    const fmtDate = (t, withTime = true) => t ? new Date(t).toLocaleString('fr-FR', withTime
        ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
        : { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    const pct = x => `${Math.round(x * 100)} %`;
    // Question affichée en texte brut (anciens liens Markdown « [texte](#section) » retirés)
    const plainQuestion = q => String(q || '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    const slugify = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

    // Seul un jeton signé et temporaire est gardé (jamais le mot de passe) :
    // pour l'onglet par défaut, 30 jours sur l'appareil si « Rester connecté »
    const store = {
        get() {
            try {
                const value = sessionStorage.getItem('pf-admin') || localStorage.getItem('pf-admin');
                return value && value.startsWith('v1.') ? value : null;
            } catch { return null; }
        },
        set(value, remember) {
            try {
                (remember ? localStorage : sessionStorage).setItem('pf-admin', value);
                // Les visites de l'admin ne sont plus comptées sur cet appareil
                localStorage.setItem('pf-admin-optout', '1');
            } catch { /* stockage indisponible */ }
        },
        clear() { try { sessionStorage.removeItem('pf-admin'); localStorage.removeItem('pf-admin'); } catch { /* stockage indisponible */ } },
    };

    let days = 30;
    let token = store.get();
    if (!token) store.clear(); // ancien format (mot de passe enregistré) : effacé

    const api = async (path, options = {}) => {
        const response = await fetch(`${API}${path}`, {
            ...options,
            headers: { authorization: `Bearer ${token}`, ...(options.body ? { 'content-type': 'application/json' } : {}) },
        });
        if (response.status === 401) throw new Error('unauthorized');
        if (response.status === 429) throw new Error('rate_limited');
        if (!response.ok) throw new Error(`http_${response.status}`);
        return response.json();
    };

    // --- Composants ---------------------------------------------------------------------
    const barList = (el, rows, { max, value, empty = 'Pas encore de données.' } = {}) => {
        if (!rows.length) { el.innerHTML = `<p class="empty">${empty}</p>`; return; }
        const top = max ?? Math.max(...rows.map(r => r.count), 1);
        el.innerHTML = rows.map(r => `
            <div class="bar-row">
                <span class="name${r.count ? '' : ' unread'}" title="${esc(r.name)} : ${esc(value ? value(r) : r.count)}">${r.icon ? `<i class="${r.icon}" aria-hidden="true"></i> ` : ''}${esc(r.name)}</span>
                <span class="bar-track"><span class="bar-fill" style="width:${r.count > 0 ? Math.max(1.5, Math.min(100, (r.count / top) * 100)) : 0}%"></span></span>
                <span class="value">${esc(value ? value(r) : r.count)}</span>
            </div>`).join('');
    };

    const tiles = (t) => {
        const share = (n) => (t.sessions ? ` · ${pct(n / t.sessions)} des visites` : '');
        const items = [
            ['fa-user', 'Visiteurs uniques', t.visitors, `${t.sessions} visite${t.sessions > 1 ? 's' : ''} au total`],
            ['fa-stopwatch', 'Durée médiane', fmtDuration(t.medianDuration), `moyenne ${fmtDuration(t.avgDuration)}`],
            ['fa-book-open', 'Lecture approfondie', t.deepReads, `4 sections lues ou plus${share(t.deepReads)}`],
            ['fa-arrows-up-down', 'Défilement moyen', `${t.avgScroll} %`, `${t.engaged} visites de plus de 30 s`],
            ['fa-file-arrow-down', 'Téléchargements', t.downloads, 'CV et lettres de recommandation'],
            ['fa-robot', 'Ont utilisé l\'assistant', t.chatSessions, `visites${share(t.chatSessions)}`],
            ['fa-comments', 'Questions posées', t.questions, 'à l\'assistant IA'],
            ['fa-clipboard-list', 'Fiches de poste analysées', t.jobAnalyses, 'collées ou jointes'],
        ];
        $('tiles').innerHTML = items.map(([icon, label, value, hint]) => `
            <div class="tile">
                <div class="tile-label"><i class="fas ${icon}"></i> ${label}</div>
                <div class="tile-value">${esc(value)}</div>
                <div class="tile-hint">${esc(hint)}</div>
            </div>`).join('');
    };

    // Histogramme des visites par jour (SVG, barres à bouts arrondis, info-bulle au survol)
    const dailyChart = (daily) => {
        const el = $('daily');
        const width = Math.max(el.clientWidth, 280);
        const height = 220;
        const pad = { top: 10, right: 6, bottom: 24, left: 30 };
        const maxValue = Math.max(...daily.map(d => d.sessions), 1);
        const step = maxValue <= 4 ? 1 : Math.ceil(maxValue / 4);
        const top = Math.ceil(maxValue / step) * step;
        const innerW = width - pad.left - pad.right;
        const innerH = height - pad.top - pad.bottom;
        const slot = innerW / daily.length;
        const barW = Math.max(2, Math.min(28, slot - 2));
        const y = v => pad.top + innerH - (v / top) * innerH;
        const labelEvery = Math.ceil(daily.length / Math.floor(innerW / 64));

        let svg = '';
        for (let v = 0; v <= top; v += step) {
            svg += `<line class="gridline" x1="${pad.left}" x2="${width - pad.right}" y1="${y(v)}" y2="${y(v)}"/>`;
            svg += `<text class="axis-label" x="${pad.left - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
        }
        daily.forEach((d, i) => {
            const x = pad.left + i * slot + (slot - barW) / 2;
            const h = (d.sessions / top) * innerH;
            const r = Math.min(4, barW / 2, h);
            const yTop = pad.top + innerH - h;
            const path = h > 0
                ? `M${x},${pad.top + innerH} V${yTop + r} Q${x},${yTop} ${x + r},${yTop} H${x + barW - r} Q${x + barW},${yTop} ${x + barW},${yTop + r} V${pad.top + innerH} Z`
                : '';
            svg += `<rect class="hit" data-i="${i}" x="${pad.left + i * slot}" y="${pad.top}" width="${slot}" height="${innerH}"/>`;
            if (path) svg += `<path class="bar" data-i="${i}" d="${path}"/>`;
            if (i % labelEvery === 0) {
                const label = new Date(`${d.day}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                svg += `<text class="axis-label" x="${pad.left + i * slot + slot / 2}" y="${height - 6}" text-anchor="middle">${label}</text>`;
            }
        });
        el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Visites par jour">${svg}</svg><div class="tooltip" hidden></div>`;
        const tooltip = el.querySelector('.tooltip');
        el.querySelectorAll('.hit').forEach(hit => {
            const i = Number(hit.dataset.i);
            const d = daily[i];
            hit.addEventListener('mouseenter', () => {
                el.querySelector(`.bar[data-i="${i}"]`)?.classList.add('hover');
                const date = new Date(`${d.day}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                tooltip.innerHTML = `<strong>${esc(date)}</strong>${d.sessions} visite${d.sessions > 1 ? 's' : ''} · ${d.visitors} visiteur${d.visitors > 1 ? 's' : ''} unique${d.visitors > 1 ? 's' : ''}`;
                tooltip.style.left = `${((pad.left + i * slot + slot / 2) / width) * 100}%`;
                tooltip.style.top = `${y(d.sessions)}px`;
                tooltip.hidden = false;
            });
            hit.addEventListener('mouseleave', () => {
                el.querySelector(`.bar[data-i="${i}"]`)?.classList.remove('hover');
                tooltip.hidden = true;
            });
        });
        $('daily-table').innerHTML = `<table><thead><tr><th>Jour</th><th>Visites</th><th>Visiteurs uniques</th></tr></thead><tbody>${
            daily.slice().reverse().map(d => `<tr><td>${esc(d.day)}</td><td class="num">${d.sessions}</td><td class="num">${d.visitors}</td></tr>`).join('')}</tbody></table>`;
    };

    const applicationsTable = (data) => {
        const apps = data.applications || [];
        const tracked = new Set(apps.map(a => a.ref));
        const others = (data.refs || []).filter(r => !tracked.has(r.ref));
        if (!apps.length && !others.length) {
            $('applications').innerHTML = '<p class="empty">Aucune candidature suivie pour l\'instant : créez votre premier lien ci-dessus.</p>';
            return;
        }
        const refDetail = Object.fromEntries((data.refs || []).map(r => [r.ref, r]));
        const row = (label, ref, created, sessions, last, duration, removable) => {
            const detail = refDetail[ref];
            const link = `${SITE}?ref=${ref}`;
            const status = sessions
                ? `<span class="chip ok"><i class="fas fa-eye"></i> Consulté ${sessions} fois</span>`
                : '<span class="chip wait"><i class="fas fa-hourglass-half"></i> Pas encore ouvert</span>';
            const sections = detail ? detail.sections.map(id => `<span class="chip">${esc(SECTION_NAMES[id] || id)}</span>`).join('') : '';
            const extra = detail ? [
                detail.downloads ? `<span class="chip accent"><i class="fas fa-file-arrow-down"></i> ${detail.downloads} téléchargement(s)</span>` : '',
                detail.questions ? `<span class="chip accent"><i class="fas fa-robot"></i> ${detail.questions} question(s)</span>` : '',
                ...detail.orgs.map(o => `<span class="chip"><i class="fas fa-building"></i> ${esc(o)}</span>`),
            ].join('') : '';
            return `<tr>
                <td><strong>${esc(label)}</strong><div class="small muted">${created ? `créée le ${fmtDate(created, false)}` : 'lien non enregistré'}</div></td>
                <td><div class="link-cell"><code title="${esc(link)}">?ref=${esc(ref)}</code>
                    <button class="mini-btn" type="button" data-copy="${esc(link)}"><i class="fas fa-copy"></i> Copier</button></div></td>
                <td>${status}<div class="small muted" style="margin-top:4px">${last ? `dernière visite : ${fmtDate(last)}` : ''}${duration ? ` · ${fmtDuration(duration)} au total` : ''}</div></td>
                <td><div class="chips">${sections}${extra}</div></td>
                <td>${removable ? `<button class="mini-btn" type="button" data-delete="${esc(ref)}" title="Ne plus suivre"><i class="fas fa-trash"></i></button>` : ''}</td>
            </tr>`;
        };
        $('applications').innerHTML = `<table>
            <thead><tr><th>Candidature</th><th>Lien à envoyer</th><th>Statut</th><th>Consulté (période)</th><th></th></tr></thead>
            <tbody>
                ${apps.map(a => row(a.label, a.ref, a.created_at, a.sessions, a.last, a.totalDuration, true)).join('')}
                ${others.map(r => row(r.ref, r.ref, null, r.sessions, r.last, r.avgDuration * r.sessions, false)).join('')}
            </tbody></table>`;
    };

    const questionsList = (chat) => {
        barList($('chat-modes'), chat.byMode.map(m => ({ name: m.name === 'job' ? 'Analyse de fiche de poste' : 'Question libre', count: m.count })), { empty: 'Aucune question pour l\'instant.' });
        barList($('chat-providers'), chat.byProvider.map(p => ({ name: p.name, count: p.count })), { empty: 'Aucun modèle utilisé.' });
        if (!chat.recent.length) { $('questions').innerHTML = '<p class="empty">Aucune question pour l\'instant.</p>'; return; }
        $('questions').innerHTML = chat.recent.map(q => `
            <article class="question">
                <div class="meta">
                    <span>${fmtDate(q.at)}</span>
                    <span class="chip ${q.mode === 'job' ? 'accent' : ''}">${q.mode === 'job' ? '<i class="fas fa-clipboard-list"></i> Fiche de poste' : '<i class="fas fa-comment"></i> Question'}</span>
                    ${q.ref ? `<span class="chip ok"><i class="fas fa-paper-plane"></i> ${esc(q.ref)}</span>` : ''}
                    ${q.country ? `<span>${esc(regionName(q.country))}</span>` : ''}
                    ${q.org ? `<span>· ${esc(q.org)}</span>` : ''}
                    <span>· ${q.ok ? esc(q.provider || '') : 'réponse hors ligne'}</span>
                </div>
                <p>${esc(plainQuestion(q.question))}</p>
            </article>`).join('');
    };

    // --- Dernières visites : liste lisible, détail complet au clic ---------------------------
    const iconClass = k => `${k === 'linkedin' || k === 'github' ? 'fab' : 'fas'} ${EVENT_NAMES[k][1]}`;
    const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
    const appLabel = ref => (lastData?.applications || []).find(a => a.ref === ref)?.label || ref;
    const place = v => [v.city, v.country ? regionName(v.country) : null].filter(Boolean).join(', ') || 'Lieu inconnu';
    const questionCount = v => Math.max(v.questions?.length || 0, (v.events.chat_question || 0) + (v.events.chat_job || 0));

    // Résumé en mots de ce que la personne a fait, par ordre d'importance
    const summary = (v) => {
        const e = v.events;
        const parts = [];
        if (e.cv_fr || e.cv_en) parts.push(`CV téléchargé${e.cv_fr && e.cv_en ? ' (FR et EN)' : e.cv_en ? ' (EN)' : ''}`);
        if (e.reco) parts.push('lettre de recommandation ouverte');
        if (e.chat_job) parts.push(plural(e.chat_job, 'fiche de poste analysée', 'fiches de poste analysées'));
        const q = questionCount(v) - (e.chat_job || 0);
        if (q > 0) parts.push(plural(q, 'question à l\'assistant', 'questions à l\'assistant'));
        else if (e.chat_open && !e.chat_job) parts.push('assistant ouvert');
        if (e.linkedin) parts.push('LinkedIn visité');
        if (e.email) parts.push('clic sur un e-mail');
        if (e.demo) parts.push('démo DASIA ouverte');
        if (e.github) parts.push('GitHub visité');
        if (e.project_open) parts.push(plural(e.project_open, 'projet détaillé', 'projets détaillés'));
        if (e.search) parts.push('recherche utilisée');
        if (!parts.length) return 'Lecture seule';
        const text = parts.slice(0, 3).join(' · ');
        return parts.length > 3 ? `${text} · +${parts.length - 3}` : text;
    };

    const FILTERS = {
        all: () => true,
        ref: v => !!v.ref,
        chat: v => questionCount(v) > 0,
        cv: v => v.events.cv_fr || v.events.cv_en || v.events.reco,
        long: v => v.duration >= 60,
    };
    let visitFilter = 'all';
    let visitLimit = 25;

    const recentList = () => {
        const visits = (lastData?.recent || []).filter(FILTERS[visitFilter]);
        if (!visits.length) {
            $('recent').innerHTML = `<p class="empty">${visitFilter === 'all' ? 'Pas encore de visite enregistrée.' : 'Aucune visite ne correspond à ce filtre.'}</p>`;
            return;
        }
        const shown = visits.slice(0, visitLimit);
        $('recent').innerHTML = shown.map(v => {
            const read = v.sections.length;
            const origin = v.ref ? `<i class="fas fa-paper-plane" style="color:var(--ok)"></i> ${esc(appLabel(v.ref))}` : esc(v.source);
            return `<button class="visit" type="button" data-visit="${esc(v.id)}" aria-label="Voir le détail de la visite du ${esc(fmtDate(v.at))}">
                <span class="when"><strong>${esc(fmtDate(v.at))}</strong><span>${esc(DEVICE_NAMES[v.device] || v.device || '')} · ${esc((v.lang || '').toUpperCase())}</span></span>
                <span class="who"><strong>${origin}</strong><span>${esc(place(v))}${v.org ? ` · ${esc(v.org)}` : ''}</span></span>
                <span class="time">${fmtDuration(v.duration)}<span>${v.maxScroll} % lu</span></span>
                <span class="reading read-meter">${read} section${read > 1 ? 's' : ''} sur 9
                    <span class="bar-track"><span class="bar-fill" style="width:${(read / 9) * 100}%"></span></span></span>
                <span class="did">${esc(summary(v))}</span>
                <i class="fas fa-chevron-right chev" aria-hidden="true"></i>
            </button>`;
        }).join('') + (visits.length > visitLimit
            ? `<button class="btn btn-ghost more" type="button" id="more-visits">Afficher plus (${visits.length - visitLimit} autres)</button>` : '');
    };

    const drawer = $('drawer');
    let lastFocus = null;
    const openVisit = (id) => {
        const v = (lastData?.recent || []).find(x => x.id === id);
        if (!v) return;
        const date = new Date(v.at);
        $('drawer-title').textContent = `Visite du ${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        $('drawer-sub').textContent = `${v.ref ? `Candidature : ${appLabel(v.ref)}` : v.source} · ${place(v)}`;

        const maxTime = Math.max(...Object.values(v.sectionTime || {}), 1);
        const sectionRows = Object.keys(SECTION_NAMES).map(id => {
            const t = (v.sectionTime || {})[id] || 0;
            return { name: SECTION_NAMES[id], count: t >= 2 ? t : 0, seconds: t };
        });
        const actions = Object.keys(EVENT_NAMES).filter(k => v.events[k]);
        const questions = v.questions || [];

        $('drawer-body').innerHTML = `
            <section class="facts">
                <div class="fact"><span>Durée</span><strong>${fmtDuration(v.duration)}</strong></div>
                <div class="fact"><span>Page parcourue</span><strong>${v.maxScroll} %</strong></div>
                <div class="fact"><span>Sections lues</span><strong>${v.sections.length} / 9</strong></div>
            </section>
            <section>
                <h3><i class="fas fa-user"></i> Le visiteur</h3>
                <dl class="info">
                    ${v.ref ? `<dt>Candidature</dt><dd><span class="chip ok"><i class="fas fa-paper-plane"></i> ${esc(appLabel(v.ref))}</span></dd>` : ''}
                    <dt>Arrivé par</dt><dd>${esc(v.ref ? `lien personnel (?ref=${v.ref})` : v.source)}${v.referrer ? ` <span class="muted">(${esc(v.referrer)})</span>` : ''}</dd>
                    <dt>Lieu</dt><dd>${esc(place(v))}</dd>
                    <dt>Réseau</dt><dd>${esc(v.org || 'Inconnu')}</dd>
                    <dt>Appareil</dt><dd>${esc(DEVICE_NAMES[v.device] || v.device || 'Inconnu')}</dd>
                    <dt>Langue</dt><dd>${v.lang === 'en' ? 'Anglais' : 'Français'}${v.events.lang_en ? ' (est passé en anglais)' : ''}</dd>
                </dl>
            </section>
            <section>
                <h3><i class="fas fa-book-open-reader"></i> Temps passé par section</h3>
                <div class="bars" id="drawer-sections"></div>
            </section>
            <section>
                <h3><i class="fas fa-hand-pointer"></i> Ce qu'il a fait</h3>
                ${actions.length ? `<ul class="action-list">${actions.map(k => `
                    <li><i class="${iconClass(k)}" aria-hidden="true"></i>${esc(EVENT_NAMES[k][0])}${v.events[k] > 1 ? `<span class="count">× ${v.events[k]}</span>` : ''}</li>`).join('')}</ul>`
                    : '<p class="empty">Aucune action : il a seulement lu le portfolio.</p>'}
            </section>
            <section>
                <h3><i class="fas fa-robot"></i> Questions à l'assistant</h3>
                ${questions.length ? `<div class="questions" style="max-height:none">${questions.map(q => `
                    <article class="question">
                        <div class="meta">
                            <span>${esc(new Date(q.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))}</span>
                            <span class="chip ${q.mode === 'job' ? 'accent' : ''}">${q.mode === 'job' ? '<i class="fas fa-clipboard-list"></i> Fiche de poste' : '<i class="fas fa-comment"></i> Question'}</span>
                            <span>${q.ok ? esc(q.provider || '') : 'réponse hors ligne'}</span>
                        </div>
                        <p>${esc(plainQuestion(q.question))}</p>
                    </article>`).join('')}</div>`
                    : '<p class="empty">Aucune question posée pendant cette visite.</p>'}
            </section>`;
        barList($('drawer-sections'), sectionRows, { max: maxTime, value: r => (r.seconds >= 2 ? fmtDuration(r.seconds) : 'non lue') });

        lastFocus = document.activeElement;
        $('drawer-backdrop').hidden = false;
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        $('drawer-body').scrollTop = 0;
        drawer.focus();
    };
    const closeVisit = () => {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        $('drawer-backdrop').hidden = true;
        lastFocus?.focus();
    };
    $('drawer-close').addEventListener('click', closeVisit);
    $('drawer-backdrop').addEventListener('click', closeVisit);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeVisit(); });
    $('recent').addEventListener('click', (e) => {
        if (e.target.closest('#more-visits')) { visitLimit += 25; recentList(); return; }
        const item = e.target.closest('[data-visit]');
        if (item) openVisit(item.dataset.visit);
    });
    $('visit-filters').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-filter]');
        if (!btn) return;
        visitFilter = btn.dataset.filter;
        visitLimit = 25;
        $('visit-filters').querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
        recentList();
    });

    let lastData = null;
    const render = (data) => {
        lastData = data;
        $('updated').textContent = `Mis à jour ${new Date(data.generatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · ${data.days} derniers jours`;
        tiles(data.totals);
        dailyChart(data.daily);
        applicationsTable(data);
        barList($('sections'), data.sections.map(s => ({ name: SECTION_NAMES[s.id] || s.id, count: s.share, seconds: s.avgSeconds })),
            { max: 1, value: r => `${pct(r.count)} · ${fmtDuration(r.seconds)}` });
        barList($('events'), Object.entries(EVENT_NAMES).map(([k, [name, icon]]) => ({ name, icon: `${k === 'linkedin' || k === 'github' ? 'fab' : 'fas'} ${icon}`, count: data.events[k] || 0 }))
            .filter(r => r.count).sort((a, b) => b.count - a.count), { empty: 'Aucune action pour l\'instant.' });
        barList($('sources'), data.sources.slice(0, 10));
        barList($('orgs'), data.orgs.slice(0, 10));
        barList($('countries'), data.countries.slice(0, 8).map(c => ({ name: regionName(c.name), count: c.count })));
        barList($('cities'), data.cities.slice(0, 8), { empty: '' });
        barList($('devices'), data.devices.map(d => ({ name: DEVICE_NAMES[d.name] || d.name, count: d.count })));
        barList($('langs'), data.langs.map(l => ({ name: l.name === 'en' ? 'Anglais' : 'Français', count: l.count })));
        questionsList(data.chat);
        recentList();
    };

    const load = async () => {
        $('refresh').querySelector('i').classList.add('fa-spin');
        try {
            render(await api(`/admin/stats?days=${days}`));
        } catch (error) {
            if (error.message === 'unauthorized') { logout(); $('login-error').textContent = 'Session expirée : reconnectez-vous.'; }
            else $('updated').textContent = 'Impossible de charger les données. Réessayez dans un instant.';
        } finally {
            $('refresh').querySelector('i').classList.remove('fa-spin');
        }
    };

    const show = (dashboard) => {
        $('login').hidden = dashboard;
        $('dashboard').hidden = !dashboard;
    };
    const logout = () => { store.clear(); token = null; show(false); $('password').value = ''; };

    $('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        $('login-error').textContent = '';
        const remember = $('remember').checked;
        try {
            const response = await fetch(`${API}/admin/login`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ password: $('password').value.trim(), remember }),
            });
            $('password').value = '';
            if (!response.ok) throw new Error(response.status === 401 ? 'unauthorized' : response.status === 429 ? 'rate_limited' : 'error');
            token = (await response.json()).token;
            store.set(token, remember);
            show(true);
            render(await api(`/admin/stats?days=${days}`));
        } catch (error) {
            token = null;
            $('login-error').textContent = error.message === 'unauthorized' ? 'Mot de passe incorrect.'
                : error.message === 'rate_limited' ? 'Trop de tentatives : accès bloqué 15 minutes.' : 'Connexion impossible pour le moment.';
        }
    });

    $('period').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-days]');
        if (!btn) return;
        days = Number(btn.dataset.days);
        $('period').querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
        load();
    });
    $('refresh').addEventListener('click', load);
    $('logout').addEventListener('click', logout);

    const themeIcon = () => { $('theme').querySelector('i').className = document.documentElement.getAttribute('data-theme') === 'dark' ? 'fas fa-sun' : 'fas fa-moon'; };
    $('theme').addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('preferred-theme', next); } catch { /* stockage indisponible */ }
        themeIcon();
    });
    themeIcon();

    // Candidatures : création d'un lien, copie, suppression
    $('app-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const label = $('app-label').value.trim();
        const base = slugify(label) || 'candidature';
        const existing = new Set((lastData?.applications || []).map(a => a.ref));
        let ref = base;
        for (let n = 2; existing.has(ref); n++) ref = `${base}-${n}`;
        try {
            await api('/admin/applications', { method: 'POST', body: JSON.stringify({ ref, label }) });
            $('app-label').value = '';
            await load();
            navigator.clipboard?.writeText(`${SITE}?ref=${ref}`).catch(() => {});
        } catch { alert('Impossible de créer le lien pour le moment.'); }
    });
    $('applications').addEventListener('click', async (e) => {
        const copy = e.target.closest('[data-copy]');
        if (copy) {
            try { await navigator.clipboard.writeText(copy.dataset.copy); copy.innerHTML = '<i class="fas fa-check"></i> Copié'; }
            catch { prompt('Copiez ce lien :', copy.dataset.copy); }
            setTimeout(() => { copy.innerHTML = '<i class="fas fa-copy"></i> Copier'; }, 1600);
            return;
        }
        const del = e.target.closest('[data-delete]');
        if (del && confirm('Ne plus suivre cette candidature ? Les visites déjà enregistrées restent dans les statistiques.')) {
            await api(`/admin/applications?ref=${encodeURIComponent(del.dataset.delete)}`, { method: 'DELETE' }).catch(() => {});
            load();
        }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { if (lastData) dailyChart(lastData.daily); }, 150);
    });

    if (token) { show(true); load(); } else show(false);
})();
