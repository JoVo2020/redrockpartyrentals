// Records the visitor's very first traffic source in localStorage['Source'].
// Never overwrites an existing value, so the first touch is kept.
(function () {
  try {
    if (localStorage.getItem('Source')) return;

    const params = new URLSearchParams(window.location.search);
    const utm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']
      .map(key => (params.get(key) || '').trim())
      .filter(Boolean);

    let source = null;

    if (utm.length) {
      source = utm.join(' ');
    } else if (params.get('gclid')) {
      source = 'google cpc';
    } else if (document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, '');
      // Internal navigation: first source is unknown, so leave it unset
      if (host.endsWith('redrockpartyrentals.com')) return;
      source = host;
    } else {
      source = 'direct';
    }

    localStorage.setItem('Source', source.slice(0, 255));
  } catch (err) {
    console.warn('Source tracking failed', err);
  }
})();
