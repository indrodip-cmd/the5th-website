/* ══════════════════════════════════════════════════════════════════
   The5th Consulting — Cookie / Privacy Consent Banner
   Self-contained, no dependencies. Loads on every page (static
   marketing HTML + Next app routes) via a single <script> tag.

   • Shows once for first-time visitors, remembers the choice.
   • Two views: (1) summary banner, (2) granular "More Information".
   • Categories: Marketing, Functional, Analytics (toggleable) +
     Essential (always on, cannot be disabled).
   • Wires Google Consent Mode (gtag) so choices actually take effect.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'the5th_cookie_consent_v1';
  var CONSENT_VERSION = 1;

  // ── Palette (matches the5th brand tokens) ──
  var C = {
    plum: '#3D2645',
    plumDark: '#2E1A35',
    plumMid: '#4E3158',
    gold: '#C9A84C',
    parchment: '#FAF6F0',
    ink: '#1A1A2E',
    inkMuted: '#8A8075',
    border: 'rgba(255,255,255,0.14)'
  };

  // ── Category definitions ──
  var CATEGORIES = [
    {
      key: 'marketing',
      name: 'Marketing',
      locked: false,
      desc: 'These technologies are used by advertisers to serve ads that are relevant to your interests.'
    },
    {
      key: 'functional',
      name: 'Functional',
      locked: false,
      desc: 'These technologies enable us to analyse usage behavior in order to measure and improve performance.'
    },
    {
      key: 'essential',
      name: 'Essential',
      locked: true,
      desc: 'These technologies are required to activate the core functionality of our service.'
    },
    {
      key: 'analytics',
      name: 'Analytics',
      locked: false,
      desc: 'Tools that help us understand how visitors use our website, such as which pages are visited, how users navigate, and overall site performance. This data is collected anonymously and used to improve the user experience.'
    }
  ];

  // ── Persistence ──
  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.v !== CONSENT_VERSION) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(categories) {
    var payload = {
      v: CONSENT_VERSION,
      ts: new Date().toISOString(),
      categories: {
        marketing: !!categories.marketing,
        functional: !!categories.functional,
        analytics: !!categories.analytics,
        essential: true
      }
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}
    applyConsent(payload.categories);
    window.the5thConsent = payload;
    try {
      window.dispatchEvent(new CustomEvent('the5th:consent', { detail: payload }));
    } catch (e) {}
    return payload;
  }

  // ── Wire Google Consent Mode so the choice actually applies ──
  function applyConsent(cats) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      ad_storage: cats.marketing ? 'granted' : 'denied',
      ad_user_data: cats.marketing ? 'granted' : 'denied',
      ad_personalization: cats.marketing ? 'granted' : 'denied',
      analytics_storage: cats.analytics ? 'granted' : 'denied',
      functionality_storage: cats.functional ? 'granted' : 'denied',
      personalization_storage: cats.functional ? 'granted' : 'denied',
      security_storage: 'granted'
    });
  }

  // ── Styles ──
  function injectStyles() {
    if (document.getElementById('the5th-cc-styles')) return;
    var css = [
      '@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap");',
      '.t5cc-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;padding:20px;background:rgba(20,12,24,0.42);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;transition:opacity .35s ease;font-family:"DM Sans",system-ui,-apple-system,sans-serif;}',
      '.t5cc-overlay.t5cc-show{opacity:1;}',
      '.t5cc-panel{position:relative;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;background:' + C.plumDark + ';color:#F3ECE2;border:1px solid ' + C.border + ';border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,0.45);transform:translateY(24px);transition:transform .38s cubic-bezier(.2,.8,.25,1);-webkit-overflow-scrolling:touch;}',
      '.t5cc-overlay.t5cc-show .t5cc-panel{transform:translateY(0);}',
      '@media(min-width:640px){.t5cc-overlay{align-items:center;}}',
      '.t5cc-inner{padding:28px 30px 26px;}',
      '.t5cc-accent{width:38px;height:3px;background:' + C.gold + ';border-radius:2px;margin-bottom:16px;}',
      '.t5cc-title{font-family:"Cormorant Garamond",Georgia,serif;font-size:27px;line-height:1.15;font-weight:600;letter-spacing:.2px;margin:0 0 12px;color:#FFFDF8;}',
      '.t5cc-body{font-size:14px;line-height:1.62;color:rgba(243,236,226,0.82);font-weight:300;margin:0 0 14px;}',
      '.t5cc-links{font-size:13px;margin:0 0 20px;color:rgba(243,236,226,0.6);}',
      '.t5cc-links a{color:' + C.gold + ';text-decoration:none;border-bottom:1px solid rgba(201,168,76,0.35);padding-bottom:1px;transition:border-color .2s;}',
      '.t5cc-links a:hover{border-color:' + C.gold + ';}',
      '.t5cc-actions{display:flex;flex-wrap:wrap;gap:10px;}',
      '.t5cc-btn{flex:1 1 auto;min-width:120px;font-family:"DM Sans",sans-serif;font-size:13.5px;font-weight:600;letter-spacing:.3px;padding:13px 18px;border-radius:10px;cursor:pointer;border:1px solid transparent;transition:all .2s ease;white-space:nowrap;}',
      '.t5cc-btn-ghost{background:transparent;border-color:rgba(255,255,255,0.22);color:rgba(243,236,226,0.9);}',
      '.t5cc-btn-ghost:hover{border-color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.05);}',
      '.t5cc-btn-primary{background:' + C.gold + ';color:' + C.plumDark + ';border-color:' + C.gold + ';box-shadow:0 6px 18px rgba(201,168,76,0.28);}',
      '.t5cc-btn-primary:hover{background:#d8b95e;box-shadow:0 8px 22px rgba(201,168,76,0.4);}',
      '.t5cc-cats{margin:6px 0 22px;border-top:1px solid rgba(255,255,255,0.1);}',
      '.t5cc-grouplabel{font-size:11px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:' + C.gold + ';margin:20px 0 4px;}',
      '.t5cc-cat{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.08);}',
      '.t5cc-cat-name{font-size:15px;font-weight:600;color:#FFFDF8;margin:0 0 4px;}',
      '.t5cc-cat-desc{font-size:12.5px;line-height:1.55;color:rgba(243,236,226,0.66);font-weight:300;margin:0;}',
      '.t5cc-tog{flex-shrink:0;margin-top:2px;}',
      '.t5cc-switch{position:relative;display:inline-block;width:44px;height:24px;}',
      '.t5cc-switch input{opacity:0;width:0;height:0;position:absolute;}',
      '.t5cc-slider{position:absolute;cursor:pointer;inset:0;background:rgba(255,255,255,0.18);border-radius:24px;transition:.25s;}',
      '.t5cc-slider:before{content:"";position:absolute;height:18px;width:18px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.25s;box-shadow:0 1px 3px rgba(0,0,0,0.35);}',
      '.t5cc-switch input:checked + .t5cc-slider{background:' + C.gold + ';}',
      '.t5cc-switch input:checked + .t5cc-slider:before{transform:translateX(20px);}',
      '.t5cc-switch input:disabled + .t5cc-slider{background:rgba(201,168,76,0.55);cursor:not-allowed;}',
      '.t5cc-locked{font-size:10.5px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:' + C.gold + ';margin-top:6px;text-align:right;}',
      '.t5cc-hide{display:none !important;}',
      '.t5cc-fab{position:fixed;left:16px;bottom:16px;z-index:2147482000;width:42px;height:42px;border-radius:50%;background:' + C.plumDark + ';border:1px solid rgba(201,168,76,0.4);color:' + C.gold + ';cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,0.3);transition:transform .2s;font-size:18px;}',
      '.t5cc-fab:hover{transform:scale(1.08);}',
      '@media(max-width:480px){.t5cc-inner{padding:24px 22px 22px;}.t5cc-title{font-size:24px;}.t5cc-btn{flex-basis:100%;}}'
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'the5th-cc-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── DOM helpers ──
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  var LINKS_HTML =
    '<a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a>';

  // ── Build banner ──
  function buildBanner(existing) {
    injectStyles();

    var overlay = el('div', 't5cc-overlay');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'false');
    overlay.setAttribute('aria-label', 'Privacy settings');

    var panel = el('div', 't5cc-panel');
    var inner = el('div', 't5cc-inner');

    // ─ View 1: Summary ─
    var summary = el('div', 't5cc-view t5cc-summary');
    summary.appendChild(el('div', 't5cc-accent'));
    summary.appendChild(el('h2', 't5cc-title', 'Privacy Settings'));
    summary.appendChild(el('p', 't5cc-body',
      'This site uses third-party website tracking technologies to provide and continually improve our services, and to display advertisements according to users&rsquo; interests. I agree and may revoke or change my consent at any time with effect for the future.'));
    summary.appendChild(el('p', 't5cc-links', LINKS_HTML));

    var sActions = el('div', 't5cc-actions');
    var moreBtn = el('button', 't5cc-btn t5cc-btn-ghost', 'More Information');
    var denyBtn1 = el('button', 't5cc-btn t5cc-btn-ghost', 'Deny');
    var acceptBtn1 = el('button', 't5cc-btn t5cc-btn-primary', 'Accept All');
    sActions.appendChild(moreBtn);
    sActions.appendChild(denyBtn1);
    sActions.appendChild(acceptBtn1);
    summary.appendChild(sActions);

    // ─ View 2: Details ─
    var details = el('div', 't5cc-view t5cc-details t5cc-hide');
    details.appendChild(el('div', 't5cc-accent'));
    details.appendChild(el('h2', 't5cc-title', 'Privacy Settings'));
    details.appendChild(el('p', 't5cc-body',
      'Cookies are small text files that can be used by websites to make a user&rsquo;s experience more efficient. The law states that we can store cookies on your device if they are strictly necessary for the operation of this site. For all other types of cookies we need your permission. This site uses different types of cookies. Some cookies are placed by third party services that appear on our pages.'));
    details.appendChild(el('p', 't5cc-links', LINKS_HTML));

    var catsWrap = el('div', 't5cc-cats');
    catsWrap.appendChild(el('div', 't5cc-grouplabel', 'Categories'));
    catsWrap.appendChild(el('div', 't5cc-grouplabel', 'Services'));

    var toggles = {};
    CATEGORIES.forEach(function (cat) {
      var row = el('div', 't5cc-cat');
      var left = el('div');
      left.appendChild(el('p', 't5cc-cat-name', cat.name));
      left.appendChild(el('p', 't5cc-cat-desc', cat.desc));

      var right = el('div', 't5cc-tog');
      var label = el('label', 't5cc-switch');
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('aria-label', cat.name);
      if (cat.locked) {
        input.checked = true;
        input.disabled = true;
      } else {
        input.checked = existing ? !!existing.categories[cat.key] : false;
      }
      toggles[cat.key] = input;
      label.appendChild(input);
      label.appendChild(el('span', 't5cc-slider'));
      right.appendChild(label);
      if (cat.locked) right.appendChild(el('div', 't5cc-locked', 'Always Active'));

      row.appendChild(left);
      row.appendChild(right);
      catsWrap.appendChild(row);
    });
    details.appendChild(catsWrap);

    var dActions = el('div', 't5cc-actions');
    var saveBtn = el('button', 't5cc-btn t5cc-btn-primary', 'Save Settings');
    var denyBtn2 = el('button', 't5cc-btn t5cc-btn-ghost', 'Deny');
    var acceptBtn2 = el('button', 't5cc-btn t5cc-btn-primary', 'Accept All');
    dActions.appendChild(saveBtn);
    dActions.appendChild(denyBtn2);
    dActions.appendChild(acceptBtn2);
    details.appendChild(dActions);

    inner.appendChild(summary);
    inner.appendChild(details);
    panel.appendChild(inner);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () { overlay.classList.add('t5cc-show'); });

    // ─ Behaviour ─
    function close() {
      overlay.classList.remove('t5cc-show');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        mountReopenButton();
      }, 380);
    }
    function acceptAll() {
      saveConsent({ marketing: true, functional: true, analytics: true });
      close();
    }
    function denyAll() {
      saveConsent({ marketing: false, functional: false, analytics: false });
      close();
    }
    function saveChoices() {
      saveConsent({
        marketing: toggles.marketing.checked,
        functional: toggles.functional.checked,
        analytics: toggles.analytics.checked
      });
      close();
    }

    moreBtn.addEventListener('click', function () {
      summary.classList.add('t5cc-hide');
      details.classList.remove('t5cc-hide');
      panel.scrollTop = 0;
    });
    acceptBtn1.addEventListener('click', acceptAll);
    acceptBtn2.addEventListener('click', acceptAll);
    denyBtn1.addEventListener('click', denyAll);
    denyBtn2.addEventListener('click', denyAll);
    saveBtn.addEventListener('click', saveChoices);
  }

  // ── Small floating button to re-open settings after a choice ──
  function mountReopenButton() {
    if (document.getElementById('the5th-cc-fab')) return;
    injectStyles();
    var fab = el('button', 't5cc-fab', '&#9881;');
    fab.id = 'the5th-cc-fab';
    fab.setAttribute('aria-label', 'Privacy settings');
    fab.setAttribute('title', 'Privacy settings');
    fab.addEventListener('click', function () {
      fab.parentNode && fab.parentNode.removeChild(fab);
      buildBanner(readConsent());
    });
    document.body.appendChild(fab);
  }

  // ── Init ──
  function init() {
    var existing = readConsent();
    if (existing) {
      applyConsent(existing.categories);
      window.the5thConsent = existing;
      mountReopenButton();
    } else {
      buildBanner(null);
    }
  }

  // Expose a manual re-open hook (e.g. footer link -> the5thOpenPrivacy())
  window.the5thOpenPrivacy = function () {
    var fab = document.getElementById('the5th-cc-fab');
    if (fab && fab.parentNode) fab.parentNode.removeChild(fab);
    if (!document.querySelector('.t5cc-overlay')) buildBanner(readConsent());
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
