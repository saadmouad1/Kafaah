/* كفاءة — Service Worker
 * تخزين مؤقت للعمل دون اتصال + تسريع التحميل.
 * مكتوب يدويًا لأن إضافة next-pwa تعتمد على webpack ولا تعمل مع Turbopack.
 */
const VERSION = 'kafaah-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const DATA_CACHE = `${VERSION}-data`;
const OFFLINE_URL = '/offline';

const PRECACHE = [
  '/',
  '/offline',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-512-maskable.png',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' }))));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      if (self.registration.navigationPreload) {
        try { await self.registration.navigationPreload.disable(); } catch {}
      }
      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    url.pathname.startsWith('/icon') ||
    url.pathname.startsWith('/og') ||
    url.pathname.startsWith('/apple-touch-icon') ||
    url.pathname.startsWith('/favicon') ||
    /\.(?:js|css|png|jpg|jpeg|svg|webp|avif|gif|ico|woff2?|ttf|eot)$/.test(url.pathname)
  );
}

async function networkFirst(request, cacheName, fallbackToOffline) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackToOffline) {
      const pages = await caches.open(PAGES_CACHE);
      const shell = (await pages.match(request)) || (await pages.match('/')) || (await caches.match(OFFLINE_URL));
      if (shell) return shell;
    }
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || (await network) || fetch(request);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    // تحديث صامت في الخلفية
    fetch(request).then((res) => { if (res && res.ok) cache.put(request, res.clone()); }).catch(() => {});
    return cached;
  }
  const res = await fetch(request);
  if (res && res.ok) cache.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // التنقّل بين الصفحات: الشبكة أولًا ثم النسخة المخزّنة ثم صفحة عدم الاتصال
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGES_CACHE);
        const fallback = async () => {
          const direct = await cache.match(request);
          if (direct) return direct;
          // لا نُعيد الصفحة التعريفية (/) لصفحات أخرى — نُعيد صفحة عدم الاتصال
          const pathname = new URL(request.url).pathname;
          if (pathname === '/' || pathname === '') {
            const root = await cache.match('/');
            if (root) return root;
          }
          return (await caches.match(OFFLINE_URL)) || Response.error();
        };
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) {
            cache.put(request, fresh.clone());
            return fresh;
          }
          // استجابة غير ناجحة (5xx/502 من وسيط مثلاً) => نرجع للنسخة المخزّنة
          const cached = await fallback();
          return cached && cached.status !== 0 ? cached : fresh;
        } catch {
          return fallback();
        }
      })(),
    );
    return;
  }

  // واجهات البيانات (الأسئلة/الأقسام...): الشبكة أولًا مع نسخة مخزّنة للعمل دون اتصال
  if (sameOrigin && url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DATA_CACHE, false));
    return;
  }

  // الأصول الثابتة والأيقونات والخطوط
  if (isStaticAsset(url) || (sameOrigin && url.pathname.startsWith('/_next/'))) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // خطوط/أصول خارجية (Google Fonts مثلًا)
  if (!sameOrigin) {
    if (/fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
      event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    }
    return;
  }

  // الافتراضي: الشبكة أولًا ثم الكاش
  event.respondWith(
    (async () => {
      try {
        return await fetch(request);
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw new Error('offline');
      }
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});
