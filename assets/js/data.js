/* ============================================================
   Données de la maison : tailles, pizzas de la roue, carte
   complète et avis. Tout est ici pour rester modifiable
   sans toucher au reste du code.
   ============================================================ */
window.DATA = (function () {
  'use strict';

  const SIZES = {
    S:  { label: 'S',  cm: 26, mult: 0.82, scale: 0.80 },
    M:  { label: 'M',  cm: 31, mult: 1.00, scale: 0.92 },
    L:  { label: 'L',  cm: 36, mult: 1.22, scale: 1.04 },
    XL: { label: 'XL', cm: 42, mult: 1.45, scale: 1.16 }
  };

  /* — les 8 pizzas de la Roue des Saveurs — */
  const PIZZAS = [
    {
      id: 'margherita', short: 'Margherita', name: 'Margherita', tag: 'rossa', price: 11.5, hue: 8,
      desc: 'La mère de toutes. San Marzano crues, fior di latte égoutté douze heures, basilic cueilli sur le rebord de la fenêtre, huile de Nyons.',
      chips: ['San Marzano', 'Fior di latte', 'Basilic', 'Huile d’olive'],
      recipe: { seed: 11, base: 'rossa', cheeseN: 15, toppings: [{ k: 'basilic', n: 6, s: 1.05, gap: 46 }] }
    },
    {
      id: 'marinara', short: 'Marinara', name: 'Marinara', tag: 'rossa · sans lait', price: 9.5, hue: 14,
      desc: 'Celle des pêcheurs, sans un gramme de fromage. Tomate, ail en lamelles, origan de Sicile et beaucoup d’huile. La plus ancienne, la plus honnête.',
      chips: ['Tomate', 'Ail', 'Origan', 'Sans lactose'],
      recipe: { seed: 23, base: 'rossa', cheese: false, toppings: [{ k: 'oignon', n: 7, s: .6, gap: 42 }, { k: 'basilic', n: 4, s: .85, gap: 44 }] }
    },
    {
      id: 'diavola', short: 'Diavola', name: 'Diavola', tag: 'rossa · piquante', price: 14, hue: 2,
      desc: 'Salame piccante de Calabre, ’nduja fondante et piment frais. Elle mord, puis elle réchauffe. Un verre d’eau à portée de main.',
      chips: ['Salame piccante', '’Nduja', 'Piment', 'Fior di latte'],
      recipe: { seed: 37, base: 'rossa', cheeseN: 12, toppings: [{ k: 'pepperoni', n: 8, s: 1, gap: 48 }, { k: 'nduja', n: 5, s: 1, gap: 38 }, { k: 'piment', n: 5, s: 1, gap: 34 }] }
    },
    {
      id: 'capricciosa', short: 'Capricciosa', name: 'Capricciosa', tag: 'rossa', price: 15.5, hue: 22,
      desc: 'Le caprice complet : jambon cuit à l’os, champignons de Paris poêlés, artichauts romains et olives de Gaète. Quatre quartiers, quatre humeurs.',
      chips: ['Jambon à l’os', 'Champignons', 'Artichauts', 'Olives de Gaète'],
      recipe: { seed: 51, base: 'rossa', cheeseN: 11, toppings: [{ k: 'jambon', n: 4, s: 1, gap: 56 }, { k: 'funghi', n: 5, s: .9, gap: 44 }, { k: 'artichaut', n: 4, s: 1, gap: 44 }, { k: 'olive', n: 6, s: 1, gap: 32 }] }
    },
    {
      id: 'ortolana', short: 'Ortolana', name: 'Ortolana', tag: 'rossa · vegana possible', price: 14.5, hue: 96,
      desc: 'Le potager du marché des Capucins : poivrons grillés, courgettes, artichauts, oignon doux. Version vegana avec mozzarella d’amande.',
      chips: ['Poivrons grillés', 'Champignons', 'Artichauts', 'Oignon doux'],
      recipe: { seed: 67, base: 'rossa', cheeseN: 10, toppings: [{ k: 'poivron', n: 6, s: 1, gap: 46 }, { k: 'funghi', n: 4, s: .85, gap: 42 }, { k: 'artichaut', n: 4, s: .95, gap: 42 }, { k: 'oignon', n: 4, s: .8, gap: 40 }, { k: 'olive', n: 4, s: .9, gap: 30 }] }
    },
    {
      id: 'quattro', short: '4 Formaggi', name: 'Quattro Formaggi', tag: 'bianca', price: 15, hue: 40,
      desc: 'Sans tomate. Gorgonzola dolce, pecorino romano 24 mois, ricotta de brebis, fior di latte. On sert avec un filet de miel de lavande à part.',
      chips: ['Gorgonzola', 'Pecorino 24 mois', 'Ricotta', 'Miel de lavande'],
      recipe: { seed: 83, base: 'bianca', cheeseN: 13, toppings: [{ k: 'gorgonzola', n: 6, s: 1, gap: 44 }, { k: 'ricotta', n: 5, s: 1, gap: 42 }, { k: 'parmesan', n: 6, s: 1, gap: 38 }] }
    },
    {
      id: 'burrata', short: 'Burrata', name: 'Burrata & Pesto', tag: 'bianca · à froid', price: 17, hue: 110,
      desc: 'La burrata des Pouilles posée entière à la sortie du four, pesto au mortier, pignons torréfiés, roquette. Le contraste chaud-froid, notre signature.',
      chips: ['Burrata entière', 'Pesto au mortier', 'Pignons', 'Roquette'],
      recipe: { seed: 97, base: 'bianca', cheeseN: 9, toppings: [{ k: 'pesto', n: 7, s: 1, gap: 40 }, { k: 'burrata', n: 1, s: 1.25, r: 24, gap: 8 }, { k: 'roquette', n: 6, s: 1, gap: 40 }, { k: 'pignons', n: 9, s: 1, gap: 22 }] }
    },
    {
      id: 'tartufo', short: 'Tartufo', name: 'Tartufo Nero', tag: 'bianca · de saison', price: 19.5, hue: 28,
      desc: 'Crème de truffe noire du Ventoux, champignons de saison, copeaux de pecorino, œuf de caille au centre. Servie de novembre à mars.',
      chips: ['Truffe du Ventoux', 'Champignons', 'Pecorino', 'Œuf de caille'],
      recipe: { seed: 113, base: 'bianca', cheeseN: 11, toppings: [{ k: 'funghi', n: 5, s: .9, gap: 46 }, { k: 'truffe', n: 11, s: .95, gap: 28 }, { k: 'oeuf', n: 1, s: .8, r: 20, gap: 8 }, { k: 'parmesan', n: 5, s: 1, gap: 34 }] }
    }
  ];

  /* — la carte complète — */
  const MENU = {
    rosse: [
      pick('margherita'), pick('marinara'), pick('diavola'), pick('capricciosa'), pick('ortolana'),
      {
        id: 'napoli', name: 'Napoli', tag: 'rossa', price: 13.5,
        desc: 'Anchois de Cetara, olives, câpres de Pantelleria, origan.',
        recipe: { seed: 131, base: 'rossa', cheeseN: 11, toppings: [{ k: 'anchois', n: 6, s: 1, gap: 46 }, { k: 'olive', n: 7, s: 1, gap: 32 }, { k: 'basilic', n: 3, s: .85, gap: 40 }] }
      },
      {
        id: 'bufala', name: 'Bufala DOP', tag: 'rossa', price: 15.5,
        desc: 'Mozzarella di bufala de Battipaglia posée après cuisson, tomates cerises, basilic.',
        recipe: { seed: 149, base: 'rossa', cheeseN: 8, toppings: [{ k: 'burrata', n: 3, s: .8, r: 90, gap: 62 }, { k: 'tomate', n: 6, s: .9, gap: 40 }, { k: 'basilic', n: 5, s: 1, gap: 40 }] }
      },
      {
        id: 'nduja', name: '’Nduja & Miel', tag: 'rossa · piquante', price: 16,
        desc: '’Nduja de Spilinga, miel de châtaignier, pecorino, zeste de citron.',
        recipe: { seed: 167, base: 'rossa', cheeseN: 12, toppings: [{ k: 'nduja', n: 8, s: 1.05, gap: 40 }, { k: 'parmesan', n: 5, s: 1, gap: 34 }, { k: 'piment', n: 4, s: .9, gap: 30 }] }
      }
    ],
    bianche: [
      pick('quattro'), pick('burrata'), pick('tartufo'),
      {
        id: 'patate', name: 'Patate e Rosmarino', tag: 'bianca', price: 13,
        desc: 'Pommes de terre en fines lamelles, romarin, huile d’olive, fleur de sel.',
        recipe: { seed: 181, base: 'bianca', cheeseN: 12, toppings: [{ k: 'citron', n: 7, s: 1.1, gap: 44 }, { k: 'roquette', n: 4, s: .8, gap: 40 }] }
      },
      {
        id: 'speck', name: 'Speck & Gorgonzola', tag: 'bianca', price: 16.5,
        desc: 'Speck du Trentin, gorgonzola dolce, noix, poire rôtie.',
        recipe: { seed: 199, base: 'bianca', cheeseN: 11, toppings: [{ k: 'speck', n: 5, s: 1, gap: 52 }, { k: 'gorgonzola', n: 6, s: 1, gap: 40 }, { k: 'pignons', n: 8, s: 1.1, gap: 24 }] }
      },
      {
        id: 'neve', name: 'Bianca Neve', tag: 'bianca · végétarienne', price: 14,
        desc: 'Ricotta de brebis, citron d’Amalfi, poivre de Timut, roquette.',
        recipe: { seed: 211, base: 'bianca', cheeseN: 12, toppings: [{ k: 'ricotta', n: 7, s: 1.05, gap: 40 }, { k: 'citron', n: 5, s: .9, gap: 40 }, { k: 'roquette', n: 6, s: 1, gap: 36 }] }
      }
    ],
    antipasti: [
      { id: 'bruschetta', name: 'Bruschetta al pomodoro', price: 7, tag: 'x3', desc: 'Pain de la veille grillé au four à bois, tomates, ail, basilic.', glyph: '🍞' },
      { id: 'arancini', name: 'Arancini di Nonna', price: 8, tag: 'x3', desc: 'Boules de risotto safrané, cœur de mozzarella, panées et frites minute.', glyph: '🍙' },
      { id: 'burrataAnti', name: 'Burrata & tomates confites', price: 12, tag: 'à partager', desc: 'Une burrata entière des Pouilles, tomates confites 6 h, basilic, huile nouvelle.', glyph: '🧀' },
      { id: 'focaccia', name: 'Focaccia au romarin', price: 6, tag: 'du four', desc: 'Même pâte que les pizzas, huile, romarin, fleur de sel.', glyph: '🌿' },
      { id: 'misto', name: 'Antipasto misto', price: 14, tag: '2 pers.', desc: 'Charcuterie de Calabre, pecorino, olives de Gaète, légumes marinés.', glyph: '🫒' }
    ],
    dolci: [
      { id: 'tiramisu', name: 'Tiramisù di Nonna', price: 7, tag: 'la recette de 1974', desc: 'Mascarpone battu à la main, café du torréfacteur d’à côté, cacao amer.', glyph: '🍮' },
      { id: 'cannolo', name: 'Cannolo siciliano', price: 6, tag: 'garni minute', desc: 'Ricotta de brebis, pistache de Bronte, écorces d’orange confite.', glyph: '🥐' },
      { id: 'panna', name: 'Panna cotta pistache', price: 7, tag: 'maison', desc: 'Crème de Normandie, gousse de vanille, coulis de pistache.', glyph: '🍨' },
      { id: 'sorbet', name: 'Sorbet citron de Menton', price: 5, tag: 'sans lait', desc: 'Deux boules, un trait de limoncello par-dessus si vous le demandez.', glyph: '🍋' }
    ],
    bevande: [
      { id: 'nero', name: 'Nero d’Avola', price: 5, tag: 'le verre · 18 € la carafe', desc: 'Sicile, rouge souple et poivré. Notre compagnon des pizze rosse.', glyph: '🍷' },
      { id: 'chinotto', name: 'Chinotto', price: 4, tag: '25 cl', desc: 'L’amer italien qui ressemble au cola sans lui ressembler du tout.', glyph: '🥤' },
      { id: 'limonata', name: 'Limonata amalfitaine', price: 4.5, tag: '33 cl', desc: 'Citrons de la côte, à peine sucrée, servie très froide.', glyph: '🍋‍🟩' },
      { id: 'caffe', name: 'Caffè', price: 2, tag: 'ristretto', desc: 'Serré, sur le comptoir, debout. Comme il se doit.', glyph: '☕' },
      { id: 'amaro', name: 'Amaro del Nonno', price: 6, tag: 'digestivo', desc: 'Trente-deux plantes, la bouteille reste sur la table.', glyph: '🥃' }
    ]
  };

  function pick(id) {
    const p = PIZZAS.find((x) => x.id === id);
    return { id: p.id, name: p.name, tag: p.tag, price: p.price, desc: p.desc, recipe: p.recipe };
  }

  const REVIEWS = [
    { t: 'La pâte est vivante, on la sent respirer sous la dent.', a: 'Camille R.' },
    { t: 'Meilleure Diavola au sud de Naples. J’ai vérifié, deux fois.', a: 'Yannis P.' },
    { t: 'On mange debout, on repart heureux. Le Panier a de la chance.', a: 'Soraya B.' },
    { t: 'La burrata posée à la sortie du four : un truc de fou.', a: 'Thomas L.' },
    { t: 'Le four est visible depuis la salle, mes enfants ne regardaient que ça.', a: 'Nadia K.' },
    { t: '72 heures de pâte, ça se sent dès la première bouchée.', a: 'Marc-Antoine D.' },
    { t: 'Le tiramisù de Nonna vaut à lui seul le détour.', a: 'Léa M.' },
    { t: 'Service rapide, pizza brûlante à la maison en 20 minutes.', a: 'Farid O.' }
  ];

  return { SIZES, PIZZAS, MENU, REVIEWS };
})();
