"""Génère la base de connaissances de l'assistant IA à partir de index.html.

Le portfolio est la seule source de vérité : relancer ce script après chaque
modification du site, puis commiter les fichiers produits.

    python3 tools/build_knowledge.py

Produit :
    assistant/knowledge.md          version complète (modèle principal)
    assistant/knowledge-compact.md  version condensée (modèle de secours, quotas plus serrés)
"""
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'index.html'
OUT_DIR = ROOT / 'assistant'

BLOCK_TAGS = {'p', 'li', 'h1', 'h2', 'h3', 'h4', 'dt', 'dd', 'figcaption', 'div', 'span', 'article', 'ul', 'ol', 'dl', 'section', 'header', 'aside', 'figure', 'details', 'summary', 'br'}
SKIP_TAGS = {'script', 'style', 'button', 'svg', 'nav', 'kbd'}
# Éléments d'interface sans valeur informative (menus, numéros de section, indications)
UI_SKIP = {'hero-buttons', 'section-kicker', 'filter-bar', 'diagram-hint', 'reco-menu', 'search-kbd'}
# Classes ignorées dans la version condensée
COMPACT_SKIP = {'tech-details', 'company-preview', 'project-content', 'diagram', 'extras-card', 'axis-proof', 'research-block'}


class KnowledgeParser(HTMLParser):
    def __init__(self, compact=False):
        super().__init__(convert_charrefs=True)
        self.compact = compact
        self.in_main = False
        self.skip_depth = 0
        self.stack = []          # (tag, skipping?)
        self.lines = []
        self.buffer = ''
        self.dt = None

    # --- utilitaires -------------------------------------------------
    def flush(self, prefix=''):
        text = re.sub(r'\s+', ' ', self.buffer).strip()
        self.buffer = ''
        if text:
            self.lines.append(prefix + text)

    def current_block(self):
        for tag, _ in reversed(self.stack):
            if tag in ('li', 'h1', 'h2', 'h3', 'h4', 'dt', 'dd', 'p', 'figcaption'):
                return tag
        return None

    # --- analyse ------------------------------------------------------
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        classes = set((a.get('class') or '').split())
        if tag == 'main':
            self.in_main = True
        if not self.in_main:
            return
        if tag in ('img', 'input', 'br', 'meta', 'link'):  # éléments vides
            if tag == 'br':
                self.buffer += ' '
            return
        skipping = bool(tag in SKIP_TAGS or (a.get('aria-hidden') == 'true' and tag != 'span'))
        if classes & UI_SKIP:
            skipping = True
        if self.compact and classes & COMPACT_SKIP:
            skipping = True
        if skipping:
            self.skip_depth += 1
        self.stack.append((tag, skipping))
        if self.skip_depth:
            return
        if tag == 'section' and a.get('id'):
            self.flush()
            self.lines.append('')
            self.lines.append(f'## [section #{a["id"]}]')
        elif tag in BLOCK_TAGS:
            self.flush(self.prefix_for(self.current_block_before_push()))

    def current_block_before_push(self):
        for tag, _ in reversed(self.stack[:-1]):
            if tag in ('li', 'h1', 'h2', 'h3', 'h4', 'dt', 'dd', 'p', 'figcaption'):
                return tag
        return None

    def prefix_for(self, tag):
        return {'h1': '# ', 'h2': '## ', 'h3': '### ', 'h4': '#### ', 'li': '- '}.get(tag, '')

    def handle_endtag(self, tag):
        if not self.in_main:
            return
        if tag == 'main':
            self.flush()
            self.in_main = False
            return
        if not self.stack:
            return
        # dépile jusqu'à la balise correspondante
        while self.stack:
            t, skipping = self.stack.pop()
            if skipping:
                self.skip_depth -= 1
            if t == tag:
                break
        if self.skip_depth:
            return
        if tag == 'dt':
            self.dt = re.sub(r'\s+', ' ', self.buffer).strip()
            self.buffer = ''
        elif tag == 'dd':
            dd = re.sub(r'\s+', ' ', self.buffer).strip()
            self.buffer = ''
            if self.dt or dd:
                self.lines.append(f'- {self.dt} : {dd}')
            self.dt = None
        elif tag in BLOCK_TAGS:
            self.flush(self.prefix_for(tag))

    def handle_data(self, data):
        if self.in_main and not self.skip_depth:
            self.buffer += data


def build(compact):
    parser = KnowledgeParser(compact=compact)
    parser.feed(SOURCE.read_text(encoding='utf-8'))
    parser.flush()
    lines, seen = [], set()
    for line in parser.lines:
        # supprime les doublons consécutifs et les libellés isolés sans intérêt
        if line and line in seen and not line.startswith('##'):
            continue
        seen.add(line)
        if lines and line == '' and lines[-1] == '':
            continue
        lines.append(line)
    header = [
        '# Profil – Adébayo Sergio DASSOUNDO',
        '',
        'Source : portfolio https://dassoundo.github.io/MyWebSite/ (contenu en français).',
        'Les identifiants « #section » correspondent aux ancres des sections du site.',
    ]
    return '\n'.join(header + lines).strip() + '\n'


if __name__ == '__main__':
    OUT_DIR.mkdir(exist_ok=True)
    for compact, name in ((False, 'knowledge.md'), (True, 'knowledge-compact.md')):
        text = build(compact)
        (OUT_DIR / name).write_text(text, encoding='utf-8')
        print(f'{name} : {len(text)} caractères (~{len(text) // 4} jetons)')
