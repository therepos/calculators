/**
 * Shared navigation bar for Finance Calculators
 * Include via <script src="/scripts/nav.js"></script> at end of <body>
 * Injects a sticky top nav with home link + app title
 */
(function () {
  var title = document.title || "Calculator";
  var nav = document.createElement("div");
  nav.id = "calc-nav";
  nav.innerHTML =
    '<a href="/" class="cn-home">\u2190 All Calculators</a>' +
    '<span class="cn-title">' + title + "</span>";

  var style = document.createElement("style");
  style.textContent =
    "#calc-nav{position:sticky;top:0;z-index:9999;display:flex;align-items:center;" +
    "justify-content:space-between;padding:10px 24px;background:#111117;border-bottom:2px solid #FFE600;" +
    "font-family:'DM Sans',system-ui,sans-serif;font-size:12px;-webkit-font-smoothing:antialiased}" +
    "#calc-nav .cn-home{color:#FFE600;text-decoration:none;font-weight:600;letter-spacing:.01em;transition:opacity .15s}" +
    "#calc-nav .cn-home:hover{opacity:.8}" +
    "#calc-nav .cn-title{color:#9e9eaa;font-weight:500;letter-spacing:.02em;" +
    "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:50%}";

  document.head.appendChild(style);
  document.body.insertBefore(nav, document.body.firstChild);
})();
