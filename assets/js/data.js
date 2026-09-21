/* ============================================================
   La Mesa — Les Pierres Blanches · données du site
   Tout ce qui est modifiable (saisons, horaires, carte,
   coordonnées) est ici. Aucun autre fichier n'a besoin
   d'être touché pour une mise à jour courante.
   ============================================================ */
window.LM = window.LM || {};

LM.info = {
  name: 'La Mesa',
  sub: 'Les Pierres Blanches',
  city: 'Sète',
  address: '65 allée Pierre Barthas',
  zip: '34200',
  altitude: '187 m',
  phone: '04 67 53 33 40',
  phoneIntl: '+33467533340',
  email: 'lamesa@lespierresblanches.com',
  site: 'https://lespierresblanches.com',
  maps: 'https://www.google.com/maps/search/?api=1&query=La+Mesa+Les+Pierres+Blanches+65+All.+Pierre+Barthas+34200+S%C3%A8te',
  apple: 'https://maps.apple.com/?q=La+Mesa+Les+Pierres+Blanches&address=65+All%C3%A9e+Pierre+Barthas,+34200+S%C3%A8te',
  waze:  'https://waze.com/ul?q=65%20All%C3%A9e%20Pierre%20Barthas%2034200%20S%C3%A8te&navigate=yes',
  lat: 43.3934, lng: 3.6802,
  instagram: 'https://www.instagram.com/lamesa_sete/',
  instagramHandle: '@lamesa_sete',
  reviews: 868,
  priceRange: '30 – 50 €',
  /* Formulaires : renseignez un endpoint (Formspree, Getform, Basin…)
     pour recevoir les demandes par e-mail. Vide = ouverture du
     client mail du visiteur avec le message pré-rempli. */
  formEndpoint: ''
};

/* ---------- Accès ----------
   Le restaurant est au sommet du Mont Saint-Clair : la vraie
   question du visiteur est « comment j'y monte et où je me gare ». */
LM.access = [
  {
    id: 'voiture', label: 'En voiture',
    text: 'Montez la corniche jusqu’au site des Pierres Blanches. Le restaurant est au bout de l’allée Pierre Barthas, sur la droite.',
    strong: 'Parking gratuit sur place'
  },
  {
    id: 'bus', label: 'En bus',
    text: 'Ligne 5 du réseau Sète Agglopôle Mobilité, arrêt « Les Pierres Blanches ». L’arrêt est devant le restaurant.',
    strong: 'Ligne 5 · arrêt Les Pierres Blanches'
  },
  {
    id: 'pied', label: 'À pied',
    text: 'Depuis le centre de Sète, comptez une bonne quarantaine de minutes de montée par les sentiers du Mont Saint-Clair, à travers la forêt domaniale.',
    strong: '187 m d’altitude'
  }
];

/* ---------- Saisons ----------
   Le restaurant vit au rythme de l'année : soirées brochettes
   d'avril à fin septembre, arrière-saison face à la mer en
   octobre et novembre, puis fermeture jusqu'au printemps.
   « from » et « to » sont au format MM-JJ, bornes incluses.
   Une période peut franchir le 31 décembre (from > to). */
LM.season = {
  reopen: '04-01',                 // date de réouverture annoncée
  periods: [
    {
      id: 'haute',
      label: 'Pleine saison',
      from: '04-01', to: '09-30',
      tag: 'Soirées brochettes',
      note: 'Petit-déjeuner, ardoise du midi, snack toute la journée et soirées brochettes face au coucher de soleil.',
      hours: {
        1: [['08:30', '23:00']],
        2: [['08:30', '23:00']],
        3: [['08:30', '23:00']],
        4: [['08:30', '23:00']],
        5: [['08:30', '23:00']],
        6: [['08:30', '23:00']],
        0: [['08:30', '23:00']]
      }
    },
    {
      id: 'basse',
      label: 'Arrière-saison',
      from: '10-01', to: '11-30',
      tag: 'Face à la mer',
      note: 'Le café du matin, l’ardoise du midi et le goûter face à la mer. Les soirées brochettes reprennent en avril.',
      hours: {
        1: [['08:30', '19:00']],
        2: [['08:30', '19:00']],
        3: [['08:30', '19:00']],
        4: [['08:30', '23:00']],
        5: [['08:30', '23:00']],
        6: [['08:30', '23:00']],
        0: [['08:30', '19:00']]
      }
    },
    {
      id: 'fermeture',
      label: 'Fermeture annuelle',
      from: '12-01', to: '03-31',
      closed: true,
      tag: 'Fermé pour l’hiver',
      note: 'La Mesa fait relâche le temps de l’hiver. Nous vous retrouvons au premier soleil du printemps.',
      hours: {}
    }
  ]
};

LM.services = {
  lunch:  { label: 'Déjeuner', slots: ['12:00','12:15','12:30','12:45','13:00','13:15','13:30','13:45','14:00'] },
  dinner: { label: 'Soirée brochettes', slots: ['19:00','19:15','19:30','19:45','20:00','20:15','20:30','20:45','21:00','21:15'] }
};
LM.dayNames = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
LM.monthNames = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

/* ---------- Réservation ----------
   Chez La Mesa, la réservation se fait par téléphone. Un e-mail
   ne vaut pas réservation : le formulaire du site est une
   demande de rappel, et le dit clairement. */
LM.booking = {
  mode: 'phone',
  headline: 'La réservation se fait par téléphone',
  text: 'Nous confirmons chaque table de vive voix. Un message ou un e-mail ne vaut pas réservation.',
  formTitle: 'Vous préférez être rappelé ?',
  formText: 'Laissez-nous vos coordonnées et le créneau souhaité : nous vous rappelons pour confirmer.'
};

/* ---------- La carte ----------
   tags : v = végétarien · vg = végan · sg = sans gluten · sig = signature
   Les prix sont en euros, nets, service compris. */
LM.menuNotice = 'Carte donnée à titre indicatif : l’ardoise change chaque jour selon le marché et la pêche.';

LM.menu = [
  {
    id: 'midi', title: 'L’ardoise du midi', kicker: 'Écrite chaque matin',
    note: 'Produits frais et locaux, recettes méditerranéennes. L’ardoise change tous les jours : ce qui suit en donne le ton.',
    items: [
      { name: 'Focaccia aux légumes marinés', desc: 'Courgette, poivron, aubergine, ricotta citronnée, basilic', price: 14, tags: ['v','sig'] },
      { name: 'Tartare de thon', desc: 'Thon taillé au couteau, avocat, sésame, huile d’olive, citron vert', price: 17, tags: ['sg','sig'] },
      { name: 'Thon snacké en croûte de sésame', desc: 'Croûte de sésame, légumes du moment, réduction soja-gingembre', price: 22, tags: ['sig'] },
      { name: 'Filet de bar, sauce Mesa', desc: 'Notre sauce maison, écrasé de pommes de terre à l’huile d’olive', price: 24, tags: ['sg','sig'] },
      { name: 'Encornets persillade & chorizo', desc: 'Persillade, chorizo doux, piquillos, riz de Camargue', price: 21 },
      { name: 'Linguines à l’italienne', desc: 'Tomates confites, olives de Lucques, parmesan, roquette', price: 18, tags: ['v'] },
      { name: 'Burger du jour', desc: 'Bœuf Black Angus, pain brioché, frites maison', price: 19 },
      { name: 'Salade du sommet', desc: 'Jeunes pousses, féta, pastèque, menthe, graines torréfiées', price: 15, tags: ['v','sg'] }
    ]
  },
  {
    id: 'brochettes', title: 'Les soirées brochettes', kicker: 'D’avril à fin septembre',
    note: 'Montées et grillées sur place le jour même, avant le service. À composer : comptez deux à trois brochettes par personne, servies avec les accompagnements au centre de la table.',
    items: [
      { name: 'Gambas', desc: 'Deux pièces, marinade à l’ail et au persil', price: 9, unit: 'la brochette', tags: ['sg','sig'] },
      { name: 'Saint-Jacques', desc: 'Cinq noix, beurre citronné', price: 9, unit: 'la brochette', tags: ['sg'] },
      { name: 'Thon rouge', desc: 'Marinade soja, sésame, gingembre', price: 9, unit: 'la brochette', tags: ['sg'] },
      { name: 'Poulet mariné', desc: 'Citron, paprika fumé, herbes de la garrigue', price: 8, unit: 'la brochette', tags: ['sg'] },
      { name: 'Bœuf & poivrons', desc: 'Chimichurri maison', price: 9, unit: 'la brochette', tags: ['sg'] },
      { name: 'Légumes de saison', desc: 'Courgette, oignon doux, tomate cerise, halloumi', price: 7, unit: 'la brochette', tags: ['v','sg'] },
      { name: 'Les accompagnements', desc: 'Frites maison, riz safrané, salade d’herbes, aïoli — à volonté sur la table', price: 6, unit: 'par personne', tags: ['v'] }
    ]
  },
  {
    id: 'tapas', title: 'Les tapas', kicker: 'Pour l’apéritif, face au large',
    note: 'La Mesa, c’est la table : tout est pensé pour le milieu, à picorer pendant que le soleil descend.',
    items: [
      { name: 'Planche ibérique', desc: 'Jambon, chorizo, lomo, pain grillé à l’huile d’olive', price: 16 },
      { name: 'Croquetas maison', desc: 'Jambon ou champignons, selon le jour', price: 9, unit: 'les 4' },
      { name: 'Patatas bravas', desc: 'Sauce brava, aïoli', price: 8, tags: ['v'] },
      { name: 'Padrón grillés', desc: 'Huile d’olive, fleur de sel', price: 7, tags: ['v','vg','sg'] },
      { name: 'Anchois de Collioure', desc: 'Beurre demi-sel, focaccia grillée', price: 10 },
      { name: 'Olives & amandes', desc: 'Marinées à la maison', price: 5, tags: ['v','vg','sg'] }
    ]
  },
  {
    id: 'snack', title: 'Le snack & le goûter', kicker: 'Toute la journée, dès 8h30',
    note: 'Sur place ou à emporter, sans réservation : le petit-déjeuner au soleil, la pause d’après-randonnée, le goûter face à la mer.',
    items: [
      { name: 'Le petit-déjeuner', desc: 'Boisson chaude, jus pressé, viennoiserie, tartines', price: 11, tags: ['v'] },
      { name: 'Crêpes', desc: 'Sucre, confiture, pâte à tartiner ou caramel au beurre salé', price: 5, tags: ['v'] },
      { name: 'Gaufres', desc: 'Sucre glace, chantilly, chocolat chaud', price: 6, tags: ['v'] },
      { name: 'Glaces & sorbets', desc: 'Deux ou trois boules, parfums du jour', price: 5, tags: ['v'] },
      { name: 'Croque-monsieur', desc: 'Pain de campagne, salade verte', price: 10 },
      { name: 'Planche sucrée à partager', desc: 'Crêpes, gaufre, fruits frais, chantilly', price: 16, tags: ['v'] }
    ]
  },
  {
    id: 'cocktails', title: 'Cocktails', kicker: 'L’heure dorée',
    note: 'Préparés à la demande. Tous existent en version sans alcool (– 3 €).',
    items: [
      { name: 'Pierres Blanches Spritz', desc: 'Prosecco, liqueur de pêche de vigne, thym citron, tonic', price: 12, tags: ['sig'] },
      { name: 'Mesa Margarita', desc: 'Tequila blanco, agave, citron vert, sel fumé au piment', price: 12 },
      { name: 'Corniche Sour', desc: 'Gin méditerranéen, romarin, citron', price: 12 },
      { name: 'Mont Saint-Clair', desc: 'Rhum ambré, sirop d’amande, ananas rôti, bitters', price: 12 },
      { name: 'Sangria de la maison', desc: 'Rouge ou blanche, fruits frais, au verre ou au pichet', price: 7, unit: 'le verre', prices: { verre: 7, pichet: 26 } },
      { name: 'Golden Hour — sans alcool', desc: 'Abricot, verveine, citron, ginger beer', price: 9, tags: ['v','vg'] }
    ]
  },
  {
    id: 'boissons', title: 'Vins & boissons', kicker: 'Le Languedoc d’abord',
    note: 'Carte complète des boissons chaudes, softs, bières, apéritifs et digestifs disponible à la table.',
    items: [
      { name: 'Picpoul de Pinet', desc: 'Le blanc sec et salin de l’étang de Thau', price: 6, unit: 'le verre', prices: { verre: 6, bouteille: 28 } },
      { name: 'Rosé Côtes de Thau', desc: 'Frais, parfait sous les pins', price: 6, unit: 'le verre', prices: { verre: 6, bouteille: 26 } },
      { name: 'Terrasses du Larzac', desc: 'Rouge de garrigue, syrah-grenache', price: 8, unit: 'le verre', prices: { verre: 8, bouteille: 36 } },
      { name: 'Bières pression', desc: 'Blonde ou ambrée, 25 ou 50 cl', price: 4, unit: '25 cl', prices: { '25 cl': 4, '50 cl': 7 } },
      { name: 'Boissons chaudes', desc: 'Café, thés, infusions, chocolat chaud', price: 2.5, unit: 'à partir de' },
      { name: 'Jus pressés & softs', desc: 'Orange pressée, citronnade maison, sodas, eaux minérales', price: 4, unit: 'à partir de' }
    ]
  }
];

LM.menuFormula = {
  title: 'L’ardoise du midi',
  sub: 'Tous les midis, servie de 12h à 14h30',
  lines: [
    { label: 'Plat du jour seul', price: 19 },
    { label: 'Entrée + plat ou plat + dessert', price: 25 },
    { label: 'Entrée + plat + dessert', price: 30 }
  ]
};

/* ---------- Groupes, associations, entreprises ---------- */
LM.groups = {
  intro: 'Nous recevons les groupes, les associations, les comités d’entreprise et les professionnels, midi et soir, sur devis.',
  min: 12,
  formulas: [
    { title: 'Formule déjeuner', price: 28, desc: 'Entrée, plat et dessert au choix parmi une sélection, boisson comprise.' },
    { title: 'Soirée brochettes', price: 36, desc: 'Tapas à partager, assortiment de brochettes, accompagnements à volonté, dessert.' },
    { title: 'Cocktail dînatoire', price: 32, desc: 'Tapas, planches ibériques, brochettes passées en plateau, une boisson par personne.' }
  ],
  points: [
    'À partir de 12 personnes, midi ou soir.',
    'Salle et terrasse panoramique, parking gratuit sur place.',
    'Devis sous 48 h après votre demande.',
    'Menu adapté aux régimes alimentaires sur simple demande.'
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
