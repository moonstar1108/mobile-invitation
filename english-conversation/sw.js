/* 영어 회화 공부 - 오프라인 캐싱용 Service Worker
   앱 데이터/로직은 전혀 포함하지 않으며, index.html을 캐시하여
   네트워크가 없을 때도 앱이 열리도록 하는 역할만 합니다. */
var CACHE_NAME = 'eng-conversation-cache-v1';
var PRECACHE_URLS = ['./', './index.html'];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS).catch(function () {});
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request).then(function (cached) {
        var networkFetch = fetch(event.request).then(function (response) {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(function () { return cached; });
        return cached || networkFetch;
      });
    })
  );
});
