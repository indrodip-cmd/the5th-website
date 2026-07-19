/* ══════════════════════════════════════════════════════════════════
   The5th — Presence Engine (framework-free, device-scoped)

   Makes the whole site feel like it KNOWS the visitor: it quietly remembers
   who they are and their journey across visits, greets returning visitors by
   name, and offers to pick up the conversation right where they left off —
   two-way, not a static page. Everything is additive and guarded; if anything
   fails it degrades silently and the site is unaffected.

   Personalize any element (static or React):
     <h1 data-p-tpl="{name}, here's your proof." data-p-anon="Real results.">…</h1>
     <span data-p-name data-p-anon="there">friend</span>
     <span data-p-greet></span>            → "Good evening" (or "Good evening, Martina")

   Events: fires `the5th:visitor` when ready; listens for `the5th:identified`
   (Carolina / the access gate) and re-applies instantly. Opens the concierge
   via the `the5th:invite` event.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var LSKEY = 'the5th_visitor_v1';
  var NAME_KEYS = ['the5th_first_name', 'cw_lead_name'];
  var SESS_FLAG = 'the5th_presence_sess';
  var RIBBON_FLAG = 'the5th_presence_ribbon';
  var DAY = 86400000;

  // Pages where we stay out of the way (clean single-path funnels).
  function isQuietPage() {
    try { var p = location.pathname; return p.indexOf('/lp/') === 0 || p.indexOf('/event/') === 0 || p.indexOf('/checkout') === 0 || /checkout/.test(p); } catch (e) { return false; }
  }
  function jget() { try { return JSON.parse(localStorage.getItem(LSKEY) || '{}') || {}; } catch (e) { return {}; } }
  function jset(v) { try { localStorage.setItem(LSKEY, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s); }
  function firstName() {
    try {
      if (window.The5thVisitor && window.The5thVisitor.firstName) return window.The5thVisitor.firstName;
      for (var i = 0; i < NAME_KEYS.length; i++) { var v = localStorage.getItem(NAME_KEYS[i]); if (v && v.trim()) return v.trim().split(' ')[0]; }
    } catch (e) {}
    return '';
  }
  function timeGreet() { var h = new Date().getHours(); return h < 12 ? 'Good morning' : (h < 18 ? 'Good afternoon' : 'Good evening'); }

  // ── Journey memory ─────────────────────────────────────────────
  var v = jget();
  var t = Date.now();
  var path = (function () { try { return location.pathname; } catch (e) { return '/'; } })();
  var newSession = false;
  try { if (!sessionStorage.getItem(SESS_FLAG)) { sessionStorage.setItem(SESS_FLAG, '1'); newSession = true; } } catch (e) {}

  v.firstSeen = v.firstSeen || t;
  if (newSession) {
    v.visitCount = (v.visitCount || 0) + 1;
    v.prevSeen = v.lastSeen || t;           // when we last saw them (previous session)
    v.returnTo = v.currentPage || null;      // the page they were last on
  }
  v.currentPage = path;
  v.lastSeen = t;
  v.pages = v.pages || [];
  if (v.pages[v.pages.length - 1] !== path) { v.pages.push(path); if (v.pages.length > 25) v.pages.shift(); }
  var fn = firstName(); if (fn) v.firstName = fn;
  try { var em = localStorage.getItem('cw_lead_email'); if (em) v.email = em; } catch (e) {}
  jset(v);
  window.The5thVisitor = Object.assign(window.The5thVisitor || {}, v, { firstName: v.firstName || null });

  var daysAway = v.prevSeen ? Math.floor((t - v.prevSeen) / DAY) : 0;
  var returning = (v.visitCount || 0) > 1;

  // ── Apply name/greeting to marked elements ─────────────────────
  function apply() {
    var name = firstName();
    try { document.documentElement.setAttribute('data-known', name ? 'yes' : 'no'); document.documentElement.setAttribute('data-returning', returning ? 'yes' : 'no'); } catch (e) {}
    var i, el;
    var tpls = document.querySelectorAll('[data-p-tpl]');
    for (i = 0; i < tpls.length; i++) { el = tpls[i]; var tpl = el.getAttribute('data-p-tpl') || '', anon = el.getAttribute('data-p-anon'); if (name) el.textContent = tpl.replace(/\{name\}/g, name); else if (anon != null) el.textContent = anon; }
    var slots = document.querySelectorAll('[data-p-name]');
    for (i = 0; i < slots.length; i++) { el = slots[i]; var fb = el.getAttribute('data-p-anon'); if (name) el.textContent = name; else if (fb != null) el.textContent = fb; }
    var greets = document.querySelectorAll('[data-p-greet]');
    for (i = 0; i < greets.length; i++) { greets[i].textContent = timeGreet() + (name ? ', ' + name : ''); }
  }

  // ── Premium "remember me" ribbon (returning known visitors) ────
  function ensureStyle() {
    if (document.getElementById('t5-p-style')) return;
    var st = document.createElement('style'); st.id = 't5-p-style';
    st.textContent =
      '#t5-rib{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translate(-50%,20px);z-index:2147482900;max-width:min(94vw,440px);' +
      'display:flex;align-items:center;gap:12px;padding:12px 14px 12px 16px;border-radius:16px;' +
      'background:linear-gradient(135deg,#3D2645,#2E1A35);color:#fff;font:400 13.5px/1.35 Inter,system-ui,sans-serif;' +
      'box-shadow:0 22px 55px -18px rgba(35,16,41,.7);border:1px solid rgba(201,168,76,.38);' +
      'opacity:0;transition:opacity .5s ease,transform .55s cubic-bezier(.22,1,.36,1)}' +
      '#t5-rib.show{opacity:1;transform:translate(-50%,0)}' +
      '#t5-rib .t5-av{width:34px;height:34px;border-radius:50%;flex:0 0 auto;background:linear-gradient(180deg,#E4C879,#B0902F);color:#2E1A35;font:700 15px Inter;display:flex;align-items:center;justify-content:center}' +
      '#t5-rib .t5-tx{flex:1;min-width:0}#t5-rib .t5-tx b{color:#E4C879;font-weight:700}#t5-rib .t5-tx i{font-style:normal;opacity:.82;display:block;font-size:12px;margin-top:1px}' +
      '#t5-rib .t5-go{flex:0 0 auto;background:linear-gradient(180deg,#E4C879,#C9A84C 60%,#B0902F);color:#2E1A35;border:none;border-radius:999px;padding:8px 14px;font:700 12.5px Inter;cursor:pointer;white-space:nowrap}' +
      '#t5-rib .t5-x{flex:0 0 auto;background:none;border:none;color:rgba(255,255,255,.6);font-size:18px;line-height:1;cursor:pointer;padding:2px 4px}' +
      // On phones, dock to the TOP so it never overlaps Carolina's launcher.
      '@media(max-width:480px){#t5-rib{left:12px;right:12px;bottom:auto;top:calc(12px + env(safe-area-inset-top));transform:translateY(-20px);max-width:none}#t5-rib.show{transform:translateY(0)}#t5-rib .t5-tx i{display:none}}' +
      '@media(prefers-reduced-motion:reduce){#t5-rib{transition:opacity .3s}}';
    document.head.appendChild(st);
  }
  function ribbon() {
    var name = firstName();
    if (!name || !returning || isQuietPage()) return;
    try { if (sessionStorage.getItem(RIBBON_FLAG)) return; sessionStorage.setItem(RIBBON_FLAG, '1'); } catch (e) {}
    if (document.getElementById('t5-rib')) return;
    ensureStyle();

    var sub = daysAway >= 1 ? ("It's been " + daysAway + (daysAway === 1 ? ' day' : ' days') + '. Welcome back.') : 'Good to see you again.';
    var rib = document.createElement('div');
    rib.id = 't5-rib'; rib.setAttribute('role', 'status');
    rib.innerHTML =
      '<span class="t5-av">' + esc(name.charAt(0).toUpperCase()) + '</span>' +
      '<span class="t5-tx"><b>' + timeGreet() + ', ' + esc(name) + '</b><i>' + esc(sub) + '</i></span>' +
      '<button class="t5-go" type="button">Pick up where we left off</button>' +
      '<button class="t5-x" type="button" aria-label="Dismiss">×</button>';
    document.body.appendChild(rib);
    requestAnimationFrame(function () { rib.classList.add('show'); });

    var hideT = setTimeout(hide, 9000);
    function hide() { clearTimeout(hideT); rib.classList.remove('show'); setTimeout(function () { if (rib.parentNode) rib.remove(); }, 600); }
    rib.querySelector('.t5-x').addEventListener('click', hide);
    rib.querySelector('.t5-go').addEventListener('click', function () {
      hide();
      var seed = "Hi, I'm back. Can we pick up where we left off?";
      try { window.dispatchEvent(new CustomEvent('the5th:invite', { detail: { seed: seed } })); } catch (e) {}
    });
  }

  function run() { try { apply(); } catch (e) {} try { ribbon(); } catch (e) {} }

  window.addEventListener('the5th:identified', function () { try { apply(); } catch (e) {} });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  try { window.dispatchEvent(new CustomEvent('the5th:visitor', { detail: window.The5thVisitor })); } catch (e) {}
  window.The5thPersonalize = { firstName: firstName, apply: apply, visitor: function () { return window.The5thVisitor; } };
})();
