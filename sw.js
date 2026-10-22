const V='hanpan-3667cf5b', CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-512m.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('hanpan-')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const u=new URL(e.request.url); if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/castle/')) return;
  // 페이지는 네트워크 우선 + HTTP 캐시 다시 확인(no-cache) → 새 버전 바로 반영, 실패하면 캐시
  const nav=e.request.mode==='navigate'||u.pathname==='/'||u.pathname.endsWith('.html'); if(u.pathname.endsWith('version.json')) return;
  e.respondWith((nav?fetch(e.request.url,{cache:'no-cache',credentials:'same-origin'}):fetch(e.request)).then(r=>{ const cp=r.clone(); caches.open(V).then(c=>c.put(e.request,cp)); return r; }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))); });
