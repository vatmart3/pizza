# La Mesa — Les Pierres Blanches · Sète

Site vitrine du restaurant **La Mesa** (Les Pierres Blanches), 65 allée Pierre Barthas, 34200 Sète.
Statique, sans framework ni dépendance : HTML + CSS + JavaScript, servi tel quel.

## Pages

| Page | Fichier | Contenu |
|---|---|---|
| Accueil | `index.html` | héro vidéo avec rayons de lumière WebGL, « Notre histoire » avec vidéo en modale, carrousel des plats signature, bande « Réservez votre table » (pré-remplit la page réservation), horaires + plan |
| La carte | `carte.html` | carte complète générée depuis `data.js`, filtres (végétarien, sans gluten, signatures), recherche, navigation sticky, impression |
| Le lieu | `le-lieu.html` | histoire, engagements, équipe, privatisation |
| Galerie | `galerie.html` | mosaïque + visionneuse (clavier, gestes) |
| Réservation | `reservation.html` | calendrier (jours fermés grisés), service + créneaux selon les horaires réels, convives, coordonnées, ticket de confirmation, export `.ics` |
| Infos & accès | `contact.html` | coordonnées, statut ouvert/fermé en direct, horaires, accès, plan stylisé, formulaire |
| Légal | `mentions-legales.html`, `confidentialite.html`, `accessibilite.html` | textes conformes LCEN / RGPD, sans cookie ni traceur |
| 404 | `404.html` | |

## Tout modifier depuis un seul fichier

`assets/js/data.js` contient **tout ce qui change** : téléphone, e-mail, liens de navigation (Google Maps, Plans, Waze), horaires (`LM.hours`), créneaux de réservation (`LM.services`), la carte complète (`LM.menu`), la formule du midi et la galerie.

- Les horaires pilotent : le badge « Ouvert · ferme à … » (nav, héro, contact), le tableau d’horaires, le calendrier et les créneaux de réservation.
- `LM.info.formEndpoint` : renseignez une URL Formspree / Getform / Basin pour recevoir les réservations et messages par e-mail. Vide, le site ouvre le client mail du visiteur avec le message pré-rempli.

## Structure

```
index.html … 404.html      pages générées (à servir)
assets/css/main.css        styles (thème noir & or, fine dining)
assets/js/data.js          données modifiables
assets/js/app.js           préloader, transitions 3D, curseur, nav, statut horaires, carte, galerie, réservation, contact
assets/fonts/              Playfair Display (variable) & Instrument Sans (variable), licence OFL
assets/img/ · assets/video/ photos (WebP, 2 tailles + LQIP) et vidéo héro (H.264, boucle aller-retour)
src/layout.html            gabarit commun (head SEO, JSON-LD Restaurant, nav, footer)
src/partials/*.html        nav, footer, préloader, plan SVG
src/pages/*.html           contenu de chaque page (avec en-tête `---`)
tools/build.py             régénère les pages + sitemap.xml
sw.js                      service worker (cache des ressources, hors-ligne léger)
```

Pour modifier une page : éditez `src/pages/<page>.html` puis lancez `python3 tools/build.py`.
(Éditer directement les fichiers HTML à la racine fonctionne aussi, mais sera écrasé au prochain build.)

## Vitesse

- Aucun script externe, aucune police distante : deux polices variables auto-hébergées et préchargées.
- Images WebP avec `srcset`, `loading="lazy"`, dimensions déclarées (pas de saut de mise en page).
- Vidéo héro chargée **après** le préloader, jamais si `prefers-reduced-motion` ou `Save-Data`.
- `speculationrules` (préchargement des pages au survol) + service worker.
- Animations en `transform`/`opacity`, WebGL rendu à demi-résolution et mis en pause hors écran.

## Accessibilité & conformité

- Navigation clavier, focus visible, `aria-*` sur les composants, textes alternatifs, `prefers-reduced-motion` respecté.
- Aucun cookie ni traceur : pas de bandeau de consentement nécessaire (documenté dans la politique de confidentialité).
- Mentions obligatoires : prix nets service compris, allergènes sur demande, origine des viandes, message alcool, médiation de la consommation.
- Les zones surlignées en jaune dans les pages légales (`[à compléter]`) sont à renseigner par le restaurant (raison sociale, SIRET, hébergeur, médiateur).

## À compléter par le restaurant

- Menu : les plats et prix de `data.js` sont une **proposition** rédigée pour la démo, à remplacer par la carte réelle.
- Horaires : déduits des informations publiques (« ouvre à 09:30 mar. ») — à vérifier.
- E-mail, Instagram, endpoint de formulaire, mentions légales.
- Photos : le site utilise les images et la vidéo fournies ; des photos HD supplémentaires (plats, terrasse au coucher du soleil) remplaceront avantageusement certains visuels.
