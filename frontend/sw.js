// MAHI Spiritual System — Service Worker
// Enables offline use after first visit

const CACHE_NAME = 'mahi-spiritual-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/ruqya.html',
  '/css/style.css',
  '/css/themes.css',
  '/css/mystic.css',
  '/css/enhanced.css',
  '/js/utils.js',
  '/js/state.js',
  '/js/chart-engine.js',
  '/js/transit-engine.js',
  '/js/moon-visual.js',
  '/js/moon-engine.js',
  '/js/practice-engine.js',
  '/js/recitation-engine.js',
  '/js/audio-player.js',
  '/js/quran-audio.js',
  '/js/notifications.js',
  '/js/progress-charts.js',
  '/js/export-reports.js',
  '/js/offline.js',
  '/js/app.js',
  '/js/chart.js',
  '/js/practice.js',
  '/js/verses.js',
  '/js/lunar.js',
  '/js/mystic.js',
  '/js/family.js',
  '/js/vedic-compat.js',
  '/js/astro-connector.js',
  '/data/chart.json',
  '/data/verses.json',
  '/data/family.json',
  '/data/dasha.json',
  '/data/transits.json',
  '/data/practice.json',
  '/data/spiritual-content.json',
  '/manifest.json'
];

// Install — cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET and external requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache new requests
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback
      if (event.request.destination === 'document') {
        return caches.match('/index.html');
      }
    })
  );
});
