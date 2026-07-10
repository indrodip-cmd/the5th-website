/* The5th first-party analytics tracker.
   Records pageviews, max scroll depth, and conversions into /api/track.
   Loaded on every page (static marketing HTML + the Next app). Zero deps,
   fail-soft: never throws into the page. */
(function () {
  var ENDPOINT = '/api/track';

  function uid() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return String(Date.now()) + Math.random().toString(36).slice(2);
  }
  function persist(store, key) {
    try {
      var v = store.getItem(key);
      if (!v) { v = uid(); store.setItem(key, v); }
      return v;
    } catch (e) { return 'anon'; }
  }

  var visitorId = persist(window.localStorage, 'a5_vid');   // stable across sessions
  var sessionId = persist(window.sessionStorage, 'a5_sid'); // per browser session

  // First-touch attribution: captured once, persisted, never overwritten.
  function param(name) { try { return new URLSearchParams(location.search).get(name) || ''; } catch (e) { return ''; } }
  var firstTouch = (function () {
    try {
      var saved = window.localStorage.getItem('a5_ft');
      if (saved) return JSON.parse(saved);
      var ft = {
        utm_source: param('utm_source'), utm_medium: param('utm_medium'), utm_campaign: param('utm_campaign'),
        utm_content: param('utm_content'), utm_term: param('utm_term'),
        landing: location.pathname, referrer: document.referrer || ''
      };
      window.localStorage.setItem('a5_ft', JSON.stringify(ft));
      return ft;
    } catch (e) { return {}; }
  })();

  var maxScroll = 0;
  var scrollSent = false;
  var currentPath = location.pathname;
  var CONVERSION_PATHS = ['/quiz/thank-you', '/quiz/results', '/results'];

  function send(payload) {
    payload.visitor_id = visitorId;
    payload.session_id = sessionId;
    payload.path = payload.path || location.pathname;
    payload.referrer = document.referrer || '';
    var data = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([data], { type: 'text/plain' }));
        return;
      }
    } catch (e) {}
    try {
      fetch(ENDPOINT, { method: 'POST', body: data, keepalive: true, headers: { 'Content-Type': 'text/plain' } });
    } catch (e) {}
  }

  function computeScroll() {
    var doc = document.documentElement;
    var body = document.body || {};
    var scrollTop = window.pageYOffset || doc.scrollTop || 0;
    var viewport = window.innerHeight || doc.clientHeight || 0;
    var full = Math.max(doc.scrollHeight || 0, body.scrollHeight || 0, doc.offsetHeight || 0);
    if (full <= viewport) return 100; // whole page fits on screen
    var pct = Math.round(((scrollTop + viewport) / full) * 100);
    return Math.max(0, Math.min(100, pct));
  }

  function onScroll() {
    var pct = computeScroll();
    if (pct > maxScroll) maxScroll = pct;
  }

  function flushScroll() {
    if (scrollSent) return;
    scrollSent = true;
    if (maxScroll === 0) maxScroll = computeScroll();
    send({ event_type: 'scroll', scroll_pct: maxScroll, path: currentPath });
  }

  function maybeConversion(path) {
    if (CONVERSION_PATHS.indexOf(path) === -1) return;
    try {
      var key = 'a5_conv_' + path;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch (e) {}
    send({ event_type: 'conversion', path: path, meta: { page: path } });
  }

  function pageview(path) {
    currentPath = path || location.pathname;
    maxScroll = 0;
    scrollSent = false;
    send({
      event_type: 'pageview', path: currentPath,
      utm_source: firstTouch.utm_source, utm_medium: firstTouch.utm_medium, utm_campaign: firstTouch.utm_campaign,
      utm_content: firstTouch.utm_content, utm_term: firstTouch.utm_term, landing: firstTouch.landing
    });
    maybeConversion(currentPath);
  }

  // Initial pageview for this page load.
  pageview(location.pathname);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flushScroll();
  });
  window.addEventListener('pagehide', flushScroll);

  // For single-page (Next app) navigations: flush the old page, then track new.
  window.__a5trackPage = function (path) {
    flushScroll();
    pageview(path);
  };

  // Identity hooks: expose the stable visitor id + a one-line identify helper so
  // the chatbot / quiz / forms can link an anonymous visitor to a known contact.
  window.__a5vid = visitorId;
  window.__a5identify = function (email, name) {
    if (!email) return;
    try {
      fetch('/api/identify', {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: visitorId, email: email, name: name || '' })
      });
    } catch (e) {}
  };
})();
