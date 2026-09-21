/* ============================================================
   La Mesa — carte consultée à table (QR code)
   Page autonome : ne dépend pas de app.js.
   Priorité absolue à l'affichage immédiat sur un téléphone
   avec un réseau médiocre.
   ============================================================ */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const store = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };
  const pad = n => String(n).padStart(2, '0');

  /* ---------------------------------------------------- langue */
  let lang = root.getAttribute('data-lang') === 'en' ? 'en' : 'fr';
  const T = () => (LM.ui && LM.ui[lang]) || {};
  /* Le texte anglais s'il existe, le français sinon. */
  const tr = (o, k) => (lang === 'en' && o.en && o.en[k]) || o[k];

  /* ---------------------------------------------------- saison */
  const mmdd = d => pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const inPeriod = (k, a, b) => a <= b ? (k >= a && k <= b) : (k >= a || k <= b);
  const season = () => ((LM.season && LM.season.periods) || []).find(p => inPeriod(mmdd(new Date()), p.from, p.to)) || null;
  /* Les brochettes ne sont servies qu'en pleine saison : on le dit, on ne cache rien. */
  const brochettesOff = () => { const s = season(); return !!s && s.id !== 'haute'; };

  /* ------------------------------------------------ état filtre */
  const diets = new Set();
  let q = '';

  /* ------------------------------------------------- affichage */
  const listEl = $('[data-list]'), tabsEl = $('[data-tabs]'), dietsEl = $('[data-diets]');

  const tagHTML = t => {
    const d = LM.tags[t]; if (!d) return '';
    const label = lang === 'en' ? (d.en || d.label) : d.label;
    return `<span class="tg${t === 'sig' ? ' tg--s' : ''}" title="${esc(label)}">${esc(d.short)}</span>`;
  };

  /* Le prix affiché en gros : le premier format, ou le prix simple. */
  const priceMain = it => `${it.prices ? it.prices[Object.keys(it.prices)[0]] : it.price} €`;
  /* Le détail (unité, formats) part sur sa propre ligne : sur un écran de
     320 px, « verre 6 € · bouteille 28 € » ne tient pas à côté du nom. */
  const priceNote = it => {
    if (it.prices) return Object.keys(it.prices).map(n => `${esc(n)} ${it.prices[n]} €`).join(' · ');
    return it.unit ? esc(it.unit) : '';
  };

  /* Quand tous les plats d'une section partagent la même unité
     (« la brochette »), on l'annonce une fois en tête plutôt que de la
     répéter sous chaque prix. */
  const commonUnit = c => {
    const n = {};
    c.items.forEach(i => { if (!i.prices && i.unit) n[i.unit] = (n[i.unit] || 0) + 1; });
    const best = Object.keys(n).sort((a, b) => n[b] - n[a])[0];
    /* Il faut une vraie majorité, sinon l'annonce en tête induit en erreur. */
    return best && n[best] > 1 && n[best] >= Math.ceil(c.items.length / 2) ? best : null;
  };

  /* L'unité commune est annoncée en tête ; seules les exceptions
     (« par personne » au milieu des brochettes) restent sous le prix. */
  const dishHTML = (it, common) => {
    const note = (common && it.unit === common && !it.prices) ? '' : priceNote(it);
    const tags = (it.tags || []).map(tagHTML).join('');
    return `<article class="dish" data-tags="${(it.tags || []).join(' ')}" data-text="${esc((tr(it,'name') + ' ' + tr(it,'desc')).toLowerCase())}">
      <div class="dish__r">
        <h3 class="dish__n">${esc(tr(it, 'name'))}${tags ? `<span class="tgs">${tags}</span>` : ''}</h3>
        <span class="dish__l" aria-hidden="true"></span>
        <span class="dish__p">${priceMain(it)}</span>
      </div>
      ${note ? `<span class="dish__u">${note}</span>` : ''}
      <p class="dish__d">${esc(tr(it, 'desc'))}</p>
    </article>`;
  };

  const render = () => {
    listEl.innerHTML = LM.menu.map(c => {
      const cu = commonUnit(c);
      return `<section class="cat" id="c-${c.id}" aria-labelledby="h-${c.id}">
        <span class="cat__k">${esc(tr(c, 'kicker'))}</span>
        <h2 class="cat__t" id="h-${c.id}">${esc(tr(c, 'title'))}</h2>
        ${c.note ? `<p class="cat__n">${esc(tr(c, 'note'))}</p>` : ''}
        ${c.id === 'brochettes' && brochettesOff() ? `<p class="cat__off">${esc(T().offseason)}</p>` : ''}
        ${cu ? `<p class="cat__u">${esc(T().priceEach || 'Prix')} ${esc(cu)}</p>` : ''}
        ${c.items.map(it => dishHTML(it, cu)).join('')}
      </section>`;
    }).join('') + `<p class="none" hidden data-none>${esc(T().none)}</p>`;

    tabsEl.innerHTML = LM.menu.map((c, i) => `<a href="#c-${c.id}" class="${i ? '' : 'on'}">${esc(tr(c, 'title'))}</a>`).join('');

    dietsEl.innerHTML = ['v', 'sg', 'sig'].map(t => {
      const d = LM.tags[t];
      const label = lang === 'en' ? (d.en || d.label) : d.label;
      return `<button class="chip" type="button" data-diet="${t}" aria-pressed="${diets.has(t)}">${esc(label)}</button>`;
    }).join('');

    $$('[data-t]').forEach(el => { const v = T()[el.dataset.t]; if (v) el.textContent = v; });
    $('[data-search]').placeholder = T().search || '';
    const phone = (LM.info || {}).phoneIntl;
    if (phone) $$('[data-href=phoneIntl]').forEach(a => a.href = 'tel:' + phone);
    document.title = `${T().menu} — La Mesa, Les Pierres Blanches · Sète`;
    filter();
    paintTheme();
  };

  /* -------------------------------------- recherche et filtres */
  const filter = () => {
    let shown = 0;
    LM.menu.forEach(c => {
      const sec = $('#c-' + c.id);
      let n = 0;
      $$('.dish', sec).forEach(d => {
        const tags = d.dataset.tags.split(' ');
        const ok = (!q || d.dataset.text.includes(q)) && [...diets].every(t => tags.includes(t));
        d.hidden = !ok; if (ok) n++;
      });
      sec.hidden = !n; shown += n;
    });
    $('[data-none]').hidden = shown > 0;
  };

  /* Clair / sombre — même préférence que le reste du site. */
  const isDark = () => root.getAttribute('data-theme') === 'dark';
  const paintTheme = () => {
    const dark = isDark();
    $('[data-sun-toggle]').setAttribute('aria-pressed', String(dark));
    const m = $('meta[name=theme-color]'); if (m) m.content = dark ? '#0A0A09' : '#E7DFCE';
    $$('[data-t=sun]').forEach(el => el.textContent = dark ? T().sun : T().night);
  };
  $('[data-sun-toggle]').addEventListener('click', () => {
    const dark = !isDark();
    dark ? root.setAttribute('data-theme', 'dark') : root.removeAttribute('data-theme');
    store('lm-theme', dark ? 'dark' : 'light');
    paintTheme();
  });

  /* ------------------------------------------------ événements */
  render();

  $('[data-search]').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); filter(); });

  dietsEl.addEventListener('click', e => {
    const b = e.target.closest('[data-diet]'); if (!b) return;
    const t = b.dataset.diet;
    diets.has(t) ? diets.delete(t) : diets.add(t);
    b.setAttribute('aria-pressed', diets.has(t));
    filter();
  });


  $('[data-lang-toggle]').addEventListener('click', () => {
    lang = lang === 'fr' ? 'en' : 'fr';
    root.lang = lang; root.setAttribute('data-lang', lang);
    store('lm-lang', lang);
    render();
  });

  /* Onglet actif : la section la plus haute encore visible. */
  const tabs = () => $$('a', tabsEl);
  let ticking = false;
  const spy = () => {
    ticking = false;
    const y = scrollY + 90;
    let active = LM.menu[0].id;
    for (const c of LM.menu) { const s = $('#c-' + c.id); if (s && !s.hidden && s.offsetTop <= y) active = c.id; }
    tabs().forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#c-' + active));
    $('[data-up]').classList.toggle('on', scrollY > 700);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
  spy();

  $('[data-up]').addEventListener('click', () => scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }));

  /* La carte reste consultable même si le réseau lâche au milieu du service. */
  if ('serviceWorker' in navigator && location.protocol === 'https:')
    addEventListener('load', () => navigator.serviceWorker.register((root.dataset.root || '') + 'sw.js').catch(() => {}));

  /* Le bouton garde son libellé au rechargement. */
  paintTheme();
})();
