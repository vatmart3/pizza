#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Assemble le site à partir de src/. Aucune dépendance.

    python3 tools/build.py

Chaque page commence par un bloc de méta-données `---` (clé: valeur).

Bilingue
--------
Les textes traduisibles s'écrivent en ligne : [[français||anglais]].
Les deux versions restent côte à côte dans le même fichier, ce qui rend
la désynchronisation impossible. Le français est produit à la racine,
l'anglais dans /en/.

Les chemins vers assets/ sont réécrits automatiquement pour les pages
anglaises (../assets/…), afin que le site reste servable depuis
n'importe quel sous-dossier.
"""
import re, pathlib, datetime, html as _html

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
SITE = 'https://lespierresblanches.com'
LANGS = [('fr', '', ''), ('en', 'en/', '../')]   # code, dossier de sortie, préfixe des ressources

layouts = {'': (SRC / 'layout.html').read_text(encoding='utf-8')}
for lf in SRC.glob('layout-*.html'):
    layouts[lf.stem.split('-', 1)[1]] = lf.read_text(encoding='utf-8')
partials = {p.stem: p.read_text(encoding='utf-8') for p in (SRC / 'partials').glob('*.html')}

BI = re.compile(r'\[\[(.*?)\|\|(.*?)\]\]', re.S)


def pick(text, lang):
    """Garde le côté français ou anglais de chaque [[a||b]]."""
    return BI.sub(lambda m: m.group(1) if lang == 'fr' else m.group(2), text)


def retarget(out, prefix):
    """Réécrit les chemins de ressources pour une page servie dans un sous-dossier."""
    if not prefix:
        return out
    out = re.sub(r'(?<=[\s"\'])assets/', prefix + 'assets/', out)
    for f in ('manifest.webmanifest', 'sw.js', 'sitemap.xml'):
        out = out.replace('"%s"' % f, '"%s%s"' % (prefix, f))
    return out


pages, built = [], 0
for f in sorted((SRC / 'pages').glob('*.html')):
    raw = f.read_text(encoding='utf-8')
    m = re.match(r'---\n(.*?)\n---\n(.*)', raw, re.S)
    meta = {k.strip(): v.strip() for k, v in
            (l.split(':', 1) for l in m.group(1).splitlines() if ':' in l)}
    body = m.group(2)
    name = f.name
    # Les pages purement techniques (planche à imprimer) restent en français seul.
    langs = LANGS if meta.get('translate', 'yes') != 'no' else LANGS[:1]

    for lang, folder, prefix in langs:
        ctx = dict(meta)
        ctx['content'] = body
        ctx.update(site=SITE, year=str(datetime.date.today().year), lang=lang, root=prefix)
        ctx.setdefault('body_class', '')
        ctx.setdefault('preload', '')
        ctx.setdefault('robots', 'index,follow')
        slug = '' if name == 'index.html' else name
        ctx.setdefault('canonical', '%s/%s%s' % (SITE, folder, slug))
        ctx['og_image'] = '%s/assets/img/og.jpg' % SITE
        ctx['og_locale'] = 'fr_FR' if lang == 'fr' else 'en_GB'
        # Lien vers la même page dans l'autre langue.
        ctx['other_href'] = ('en/' + slug) if lang == 'fr' else ('../' + slug)
        ctx['other_lang'] = 'EN' if lang == 'fr' else 'FR'
        ctx['other_code'] = 'en' if lang == 'fr' else 'fr'
        ctx['other_label'] = 'English' if lang == 'fr' else 'Français'
        ctx['alt_fr'] = '%s/%s' % (SITE, slug)
        ctx['alt_en'] = '%s/en/%s' % (SITE, slug)

        out = layouts[meta.get('layout', '')]
        for k, v in partials.items():
            out = out.replace('{{> ' + k + '}}', v)
            ctx['content'] = ctx['content'].replace('{{> ' + k + '}}', v)
        for k, v in ctx.items():
            out = out.replace('{{' + k + '}}', v)
        out = re.sub(r'\{\{[a-z_]+\}\}', '', out)
        out = pick(out, lang)
        out = retarget(out, prefix)

        dest = ROOT / folder / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(out, encoding='utf-8')
        built += 1
        if meta.get('robots', 'index') != 'noindex' and 'noindex' not in meta.get('robots', ''):
            pages.append((folder + slug, meta.get('priority', '0.6')))
    print('✓', name, '(%s)' % ' + '.join(l for l, _, _ in langs))

today = datetime.date.today().isoformat()
urls = ''.join(
    '  <url><loc>%s/%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>\n' % (SITE, n, today, p)
    for n, p in pages)
(ROOT / 'sitemap.xml').write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls + '</urlset>\n', encoding='utf-8')
print('✓ sitemap.xml — %d fichiers écrits, %d adresses indexées' % (built, len(pages)))
