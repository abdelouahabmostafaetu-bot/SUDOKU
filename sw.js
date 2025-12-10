// Service Worker for Math News Hub
// Created by Abdelouahab Mostafa
// Provides offline caching and performance optimization

const CACHE_NAME = 'math-news-v1.0.0';
const RUNTIME_CACHE = 'runtime-cache';

// Assets to cache on install
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/OIP.webp',
    'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
    console.log('✅ Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching app shell');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                // Return cached version and update cache in background
                event.waitUntil(updateCache(event.request));
                return cachedResponse;
            }

            // Not in cache, fetch from network
            return fetch(event.request).then(response => {
                // Cache successful responses
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            }).catch(() => {
                // Offline fallback
                return new Response(
                    '<h1>Offline</h1><p>You are currently offline. Please check your connection.</p>',
                    { headers: { 'Content-Type': 'text/html' } }
                );
            });
        })
    );
});

// Update cache in background
async function updateCache(request) {
    try {
        const response = await fetch(request);
        if (response.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            await cache.put(request, response);
        }
    } catch (error) {
        console.log('Cache update failed:', error);
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered');
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Sync offline actions when connection is restored
    console.log('📡 Syncing offline data...');
    // Implementation would sync bookmarks, comments, etc.
}

// Push notifications support
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New mathematics article available!',
        icon: '/OIP.webp',
        badge: '/OIP.webp',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'explore', title: 'Read Now', icon: '📖' },
            { action: 'close', title: 'Close', icon: '✖' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Math News Hub', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('🎉 Service Worker loaded - Created by Abdelouahab Mostafa');
