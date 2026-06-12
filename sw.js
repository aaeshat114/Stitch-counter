const CACHE_NAME = 'crochet-counter-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Install and cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Forces this new worker to activate immediately
});

// Clean up old version caches when a new version activates
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Instantly takes control of the open pages
});

// Network-First Strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If network request is successful, update the cache with the fresh file
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If internet is completely unavailable, load from cache
        return caches.match(event.request);
      })
  );
});
