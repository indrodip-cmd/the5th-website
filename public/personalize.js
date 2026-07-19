/* ══════════════════════════════════════════════════════════════════
   The5th — site-wide personalization layer (framework-free, device-scoped)

   Once Carolina (the AI concierge) learns a visitor's name, the whole site
   can greet them by it — headlines, eyebrows, CTAs — so the experience feels
   made for THEM. Name is stored per-device in localStorage, so a visitor who
   returns 7 days later on the same device is still remembered.

   How to personalize any element (works on static + React pages):
     <h1 data-p-tpl="{name}, here's your proof."
         data-p-anon="Real coaches. Real revenue.">…</h1>
       → shows the {name} version when known, the anon version otherwise.
     <span data-p-name data-p-anon="there">friend</span>
       → replaced with the first name (or the fallback).

   Real-time: listens for the `the5th:identified` event Carolina fires the
   moment she captures a name, and re-applies instantly — no reload.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var NAME_KEYS = ['the5th_first_name', 'cw_lead_name'];
  var VISITS_KEY = 'the5th_carolina_visits';
  var CHIP_FLAG = 'the5th_p_chip_shown';

  function firstName() {
    try {
      if (window.The5thVisitor && window.The5thVisitor.firstName) return window.The5thVisitor.firstName;
      for (var i = 0; i < NAME_KEYS.length; i++) {
        var v = localStorage.getItem(NAME_KEYS[i]);
        if (v && v.trim()) return v.trim().split(' ')[0];
      }
    } catch (e) {}
    return '';
  }
  function isReturning() {
    try { return (parseInt(localStorage.getItem(VISITS_KEY) || '0', 10) || 0) > 1; } catch (e) { return false; }
  }
  function esc(s) { return String(s == null ? '' : s); }

  // Apply personalization to every marked element on the page.
  function apply() {
    var name = firstName();
    try { document.documentElement.setAttribute('data-known', name ? 'yes' : 'no'); } catch (e) {}
    window.The5thVisitor = Object.assign(window.The5thVisitor || {}, { firstName: name || null });

    // Templated content: data-p-tpl uses {name}; data-p-anon is the fallback.
    var tpls = document.querySelectorAll('[data-p-tpl]');
    for (var i = 0; i < tpls.length; i++) {
      var el = tpls[i];
      var tpl = el.getAttribute('data-p-tpl') || '';
      var anon = el.getAttribute('data-p-anon');
      if (name) el.textContent = tpl.replace(/\{name\}/g, name);
      else if (anon != null) el.textContent = anon;
    }
    // Simple name slots: data-p-name → the first name (or data-p-anon fallback).
    var slots = document.querySelectorAll('[data-p-name]');
    for (var j = 0; j < slots.length; j++) {
      var s = slots[j];
      var fb = s.getAttribute('data-p-anon');
      if (name) s.textContent = name;
      else if (fb != null) s.textContent = fb;
    }
  }

  // A quiet, premium "welcome back" chip for returning, known visitors.
  function maybeChip() {
    var name = firstName();
    if (!name || !isReturning()) return;
    try { if (sessionStorage.getItem(CHIP_FLAG)) return; sessionStorage.setItem(CHIP_FLAG, '1'); } catch (e) {}
    if (document.getElementById('t5-welcome')) return;

    if (!document.getElementById('t5-p-style')) {
      var st = document.createElement('style');
      st.id = 't5-p-style';
      st.textContent =
        '#t5-welcome{position:fixed;left:50%;top:18px;transform:translate(-50%,-16px);z-index:2147483000;' +
        'display:flex;align-items:center;gap:10px;padding:10px 18px;border-radius:999px;' +
        'background:linear-gradient(135deg,#3D2645,#2E1A35);color:#fff;font:600 14px/1.2 Inter,system-ui,sans-serif;' +
        'box-shadow:0 16px 40px -14px rgba(35,16,41,.6);border:1px solid rgba(201,168,76,.4);' +
        'opacity:0;transition:opacity .5s ease,transform .5s cubic-bezier(.22,1,.36,1);max-width:92vw}' +
        '#t5-welcome.show{opacity:1;transform:translate(-50%,0)}' +
        '#t5-welcome .t5-dot{width:8px;height:8px;border-radius:50%;background:#C9A84C;box-shadow:0 0 0 4px rgba(201,168,76,.22);flex:0 0 auto}' +
        '#t5-welcome b{color:#E4C879;font-weight:700}' +
        '@media (prefers-reduced-motion:reduce){#t5-welcome{transition:opacity .3s}}';
      document.head.appendChild(st);
    }
    var chip = document.createElement('div');
    chip.id = 't5-welcome';
    chip.setAttribute('role', 'status');
    chip.innerHTML = '<span class="t5-dot"></span><span>Welcome back, <b>' + esc(name) + '</b> — good to see you again.</span>';
    document.body.appendChild(chip);
    requestAnimationFrame(function () { chip.classList.add('show'); });
    setTimeout(function () {
      chip.classList.remove('show');
      setTimeout(function () { if (chip.parentNode) chip.remove(); }, 600);
    }, 4200);
  }

  function run() { try { apply(); maybeChip(); } catch (e) {} }

  // Re-apply the instant Carolina identifies the visitor, and on load.
  window.addEventListener('the5th:identified', function () { try { apply(); } catch (e) {} });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  // Expose for React pages that want to read/subscribe directly.
  window.The5thPersonalize = { firstName: firstName, apply: apply };
})();
