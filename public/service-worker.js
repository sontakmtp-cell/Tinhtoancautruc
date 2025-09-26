// Đặt tên cho cache và phiên bản
const CACHE_NAME = 'crane-beam-studio-v2';

// Danh sách các file cần cache để ứng dụng chạy offline
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Sự kiện 'install': Mở cache và thêm các file vào
self.addEventListener('install', (event) => {
  console.log('ServiceWorker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache resources during install:', error);
      })
  );
  // Force activation of new service worker
  self.skipWaiting();
});

// Sự kiện 'activate': Dọn dẹp cache cũ
self.addEventListener('activate', (event) => {
  console.log('ServiceWorker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Sự kiện 'fetch': Canh thiệp vào các yêu cầu mạng
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Nếu tìm thấy yêu cầu trong cache, trả về từ cache
        if (response) {
          return response;
        }
        
        // Nếu không, thực hiện yêu cầu mạng
        return fetch(event.request)
          .then((response) => {
            // Kiểm tra response hợp lệ trước khi cache
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response để cache (vì response stream chỉ có thể đọc 1 lần)
            const responseToCache = response.clone();

            // Cache dynamic resources (JS, CSS files)
            if (event.request.destination === 'script' || 
                event.request.destination === 'style' ||
                event.request.url.includes('/assets/')) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // Fallback cho navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
