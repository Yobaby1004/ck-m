// 📱 천억 캘린더 모바일판 서비스워커 = 오프라인에서도 열리게(지하철·통신 끊김 대비)
// ★데이터는 '네트워크 먼저, 실패하면 캐시'다. 오래된 캐시를 최신으로 착각하면 안 되므로
//   화면 맨 위에 '자료 만든 때'와 '몇 시간 전'이 항상 찍힌다.
// ★★이 파일은 https 로 열 때만 동작한다. http://192.168.x.x 처럼 IP 로 열면 브라우저가
//   비보안으로 보고 navigator.serviceWorker 자체를 안 준다(2026-09-20 실측 = 지원 false).
//   즉 지금 로컬 서버(http)로 보는 동안은 ★오프라인 저장이 없다. 터널(https)로 열면 생긴다.
const CACHE = 'cheoneok-m-v2';
const FILES = ['./', './index.html', './m_data.js', './manifest.json',
               './icon.png', './icon-mask.png', './icon-180.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
