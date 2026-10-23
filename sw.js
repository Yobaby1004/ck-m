/* 기존 ck-m 홈 아이콘용 셸만 기억한다. ck-f의 화면·자료·기억은 건드리지 않는다. */
const CACHE = 'cheoneok-m-v3';
const FILES = ['./', './index.html', './manifest.json', './icon.png', './icon-mask.png', './icon-180.png'];
const SCOPE = new URL(self.registration.scope).pathname;
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) {
    if (k.startsWith('cheoneok-m-') && k !== CACHE) await caches.delete(k);
  }
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin || !u.pathname.startsWith(SCOPE)) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const r = await fetch(e.request);
      if (r.ok) c.put(e.request, r.clone()).catch(() => {});
      return r;
    } catch (err) {
      const old = await c.match(e.request);
      if (old) return old;
      if (e.request.mode === 'navigate') {
        const shell = await c.match('./index.html');
        if (shell) return shell;
      }
      throw err;
    }
  })());
});
