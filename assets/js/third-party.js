(function () {
  var prodHosts = ['edwardstone.design', 'www.edwardstone.design'];
  if (prodHosts.indexOf(location.hostname) === -1) return;

  // --- GA4 ---
  var gaId = 'G-6MPMYG36LE';
  var gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', gaId);

  // --- Hotjar ---
  (function (h, o, t, j, a, r) {
    h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments); };
    h._hjSettings = { hjid: 6677072, hjsv: 6 };
    a = o.getElementsByTagName('head')[0];
    r = o.createElement('script'); r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
})();
