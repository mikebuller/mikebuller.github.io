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

  // --- Offline status banner ------------------------------------------------
  var onlineHideTimer = null;

  function ensureBanner() {
    var existing = document.getElementById('offline-banner');
    if (existing) return existing;
    var banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML =
      '<span class="offline-banner__dot"></span>' +
      '<span class="offline-banner__text"></span>';
    document.body.appendChild(banner);
    return banner;
  }

  function setBannerText(banner, text) {
    var textEl = banner.querySelector('.offline-banner__text');
    if (textEl) textEl.textContent = text;
  }

  function showOffline(banner) {
    if (onlineHideTimer) { clearTimeout(onlineHideTimer); onlineHideTimer = null; }
    banner.classList.remove('offline-banner--online');
    banner.classList.add('offline-banner--offline');
    setBannerText(banner, 'Offline! Scores are saved and will sync when back online.');
    banner.classList.add('offline-banner--visible');
  }

  function showOnline(banner) {
    banner.classList.remove('offline-banner--offline');
    banner.classList.add('offline-banner--online');
    setBannerText(banner, 'Online! Scores are syncing.');
    banner.classList.add('offline-banner--visible');
    // Auto-hide the "Online" confirmation after a few seconds.
    if (onlineHideTimer) clearTimeout(onlineHideTimer);
    onlineHideTimer = setTimeout(function () {
      banner.classList.remove('offline-banner--visible');
    }, 4000);
  }

  // initial=true on first load so we don't flash "Back online" on a normal load.
  function updateOnlineStatus(initial) {
    var banner = ensureBanner();
    if (navigator.onLine) {
      if (initial) {
        banner.classList.remove('offline-banner--visible');
      } else {
        showOnline(banner);
      }
    } else {
      showOffline(banner);
    }
  }

  window.addEventListener('online', function () { updateOnlineStatus(false); });
  window.addEventListener('offline', function () { updateOnlineStatus(false); });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { updateOnlineStatus(true); });
  } else {
    updateOnlineStatus(true);
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
