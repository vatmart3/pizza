/* Service worker — cache des ressources statiques (vitesse + hors-ligne léger) */
const V = 'lamesa-v8';
const CORE = ['index.html','menu.html','carte.html','le-lieu.html','soirees-brochettes.html','groupes.html','galerie.html','reservation.html','contact.html','en/index.html','en/menu.html','en/carte.html','assets/css/main.css','assets/js/app.js','assets/js/menu.js','assets/js/data.js','assets/fonts/jost.woff2','assets/fonts/bodoni.woff2','assets/fonts/bodoni-italic.woff2','assets/img/favicon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const isHTML = r.mode === 'navigate' || r.destination === 'document';
  if (isHTML) { // réseau d'abord, cache en secours
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r).then(m => m || caches.match(new URL(r.url).pathname.startsWith('/en/') ? 'en/index.html' : 'index.html'))));
    return;
  }
  if (r.destination === 'video') return;
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })));
});
