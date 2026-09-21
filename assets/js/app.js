/* ============================================================
   La Mesa — Les Pierres Blanches
   Vanilla JS, aucune dépendance.
   Organisation :
     1. outils            2. horaires & infos
     3. moteur de défilement (un seul rAF, défilement lissé)
     4. navigation instantanée (préchargement + remplacement du <main>)
     5. modules de page    6. préloader
   ============================================================ */
(() => {
  'use strict';

  /* ---------------------------------------------------------- 1. outils */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const html = document.documentElement;
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const conn = navigator.connection || {};
  const lite = !!conn.saveData || /2g/.test(conn.effectiveType || '') || (navigator.hardwareConcurrency || 4) < 4;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const idle = cb => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 200));

  /* Tout ce qui est propre à une page est enregistré ici puis annulé au changement de page. */
  let bin = [];
  const on = (t, e, f, o) => { t.addEventListener(e, f, o); bin.push(() => t.removeEventListener(e, f, o)); };
  const keep = fn => bin.push(fn);
  const clearPage = () => { bin.forEach(f => { try { f(); } catch (e) {} }); bin = []; };

  /* Toast */
  const toastEl = $('.toast');
  let toastT;
  const toast = msg => {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3200);
  };
  window.LM = window.LM || {}; LM.toast = toast;

  /* ------------------------------------------------ 2. horaires & infos */
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const dayRanges = d => (LM.hours[d] || []).map(([a, b]) => { const A = toMin(a); let B = toMin(b); if (B <= A) B += 1440; return [A, B]; });
  const openStatus = (now = new Date()) => {
    const d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    for (const [, B] of dayRanges((d + 6) % 7)) if (B > 1440 && m < B - 1440) return { open: true, until: B - 1440 };
    for (const [A, B] of dayRanges(d)) {
      if (m >= A && m < B) return { open: true, until: B % 1440 };
      if (m < A) return { open: false, next: { day: d, at: A } };
    }
    for (let i = 1; i <= 7; i++) { const nd = (d + i) % 7, r = dayRanges(nd); if (r.length) return { open: false, next: { day: nd, at: r[0][0] } }; }
    return { open: false };
  };
  const fmtMin = m => `${pad(Math.floor(m / 60) % 24)}h${pad(m % 60)}`;
  const statusText = () => {
    const s = openStatus();
    if (s.open) return { cls: 'is-open', text: `Ouvert · ferme à ${fmtMin(s.until)}` };
    if (!s.next) return { cls: 'is-closed', text: 'Fermé' };
    const today = new Date().getDay();
    const when = s.next.day === today ? "aujourd'hui" : s.next.day === (today + 1) % 7 ? 'demain' : LM.dayNames[s.next.day].toLowerCase();
    return { cls: 'is-closed', text: `Fermé · ouvre ${when} à ${fmtMin(s.next.at)}` };
  };
  const paintStatus = () => $$('[data-status]').forEach(el => {
    const s = statusText(); el.classList.remove('is-open', 'is-closed'); el.classList.add(s.cls);
    ($('[data-status-text]', el) || el).textContent = s.text;
  });

  /* Remplit horaires, coordonnées et liens dans un fragment donné. */
  const paintDynamic = (root = document) => {
    const today = new Date().getDay();
    $$('[data-hours]', root).forEach(el => {
      el.innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
        const r = LM.hours[d];
        const txt = r ? r.map(([a, b]) => `<span class="num">${a.replace(':', 'h')} – ${b.replace(':', 'h')}</span>`).join(' · ') : '<span>Fermé</span>';
        return `<div class="${d === today ? 'is-today' : ''} ${r ? '' : 'is-closed'}"><span>${LM.dayNames[d]}</span>${txt}</div>`;
      }).join('');
    });
    $$('[data-info]', root).forEach(el => { const v = LM.info[el.dataset.info]; if (v != null) el.textContent = v; });
    $$('[data-href]', root).forEach(el => {
      const k = el.dataset.href, v = LM.info[k];
      if (v) el.href = k === 'phoneIntl' ? `tel:${v}` : k === 'email' ? `mailto:${v}` : v;
    });
    $$('[data-year]', root).forEach(el => el.textContent = new Date().getFullYear());
    paintStatus();
  };

  /* -------------------------------------- 3. moteur de défilement unique */
  const jobs = new Set();
  let ticking = false;
  const runJobs = () => { ticking = false; const y = scrollY; jobs.forEach(f => f(y)); };
  const queueJobs = () => { if (!ticking) { ticking = true; requestAnimationFrame(runJobs); } };
  addEventListener('scroll', queueJobs, { passive: true });
  addEventListener('resize', queueJobs, { passive: true });
  /* Ajoute une tâche de défilement liée à la page en cours. */
  const onScrollJob = fn => { jobs.add(fn); keep(() => jobs.delete(fn)); fn(scrollY); };



  const jumpTop = () => scrollTo({ top: 0, behavior: 'instant' });

  /* --------------------------------------------- Navigation & interface */
  const nav = $('.nav');
  const burger = $('.burger');
  const menu = $('.menu');
  const bar = $('.nav__progress');
  let lastY = scrollY;
  jobs.add(y => {
    if (!nav) return;
    nav.classList.toggle('is-solid', y > 40);
    nav.classList.toggle('is-hidden', y > lastY && y > 320 && !(menu && menu.classList.contains('is-open')));
    lastY = y;
  });
  queueJobs();
  const closeMenu = () => { if (!menu) return; menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); body.classList.remove('is-locked'); nav.classList.remove('is-menu'); };
  const openMenu = () => { menu.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true'); body.classList.add('is-locked'); nav.classList.add('is-menu'); nav.classList.remove('is-solid', 'is-hidden'); };
  burger && burger.addEventListener('click', () => menu.classList.contains('is-open') ? closeMenu() : openMenu());
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  const markCurrent = () => {
    const here = location.pathname.split('/').pop() || 'index.html';
    $$('.nav__links a, .menu__links a').forEach(a => {
      const t = (a.getAttribute('href') || '').split('/').pop();
      t === here ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
    });
  };



  const cursorEl = $('.cursor'); if (cursorEl) cursorEl.remove();

  /* ------------------------------------- 4. navigation instantanée (SPA) */
  const routable = 'fetch' in window && !!history.pushState && !!window.DOMParser;
  const cache = new Map();
  const fetchPage = url => {
    if (cache.has(url)) return cache.get(url);
    const p = fetch(url, { credentials: 'same-origin' })
      .then(r => r.ok ? r.text() : Promise.reject(r.status))
      .catch(err => { cache.delete(url); throw err; });
    if (cache.size > 10) cache.delete(cache.keys().next().value);
    cache.set(url, p);
    return p;
  };
  const internal = a => {
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.noTransition != null) return null;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return null;
    if (!/\.html?$/.test(u.pathname) && !u.pathname.endsWith('/')) return null;
    return u;
  };
  /* Préchargement dès l'intention : survol, effleurement, tabulation. */
  const hint = e => { const u = internal(e.target.closest && e.target.closest('a[href]')); if (u && u.pathname !== location.pathname) fetchPage(u.pathname + u.search).catch(() => {}); };
  if (routable) {
    document.addEventListener('pointerover', hint, { passive: true });
    document.addEventListener('touchstart', hint, { passive: true });
    document.addEventListener('focusin', hint);
  }

  let swapping = false;
  const setMeta = (doc, sel, attr) => { const a = $(sel), b = $(sel, doc); if (a && b) a.setAttribute(attr, b.getAttribute(attr)); };
  const swap = async (u, push) => {
    const url = u.pathname + u.search;
    swapping = true;
    if (bar) { bar.style.width = '35%'; bar.classList.add('is-on'); }
    let text;
    try { text = await fetchPage(url); }
    catch (e) { location.href = url; return; }
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const fresh = doc.querySelector('#main');
    if (!fresh) { location.href = url; return; }
    clearPage();
    document.title = doc.title;
    setMeta(doc, 'meta[name=description]', 'content');
    setMeta(doc, 'link[rel=canonical]', 'href');
    setMeta(doc, 'meta[name=robots]', 'content');
    body.className = doc.body.className;
    body.dataset.page = doc.body.dataset.page || '';
    closeMenu();
    $('#main').replaceWith(fresh);
    if (push) history.pushState({ lm: 1 }, '', url + u.hash);
    if (u.hash && $(u.hash)) $(u.hash).scrollIntoView(); else jumpTop();
    body.classList.add('swap');
    initPage();
    requestAnimationFrame(() => { if (bar) { bar.style.width = '100%'; setTimeout(() => { bar.classList.remove('is-on'); bar.style.width = '0'; }, 220); } });
    setTimeout(() => body.classList.remove('swap'), 320);
    swapping = false;
    /* Annonce le changement pour les lecteurs d'écran, puis rend le focus au contenu. */
    const h = $('#main h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  };
  if (routable) {
    document.addEventListener('click', e => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const a = e.target.closest('a[href]');
      const u = internal(a);
      if (!u) return;
      if (u.pathname === location.pathname && u.hash) return;      /* ancre : comportement natif */
      e.preventDefault();
      if (u.pathname === location.pathname && !u.hash) { closeMenu(); jumpTop(); return; }
      swap(u, true);
    });
    addEventListener('popstate', () => { if (!swapping) swap(new URL(location.href), false); });
  }

  /* --------------------------------------------------- 5. modules de page */
  const initPage = () => {
    const page = body.dataset.page || '';
    const main = $('#main');
    markCurrent();
    paintDynamic();
    const statusTimer = setInterval(paintStatus, 60000);
    keep(() => clearInterval(statusTimer));

    /* Apparitions au défilement */
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { threshold: .1, rootMargin: '0px 0px -5% 0px' });
    $$('[data-reveal], .mask', main).forEach(el => io.observe(el));
    keep(() => io.disconnect());

    /* Titre éclaté en lettres */
    $$('[data-letters]', main).forEach(el => {
      if (el.dataset.done) return; el.dataset.done = '1';
      let i = 0, out = '';
      const wrap = (t, cls) => t.split(/(\s+)/).map(w => /^\s+$/.test(w) ? ' ' : `<span class="w">${[...w].map(ch => `<span class="l ${cls}" style="--i:${i++}">${esc(ch)}</span>`).join('')}</span>`).join('');
      el.childNodes.forEach(n => {
        if (n.nodeType === 3) out += wrap(n.textContent, '');
        else if (n.nodeType === 1) { const tag = n.tagName.toLowerCase(); out += `<${tag}>${wrap(n.textContent, n.tagName === 'EM' ? 'gold' : '')}</${tag}>`; }
      });
      el.innerHTML = out.trim();
    });





    /* Partage & copie */
    $$('[data-share]', document).forEach(b => on(b, 'click', async () => {
      const data = { title: `${LM.info.name} — ${LM.info.sub}`, text: 'Réservez une table face à la mer, à Sète.', url: location.href };
      if (navigator.share) { try { await navigator.share(data); } catch (e) {} }
      else { try { await navigator.clipboard.writeText(location.href); toast('Lien copié dans le presse-papiers'); } catch (e) { toast(location.href); } }
    }));
    $$('[data-copy]', main).forEach(b => on(b, 'click', async () => { try { await navigator.clipboard.writeText(b.dataset.copy); toast('Copié !'); } catch (e) {} }));

    /* Newsletter (pied de page, présent partout) */
    $$('[data-newsletter]', document).forEach(f => on(f, 'submit', async e => {
      e.preventDefault();
      if (!f.email.checkValidity()) return toast('Adresse e-mail invalide.');
      const email = f.email.value.trim();
      if (LM.info.formEndpoint) { try { await fetch(LM.info.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ subject: 'Newsletter', email }) }); } catch (err) {} }
      f.reset(); toast('Merci ! Vous recevrez nos nouvelles une fois par mois.');
    }));

    if (page === 'home') initHome(main);
    if (page === 'carte') initCarte(main);
    if (page === 'galerie') initGalerie(main);
    if (page === 'reservation') initResa(main);
    if (page === 'contact') initContact(main);

    /* Le héro s'anime dès que la page est visible (le préloader s'en charge au 1er chargement) */
    const hero = $('.hero', main);
    if (hero && html.classList.contains('is-loaded')) { hero.classList.add('is-live'); loadHeroVideo(); }
    $$('.page-head .mask', main).forEach(m => m.classList.add('is-in'));
  };

  /* ---------- Vidéo du héro : chargée tard, jamais sur réseau limité ---------- */
  const loadHeroVideo = () => {
    const v = $('.hero__media video[data-src]');
    if (!v) return;
    if (reduced || lite || innerWidth < 760) { v.remove(); return; }
    idle(() => {
      if (!v.isConnected) return;
      const mp4 = v.canPlayType('video/mp4; codecs="avc1.640028"');
      v.src = (mp4 || !v.dataset.webm) ? v.dataset.src : v.dataset.webm;
      v.removeAttribute('data-src');
      v.addEventListener('playing', () => v.classList.add('is-ready'), { once: true });
      v.load(); v.play().catch(() => {});
    });
  };



  /* ========================================================= ACCUEIL */
  function initHome(main) {
    /* Extrait de carte, en typographie — pas de fausses photos de plats. */
    const ex = $('[data-extract]', main);
    if (ex) {
      const col = (titre, plats) => `<div class="extract__col"><h3>${esc(titre)}</h3>${plats.map(it => `
        <div class="dish-line">
          <span class="dish-line__name">${esc(it.name)}<span class="dish-line__lead" aria-hidden="true"></span></span>
          <span class="dish-line__price">${it.price} €</span>
          <p>${esc(it.desc)}</p>
        </div>`).join('')}</div>`;
      const cat = id => LM.menu.find(m => m.id === id).items;
      ex.innerHTML =
        col('À partager', [cat('debuts')[0], cat('partager')[0], cat('partager')[1], cat('debuts')[2]]) +
        col('La mer & la braise', [cat('mer')[0], cat('mer')[2], cat('braise')[0], cat('braise')[1]]);
    }

    /* Bande « Réservez votre table » */
    const bd = $('[data-book] input[type=date]', main);
    if (bd) { const t = new Date(); bd.min = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`; }
    const bform = $('[data-book]', main);
    if (bform && routable) on(bform, 'submit', e => { e.preventDefault(); swap(new URL('reservation.html?' + new URLSearchParams(new FormData(bform)), location.href), true); });

    /* Cocktails (autres pages qui réutilisent le bloc) */
    const ck = $('[data-cocktails]', main);
    if (ck) ck.innerHTML = LM.menu.find(m => m.id === 'cocktails').items.slice(0, 5)
      .map((c, i) => `<div class="cocktail"><span class="n">${pad(i + 1)}</span><div><b>${esc(c.name)}</b><span>${esc(c.desc)}</span></div><span class="p">${c.price} €</span></div>`).join('');
  }

  /* =========================================================== CARTE */
  function initCarte(main) {
    const root = $('#carte-root', main), catNav = $('.carte-nav .container', main);
    if (!root) return;
    const filters = new Set(); let q = '';
    const price = it => it.prices ? `<b>${it.prices.verre} €</b><small>verre · ${it.prices.bouteille} € bout.</small>` : `<b>${it.price} €</b>${it.unit ? `<small>${esc(it.unit)}</small>` : ''}`;
    root.innerHTML = LM.menu.map(c => `<section class="mcat" id="${c.id}" aria-labelledby="h-${c.id}">
      <div class="mcat__head"><span class="kicker">${esc(c.kicker)}</span><h2 id="h-${c.id}">${esc(c.title)}</h2>${c.note ? `<p class="mcat__note">${esc(c.note)}</p>` : ''}</div>
      <div class="mitems">${c.items.map(it => `<article class="mitem" data-tags="${(it.tags || []).join(' ')}" data-text="${esc((it.name + ' ' + it.desc).toLowerCase())}">
        <h3 class="mitem__name">${esc(it.name)}${(it.tags || []).map(t => `<span class="tag ${t === 'sig' ? 'tag--sig' : ''}" title="${LM.tags[t].label}">${LM.tags[t].short}</span>`).join('')}</h3>
        <div class="mitem__price">${price(it)}</div><p class="mitem__desc">${esc(it.desc)}</p></article>`).join('')}
        <p class="empty">Rien ne correspond dans cette catégorie.</p></div></section>`).join('');
    catNav.innerHTML = LM.menu.map(c => `<a href="#${c.id}">${esc(c.title)}</a>`).join('');
    const f = $('[data-formula]', main);
    if (f) f.innerHTML = `<h3>${LM.menuFormula.title}</h3><p class="sub">${LM.menuFormula.sub}</p><ul>${LM.menuFormula.lines.map(l => `<li><span>${esc(l.label)}</span><b>${l.price} €</b></li>`).join('')}</ul>`;
    const apply = () => $$('.mcat', main).forEach(sec => {
      let vis = 0;
      $$('.mitem', sec).forEach(it => {
        const tags = it.dataset.tags.split(' ');
        const ok = [...filters].every(t => tags.includes(t)) && (!q || it.dataset.text.includes(q));
        it.classList.toggle('is-hidden', !ok); if (ok) vis++;
      });
      $('.empty', sec).style.display = vis ? 'none' : 'block';
    });
    $$('.chip[data-filter]', main).forEach(ch => on(ch, 'click', () => {
      const t = ch.dataset.filter, isOn = ch.getAttribute('aria-pressed') !== 'true';
      ch.setAttribute('aria-pressed', isOn); isOn ? filters.add(t) : filters.delete(t); apply();
    }));
    const si = $('.search input', main);
    if (si) { let t; on(si, 'input', () => { clearTimeout(t); t = setTimeout(() => { q = si.value.trim().toLowerCase(); apply(); }, 90); }); }
    const pb = $('[data-print]', main); if (pb) on(pb, 'click', () => print());
    const links = $$('a', catNav);
    const spy = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-30% 0px -60% 0px' });
    $$('.mcat', main).forEach(s => spy.observe(s));
    keep(() => spy.disconnect());
    links.forEach(a => on(a, 'click', e => { e.preventDefault(); const t = $(a.getAttribute('href'), main); if (t) { t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); history.replaceState(history.state, '', a.getAttribute('href')); } }));
    if (location.hash) { const t = $(location.hash, main); if (t) requestAnimationFrame(() => t.scrollIntoView()); }
  }

  /* ========================================================= GALERIE */
  function initGalerie(main) {
    const grid = $('.masonry', main), lb = $('.lightbox', main);
    if (!grid || !lb) return;
    const img = $('.lightbox__stage img', lb), cap = $('.lightbox__cap', lb), cnt = $('.lightbox__count', lb);
    const G = LM.gallery; let cur = 0, dir = 1;
    grid.innerHTML = G.map((g, i) => `<figure class="gitem ${g.w < 500 ? 'gitem--sq' : i % 5 === 2 ? 'gitem--tall' : ''}" data-i="${i}" data-cursor="Ouvrir" tabindex="0" role="button" aria-label="Agrandir : ${esc(g.cap)}"><img src="${g.small}" alt="${esc(g.alt)}" width="${g.w}" height="${g.h}" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async"><figcaption>${esc(g.cap)}</figcaption></figure>`).join('');
    const show = i => {
      cur = (i + G.length) % G.length; const g = G[cur];
      img.classList.remove('is-back'); void img.offsetWidth; if (dir < 0) img.classList.add('is-back');
      img.src = g.src; img.alt = g.alt; cap.textContent = g.cap; cnt.textContent = `${pad(cur + 1)} / ${pad(G.length)}`;
      idle(() => { new Image().src = G[(cur + 1) % G.length].src; });
    };
    const open = i => { dir = 1; show(i); lb.classList.add('is-open'); body.classList.add('is-locked'); $('.lightbox__close', lb).focus(); };
    const close = () => { lb.classList.remove('is-open'); body.classList.remove('is-locked'); };
    on(grid, 'click', e => { const f = e.target.closest('.gitem'); if (f) open(+f.dataset.i); });
    on(grid, 'keydown', e => { const f = e.target.closest('.gitem'); if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(+f.dataset.i); } });
    on($('.lightbox__close', lb), 'click', close);
    on($('.lightbox__nav--prev', lb), 'click', () => { dir = -1; show(cur - 1); });
    on($('.lightbox__nav--next', lb), 'click', () => { dir = 1; show(cur + 1); });
    on(lb, 'click', e => { if (e.target === lb || e.target.classList.contains('lightbox__stage')) close(); });
    on(window, 'keydown', e => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') { dir = 1; show(cur + 1); }
      if (e.key === 'ArrowLeft') { dir = -1; show(cur - 1); }
    });
    let tx0 = null;
    on(lb, 'touchstart', e => tx0 = e.touches[0].clientX, { passive: true });
    on(lb, 'touchend', e => { if (tx0 == null) return; const d = e.changedTouches[0].clientX - tx0; if (Math.abs(d) > 50) { dir = d < 0 ? 1 : -1; show(cur + dir); } tx0 = null; });
    keep(close);
  }

  /* ------------------------------------------------ envoi des formulaires */
  const validate = form => {
    let ok = true;
    $$('.field', form).forEach(f => {
      const i = $('input,select,textarea', f);
      if (!i || (!i.required && !i.value)) { f.classList.remove('is-invalid'); return; }
      const bad = !i.checkValidity();
      f.classList.toggle('is-invalid', bad); if (bad) ok = false;
    });
    return ok;
  };
  const send = async (subject, lines, form) => {
    const hp = $('.hp input', form); if (hp && hp.value) return true;
    const text = lines.map(([k, v]) => `${k} : ${v}`).join('\n');
    if (LM.info.formEndpoint) {
      try {
        const r = await fetch(LM.info.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ subject, message: text, ...Object.fromEntries(lines) }) });
        if (r.ok) return true;
      } catch (e) {}
      toast('Envoi impossible — ouverture de votre messagerie.');
    }
    location.href = `mailto:${LM.info.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    return true;
  };

  /* ===================================================== RÉSERVATION */
  function initResa(main) {
    const form = $('#resa-form', main);
    if (!form) return;
    const S = { date: null, service: null, time: null, guests: 2, name: '' };
    const steps = $$('.step', main), stepsUI = $$('.steps li', main);
    let cur = 0;
    const goto = i => { cur = i; steps.forEach((s, k) => s.classList.toggle('is-active', k === i)); stepsUI.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.classList.toggle('is-done', k < i); }); $('.resa', main).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); };
    const fmtDate = d => d ? `${LM.dayNames[d.getDay()]} ${d.getDate()} ${LM.monthNames[d.getMonth()]}` : '';
    const summary = () => {
      $('[data-s=date]', main).textContent = fmtDate(S.date);
      $('[data-s=time]', main).textContent = S.time ? `${S.time.replace(':', 'h')} · ${LM.services[S.service].label}` : '';
      $('[data-s=guests]', main).textContent = `${S.guests} ${S.guests > 1 ? 'personnes' : 'personne'}`;
      $('[data-s=name]', main).textContent = S.name;
    };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let view = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 90);
    const slotsEl = $('.slots', main);
    const drawSlots = () => {
      if (!S.service) { slotsEl.innerHTML = ''; return; }
      const isToday = S.date && S.date.getTime() === today.getTime(), nowM = new Date().getHours() * 60 + new Date().getMinutes();
      const ranges = S.date ? dayRanges(S.date.getDay()) : [];
      slotsEl.innerHTML = LM.services[S.service].slots.map(t => {
        const tm = toMin(t), inHours = !S.date || ranges.some(([A, B]) => tm >= A && tm + 30 <= B), past = isToday && tm < nowM + 45;
        return `<button type="button" class="slot" aria-pressed="${S.time === t}" ${(!inHours || past) ? 'disabled' : ''}>${t.replace(':', 'h')}</button>`;
      }).join('');
      if (!$('.slot:not([disabled])', slotsEl)) slotsEl.insertAdjacentHTML('beforeend', `<p class="notice" style="grid-column:1/-1">Pas de service « ${LM.services[S.service].label.toLowerCase()} » ${S.date ? 'ce jour-là' : ''} — essayez l’autre service ou une autre date.</p>`);
    };
    const drawCal = () => {
      const y = view.getFullYear(), m = view.getMonth();
      $('.cal__head b', main).textContent = `${LM.monthNames[m]} ${y}`;
      $('.cal__prev', main).disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
      $('.cal__next', main).disabled = view >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      const off = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
      let h = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => `<span class="cal__dn">${d}</span>`).join('') + '<span></span>'.repeat(off);
      for (let d = 1; d <= days; d++) {
        const dt = new Date(y, m, d), closed = !LM.hours[dt.getDay()], dis = dt < today || dt > maxDate || closed;
        const sel = S.date && dt.getTime() === S.date.getTime();
        h += `<button type="button" class="cal__d ${closed ? 'is-closed' : ''} ${dt.getTime() === today.getTime() ? 'is-today' : ''}" ${dis ? 'disabled' : ''} aria-pressed="${sel}" data-d="${d}" aria-label="${fmtDate(dt)}${closed ? ' (fermé)' : ''}">${d}</button>`;
      }
      $('.cal__grid', main).innerHTML = h;
    };
    /* Pré-remplissage depuis la bande « Réservez votre table » */
    const q = new URLSearchParams(location.search);
    const qd = q.get('date');
    if (qd && /^\d{4}-\d{2}-\d{2}$/.test(qd)) {
      const [y, m, d] = qd.split('-').map(Number), dt = new Date(y, m - 1, d);
      if (dt >= today && dt <= maxDate && LM.hours[dt.getDay()]) { S.date = dt; view = new Date(y, m - 1, 1); }
    }
    if (LM.services[q.get('service')]) S.service = q.get('service');
    const qg = parseInt(q.get('guests'), 10); if (qg >= 1 && qg <= 12) S.guests = qg;
    drawCal();
    if (S.service) { $$('.seg[data-service] button', main).forEach(x => x.setAttribute('aria-pressed', x.dataset.v === S.service)); drawSlots(); }
    on($('.cal__prev', main), 'click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); drawCal(); });
    on($('.cal__next', main), 'click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); drawCal(); });
    on($('.cal__grid', main), 'click', e => { const b = e.target.closest('.cal__d'); if (!b || b.disabled) return; S.date = new Date(view.getFullYear(), view.getMonth(), +b.dataset.d); S.time = null; drawCal(); drawSlots(); summary(); });
    $$('.seg[data-service] button', main).forEach(b => on(b, 'click', () => { $$('.seg[data-service] button', main).forEach(x => x.setAttribute('aria-pressed', x === b)); S.service = b.dataset.v; S.time = null; drawSlots(); summary(); }));
    on(slotsEl, 'click', e => { const b = e.target.closest('.slot'); if (!b || b.disabled) return; $$('.slot', slotsEl).forEach(x => x.setAttribute('aria-pressed', x === b)); S.time = b.textContent.replace('h', ':'); summary(); });
    const out = $('.stepper output', main);
    const paintGuests = () => { out.innerHTML = `${S.guests}<small>${S.guests > 1 ? 'personnes' : 'personne'}</small>`; summary(); };
    $$('.stepper button', main).forEach(b => on(b, 'click', () => { S.guests = clamp(S.guests + (+b.dataset.d), 1, 12); paintGuests(); }));
    paintGuests();
    $$('[data-next]', main).forEach(b => on(b, 'click', () => {
      if (cur === 0) { if (!S.date) return toast('Choisissez une date.'); if (!S.service || !S.time) return toast('Choisissez un service et un horaire.'); }
      goto(cur + 1);
    }));
    $$('[data-prev]', main).forEach(b => on(b, 'click', () => goto(cur - 1)));
    on($('input[name=name]', main), 'input', e => { S.name = e.target.value; summary(); });
    on(form, 'submit', async e => {
      e.preventDefault();
      if (!validate(form)) return toast('Merci de vérifier les champs en rouge.');
      const fd = new FormData(form);
      S.name = fd.get('name');
      const code = 'LM-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      const lines = [['Référence', code], ['Nom', S.name], ['Téléphone', fd.get('phone')], ['E-mail', fd.get('email')], ['Date', fmtDate(S.date)], ['Heure', S.time], ['Service', LM.services[S.service].label], ['Convives', S.guests], ['Remarques', fd.get('note') || '—']];
      const btn = $('button[type=submit]', form); btn.disabled = true; btn.textContent = 'Envoi…';
      await send(`Demande de réservation ${code} — ${S.name}`, lines, form);
      const t = $('.ticket', main);
      $('[data-t=date]', t).textContent = fmtDate(S.date);
      $('[data-t=time]', t).textContent = S.time.replace(':', 'h');
      $('[data-t=guests]', t).textContent = `${S.guests} pers.`;
      $('[data-t=name]', t).textContent = S.name;
      $('[data-t=code]', t).textContent = code;
      const [hh, mm] = S.time.split(':').map(Number);
      const start = new Date(S.date); start.setHours(hh, mm);
      const end = new Date(start.getTime() + 2 * 3600e3);
      const ics = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const cal = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//La Mesa//Reservation//FR', 'BEGIN:VEVENT', `UID:${code}@lespierresblanches.com`, `DTSTAMP:${ics(new Date())}`, `DTSTART:${ics(start)}`, `DTEND:${ics(end)}`, `SUMMARY:Table à La Mesa — ${S.guests} pers.`, `LOCATION:${LM.info.address}, ${LM.info.zip} ${LM.info.city}`, `DESCRIPTION:Réservation ${code} (en attente de confirmation par le restaurant)`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      const url = URL.createObjectURL(new Blob([cal], { type: 'text/calendar' }));
      $('[data-ics]', main).href = url; keep(() => URL.revokeObjectURL(url));
      goto(3); toast('Demande envoyée — nous vous confirmons très vite.');
    });
    summary();
  }

  /* ========================================================= CONTACT */
  function initContact(main) {
    const form = $('#contact-form', main);
    if (!form) return;
    const q = new URLSearchParams(location.search).get('objet');
    if (q) { const sel = $('#c-subject', form); if (sel) [...sel.options].forEach(o => { if (o.value.toLowerCase() === q.toLowerCase()) sel.value = o.value; }); }
    on(form, 'submit', async e => {
      e.preventDefault();
      if (!validate(form)) return toast('Merci de vérifier les champs en rouge.');
      const fd = new FormData(form);
      await send(`Contact site — ${fd.get('subject')}`, [['Nom', fd.get('name')], ['E-mail', fd.get('email')], ['Téléphone', fd.get('phone') || '—'], ['Objet', fd.get('subject')], ['Message', fd.get('message')]], form);
      form.reset(); toast('Message envoyé. Merci !');
    });
  }

  /* ------------------------------------------------------ 6. préloader */
  const loader = $('.loader');
  const finishIntro = () => {
    html.classList.add('is-loaded');
    const hero = $('.hero');
    if (hero) hero.classList.add('is-live');
    $$('.page-head .mask').forEach(m => m.classList.add('is-in'));
    loadHeroVideo();
    body.classList.remove('is-locked');
    idle(() => { ['carte.html', 'reservation.html'].forEach(u => fetchPage(u).catch(() => {})); });
  };

  initPage();

  if (loader && !html.classList.contains('no-loader')) {
    body.classList.add('is-locked');
    const counter = $('.loader__count'), barEl = $('.loader__bar i');
    const t0 = performance.now(), MIN = reduced ? 220 : 1150;
    let ready = false, done = false;
    const heroImg = $('.hero__media img, .page-head--media img');
    const waitImg = heroImg && !heroImg.complete ? new Promise(r => { heroImg.onload = heroImg.onerror = r; }) : Promise.resolve();
    Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), waitImg]).then(() => ready = true);
    setTimeout(() => ready = true, 4000);            /* filet de sécurité : jamais bloqué */
    const tick = now => {
      const p = Math.min(1, (now - t0) / MIN);
      const eased = 1 - Math.pow(1 - p, 3);
      const target = ready ? eased * 100 : Math.min(eased * 100, 92);
      if (counter) counter.textContent = pad(Math.round(target));
      if (barEl) barEl.style.width = target + '%';
      if (p >= 1 && ready && !done) {
        done = true;
        try { sessionStorage.setItem('lm-seen', '1'); } catch (e) {}
        loader.classList.add('is-done');
        setTimeout(finishIntro, 260);
        setTimeout(() => loader.remove(), 1200);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } else {
    if (loader) loader.remove();
    finishIntro();
  }

  /* Service worker : cache des ressources */
  if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
