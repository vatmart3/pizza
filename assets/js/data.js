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
    strong: 'Parking gratuit sur place',
    en: { label: 'By car', text: 'Drive up the corniche to the Pierres Blanches site. The restaurant is at the very end of allée Pierre Barthas, on the right.', strong: 'Free parking on site' }
  },
  {
    id: 'bus', label: 'En bus',
    text: 'Ligne 5 du réseau Sète Agglopôle Mobilité, arrêt « Les Pierres Blanches ». L’arrêt est devant le restaurant.',
    strong: 'Ligne 5 · arrêt Les Pierres Blanches',
    en: { label: 'By bus', text: 'Line 5 of the Sète Agglopôle Mobilité network, stop « Les Pierres Blanches ». The stop is right outside.', strong: 'Line 5 · Les Pierres Blanches stop' }
  },
  {
    id: 'pied', label: 'À pied',
    text: 'Depuis le centre de Sète, comptez une bonne quarantaine de minutes de montée par les sentiers du Mont Saint-Clair, à travers la forêt domaniale.',
    strong: '187 m d’altitude',
    en: { label: 'On foot', text: 'From the centre of Sète, allow a good forty minutes uphill on the Mont Saint-Clair paths, through the state forest.', strong: '187 m above the sea' }
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
      en: { label: 'High season', tag: 'Skewer evenings', note: 'Breakfast, the lunchtime slate, snacks all day and skewer evenings facing the sunset.' },
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
      en: { label: 'Late season', tag: 'Facing the sea', note: 'Morning coffee, the lunchtime slate and afternoon tea facing the sea. Skewer evenings return in April.' },
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
      en: { label: 'Winter closing', tag: 'Closed for winter', note: 'La Mesa rests for the winter. We will see you again with the first sun of spring.' },
      hours: {}
    }
  ]
};

LM.services = {
  lunch:  { label: 'Déjeuner', en: 'Lunch', slots: ['12:00','12:15','12:30','12:45','13:00','13:15','13:30','13:45','14:00'] },
  dinner: { label: 'Soirée brochettes', en: 'Skewer evening', slots: ['19:00','19:15','19:30','19:45','20:00','20:15','20:30','20:45','21:00','21:15'] }
};
LM.dayNames = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
LM.monthNames = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
LM.dayNamesEn = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
LM.monthNamesEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ---------- Le coucher de soleil ----------
   C'est l'argument numéro un de la maison : le site le calcule pour
   le soir même, à l'heure de Sète, et conseille une heure d'arrivée.
   « before » = minutes d'avance conseillées sur le coucher. */
LM.sun = { lat: 43.3934, lng: 3.6802, zone: 'Europe/Paris', before: 90 };

/* ---------- Réservation ----------
   Chez La Mesa, la réservation se fait par téléphone. Un e-mail
   ne vaut pas réservation : le formulaire du site est une
   demande de rappel, et le dit clairement. */
LM.booking = {
  mode: 'phone',
  headline: 'La réservation se fait par téléphone',
  text: 'Nous confirmons chaque table de vive voix. Un message ou un e-mail ne vaut pas réservation.',
  formTitle: 'Vous préférez être rappelé ?',
  formText: 'Laissez-nous vos coordonnées et le créneau souhaité : nous vous rappelons pour confirmer.',
  en: {
    headline: 'Booking is by telephone',
    text: 'We confirm every table by voice. A message or an e-mail is not a booking.',
    formTitle: 'Would you rather be called back?',
    formText: 'Leave us your details and the time you would like: we will call you back to confirm.'
  }
};

/* ---------- La carte ----------
   tags : v = végétarien · vg = végan · sg = sans gluten · sig = signature
   Les prix sont en euros, nets, service compris. */
LM.menuNotice = 'Carte donnée à titre indicatif : l’ardoise change chaque jour selon le marché et la pêche.';
LM.menuNoticeEn = 'Menu given as a guide: the slate changes every day with the market and the catch.';

LM.menu = [
  {
    id: 'midi', title: 'L’ardoise du midi', kicker: 'Écrite chaque matin',
    en: { title: 'Today\u2019s slate', kicker: 'Written every morning', note: 'Fresh, local produce and Mediterranean recipes. The slate changes daily: the dishes below give you the spirit of the house.' },
    note: 'Produits frais et locaux, recettes méditerranéennes. L’ardoise change tous les jours : ce qui suit en donne le ton.',
    items: [
      { name: 'Focaccia aux légumes marinés', desc: 'Courgette, poivron, aubergine, ricotta citronnée, basilic', price: 14, tags: ['v','sig'], en: { name: 'Marinated vegetable focaccia', desc: 'Courgette, pepper, aubergine, lemon ricotta, basil' } },
      { name: 'Tartare de thon', desc: 'Thon taillé au couteau, avocat, sésame, huile d’olive, citron vert', price: 17, tags: ['sg','sig'], en: { name: 'Tuna tartare', desc: 'Hand-cut tuna, avocado, sesame, olive oil, lime' } },
      { name: 'Thon snacké en croûte de sésame', desc: 'Croûte de sésame, légumes du moment, réduction soja-gingembre', price: 22, tags: ['sig'], en: { name: 'Seared tuna, sesame crust', desc: 'Sesame crust, vegetables of the moment, soy-ginger reduction' } },
      { name: 'Filet de bar, sauce Mesa', desc: 'Notre sauce maison, écrasé de pommes de terre à l’huile d’olive', price: 24, tags: ['sg','sig'], en: { name: 'Sea bass fillet, Mesa sauce', desc: 'Our house sauce, crushed potatoes with olive oil' } },
      { name: 'Encornets persillade & chorizo', desc: 'Persillade, chorizo doux, piquillos, riz de Camargue', price: 21, en: { name: 'Squid, parsley & chorizo', desc: 'Garlic parsley, mild chorizo, piquillos, Camargue rice' } },
      { name: 'Linguines à l’italienne', desc: 'Tomates confites, olives de Lucques, parmesan, roquette', price: 18, tags: ['v'], en: { name: 'Italian linguine', desc: 'Confit tomatoes, Lucques olives, parmesan, rocket' } },
      { name: 'Burger du jour', desc: 'Bœuf Black Angus, pain brioché, frites maison', price: 19, en: { name: 'Burger of the day', desc: 'Black Angus beef, brioche bun, hand-cut fries' } },
      { name: 'Salade du sommet', desc: 'Jeunes pousses, féta, pastèque, menthe, graines torréfiées', price: 15, tags: ['v','sg'], en: { name: 'Summit salad', desc: 'Young leaves, feta, watermelon, mint, toasted seeds' } }
    ]
  },
  {
    id: 'brochettes', title: 'Les soirées brochettes', kicker: 'D’avril à fin septembre',
    en: { title: 'Skewer evenings', kicker: 'April to end of September', note: 'Skewered and grilled on site the same day, before service. Count on two or three per person, served with sides in the middle of the table.' },
    note: 'Montées et grillées sur place le jour même, avant le service. À composer : comptez deux à trois brochettes par personne, servies avec les accompagnements au centre de la table.',
    items: [
      { name: 'Gambas', desc: 'Deux pièces, marinade à l’ail et au persil', price: 9, unit: 'la brochette', tags: ['sg','sig'], en: { name: 'King prawns', desc: 'Two pieces, garlic and parsley marinade' } },
      { name: 'Saint-Jacques', desc: 'Cinq noix, beurre citronné', price: 9, unit: 'la brochette', tags: ['sg'], en: { name: 'Scallops', desc: 'Five scallops, lemon butter' } },
      { name: 'Thon rouge', desc: 'Marinade soja, sésame, gingembre', price: 9, unit: 'la brochette', tags: ['sg'], en: { name: 'Bluefin tuna', desc: 'Soy, sesame and ginger marinade' } },
      { name: 'Poulet mariné', desc: 'Citron, paprika fumé, herbes de la garrigue', price: 8, unit: 'la brochette', tags: ['sg'], en: { name: 'Marinated chicken', desc: 'Lemon, smoked paprika, garrigue herbs' } },
      { name: 'Bœuf & poivrons', desc: 'Chimichurri maison', price: 9, unit: 'la brochette', tags: ['sg'], en: { name: 'Beef & peppers', desc: 'House chimichurri' } },
      { name: 'Légumes de saison', desc: 'Courgette, oignon doux, tomate cerise, halloumi', price: 7, unit: 'la brochette', tags: ['v','sg'], en: { name: 'Seasonal vegetables', desc: 'Courgette, sweet onion, cherry tomato, halloumi' } },
      { name: 'Les accompagnements', desc: 'Frites maison, riz safrané, salade d’herbes, aïoli — à volonté sur la table', price: 6, unit: 'par personne', tags: ['v'], en: { name: 'The sides', desc: 'Hand-cut fries, saffron rice, herb salad, aioli — unlimited, on the table' } }
    ]
  },
  {
    id: 'tapas', title: 'Les tapas', kicker: 'Pour l’apéritif, face au large',
    en: { title: 'Tapas', kicker: 'For drinks, facing the open sea', note: 'La Mesa means the table: everything is made for the middle of it, to pick at while the sun goes down.' },
    note: 'La Mesa, c’est la table : tout est pensé pour le milieu, à picorer pendant que le soleil descend.',
    items: [
      { name: 'Planche ibérique', desc: 'Jambon, chorizo, lomo, pain grillé à l’huile d’olive', price: 16, en: { name: 'Iberian board', desc: 'Ham, chorizo, lomo, bread grilled with olive oil' } },
      { name: 'Croquetas maison', desc: 'Jambon ou champignons, selon le jour', price: 9, unit: 'les 4', en: { name: 'House croquetas', desc: 'Ham or mushroom, depending on the day' } },
      { name: 'Patatas bravas', desc: 'Sauce brava, aïoli', price: 8, tags: ['v'], en: { name: 'Patatas bravas', desc: 'Brava sauce, aioli' } },
      { name: 'Padrón grillés', desc: 'Huile d’olive, fleur de sel', price: 7, tags: ['v','vg','sg'], en: { name: 'Grilled padrón peppers', desc: 'Olive oil, sea salt' } },
      { name: 'Anchois de Collioure', desc: 'Beurre demi-sel, focaccia grillée', price: 10, en: { name: 'Collioure anchovies', desc: 'Salted butter, grilled focaccia' } },
      { name: 'Olives & amandes', desc: 'Marinées à la maison', price: 5, tags: ['v','vg','sg'], en: { name: 'Olives & almonds', desc: 'Marinated in house' } }
    ]
  },
  {
    id: 'snack', title: 'Le snack & le goûter', kicker: 'Toute la journée, dès 8h30',
    en: { title: 'Snack & afternoon', kicker: 'All day, from 8.30 am', note: 'Eat in or take away, no booking: breakfast in the sun, the post-hike break, afternoon tea facing the sea.' },
    note: 'Sur place ou à emporter, sans réservation : le petit-déjeuner au soleil, la pause d’après-randonnée, le goûter face à la mer.',
    items: [
      { name: 'Le petit-déjeuner', desc: 'Boisson chaude, jus pressé, viennoiserie, tartines', price: 11, tags: ['v'], en: { name: 'Breakfast', desc: 'Hot drink, fresh juice, pastry, bread and butter' } },
      { name: 'Crêpes', desc: 'Sucre, confiture, pâte à tartiner ou caramel au beurre salé', price: 5, tags: ['v'], en: { name: 'Crêpes', desc: 'Sugar, jam, chocolate spread or salted caramel' } },
      { name: 'Gaufres', desc: 'Sucre glace, chantilly, chocolat chaud', price: 6, tags: ['v'], en: { name: 'Waffles', desc: 'Icing sugar, whipped cream, hot chocolate' } },
      { name: 'Glaces & sorbets', desc: 'Deux ou trois boules, parfums du jour', price: 5, tags: ['v'], en: { name: 'Ice cream & sorbets', desc: 'Two or three scoops, flavours of the day' } },
      { name: 'Croque-monsieur', desc: 'Pain de campagne, salade verte', price: 10, en: { name: 'Croque-monsieur', desc: 'Country bread, green salad' } },
      { name: 'Planche sucrée à partager', desc: 'Crêpes, gaufre, fruits frais, chantilly', price: 16, tags: ['v'], en: { name: 'Sweet board to share', desc: 'Crêpes, waffle, fresh fruit, whipped cream' } }
    ]
  },
  {
    id: 'cocktails', title: 'Cocktails', kicker: 'L’heure dorée',
    en: { title: 'Cocktails', kicker: 'The golden hour', note: 'Made to order. Every one comes in an alcohol-free version (– €3).' },
    note: 'Préparés à la demande. Tous existent en version sans alcool (– 3 €).',
    items: [
      { name: 'Pierres Blanches Spritz', desc: 'Prosecco, liqueur de pêche de vigne, thym citron, tonic', price: 12, tags: ['sig'], en: { name: 'Pierres Blanches Spritz', desc: 'Prosecco, vine peach liqueur, lemon thyme, tonic' } },
      { name: 'Mesa Margarita', desc: 'Tequila blanco, agave, citron vert, sel fumé au piment', price: 12, en: { name: 'Mesa Margarita', desc: 'Blanco tequila, agave, lime, chilli-smoked salt' } },
      { name: 'Corniche Sour', desc: 'Gin méditerranéen, romarin, citron', price: 12, en: { name: 'Corniche Sour', desc: 'Mediterranean gin, rosemary, lemon' } },
      { name: 'Mont Saint-Clair', desc: 'Rhum ambré, sirop d’amande, ananas rôti, bitters', price: 12, en: { name: 'Mont Saint-Clair', desc: 'Amber rum, almond syrup, roasted pineapple, bitters' } },
      { name: 'Sangria de la maison', desc: 'Rouge ou blanche, fruits frais, au verre ou au pichet', price: 7, unit: 'le verre', prices: { verre: 7, pichet: 26 }, en: { name: 'House sangria', desc: 'Red or white, fresh fruit, by the glass or the jug' } },
      { name: 'Golden Hour — sans alcool', desc: 'Abricot, verveine, citron, ginger beer', price: 9, tags: ['v','vg'], en: { name: 'Golden Hour — alcohol-free', desc: 'Apricot, verbena, lemon, ginger beer' } }
    ]
  },
  {
    id: 'boissons', title: 'Vins & boissons', kicker: 'Le Languedoc d’abord',
    en: { title: 'Wine & drinks', kicker: 'Languedoc first', note: 'Full list of hot drinks, soft drinks, beers, aperitifs and digestifs available at your table.' },
    note: 'Carte complète des boissons chaudes, softs, bières, apéritifs et digestifs disponible à la table.',
    items: [
      { name: 'Picpoul de Pinet', desc: 'Le blanc sec et salin de l’étang de Thau', price: 6, unit: 'le verre', prices: { verre: 6, bouteille: 28 }, en: { name: 'Picpoul de Pinet', desc: 'The dry, saline white of the Thau lagoon' } },
      { name: 'Rosé Côtes de Thau', desc: 'Frais, parfait sous les pins', price: 6, unit: 'le verre', prices: { verre: 6, bouteille: 26 }, en: { name: 'Côtes de Thau rosé', desc: 'Fresh, perfect under the pines' } },
      { name: 'Terrasses du Larzac', desc: 'Rouge de garrigue, syrah-grenache', price: 8, unit: 'le verre', prices: { verre: 8, bouteille: 36 }, en: { name: 'Terrasses du Larzac', desc: 'Garrigue red, syrah-grenache' } },
      { name: 'Bières pression', desc: 'Blonde ou ambrée, 25 ou 50 cl', price: 4, unit: '25 cl', prices: { '25 cl': 4, '50 cl': 7 }, en: { name: 'Draught beer', desc: 'Blonde or amber, 25 or 50 cl' } },
      { name: 'Boissons chaudes', desc: 'Café, thés, infusions, chocolat chaud', price: 2.5, unit: 'à partir de', en: { name: 'Hot drinks', desc: 'Coffee, teas, infusions, hot chocolate' } },
      { name: 'Jus pressés & softs', desc: 'Orange pressée, citronnade maison, sodas, eaux minérales', price: 4, unit: 'à partir de', en: { name: 'Fresh juices & soft drinks', desc: 'Fresh orange, homemade lemonade, sodas, mineral water' } }
    ]
  }
];

LM.menuFormula = {
  title: 'L’ardoise du midi',
  sub: 'Tous les midis, servie de 12h à 14h30',
  en: { title: 'The lunchtime slate', sub: 'Every day, served from 12 to 2.30 pm' },
  lines: [
    { label: 'Plat du jour seul', price: 19, en: 'Main course only' },
    { label: 'Entrée + plat ou plat + dessert', price: 25, en: 'Starter + main, or main + dessert' },
    { label: 'Entrée + plat + dessert', price: 30, en: 'Starter + main + dessert' }
  ]
};

/* ---------- Groupes, associations, entreprises ---------- */
LM.groups = {
  intro: 'Nous recevons les groupes, les associations, les comités d’entreprise et les professionnels, midi et soir, sur devis.',
  min: 12,
  formulas: [
    { title: 'Formule déjeuner', price: 28, desc: 'Entrée, plat et dessert au choix parmi une sélection, boisson comprise.',
      en: { title: 'Lunch menu', desc: 'Starter, main and dessert chosen from a selection, one drink included.' } },
    { title: 'Soirée brochettes', price: 36, desc: 'Tapas à partager, assortiment de brochettes, accompagnements à volonté, dessert.',
      en: { title: 'Skewer evening', desc: 'Tapas to share, an assortment of skewers, unlimited sides, dessert.' } },
    { title: 'Cocktail dînatoire', price: 32, desc: 'Tapas, planches ibériques, brochettes passées en plateau, une boisson par personne.',
      en: { title: 'Standing dinner', desc: 'Tapas, Iberian boards, skewers passed on trays, one drink per person.' } }
  ],
  points: [
    'À partir de 12 personnes, midi ou soir.',
    'Salle et terrasse panoramique, parking gratuit sur place.',
    'Devis sous 48 h après votre demande.',
    'Menu adapté aux régimes alimentaires sur simple demande.'
  ],
  pointsEn: [
    'From 12 people, lunch or dinner.',
    'Dining room and panoramic terrace, free parking on site.',
    'A quote within 48 hours of your enquiry.',
    'Menus adapted to dietary requirements on request.'
  ]
};

/* ---------- Textes produits par le script ----------
   Tout ce que le JavaScript écrit lui-même (statut d'ouverture, messages
   de formulaire, coucher de soleil) passe par ici, dans les deux langues. */
LM.t = {
  fr: {
    open: 'Ouvert · ferme à %s', closed: 'Fermé · ouvre %s à %s', shut: 'Fermé pour l’hiver · retour le %s',
    closedShort: 'Fermé', today: 'aujourd’hui', tomorrow: 'demain',
    sunsetTonight: 'Coucher du soleil ce soir', sunsetAt: 'à %s',
    sunToday: 'Ce soir', sunTomorrow: 'Demain',
    sunsetAdvice: 'Arrivez vers %s pour en profiter à table.',
    sunsetClosed: 'Le soleil se couchera à %s. Nous rouvrons le %s.',
    copied: 'Copié !', linkCopied: 'Lien copié dans le presse-papiers',
    formErr: 'Merci de vérifier les champs en rouge.',
    sent: 'Message envoyé. Merci !', quoteSent: 'Demande envoyée. Nous revenons vers vous sous 48 h.',
    newsletter: 'Merci ! Vous recevrez nos nouvelles une fois par mois.',
    badMail: 'Adresse e-mail invalide.',
    noSlot: 'Pas de service « %s » %s — essayez l’autre service ou une autre date.',
    thatDay: 'ce jour-là', people: 'personnes', person: 'personne', closedLabel: 'fermé',
    shareText: 'Réservez une table face à la mer, à Sète.'
  },
  en: {
    open: 'Open · closes at %s', closed: 'Closed · opens %s at %s', shut: 'Closed for winter · back on %s',
    closedShort: 'Closed', today: 'today', tomorrow: 'tomorrow',
    sunsetTonight: 'Sunset tonight', sunsetAt: 'at %s',
    sunToday: 'Tonight', sunTomorrow: 'Tomorrow',
    sunsetAdvice: 'Arrive around %s to enjoy it from your table.',
    sunsetClosed: 'The sun will set at %s. We reopen on %s.',
    copied: 'Copied!', linkCopied: 'Link copied to the clipboard',
    formErr: 'Please check the fields marked in red.',
    sent: 'Message sent. Thank you!', quoteSent: 'Enquiry sent. We will get back to you within 48 hours.',
    newsletter: 'Thank you! You will hear from us once a month.',
    badMail: 'Invalid e-mail address.',
    noSlot: 'No « %s » service %s — try the other service or another date.',
    thatDay: 'that day', people: 'people', person: 'person', closedLabel: 'closed',
    shareText: 'Book a table facing the sea, in Sète.'
  }
};

/* ---------- Libellés d'interface, pour la carte scannée à table ---------- */
LM.ui = {
  fr: {
    menu: 'La carte', search: 'Rechercher un plat…', all: 'Tout', none: 'Aucun plat ne correspond.',
    sun: 'Mode plein soleil', night: 'Mode nuit', lang: 'English',
    priceEach: 'Prix à', net: 'Prix nets en euros, taxes et service compris.',
    allerg: 'Allergènes : la liste des 14 allergènes réglementaires est disponible sur demande auprès de l’équipe.',
    alcohol: 'L’abus d’alcool est dangereux pour la santé · à consommer avec modération.',
    offseason: 'Les soirées brochettes reprennent en avril. Cette carte est donnée à titre indicatif.',
    site: 'Voir le site', call: 'Nous appeler'
  },
  en: {
    menu: 'Menu', search: 'Search a dish…', all: 'All', none: 'No dish matches.',
    sun: 'Bright sunlight', night: 'Night mode', lang: 'Français',
    priceEach: 'Price per', net: 'Prices in euros, taxes and service included.',
    allerg: 'Allergens: the list of the 14 regulated allergens is available from the team on request.',
    alcohol: 'Excessive drinking is bad for your health · please drink responsibly.',
    offseason: 'Skewer evenings are back in April. This menu is indicative.',
    site: 'Visit the site', call: 'Call us'
  }
};

LM.tags = {
  v:  { label: 'Végétarien', en: 'Vegetarian', short: 'V' },
  vg: { label: 'Végan', en: 'Vegan', short: 'VG' },
  sg: { label: 'Sans gluten', en: 'Gluten free', short: 'SG' },
  sig:{ label: 'Signature', en: 'House signature', short: '★' }
};

/* ---------- Les avis ----------
   ⚠ ATTENTION — CES SIX AVIS SONT DES EXEMPLES, PAS DE VRAIS AVIS.
   Ils ont été rédigés pour la maquette, à partir des thèmes qui
   reviennent dans les avis publics (la vue, les brochettes, les
   cocktails, la montée). Les prénoms sont inventés.

   IL FAUT LES REMPLACER PAR DE VRAIS EXTRAITS AVANT LA MISE EN LIGNE.
   Publier de faux avis est interdit (code de la consommation, art.
   L. 121-2 et suivants) et sanctionné par la DGCCRF.

   Recopiez des avis réels de votre fiche Google ou de TripAdvisor, avec
   le prénom tel qu'il y figure et le mois de publication. Pour vider
   complètement la section, mettez simplement : LM.reviews = []; */
LM.reviews = [
  { text: 'La vue est tout simplement la plus belle de Sète. On dîne face au coucher de soleil, avec la mer à perte de vue.',
    en: 'Quite simply the finest view in Sète. You dine facing the sunset, with the sea as far as you can see.',
    name: 'Sylvie', when: 'août', stars: 5 },
  { text: 'Les brochettes sont excellentes et préparées devant vous. Le thon était parfait, les cocktails aussi.',
    en: 'The skewers are excellent and grilled in front of you. The tuna was perfect, and so were the cocktails.',
    name: 'Marc', when: 'juillet', stars: 5 },
  { text: 'Un cadre incroyable en pleine nature, tout en haut du Mont Saint-Clair. On se croirait loin de tout.',
    en: 'An incredible setting in the middle of nature, right at the top of Mont Saint-Clair. You feel miles from anywhere.',
    name: 'Claire', when: 'juin', stars: 5 },
  { text: 'Parfait pour l’apéritif au coucher du soleil. Pensez à réserver, la terrasse se remplit vite.',
    en: 'Perfect for drinks at sunset. Do book — the terrace fills up fast.',
    name: 'Julien', when: 'septembre', stars: 4 },
  { text: 'Montée un peu raide mais le parking est gratuit et la récompense en vaut la peine.',
    en: 'A fairly steep climb, but parking is free and the reward is worth it.',
    name: 'Nathalie', when: 'mai', stars: 4 },
  { text: 'Ardoise du midi très fraîche, le poisson était remarquable. Accueil sympathique.',
    en: 'A very fresh lunchtime slate, the fish was remarkable. Friendly welcome.',
    name: 'Pierre', when: 'octobre', stars: 5 }
];

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
