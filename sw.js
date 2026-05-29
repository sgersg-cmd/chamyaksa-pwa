// 버전을 날짜 기반으로 자동 생성 - 매번 새 캐시 사용
const CACHE_VERSION = 'v-' + new Date().toISOString().slice(0,10).replace(/-/g,'');
const CACHE_NAME = 'chamyaksa-' + CACHE_VERSION;

// 설치 시 캐시 초기화
self.addEventListener('install', event => {
    self.skipWaiting(); // 즉시 활성화
});

// 활성화 시 이전 캐시 전부 삭제
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => caches.delete(key)))
        ).then(() => self.clients.claim())
    );
});

// 네트워크 우선 - 캐시 사용 안 함 (항상 최신 파일)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
