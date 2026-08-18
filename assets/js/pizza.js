/* ============================================================
   PizzaArt — générateur de pizzas en SVG procédural.
   Chaque pizza est dessinée par le code : pâte irrégulière,
   taches de cuisson "léopard", fromage fondu et garnitures
   placées sur une spirale d'or bruitée. Deux pizzas avec la
   même graine sont identiques, deux graines différentes ne le
   sont jamais.
   ============================================================ */
window.PizzaArt = (function () {
  'use strict';

  /* --- aléatoire déterministe (mulberry32) --- */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const TAU = Math.PI * 2;
  const r2 = (n) => Math.round(n * 100) / 100;

  /* --- cercle déformé, lissé en courbes de Bézier fermées --- */
  function blob(cx, cy, radius, steps, amp, rnd, squash) {
    squash = squash || 1;
    const pts = [];
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * TAU;
      const rr = radius * (1 + (rnd() - 0.5) * 2 * amp);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * squash]);
    }
    let d = `M${r2(pts[0][0])},${r2(pts[0][1])}`;
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[(i - 1 + pts.length) % pts.length];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const p3 = pts[(i + 2) % pts.length];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${r2(c1[0])},${r2(c1[1])} ${r2(c2[0])},${r2(c2[1])} ${r2(p2[0])},${r2(p2[1])}`;
    }
    return d + 'Z';
  }

  /* --- placement : spirale de Vogel + rejet de proximité --- */
  function scatter(count, maxR, minGap, rnd, offset) {
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    let i = offset || 0, guard = 0;
    while (pts.length < count && guard < count * 220) {
      guard++;
      const t = (i + 0.6) / (count + 6);
      const rad = maxR * Math.sqrt(t) * (0.42 + 0.62 * rnd());
      const ang = i * golden + rnd() * 0.9;
      const p = [200 + Math.cos(ang) * rad, 200 + Math.sin(ang) * rad];
      i++;
      if (Math.hypot(p[0] - 200, p[1] - 200) > maxR) continue;
      let ok = true;
      for (const q of pts) { if (Math.hypot(p[0] - q[0], p[1] - q[1]) < minGap) { ok = false; break; } }
      if (ok) pts.push(p);
    }
    return pts;
  }

  const shade = (x, y, rx, ry, o) =>
    `<ellipse cx="${r2(x)}" cy="${r2(y + ry * 0.55)}" rx="${r2(rx)}" ry="${r2(ry * 0.7)}" fill="#5a2f14" opacity="${o || 0.16}"/>`;

  /* ============================================================
     Garnitures — chacune reçoit (x, y, s = échelle, rnd)
     ============================================================ */
  const TOPPINGS = {
    pepperoni(x, y, s, rnd) {
      const r = 17 * s, rot = rnd() * 360;
      let specks = '';
      for (let i = 0; i < 4; i++) {
        const a = rnd() * TAU, d = rnd() * r * 0.55;
        specks += `<circle cx="${r2(x + Math.cos(a) * d)}" cy="${r2(y + Math.sin(a) * d)}" r="${r2(1.7 * s + rnd())}" fill="#7d1f14" opacity=".65"/>`;
      }
      return shade(x, y, r, r) +
        `<g transform="rotate(${r2(rot)} ${r2(x)} ${r2(y)})">
          <path d="${blob(x, y, r, 11, 0.06, rnd)}" fill="#c33526"/>
          <path d="${blob(x, y, r * 0.82, 11, 0.07, rnd)}" fill="#d9503a"/>
          <path d="${blob(x, y, r * 0.55, 9, 0.09, rnd)}" fill="#e0684d" opacity=".55"/>
          ${specks}
          <ellipse cx="${r2(x - r * .28)}" cy="${r2(y - r * .3)}" rx="${r2(r * .3)}" ry="${r2(r * .18)}" fill="#ff9d7a" opacity=".45"/>
        </g>`;
    },
    nduja(x, y, s, rnd) {
      const r = 12 * s;
      return `<g><path d="${blob(x, y, r, 10, 0.28, rnd)}" fill="#c22f1c"/>
        <path d="${blob(x - r * .2, y - r * .2, r * .5, 8, 0.3, rnd)}" fill="#e2542f" opacity=".8"/>
        <circle cx="${r2(x + r * .3)}" cy="${r2(y + r * .2)}" r="${r2(r * .16)}" fill="#ffb36b" opacity=".8"/></g>`;
    },
    funghi(x, y, s, rnd) {
      const w = 16 * s, rot = (rnd() - 0.5) * 120;
      return shade(x, y, w * .7, w * .5, .13) +
        `<g transform="rotate(${r2(rot)} ${r2(x)} ${r2(y)})">
          <path d="M${r2(x - w)},${r2(y + 2)} q0,-${r2(w * 1.05)} ${r2(w)},-${r2(w * 1.05)} q${r2(w)},0 ${r2(w)},${r2(w * 1.05)} q-${r2(w * .35)},${r2(w * .25)} -${r2(w * .62)},${r2(w * .1)} l0,${r2(w * .55)} q-${r2(w * .38)},${r2(w * .2)} -${r2(w * .76)},0 l0,-${r2(w * .55)} q-${r2(w * .3)},${r2(w * .15)} -${r2(w * .62)},-${r2(w * .1)} Z" fill="#e3d0b3"/>
          <path d="M${r2(x - w * .85)},${r2(y - w * .1)} q${r2(w * .85)},-${r2(w * .55)} ${r2(w * 1.7)},0" fill="none" stroke="#b99f7d" stroke-width="${r2(1.4 * s)}" opacity=".8"/>
          <ellipse cx="${r2(x - w * .3)}" cy="${r2(y - w * .55)}" rx="${r2(w * .3)}" ry="${r2(w * .16)}" fill="#fff3df" opacity=".55"/>
        </g>`;
    },
    olive(x, y, s, rnd) {
      const r = 9.5 * s;
      return shade(x, y, r, r, .14) +
        `<g transform="rotate(${r2(rnd() * 360)} ${r2(x)} ${r2(y)})">
          <path d="${blob(x, y, r, 10, 0.05, rnd)}" fill="#2f2a33"/>
          <path d="${blob(x, y, r * 0.46, 9, 0.09, rnd)}" fill="#6a5f52"/>
          <ellipse cx="${r2(x - r * .3)}" cy="${r2(y - r * .35)}" rx="${r2(r * .28)}" ry="${r2(r * .15)}" fill="#9a8f86" opacity=".5"/>
        </g>`;
    },
    oliveVerte(x, y, s, rnd) {
      const r = 9 * s;
      return shade(x, y, r, r, .12) +
        `<path d="${blob(x, y, r, 10, 0.06, rnd)}" fill="#7d8a3c"/>
         <path d="${blob(x, y, r * .45, 8, 0.1, rnd)}" fill="#c8552f"/>`;
    },
    basilic(x, y, s, rnd) {
      const L = 20 * s, rot = rnd() * 360;
      return `<g transform="rotate(${r2(rot)} ${r2(x)} ${r2(y)})">
          <path d="M${r2(x)},${r2(y - L * .5)} C${r2(x + L * .55)},${r2(y - L * .35)} ${r2(x + L * .42)},${r2(y + L * .35)} ${r2(x)},${r2(y + L * .5)} C${r2(x - L * .42)},${r2(y + L * .35)} ${r2(x - L * .55)},${r2(y - L * .35)} ${r2(x)},${r2(y - L * .5)} Z" fill="#3f7c31"/>
          <path d="M${r2(x)},${r2(y - L * .42)} C${r2(x + L * .38)},${r2(y - L * .2)} ${r2(x + L * .3)},${r2(y + L * .22)} ${r2(x)},${r2(y + L * .42)}" fill="#59a03f" opacity=".85"/>
          <path d="M${r2(x)},${r2(y - L * .46)} L${r2(x)},${r2(y + L * .46)}" stroke="#2c5b23" stroke-width="${r2(1.1 * s)}" opacity=".7"/>
        </g>`;
    },
    roquette(x, y, s, rnd) {
      const L = 17 * s, rot = rnd() * 360;
      return `<g transform="rotate(${r2(rot)} ${r2(x)} ${r2(y)})">
        <path d="M${r2(x)},${r2(y - L * .55)} C${r2(x + L * .5)},${r2(y - L * .3)} ${r2(x + L * .2)},${r2(y - L * .05)} ${r2(x + L * .45)},${r2(y + L * .15)}
        C${r2(x + L * .15)},${r2(y + L * .25)} ${r2(x + L * .12)},${r2(y + L * .4)} ${r2(x)},${r2(y + L * .55)}
        C${r2(x - L * .12)},${r2(y + L * .4)} ${r2(x - L * .15)},${r2(y + L * .25)} ${r2(x - L * .45)},${r2(y + L * .15)}
        C${r2(x - L * .2)},${r2(y - L * .05)} ${r2(x - L * .5)},${r2(y - L * .3)} ${r2(x)},${r2(y - L * .55)} Z" fill="#4e8c3a"/>
        <path d="M${r2(x)},${r2(y - L * .5)} L${r2(x)},${r2(y + L * .5)}" stroke="#356326" stroke-width="${r2(1 * s)}" opacity=".6"/></g>`;
    },
    tomate(x, y, s, rnd) {
      const r = 13 * s;
      return shade(x, y, r, r, .13) +
        `<g transform="rotate(${r2(rnd() * 360)} ${r2(x)} ${r2(y)})">
          <path d="${blob(x, y, r, 12, 0.05, rnd)}" fill="#cf3b23"/>
          <path d="${blob(x, y, r * .78, 10, 0.06, rnd)}" fill="#e8654a"/>
          <path d="M${r2(x - r * .5)},${r2(y)} q${r2(r * .5)},-${r2(r * .55)} ${r2(r)},0" fill="none" stroke="#ffd0b6" stroke-width="${r2(1.6 * s)}" opacity=".7"/>
          <circle cx="${r2(x - r * .2)}" cy="${r2(y + r * .25)}" r="${r2(r * .12)}" fill="#ffe6b0"/>
          <circle cx="${r2(x + r * .25)}" cy="${r2(y + r * .1)}" r="${r2(r * .12)}" fill="#ffe6b0"/>
        </g>`;
    },
    jambon(x, y, s, rnd) {
      const w = 22 * s;
      return shade(x, y, w * .6, w * .45, .12) +
        `<g transform="rotate(${r2(rnd() * 360)} ${r2(x)} ${r2(y)})">
          <path d="${blob(x, y, w * .62, 9, 0.3, rnd, .72)}" fill="#e39b96"/>
          <path d="${blob(x - w * .12, y - w * .08, w * .38, 8, 0.32, rnd, .7)}" fill="#f0b7b0"/>
          <path d="M${r2(x - w * .4)},${r2(y + w * .1)} q${r2(w * .35)},-${r2(w * .3)} ${r2(w * .75)},-${r2(w * .05)}" fill="none" stroke="#fbe3dd" stroke-width="${r2(2.2 * s)}" opacity=".75" stroke-linecap="round"/>
        </g>`;
    },
    speck(x, y, s, rnd) {
      const w = 20 * s;
      return `<g transform="rotate(${r2(rnd() * 360)} ${r2(x)} ${r2(y)})">
        <path d="${blob(x, y, w * .55, 9, 0.34, rnd, .7)}" fill="#a8352f"/>
        <path d="M${r2(x - w * .35)},${r2(y)} q${r2(w * .35)},-${r2(w * .28)} ${r2(w * .7)},0" fill="none" stroke="#f3d8cf" stroke-width="${r2(2.6 * s)}" opacity=".8" stroke-linecap="round"/></g>`;
    },
    artichaut(x, y, s, rnd) {
      const w = 17 * s, rot = rnd() * 360;
      return shade(x, y, w * .55, w * .5, .12) +
        `<g transform="rotate(${r2(rot)} ${r2(x)} ${r2(y)})">
          <path d="M${r2(x)},${r2(y - w * .6)} L${r2(x + w * .55)},${r2(y + w * .5)} L${r2(x - w * .55)},${r2(y + w * .5)} Z" fill="#8a9b62" rx="4"/>
          <path d="M${r2(x)},${r2(y - w * .35)} L${r2(x + w * .3)},${r2(y + w * .4)} L${r2(x - w * .3)},${r2(y + w * .4)} Z" fill="#b3bf8b"/>
        </g>`;
    },
    oignon(x, y, s, rnd) {
      const r = 15 * s, rot = rnd() * 360;
      return `<g transform="rotate(${r2(rot)} ${r2(x)} ${r2(y)})" fill="none" stroke="#f3e6df" stroke-width="${r2(2.4 * s)}" opacity=".92" stroke-linecap="round">
        <path d="M${r2(x - r)},${r2(y)} a${r2(r)},${r2(r * .8)} 0 0 1 ${r2(r * 2)},0"/>
        <path d="M${r2(x - r * .65)},${r2(y + 4 * s)} a${r2(r * .65)},${r2(r * .5)} 0 0 1 ${r2(r * 1.3)},0" opacity=".8"/></g>`;
    },
    poivron(x, y, s, rnd) {
      const r = 16 * s, rot = rnd() * 360;
      const col = rnd() > .5 ? '#4f9040' : '#d8622a';
      return `<g transform="rotate(${r2(rot)} ${r2(x)} ${r2(y)})" fill="none" stroke="${col}" stroke-width="${r2(4.6 * s)}" stroke-linecap="round">
        <path d="M${r2(x - r)},${r2(y)} a${r2(r)},${r2(r * .75)} 0 0 1 ${r2(r * 2)},0"/></g>`;
    },
    anchois(x, y, s, rnd) {
      const w = 20 * s, rot = rnd() * 360;
      return `<g transform="rotate(${r2(rot)} ${r2(x)} ${r2(y)})">
        <path d="M${r2(x - w * .5)},${r2(y)} q${r2(w * .25)},-${r2(w * .22)} ${r2(w * .5)},0 q${r2(w * .25)},${r2(w * .22)} ${r2(w * .5)},0"
          fill="none" stroke="#8d6a4b" stroke-width="${r2(5 * s)}" stroke-linecap="round"/>
        <path d="M${r2(x - w * .5)},${r2(y)} q${r2(w * .25)},-${r2(w * .22)} ${r2(w * .5)},0 q${r2(w * .25)},${r2(w * .22)} ${r2(w * .5)},0"
          fill="none" stroke="#b9946f" stroke-width="${r2(1.8 * s)}" opacity=".8"/></g>`;
    },
    burrata(x, y, s, rnd) {
      const r = 26 * s;
      return shade(x, y, r, r * .8, .1) +
        `<g><path d="${blob(x, y, r, 12, 0.09, rnd)}" fill="#fffaf0"/>
        <path d="${blob(x, y, r * .74, 10, 0.12, rnd)}" fill="#fff" opacity=".9"/>
        <ellipse cx="${r2(x - r * .28)}" cy="${r2(y - r * .3)}" rx="${r2(r * .3)}" ry="${r2(r * .2)}" fill="#fff" opacity=".95"/>
        <path d="${blob(x + r * .1, y + r * .15, r * .3, 9, 0.2, rnd)}" fill="#f6ecd8" opacity=".8"/></g>`;
    },
    ricotta(x, y, s, rnd) {
      const r = 13 * s;
      return `<path d="${blob(x, y, r, 10, 0.16, rnd)}" fill="#fdf7e8"/>
        <ellipse cx="${r2(x - r * .25)}" cy="${r2(y - r * .25)}" rx="${r2(r * .35)}" ry="${r2(r * .22)}" fill="#fff" opacity=".8"/>`;
    },
    gorgonzola(x, y, s, rnd) {
      const r = 14 * s;
      let dots = '';
      for (let i = 0; i < 5; i++) {
        const a = rnd() * TAU, d = rnd() * r * .6;
        dots += `<circle cx="${r2(x + Math.cos(a) * d)}" cy="${r2(y + Math.sin(a) * d)}" r="${r2(1.5 + rnd() * 1.4)}" fill="#7d8a86" opacity=".75"/>`;
      }
      return `<path d="${blob(x, y, r, 10, 0.18, rnd)}" fill="#f4eddc"/>${dots}`;
    },
    parmesan(x, y, s, rnd) {
      const w = 15 * s, rot = rnd() * 360;
      return `<g transform="rotate(${r2(rot)} ${r2(x)} ${r2(y)})">
        <path d="M${r2(x - w * .5)},${r2(y)} L${r2(x + w * .5)},${r2(y - w * .18)} L${r2(x + w * .45)},${r2(y + w * .14)} L${r2(x - w * .45)},${r2(y + w * .2)} Z" fill="#f2dfa8"/>
        <path d="M${r2(x - w * .45)},${r2(y + w * .04)} L${r2(x + w * .45)},${r2(y - w * .12)}" stroke="#fff6da" stroke-width="${r2(1.4 * s)}" opacity=".8"/></g>`;
    },
    truffe(x, y, s, rnd) {
      const r = 12 * s, rot = rnd() * 360;
      return `<g transform="rotate(${r2(rot)} ${r2(x)} ${r2(y)})">
        <path d="${blob(x, y, r, 11, 0.12, rnd, .42)}" fill="#3a2f2c"/>
        <path d="M${r2(x - r * .6)},${r2(y)} q${r2(r * .3)},-${r2(r * .18)} ${r2(r * .6)},0 q${r2(r * .3)},${r2(r * .18)} ${r2(r * .6)},0" fill="none" stroke="#a08e7e" stroke-width="${r2(1 * s)}" opacity=".7"/></g>`;
    },
    oeuf(x, y, s, rnd) {
      const r = 26 * s;
      return `<path d="${blob(x, y, r, 12, 0.1, rnd)}" fill="#fffdf6"/>
        <circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r * .42)}" fill="#f2a833"/>
        <circle cx="${r2(x - r * .12)}" cy="${r2(y - r * .12)}" r="${r2(r * .16)}" fill="#ffd27a" opacity=".8"/>`;
    },
    piment(x, y, s, rnd) {
      const r = 7 * s;
      return `<g transform="rotate(${r2(rnd() * 360)} ${r2(x)} ${r2(y)})"><path d="M${r2(x - r)},${r2(y)} q${r2(r)},-${r2(r * .8)} ${r2(r * 2)},0 q-${r2(r)},${r2(r * .5)} -${r2(r * 2)},0Z" fill="#cf2f22"/></g>`;
    },
    pesto(x, y, s, rnd) {
      const r = 14 * s;
      return `<path d="${blob(x, y, r, 10, 0.22, rnd)}" fill="#5c8b34" opacity=".92"/>
        <path d="${blob(x - r * .2, y - r * .2, r * .4, 8, 0.24, rnd)}" fill="#7ba84b" opacity=".9"/>`;
    },
    pignons(x, y, s, rnd) {
      const r = 5 * s;
      return `<ellipse cx="${r2(x)}" cy="${r2(y)}" rx="${r2(r)}" ry="${r2(r * .55)}" transform="rotate(${r2(rnd() * 360)} ${r2(x)} ${r2(y)})" fill="#e9d9ad"/>`;
    },
    citron(x, y, s, rnd) {
      const r = 12 * s;
      return `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="#f4dd7a"/><circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r * .78)}" fill="#fbf0a8"/>`;
    }
  };

  /* ============================================================
     Rendu principal
     ============================================================ */
  let uid = 0;
  function render(recipe, opts) {
    opts = opts || {};
    const rnd = rng((recipe.seed || 7) * 2654435761 % 4294967296);
    const id = 'p' + (++uid);
    const bianca = recipe.base === 'bianca';
    const crustR = 184, sauceR = 152, fieldR = 138;
    let g = '';

    /* — ombre portée — */
    if (opts.shadow !== false) {
      g += `<ellipse cx="200" cy="214" rx="190" ry="188" fill="url(#sh${id})"/>`;
    }

    /* — corniche (bord) — */
    g += `<path d="${blob(200, 200, crustR, 26, 0.022, rnd)}" fill="url(#cr${id})"/>`;
    g += `<path d="${blob(200, 200, crustR - 7, 24, 0.02, rnd)}" fill="url(#cr2${id})" opacity=".85"/>`;

    /* — taches de cuisson façon léopard sur la corniche — */
    const spots = 26;
    for (let i = 0; i < spots; i++) {
      const a = (i / spots) * TAU + rnd() * 0.2;
      const rr = crustR - 10 - rnd() * 20;
      const sx = 200 + Math.cos(a) * rr, sy = 200 + Math.sin(a) * rr;
      const rad = 3 + rnd() * 7;
      g += `<path d="${blob(sx, sy, rad, 8, 0.32, rnd)}" fill="#6a3a17" opacity="${r2(0.14 + rnd() * 0.3)}"/>`;
    }
    /* bulles claires */
    for (let i = 0; i < 14; i++) {
      const a = rnd() * TAU, rr = crustR - 12 - rnd() * 18;
      g += `<ellipse cx="${r2(200 + Math.cos(a) * rr)}" cy="${r2(200 + Math.sin(a) * rr)}" rx="${r2(4 + rnd() * 6)}" ry="${r2(3 + rnd() * 4)}" fill="#ffe0a8" opacity="${r2(.18 + rnd() * .22)}"/>`;
    }

    /* — base : sauce tomate ou crème — */
    g += `<path d="${blob(200, 200, sauceR, 22, 0.028, rnd)}" fill="url(#${bianca ? 'wh' : 'sa'}${id})"/>`;
    for (let i = 0; i < 10; i++) {
      const a = rnd() * TAU, d = rnd() * sauceR * .8;
      g += `<path d="${blob(200 + Math.cos(a) * d, 200 + Math.sin(a) * d, 12 + rnd() * 22, 9, 0.28, rnd)}" fill="${bianca ? '#efe0c0' : '#a72a15'}" opacity="${r2(.1 + rnd() * .14)}"/>`;
    }

    /* — mozzarella fondue — */
    const cheeseN = recipe.cheese === false ? 0 : (recipe.cheeseN || 17);
    const cheesePts = scatter(cheeseN, sauceR - 22, 26, rnd, 3);
    cheesePts.forEach((p) => {
      const r = 13 + rnd() * 11;
      g += `<path d="${blob(p[0], p[1], r, 11, 0.26, rnd)}" fill="url(#ch${id})" opacity=".95"/>`;
      g += `<path d="${blob(p[0] - r * .18, p[1] - r * .2, r * .5, 9, 0.26, rnd)}" fill="#fffdf3" opacity=".7"/>`;
      if (rnd() > .5) g += `<path d="${blob(p[0] + r * .25, p[1] + r * .2, r * .34, 8, 0.32, rnd)}" fill="#e0a758" opacity=".55"/>`;
    });

    /* — garnitures — */
    let offset = 11;
    (recipe.toppings || []).forEach((t) => {
      const fn = TOPPINGS[t.k];
      if (!fn) return;
      const pts = scatter(t.n, t.r != null ? t.r : fieldR, t.gap || 40, rnd, offset);
      offset += 7;
      pts.forEach((p) => { g += fn(p[0], p[1], t.s || 1, rnd); });
    });

    /* — brillance d'huile d'olive — */
    for (let i = 0; i < 7; i++) {
      const a = rnd() * TAU, d = rnd() * fieldR;
      g += `<ellipse cx="${r2(200 + Math.cos(a) * d)}" cy="${r2(200 + Math.sin(a) * d)}" rx="${r2(4 + rnd() * 9)}" ry="${r2(2 + rnd() * 4)}" fill="#fff3c4" opacity="${r2(.12 + rnd() * .16)}"/>`;
    }
    /* — lumière générale — */
    g += `<circle cx="200" cy="200" r="${crustR}" fill="url(#lt${id})" style="mix-blend-mode:soft-light"/>`;

    return `<svg class="pizza-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${(recipe.alt || 'Pizza artisanale').replace(/"/g, '')}">
      <defs>
        <radialGradient id="sh${id}" cx="50%" cy="52%" r="50%">
          <stop offset="62%" stop-color="#2a1509" stop-opacity=".5"/><stop offset="100%" stop-color="#2a1509" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="cr${id}" cx="38%" cy="32%" r="78%">
          <stop offset="0%" stop-color="#f8d79a"/><stop offset="55%" stop-color="#e9b268"/><stop offset="88%" stop-color="#cf8438"/><stop offset="100%" stop-color="#a95f21"/>
        </radialGradient>
        <radialGradient id="cr2${id}" cx="42%" cy="36%" r="72%">
          <stop offset="0%" stop-color="#ffe9bd"/><stop offset="70%" stop-color="#f0c98a"/><stop offset="100%" stop-color="#dda45a"/>
        </radialGradient>
        <radialGradient id="sa${id}" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stop-color="#e0512f"/><stop offset="60%" stop-color="#c93a20"/><stop offset="100%" stop-color="#a82a14"/>
        </radialGradient>
        <radialGradient id="wh${id}" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stop-color="#fdf3dd"/><stop offset="70%" stop-color="#f4e4c2"/><stop offset="100%" stop-color="#e6d1a7"/>
        </radialGradient>
        <radialGradient id="ch${id}" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#fff8e4"/><stop offset="70%" stop-color="#fbeec4"/><stop offset="100%" stop-color="#eed79a"/>
        </radialGradient>
        <radialGradient id="lt${id}" cx="34%" cy="26%" r="70%">
          <stop offset="0%" stop-color="#fff" stop-opacity=".5"/><stop offset="55%" stop-color="#fff" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".28"/>
        </radialGradient>
      </defs>${g}</svg>`;
  }

  return { render, rng, blob };
})();
