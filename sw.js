const CACHE_NAME = 'jogos-online-cache-v1'; // Nova versão do cache
const URLS_TO_CACHE = [
  '/',                // A raiz do site
  'index.html',       // A página do Lobby
  'game.html',        // A página do Jogo da Memória
  'tictactoe.html',   // A nova página do Jogo da Velha
  'manifest.json',
  'icons/icon-192.png', // Verifique o nome exato do seu ícone
  'icons/icon-512.png', // Verifique o nome exato do seu ícone
  // URLs externas (Firebase)
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js'
];

// Evento de Instalação: Salva os arquivos essenciais em cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        const promises = URLS_TO_CACHE.map(url => {
            return cache.add(url).catch(err => {
                console.warn(`Falha ao cachear ${url}: ${err}`);
            });
        });
        return Promise.all(promises);
      })
      .then(() => {
        console.log('Recursos essenciais cacheados.');
      })
      .catch(err => {
        console.error('Falha crítica ao cachear:', err);
      })
  );
});

// Evento de Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento de Fetch: Intercepta as requisições
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Serve do cache
        }

        // Se não está no cache, busca na rede
        return fetch(event.request).then(
          (networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache); // Salva no cache
              });
            return networkResponse;
          }
        ).catch(error => {
            console.warn('Fetch falhou; tentando servir do cache mesmo assim ou falhando.', error);
            // Poderia retornar uma resposta offline aqui
        });
      })
  );
});
