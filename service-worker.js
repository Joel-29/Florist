self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('v1').then(cache => {
        return cache.addAll([
          '/',
          'index.html',
          'styles.css',
          'app.js',
          'manifest.json',
          'icons/icon-192.svg',
          'icons/icon-512.svg'
        ]).catch(error => {
          console.error('Cache addAll failed:', error);
        });
      })
    );
  });
 
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      }).catch(error => {
        console.error('Fetch failed for:', event.request.url, error);
        return new Response('Offline - Resource not available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
    );
  });
 
