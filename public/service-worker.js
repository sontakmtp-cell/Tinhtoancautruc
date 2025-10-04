// Đặt tên cho cache và phiên bản
const CACHE_VERSION = 1759572277; // <-- TĂNG SỐ NÀY MỖI KHI DEPLOY BẢN MỚI
const CACHE_NAME = `crane-beam-studio-v${CACHE_VERSION}`;

// Danh sách các file cần cache để ứng dụng chạy offline
const urlsToCache = [
  '/',
  '/index.html', // Cần thiết để fallback khi offline
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
  // Bỏ qua các yêu cầu không phải GET hoặc từ nguồn khác (ví dụ: API của Google Fonts, Plotly)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Chiến lược "Network First" cho trang HTML (navigation requests)
  // Để người dùng luôn nhận được phiên bản mới nhất của trang
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Nếu fetch thành công, trả về response từ mạng
          return response;
        })
        .catch(() => {
          // Nếu mạng lỗi, trả về trang index.html từ cache
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Chiến lược "Cache First" cho các tài nguyên khác (CSS, JS, ảnh, v.v.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Nếu có trong cache, trả về từ cache
      if (cachedResponse) {
        return cachedResponse;
      }

      // Nếu không có trong cache, đi lấy từ mạng
      return fetch(event.request).then((networkResponse) => {
        // Clone response để có thể trả về và cache cùng lúc
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Cache lại tài nguyên mới này
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
