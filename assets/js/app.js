/* ============================================================
   La Mesa — Les Pierres Blanches · application
   Vanilla JS, aucune dépendance. Chaque module est autonome.
   ============================================================ */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const html = document.documentElement;
  const body = document.body;
  const page = body.dataset.page || '';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ---------- Toast ---------- */
  const toastEl = $('.toast');
  let toastT;
  const toast = msg => {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3200);
  };
  window.LM.toast = toast;

  /* ---------- Horaires : ouvert / fermé en direct ---------- */
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const dayRanges = d => (LM.hours[d] || []).map(([a, b]) => { const A = toMin(a); let B = toMin(b); if (B <= A) B += 1440; return [A, B]; });
  const openStatus = (now = new Date()) => {
    const d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    // plage de la veille qui déborde après minuit
    for (const [A, B] of dayRanges((d + 6) % 7)) if (B > 1440 && m < B - 1440) return { open: true, until: B - 1440 };
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
    const t = $('[data-status-text]', el) || el; t.textContent = s.text;
  });
  paintStatus(); setInterval(paintStatus, 60000);

  // tableau d'horaires
  $$('[data-hours]').forEach(el => {
    const today = new Date().getDay();
    el.innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
      const r = LM.hours[d];
      const txt = r ? r.map(([a, b]) => `<span class="num">${a.replace(':', 'h')} – ${b.replace(':', 'h')}</span>`).join(' · ') : '<span>Fermé</span>';
      return `<div class="${d === today ? 'is-today' : ''} ${r ? '' : 'is-closed'}"><span>${LM.dayNames[d]}</span>${txt}</div>`;
    }).join('');
  });

  /* ---------- Injection des infos (téléphone, adresse…) ---------- */
  $$('[data-info]').forEach(el => { const v = LM.info[el.dataset.info]; if (v != null) el.textContent = v; });
  $$('[data-href]').forEach(el => { const v = LM.info[el.dataset.href]; if (v) el.href = el.dataset.href === 'phoneIntl' ? `tel:${v}` : el.dataset.href === 'email' ? `mailto:${v}` : v; });
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- Préloader ---------- */
  const loader = $('.loader');
  const hero = $('.hero');
  const showLoader = loader && !html.classList.contains('no-loader');
  const finishIntro = () => {
    html.classList.add('is-loaded');
    hero && hero.classList.add('is-live');
    $$('.page-head .mask').forEach(m => m.classList.add('is-in'));
    loadHeroVideo();
    body.classList.remove('is-locked');
  };
  const loadHeroVideo = () => {
    const v = $('.hero__media video[data-src]');
    if (!v || reduced || (navigator.connection && navigator.connection.saveData)) return;
    const mp4 = v.canPlayType('video/mp4; codecs="avc1.640028"');
    v.src = (mp4 || !v.dataset.webm) ? v.dataset.src : v.dataset.webm; v.removeAttribute('data-src');
    v.addEventListener('playing', () => v.classList.add('is-ready'), { once: true });
    v.load(); v.play().catch(() => {});
  };
  if (showLoader) {
    body.classList.add('is-locked');
    const counter = $('.loader__count'), bar = $('.loader__bar i');
    const t0 = performance.now(), MIN = reduced ? 300 : 2100;
    let ready = false, done = false;
    const heroImg = $('.hero__media img, .page-head--media img');
    const waitImg = heroImg && !heroImg.complete ? new Promise(r => { heroImg.onload = heroImg.onerror = r; }) : Promise.resolve();
    Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), waitImg]).then(() => ready = true);
    const tick = now => {
      const el = now - t0;
      const p = Math.min(1, el / MIN);
      const eased = 1 - Math.pow(1 - p, 3);
      const target = ready ? eased * 100 : Math.min(eased * 100, 92);
      if (counter) counter.textContent = pad(Math.round(target));
      if (bar) bar.style.width = target + '%';
      if (p >= 1 && ready && !done) {
        done = true;
        try { sessionStorage.setItem('lm-seen', '1'); } catch (e) {}
        loader.classList.add('is-done');
        setTimeout(finishIntro, 350);
        setTimeout(() => loader.remove(), 1400);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } else {
    if (loader) loader.remove();
    // entrée depuis une transition de page
    if (html.classList.contains('is-transition')) {
      const veil = $('.veil');
      body.classList.add('page-enter');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        veil.classList.add('is-on', 'is-out');
        html.classList.remove('is-transition');
        setTimeout(() => { veil.classList.remove('is-on', 'is-in', 'is-out'); }, 1100);
      }));
      setTimeout(finishIntro, 120);
    } else finishIntro();
  }

  /* ---------- Transitions de page (voile 3D) ---------- */
  const veil = $('.veil');
  const veilLabel = $('.veil__label');
  const isInternal = a => {
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.noTransition != null) return false;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return false;
    if (u.pathname === location.pathname && u.hash) return false;
    if (!/\.html?$|\/$/.test(u.pathname) && u.pathname.includes('.')) return false;
    return true;
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || !isInternal(a) || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!veil || reduced) return;
    e.preventDefault();
    const label = a.dataset.label || a.getAttribute('aria-label') || a.textContent.trim();
    if (veilLabel) veilLabel.textContent = label.length > 32 ? '' : label;
    $('.menu.is-open') && closeMenu();
    veil.classList.add('is-on');
    requestAnimationFrame(() => veil.classList.add('is-in'));
    try { sessionStorage.setItem('lm-veil', '1'); } catch (err) {}
    setTimeout(() => { location.href = a.href; }, 720);
  });
  // retour arrière : le voile ne doit pas rester bloqué (bfcache)
  addEventListener('pageshow', e => { if (e.persisted && veil) { veil.classList.remove('is-on', 'is-in', 'is-out'); html.classList.remove('is-transition'); } });

  /* ---------- Curseur ---------- */
  const cursor = $('.cursor');
  if (cursor && fine && !reduced) {
    const lab = $('.cursor__label', cursor);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf;
    const move = () => { cx += (x - cx) * .22; cy += (y - cy) * .22; cursor.style.transform = `translate(${cx - 7}px,${cy - 7}px)`; raf = requestAnimationFrame(move); };
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!raf) move(); }, { passive: true });
    document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor]');
      if (t) { cursor.classList.add('is-label'); lab.textContent = t.dataset.cursor; return; }
      cursor.classList.remove('is-label');
      cursor.classList.toggle('is-link', !!e.target.closest('a,button,label,input,select,textarea,[role=button]'));
    });
  }

  /* ---------- Navigation ---------- */
  const nav = $('.nav');
  const burger = $('.burger');
  const menu = $('.menu');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    if (nav) {
      nav.classList.toggle('is-solid', y > 40);
      nav.classList.toggle('is-hidden', y > lastY && y > 300 && !(menu && menu.classList.contains('is-open')));
    }
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const closeMenu = () => { if (!menu) return; menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); body.classList.remove('is-locked'); nav.classList.remove('is-menu'); onScroll(); };
  const openMenu = () => { menu.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true'); body.classList.add('is-locked'); nav.classList.add('is-menu'); nav.classList.remove('is-solid', 'is-hidden'); };
  burger && burger.addEventListener('click', () => menu.classList.contains('is-open') ? closeMenu() : openMenu());
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closeLightbox && closeLightbox(); } });
  // lien courant
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav__links a, .menu__links a').forEach(a => { if ((a.getAttribute('href') || '').split('/').pop() === here) a.setAttribute('aria-current', 'page'); });

  /* ---------- Reveal au défilement ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal], .mask').forEach(el => io.observe(el));

  /* ---------- Tilt 3D ---------- */
  if (fine && !reduced) $$('.tilt, .polaroid, .value').forEach(el => {
    const max = +el.dataset.tilt || 10;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
      const rot = el.style.getPropertyValue('--rot') || getComputedStyle(el).getPropertyValue('--rot') || '0deg';
      el.style.transform = `perspective(900px) rotateX(${(py - .5) * -max}deg) rotateY(${(px - .5) * max}deg) rotate(${rot}) translateZ(14px)`;
      el.style.transition = 'transform .12s linear';
    });
    el.addEventListener('pointerleave', () => { el.style.transition = ''; el.style.transform = ''; });
  });

  /* ---------- Parallaxe légère ---------- */
  const plx = $$('[data-parallax]');
  if (plx.length && !reduced) {
    const run = () => plx.forEach(el => {
      const r = el.getBoundingClientRect(), v = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.transform = `translateY(${v * (+el.dataset.parallax || 60)}px)`;
    });
    addEventListener('scroll', () => requestAnimationFrame(run), { passive: true }); run();
  }

  /* ---------- Partage ---------- */
  $$('[data-share]').forEach(b => b.addEventListener('click', async () => {
    const data = { title: `${LM.info.name} — ${LM.info.sub}`, text: 'Réservez une table face à la mer, à Sète.', url: location.href };
    if (navigator.share) { try { await navigator.share(data); } catch (e) {} }
    else { try { await navigator.clipboard.writeText(location.href); toast('Lien copié dans le presse-papiers'); } catch (e) { toast(location.href); } }
  }));
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(b.dataset.copy); toast('Copié !'); } catch (e) {} }));

  /* ---------- Rayons de lumière WebGL (héro) ---------- */
  const rays = $('.hero__rays');
  if (rays && !reduced) (() => {
    const gl = rays.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return rays.remove();
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      void main(){vec2 uv=gl_FragCoord.xy/r;vec2 o=vec2(.72+m.x*.08,1.15);vec2 d=uv-o;float a=atan(d.x,d.y);
        float ray=0.;for(int i=1;i<4;i++){float fi=float(i);ray+=n(vec2(a*(9.+fi*5.)+t*.05*fi,fi*3.))*(1./fi);}
        ray=pow(ray*.55,2.6);float fall=smoothstep(1.6,.1,length(d));
        float can=n(uv*vec2(60.,3.)+t*.02)*.35+.65; // ombre de canisse
        vec3 col=vec3(1.,.83,.6)*ray*fall*can;
        gl_FragColor=vec4(col,ray*fall*.55);}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return rays.remove();
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const p = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
    const ur = gl.getUniformLocation(pr, 'r'), ut = gl.getUniformLocation(pr, 't'), um = gl.getUniformLocation(pr, 'm');
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    let mx = 0, my = 0, tx = 0, ty = 0, visible = true, last = 0;
    addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
    const size = () => { const s = Math.min(devicePixelRatio, 1.5) * .5; rays.width = innerWidth * s; rays.height = innerHeight * s; gl.viewport(0, 0, rays.width, rays.height); };
    size(); addEventListener('resize', size);
    new IntersectionObserver(es => visible = es[0].isIntersecting).observe(rays);
    const frame = now => {
      requestAnimationFrame(frame);
      if (!visible || now - last < 33) return; last = now;
      mx += (tx - mx) * .04; my += (ty - my) * .04;
      gl.uniform2f(ur, rays.width, rays.height); gl.uniform1f(ut, now / 1000); gl.uniform2f(um, mx, my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    requestAnimationFrame(frame);
  })();

  /* ---------- Éclatement du titre en lettres ---------- */
  $$('[data-letters]').forEach(el => {
    let i = 0, out = '';
    const wrap = (text, cls) => text.split(/(\s+)/).map(w => /^\s+$/.test(w) ? ' ' : `<span class="w">${[...w].map(ch => `<span class="l ${cls}" style="--i:${i++}">${esc(ch)}</span>`).join('')}</span>`).join('');
    el.childNodes.forEach(n => { if (n.nodeType === 3) out += wrap(n.textContent, ''); else if (n.nodeType === 1) out += `<${n.tagName.toLowerCase()}>${wrap(n.textContent, n.tagName === 'EM' ? 'gold' : '')}</${n.tagName.toLowerCase()}>`; });
    el.innerHTML = out.trim();
  });

  /* ============================================================
     PAGE : ACCUEIL
     ============================================================ */
  if (page === 'home') {
    // Plats signature — carrousel
    const dishes = $('[data-dishes]'), dots = $('[data-dots]');
    if (dishes) {
      const picks = [['mer', 0, 'assets/img/still-06-640.webp'], ['partager', 0, 'assets/img/still-00-640.webp'], ['debuts', 0, 'assets/img/still-03-640.webp'], ['braise', 0, 'assets/img/still-04-640.webp'],
        ['mer', 4, 'assets/img/still-07-640.webp'], ['debuts', 1, 'assets/img/still-05-640.webp'], ['partager', 1, 'assets/img/still-01-640.webp'], ['douceurs', 0, 'assets/img/still-02-640.webp']];
      dishes.innerHTML = picks.map(([cat, idx, img]) => { const c = LM.menu.find(m => m.id === cat), it = c.items[idx];
        return `<a class="dish" href="carte.html#${cat}" data-label="La carte"><div class="dish__img"><img src="${img}" alt="" loading="lazy" width="640" height="640"></div><div class="dish__body"><div class="dish__row"><b>${esc(it.name)}</b><i>${it.price} €</i></div><p>${esc(it.desc)}</p></div></a>`; }).join('');
      const paintDots = () => {
        const pages = Math.max(1, Math.round(dishes.scrollWidth / dishes.clientWidth));
        const cur = Math.round(dishes.scrollLeft / dishes.clientWidth);
        dots.innerHTML = Array.from({ length: pages }, (_, i) => `<button type="button" aria-label="Page ${i + 1}" aria-current="${i === cur}"></button>`).join('');
      };
      paintDots(); addEventListener('resize', paintDots);
      dishes.addEventListener('scroll', () => requestAnimationFrame(paintDots), { passive: true });
      dots.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const i = [...dots.children].indexOf(b); dishes.scrollTo({ left: i * dishes.clientWidth, behavior: reduced ? 'auto' : 'smooth' }); });
    }
    // Vidéo du lieu — modale
    const modal = $('[data-modal]');
    if (modal) {
      const mv = $('video', modal);
      const openM = () => { if (mv.dataset.src) { const mp4 = mv.canPlayType('video/mp4; codecs="avc1.640028"'); mv.src = (mp4 || !mv.dataset.webm) ? mv.dataset.src : mv.dataset.webm; mv.removeAttribute('data-src'); } modal.classList.add('is-open'); body.classList.add('is-locked'); mv.play().catch(() => {}); $('.modal__close', modal).focus(); };
      const closeM = () => { modal.classList.remove('is-open'); body.classList.remove('is-locked'); mv.pause(); };
      $$('[data-video]').forEach(b => b.addEventListener('click', openM));
      $('.modal__close', modal).addEventListener('click', closeM);
      modal.addEventListener('click', e => { if (e.target === modal) closeM(); });
      addEventListener('keydown', e => { if (e.key === 'Escape') closeM(); });
    }
    // Bande réservation — date minimale = aujourd'hui
    const bd = $('[data-book] input[type=date]');
    if (bd) { const t = new Date(); bd.min = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`; }
    // Anneau 3D
    const ring = $('.ring'), wrap = $('.ring-wrap');
    if (ring) {
      const picks = [
        ['mer', 0, 'assets/img/still-06-640.webp'], ['partager', 0, 'assets/img/still-00-640.webp'], ['debuts', 0, 'assets/img/still-03-640.webp'],
        ['braise', 0, 'assets/img/still-04-640.webp'], ['cocktails', 0, 'assets/img/still-01-640.webp'], ['mer', 4, 'assets/img/still-07-640.webp'],
        ['debuts', 1, 'assets/img/still-05-640.webp'], ['douceurs', 0, 'assets/img/still-02-640.webp']
      ];
      const n = picks.length, step = 360 / n;
      ring.innerHTML = picks.map(([cat, idx, img], i) => {
        const c = LM.menu.find(m => m.id === cat), it = c.items[idx];
        return `<a class="ring__card" href="carte.html#${cat}" style="--a:${i * step}deg" draggable="false" data-cursor="Voir"><img src="${img}" alt="${esc(it.name)}" loading="lazy" width="640" height="359" draggable="false"><div class="t"><b>${esc(it.name)}</b><span>${esc(c.title)}</span><i>${it.price} €</i></div></a>`;
      }).join('');
      const radius = () => { const w = parseFloat(getComputedStyle(ring.querySelector('.ring__card')).width) || 300; const gap = innerWidth < 600 ? 30 : 130; return Math.round((w + gap) / (2 * Math.tan(Math.PI / n))); };
      const setRadius = () => { const r = radius(); ring.style.setProperty('--radius', r + 'px'); ring.style.setProperty('--depth', -(r - 20) + 'px'); };
      setRadius(); addEventListener('resize', setRadius);
      let ry = 0, vel = 0, drag = false, sx = 0, sr = 0, moved = 0, idle = 0, snapT;
      const paint = () => ring.style.setProperty('--ry', ry + 'deg');
      const snap = () => { ring.classList.add('is-snapping'); ry = Math.round(ry / step) * step; paint(); setTimeout(() => ring.classList.remove('is-snapping'), 900); };
      wrap.addEventListener('pointerdown', e => { drag = true; sx = e.clientX; sr = ry; moved = 0; vel = 0; clearTimeout(snapT); ring.classList.remove('is-snapping'); wrap.setPointerCapture(e.pointerId); });
      wrap.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - sx; moved = Math.abs(dx); vel = (dx - (ry - sr) * 4) * .3; ry = sr + dx / 4; paint(); idle = performance.now(); });
      const up = () => { if (!drag) return; drag = false; snapT = setTimeout(snap, 300); };
      wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
      wrap.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
      $$('.ring-nav button').forEach(b => b.addEventListener('click', () => { ring.classList.add('is-snapping'); ry += b.dataset.dir === 'next' ? -step : step; paint(); idle = performance.now(); setTimeout(() => ring.classList.remove('is-snapping'), 900); }));
      // rotation lente au repos
      if (!reduced) (function auto(now) { requestAnimationFrame(auto); if (drag || now - idle < 4000) return; ry -= .03; paint(); })(0);
      paint();
    }
    // Soleil parallaxe
    const sun = $('.sun');
    if (sun && !reduced) addEventListener('scroll', () => { const r = sun.parentElement.getBoundingClientRect(); const v = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); sun.style.transform = `translateY(${-50 + (1 - v) * 40}%) scale(${.8 + v * .3})`; }, { passive: true });
    // Cocktails
    const ck = $('[data-cocktails]');
    if (ck) { ck.innerHTML = LM.menu.find(m => m.id === 'cocktails').items.slice(0, 5).map((c, i) => `<div class="cocktail" data-reveal style="--d:${i * .06}s"><span class="n">${pad(i + 1)}</span><div><b>${esc(c.name)}</b><span>${esc(c.desc)}</span></div><span class="p">${c.price} €</span></div>`).join(''); $$('[data-reveal]', ck).forEach(el => io.observe(el)); }
  }

  /* ============================================================
     PAGE : CARTE
     ============================================================ */
  if (page === 'carte') {
    const root = $('#carte-root'), catNav = $('.carte-nav .container');
    const filters = new Set(); let q = '';
    const price = it => it.prices ? `<b>${it.prices.verre} €</b><small>verre · ${it.prices.bouteille} € bout.</small>` : `<b>${it.price} €</b>${it.unit ? `<small>${esc(it.unit)}</small>` : ''}`;
    root.innerHTML = LM.menu.map(c => `<section class="mcat" id="${c.id}" aria-labelledby="h-${c.id}">
      <div class="mcat__head"><span class="kicker">${esc(c.kicker)}</span><h2 id="h-${c.id}">${esc(c.title)}</h2>${c.note ? `<p class="mcat__note">${esc(c.note)}</p>` : ''}</div>
      <div class="mitems">${c.items.map(it => `<article class="mitem" data-tags="${(it.tags || []).join(' ')}" data-text="${esc((it.name + ' ' + it.desc).toLowerCase())}">
        <h3 class="mitem__name">${esc(it.name)}${(it.tags || []).map(t => `<span class="tag ${t === 'sig' ? 'tag--sig' : ''}" title="${LM.tags[t].label}">${LM.tags[t].short}</span>`).join('')}</h3>
        <div class="mitem__price">${price(it)}</div><p class="mitem__desc">${esc(it.desc)}</p></article>`).join('')}
        <p class="empty">Rien ne correspond dans cette catégorie.</p></div></section>`).join('');
    catNav.innerHTML = LM.menu.map(c => `<a href="#${c.id}">${esc(c.title)}</a>`).join('');
    const f = $('[data-formula]');
    if (f) f.innerHTML = `<h3>${LM.menuFormula.title}</h3><p class="sub">${LM.menuFormula.sub}</p><ul>${LM.menuFormula.lines.map(l => `<li><span>${esc(l.label)}</span><b>${l.price} €</b></li>`).join('')}</ul>`;
    const apply = () => {
      $$('.mcat').forEach(sec => {
        let vis = 0;
        $$('.mitem', sec).forEach(it => {
          const tags = it.dataset.tags.split(' ');
          const ok = [...filters].every(t => tags.includes(t)) && (!q || it.dataset.text.includes(q));
          it.classList.toggle('is-hidden', !ok); if (ok) vis++;
        });
        $('.empty', sec).style.display = vis ? 'none' : 'block';
      });
    };
    $$('.chip[data-filter]').forEach(ch => ch.addEventListener('click', () => { const t = ch.dataset.filter, on = ch.getAttribute('aria-pressed') !== 'true'; ch.setAttribute('aria-pressed', on); on ? filters.add(t) : filters.delete(t); apply(); }));
    const si = $('.search input'); si && si.addEventListener('input', () => { q = si.value.trim().toLowerCase(); apply(); });
    $('[data-print]') && $('[data-print]').addEventListener('click', () => print());
    // scrollspy
    const links = $$('a', catNav);
    const spy = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-30% 0px -60% 0px' });
    $$('.mcat').forEach(s => spy.observe(s));
    links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); $(a.getAttribute('href')).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); history.replaceState(null, '', a.getAttribute('href')); }));
    if (location.hash) setTimeout(() => { const t = $(location.hash); t && t.scrollIntoView(); }, 300);
  }

  /* ============================================================
     PAGE : GALERIE
     ============================================================ */
  let closeLightbox;
  if (page === 'galerie') {
    const grid = $('.masonry'), lb = $('.lightbox'), img = $('.lightbox__stage img'), cap = $('.lightbox__cap'), cnt = $('.lightbox__count');
    const G = LM.gallery; let cur = 0, dir = 1;
    grid.innerHTML = G.map((g, i) => `<figure class="gitem ${g.w < 500 ? 'gitem--sq' : i % 5 === 2 ? 'gitem--tall' : ''}" data-i="${i}" data-cursor="Ouvrir" tabindex="0" role="button" aria-label="Agrandir : ${esc(g.cap)}"><img src="${g.small}" alt="${esc(g.alt)}" width="${g.w}" height="${g.h}" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async"><figcaption>${esc(g.cap)}</figcaption></figure>`).join('');
    const show = i => {
      cur = (i + G.length) % G.length; const g = G[cur];
      img.classList.remove('is-back'); void img.offsetWidth; if (dir < 0) img.classList.add('is-back');
      img.src = g.src; img.alt = g.alt; cap.textContent = g.cap; cnt.textContent = `${pad(cur + 1)} / ${pad(G.length)}`;
      const nx = G[(cur + 1) % G.length]; new Image().src = nx.src;
    };
    const open = i => { dir = 1; show(i); lb.classList.add('is-open'); body.classList.add('is-locked'); $('.lightbox__close').focus(); };
    closeLightbox = () => { lb.classList.remove('is-open'); body.classList.remove('is-locked'); };
    grid.addEventListener('click', e => { const f = e.target.closest('.gitem'); f && open(+f.dataset.i); });
    grid.addEventListener('keydown', e => { const f = e.target.closest('.gitem'); if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(+f.dataset.i); } });
    $('.lightbox__close').addEventListener('click', closeLightbox);
    $('.lightbox__nav--prev').addEventListener('click', () => { dir = -1; show(cur - 1); });
    $('.lightbox__nav--next').addEventListener('click', () => { dir = 1; show(cur + 1); });
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lightbox__stage')) closeLightbox(); });
    addEventListener('keydown', e => { if (!lb.classList.contains('is-open')) return; if (e.key === 'ArrowRight') { dir = 1; show(cur + 1); } if (e.key === 'ArrowLeft') { dir = -1; show(cur - 1); } });
    let tx0 = null; lb.addEventListener('touchstart', e => tx0 = e.touches[0].clientX, { passive: true });
    lb.addEventListener('touchend', e => { if (tx0 == null) return; const d = e.changedTouches[0].clientX - tx0; if (Math.abs(d) > 50) { dir = d < 0 ? 1 : -1; show(cur + dir); } tx0 = null; });
  }

  /* ============================================================
     Formulaires (réservation / contact) — envoi
     ============================================================ */
  const validate = form => {
    let ok = true;
    $$('.field', form).forEach(f => {
      const i = $('input,select,textarea', f); if (!i || !i.required && !i.value) { f.classList.remove('is-invalid'); return; }
      const bad = !i.checkValidity();
      f.classList.toggle('is-invalid', bad); if (bad) ok = false;
    });
    return ok;
  };
  const send = async (subject, lines, form) => {
    const hp = $('.hp input', form); if (hp && hp.value) return true; // robot
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

  /* ============================================================
     PAGE : RÉSERVATION
     ============================================================ */
  if (page === 'reservation') {
    const S = { date: null, service: null, time: null, guests: 2, name: '', phone: '', email: '', note: '' };
    const steps = $$('.step'), stepsUI = $$('.steps li');
    let cur = 0;
    const goto = i => { cur = i; steps.forEach((s, k) => s.classList.toggle('is-active', k === i)); stepsUI.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.classList.toggle('is-done', k < i); }); $('.resa').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); };
    const fmtDate = d => d ? `${LM.dayNames[d.getDay()]} ${d.getDate()} ${LM.monthNames[d.getMonth()]}` : '';
    const summary = () => {
      $('[data-s=date]').textContent = fmtDate(S.date);
      $('[data-s=time]').textContent = S.time ? `${S.time.replace(':', 'h')} · ${LM.services[S.service].label}` : '';
      $('[data-s=guests]').textContent = `${S.guests} ${S.guests > 1 ? 'personnes' : 'personne'}`;
      $('[data-s=name]').textContent = S.name;
    };
    // Calendrier
    const cal = $('.cal'), today = new Date(); today.setHours(0, 0, 0, 0);
    let view = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 90);
    const drawCal = () => {
      const y = view.getFullYear(), m = view.getMonth();
      $('.cal__head b').textContent = `${LM.monthNames[m]} ${y}`;
      $('.cal__prev').disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
      $('.cal__next').disabled = view >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      const first = new Date(y, m, 1), off = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
      let h = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => `<span class="cal__dn">${d}</span>`).join('') + '<span></span>'.repeat(off);
      for (let d = 1; d <= days; d++) {
        const dt = new Date(y, m, d), closed = !LM.hours[dt.getDay()], dis = dt < today || dt > maxDate || closed;
        const sel = S.date && dt.getTime() === S.date.getTime();
        h += `<button type="button" class="cal__d ${closed ? 'is-closed' : ''} ${dt.getTime() === today.getTime() ? 'is-today' : ''}" ${dis ? 'disabled' : ''} aria-pressed="${sel}" data-d="${d}" aria-label="${fmtDate(dt)}${closed ? ' (fermé)' : ''}">${d}</button>`;
      }
      $('.cal__grid').innerHTML = h;
    };
    // pré-remplissage depuis la bande « Réservez votre table »
    (() => {
      const q = new URLSearchParams(location.search);
      const d = q.get('date'); if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) { const [y, m, dd] = d.split('-').map(Number); const dt = new Date(y, m - 1, dd); if (dt >= today && dt <= maxDate && LM.hours[dt.getDay()]) { S.date = dt; view = new Date(y, m - 1, 1); } }
      const sv = q.get('service'); if (LM.services[sv]) S.service = sv;
      const g = parseInt(q.get('guests'), 10); if (g >= 1 && g <= 12) S.guests = g;
      if (q.has('date')) setTimeout(() => $('.resa').scrollIntoView({ block: 'start' }), 400);
    })();
    drawCal();
    $('.cal__prev').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); drawCal(); });
    $('.cal__next').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); drawCal(); });
    $('.cal__grid').addEventListener('click', e => { const b = e.target.closest('.cal__d'); if (!b || b.disabled) return; S.date = new Date(view.getFullYear(), view.getMonth(), +b.dataset.d); S.time = null; drawCal(); drawSlots(); summary(); });
    // Service + créneaux
    const slotsEl = $('.slots');
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
    if (S.service) { $$('.seg[data-service] button').forEach(x => x.setAttribute('aria-pressed', x.dataset.v === S.service)); drawSlots(); }
    $$('.seg[data-service] button').forEach(b => b.addEventListener('click', () => { $$('.seg[data-service] button').forEach(x => x.setAttribute('aria-pressed', x === b)); S.service = b.dataset.v; S.time = null; drawSlots(); summary(); }));
    slotsEl.addEventListener('click', e => { const b = e.target.closest('.slot'); if (!b || b.disabled) return; $$('.slot', slotsEl).forEach(x => x.setAttribute('aria-pressed', x === b)); S.time = b.textContent.replace('h', ':'); summary(); });
    // Convives
    const out = $('.stepper output');
    const paintGuests = () => { out.innerHTML = `${S.guests}<small>${S.guests > 1 ? 'personnes' : 'personne'}</small>`; summary(); };
    $$('.stepper button').forEach(b => b.addEventListener('click', () => { S.guests = clamp(S.guests + (+b.dataset.d), 1, 12); paintGuests(); }));
    paintGuests();
    // Navigation d'étapes
    $$('[data-next]').forEach(b => b.addEventListener('click', () => {
      if (cur === 0) { if (!S.date) return toast('Choisissez une date.'); if (!S.service || !S.time) return toast('Choisissez un service et un horaire.'); }
      goto(cur + 1);
    }));
    $$('[data-prev]').forEach(b => b.addEventListener('click', () => goto(cur - 1)));
    $('input[name=name]').addEventListener('input', e => { S.name = e.target.value; summary(); });
    // Envoi
    const form = $('#resa-form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validate(form)) return toast('Merci de vérifier les champs en rouge.');
      const fd = new FormData(form); S.name = fd.get('name'); S.phone = fd.get('phone'); S.email = fd.get('email'); S.note = fd.get('note');
      const code = 'LM-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      const lines = [['Référence', code], ['Nom', S.name], ['Téléphone', S.phone], ['E-mail', S.email], ['Date', fmtDate(S.date)], ['Heure', S.time], ['Service', LM.services[S.service].label], ['Convives', S.guests], ['Remarques', S.note || '—']];
      const btn = $('button[type=submit]', form); btn.disabled = true; btn.textContent = 'Envoi…';
      await send(`Demande de réservation ${code} — ${S.name}`, lines, form);
      // Ticket
      const t = $('.ticket');
      $('[data-t=date]', t).textContent = fmtDate(S.date); $('[data-t=time]', t).textContent = S.time.replace(':', 'h');
      $('[data-t=guests]', t).textContent = `${S.guests} ${S.guests > 1 ? 'pers.' : 'pers.'}`; $('[data-t=name]', t).textContent = S.name; $('[data-t=code]', t).textContent = code;
      const [hh, mm] = S.time.split(':').map(Number);
      const start = new Date(S.date); start.setHours(hh, mm); const end = new Date(start.getTime() + 2 * 3600e3);
      const ics = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const cal = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//La Mesa//Reservation//FR', 'BEGIN:VEVENT', `UID:${code}@lespierresblanches.com`, `DTSTAMP:${ics(new Date())}`, `DTSTART:${ics(start)}`, `DTEND:${ics(end)}`, `SUMMARY:Table à La Mesa — ${S.guests} pers.`, `LOCATION:${LM.info.address}, ${LM.info.zip} ${LM.info.city}`, `DESCRIPTION:Réservation ${code} (en attente de confirmation par le restaurant)`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      $('[data-ics]').href = URL.createObjectURL(new Blob([cal], { type: 'text/calendar' }));
      goto(3); toast('Demande envoyée — nous vous confirmons très vite.');
    });
    summary();
  }

  /* ============================================================
     PAGE : CONTACT
     ============================================================ */
  if (page === 'contact') {
    const form = $('#contact-form');
    form && form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validate(form)) return toast('Merci de vérifier les champs en rouge.');
      const fd = new FormData(form);
      const lines = [['Nom', fd.get('name')], ['E-mail', fd.get('email')], ['Téléphone', fd.get('phone') || '—'], ['Objet', fd.get('subject')], ['Message', fd.get('message')]];
      await send(`Contact site — ${fd.get('subject')}`, lines, form);
      form.reset(); toast('Message envoyé. Merci !');
    });
  }

  /* ---------- Newsletter ---------- */
  $$('[data-newsletter]').forEach(f => f.addEventListener('submit', async e => {
    e.preventDefault(); const email = f.email.value.trim(); if (!f.email.checkValidity()) return toast('Adresse e-mail invalide.');
    if (LM.info.formEndpoint) { try { await fetch(LM.info.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ subject: 'Newsletter', email }) }); } catch (err) {} }
    f.reset(); toast('Merci ! Vous recevrez nos nouvelles une fois par mois.');
  }));

  /* ---------- Service worker : cache des assets pour la vitesse ---------- */
  if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
