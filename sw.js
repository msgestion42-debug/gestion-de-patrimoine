const CACHE='patrimoine-v5.3.1';
const FILES=['./','index.html','styles.css','app.js','cloud.js','manifest.webmanifest','icon.svg'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);

  // Always try the network first for application files so a newly deployed
  // GitHub Pages version replaces the previous version immediately.
  if(url.origin===self.location.origin){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        const cache=await caches.open(CACHE);
        cache.put(req,fresh.clone());
        return fresh;
      }catch{
        return (await caches.match(req)) || (await caches.match('./'));
      }
    })());
    return;
  }

  event.respondWith(fetch(req).catch(()=>caches.match(req)));
});
