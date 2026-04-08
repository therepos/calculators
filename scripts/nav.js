/**
 * Shared navigation bar for Finance Calculators
 * Include via <script src="/scripts/nav.js"></script> at end of <body>
 * Injects a fixed top nav with home link + app title
 */
(function () {
  var title = document.title || "Calculator";
  var nav = document.createElement("div");
  nav.id = "calc-nav";
  nav.innerHTML =
    '<a href="/" class="cn-home">← All Calculators</a>' +
    '<span class="cn-title">' + title + "</span>";

  var style = document.createElement("style");
  style.textContent =
    "#calc-nav{position:sticky;top:0;z-index:9999;display:flex;align-items:center;" +
    "justify-content:space-between;padding:8px 20px;background:#1A1A24;border-bottom:2px solid #FFE600;" +
    "font-family:'DM Sans',system-ui,sans-serif;font-size:12px}" +
    "#calc-nav .cn-home{color:#FFE600;text-decoration:none;font-weight:600;letter-spacing:.01em}" +
    "#calc-nav .cn-home:hover{text-decoration:underline}" +
    "#calc-nav .cn-title{color:#A0A0AC;font-weight:500;letter-spacing:.02em}";

  document.head.appendChild(style);
  document.body.insertBefore(nav, document.body.firstChild);
})();
