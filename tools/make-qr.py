#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère src/pages/qr.html : la planche A4 de fiches de table, QR compris.

Usage :
    pip install segno        # une seule fois
    python3 tools/make-qr.py [url]
    python3 tools/build.py

L'adresse par défaut est celle du raccourci défini dans vercel.json.
Le code est produit en correction d'erreur H (la plus haute) : il reste
lisible sali, plié ou partiellement masqué, ce qui arrive vite sur une table.
"""
import sys, pathlib, re

try:
    import segno
except ImportError:
    sys.exit("segno est requis :  pip install segno")

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = sys.argv[1] if len(sys.argv) > 1 else 'https://lespierresblanches.com/m'

qr = segno.make(URL, error='h')
matrix = [list(r) for r in qr.matrix]
n = len(matrix)

# Les modules voisins d'une même ligne sont fusionnés en un seul rectangle :
# le tracé reste court et l'impression nette.
parts = []
for y in range(n):
    x = 0
    while x < n:
        if matrix[y][x]:
            w = 1
            while x + w < n and matrix[y][x + w]:
                w += 1
            parts.append('M%d %dh%dv1h-%dz' % (x, y, w, w))
            x += w
        else:
            x += 1
path = ''.join(parts)

# Relecture du tracé : on reconstruit la matrice et on la compare à l'originale.
check = [[0] * n for _ in range(n)]
for m in re.finditer(r'M(\d+) (\d+)h(\d+)', path):
    x, y, w = int(m.group(1)), int(m.group(2)), int(m.group(3))
    for i in range(w):
        check[y][x + i] = 1
if any(bool(check[y][x]) != bool(matrix[y][x]) for y in range(n) for x in range(n)):
    sys.exit('Le tracé SVG ne correspond pas à la matrice du QR — rien n’a été écrit.')

side = n + 4          # 2 modules de marge blanche de chaque côté (zone de silence)
QR = ('<svg viewBox="-2 -2 {s} {s}" xmlns="http://www.w3.org/2000/svg" role="img" '
      'aria-label="QR code vers la carte de La Mesa">'
      '<rect x="-2" y="-2" width="{s}" height="{s}" fill="#fff"/>'
      '<path fill="#14120E" d="{p}"/></svg>').format(s=side, p=path)

EMBLEM = ('<svg viewBox="0 0 52 32" aria-hidden="true"><path fill="currentColor" '
          'd="M6 27c0-3 9-5 20-5s20 2 20 5-9 4-20 4S6 30 6 27zm5-9c0-2.5 7-4 15-4s15 1.5 15 4-7 3.5-15 '
          '3.5-15-1-15-3.5zm6-8c0-2 4-3.5 9-3.5s9 1.5 9 3.5-4 3-9 3-9-1-9-3z"/></svg>')

short = URL.split('://')[-1]


def face(flip):
    return ('      <div class="face' + (' face--flip' if flip else '') + '">\n'
            '        <div class="qr">' + QR + '</div>\n'
            '        <div class="txt">\n'
            '          <span class="em">' + EMBLEM + '<b>La Mesa</b></span>\n'
            '          <h2>La carte</h2>\n'
            '          <span class="rule"></span>\n'
            '          <p class="fr">Scannez ce code avec l’appareil photo de votre téléphone.</p>\n'
            '          <p class="en">Scan this code with your phone camera to see the menu.</p>\n'
            '          <p class="url">' + short + '</p>\n'
            '        </div>\n      </div>\n')


tent = ('    <div class="tent">\n' + face(True)
        + '      <div class="fold"><span>Pli</span></div>\n'
        + face(False) + '    </div>\n')

page = (
 '---\n'
 'title: Fiche de table à imprimer — La Mesa\n'
 'desc: Le QR code de la carte, sur une fiche de table à plier. À imprimer en A4.\n'
 'layout: print\n'
 'translate: no\n'
 'robots: noindex,nofollow\n'
 '---\n'
 '<div class="note">\n'
 '  <h1>Les fiches de table à poser sur les tables</h1>\n'
 '  <p>Cette planche contient <b>deux fiches</b> prêtes à l’emploi. Imprimez-la en '
 '<b>A4, recto seul, sans mise à l’échelle</b> (« Taille réelle » ou 100 %), '
 'puis découpez au trait horizontal du milieu et pliez chaque fiche sur son trait '
 '« Pli » : les deux faces se liront à l’endroit.</p>\n'
 '  <p>Le code pointe vers <b>' + short + '</b>, la carte pensée pour être lue au '
 'téléphone à table. Elle se met à jour toute seule dès que la carte du site '
 'change : <b>le code imprimé reste valable pour toujours</b>, vous n’aurez jamais '
 'à le réimprimer.</p>\n'
 '  <p>Papier conseillé : 250 à 300 g, mat de préférence — le brillant renvoie '
 'la lumière et gêne le scan.</p>\n'
 '  <button type="button" onclick="print()">Imprimer la planche</button>\n'
 '</div>\n\n'
 '<div class="sheetwrap">\n  <div class="sheet">\n' + tent + tent + '  </div>\n</div>\n')

(ROOT / 'src' / 'pages' / 'qr.html').write_text(page, encoding='utf-8')
print('✓ src/pages/qr.html — %s · version %s · correction H · %d×%d modules'
      % (URL, qr.version, n, n))
print('  lancez maintenant : python3 tools/build.py')
