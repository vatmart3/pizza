# 🍕 Nonna Luna — pizzeria artigianale

Site vitrine + commande en ligne pour une pizzeria artisanale imaginaire du Panier, à Marseille.
Projet de portfolio : **aucune dépendance, aucun build, aucune photo**.

> Ronde comme la lune, cuite au feu de bois.

---

## L'idée

Les sites de pizzeria se ressemblent tous : un carrousel de photos achetées sur une banque d'images
et un bouton « commander ». Ici, tout ce qui est rond est dessiné par le code, et l'interface
tourne autour d'un objet unique : **la Roue des Saveurs**.

### La Roue des Saveurs
Un sélecteur circulaire : les huit pizzas sont posées sur un arc, la pizza géante tourne au centre
en 3D (`rotateX` + `rotate`), et chaque cran met à jour la recette, les produits et le prix.
Elle se pilote **au glisser** (pointer events, angle calculé au `atan2`), **au clavier** (← →),
en cliquant un nom, ou avec les flèches. La géométrie (diamètre, rayon de l'anneau, pas angulaire,
inclinaison des noms) est recalculée à chaque redimensionnement pour rester lisible du mobile au 4K.

### Des pizzas génératives, pas des photos
`assets/js/pizza.js` est un petit moteur graphique : à partir d'une recette
(`{ base, cheeseN, toppings: [{ k: 'pepperoni', n: 8 }] }`) il produit un SVG complet —
pâte irrégulière lissée en courbes de Bézier, taches de cuisson « léopard », bulles de corniche,
mozzarella fondue, une vingtaine de garnitures dessinées à la main (pepperoni, funghi, burrata,
truffe, roquette, anchois…), brillance d'huile d'olive.
Le placement suit une **spirale de Vogel** bruitée avec rejet de proximité, et l'aléatoire est
**déterministe** (mulberry32) : une même graine redonne exactement la même pizza — indispensable
pour la section « Le Rituel », où quatre calques successifs doivent partager la même croûte.

### Le Rituel
Une section scrollytelling : la pizza se construit pendant la lecture (pâte → tomate → mozzarella →
feu), la jauge monte de 24 °C à 430 °C, et le four s'allume à la dernière étape.

---

## Ce qu'il y a dedans

| | |
|---|---|
| **Configurateur** | roue rotative, 4 tailles (prix indexés), quantité, ajout au panier |
| **Panier** | tiroir latéral, quantités, sous-total, livraison offerte dès 25 €, persistance `localStorage` |
| **Carte** | 5 catégories, onglets à pastille glissante, rail défilable à la souris/au doigt |
| **Livraison** | suivi de commande animé, plan SVG stylisé avec livreur qui suit le tracé (`getPointAtLength`) |
| **Promo** | compte à rebours réel jusqu'au mardi 18 h |
| **Réservation** | formulaire validé côté client, messages d'erreur en français |
| **Détails** | préloader, curseur personnalisé, parallaxe à la souris, apparitions au scroll, barre de progression, marquee d'avis |

## Accessibilité & performance

- `prefers-reduced-motion` respecté : toutes les animations sont neutralisées.
- Navigation clavier complète, `:focus-visible` visible partout, rôles ARIA sur la roue, les onglets,
  les tailles et le tiroir ; lien d'évitement.
- **Zéro requête externe** : polices auto-hébergées (sous-ensembles latin/latin-ext), pas de CDN,
  pas d'images bitmap. Le site fonctionne hors ligne, y compris en `file://`.
- Poids total ≈ 550 Ko dont 420 Ko de polices.

## Lancer le projet

```bash
git clone <ce-dépôt> && cd pizza
python3 -m http.server 8000     # ou : npx serve .
# puis http://localhost:8000
```

Aucune installation, aucun bundler. Un double-clic sur `index.html` fonctionne aussi.

## Structure

```
index.html
assets/
  css/style.css     tokens de design, composants, sections, responsive
  css/fonts.css     @font-face auto-hébergés
  js/pizza.js       moteur de pizzas SVG procédurales
  js/data.js        tailles, recettes, carte, avis  ← tout le contenu se modifie ici
  js/main.js        interactions (roue, panier, rituel, carte, livraison, formulaires)
  fonts/            Fredoka · Caveat · Nunito (woff2, SIL OFL 1.1)
```

## Personnaliser

Changer une pizza, un prix ou toute la carte se fait dans **`assets/js/data.js`**.
Les couleurs, rayons et typographies sont des variables CSS en haut de **`style.css`** (`:root`).

## Crédits

Pizzeria fictive, contenus rédigés pour la démonstration.
Polices Fredoka, Caveat et Nunito sous licence SIL Open Font License 1.1.
Illustrations : générées par le code de ce dépôt.
