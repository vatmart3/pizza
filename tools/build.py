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
import re, math, pathlib, datetime, html as _html
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
SITE = 'https://lespierresblanches.com'
LANGS = [('fr', '', ''), ('en', 'en/', '../')]   # code, dossier de sortie, préfixe des ressources

layouts = {'': (SRC / 'layout.html').read_text(encoding='utf-8')}
for lf in SRC.glob('layout-*.html'):
    layouts[lf.stem.split('-', 1)[1]] = lf.read_text(encoding='utf-8')
partials = {p.stem: p.read_text(encoding='utf-8') for p in (SRC / 'partials').glob('*.html')}

BI = re.compile(r'\[\[(.*?)\|\|(.*?)\]\]', re.S)

# ----------------------------------------------------------------------
# Le coucher du soleil, calculé à la construction.
#
# Le même algorithme (NOAA) tourne déjà dans assets/js/app.js pour
# afficher l'heure du soir même. Ici il sert à écrire un tableau en
# dur dans la page : un moteur de recherche lit le texte produit, pas
# le résultat d'un script. Les deux implémentations ont été comparées
# jour par jour sur une année entière — elles donnent la même minute.
# ----------------------------------------------------------------------
SUN = {'lat': 43.3934, 'lng': 3.6802, 'zone': 'Europe/Paris'}
MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December']


def sunset_utc(d, lat, lng):
    rd = math.pi / 180
    d0 = datetime.datetime(d.year, d.month, d.day, tzinfo=datetime.timezone.utc).timestamp() * 1000
    jc = (d0 / 864e5 + 2440587.5 - 2451545) / 36525
    geom = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360
    anom = 357.52911 + jc * (35999.05029 - 0.0001537 * jc)
    ecc = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc)
    ctr = (math.sin(rd * anom) * (1.914602 - jc * (0.004817 + 0.000014 * jc))
           + math.sin(rd * 2 * anom) * (0.019993 - 0.000101 * jc)
           + math.sin(rd * 3 * anom) * 0.000289)
    app_long = geom + ctr - 0.00569 - 0.00478 * math.sin(rd * (125.04 - 1934.136 * jc))
    obl = (23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60
           + 0.00256 * math.cos(rd * (125.04 - 1934.136 * jc)))
    decl = math.asin(math.sin(rd * obl) * math.sin(rd * app_long)) / rd
    vary = math.tan(rd * obl / 2) ** 2
    eq = 4 * (vary * math.sin(2 * rd * geom) - 2 * ecc * math.sin(rd * anom)
              + 4 * ecc * vary * math.sin(rd * anom) * math.cos(2 * rd * geom)
              - 0.5 * vary * vary * math.sin(4 * rd * geom)
              - 1.25 * ecc * ecc * math.sin(2 * rd * anom)) / rd
    cos_h = (math.cos(rd * 90.833) / (math.cos(rd * lat) * math.cos(rd * decl))
             - math.tan(rd * lat) * math.tan(rd * decl))
    if cos_h > 1 or cos_h < -1:
        return None
    ha = math.acos(cos_h) / rd
    return datetime.datetime.fromtimestamp(
        (d0 + round((720 - 4 * lng - eq + 4 * ha) * 60000)) / 1000, datetime.timezone.utc)


def sunset_sete(d):
    """Heure locale de Sète, heure d'été comprise."""
    u = sunset_utc(d, SUN['lat'], SUN['lng'])
    return u.astimezone(ZoneInfo(SUN['zone'])) if u else None


def hhmm(t):
    """« 19h46 » en français, « 19:46 » en anglais — l'heure est la même."""
    return '[[%02dh%02d||%02d:%02d]]' % (t.hour, t.minute, t.hour, t.minute)


def sunset_table(year):
    rows = []
    for m in range(1, 13):
        first = sunset_sete(datetime.date(year, m, 1))
        mid = sunset_sete(datetime.date(year, m, 15))
        golden = mid - datetime.timedelta(minutes=60)
        rows.append(
            '    <tr data-sun-month="%d"><th scope="row">[[%s||%s]]</th>'
            '<td>%s</td><td>%s</td><td>%s</td></tr>'
            % (m, MOIS[m - 1], MONTHS[m - 1], hhmm(first), hhmm(mid), hhmm(golden)))
    return (
        '<table class="suntable">\n'
        '  <caption>[[Heure du coucher du soleil à Sète, année %d. Calculée pour '
        '43,39° N — 3,68° E, heure locale, heure d\u2019été comprise.'
        '||Sunset times in Sète, %d. Calculated for 43.39° N — 3.68° E, local time, '
        'including summer time.]]</caption>\n'
        '  <thead><tr><th scope="col">[[Mois||Month]]</th>'
        '<th scope="col">[[Le 1<sup>er</sup>||On the 1st]]</th>'
        '<th scope="col">[[Le 15||On the 15th]]</th>'
        '<th scope="col">[[Heure dorée (le 15)||Golden hour (15th)]]</th></tr></thead>\n'
        '  <tbody>\n%s\n  </tbody>\n</table>' % (year, year, '\n'.join(rows)))


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


SUNSETS = sunset_table(datetime.date.today().year)

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
        ctx['sunsets'] = SUNSETS
        ctx['sun_year'] = str(datetime.date.today().year)
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


# ----------------------------------------------------------------------
# Contrôle d'équilibre des balises de bloc.
#
# Une balise jamais refermée ne casse pas la page : le navigateur la
# rattrape en silence, en imbriquant ce qui suit. Le texte reste lisible,
# et la mise en page est fausse sans que rien ne le signale — c'est ainsi
# que la page contact a longtemps tenu dans la moitié gauche de l'écran.
# Le contrôle est fait ici, à chaque construction, sur le contenu produit.
# ----------------------------------------------------------------------
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'source', 'track', 'wbr'}
TAG = re.compile(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(/?)>')

faults = 0
for f in sorted(list(ROOT.glob('*.html')) + list((ROOT / 'en').glob('*.html'))):
    text = f.read_text(encoding='utf-8')
    if '<main id="main">' not in text:
        continue
    body = re.sub(r'<!--.*?-->', '', text.split('<main id="main">')[1].split('</main>')[0], flags=re.S)
    stack, err = [], None
    for m in TAG.finditer(body):
        closing, tag, selfclosing = m.group(1), m.group(2).lower(), m.group(3)
        if tag in VOID or selfclosing:
            continue
        if not closing:
            stack.append(tag)
        elif not stack:
            err = '</%s> en trop' % tag
            break
        elif stack[-1] != tag:
            err = '</%s> alors que <%s> est encore ouverte' % (tag, stack[-1])
            break
        else:
            stack.pop()
    if err is None and stack:
        err = 'jamais refermée : ' + ', '.join('<%s>' % t for t in stack)
    if err:
        faults += 1
        print('✗ %s — %s' % (f.relative_to(ROOT), err))
print('✓ balises équilibrées sur toutes les pages' if not faults
      else '✗ %d page(s) mal formée(s) — corrigez src/pages/' % faults)
