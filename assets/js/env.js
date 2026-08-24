/**
 * Environment detection — must be loaded in <head> before first paint.
 * Adds 'is-prod' class to <html> on production hostname.
 * All feature gating depends on this class.
 *
 * Local prod-simulation switch: `?prod=1` in the URL simulates the
 * production experience on localhost (persisted via localStorage under
 * `dp-simulate-prod` so it survives navigation); `?prod=0` turns it back
 * off and clears the persisted flag.
 *
 * ONE-DIRECTIONAL RULE — this is load-bearing for privacy, not just UX:
 * `data-prod-hide` + the `.is-prod` CSS rule are the only thing keeping
 * unfinished/private content off the public site. The simulation switch
 * may therefore only ever ADD the 'is-prod' class. It must never remove
 * or suppress it when the real hostname IS a production host, because
 * that would let a mere query string unhide private content for any
 * visitor on the real domain.
 *
 * How this is enforced: the real-hostname check runs first, entirely on
 * its own, and unconditionally sets the class before anything else
 * executes. On a real prod hostname the function returns immediately
 * after — the simulation block (query param + localStorage) never runs
 * at all, so no param and no stored value can ever change anything there.
 * The simulation block only runs on non-prod hostnames, is wrapped in
 * try/catch (localStorage can throw in some privacy modes) so a throw
 * cannot ripple back up, and the only DOM mutation it ever performs is
 * `classList.add('is-prod')` — this file contains no `classList.remove`
 * of that class anywhere, on any path.
 */
(function() {
  const PROD_HOSTS = ['edwardstone.design', 'www.edwardstone.design'];
  const SIMULATE_KEY = 'dp-simulate-prod';
  const isRealProd = PROD_HOSTS.includes(location.hostname);

  if (isRealProd) {
    document.documentElement.classList.add('is-prod');
    return; // Real prod: simulation logic below never runs. Fully inert.
  }

  // Non-prod hostname only. Best-effort — a throw here (e.g. localStorage
  // blocked) can only mean the simulation doesn't apply, never that it
  // removes anything, since real prod already returned above.
  try {
    const params = new URLSearchParams(location.search);
    const prodParam = params.get('prod');

    if (prodParam === '1') {
      localStorage.setItem(SIMULATE_KEY, '1');
    } else if (prodParam === '0') {
      localStorage.removeItem(SIMULATE_KEY);
    }

    if (localStorage.getItem(SIMULATE_KEY) === '1') {
      document.documentElement.classList.add('is-prod');
    }
  } catch (e) {
    // Ignore — simulation is a local dev convenience only.
  }
})();
