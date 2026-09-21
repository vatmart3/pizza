/* ============================================================
   La Mesa — Les Pierres Blanches · données du site
   Tout ce qui est modifiable (horaires, carte, coordonnées)
   est ici. Aucun autre fichier n'a besoin d'être touché.
   ============================================================ */
window.LM = window.LM || {};

LM.info = {
  name: 'La Mesa',
  sub: 'Les Pierres Blanches',
  city: 'Sète',
  address: '65 allée Pierre Barthas',
  zip: '34200',
  phone: '04 67 53 33 40',
  phoneIntl: '+33467533340',
  email: 'contact@lespierresblanches.com',      // à confirmer
  site: 'https://lespierresblanches.com',
  maps: 'https://www.google.com/maps/search/?api=1&query=La+Mesa+Les+Pierres+Blanches+65+All.+Pierre+Barthas+34200+S%C3%A8te',
  apple: 'https://maps.apple.com/?q=La+Mesa+Les+Pierres+Blanches&address=65+All%C3%A9e+Pierre+Barthas,+34200+S%C3%A8te',
  waze:  'https://waze.com/ul?q=65%20All%C3%A9e%20Pierre%20Barthas%2034200%20S%C3%A8te&navigate=yes',
  lat: 43.3934, lng: 3.6802,
  instagram: 'https://www.instagram.com/',        // à compléter
  reviews: 868,
  priceRange: '30 – 50 €',
  /* Formulaires : renseignez un endpoint (Formspree, Getform, Basin…)
     pour recevoir les réservations par e-mail. Vide = ouverture du
     client mail du visiteur avec le message pré-rempli. */
  formEndpoint: ''
};

/* Horaires — 0 = dimanche … 6 = samedi. null = fermé.
   Plusieurs plages possibles : [['09:30','15:00'],['18:30','23:30']] */
LM.hours = {
  1: null,                              // lundi : fermé
  2: [['09:30', '23:00']],              // mardi
  3: [['09:30', '23:00']],
  4: [['09:30', '23:00']],
  5: [['09:30', '00:30']],              // vendredi
  6: [['09:30', '00:30']],              // samedi
  0: [['09:30', '18:00']]               // dimanche
};
LM.services = {
  lunch:  { label: 'Déjeuner', slots: ['12:00','12:15','12:30','12:45','13:00','13:15','13:30','13:45','14:00'] },
  dinner: { label: 'Dîner',    slots: ['19:00','19:15','19:30','19:45','20:00','20:15','20:30','20:45','21:00','21:15','21:30','22:00'] }
};
LM.dayNames = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
LM.monthNames = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

/* ---------- La carte ----------
   tags : v = végétarien · vg = végan · sg = sans gluten · sig = signature
   Les prix sont en euros, nets, service compris. */
LM.menu = [
  {
    id: 'debuts', title: 'Pour commencer', kicker: 'À l’ombre des pins',
    note: 'Pain au levain & huile d’olive de l’Hérault servis avec chaque table.',
    items: [
      { name: 'Huîtres de l’étang de Thau', desc: 'N°3, échalote au vinaigre de Banyuls, citron de Menton', price: 16, unit: 'les 6', tags: ['sg','sig'] },
      { name: 'Tielle sétoise revisitée', desc: 'Poulpe confit, tomate brûlée, piment doux, pâte fine', price: 12, tags: ['sig'] },
      { name: 'Burrata des Pouilles', desc: 'Tomates anciennes, pêche rôtie, basilic pourpre, pistache', price: 15, tags: ['v','sg'] },
      { name: 'Anchois de Collioure', desc: 'Beurre fumé, focaccia grillée, zeste d’orange', price: 11 },
      { name: 'Gazpacho blanc', desc: 'Amande, raisin muscat, huile de verveine', price: 10, tags: ['v','vg','sg'] }
    ]
  },
  {
    id: 'partager', title: 'À partager', kicker: 'La mesa, c’est la table',
    note: 'Pensées pour le centre de la table. Comptez deux à trois assiettes par personne.',
    items: [
      { name: 'Poulpe à la braise', desc: 'Pommes grenaille écrasées, aïoli safrané, paprika fumé', price: 24, tags: ['sg','sig'] },
      { name: 'Gambas rouges de Méditerranée', desc: 'Beurre d’ail noir, citron confit, herbes du parc', price: 28, tags: ['sg'] },
      { name: 'Pluma ibérique', desc: 'Chimichurri, oignons doux de Lézignan, jus corsé', price: 26 },
      { name: 'Légumes de saison au feu', desc: 'Aubergine, poivron, courgette, labneh à la menthe, dukkah', price: 18, tags: ['v','sg'] },
      { name: 'Croquetas du jour', desc: 'Jambon ibérique ou champignons, selon l’humeur du chef', price: 12, unit: 'les 4' }
    ]
  },
  {
    id: 'mer', title: 'La mer', kicker: 'Pêche de Sète, criée du matin',
    note: 'Le poisson du jour est annoncé à la table selon l’arrivage.',
    items: [
      { name: 'Loup entier en croûte de sel', desc: 'Fenouil confit, sauce vierge, pommes de terre au four', price: 42, unit: 'pour 2, / pers.', tags: ['sg','sig'] },
      { name: 'Dorade royale grillée', desc: 'Beurre blanc au vin de Picpoul, blettes, amandes', price: 32, tags: ['sg'] },
      { name: 'Seiche à la sétoise', desc: 'Rouille maison, riz de Camargue, olives de Lucques', price: 27 },
      { name: 'Thon rouge mi-cuit', desc: 'Sésame noir, ponzu, avocat, jeunes pousses', price: 34, tags: ['sg'] },
      { name: 'Bourride de lotte', desc: 'Aïoli, croûtons, légumes fondants — la recette d’ici', price: 36 }
    ]
  },
  {
    id: 'braise', title: 'La braise', kicker: 'Bois d’olivier & sarments',
    note: 'Toutes les viandes sont d’origine française ou ibérique, précisée à la table.',
    items: [
      { name: 'Côte de bœuf maturée', desc: 'Race Aubrac, 30 jours, os à moelle, frites au gras de bœuf', price: 48, unit: 'pour 2, / pers.', tags: ['sg'] },
      { name: 'Agneau de l’Aveyron', desc: 'Selle rôtie au thym, pois chiches, jus au ras-el-hanout', price: 34, tags: ['sg'] },
      { name: 'Volaille jaune des Landes', desc: 'Demi-poulet à la braise, citron, salade d’herbes', price: 27, tags: ['sg'] },
      { name: 'Brochettes de la mer', desc: 'Lotte, gambas, poivrons, riz pilaf au safran', price: 30, tags: ['sg'] }
    ]
  },
  {
    id: 'douceurs', title: 'Douceurs', kicker: 'Pour finir face au large',
    items: [
      { name: 'Tarte au citron de Menton', desc: 'Meringue flambée, sorbet basilic', price: 11, tags: ['v'] },
      { name: 'Pavlova aux fruits rouges', desc: 'Crème mascarpone, vanille de Madagascar', price: 12, tags: ['v','sg'] },
      { name: 'Chocolat & fleur de sel', desc: 'Fondant tiède, glace à l’huile d’olive', price: 12, tags: ['v'] },
      { name: 'Fromages affinés', desc: 'Sélection de la région, confiture de figues', price: 13, tags: ['v'] },
      { name: 'Pêche rôtie au romarin', desc: 'Crumble aux amandes, crème glacée', price: 10, tags: ['v'] }
    ]
  },
  {
    id: 'cocktails', title: 'Cocktails', kicker: 'L’heure dorée',
    note: 'Tous nos cocktails existent en version sans alcool (– 3 €).',
    items: [
      { name: 'Pierres Blanches Spritz', desc: 'Prosecco, liqueur de pêche de vigne, thym citron, tonic', price: 12, tags: ['sig'] },
      { name: 'Mesa Margarita', desc: 'Tequila blanco, agave, citron vert, sel fumé au piment', price: 13 },
      { name: 'Corniche Sour', desc: 'Gin méditerranéen, romarin, citron, blanc d’œuf', price: 13 },
      { name: 'Étang de Thau', desc: 'Vodka, concombre, basilic, tonic, soupçon de sel', price: 12 },
      { name: 'Mont Saint-Clair', desc: 'Rhum ambré, sirop d’amande, ananas rôti, bitters', price: 13 },
      { name: 'Sans alcool — Golden Hour', desc: 'Abricot, verveine, citron, ginger beer', price: 9 }
    ]
  },
  {
    id: 'vins', title: 'Vins & bulles', kicker: 'Languedoc d’abord',
    note: 'Carte complète disponible à la table — plus de 60 références.',
    items: [
      { name: 'Picpoul de Pinet', desc: 'Domaine Félines Jourdan — le vin des huîtres', price: 7, unit: 'verre', prices: { verre: 7, bouteille: 32 } },
      { name: 'Rosé Côtes de Thau', desc: 'Frais, salin, parfait sous les pins', price: 7, unit: 'verre', prices: { verre: 7, bouteille: 30 } },
      { name: 'Terrasses du Larzac', desc: 'Rouge de garrigue, syrah-grenache', price: 9, unit: 'verre', prices: { verre: 9, bouteille: 44 } },
      { name: 'Blanquette de Limoux', desc: 'Bulles fines du Languedoc', price: 9, unit: 'verre', prices: { verre: 9, bouteille: 42 } },
      { name: 'Champagne Brut', desc: 'Maison indépendante, dosage léger', price: 14, unit: 'verre', prices: { verre: 14, bouteille: 78 } }
    ]
  }
];

LM.menuFormula = {
  title: 'Le déjeuner de la semaine',
  sub: 'Du mardi au vendredi, 12h – 14h30 (hors jours fériés)',
  lines: [
    { label: 'Entrée + plat ou plat + dessert', price: 29 },
    { label: 'Entrée + plat + dessert', price: 36 },
    { label: 'Verre de vin du moment', price: 6 }
  ]
};

LM.tags = {
  v:  { label: 'Végétarien', short: 'V' },
  vg: { label: 'Végan', short: 'VG' },
  sg: { label: 'Sans gluten', short: 'SG' },
  sig:{ label: 'Signature', short: '★' }
};

/* ---------- Galerie ---------- */
LM.gallery = [
  { src: 'assets/img/hero-1280.webp',    small: 'assets/img/hero-760.webp',    w: 1280, h: 718, alt: 'La longue table de bois sous la canisse tressée', cap: 'La longue table' },
  { src: 'assets/img/p-table-760.webp',  small: 'assets/img/p-table-440.webp',  w: 760, h: 952, alt: 'La grande table ronde et sa corbeille de légumes', cap: 'La grande table' },
  { src: 'assets/img/salle-1280.webp',   small: 'assets/img/salle-760.webp',   w: 1280, h: 718, alt: 'L’olivier et la cuisine ouverte au fond de la salle', cap: 'La cuisine ouverte' },
  { src: 'assets/img/p-olivier-760.webp',small: 'assets/img/p-olivier-440.webp',w: 760, h: 952, alt: 'Les branches d’olivier au-dessus des verres verts', cap: 'L’olivier' },
  { src: 'assets/img/book-1280.webp',    small: 'assets/img/book-760.webp',    w: 1280, h: 718, alt: 'La salle et ses lanternes en rotin au moment du service', cap: 'Les lanternes' },
  { src: 'assets/img/p-longue-760.webp', small: 'assets/img/p-longue-440.webp', w: 760, h: 952, alt: 'La longue table qui file vers la cuisine', cap: 'Vers la cuisine' },
  { src: 'assets/img/quote-1280.webp',   small: 'assets/img/quote-760.webp',   w: 1280, h: 718, alt: 'Herbes aromatiques et verres posés sur la table de bois', cap: 'Les herbes' }
];
