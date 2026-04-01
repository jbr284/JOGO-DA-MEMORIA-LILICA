// ===============================
// SERVICE WORKER - VERSÃO v17 (Fix Undefined Winner)
// ===============================
const CACHE_NAME = 'jogos-online-cache-v17'; 
const FILES_TO_CACHE = [
  './',
  'index.html',
  'game.html',
  'manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES_TO_CACHE)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) return;
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request).then(net => {
      return caches.open(CACHE_NAME).then(c => { c.put(e.request, net.clone()); return net; });
  })));
});
