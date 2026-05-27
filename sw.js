const CACHE_NAME = 'chamyaksa-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// 설치: 핵심 파일 캐시
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화: 구버전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 요청 처리: Network First (Firebase 실시간 데이터 우선)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Firebase / 외부 API는 항상 네트워크 직접 요청
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('google') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('cdnjs') ||
    url.hostname.includes('tailwindcss') ||
    url.hostname.includes('fontawesome')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 로컬 파일: 캐시 우선, 없으면 네트워크
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        }
        return response;
      });
    })
  );
});
