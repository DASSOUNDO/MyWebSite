// Tests de la mesure d'audience et du tableau de bord, sur une vraie base SQLite en mémoire
// (même dialecte que Cloudflare D1). Lancer (dans assistant-worker/) : npm test
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/index.js';
import { SCHEMA, sourceName } from '../src/analytics.js';

const ORIGIN = 'https://dassoundo.github.io';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36';

// Adaptateur minimal reproduisant l'API D1 (prepare → bind → run / all / first)
function fakeD1() {
    const db = new DatabaseSync(':memory:');
    SCHEMA.forEach(sql => db.exec(sql));
    const wrap = (sql, args = []) => ({
        bind: (...values) => wrap(sql, values),
        run: async () => db.prepare(sql).run(...args),
        all: async () => ({ results: db.prepare(sql).all(...args) }),
        first: async () => db.prepare(sql).get(...args) ?? null,
    });
    return { prepare: sql => wrap(sql), raw: db };
}

let env;
beforeEach(() => {
    env = {
        ALLOWED_ORIGINS: ORIGIN,
        KNOWLEDGE_BASE_URL: 'https://example.test/assistant',
        PROVIDERS: 'gemini:gemini-3-test|Gemini 3 Flash',
        GEMINI_API_KEY: 'cle',
        ADMIN_PASSWORD: 'mot-de-passe-tres-long',
        DB: fakeD1(),
    };
    globalThis.fetch = async (url) => {
        url = String(url);
        if (url.endsWith('.md')) return new Response('# Profil');
        if (url.includes('generativelanguage')) {
            return new Response(`data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Réponse.' }] } }] })}\n\n`);
        }
        throw new Error(`URL inattendue : ${url}`);
    };
});

async function request(path, { method = 'POST', body, headers = {}, cf } = {}) {
    const pending = [];
    const req = new Request(`https://worker.test${path}`, {
        method,
        headers: { origin: ORIGIN, 'user-agent': UA, 'cf-connecting-ip': '203.0.113.7', ...headers },
        body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    if (cf) Object.defineProperty(req, 'cf', { value: cf });
    const response = await worker.fetch(req, env, { waitUntil: p => pending.push(p) });
    const text = await response.text();
    await Promise.all(pending);
    return { response, text };
}
const admin = (days = 30) => request(`/admin/stats?days=${days}`, { method: 'GET', headers: { authorization: `Bearer ${env.ADMIN_PASSWORD}` } });

test('une visite est enregistrée sans IP, avec pays, organisation et lien de candidature', async () => {
    const { response } = await request('/track', {
        body: { type: 'start', sid: 'abc12345', ref: 'ets-c5i', referrer: 'www.linkedin.com', device: 'desktop', lang: 'fr' },
        cf: { country: 'CA', city: 'Montreal', asOrganization: 'Ecole de technologie superieure' },
    });
    assert.equal(response.status, 204);
    const row = env.DB.raw.prepare('SELECT * FROM sessions').get();
    assert.equal(row.ref, 'ets-c5i');
    assert.equal(row.country, 'CA');
    assert.equal(row.org, 'Ecole de technologie superieure');
    assert.equal(row.visitor.length, 16);
    assert.ok(!JSON.stringify(row).includes('203.0.113.7'), "l'adresse IP n'est jamais stockée");
});

test('la mise à jour ne garde que les sections et actions connues', async () => {
    await request('/track', { body: { type: 'start', sid: 'abc12345' } });
    await request('/track', {
        body: { type: 'update', sid: 'abc12345', duration: 95, maxScroll: 140, sections: { axes: 12, competences: 8, piratage: 99 }, events: { cv_fr: 1, inconnu: 5 } },
    });
    const row = env.DB.raw.prepare('SELECT * FROM sessions').get();
    assert.equal(row.duration, 95);
    assert.equal(row.max_scroll, 100);
    assert.deepEqual(JSON.parse(row.sections), { axes: 12, competences: 8 });
    assert.deepEqual(JSON.parse(row.events), { cv_fr: 1 });
});

test('les robots et les identifiants invalides sont ignorés', async () => {
    await request('/track', { body: { type: 'start', sid: 'abc12345' }, headers: { 'user-agent': 'Googlebot/2.1' } });
    await request('/track', { body: { type: 'start', sid: 'pas valide !' } });
    assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM sessions').get().n, 0);
});

test('une autre origine ne peut pas envoyer de mesures', async () => {
    const { response } = await request('/track', { body: { type: 'start', sid: 'abc12345' }, headers: { origin: 'https://evil.test' } });
    assert.equal(response.status, 403);
});

test('le tableau de bord exige le mot de passe', async () => {
    assert.equal((await request('/admin/stats', { method: 'GET' })).response.status, 401);
    assert.equal((await request('/admin/stats', { method: 'GET', headers: { authorization: 'Bearer mauvais' } })).response.status, 401);
    assert.equal((await admin()).response.status, 200);
});

test('les questions à l\'assistant sont enregistrées et rattachées à la visite', async () => {
    await request('/track', { body: { type: 'start', sid: 'abc12345', ref: 'ets-c5i' }, cf: { country: 'CA' } });
    await request('/chat', { body: { lang: 'fr', mode: 'job', sid: 'abc12345', messages: [{ role: 'user', content: 'Fiche de poste : ingénieur IA multi-agents' }] } });
    const { text } = await admin();
    const data = JSON.parse(text);
    assert.equal(data.totals.questions, 1);
    assert.equal(data.totals.jobAnalyses, 1);
    assert.equal(data.chat.recent[0].ref, 'ets-c5i');
    assert.equal(data.chat.recent[0].provider, 'Gemini 3 Flash');
});

test('statistiques : sections atteintes, sources, suivi des candidatures', async () => {
    await request('/track', { body: { type: 'start', sid: 'visite001', ref: 'ets-c5i', referrer: 'www.linkedin.com' }, cf: { country: 'CA' } });
    await request('/track', { body: { type: 'update', sid: 'visite001', duration: 120, sections: { accueil: 10, axes: 30, recherche: 25, competences: 1 }, events: { cv_fr: 1 } } });
    await request('/track', { body: { type: 'start', sid: 'visite002', referrer: 'www.google.com' }, cf: { country: 'FR' } });
    await request('/track', { body: { type: 'update', sid: 'visite002', duration: 20, sections: { accueil: 15 } } });
    const data = JSON.parse((await admin()).text);
    assert.equal(data.totals.sessions, 2);
    assert.equal(data.totals.downloads, 1);
    const axes = data.sections.find(s => s.id === 'axes');
    assert.equal(axes.reached, 1);
    assert.equal(axes.avgSeconds, 30);
    assert.equal(data.sections.find(s => s.id === 'competences').reached, 0, 'moins de 2 s ne compte pas comme une lecture');
    assert.deepEqual(data.sources.map(s => s.name).sort(), ['Google', 'LinkedIn']);
    assert.equal(data.refs[0].ref, 'ets-c5i');
    assert.deepEqual(data.refs[0].sections, ['accueil', 'axes', 'recherche']);
    assert.equal(data.daily.reduce((n, d) => n + d.sessions, 0), 2);
});

test('origine lisible des visites', () => {
    assert.equal(sourceName(''), 'Accès direct');
    assert.equal(sourceName('lnkd.in'), 'LinkedIn');
    assert.equal(sourceName('mail.google.com'), 'E-mail');
    assert.equal(sourceName('www.google.com'), 'Google');
    assert.equal(sourceName('www.etsmtl.ca'), 'etsmtl.ca');
});

test('candidatures suivies : création, visites rattachées, suppression', async () => {
    const auth = { authorization: `Bearer ${env.ADMIN_PASSWORD}`, 'content-type': 'application/json' };
    assert.equal((await request('/admin/applications', { body: { ref: 'ETS C5I!', label: 'ÉTS – Doctorat C5I' } })).response.status, 401);
    assert.equal((await request('/admin/applications', { body: { ref: 'ETS C5I!', label: 'ÉTS – Doctorat C5I' }, headers: auth })).response.status, 200);
    await request('/track', { body: { type: 'start', sid: 'visite003', ref: 'etsc5i' } });
    await request('/track', { body: { type: 'update', sid: 'visite003', duration: 75 } });
    let data = JSON.parse((await admin()).text);
    assert.equal(data.applications.length, 1);
    assert.equal(data.applications[0].ref, 'etsc5i');
    assert.equal(data.applications[0].sessions, 1);
    assert.equal(data.applications[0].totalDuration, 75);
    await request('/admin/applications?ref=etsc5i', { method: 'DELETE', headers: auth });
    data = JSON.parse((await admin()).text);
    assert.equal(data.applications.length, 0);
});
