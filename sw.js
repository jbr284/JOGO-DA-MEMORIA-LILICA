const CACHE_NAME = 'jogo-memoria-cache-v3'; // Incrementei a versão
const URLS_TO_CACHE = [
  '/', // A raiz do site
  'index.html', // A página do Lobby
  'game.html',  // A página do Jogo
  'manifest.json',
  // Verifique se os nomes dos seus ícones são EXATAMENTE estes:
  'icons/icon-192.png', 
  'icons/icon-512.png',
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
        // Usar addAll com tratamento de erro individual (mais robusto)
        const promises = URLS_TO_CACHE.map(url => {
            return cache.add(url).catch(err => {
                console.warn(`Falha ao cachear ${url}: ${err}`);
            });
        });
        return Promise.all(promises);
      })
      .then(() => {
        console.log('Todos os recursos essenciais foram cacheados (ou falhas foram ignoradas).');
      })
      .catch(err => {
        console.error('Falha crítica ao abrir ou adicionar ao cache:', err);
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
  // Ignora requisições que não são GET (ex: Firebase escrevendo dados)
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se está no cache, retorna do cache
        if (response) {
          return response;
        }

        // Se não está no cache, busca na rede
        return fetch(event.request).then(
          (networkResponse) => {
            // Verifica se a resposta da rede é válida
            if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
              return networkResponse;
            }

            // Clona a resposta para poder salvar no cache e retornar ao navegador
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetch falhou; talvez offline?', error);
            // Poderia retornar uma página offline padrão aqui, se tivesse uma
        });
      })
  );
});
