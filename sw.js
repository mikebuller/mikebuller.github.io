/*
 * Service Worker for The Bonville G.C. Invitational
 * -------------------------------------------------
 * Makes the app usable offline on the golf course (poor connectivity) while
 * preserving real-time Firebase scoring.
 *
 * Caching strategies (by asset type):
 *   - HTML pages ............ network-first  (always latest when online; cache fallback offline)
 *   - App JS / CSS .......... stale-while-revalidate (instant load, refreshes in background)
 *   - Images / sounds ....... cache-first    (rarely change; cached on demand)
 *   - Firebase SDK (gstatic) cache-first    (version-pinned URL, never changes)
 *   - Google Fonts .......... cache-first    (stable)
 *   - Firestore API traffic . PASSTHROUGH    (the SDK manages its own offline queue)
 *
 * Deploy workflow: just merge to main. HTML is network-first and JS/CSS are
 * stale-while-revalidate, so new deploys reach users automatically with no
 * manual version bumping required.
 */

// Bump only if you change the precache list / strategies below. Normal content
// deploys do NOT require changing this.
const CACHE_VERSION = 'v1';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// Core app-shell files to precache on install so the very first offline load
// works. Paths are relative so this works on any GitHub Pages path.
const PRECACHE_URLS = [
  './',
  './index.html',
  './live-scores.html',
  './rounds.html',
  './admin.html',
  './styles.css',
  './styles-part2.css',
  './styles-part3.css',
  './crypto-utils.js',
  './firebase-init.js',
  './admin-tap.js',
  './live-scores.js',
  './rounds.js',
  './admin.js',
  './courses/course-data.js',
  './manifest.json',
  './images/bonville-logo.jpg',
  './images/no-image-available.jpg',
  './sounds/snake-hiss-laugh.mp3',
  './sounds/you-suck-jackass.mp3'
];

// ---------------------------------------------------------------------------
// Install: precache the app shell.
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // addAll is atomic; if one fails nothing is cached. Use individual adds
      // so a single missing optional asset doesn't break the whole install.
      Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('[SW] Precache failed for', url, err);
          })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ---------------------------------------------------------------------------
// Activate: clean up old caches and take control immediately.
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// Helpers to classify requests.
// ---------------------------------------------------------------------------
function isFirestoreTraffic(url) {
  return (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') && url.pathname.includes('firestore')
  );
}

function isFirebaseSdk(url) {
  return url.hostname === 'www.gstatic.com' && url.pathname.includes('/firebasejs/');
}

function isGoogleFonts(url) {
  return (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  );
}

function isImageOrSound(url) {
  return /\.(jpe?g|png|gif|webp|svg|mp3|wav|ogg)$/i.test(url.pathname);
}

function isAppScriptOrStyle(url, sameOrigin) {
  return sameOrigin && /\.(js|css)$/i.test(url.pathname);
}

function isHtmlRequest(request, url, sameOrigin) {
  return (
    request.mode === 'navigate' ||
    (sameOrigin && /\.html?$/i.test(url.pathname)) ||
    (sameOrigin && (url.pathname === '/' || url.pathname.endsWith('/')))
  );
}

// ---------------------------------------------------------------------------
// Caching strategy implementations.
// ---------------------------------------------------------------------------
async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Last resort for navigations: serve index so the SPA-ish app can boot.
    const fallback = await cache.match('./index.html');
    if (fallback) return fallback;
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  return cached || networkPromise || fetch(request);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // For images, fall back to the bundled "no image available" placeholder.
    if (isImageOrSound(new URL(request.url))) {
      const placeholder = await caches.match('./images/no-image-available.jpg');
      if (placeholder) return placeholder;
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Fetch router.
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests; never interfere with writes/POSTs.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Let Firestore manage its own offline persistence — do not touch its traffic.
  if (isFirestoreTraffic(url)) return;

  // Firebase SDK (version-pinned on gstatic) -> cache-first.
  if (isFirebaseSdk(url)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // Google Fonts (CSS + font files) -> cache-first.
  if (isGoogleFonts(url)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // HTML pages / navigations -> network-first.
  if (isHtmlRequest(request, url, sameOrigin)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // App JS / CSS -> stale-while-revalidate.
  if (isAppScriptOrStyle(url, sameOrigin)) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  // Images & sounds (same-origin) -> cache-first, cached on demand.
  if (sameOrigin && isImageOrSound(url)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // Everything else: try network, fall back to cache if present.
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ---------------------------------------------------------------------------
// Allow pages to ask the SW to pre-cache a list of URLs (e.g. the active
// course's hole images when a round starts).
// ---------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'PRECACHE_URLS' && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) =>
        Promise.all(
          data.urls.map((u) =>
            cache.match(u).then((hit) =>
              hit ? null : cache.add(new Request(u, { mode: 'no-cors' })).catch(() => {})
            )
          )
        )
      )
    );
  }
});
