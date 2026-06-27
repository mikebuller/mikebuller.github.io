/*
 * PWA bootstrap for The Bonville G.C. Invitational
 * ------------------------------------------------
 * - Registers the service worker (offline app shell).
 * - Shows a subtle offline banner so players know scores are queued.
 * - Exposes window.precacheCourseImages(courseFolder) so a course's hole
 *   images can be cached when a round starts.
 *
 * Loaded as a plain (non-module) script on every page.
 */
(function () {
  'use strict';

  // --- Register the service worker -----------------------------------------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').then(function (reg) {
        console.log('[PWA] Service worker registered, scope:', reg.scope);
      }).catch(function (err) {
        console.warn('[PWA] Service worker registration failed:', err);
      });
    });
  }

  // --- Connectivity status banner ------------------------------------------
  var AUTO_HIDE_MS = 4000;
  var hideTimer = null;

  function ensureBanner() {
    var existing = document.getElementById('offline-banner');
    if (existing) return existing;
    var banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML =
      '<span class="offline-banner__dot"></span>' +
      '<span class="offline-banner__title"></span>' +
      '<span class="offline-banner__detail"></span>' +
      '<span class="offline-banner__hint">Tap to dismiss</span>';
    // Tap anywhere on the banner to dismiss it.
    banner.addEventListener('click', function () { dismissBanner(banner); });
    document.body.appendChild(banner);
    return banner;
  }

  function setBannerText(banner, title, detail) {
    var titleEl = banner.querySelector('.offline-banner__title');
    var detailEl = banner.querySelector('.offline-banner__detail');
    if (titleEl) titleEl.textContent = title;
    if (detailEl) detailEl.textContent = detail;
  }

  function dismissBanner(banner) {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    banner.classList.remove('offline-banner--visible');
  }

  function scheduleAutoHide(banner) {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      banner.classList.remove('offline-banner--visible');
    }, AUTO_HIDE_MS);
  }

  // Persistent state on <body> so the current player's leaderboard tile can
  // show red (offline) / green (online) even after the message is dismissed.
  function setBodyConnectivity(isOnline) {
    document.body.classList.toggle('app-offline', !isOnline);
    document.body.classList.toggle('app-online', isOnline);
  }

  function showOffline(banner) {
    banner.classList.remove('offline-banner--online');
    banner.classList.add('offline-banner--offline');
    setBannerText(
      banner,
      'Offline',
      'Your scores are saved and will sync when you\u2019re back online.'
    );
    banner.classList.add('offline-banner--visible');
    scheduleAutoHide(banner);
  }

  function showOnline(banner) {
    banner.classList.remove('offline-banner--offline');
    banner.classList.add('offline-banner--online');
    setBannerText(banner, 'Online', 'Your scores are syncing.');
    banner.classList.add('offline-banner--visible');
    scheduleAutoHide(banner);
  }

  // React to a genuine connectivity *change* (driven by real online/offline
  // events). Always updates the persistent body state and shows the banner.
  function handleConnectivityChange() {
    var banner = ensureBanner();
    var online = navigator.onLine;
    setBodyConnectivity(online);
    if (online) {
      showOnline(banner);
    } else {
      showOffline(banner);
    }
  }

  // On first load we must NOT show the banner based on navigator.onLine alone:
  // it is unreliable immediately after a page load/navigation (it often reads
  // false for a moment while the connection/service worker spins up), which
  // caused the offline message to flash on every round entry/exit even when
  // online. So on load we only set the persistent body state. If it still
  // reports offline after a short grace period, we then show the offline
  // message (a genuine offline-at-load case).
  function initConnectivity() {
    ensureBanner();
    setBodyConnectivity(navigator.onLine);
    if (!navigator.onLine) {
      setTimeout(function () {
        if (!navigator.onLine) {
          setBodyConnectivity(false);
          showOffline(ensureBanner());
        }
      }, 2500);
    }
  }

  window.addEventListener('online', handleConnectivityChange);
  window.addEventListener('offline', handleConnectivityChange);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConnectivity);
  } else {
    initConnectivity();
  }

  // --- Pre-cache a course's hole images ------------------------------------
  // Call when a round starts so all 18 holes for that course are available
  // offline. Pass the course display name (e.g. 'Bonville Golf Resort'); it
  // uses getHoleImagePath() from course-data.js to resolve the real image
  // paths, so it works even when a course's folder name differs from its name.
  window.precacheCourseImages = function (courseName) {
    if (!courseName) return;
    if (typeof getHoleImagePath !== 'function') return;
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
    var urls = [];
    for (var i = 1; i <= 18; i++) {
      var path = getHoleImagePath(courseName, i);
      if (path) {
        urls.push('./' + String(path).replace(/^\.?\//, ''));
      }
    }
    if (urls.length) {
      navigator.serviceWorker.controller.postMessage({ type: 'PRECACHE_URLS', urls: urls });
    }
  };
})();
