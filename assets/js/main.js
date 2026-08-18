/* ============================================================
   NONNA LUNA — interactions
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const euro = (n) => n.toFixed(2).replace('.', ',') + ' €';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { SIZES, PIZZAS, MENU, REVIEWS } = window.DATA;
  const art = (recipe, extra) => window.PizzaArt.render(Object.assign({}, recipe, extra || {}));

  /* ══════════════ PRÉLOADER ══════════════ */
  const loader = $('#loader');
  $('#loaderPizza').innerHTML = art({ seed: 5, base: 'rossa', cheeseN: 10, toppings: [{ k: 'basilic', n: 4, s: 1 }, { k: 'pepperoni', n: 4, s: .9 }] }, { shadow: false });
  const hideLoader = () => { loader.classList.add('is-done'); document.body.style.overflow = ''; };
  document.body.style.overflow = 'hidden';
  window.addEventListener('load', () => setTimeout(hideLoader, REDUCED ? 0 : 900));
  setTimeout(hideLoader, 4000); // filet de sécurité

  /* ══════════════ CURSEUR ══════════════ */
  const cursor = $('#cursor');
  if (cursor && matchMedia('(hover:hover) and (pointer:fine)').matches && !REDUCED) {
    const dot = $('.cursor__dot', cursor), ring = $('.cursor__ring', cursor);
    let tx = 0, ty = 0, rx = 0, ry = 0;
    addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
    }, { passive: true });
    (function follow() {
      rx += (tx - rx) * .16; ry += (ty - ry) * .16;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(follow);
    })();
    const hot = 'a,button,input,select,textarea,.card,.wheel__disc,.wheel__labels li';
    addEventListener('pointerover', (e) => {
      cursor.classList.toggle('is-hot', !!(e.target.closest && e.target.closest(hot)));
    });
  }

  /* ══════════════ HEADER · NAV · SCROLL ══════════════ */
  const header = $('#header'), bar = $('#scrollBar'), nav = $('#nav'), burger = $('#burger');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    header.classList.toggle('is-stuck', y > 40);
    header.classList.toggle('is-hidden', y > 420 && y > lastY && !nav.classList.contains('is-open'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('#nav a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
  }));

  const sections = ['roue', 'rituel', 'carte', 'livraison', 'maison'];
  const navIO = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      $$('#nav a').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((id) => { const el = document.getElementById(id); if (el) navIO.observe(el); });

  /* ══════════════ APPARITIONS ══════════════ */
  const revealIO = new IntersectionObserver((es, o) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const d = +(e.target.dataset.revealDelay || 0);
      setTimeout(() => e.target.classList.add('is-in'), d);
      o.unobserve(e.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach((el) => revealIO.observe(el));

  /* ══════════════ HÉROS ══════════════ */
  $('#heroPizza').innerHTML = art(PIZZAS[0].recipe);
  $('#heroPizza2').innerHTML = art(PIZZAS[2].recipe);
  $('#promoPizza').innerHTML = art(PIZZAS[3].recipe);

  const stage = $('#heroStage');
  if (stage && !REDUCED) {
    const layers = $$('[data-depth]', stage);
    let raf = 0, mx = 0, my = 0;
    stage.closest('.hero').addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      mx = (e.clientX - (r.left + r.width / 2)) / r.width;
      my = (e.clientY - (r.top + r.height / 2)) / r.height;
      if (!raf) raf = requestAnimationFrame(move);
    }, { passive: true });
    function move() {
      raf = 0;
      layers.forEach((l) => {
        const d = +l.dataset.depth;
        l.style.setProperty('translate', `${(-mx * d).toFixed(1)}px ${(-my * d).toFixed(1)}px`);
      });
      stage.style.setProperty('rotate', 'y ' + (mx * 6).toFixed(2) + 'deg');
    }
  }

  /* ══════════════ PANIER ══════════════ */
  const CART_KEY = 'nonnaluna.cart';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }

  const drawer = $('#drawer'), itemsEl = $('#drawerItems'), emptyEl = $('#drawerEmpty');
  const countEl = $('#cartCount');

  function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }

  function addToCart(item) {
    const found = cart.find((c) => c.key === item.key);
    if (found) found.qty += item.qty; else cart.push(item);
    saveCart(); renderCart();
    header.classList.remove('is-hidden');   // on montre le panier qui se remplit
    countEl.classList.remove('is-pop'); void countEl.offsetWidth; countEl.classList.add('is-pop');
    toast(`<b>${item.qty}×</b> ${item.name} au panier`);
  }
  function setQty(key, delta) {
    const it = cart.find((c) => c.key === key); if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) cart = cart.filter((c) => c.key !== key);
    saveCart(); renderCart();
  }
  function renderCart() {
    const n = cart.reduce((s, c) => s + c.qty, 0);
    countEl.textContent = n;
    emptyEl.hidden = n > 0;
    itemsEl.innerHTML = cart.map((c) => `
      <li class="ci">
        <span class="ci__art">${c.recipe ? window.PizzaArt.render(c.recipe, { shadow: false }) : (c.glyph || '🍽️')}</span>
        <span class="ci__b">
          <b>${c.name}</b><span>${c.sizeLabel || ''}</span>
          <span class="ci__q"><button data-minus="${c.key}" aria-label="Retirer">−</button><i>${c.qty}</i><button data-plus="${c.key}" aria-label="Ajouter">+</button></span>
        </span>
        <span class="ci__p">${euro(c.price * c.qty)}</span>
      </li>`).join('');
    const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const ship = n === 0 ? 0 : (sub >= 25 ? 0 : 3.5);
    $('#sumSub').textContent = euro(sub);
    $('#sumShip').textContent = n === 0 ? '—' : (ship === 0 ? 'offerte' : euro(ship));
    $('#sumTotal').textContent = euro(sub + ship);
  }
  itemsEl.addEventListener('click', (e) => {
    const p = e.target.closest('[data-plus]'), m = e.target.closest('[data-minus]');
    if (p) setQty(p.dataset.plus, 1);
    if (m) setQty(m.dataset.minus, -1);
  });
  const openDrawer = (on) => {
    drawer.classList.toggle('is-open', on);
    drawer.setAttribute('aria-hidden', String(!on));
    document.body.style.overflow = on ? 'hidden' : '';
    if (on) $('#drawerClose').focus();
  };
  $('#cartBtn').addEventListener('click', () => openDrawer(true));
  $('#drawerClose').addEventListener('click', () => openDrawer(false));
  $('#drawerScrim').addEventListener('click', () => openDrawer(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') openDrawer(false); });
  $('#checkout').addEventListener('click', () => {
    if (!cart.length) { toast('Le panier est vide — la roue vous attend'); return; }
    toast('Commande envoyée au four 🔥 <b>démonstration</b>');
    cart = []; saveCart(); renderCart(); setTimeout(() => openDrawer(false), 700);
  });
  renderCart();

  /* ══════════════ TOASTS ══════════════ */
  const toastsEl = $('#toasts');
  function toast(html) {
    const t = document.createElement('div');
    t.className = 'toast'; t.innerHTML = html;
    toastsEl.appendChild(t);
    setTimeout(() => { t.classList.add('is-out'); setTimeout(() => t.remove(), 400); }, 2600);
  }

  /* ══════════════ LA ROUE DES SAVEURS ══════════════ */
  let STEP = 25, OFFSET = -88;                // degrés entre deux pizzas / position du cran actif (recalculés selon la largeur)
  const wheelEl = $('#wheel'), labelsEl = $('#wheelLabels'), discEl = $('#wheelDisc'), pizzaEl = $('#wheelPizza');
  let idx = 0, size = 'M', qty = 1;

  labelsEl.innerHTML = PIZZAS.map((p, i) =>
    `<li style="--a:${OFFSET + i * STEP}deg" data-i="${i}"><button class="wl" type="button">${p.short || p.name}</button><i class="dot"></i></li>`
  ).join('');
  const labelEls = $$('#wheelLabels li');
  wheelEl.style.setProperty('--sel', OFFSET + 'deg');

  function layoutWheel() {
    const W = wheelEl.clientWidth;
    const narrow = W < 760;
    STEP = narrow ? 30 : 25;
    OFFSET = narrow ? -104 : -88;
    labelEls.forEach((l, i) => l.style.setProperty('--a', (OFFSET + i * STEP) + 'deg'));
    wheelEl.style.setProperty('--sel', OFFSET + 'deg');
    setRot(-idx * STEP);
    const D = clamp(W * (narrow ? .54 : .46), 180, 520);      // diamètre de la pizza
    const gapOut = narrow ? 46 : 96;                          // air entre la croûte et les noms
    const R = D / 2 + gapOut;                                 // rayon de l'anneau de noms
    const cy = R + (narrow ? 26 : 34);
    const H = Math.round(cy + D / 2 + (narrow ? 86 : 24));   // place pour les flèches sous la roue
    wheelEl.style.height = H + 'px';
    wheelEl.style.setProperty('--disc-d', Math.round(D) + 'px');
    wheelEl.style.setProperty('--ring-d', Math.round(R * 2) + 'px');
    wheelEl.style.setProperty('--cy', ((cy / H) * 100).toFixed(2) + '%');
  }
  layoutWheel();
  addEventListener('resize', layoutWheel);

  function setRot(deg) { wheelEl.style.setProperty('--rot', deg.toFixed(2) + 'deg'); }

  function swapPizza(recipe) {
    const old = $('.pizza-svg', pizzaEl);
    const wrap = document.createElement('div');
    wrap.innerHTML = window.PizzaArt.render(recipe);
    const next = wrap.firstElementChild;
    next.classList.add('is-out');
    pizzaEl.appendChild(next);
    requestAnimationFrame(() => requestAnimationFrame(() => next.classList.remove('is-out')));
    if (old) { old.classList.add('is-out'); setTimeout(() => old.remove(), 600); }
  }

  function priceOf(p, sz) { return Math.round(p.price * SIZES[sz].mult * 20) / 20; }

  function paint(changed) {
    const p = PIZZAS[idx], s = SIZES[size];
    labelEls.forEach((l, i) => l.classList.toggle('is-active', i === idx));
    setRot(-idx * STEP);
    $('#pzTag').textContent = p.tag;
    $('#pzName').textContent = p.name;
    $('#pzDesc').textContent = p.desc;
    $('#pzChips').innerHTML = (p.chips || []).map((c) => `<li>${c}</li>`).join('');
    $('#pzPrice').textContent = priceOf(p, size).toFixed(2).replace('.', ',');
    $('#pzMeta').textContent = `Taille ${s.label} · ${s.cm} cm · ${qty > 1 ? qty + ' pizzas' : '1 pizza'}`;
    $('#qtyVal').textContent = qty;
    pizzaEl.style.transform = `scale(${s.scale})`;
    if (changed !== 'size') swapPizza(p.recipe); 
    $('#wheelPrev').disabled = idx === 0;
    $('#wheelNext').disabled = idx === PIZZAS.length - 1;
  }
  function go(i, why) {
    const next = clamp(i, 0, PIZZAS.length - 1);
    if (next === idx && why !== 'force') return;
    idx = next; qty = 1; paint();
  }

  $('#wheelPrev').addEventListener('click', () => go(idx - 1));
  $('#wheelNext').addEventListener('click', () => go(idx + 1));
  labelEls.forEach((l) => l.addEventListener('click', () => go(+l.dataset.i)));
  wheelEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { go(idx - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { go(idx + 1); e.preventDefault(); }
  });

  /* — glisser pour faire tourner — */
  (function dragWheel() {
    let dragging = false, startA = 0, startRot = 0, live = 0, moved = 0;
    const angleAt = (e) => {
      const r = discEl.getBoundingClientRect();
      return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
    };
    discEl.addEventListener('pointerdown', (e) => {
      dragging = true; moved = 0; startA = angleAt(e); startRot = -idx * STEP; live = startRot;
      discEl.setPointerCapture(e.pointerId);
      discEl.classList.add('is-dragging'); labelsEl.classList.add('is-dragging');
    });
    discEl.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      let d = angleAt(e) - startA;
      if (d > 180) d -= 360; if (d < -180) d += 360;
      moved = Math.abs(d);
      live = clamp(startRot + d, -(PIZZAS.length - 1) * STEP - 12, 12);
      setRot(live);
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      discEl.classList.remove('is-dragging'); labelsEl.classList.remove('is-dragging');
      const target = Math.round(-live / STEP);
      if (moved < 3) { paint('size'); return; }        // simple clic : on ne change rien
      go(target, target === idx ? 'force' : undefined);
      if (target === idx) paint('size');
    };
    discEl.addEventListener('pointerup', end);
    discEl.addEventListener('pointercancel', end);
  })();

  /* — tailles — */
  $$('#sizes .size').forEach((b) => b.addEventListener('click', () => {
    size = b.dataset.size;
    $$('#sizes .size').forEach((o) => { o.classList.toggle('is-active', o === b); o.setAttribute('aria-checked', String(o === b)); });
    paint('size');
  }));
  $('#qtyPlus').addEventListener('click', () => { qty = clamp(qty + 1, 1, 20); paint('size'); });
  $('#qtyMinus').addEventListener('click', () => { qty = clamp(qty - 1, 1, 20); paint('size'); });
  $('#addToCart').addEventListener('click', () => {
    const p = PIZZAS[idx];
    addToCart({
      key: p.id + '-' + size, name: p.name, sizeLabel: `Taille ${size} · ${SIZES[size].cm} cm`,
      price: priceOf(p, size), qty, recipe: p.recipe
    });
    qty = 1; paint('size');
  });
  paint('force');

  /* ══════════════ LE RITUEL ══════════════ */
  (function ritual() {
    const seed = 404;
    const disc = $('#ritualDisc');
    const layers = {
      dough: { base: 'bianca', seed, cheese: false, toppings: [] },
      sauce: { base: 'rossa', seed, cheese: false, toppings: [] },
      cheese: { base: 'rossa', seed, cheeseN: 15, toppings: [] },
      basil: { base: 'rossa', seed, cheeseN: 15, toppings: [{ k: 'basilic', n: 6, s: 1.05, gap: 46 }] }
    };
    Object.keys(layers).forEach((k) => { $('.layer--' + k, disc).innerHTML = window.PizzaArt.render(layers[k]); });

    const steps = $$('#ritualSteps .ritual__step');
    const gauge = $('#ritualGauge'), tempEl = $('#ritualTemp');
    const order = ['dough', 'sauce', 'cheese', 'basil'];
    let current = -1, animT = 0;

    function activate(n) {
      if (n === current) return;
      current = n;
      steps.forEach((s, i) => s.classList.toggle('is-on', i === n));
      order.forEach((k, i) => $('.layer--' + k, disc).classList.toggle('is-on', i <= n));
      $('.layer--fire', disc).classList.toggle('is-on', n >= 3);
      const goal = +steps[n].dataset.temp;
      gauge.style.strokeDashoffset = String(339 - 339 * ((n + 1) / steps.length));
      clearInterval(animT);
      const from = parseInt(tempEl.textContent, 10) || 20;
      let t = 0;
      animT = setInterval(() => {
        t += .06;
        const v = Math.round(from + (goal - from) * Math.min(1, t));
        tempEl.textContent = v + '°';
        if (t >= 1) clearInterval(animT);
      }, 24);
    }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) activate(steps.indexOf(e.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));
    activate(0);
  })();

  /* ══════════════ LA CARTE ══════════════ */
  (function carte() {
    const rail = $('#rail'), tabs = $$('#tabs .tab'), pill = $('#tabsPill');
    function movePill(btn) {
      pill.style.width = btn.offsetWidth + 'px';
      pill.style.transform = `translateX(${btn.offsetLeft - 6}px)`;
    }
    function cardHTML(it) {
      const artHTML = it.recipe
        ? `<div class="card__art">${window.PizzaArt.render(it.recipe)}</div>`
        : `<div class="card__art"><div class="card__dish">${it.glyph || '🍽️'}</div></div>`;
      return `<li class="card">
        ${artHTML}
        ${it.tag ? `<span class="card__tag">${it.tag}</span>` : ''}
        <h3>${it.name}</h3><p>${it.desc}</p>
        <div class="card__foot">
          <span class="card__price">${it.price.toFixed(2).replace('.', ',')}<small> €</small></span>
          <button class="card__add" data-add="${it.id}" aria-label="Ajouter ${it.name} au panier">+</button>
        </div></li>`;
    }
    let currentCat = 'rosse';
    function fill(cat) {
      currentCat = cat;
      rail.style.opacity = '0';
      setTimeout(() => {
        rail.innerHTML = MENU[cat].map(cardHTML).join('');
        rail.scrollTo({ left: 0 });
        rail.style.opacity = '1';
      }, 180);
    }
    rail.style.transition = 'opacity .25s';
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((o) => { o.classList.toggle('is-active', o === t); o.setAttribute('aria-selected', String(o === t)); });
      movePill(t); fill(t.dataset.cat);
    }));
    rail.addEventListener('click', (e) => {
      const b = e.target.closest('[data-add]'); if (!b) return;
      const it = MENU[currentCat].find((x) => x.id === b.dataset.add);
      addToCart({ key: it.id, name: it.name, sizeLabel: it.tag || '', price: it.price, qty: 1, recipe: it.recipe, glyph: it.glyph });
    });
    const step = () => Math.min(rail.clientWidth * .8, 340);
    $('#railNext').addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
    $('#railPrev').addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));

    /* glisser pour parcourir */
    let down = false, sx = 0, sl = 0, dragged = 0;
    rail.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      down = true; sx = e.clientX; sl = rail.scrollLeft; dragged = 0; rail.classList.add('is-dragging');
    });
    rail.addEventListener('pointermove', (e) => {
      if (!down) return;
      dragged = e.clientX - sx; rail.scrollLeft = sl - dragged;
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) =>
      rail.addEventListener(ev, () => { down = false; rail.classList.remove('is-dragging'); }));

    fill('rosse');
    const t0 = tabs[0];
    requestAnimationFrame(() => movePill(t0));
    addEventListener('resize', () => movePill($('#tabs .tab.is-active') || t0));
  })();

  /* ══════════════ COMPTE À REBOURS ══════════════ */
  (function countdown() {
    function nextTuesday() {
      const now = new Date();
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
      let add = (2 - d.getDay() + 7) % 7;                 // 2 = mardi
      if (add === 0 && now.getTime() > d.getTime()) add = 7;
      d.setDate(d.getDate() + add);
      return d;
    }
    let target = nextTuesday();
    const pad = (n) => String(Math.max(0, n)).padStart(2, '0');
    function tick() {
      let ms = target - Date.now();
      if (ms <= 0) { target = nextTuesday(); ms = target - Date.now(); }
      const s = Math.floor(ms / 1000);
      $('#cdD').textContent = pad(Math.floor(s / 86400));
      $('#cdH').textContent = pad(Math.floor(s / 3600) % 24);
      $('#cdM').textContent = pad(Math.floor(s / 60) % 60);
      $('#cdS').textContent = pad(s % 60);
    }
    tick(); setInterval(tick, 1000);
  })();

  /* ══════════════ LIVRAISON ══════════════ */
  (function delivery() {
    const route = $('#mapRoute'), rider = $('#mapRider');
    if (route && rider && !REDUCED) {
      const len = route.getTotalLength();
      let t = 0, run = false, raf;
      const loop = () => {
        t = (t + .0022) % 1;
        const p = route.getPointAtLength(t * len);
        rider.setAttribute('cx', p.x); rider.setAttribute('cy', p.y);
        raf = requestAnimationFrame(loop);
      };
      new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (e.isIntersecting && !run) { run = true; loop(); }
          else if (!e.isIntersecting && run) { run = false; cancelAnimationFrame(raf); }
        });
      }, { threshold: .1 }).observe($('#map'));
    }

    const steps = $$('#tracker li');
    if (!REDUCED) {
      let n = 2, timer;
      const paintSteps = () => steps.forEach((s, i) => {
        s.classList.toggle('is-done', i < n);
        s.classList.toggle('is-active', i === n);
      });
      new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (e.isIntersecting && !timer) {
            timer = setInterval(() => { n = n >= steps.length - 1 ? 0 : n + 1; paintSteps(); }, 2400);
          } else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
        });
      }, { threshold: .4 }).observe($('#tracker'));
    }

    $('#locator').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = $('#addr').value.trim();
      toast(v ? `Livraison possible à <b>${v.slice(0, 28)}</b> — 24 min` : 'Indiquez votre adresse pour vérifier la zone');
      if (v) document.getElementById('roue').scrollIntoView({ behavior: 'smooth' });
    });
  })();

  /* ══════════════ AVIS ══════════════ */
  (function says() {
    const row = REVIEWS.map((r) => `<div class="say"><i>★</i><span>« ${r.t} »</span><b>${r.a}</b></div>`).join('');
    $('#marquee').innerHTML = row + row;
  })();

  /* ══════════════ FORMULAIRES ══════════════ */
  (function forms() {
    const form = $('#booking');
    const bad = (field, msg) => { field.closest('.field').classList.add('is-bad'); $('small', field.closest('.field')).textContent = msg; };
    const ok = (field) => { field.closest('.field').classList.remove('is-bad'); $('small', field.closest('.field')).textContent = ''; };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const name = $('#bName'), mail = $('#bMail'), date = $('#bDate');
      if (name.value.trim().length < 2) { bad(name, 'On vous appelle comment ?'); valid = false; } else ok(name);
      if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(mail.value)) { bad(mail, 'Un e-mail valide, s’il vous plaît'); valid = false; } else ok(mail);
      if (!date.value) { bad(date, 'Choisissez une date'); valid = false; } else ok(date);
      if (!valid) return;
      $('#bookingOk').hidden = false;
      toast('Demande de table envoyée 🍕');
      form.reset();
    });
    const dateInput = $('#bDate');
    const today = new Date(); today.setDate(today.getDate() + 1);
    dateInput.min = new Date().toISOString().slice(0, 10);
    dateInput.value = today.toISOString().slice(0, 10);

    $('#news').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('input', e.currentTarget);
      if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(input.value)) { toast('E-mail invalide'); return; }
      $('#newsOk').hidden = false; input.value = '';
    });
  })();

  $('#year').textContent = new Date().getFullYear();
})();
