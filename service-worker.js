// Define um nome e versão para o cache
const CACHE_NAME = 'diabetes-tracker-v1';

// Lista de arquivos essenciais para o funcionamento offline do app (o "app shell")
const URLS_TO_CACHE = [
  '/',
  'index.html',
  // Se você tivesse arquivos CSS e JS separados, eles entrariam aqui.
  // Como está tudo embutido, 'index.html' e a raiz '/' são suficientes.
];

// Evento de Instalação: Salva os arquivos essenciais no cache.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento de Ativação: Limpa caches antigos se uma nova versão do service worker for ativada.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento de Fetch: Intercepta as requisições de rede.
// Estratégia: "Cache First". Tenta buscar do cache primeiro. Se falhar, busca na rede.
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET (como as do Firebase para salvar dados)
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se a resposta estiver no cache, retorna do cache
        if (response) {
          return response;
        }
        // Se não, busca na rede
        return fetch(event.request);
      })
  );
});