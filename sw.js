const V='hanpan-b9f80f72', CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-512m.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('hanpan-')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const u=new URL(e.request.url); if(e.request.method!=='GET') return;
  // 글꼴: 한 번 받으면 기기에 보관(비행기 · 해외 로밍에서도 글꼴 유지)
  if(/^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ e.respondWith(caches.open('hanpanfont').then(c=>c.match(e.request).then(h=>h||fetch(e.request).then(r=>{ if(r.ok||r.type==='opaque') c.put(e.request,r.clone()); return r; })))); return; }
  if(u.origin!==location.origin||u.pathname.startsWith('/castle/')||u.pathname.endsWith('version.json')) return;
  // 페이지: 네트워크 우선(새 버전 바로 반영) · 3.5초 넘게 느리거나 끊기면 기기에 저장된 판으로 바로 열기
  const nav=e.request.mode==='navigate'||u.pathname==='/'||u.pathname.endsWith('.html');
  const net=(nav?fetch(e.request.url,{cache:'no-cache',credentials:'same-origin'}):fetch(e.request)).then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(V).then(c=>c.put(e.request,cp)); } return r; });
  const fb=()=>caches.match(e.request,{ignoreSearch:nav}).then(r=>r||(nav?caches.match('./index.html'):null));
  e.respondWith(new Promise(res=>{ let done=0; const tm=setTimeout(()=>fb().then(r=>{ if(r&&!done){ done=1; res(r); } }),nav?3500:6000);
    net.then(r=>{ if(!done){ done=1; clearTimeout(tm); res(r); } }).catch(()=>fb().then(r=>{ if(!done){ done=1; clearTimeout(tm); res(r||Response.error()); } })); })); });
