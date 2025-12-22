// Service Worker para Push Notifications
const CACHE_NAME = 'ayra-v2'; // Atualizado para forçar limpeza
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - estratégia Network First, com validações
self.addEventListener('fetch', (event) => {
    // Ignora chrome-extensions e requisições não-HTTP
    if (!event.request.url.startsWith('http')) {
        return;
    }

    // Ignora métodos que não são GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignora APIs externas e Supabase
    const url = new URL(event.request.url);
    if (url.hostname.includes('supabase.co') ||
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('analytics')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Só cacheia respostas OK
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone a resposta
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseToCache);
                    })
                    .catch((err) => {
                        console.log('[SW] Cache error:', err);
                    });

                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// Push Notification Handler
self.addEventListener('push', (event) => {
    console.log('[SW] Push received:', event);

    let data = {
        title: 'Ayra',
        body: 'Nova notificação',
        icon: '/icon-192.png',
        badge: '/apple-touch-icon.png',
        tag: 'ayra-notification',
        requireInteraction: false
    };

    if (event.data) {
        try {
            const jsonData = event.data.json();
            data = { ...data, ...jsonData };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        requireInteraction: data.requireInteraction,
        data: {
            url: data.url || '/',
            ...data.data
        },
        vibrate: [200, 100, 200],
        actions: data.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event);

    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Verifica se já existe uma janela aberta
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Se não houver janela aberta, abre uma nova
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Notification Close Handler
self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification closed:', event);
});
