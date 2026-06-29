const CACHE='girok-v3.2';
const ASSETS=['./','./index.html','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  // HTML/페이지 요청은 네트워크 우선 (깃허브 최신본을 먼저 가져옴, 실패 시 캐시)
  const isPage=e.request.mode==='navigate'||url.pathname.endsWith('/')||url.pathname.endsWith('index.html');
  if(isPage){
    e.respondWith(
      fetch(e.request).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
        return res;
      }).catch(()=>caches.match(e.request).then(c=>c||caches.match('./index.html')))
    );
    return;
  }
  // 그 외(이미지·폰트 등)는 캐시 우선
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));
});
