// Service Worker for Blossom PWA
const CACHE_NAME = 'blossom-v1';
const assets = ['index.html', 'styles.css', 'app.js', 'manifest.json'];

self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache opened');
            return cache.addAll(assets).catch(() => {});
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // If found in cache, return cached response
                if (response) {
                    console.log('Serving from cache:', event.request.url);
                    return response;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache if invalid response
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone and cache the response
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });

                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        // Return cached index.html as fallback for offline
                        return caches.match('index.html');
                    });
            })
            .catch(error => {
                console.error('Cache match failed:', error);
                return caches.match('index.html');
            })
    );
});

// Background Sync Event (optional)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-cart') {
        event.waitUntil(syncCartData());
    }
});

async function syncCartData() {
    try {
        console.log('Syncing cart data...');
        // Cart sync logic here
    } catch (error) {
        console.error('Sync failed:', error);
        throw error;
    }
}

// Push Notification Event (optional)
self.addEventListener('push', event => {
    const data = event.data?.json() ?? {};
    const title = data.title || 'Blossom Flowers';
    const options = {
        body: data.body || 'New flowers available!',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><circle cx="96" cy="96" r="90" fill="%23d4598a"/><circle cx="96" cy="60" r="20" fill="%23ff69b4"/></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><circle cx="96" cy="96" r="90" fill="%23d4598a"/></svg>',
        tag: 'blossom-notification'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification Click Event
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            for (let client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});