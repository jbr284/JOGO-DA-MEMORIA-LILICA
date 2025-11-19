// ===============================
// SERVICE WORKER - VERSÃO FINAL (ATUALIZADA PARA v5)
// ===============================
const CACHE_NAME = 'jogos-online-cache-v5'; // <-- VERSÃO INCREMENTADA
const FILES_TO_CACHE = [
  'index.html', 
  'game.html', // Agora o SW vai buscar a versão atualizada deste arquivo
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js'
];

// Instala o SW e faz o cache inicial
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando nova versão (v5)...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto:', CACHE_NAME);
        return Promise.all(
          FILES_TO_CACHE.map(async (url) => {
            try {
              // Força o re-cache de URLs que podem ter mudado
              await cache.add(new Request(url, { cache: 'reload' }));
              console.log('[SW] Cacheado:', url);
            } catch (err) {
              console.warn('[SW] Falha ao cachear:', url, err);
            }
          })
        );
      })
      .then(() => self.skipWaiting()) // força ativação imediata
  );
});

// Ativa o novo SW e remove caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando e limpando versões antigas...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de rede + cache (Network First)
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((cached) => cached || caches.match('index.html'));
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
