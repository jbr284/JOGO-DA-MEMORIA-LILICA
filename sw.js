const CACHE_NAME = 'jogos-online-cache-v1'; 
const URLS_TO_CACHE = [
  '/',                
  'index.html',       
  'game.html',        
  'tictactoe.html',   
  'manifest.json',
  'icons/icon-192.png', 
  'icons/icon-512.png', 
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        const promises = URLS_TO_CACHE.map(url => {
            return cache.add(url).catch(err => console.warn(`Falha ao cachear ${url}: ${err}`));
        });
        return Promise.all(promises);
      })
      .then(() => console.log('Recursos essenciais cacheados.'))
      .catch(err => console.error('Falha crítica ao cachear:', err))
  );
});

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

self.addEventListener('fetch', (event) => {
  // *** INÍCIO DA CORREÇÃO ***
  // Ignora requisições que não são GET ou que são de extensões
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
      //console.log('SW ignorando requisição:', event.request.url);
      return; // Deixa o navegador lidar com a requisição normalmente
  }
  // *** FIM DA CORREÇÃO ***
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Serve do cache
        }
        return fetch(event.request).then(
          (networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Verifica novamente se a URL é http/https antes de cachear (segurança extra)
                if(event.request.url.startsWith('http')){
                    cache.put(event.request, responseToCache); 
                }
              });
            return networkResponse;
          }
        ).catch(error => {
            console.warn('Fetch falhou; talvez offline?', error);
        });
      })
  );
});
