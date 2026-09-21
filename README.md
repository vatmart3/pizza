# La Mesa — Les Pierres Blanches · Sète

Site vitrine du restaurant **La Mesa** (Les Pierres Blanches), 65 allée Pierre Barthas, 34200 Sète.
Statique, sans framework ni dépendance : HTML + CSS + JavaScript, servi tel quel.

## Pages

Chaque page existe en français (à la racine) et en anglais (sous `/en/`),
sauf mention contraire.

| Page | Fichier | Contenu |
|---|---|---|
| Accueil | `index.html` | héro, **bloc « l'essentiel »** (ouvert ou non, coucher de soleil, adresse, téléphone), les trois moments de la journée, extrait de carte, bande du coucher de soleil, le lieu, images, mur d'avis, groupes, horaires + accès |
| La carte | `carte.html` | carte complète générée depuis `data.js` (ardoise du midi, brochettes, tapas, snack, cocktails, boissons), filtres, recherche, navigation sticky, impression |
| Le lieu | `le-lieu.html` | histoire du site, la journée type, ce qui fait la maison, le rythme des trois saisons |
| Soirées brochettes | `soirees-brochettes.html` | page saisonnière : le principe, le déroulé d'une soirée, la sélection de brochettes et de tapas |
| Groupes & événements | `groupes.html` | formules groupes, offre séminaires, formulaire de demande de devis |
| Carte à table (QR) | `menu.html` | page autonome et ultra-légère, scannée au QR code : bilingue FR/EN, mode plein soleil, recherche, filtres, hors-ligne |
| Fiches QR à imprimer | `qr.html` | planche A4 de deux fiches de table à plier, QR code inclus (hors index, français seul) |
| Galerie | `galerie.html` | mosaïque + visionneuse (clavier, gestes) |
| Réservation | `reservation.html` | le téléphone en action principale, puis une demande de rappel en quatre étapes : calendrier (jours fermés grisés selon la saison), service, convives, coordonnées |
| Contact & accès | `contact.html` | coordonnées, horaires saisonniers, accès voiture / bus ligne 5 / à pied, accessibilité, itinéraire, formulaire |
| Légal | `mentions-legales.html`, `confidentialite.html`, `accessibilite.html` | mentions obligatoires, RGPD, déclaration d'accessibilité (texte français seul) |
| Erreur | `404.html` | page introuvable |

## Tout modifier depuis un seul fichier

`assets/js/data.js` contient **tout ce qui change**. Aucun autre fichier n'est à toucher pour une mise à jour courante.

| Clé | Ce qu'elle pilote |
| --- | --- |
| `LM.info` | téléphone, e-mail, adresse, Instagram, liens Google Maps / Plans / Waze, coordonnées GPS |
| `LM.season` | les trois périodes de l'année **et leurs horaires** — voir « Le rythme des saisons » |
| `LM.access` | les blocs d'accès (voiture, bus, à pied) sur l'accueil et la page contact |
| `LM.booking` | les textes de réservation (téléphone d'abord, formulaire en demande de rappel) |
| `LM.menu`, `LM.menuFormula`, `LM.menuNotice` | la carte complète, la formule du midi, la mention « l'ardoise change chaque jour » |
| `LM.groups` | les formules groupes et les arguments de la page devis |
| `LM.sun` | coordonnées et fuseau pour le calcul du coucher de soleil |
| `LM.reviews` | le mur d'avis (à remplacer par de vrais extraits) |
| `LM.t` | tout ce que le JavaScript écrit, dans les deux langues |
| `LM.gallery` | la galerie |

Les horaires de la saison en cours pilotent automatiquement le badge
« Ouvert · ferme à … » (barre de navigation, héro, contact, pied de page), le
tableau d'horaires, le calendrier de réservation et les créneaux proposés.

`LM.info.formEndpoint` : renseignez une URL Formspree / Getform / Basin pour
recevoir les demandes par e-mail. Vide, le site ouvre le client mail du
visiteur avec le message pré-rempli.

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

## Bilingue : français et anglais

Le français est servi à la racine, l'anglais sous `/en/`. Les deux versions
sont produites **à partir des mêmes fichiers sources** : impossible qu'une page
existe dans une langue et pas dans l'autre.

Les textes traduisibles s'écrivent en ligne, les deux langues côte à côte :

```html
<h2>[[Là-haut, la table||Up there, the table]]</h2>
```

Le compilateur garde le côté gauche pour `/`, le côté droit pour `/en/`. Comme
les deux versions vivent dans la même ligne, elles ne peuvent pas se
désynchroniser : on ne peut pas modifier l'une en oubliant l'autre.

Le reste suit automatiquement :

- `<html lang>` et `og:locale` sont posés par le compilateur ;
- les balises `hreflang` (fr, en, x-default) sont écrites sur chaque page ;
- les chemins vers `assets/` sont réécrits en `../assets/` pour `/en/` ;
- le sélecteur **FR / EN** de la barre de navigation pointe vers la même page
  dans l'autre langue, jamais vers l'accueil ;
- le JavaScript lit `<html lang>` et adapte ce qu'il écrit lui-même : statut
  d'ouverture, jours, mois, format d'heure (`19h46` / `19:46`), carte, avis,
  accès, formules groupes. Ces textes sont dans `LM.t` et dans les champs `en:`
  de `data.js`.

Les pages légales sont volontairement **en français seul** : ce sont des
documents de droit français. Leur version anglaise porte un avertissement
indiquant que seule la version française fait foi.

Pour ajouter une langue, il faudrait étendre `LANGS` dans `tools/build.py` —
la mécanique est déjà en place.

## Le coucher de soleil

`assets/js/app.js` calcule l'heure du coucher de soleil du jour avec
l'algorithme NOAA, à partir des coordonnées de `LM.sun`. Aucune dépendance,
aucun appel réseau.

L'heure est **toujours donnée à l'heure de Sète** (`Europe/Paris`), quel que
soit le fuseau horaire du visiteur : un client à Londres qui prépare son
voyage lit l'heure locale du restaurant, pas la sienne.

Le site en déduit une heure d'arrivée conseillée (`LM.sun.before`, 90 minutes
par défaut) et l'affiche à deux endroits : dans le bloc « l'essentiel » sous le
héro, et dans la bande dédiée de la page d'accueil. Pendant la fermeture
annuelle, le message bascule de lui-même sur la date de réouverture.

Trois attributs suffisent à poser l'information n'importe où :

```html
<span data-sunset="label"></span>   <!-- « Coucher du soleil ce soir » -->
<b    data-sunset="time"></b>       <!-- « 19h46 »                     -->
<p    data-sunset="advice"></p>     <!-- « Arrivez vers 18h16… »       -->
```

## Les avis

Le mur d'avis de la page d'accueil se remplit depuis `LM.reviews`.

> **Les six avis livrés sont des exemples, pas de vrais avis.** Ils doivent
> être remplacés par de vrais extraits avant la mise en ligne : publier de faux
> avis est interdit et sanctionné. Pour retirer la section, il suffit d'écrire
> `LM.reviews = [];` — elle disparaît d'elle-même.

## La carte scannée à table (QR code)

`menu.html` est une page **autonome** : elle n'utilise ni `main.css` ni
`app.js`, son style est en ligne dans `src/layout-menu.html` et son script est
`assets/js/menu.js`. Tout est pensé pour un téléphone, à table, avec un réseau
médiocre : environ 100 Ko au total, premier rendu sous les 100 ms.

Elle lit exactement les mêmes données que le reste du site (`LM.menu`) :
**modifier un prix dans `data.js` met à jour la carte du site et la carte
scannée en même temps.** Le QR imprimé n'a jamais besoin d'être refait.

Ce qu'elle apporte :

- **Bilingue FR / EN** — un bouton bascule toute la carte ; les traductions
  sont dans `data.js` (`en:` sur chaque catégorie et chaque plat, `LM.ui` pour
  l'interface). Le choix est mémorisé.
- **Mode plein soleil** — un thème clair à fort contraste, pour une terrasse à
  midi. Mémorisé lui aussi, et appliqué avant le premier pixel (aucun
  clignotement).
- **Recherche et filtres** végétarien / sans gluten / signatures.
- **Onglets de catégorie** collants qui suivent le défilement.
- **Conscience de la saison** : hors saison, la section des brochettes affiche
  d'elle-même que le service reprend en avril.
- **Hors-ligne** : la page est mise en cache par le service worker.

### Le QR code et les fiches de table

`qr.html` est une planche A4 contenant **deux fiches de table à plier**, avec le
QR code déjà intégré. Le restaurant ouvre la page et imprime : rien à
configurer. Le code pointe vers `lespierresblanches.com/m`, la plus courte
adresse possible (réécriture définie dans `vercel.json`) — moins de caractères
signifie un code moins dense, donc un scan plus rapide.

Le code est généré en **correction d'erreur maximale (niveau H)** : il reste
lisible même sali, plié ou partiellement masqué — ce qui arrive à tout ce qui
traîne sur une table de restaurant. Le tracé SVG est intégré dans la page,
sans fichier image ni service extérieur.

Pour regénérer le code après un changement d'adresse :

```bash
pip install segno            # une seule fois
python3 tools/make-qr.py     # réécrit src/pages/qr.html
python3 tools/build.py
```

## Le rythme des saisons

Le restaurant ne vit pas de la même façon toute l'année, et le site le sait. Les
périodes sont décrites dans `LM.season` (`assets/js/data.js`) :

| Période | Dates | Ce qui est servi | Horaires |
| --- | --- | --- | --- |
| Pleine saison | 1ᵉʳ avril → 30 septembre | Petit-déjeuner, ardoise, snack, soirées brochettes | 7j/7, 8h30 – 23h |
| Arrière-saison | 1ᵉʳ octobre → 30 novembre | Café, ardoise du midi, goûter face à la mer | 8h30 – 19h, et jusqu'à 23h du jeudi au samedi |
| Fermeture | 1ᵉʳ décembre → 31 mars | — | Fermé, réouverture le 1ᵉʳ avril |

Conséquences automatiques, sans aucune intervention :

- l'indicateur « Ouvert / Fermé » lit les horaires **de la saison en cours** ;
- pendant la fermeture il affiche « Fermé pour l'hiver · retour le 1ᵉʳ avril » et
  un bandeau apparaît en haut de toutes les pages ;
- la grille d'horaires montre alors la saison qui reprend, pour que le visiteur
  sache à quoi s'attendre ;
- le calendrier de réservation grise les dates fermées, y compris quand la
  réservation porte sur une autre saison que celle du jour.

Pour décaler une date d'ouverture, il suffit de modifier `from`, `to` et
`reopen` dans `LM.season` : tout le site suit.

## Réservation

La réservation se fait **par téléphone**. Le site le dit partout et met le
numéro en action principale. Le formulaire de `reservation.html` est une
*demande de rappel* : il est présenté comme tel et précise qu'il ne vaut pas
réservation tant que l'équipe n'a pas rappelé. `LM.booking` centralise ces
textes.

## Sources des informations

Les contenus factuels (concept, saisons, horaires, accès, e-mail, Instagram)
proviennent du site officiel `lespierresblanches.com`, de l'office de tourisme
de Sète, d'Archipel de Thau et des annuaires professionnels. Ce qui reste à
valider par le restaurant est listé ci-dessous.

## À compléter par le restaurant

- **La carte** : les plats et prix de `data.js` sont une **proposition** construite
  à partir des spécialités réellement citées (ardoise du midi, brochettes à ~9 €,
  tartare et thon snacké, burger Black Angus, filet de bar sauce Mesa, encornets
  persillade-chorizo, focaccia, linguines, crêpes et gaufres). À remplacer par
  l'ardoise et le tarif réels.
- **Les horaires** : reconstitués à partir des informations publiques, à confirmer
  saison par saison.
- **Le menu groupes** : les trois formules de `LM.groups` sont une trame de
  travail ; le restaurant diffuse déjà un menu groupes, à substituer.
- **Endpoint de formulaire** (`LM.info.formEndpoint`) : vide par défaut, le site
  ouvre alors le client mail du visiteur. Renseigner un service (Formspree,
  Getform, Basin…) pour recevoir les demandes directement.
- **Mentions légales** : les zones surlignées en jaune (`[à compléter]`) —
  raison sociale, SIRET, hébergeur, médiateur, licence de débit de boissons.
- **Photos** : le site utilise les images et la vidéo fournies. Des photos HD
  supplémentaires (brochettes sur la braise, terrasse au coucher du soleil,
  salle le soir, vue panoramique) remplaceront avantageusement certains visuels.
- **Version anglaise** : le site officiel en propose une ; elle n'est pas encore
  reprise ici.
