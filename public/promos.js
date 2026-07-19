/* ══════════════════════════════════════════════════════════════════
   The5th — Homepage Promotions renderer (Patch 3I.5A)
   Framework-free. Fetches CMS promos (/api/homepage/promos) and renders
   premium, generative product artwork (deep violet · gold · glass · glow).
   No hardcoded screenshots — every card is editable from /admin/cms/promos.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__the5thPromos) return; window.__the5thPromos = true;

  var VIOLET = '#3D2645', GOLD = '#C9A84C';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function injectCSS() {
    if (document.getElementById('the5th-promos-css')) return;
    var css = [
      '.t5-promos{--v:' + VIOLET + ';--g:' + GOLD + ';max-width:1200px;margin:0 auto;padding:5.5rem 1.5rem;font-family:inherit;}',
      '.t5-promos__head{text-align:center;max-width:720px;margin:0 auto 3rem;}',
      '.t5-eyebrow{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--g);margin-bottom:14px;}',
      '.t5-promos__title{font-size:clamp(28px,4vw,44px);line-height:1.1;font-weight:800;letter-spacing:-.02em;color:var(--v);margin:0 0 12px;}',
      '.t5-promos__sub{font-size:clamp(15px,2vw,18px);line-height:1.6;color:#5c5360;margin:0;}',
      '.t5-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:22px;}',
      '.t5-card{position:relative;border-radius:24px;overflow:hidden;padding:30px 28px;color:#fff;background:radial-gradient(120% 120% at 12% 0%,rgba(201,168,76,.14),transparent 52%),linear-gradient(158deg,#2A1830 0%,#160D1A 55%,#0D0D0D 100%);border:1px solid rgba(255,255,255,.08);box-shadow:0 30px 70px rgba(24,10,30,.42);display:flex;flex-direction:column;opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1),box-shadow .35s;}',
      '.t5-card.in{opacity:1;transform:none;}',
      '.t5-card:hover{box-shadow:0 40px 90px rgba(24,10,30,.55);transform:translateY(-4px);}',
      '.t5-card::before{content:"";position:absolute;top:-30%;right:-25%;width:70%;height:150%;background:radial-gradient(circle,var(--ca,rgba(201,168,76,.22)),transparent 68%);pointer-events:none;}',
      '.t5-card::after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px);background-size:4px 4px;opacity:.5;pointer-events:none;mix-blend-mode:overlay;}',
      '.t5-card>*{position:relative;z-index:1;}',
      '.t5-badge{position:absolute;top:20px;right:20px;z-index:2;font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1a1206;background:linear-gradient(145deg,var(--ac),#a9862f);padding:5px 11px;border-radius:999px;box-shadow:0 6px 16px rgba(0,0,0,.3);}',
      '.t5-ic{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:25px;color:var(--ac);background:rgba(255,255,255,.05);border:1px solid var(--acb);backdrop-filter:blur(6px);box-shadow:0 6px 20px rgba(0,0,0,.25);margin-bottom:18px;}',
      '.t5-ce{font-size:11.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--ac);margin-bottom:8px;}',
      '.t5-ct{font-size:29px;line-height:1.08;font-weight:800;letter-spacing:-.02em;margin:0 0 6px;background:linear-gradient(120deg,#fff 30%,var(--ac));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}',
      '.t5-cs{font-size:14.5px;color:rgba(255,255,255,.62);margin:0 0 14px;}',
      '.t5-cd{font-size:14px;line-height:1.62;color:rgba(255,255,255,.76);margin:0 0 18px;}',
      '.t5-feat{list-style:none;padding:0;margin:0 0 22px;display:flex;flex-direction:column;gap:9px;}',
      '.t5-feat li{display:flex;align-items:flex-start;gap:10px;font-size:13.5px;line-height:1.4;color:rgba(255,255,255,.85);}',
      '.t5-feat li svg{flex-shrink:0;width:17px;height:17px;margin-top:1px;color:var(--ac);}',
      '.t5-foot{margin-top:auto;display:flex;align-items:center;gap:14px;flex-wrap:wrap;}',
      '.t5-cta{display:inline-flex;align-items:center;gap:8px;font-size:14.5px;font-weight:700;color:#1a1206;background:linear-gradient(145deg,var(--ac),#a9862f);padding:12px 20px;border-radius:14px;text-decoration:none;box-shadow:0 10px 26px var(--acg);transition:transform .18s cubic-bezier(.22,1,.36,1),box-shadow .2s;}',
      '.t5-cta:hover{transform:translateY(-2px);box-shadow:0 16px 34px var(--acg);}',
      '.t5-cta svg{width:15px;height:15px;transition:transform .2s;}.t5-cta:hover svg{transform:translateX(3px);}',
      '.t5-2nd{font-size:13.5px;font-weight:600;color:rgba(255,255,255,.72);text-decoration:none;border-bottom:1px solid rgba(255,255,255,.18);padding-bottom:1px;transition:color .18s,border-color .18s;}',
      '.t5-2nd:hover{color:#fff;border-color:var(--ac);}',
      '.t5-stat{margin-left:auto;text-align:right;}',
      '.t5-stat b{display:block;font-size:17px;font-weight:800;color:#fff;line-height:1;}',
      '.t5-stat i{font-size:10.5px;font-style:normal;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.5);}',
      '.t5-cimg{border-radius:14px;overflow:hidden;margin:-6px 0 18px;border:1px solid rgba(255,255,255,.08);box-shadow:0 14px 34px rgba(0,0,0,.4);}',
      '.t5-cimg img{width:100%;height:auto;display:block;}',
      '@media(max-width:520px){.t5-promos{padding:3.5rem 1.1rem;}.t5-card{padding:26px 22px;}}',
      '@media(prefers-reduced-motion:reduce){.t5-card{opacity:1 !important;transform:none !important;transition:none;}}'
    ].join('\n');
    var s = document.createElement('style'); s.id = 'the5th-promos-css'; s.textContent = css; document.head.appendChild(s);
  }

  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function hexA(hex, a) {
    try { var h = hex.replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
      var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; } catch (e) { return 'rgba(201,168,76,' + a + ')'; }
  }

  function card(p) {
    var ac = p.accent || GOLD;
    var style = '--ac:' + ac + ';--acb:' + hexA(ac, .28) + ';--acg:' + hexA(ac, .28) + ';--ca:' + hexA(ac, .22) + ';';
    if (p.gradient) style += 'background:' + p.gradient + ';';
    var feats = (p.features || []).slice(0, 4).map(function (f) { return '<li>' + CHECK + '<span>' + esc(f) + '</span></li>'; }).join('');
    var img = p.image_url ? '<div class="t5-cimg"><img loading="lazy" src="' + esc(p.image_url) + '" alt="' + esc(p.title) + '"></div>' : '';
    var stat = p.stat_value ? '<div class="t5-stat"><b>' + esc(p.stat_value) + '</b><i>' + esc(p.stat_label || '') + '</i></div>' : '';
    var second = (p.secondary_label && p.secondary_href) ? '<a class="t5-2nd" href="' + esc(p.secondary_href) + '">' + esc(p.secondary_label) + '</a>' : '';
    var cta = p.cta_label ? '<a class="t5-cta" href="' + esc(p.cta_href || '#') + '">' + esc(p.cta_label) + ARROW + '</a>' : '';
    return '<article class="t5-card" style="' + style + '">'
      + (p.badge ? '<span class="t5-badge">' + esc(p.badge) + '</span>' : '')
      + '<div class="t5-ic">' + esc(p.icon || '✦') + '</div>'
      + (p.eyebrow ? '<div class="t5-ce">' + esc(p.eyebrow) + '</div>' : '')
      + '<h3 class="t5-ct">' + esc(p.title) + '</h3>'
      + (p.subtitle ? '<div class="t5-cs">' + esc(p.subtitle) + '</div>' : '')
      + img
      + (p.description ? '<p class="t5-cd">' + esc(p.description) + '</p>' : '')
      + (feats ? '<ul class="t5-feat">' + feats + '</ul>' : '')
      + '<div class="t5-foot">' + cta + second + stat + '</div>'
      + '</article>';
  }

  function reveal(root) {
    var cards = root.querySelectorAll('.t5-card');
    if (!('IntersectionObserver' in window)) { cards.forEach(function (c) { c.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { var el = e.target; setTimeout(function () { el.classList.add('in'); }, (+el.getAttribute('data-i') || 0) * 90); io.unobserve(el); } });
    }, { threshold: 0.15 });
    cards.forEach(function (c) { io.observe(c); });
  }

  function render(container, promos) {
    var products = promos.filter(function (p) { return (p.kind || 'product') === 'product'; });
    if (!products.length) { container.style.display = 'none'; return; }
    injectCSS();
    var head = '<div class="t5-promos__head"><span class="t5-eyebrow">Explore The5th</span>'
      + '<h2 class="t5-promos__title">Everything you need to turn your expertise into income</h2>'
      + '<p class="t5-promos__sub">Choose the path that fits where you are. Each one is built to get you to paying clients faster.</p></div>';
    container.className = 't5-promos';
    container.innerHTML = head + '<div class="t5-grid">' + products.map(card).join('') + '</div>';
    var cs = container.querySelectorAll('.t5-card'); for (var i = 0; i < cs.length; i++) cs[i].setAttribute('data-i', i);
    reveal(container);
  }

  function boot() {
    var container = document.getElementById('the5th-products');
    if (!container) return;   // homepage opts in with <section id="the5th-products">
    fetch('/api/homepage/promos').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (d && d.promos && d.promos.length) render(container, d.promos);
      else container.style.display = 'none';
    }).catch(function () { container.style.display = 'none'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
