/**
 * shared/praxis.js
 * ────────────────────────────────────────────────────────────────────────────
 * Injects consistent Google-style nav bar + Praxis badge into every tool page.
 *
 * Usage — add ONE line anywhere inside each tool page's <head>:
 *
 *   <script src="../shared/praxis.js"></script>
 *
 * That's it. No HTML changes needed. The script:
 *   1. Injects shared/praxis.css
 *   2. Reads the page <title> for the breadcrumb
 *   3. Inserts the nav bar as first child of <body>
 *   4. Appends the Praxis badge to <body>
 *
 * Works over any dark/light background. No dependencies. No build step.
 * ────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ── 1. Resolve path to shared/ folder ─────────────────────────────────── */
  var src = (document.currentScript || {}).src || '';
  var base = src ? src.replace(/\/[^\/]+$/, '/') : '../shared/';

  /* ── 2. Inject stylesheet ───────────────────────────────────────────────── */
  var link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = base + 'praxis.css';
  document.head.appendChild(link);

  /* ── 3. Preload Google Sans (matches homepage font) ─────────────────────── */
  if (!document.querySelector('link[href*="Google+Sans"]') &&
      !document.querySelector('link[href*="google.com/css"]')) {
    var gf = document.createElement('link');
    gf.rel  = 'preconnect';
    gf.href = 'https://fonts.googleapis.com';
    document.head.appendChild(gf);
  }

  /* ── 4. Build nav HTML ──────────────────────────────────────────────────── */
  var title = _esc(document.title || 'Tool');

  var chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  var githubIcon = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';

  var nav = document.createElement('nav');
  nav.className = 'px-nav';
  nav.setAttribute('aria-label', 'Site navigation');
  nav.innerHTML =
    '<a href="../index.html" class="px-nav-back" aria-label="Back to all tools">' +
      chevron + 'All tools' +
    '</a>' +
    '<span class="px-nav-sep" aria-hidden="true">/</span>' +
    '<span class="px-nav-name">' + title + '</span>' +
    '<div class="px-nav-space"></div>' +
    '<div class="px-nav-actions">' +
      '<a href="https://github.com" target="_blank" rel="noopener noreferrer" class="px-nav-icon" title="GitHub" aria-label="View on GitHub">' +
        githubIcon +
      '</a>' +
    '</div>';

  /* ── 5. Build Praxis badge ──────────────────────────────────────────────── */
  var badge = document.createElement('a');
  badge.className = 'px-badge';
  badge.href      = '../index.html';
  badge.innerHTML = '<span class="px-badge-dot"></span>Praxis';

  /* ── 6. Insert when DOM is ready ────────────────────────────────────────── */
  function insert() {
    if (!document.body) return;
    document.body.insertBefore(nav, document.body.firstChild);
    document.body.appendChild(badge);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insert);
  } else {
    insert();
  }

  /* ── Helper ─────────────────────────────────────────────────────────────── */
  function _esc(s) {
    return String(s)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }
})();
