/**
 * Mesure d'audience du portfolio (base Cloudflare D1, liaison DB) et tableau de bord admin.
 *
 * Anonyme et sans cookie : pas d'adresse IP stockée. Un visiteur est reconnu pour la journée
 * par une empreinte (hachage du jour, de l'IP, du navigateur et d'un sel secret), comme les
 * outils d'audience respectueux de la vie privée.
 *
 *   POST /track          { type: 'start' | 'update', sid, ... }   (appelé par le site)
 *   GET  /admin/stats    Authorization: Bearer <ADMIN_PASSWORD>     (page admin.html)
 *   POST /admin/applications  { ref, label }   DELETE /admin/applications?ref=…   (candidatures suivies)
 */

export const SECTIONS = ['accueil', 'axes', 'experience', 'projets', 'recherche', 'competences', 'education', 'leadership', 'contact'];
export const EVENTS = [
    'cv_fr', 'cv_en', 'reco', 'linkedin', 'github', 'email', 'search', 'lang_en', 'theme',
    'preview', 'project_open', 'chat_open', 'chat_question', 'chat_job', 'chat_file', 'chat_followup', 'demo',
];
const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget|python|monitor/i;
const RETENTION_DAYS = 365;

export const SCHEMA = [
    `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY, started_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, day TEXT NOT NULL,
        visitor TEXT, ref TEXT, referrer TEXT, country TEXT, city TEXT, org TEXT, device TEXT, lang TEXT,
        duration INTEGER DEFAULT 0, max_scroll INTEGER DEFAULT 0, sections TEXT DEFAULT '{}', events TEXT DEFAULT '{}'
    )`,
    'CREATE INDEX IF NOT EXISTS sessions_started ON sessions (started_at)',
    `CREATE TABLE IF NOT EXISTS chat (
        id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL, session TEXT, mode TEXT,
        question TEXT, provider TEXT, ok INTEGER
    )`,
    'CREATE INDEX IF NOT EXISTS chat_at ON chat (at)',
    `CREATE TABLE IF NOT EXISTS applications (
        ref TEXT PRIMARY KEY, label TEXT NOT NULL, created_at INTEGER NOT NULL
    )`,
];

// Candidatures suivies : chacune reçoit un lien personnel vers le portfolio (?ref=…)
export const refSlug = (value) => (typeof value === 'string' ? value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 60) : '');

export async function saveApplication(env, body) {
    const ref = refSlug(body?.ref);
    const label = clean(body?.label, 120);
    if (!ref || !label) return false;
    await env.DB.prepare('INSERT INTO applications (ref, label, created_at) VALUES (?, ?, ?) ON CONFLICT(ref) DO UPDATE SET label = excluded.label')
        .bind(ref, label, Date.now()).run();
    return true;
}

export async function deleteApplication(env, ref) {
    await env.DB.prepare('DELETE FROM applications WHERE ref = ?').bind(refSlug(ref)).run();
}

const clean = (value, max = 120) => (typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max) : null);
const int = (value, max) => Math.max(0, Math.min(max, Math.round(Number(value) || 0)));

async function sha256(text) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Ne garde que les sections et événements connus, avec des valeurs bornées
function sanitizeMap(map, keys, max) {
    const out = {};
    if (map && typeof map === 'object') for (const key of keys) if (map[key]) out[key] = int(map[key], max);
    return out;
}

export async function handleTrack(request, env, rateLimited = async () => false) {
    if (!env.DB) return new Response(null, { status: 204 });
    const ua = request.headers.get('user-agent') || '';
    if (BOT_UA.test(ua)) return new Response(null, { status: 204 });
    const raw = await request.text();
    if (raw.length > 8000) return new Response(null, { status: 413 });
    let body;
    try { body = JSON.parse(raw); } catch { return new Response(null, { status: 400 }); }
    const sid = typeof body.sid === 'string' && /^[a-z0-9]{8,32}$/.test(body.sid) ? body.sid : null;
    if (!sid) return new Response(null, { status: 400 });
    const now = Date.now();

    if (body.type === 'start') {
        if (await rateLimited()) return new Response(null, { status: 429 });
        const day = new Date(now).toISOString().slice(0, 10);
        const ip = request.headers.get('cf-connecting-ip') || '';
        const visitor = (await sha256(`${day}|${ip}|${ua}|${env.ANALYTICS_SALT || 'portfolio'}`)).slice(0, 16);
        const cf = request.cf || {};
        const device = ['mobile', 'tablet', 'desktop'].includes(body.device) ? body.device : 'desktop';
        await env.DB.prepare(`INSERT OR IGNORE INTO sessions (id, started_at, updated_at, day, visitor, ref, referrer, country, city, org, device, lang)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .bind(sid, now, now, day, visitor, refSlug(body.ref) || null, clean(body.referrer, 80), clean(cf.country, 2), clean(cf.city, 60),
                clean(cf.asOrganization, 80), device, body.lang === 'en' ? 'en' : 'fr')
            .run();
        return new Response(null, { status: 204 });
    }

    if (body.type === 'update') {
        await env.DB.prepare(`UPDATE sessions SET updated_at = ?, duration = MAX(duration, ?), max_scroll = MAX(max_scroll, ?),
            sections = ?, events = ? WHERE id = ? AND started_at > ?`)
            .bind(now, int(body.duration, 86400), int(body.maxScroll, 100),
                JSON.stringify(sanitizeMap(body.sections, SECTIONS, 86400)), JSON.stringify(sanitizeMap(body.events, EVENTS, 1000)),
                sid, now - 86400000)
            .run();
        return new Response(null, { status: 204 });
    }
    return new Response(null, { status: 400 });
}

// Question posée à l'assistant (appelée par /chat une fois la réponse terminée)
export async function logChat(env, { sid, mode, question, provider, ok }) {
    if (!env.DB) return;
    const text = mode === 'job' ? question.replace(/\s+/g, ' ').slice(0, 400) : question.slice(0, 500);
    await env.DB.prepare('INSERT INTO chat (at, session, mode, question, provider, ok) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(Date.now(), typeof sid === 'string' && /^[a-z0-9]{8,32}$/.test(sid) ? sid : null, mode, text, provider || null, ok ? 1 : 0)
        .run();
}

// Mot de passe comparé en temps constant (via leurs empreintes, de même longueur)
export async function isAdmin(request, env) {
    const header = request.headers.get('authorization') || '';
    const given = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!env.ADMIN_PASSWORD || !given) return false;
    const [a, b] = await Promise.all([sha256(given), sha256(env.ADMIN_PASSWORD)]);
    const ea = new TextEncoder().encode(a);
    const eb = new TextEncoder().encode(b);
    if (crypto.subtle.timingSafeEqual) return crypto.subtle.timingSafeEqual(ea, eb);
    let diff = 0;
    for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
    return diff === 0;
}

const parseJson = (text) => { try { return JSON.parse(text || '{}'); } catch { return {}; } };
const countBy = (rows, key) => {
    const map = new Map();
    for (const row of rows) { const k = key(row); if (k) map.set(k, (map.get(k) || 0) + 1); }
    return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
};
const median = (values) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};
// Origine lisible d'une visite : LinkedIn, Google, e-mail…
export function sourceName(referrer) {
    if (!referrer) return 'Accès direct';
    const host = referrer.toLowerCase();
    const known = [['linkedin', 'LinkedIn'], ['lnkd.in', 'LinkedIn'], ['mail.', 'E-mail'], ['google', 'Google'], ['bing', 'Bing'], ['duckduckgo', 'DuckDuckGo'],
        ['github', 'GitHub'], ['mail', 'E-mail'], ['outlook', 'E-mail'], ['teams', 'Teams'], ['facebook', 'Facebook'], ['t.co', 'X / Twitter'],
        ['twitter', 'X / Twitter'], ['x.com', 'X / Twitter'], ['chatgpt', 'ChatGPT'], ['perplexity', 'Perplexity'], ['indeed', 'Indeed'], ['welcome', 'Welcome to the Jungle']];
    for (const [needle, name] of known) if (host.includes(needle)) return name;
    return host.replace(/^www\./, '');
}

export async function stats(env, days) {
    const now = Date.now();
    const since = now - days * 86400000;
    await env.DB.prepare('DELETE FROM sessions WHERE started_at < ?').bind(now - RETENTION_DAYS * 86400000).run();
    await env.DB.prepare('DELETE FROM chat WHERE at < ?').bind(now - RETENTION_DAYS * 86400000).run();

    const { results: rows } = await env.DB.prepare('SELECT * FROM sessions WHERE started_at >= ? ORDER BY started_at DESC LIMIT 20000').bind(since).all();
    const { results: chats } = await env.DB.prepare('SELECT * FROM chat WHERE at >= ? ORDER BY at DESC LIMIT 5000').bind(since).all();
    const sessions = rows.map(r => ({ ...r, sections: parseJson(r.sections), events: parseJson(r.events), source: sourceName(r.referrer) }));

    const eventTotals = {};
    const sectionStats = Object.fromEntries(SECTIONS.map(id => [id, { reached: 0, seconds: 0 }]));
    for (const s of sessions) {
        for (const [k, v] of Object.entries(s.events)) eventTotals[k] = (eventTotals[k] || 0) + v;
        for (const [k, v] of Object.entries(s.sections)) if (sectionStats[k] && v >= 2) { sectionStats[k].reached++; sectionStats[k].seconds += v; }
    }
    const sectionsOut = SECTIONS.map(id => ({
        id, reached: sectionStats[id].reached,
        share: sessions.length ? sectionStats[id].reached / sessions.length : 0,
        avgSeconds: sectionStats[id].reached ? Math.round(sectionStats[id].seconds / sectionStats[id].reached) : 0,
    }));

    // Visites par jour, jours sans visite compris
    const dailyMap = new Map();
    for (let t = since; t <= now; t += 86400000) dailyMap.set(new Date(t).toISOString().slice(0, 10), { sessions: 0, visitors: new Set() });
    for (const s of sessions) { const d = dailyMap.get(s.day); if (d) { d.sessions++; d.visitors.add(s.visitor); } }
    const daily = [...dailyMap.entries()].map(([day, d]) => ({ day, sessions: d.sessions, visitors: d.visitors.size }));

    // Suivi des candidatures : un lien ?ref=… par candidature envoyée
    const refMap = new Map();
    for (const s of sessions) {
        if (!s.ref) continue;
        const r = refMap.get(s.ref) || { ref: s.ref, sessions: 0, visitors: new Set(), first: s.started_at, last: s.started_at, duration: 0, cv: 0, chat: 0, sections: new Set(), orgs: new Set(), countries: new Set() };
        r.sessions++; r.visitors.add(s.visitor); r.duration += s.duration;
        r.first = Math.min(r.first, s.started_at); r.last = Math.max(r.last, s.started_at);
        r.cv += (s.events.cv_fr || 0) + (s.events.cv_en || 0) + (s.events.reco || 0);
        r.chat += (s.events.chat_question || 0) + (s.events.chat_job || 0);
        Object.entries(s.sections).forEach(([k, v]) => { if (v >= 2) r.sections.add(k); });
        if (s.org) r.orgs.add(s.org);
        if (s.country) r.countries.add(s.country);
        refMap.set(s.ref, r);
    }
    // Toutes les visites d'une candidature, même antérieures à la période affichée
    const { results: apps } = await env.DB.prepare('SELECT * FROM applications ORDER BY created_at DESC').all();
    const refs = [...refMap.values()].map(r => ({
        ref: r.ref, sessions: r.sessions, visitors: r.visitors.size, first: r.first, last: r.last,
        avgDuration: Math.round(r.duration / r.sessions), downloads: r.cv, questions: r.chat,
        sections: SECTIONS.filter(id => r.sections.has(id)), orgs: [...r.orgs].slice(0, 5), countries: [...r.countries],
    })).sort((a, b) => b.last - a.last);

    const durations = sessions.map(s => s.duration);
    const visitors = new Set(sessions.map(s => s.visitor)).size;
    const chatSessions = sessions.filter(s => s.events.chat_question || s.events.chat_job).length;

    return {
        generatedAt: now, days,
        totals: {
            sessions: sessions.length, visitors,
            avgDuration: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
            medianDuration: median(durations),
            engaged: sessions.filter(s => s.duration >= 30).length,
            deepReads: sessions.filter(s => Object.values(s.sections).filter(v => v >= 2).length >= 4).length,
            avgScroll: sessions.length ? Math.round(sessions.reduce((a, s) => a + s.max_scroll, 0) / sessions.length) : 0,
            downloads: (eventTotals.cv_fr || 0) + (eventTotals.cv_en || 0) + (eventTotals.reco || 0),
            chatSessions, questions: chats.length, jobAnalyses: chats.filter(c => c.mode === 'job').length,
        },
        daily,
        sections: sectionsOut,
        events: eventTotals,
        sources: countBy(sessions, s => s.source),
        countries: countBy(sessions, s => s.country),
        cities: countBy(sessions, s => s.city && `${s.city}${s.country ? ` (${s.country})` : ''}`).slice(0, 15),
        orgs: countBy(sessions, s => s.org).slice(0, 15),
        devices: countBy(sessions, s => s.device),
        langs: countBy(sessions, s => s.lang),
        refs,
        applications: await Promise.all(apps.map(async (app) => {
            const all = await env.DB.prepare(`SELECT COUNT(*) AS sessions, MIN(started_at) AS first, MAX(started_at) AS last,
                SUM(duration) AS duration FROM sessions WHERE ref = ?`).bind(app.ref).first();
            return { ...app, sessions: all?.sessions || 0, first: all?.first || null, last: all?.last || null, totalDuration: all?.duration || 0 };
        })),
        chat: {
            byMode: countBy(chats, c => c.mode),
            byProvider: countBy(chats, c => c.provider || (c.ok ? null : 'Échec (mode hors ligne)')),
            recent: chats.slice(0, 60).map(c => {
                const s = sessions.find(x => x.id === c.session);
                return { at: c.at, mode: c.mode, question: c.question, provider: c.provider, ok: !!c.ok, country: s?.country || null, org: s?.org || null, ref: s?.ref || null };
            }),
        },
        // Détail de chaque visite (panneau du tableau de bord) : temps par section et questions posées
        recent: sessions.slice(0, 150).map(s => ({
            id: s.id, at: s.started_at, ref: s.ref, source: s.source, referrer: s.referrer,
            country: s.country, city: s.city, org: s.org, device: s.device, lang: s.lang,
            duration: s.duration, maxScroll: s.max_scroll,
            sections: SECTIONS.filter(id => (s.sections[id] || 0) >= 2), sectionTime: s.sections, events: s.events,
            questions: chats.filter(c => c.session === s.id).reverse()
                .map(c => ({ at: c.at, mode: c.mode, question: c.question, provider: c.provider, ok: !!c.ok })),
        })),
    };
}
