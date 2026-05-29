// 버전 번호 바꾸면 자동으로 캐시 갱신됨
const CACHE_VERSION = 'v7.1';
const CACHE_NAME = `chamyaksa-${CACHE_VERSION}`;

// 설치 시 이전 캐시 즉시 제거
self.addEventListener('install', e => {
    self.skipWaiting();
});

// 활성화 시 이전 버전 캐시 전부 삭제
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// 네트워크 우선 전략 - 항상 서버에서 최신 파일 가져옴
self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
