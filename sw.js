// ===============================
// SERVICE WORKER - VERSÃO FINAL
// ===============================
const CACHE_NAME = 'jogos-online-cache-v3'; // ← altere o número para forçar nova versão
const FILES_TO_CACHE = [
  'index.html',
  'game.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js'
];

// Instala o SW e faz o cache inicial
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando nova versão...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto:', CACHE_NAME);
        return Promise.all(
          FILES_TO_CACHE.map(async (url) => {
            try {
              await cache.add(url);
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
  // Ignora requisições não-HTTP (extensões, devtools, etc.)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Salva nova resposta no cache para uso futuro
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // Se offline, tenta pegar do cache
        return caches.match(event.request)
          .then((cached) => cached || caches.match('index.html'));
      })
  );
});

// Atualiza automaticamente os clientes abertos quando um novo SW é instalado
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
