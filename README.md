# La Mesa — Les Pierres Blanches · Sète

Site vitrine du restaurant **La Mesa** (Les Pierres Blanches), 65 allée Pierre Barthas, 34200 Sète.
Statique, sans framework ni dépendance : HTML + CSS + JavaScript, servi tel quel.

## Pages

| Page | Fichier | Contenu |
|---|---|---|
| Accueil | `index.html` | héro plein cadre (photo puis vidéo), manifeste, le lieu, extrait de carte typographique, bande de trois cadrages, citation, bande « Réservez votre table » (pré-remplit la page réservation), horaires + itinéraire |
| La carte | `carte.html` | carte complète générée depuis `data.js`, filtres (végétarien, sans gluten, signatures), recherche, navigation sticky, impression |
| Le lieu | `le-lieu.html` | histoire, engagements, équipe, privatisation |
| Galerie | `galerie.html` | mosaïque + visionneuse (clavier, gestes) |
| Réservation | `reservation.html` | calendrier (jours fermés grisés), service + créneaux selon les horaires réels, convives, coordonnées, ticket de confirmation, export `.ics` |
| Infos & accès | `contact.html` | coordonnées, statut ouvert/fermé en direct, horaires, accès, itinéraire, formulaire |
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
assets/fonts/              Bodoni Moda & Jost (variables, sous-ensemble français), licence OFL
assets/img/ · assets/video/ photos (WebP, 2 tailles + LQIP) et vidéo héro (H.264, boucle aller-retour)
src/layout.html            gabarit commun (head SEO, JSON-LD Restaurant, nav, footer)
src/partials/*.html        nav, footer, préloader
src/pages/*.html           contenu de chaque page (avec en-tête `---`)
tools/build.py             régénère les pages + sitemap.xml
sw.js                      service worker (cache des ressources, hors-ligne léger)
```

Pour modifier une page : éditez `src/pages/<page>.html` puis lancez `python3 tools/build.py`.
(Éditer directement les fichiers HTML à la racine fonctionne aussi, mais sera écrasé au prochain build.)

## Typographie & direction artistique

Fond noir, crème, **un seul or**. **Bodoni Moda** pour les titres, les prix et les chiffres,
**Jost** pour les textes et les libellés en capitales espacées : deux caractères variables
auto-hébergés, sous-ensemblés au français (63 Ko à eux trois). Le `€` de Bodoni étant trop fin
pour des prix, il est emprunté à Jost par une règle `unicode-range`, sans rien changer au balisage.

Parti pris : **aucun effet décoratif**. Pas de curseur personnalisé, pas de défilement détourné,
pas de WebGL, pas de grain animé, pas d'inclinaison 3D. Ce qui reste : une apparition sobre au
défilement, un préchargement invisible des pages, et de la place.

## Cartographie

**Aucune carte n'est intégrée.** Pas de dessin stylisé qui ferait faux, pas d'iframe Google Maps
qui imposerait un bandeau de consentement et 500 Ko de scripts tiers. L'adresse est donnée en
toutes lettres, avec trois boutons qui ouvrent directement Google Maps, Plans ou Waze dans
l'application du visiteur — ce que les gens utilisent réellement — plus un bouton « copier
l'adresse ». Les coordonnées GPS restent déclarées dans les données structurées du site, donc
Google les affiche dans ses résultats.

## Photographies

Les images proviennent d'un seul plan vidéo de six secondes. Elles ont été retravaillées
(débruitage, désaturation, courbe douce, montée en définition, vignette) puis **recadrées en
portrait** pour créer des cadrages distincts là où la source n'en offrait que deux. Le carrousel
de « plats » en photos a été supprimé : la carte s'affiche en typographie, avec filets pointillés
et prix, comme une vraie carte de restaurant.

**Le vrai levier qualité reste la photographie.** Des vues de plats, de la terrasse au coucher du
soleil et de la salle le soir feraient franchir un palier au site sans toucher une ligne de code :
il suffit de remplacer les fichiers de `assets/img/` et les entrées de `LM.gallery`.

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
