#!/usr/bin/env python3
"""Assemble les pages HTML à partir de src/layout.html et src/pages/*.html.
Usage : python3 tools/build.py   (aucune dépendance)
Chaque page commence par un bloc de méta-données `---` (clé: valeur)."""
import re, pathlib, datetime
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
layout = (SRC / 'layout.html').read_text(encoding='utf-8')
partials = {p.stem: p.read_text(encoding='utf-8') for p in (SRC / 'partials').glob('*.html')}
SITE = 'https://lespierresblanches.com'
pages = []
for f in sorted((SRC / 'pages').glob('*.html')):
    raw = f.read_text(encoding='utf-8')
    m = re.match(r'---\n(.*?)\n---\n(.*)', raw, re.S)
    meta = dict(l.split(':', 1) for l in m.group(1).splitlines() if ':' in l)
    meta = {k.strip(): v.strip() for k, v in meta.items()}
    content = m.group(2)
    out = layout
    ctx = {**meta, 'content': content, 'site': SITE, 'year': str(datetime.date.today().year)}
    ctx.setdefault('body_class', '')
    ctx.setdefault('preload', '')
    ctx.setdefault('robots', 'index,follow')
    ctx['canonical'] = f"{SITE}/{'' if f.name == 'index.html' else f.name}"
    ctx['og_image'] = f"{SITE}/assets/img/og.jpg"
    for k, v in partials.items():
        out = out.replace('{{> ' + k + '}}', v)
        ctx['content'] = ctx['content'].replace('{{> ' + k + '}}', v)
    for k, v in ctx.items():
        out = out.replace('{{' + k + '}}', v)
    out = re.sub(r'\{\{[a-z_]+\}\}', '', out)
    (ROOT / f.name).write_text(out, encoding='utf-8')
    if meta.get('robots', 'index') != 'noindex':
        pages.append((f.name, meta.get('priority', '0.6')))
    print('✓', f.name)
# sitemap
today = datetime.date.today().isoformat()
urls = ''.join(f"  <url><loc>{SITE}/{'' if n == 'index.html' else n}</loc><lastmod>{today}</lastmod><priority>{p}</priority></url>\n" for n, p in pages)
(ROOT / 'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n', encoding='utf-8')
print('✓ sitemap.xml')
