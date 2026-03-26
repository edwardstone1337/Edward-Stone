/**
 * Environment detection — must be loaded in <head> before first paint.
 * Adds 'is-prod' class to <html> on production hostname.
 * All feature gating depends on this class.
 */
(function() {
  const PROD_HOSTS = ['edwardstone.design', 'www.edwardstone.design'];
  if (PROD_HOSTS.includes(location.hostname)) {
    document.documentElement.classList.add('is-prod');
  }
})();
