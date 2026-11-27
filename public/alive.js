/* ═══════════════════════════════════════════════════════════════════════
   The5th — Living Layer (framework-free, device-scoped, fail-soft)

   Makes the site behave like it is paying attention to the person using it:
     1. MIND   — remembers, on this device only, what each visitor explores
                 (pages, dwell time, scroll depth, clicks) as interest weights.
     2. GUIDE  — a "next best step" card, with an honest "why", an Ask button
                 that hands the context to the concierge, and a one-click clear.
     3. ADAPT  — re-orders and highlights offers (Resources), and points the
                 header button at the most relevant next step.
     4. FIELD  — a light canvas constellation in hero sections that reacts to
                 the pointer. Pauses off-screen, static for reduced motion.
     5. SIGNAL — reports the chosen next step to the existing first-party event
                 bus so the journey-intelligence dashboards learn from it.

   Nothing leaves the device except the same anonymous /api/track beacons the
   site already sends. Public API: window.The5thMind.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var KEY = 'the5th_mind_v1';
  var DAY = 86400000;
  var path = '/';
  try { path = location.pathname.replace(/\/+$/, '') || '/'; } catch (e) {}

  var QUIET = /^\/(admin|api|event|lp|10k-roadmap|workbook\/success|unsubscribed|privacy|terms|refund|disclaimer|data|california|support|ethics|data-usage)(\/|$)|checkout|^\/quiz(\/|$)/;
  var quiet = QUIET.test(path);

  /* ── offers ─────────────────────────────────────────────────────────── */
  var OFFERS = {
    audit:      { url: '/audit-checkout',  go: 'Book the $29 audit call',        short: 'Book the audit',     ask: 'the $29 Private Business Audit call' },
    collective: { url: '/collective',      go: 'See The Collective · $997/year', short: 'The Collective',     ask: 'The Collective membership', buy: '/collective-checkout', buyGo: 'Join The Collective · $997/year' },
    ff:         { url: '/fast-forward',    go: 'See Fast Forward',               short: 'Fast Forward',       ask: 'Fast Forward 1:1 coaching', buy: '/fast-forward-checkout', buyGo: 'Apply for Fast Forward' },
    ai:         { url: '/ai',              go: 'Try The5th AI free',             short: 'Try The5th AI',      ask: 'The5th AI' },
    book:       { url: '/book',            go: 'Get the ebook · $4.99',          short: 'Get the ebook',      ask: 'the Expertise to Income ebook' },
    research:   { url: '/research',        go: 'Read the latest research',       short: 'Read the research',  ask: 'your research essays' },
    results:    { url: '/results',         go: 'See real client results',        short: 'Client results',     ask: 'client results' },
    resources:  { url: '/resources',       go: 'Browse all resources',          short: 'Resources',          ask: 'our resources' },
    quiz:       { url: '/quiz',            go: 'Find your biggest income blocker', short: 'Find my blocker',  ask: 'the Income Blocker Quiz' }
  };
  function offerOfPath(p) {
    if (/^\/audit-checkout/.test(p)) return 'audit';
    if (/^\/collective/.test(p)) return 'collective';
    if (/^\/fast-forward/.test(p)) return 'ff';
    if (/^\/ai(\/|$)/.test(p)) return 'ai';
    if (/^\/book|^\/workbook/.test(p)) return 'book';
    if (/^\/research/.test(p)) return 'research';
    if (/^\/results/.test(p)) return 'results';
    if (/^\/quiz/.test(p)) return 'quiz';
    return null;
  }
  var here = offerOfPath(path);

  /* ── MIND: storage ──────────────────────────────────────────────────── */
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} }
  var mind = load();
  var now = Date.now();
  mind.w = mind.w || {};            // interest weights by offer
  mind.dis = mind.dis || {};        // dismissed guide offers -> timestamp
  mind.seen = mind.seen || now;
  if (mind.at && now - mind.at > 30 * DAY) { Object.keys(mind.w).forEach(function (k) { mind.w[k] = Math.round(mind.w[k] * 5) / 10; }); }
  mind.at = now;

  function bump(offer, n) {
    if (!offer || !OFFERS[offer]) return;
    mind.w[offer] = Math.min(60, (mind.w[offer] || 0) + n);
    save(mind);
  }
  function profile() { try { return JSON.parse(localStorage.getItem('a5_profile') || 'null'); } catch (e) { return null; } }
  function score(o) { return mind.w[o] || 0; }
  function ranked() {
    return Object.keys(OFFERS).filter(function (k) { return k !== 'quiz' || true; })
      .map(function (k) { return [k, score(k)]; }).sort(function (a, b) { return b[1] - a[1]; });
  }

  /* page view signal (once per load) */
  if (here && !quiet) bump(here, here === 'research' ? 2 : 3);

  /* dwell + scroll signal */
  var visibleTime = 0, lastAct = now, scrolledDeep = false, dwellBumps = 0, maxScroll = 0;
  function act() { lastAct = Date.now(); }
  ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'].forEach(function (ev) { window.addEventListener(ev, act, { passive: true }); });
  window.addEventListener('scroll', function () {
    var d = document.documentElement, h = d.scrollHeight - innerHeight;
    var pct = h > 0 ? (scrollY / h) * 100 : 100;
    if (pct > maxScroll) maxScroll = pct;
    if (!scrolledDeep && pct >= 70 && here && !quiet) { scrolledDeep = true; bump(here, 2); }
  }, { passive: true });
  setInterval(function () {
    if (document.visibilityState !== 'visible' || Date.now() - lastAct > 10000) return;
    visibleTime += 1;
    if (here && !quiet && visibleTime % 15 === 0 && dwellBumps < 6) { dwellBumps++; bump(here, 1); }
    maybeShow();
  }, 1000);

  /* click signal: any link to an offer counts */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) !== '/') return;
    var o = offerOfPath(href.split('?')[0].split('#')[0]);
    if (o && o !== here) bump(o, 2);
  }, true);

  /* ── NEXT BEST STEP ─────────────────────────────────────────────────── */
  function nextStep() {
    var pr = profile(), r = ranked(), top = r[0], t2 = r[1];
    var topKey = top && top[1] >= 3 ? top[0] : null;
    var pick = null, why = '';
    // 1) strongest observed interest wins, unless it is the page already open
    if (topKey && topKey !== here) { pick = topKey; }
    else if (topKey && topKey === here) {
      if (OFFERS[here].buy) { pick = here; }               // they are reading the offer: offer the buy step
      else if (t2 && t2[1] >= 3) { pick = t2[0]; }
    }
    // 2) a known profile points to a person-specific step
    if (!pick && pr && pr.primaryName) { pick = 'audit'; why = 'Built around your main blocker: ' + pr.primaryName.toLowerCase() + '. An hour on your real numbers is the fastest way to move it.'; }
    // 3) nothing learned yet: the best general starting point
    if (!pick) { pick = here === 'quiz' ? 'resources' : 'quiz'; }
    if (pick === here && !OFFERS[pick].buy) return null;
    if (mind.dis[pick] && now - mind.dis[pick] < 7 * DAY) return null;

    var o = OFFERS[pick];
    var buy = pick === here && o.buy;
    if (!why) {
      if (pick === 'quiz') why = 'A good place to start: it takes about four minutes and tells you what to do next.';
      else if (buy) why = 'You have been looking closely at ' + o.ask + '. Here is the step that makes it real.';
      else if (pr && pr.primaryName && (pick === 'audit' || pick === 'collective' || pick === 'ff')) why = 'You have been exploring ' + o.ask + ', and it fits your main blocker: ' + pr.primaryName.toLowerCase() + '.';
      else if (pick === 'research') why = 'You have been reading our research. The newest essay is a good next read.';
      else why = 'You have been exploring ' + o.ask + '. This is the natural next step.';
    }
    return { key: pick, url: buy ? o.buy : o.url, go: buy ? o.buyGo : o.go, short: o.short, why: why, ask: o.ask };
  }

  /* ── GUIDE UI ───────────────────────────────────────────────────────── */
  var shown = false, el = null;
  function style() {
    if (document.getElementById('t5-live-style')) return;
    var s = document.createElement('style'); s.id = 't5-live-style';
    s.textContent =
      '#t5-guide{position:fixed;z-index:2147482800;left:12px;right:12px;top:calc(4.5rem + 10px);max-width:380px;margin:0 auto;padding:16px 16px 14px;border-radius:18px;color:#fff;font:400 14px/1.45 "DM Sans",Inter,system-ui,sans-serif;background:linear-gradient(150deg,#4E3158,#2E1A35 60%,#231029);border:1px solid rgba(201,168,76,.5);box-shadow:0 26px 60px -20px rgba(20,8,24,.8),0 0 0 4px rgba(201,168,76,.08);opacity:0;transform:translateY(-14px) scale(.98);transition:opacity .5s ease,transform .55s cubic-bezier(.22,1,.36,1);pointer-events:none}' +
      '#t5-guide.show{opacity:1;transform:none;pointer-events:auto}' +
      '#t5-guide .g-top{display:flex;align-items:center;gap:8px;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;font-weight:800;color:#C9A84C}' +
      '#t5-guide .g-dot{width:8px;height:8px;border-radius:50%;background:#E4C879;box-shadow:0 0 0 0 rgba(228,200,121,.7);animation:t5pulse 2.2s infinite}' +
      '@keyframes t5pulse{0%{box-shadow:0 0 0 0 rgba(228,200,121,.6)}70%{box-shadow:0 0 0 9px rgba(228,200,121,0)}100%{box-shadow:0 0 0 0 rgba(228,200,121,0)}}' +
      '#t5-guide .g-x{margin-left:auto;background:none;border:0;color:rgba(255,255,255,.6);font-size:20px;line-height:1;cursor:pointer;padding:4px 6px}' +
      '#t5-guide .g-why{margin:10px 0 12px;color:rgba(255,255,255,.88);font-weight:300;font-size:14.5px}' +
      '#t5-guide .g-go{display:flex;align-items:center;justify-content:center;width:100%;min-height:46px;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:.02em;color:#2E1A35;background:linear-gradient(180deg,#ecd391,#C9A84C 60%,#B0902F);text-decoration:none;box-shadow:0 10px 26px rgba(201,168,76,.35)}' +
      '#t5-guide .g-row{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:10px;font-size:12px}' +
      '#t5-guide .g-row button{background:none;border:0;color:#E4C879;cursor:pointer;font:600 12.5px "DM Sans",Inter,sans-serif;padding:8px 2px;min-height:36px;text-decoration:underline;text-underline-offset:3px}' +
      '#t5-guide .g-me{color:#E4C879;font:600 12.5px "DM Sans",Inter,sans-serif;text-decoration:underline;text-underline-offset:3px;padding:8px 2px}' +
      '#t5-guide .g-row .g-clr{color:rgba(255,255,255,.55);text-decoration:none;font-weight:500;font-size:11.5px}' +
      '#t5-pill{position:fixed;z-index:2147482700;left:12px;top:calc(4.5rem + 10px);display:none;align-items:center;gap:8px;padding:10px 14px;border-radius:99px;border:1px solid rgba(201,168,76,.5);background:rgba(35,16,41,.95);color:#E4C879;font:700 12.5px "DM Sans",Inter,sans-serif;cursor:pointer;box-shadow:0 14px 30px -12px rgba(0,0,0,.6);min-height:40px}' +
      '#t5-pill.show{display:inline-flex}' +
      '#t5-pill .g-dot{width:8px;height:8px;border-radius:50%;background:#E4C879}' +
      '.t5-field{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}' +
      '.t5-rec{box-shadow:0 0 0 3px rgba(201,168,76,.55),0 40px 80px -34px rgba(176,144,47,.7)!important}' +
      '.t5-recTag{position:absolute;top:-12px;right:16px;padding:6px 12px;border-radius:99px;background:linear-gradient(180deg,#ecd391,#C9A84C);color:#2E1A35;font:800 10.5px "DM Sans",Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase;box-shadow:0 8px 18px rgba(176,144,47,.4);z-index:3}' +
      '@media(min-width:900px){#t5-guide{left:72px;right:auto;top:auto;bottom:24px;margin:0;width:360px}#t5-pill{left:72px;top:auto;bottom:24px}}' +
      'body.t5-guide-open .cToast{display:none!important}' +
      '@media(prefers-reduced-motion:reduce){#t5-guide{transition:opacity .3s}#t5-guide .g-dot{animation:none}}';
    document.head.appendChild(s);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function beacon(type, meta) {
    try {
      var vid = localStorage.getItem('a5_vid') || 'anon', sid = sessionStorage.getItem('a5_sid') || 'anon';
      var d = JSON.stringify({ event_type: type, visitor_id: vid, session_id: sid, path: location.pathname, meta: meta });
      if (navigator.sendBeacon) navigator.sendBeacon('/api/track', new Blob([d], { type: 'text/plain' }));
    } catch (e) {}
  }
  function build(step) {
    style();
    el = document.createElement('aside'); el.id = 't5-guide'; el.setAttribute('role', 'complementary'); el.setAttribute('aria-label', 'Your next step');
    el.innerHTML =
      '<div class="g-top"><span class="g-dot"></span>Your next step<button class="g-x" type="button" aria-label="Close">×</button></div>' +
      '<p class="g-why">' + esc(step.why) + '</p>' +
      '<a class="g-go" href="' + esc(step.url) + '" data-live="go">' + esc(step.go) + ' →</a>' +
      '<div class="g-row"><button type="button" class="g-ask">Ask about this</button><button type="button" class="g-voice">Ask by voice</button><a class="g-me" href="/me">Your space</a></div><div class="g-row"><button type="button" class="g-clr" title="Forget what this device has learned">Clear what you remember</button></div>';
    document.body.appendChild(el);
    var pill = document.createElement('button'); pill.id = 't5-pill'; pill.type = 'button'; pill.innerHTML = '<span class="g-dot"></span>Your next step'; document.body.appendChild(pill);
    function close(dismiss) {
      el.classList.remove('show'); document.body.classList.remove('t5-guide-open');
      if (dismiss) { mind.dis[step.key] = Date.now(); save(mind); pill.classList.remove('show'); }
      else pill.classList.add('show');
    }
    el.querySelector('.g-x').addEventListener('click', function () { close(true); beacon('cta_click', { src: 'guide_dismiss', offer: step.key }); });
    pill.addEventListener('click', function () { pill.classList.remove('show'); el.classList.add('show'); document.body.classList.add('t5-guide-open'); });
    el.querySelector('.g-go').addEventListener('click', function () { beacon('cta_click', { src: 'guide_go', offer: step.key }); });
    el.querySelector('.g-ask').addEventListener('click', function () {
      beacon('cta_click', { src: 'guide_ask', offer: step.key });
      var pr = profile(), ctx = 'Visitor is exploring ' + step.ask + (pr && pr.primaryName ? '; main blocker: ' + pr.primaryName : '') + '.';
      try { window.dispatchEvent(new CustomEvent('the5th:invite', { detail: { seed: 'I would like to know more about ' + step.ask + '. Is it right for me?', ctx: ctx } })); } catch (e) {}
      close(false);
    });
    el.querySelector('.g-voice').addEventListener('click', function () { beacon('cta_click', { src: 'guide_voice', offer: step.key }); close(false); window.The5thVoice.open(); });
    el.querySelector('.g-clr').addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      mind = { w: {}, dis: {}, seen: Date.now(), at: Date.now() }; el.remove(); pill.remove(); document.body.classList.remove('t5-guide-open');
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('show'); document.body.classList.add('t5-guide-open'); }); });
    setTimeout(function () { if (el && el.classList.contains('show')) close(false); }, 16000);
    beacon('cta_click', { src: 'guide_shown', offer: step.key });
  }
  function maybeShow() {
    if (shown || quiet) return;
    var ready = visibleTime >= 24 || (maxScroll >= 45 && visibleTime >= 10);
    if (!ready) return;
    try { if (sessionStorage.getItem('t5_guide_done')) { shown = true; return; } } catch (e) {}
    if (document.getElementById('t5-rib')) return;            // never stack on the welcome-back ribbon
    var s = nextStep(); shown = true; if (!s) return;
    try { sessionStorage.setItem('t5_guide_done', '1'); } catch (e) {}
    build(s);
  }

  /* ── ADAPT: offers + header button ──────────────────────────────────── */
  function adapt() {
    var hasSignal = ranked()[0][1] >= 3;
    /* Resources: highlight the recommended door, float matching cards up */
    var big = document.querySelectorAll('.rsBig[data-offer]');
    if (big.length && hasSignal) {
      var best = null, bs = 0;
      big.forEach(function (b) { var s = score(b.getAttribute('data-offer')); if (s > bs) { bs = s; best = b; } });
      if (best && bs >= 3) { best.classList.add('t5-rec'); var tg = document.createElement('span'); tg.className = 't5-recTag'; tg.textContent = 'Recommended for you'; best.appendChild(tg); }
    }
    var grid = document.getElementById('rsGrid');
    if (grid && hasSignal) {
      var cards = [].slice.call(grid.querySelectorAll('.rsC[data-offer]'));
      cards.map(function (c, i) { return { c: c, s: score(c.getAttribute('data-offer')), i: i }; })
        .sort(function (a, b) { return b.s - a.s || a.i - b.i; })
        .forEach(function (x, k) {
          grid.appendChild(x.c);
          if (k < 2 && x.s >= 3) { var t = x.c.querySelector('.rsC__tag'); if (t && !x.c.querySelector('.t5-pick')) { var p = document.createElement('span'); p.className = 'rsC__tag t5-pick'; p.style.marginLeft = '8px'; p.textContent = 'Picked for you'; t.parentNode.insertBefore(p, t.nextSibling); } }
        });
    }
    /* Header button points at the strongest next step (not the page you are on) */
    var btn = document.querySelector('.globalNav .gn__start');
    if (btn && hasSignal && !btn.getAttribute('onclick')) {
      var s = nextStep();
      if (s && s.key !== 'quiz' && ranked()[0][1] >= 6) {
        btn.textContent = s.short; btn.setAttribute('href', s.url);
        var mb = document.querySelector('.mobileMenu__start'); if (mb) { mb.textContent = s.short; mb.setAttribute('href', s.url); }
      }
    }
  }

  /* ── FIELD: living constellation behind hero sections ───────────────── */
  function field(host) {
    if (host.querySelector('.t5-field')) return;
    var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    style();
    var cv = document.createElement('canvas'); cv.className = 't5-field'; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:0;display:block';
    var cs = getComputedStyle(host); if (cs.position === 'static') host.style.position = 'relative';
    host.insertBefore(cv, host.firstChild);
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5), nodes = [], mx = -999, my = -999, running = false, raf = 0;
    var N = innerWidth < 700 ? 22 : 46, LINK = innerWidth < 700 ? 90 : 130;
    function size() { var r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function seed() { nodes = []; for (var i = 0; i < N; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22, r: 1 + Math.random() * 1.6 }); }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        if (!reduce) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1;
          var dx = mx - a.x, dy = my - a.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) { a.x += dx * .006; a.y += dy * .006; }
        }
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], ex = a.x - b.x, ey = a.y - b.y, dd = ex * ex + ey * ey;
          if (dd < LINK * LINK) { var al = (1 - Math.sqrt(dd) / LINK) * .28; ctx.strokeStyle = 'rgba(228,200,121,' + al.toFixed(3) + ')'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        var near = Math.max(0, 1 - Math.sqrt((mx - a.x) * (mx - a.x) + (my - a.y) * (my - a.y)) / 180);
        ctx.fillStyle = 'rgba(228,200,121,' + (.28 + near * .6).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r + near * 1.8, 0, 6.2832); ctx.fill();
      }
      if (running && !reduce) raf = requestAnimationFrame(frame);
    }
    size(); seed(); frame();
    if (reduce) return;
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true });
    host.addEventListener('pointerleave', function () { mx = my = -999; });
    addEventListener('resize', function () { size(); seed(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { var on = en[0].isIntersecting && document.visibilityState === 'visible'; if (on && !running) { running = true; raf = requestAnimationFrame(frame); } else if (!on) { running = false; cancelAnimationFrame(raf); } }).observe(host);
    else { running = true; raf = requestAnimationFrame(frame); }
  }
  function fields() { if (quiet) return; document.querySelectorAll('.hHero,.ff-hero,[data-field]').forEach(function (h) { try { field(h); } catch (e) {} }); }

  /* ── LEARN: per-button clicks + human-approved copy overrides ───────── */
  var applied = {};
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('[data-cta]') : null;
    if (!a) return;
    var id = a.getAttribute('data-opt');
    beacon('cta_click', { cta: a.getAttribute('data-cta'), opt: id || null, v: id && applied[id] ? 'approved' : 'original' });
  }, true);
  function overrides() {
    var nodes = document.querySelectorAll('[data-opt]');
    if (!nodes.length) return;
    function apply(map) {
      nodes.forEach(function (n) {
        var id = n.getAttribute('data-opt'), t = map && map[id];
        if (t && typeof t === 'string' && t.length <= 90 && n.textContent !== t) { n.textContent = t; applied[id] = true; }
      });
    }
    try { var c = JSON.parse(sessionStorage.getItem('t5_ov') || 'null'); if (c && Date.now() - c.t < 600000) { apply(c.m); return; } } catch (e) {}
    fetch('/api/site-overrides').then(function (r) { return r.ok ? r.json() : null; }).then(function (m) {
      if (!m) return; try { sessionStorage.setItem('t5_ov', JSON.stringify({ t: Date.now(), m: m })); } catch (e) {} apply(m);
    }).catch(function () {});
  }

  /* ── VOICE: lazy-load the voice assistant on first use ──────────────── */
  if (!window.The5thVoice) {
    window.The5thVoice = { open: function (seed) {
      window.__t5VoicePending = true;
      if (document.getElementById('t5-voice-js')) return;
      var sc = document.createElement('script'); sc.id = 't5-voice-js'; sc.src = '/voice.js'; sc.onload = function () { if (window.The5thVoice && window.The5thVoice._ready && seed) window.The5thVoice.open(seed); }; document.head.appendChild(sc);
    } };
  }

  /* ── REMOVE third-party "Feedback" side tabs (Hotjar / Contentsquare etc.) if any script ever injects one ── */
  (function(){
    var RX=/(^|[^a-z])(_hj|hotjar|hj-widget|hj_|cs-voc|contentsquare|usabilla|survicate)/i;
    function hide(el){try{el.style.setProperty('display','none','important');el.style.setProperty('visibility','hidden','important');el.setAttribute('aria-hidden','true')}catch(e){}}
    function isFb(el){
      if(!el||el.nodeType!==1||el.id==='t5-guide'||el.id==='t5-pill')return false;
      var id=el.id||'',cl=typeof el.className==='string'?el.className:'';
      if(RX.test(id)||RX.test(cl))return true;
      if(el.tagName==='IFRAME'&&RX.test(el.getAttribute('src')||''))return true;
      var t=(el.textContent||'').trim();
      if(t.length>0&&t.length<20&&/^(give |send )?feedback$/i.test(t)){var cs=getComputedStyle(el);if(cs.position==='fixed'){var r=el.getBoundingClientRect();if(r.width<100&&r.width>0)return true}}
      return false}
    function scan(root){
      if(!root||root.nodeType!==1)return;
      if(isFb(root)){hide(root);return}
      var q=root.querySelectorAll?root.querySelectorAll('[id*="_hj" i],[class*="_hj" i],[class*="hotjar" i],[class*="cs-voc" i],iframe[src*="hotjar" i],iframe[src*="contentsquare" i],div,aside,button'):[];
      for(var i=0;i<q.length&&i<400;i++){if(isFb(q[i]))hide(q[i])}}
    function run(){scan(document.body)}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
    try{var pend=false;new MutationObserver(function(m){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;for(var i=0;i<m.length;i++){for(var j=0;j<m[i].addedNodes.length;j++)scan(m[i].addedNodes[j])}})}).observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
  })();

  /* ── boot ───────────────────────────────────────────────────────────── */
  function boot() { try { adapt(); } catch (e) {} try { overrides(); } catch (e) {} try { fields(); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.The5thMind = {
    weights: function () { return JSON.parse(JSON.stringify(mind.w)); },
    top: function () { var r = ranked()[0]; return r && r[1] >= 3 ? r[0] : null; },
    next: nextStep,
    profile: profile,
    signals: function () {
      var pr = profile(), w = ranked().filter(function (x) { return x[1] > 0; }).slice(0, 4);
      return { page: path, interests: w.map(function (x) { return { offer: x[0], weight: x[1] }; }), blocker: pr && pr.primaryName || null, archetype: pr && pr.archetype || null, first: (pr && pr.first) || null, dwell: visibleTime };
    },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} mind = { w: {}, dis: {}, seen: Date.now(), at: Date.now() }; }
  };
})();
