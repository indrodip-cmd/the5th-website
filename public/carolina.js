/* ══════════════════════════════════════════════════════════════════
   Carolina — The5th AI customer hub (premium multi-panel widget)
   Framework-free so it runs site-wide (static HTML + Next routes).
   Panels: Home · Messages · Knowledge · Chat. Talks to /api/carolina.
   Design system per The5th "Master UI Blueprint — Part 1".
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__carolinaLoaded) return;
  window.__carolinaLoaded = true;

  // ── Keys ──
  var STORE = 'the5th_carolina_store_v2';
  var VISITS = 'the5th_carolina_visits';
  var SESSION_FLAG = 'the5th_carolina_session';
  var REOPEN = 'the5th_carolina_reopen';
  var DISMISS = { gift: 'the5th_carolina_gift_x', quiz: 'the5th_carolina_quiz_x' };
  var API = '/api/carolina';
  var CONFIG_API = '/api/carolina/config';

  var TZ = 'UTC';
  try { TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) {}

  // ── Config (admin-driven) ──
  var cfg = {
    avatar: null,
    greeting: "Hi, I'm Carolina 👋 I help women 40+ turn their expertise into income with The5th. Curious about our programs, or want to book a quick call with the team?",
    proactive: { enabled: false, delay: 12, gift: { message: null }, quiz: { message: null } }
  };

  // ── State ──
  var store = { conversations: [], activeId: null };
  var tab = 'home';        // home | messages | knowledge
  var mode = 'panels';     // panels | chat
  var isOpen = false;
  var sending = false;
  var promoScheduled = false;
  var els = {};

  // ── Persistence ──
  function loadStore() {
    try {
      var raw = localStorage.getItem(STORE);
      if (raw) { var p = JSON.parse(raw); if (p && Array.isArray(p.conversations)) store = p; }
    } catch (e) {}
    // migrate old single-thread key
    try {
      var old = localStorage.getItem('the5th_carolina_thread_v1');
      if (old && store.conversations.length === 0) {
        var msgs = JSON.parse(old);
        if (Array.isArray(msgs) && msgs.length) {
          store.conversations.push(mkConv(msgs));
        }
        localStorage.removeItem('the5th_carolina_thread_v1');
      }
    } catch (e) {}
  }
  function saveStore() { try { localStorage.setItem(STORE, JSON.stringify(store)); } catch (e) {} }

  function uid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function mkConv(messages) {
    return { id: uid(), messages: messages || [], createdAt: Date.now(), updatedAt: Date.now() };
  }
  function activeConv() { return store.conversations.find(function (c) { return c.id === store.activeId; }) || null; }
  function convTitle(c) {
    var firstUser = (c.messages || []).find(function (m) { return m.role === 'user'; });
    var t = firstUser ? firstUser.content : 'New conversation';
    return t.length > 42 ? t.slice(0, 42) + '…' : t;
  }
  function convPreview(c) {
    var last = (c.messages || [])[c.messages.length - 1];
    if (!last) return 'Start the conversation';
    var t = last.content.replace(/\s+/g, ' ');
    return (last.role === 'user' ? 'You: ' : '') + (t.length > 60 ? t.slice(0, 60) + '…' : t);
  }
  function timeAgo(ts) {
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    var m = Math.floor(s / 60); if (m < 60) return m + 'm';
    var h = Math.floor(m / 60); if (h < 24) return h + 'h';
    var d = Math.floor(h / 24); return d + 'd';
  }

  // ── Visit tracking (first vs returning) ──
  function trackVisit() {
    var v = 0; try { v = parseInt(localStorage.getItem(VISITS) || '0', 10) || 0; } catch (e) {}
    var newSession = false;
    try { newSession = !sessionStorage.getItem(SESSION_FLAG); } catch (e) { newSession = true; }
    if (newSession) { v += 1; try { localStorage.setItem(VISITS, String(v)); sessionStorage.setItem(SESSION_FLAG, '1'); } catch (e) {} }
    return v;
  }
  var visitCount = 1;
  function isFirstTime() { return visitCount <= 1; }

  // ── Intercom suppression ──
  function suppressIntercom() {
    var css = '#intercom-container,.intercom-lightweight-app,.intercom-launcher,.intercom-launcher-frame,#intercom-launcher-frame,.intercom-messenger-frame{display:none !important;visibility:hidden !important;}';
    var s = document.createElement('style'); s.id = 'carolina-hide-intercom'; s.textContent = css; document.head.appendChild(s);
    try { if (typeof window.Intercom === 'function') window.Intercom('update', { hide_default_launcher: true }); } catch (e) {}
  }

  // ── Icons (thin, lucide-like) ──
  var ICON = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    msg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-11.9 7.6L3 21l1.9-6.1A8.4 8.4 0 1 1 21 11.5Z"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5Z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7S12 3 9 3a2.5 2.5 0 0 0 0 5M12 7s0-4 3-4a2.5 2.5 0 0 1 0 5"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 4-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 3.2 2 2 0 0 1 4 1h2a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.1 8.9a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>'
  };

  function avatarInner() {
    if (cfg.avatar) return '<img src="' + cfg.avatar + '" alt="Carolina">';
    return '<span>C</span>';
  }

  // ── Styles / design tokens ──
  function injectStyles() {
    if (document.getElementById('carolina-styles')) return;
    var css = [
      '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");',
      '.cw{--bg:#0D0D0D;--bg2:#151515;--card:#1B1B1B;--bd:rgba(255,255,255,.07);--hover:rgba(255,255,255,.05);--tx:#FFFFFF;--tx2:#A1A1AA;--mut:#71717A;--acc:#C9A84C;--acc2:#E4C879;--plum:#3D2645;--sp:cubic-bezier(.22,1,.36,1);font-family:"Inter",system-ui,-apple-system,sans-serif;}',
      '.cw *{box-sizing:border-box;}',
      // launcher
      '.cw-launcher{position:fixed;right:24px;bottom:24px;z-index:2147482500;width:60px;height:60px;border-radius:50%;cursor:pointer;border:1px solid rgba(201,168,76,.28);background:radial-gradient(120% 120% at 30% 20%,#241528,#0D0D0D);box-shadow:0 12px 34px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;transition:transform .25s var(--sp),box-shadow .25s;}',
      '.cw-launcher:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 18px 44px rgba(0,0,0,.6);}',
      '.cw-launcher:active{transform:scale(.96);}',
      '.cw-launcher svg{width:26px;height:26px;color:var(--acc);transition:opacity .2s,transform .3s var(--sp);position:absolute;}',
      '.cw-launcher .l-close{opacity:0;transform:rotate(-40deg) scale(.6);}',
      '.cw-open .l-chat{opacity:0;transform:rotate(40deg) scale(.6);}',
      '.cw-open .l-close{opacity:1;transform:rotate(0) scale(1);}',
      '.cw-badge{position:absolute;top:-2px;right:-2px;min-width:19px;height:19px;border-radius:10px;background:var(--acc);color:#1a1206;font:700 11px/19px "Inter";text-align:center;padding:0 5px;box-shadow:0 2px 8px rgba(0,0,0,.4);animation:cwPulse 2.4s infinite;}',
      '@keyframes cwPulse{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.5);}50%{box-shadow:0 0 0 6px rgba(201,168,76,0);}}',
      // window
      '.cw-win{position:fixed;right:24px;bottom:96px;z-index:2147482500;width:400px;height:min(680px,calc(100vh - 120px));background:var(--bg);border:1px solid var(--bd);border-radius:28px;box-shadow:0 40px 100px rgba(0,0,0,.55);display:flex;flex-direction:column;overflow:hidden;color:var(--tx);opacity:0;transform:translateY(20px) scale(.97);transform-origin:bottom right;pointer-events:none;transition:opacity .28s var(--sp),transform .34s var(--sp);}',
      '.cw-win.cw-show{opacity:1;transform:none;pointer-events:auto;}',
      '.cw-scroll{flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.12) transparent;}',
      '.cw-scroll::-webkit-scrollbar{width:6px;}.cw-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:3px;}',
      // views fade
      '.cw-view{animation:cwFade .32s var(--sp);}',
      '@keyframes cwFade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}',
      // home hero
      '.cw-hero{position:relative;padding:26px 24px 30px;background:linear-gradient(160deg,#2A1830 0%,#160D1A 60%,#0D0D0D 100%);overflow:hidden;}',
      '.cw-hero::after{content:"";position:absolute;top:-40%;right:-20%;width:70%;height:150%;background:radial-gradient(ellipse,rgba(201,168,76,.16),transparent 70%);}',
      '.cw-hero-top{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;margin-bottom:26px;}',
      '.cw-logo{font:700 15px/1 "Inter";letter-spacing:.2px;color:#fff;}.cw-logo b{color:var(--acc);}',
      '.cw-ava{width:34px;height:34px;border-radius:50%;overflow:hidden;background:linear-gradient(145deg,var(--acc),#9c7f2c);display:flex;align-items:center;justify-content:center;color:#1a1206;font:700 15px "Inter";}',
      '.cw-ava img{width:100%;height:100%;object-fit:cover;}',
      '.cw-hi{position:relative;z-index:1;font:600 30px/1.15 "Inter";letter-spacing:-.02em;color:rgba(255,255,255,.55);}',
      '.cw-hi b{display:block;color:#fff;font-weight:600;}',
      // section
      '.cw-sect{padding:16px;}',
      '.cw-slabel{font:600 12px/1 "Inter";letter-spacing:.04em;color:var(--mut);text-transform:uppercase;margin:6px 4px 12px;}',
      // ask card
      '.cw-ask{margin:-18px 16px 4px;position:relative;z-index:2;background:var(--card);border:1px solid var(--bd);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.35);padding:16px 18px;cursor:pointer;transition:transform .2s var(--sp),border-color .2s;}',
      '.cw-ask:hover{transform:translateY(-2px);border-color:rgba(201,168,76,.3);}',
      '.cw-ask h4{font:600 16px/1.3 "Inter";margin:0 0 3px;color:#fff;}',
      '.cw-ask p{font:400 13.5px/1.4 "Inter";margin:0;color:var(--tx2);}',
      '.cw-ask-row{display:flex;align-items:center;gap:10px;margin-top:14px;background:var(--bg2);border:1px solid var(--bd);border-radius:14px;padding:11px 14px;color:var(--mut);font-size:14px;}',
      '.cw-ask-row .cw-sendmini{margin-left:auto;width:30px;height:30px;border-radius:9px;background:linear-gradient(145deg,var(--acc),#a9862f);display:flex;align-items:center;justify-content:center;color:#1a1206;}',
      '.cw-ask-row .cw-sendmini svg{width:15px;height:15px;}',
      // cards
      '.cw-card{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--bd);border-radius:16px;padding:15px 16px;cursor:pointer;transition:transform .18s var(--sp),background .18s,border-color .18s;margin-bottom:10px;}',
      '.cw-card:hover{transform:translateY(-2px);background:#202020;border-color:rgba(201,168,76,.25);}',
      '.cw-card-ic{width:40px;height:40px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(201,168,76,.1);color:var(--acc);}',
      '.cw-card-ic svg{width:20px;height:20px;}',
      '.cw-card-tx{flex:1;min-width:0;}',
      '.cw-card-tx h5{font:600 14.5px/1.3 "Inter";margin:0 0 2px;color:#fff;}',
      '.cw-card-tx p{font:400 12.5px/1.4 "Inter";margin:0;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.cw-card-go{color:var(--mut);flex-shrink:0;}.cw-card-go svg{width:18px;height:18px;}',
      '.cw-card:hover .cw-card-go{color:var(--acc);}',
      '.cw-card.gift{background:linear-gradient(120deg,rgba(201,168,76,.14),rgba(201,168,76,.03));border-color:rgba(201,168,76,.3);}',
      // messages list
      '.cw-conv{display:flex;align-items:center;gap:12px;padding:14px 12px;border-radius:14px;cursor:pointer;transition:background .16s;}',
      '.cw-conv:hover{background:var(--hover);}',
      '.cw-conv-ava{width:36px;height:36px;border-radius:50%;flex-shrink:0;overflow:hidden;background:linear-gradient(145deg,var(--acc),#9c7f2c);display:flex;align-items:center;justify-content:center;color:#1a1206;font:700 14px "Inter";}',
      '.cw-conv-ava img{width:100%;height:100%;object-fit:cover;}',
      '.cw-conv-tx{flex:1;min-width:0;}',
      '.cw-conv-tx h5{font:600 14px/1.3 "Inter";margin:0 0 2px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.cw-conv-tx p{font:400 12.5px/1.35 "Inter";margin:0;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.cw-conv-t{font:400 11.5px/1 "Inter";color:var(--mut);flex-shrink:0;}',
      // empty
      '.cw-empty{text-align:center;padding:60px 30px;color:var(--tx2);}',
      '.cw-empty .e-ic{width:52px;height:52px;border-radius:16px;margin:0 auto 16px;background:var(--card);border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;color:var(--acc);}',
      '.cw-empty .e-ic svg{width:24px;height:24px;}',
      '.cw-empty h4{font:600 16px "Inter";color:#fff;margin:0 0 6px;}',
      '.cw-empty p{font:400 13.5px/1.5 "Inter";margin:0 auto;max-width:230px;}',
      // knowledge search
      '.cw-ksearch{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:12px 14px;margin:4px 0 16px;color:var(--mut);}',
      '.cw-ksearch svg{width:17px;height:17px;flex-shrink:0;}',
      '.cw-ksearch input{flex:1;background:none;border:none;outline:none;color:#fff;font:400 14px "Inter";}',
      '.cw-ksearch input::placeholder{color:var(--mut);}',
      '.cw-kitem{padding:15px 4px;border-bottom:1px solid var(--bd);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;transition:padding .16s;}',
      '.cw-kitem:hover{padding-left:10px;}',
      '.cw-kitem span{font:500 14.5px/1.4 "Inter";color:rgba(255,255,255,.9);}',
      '.cw-kitem .cw-card-go{color:var(--mut);}.cw-kitem:hover .cw-card-go{color:var(--acc);}',
      // chat
      '.cw-chead{display:flex;align-items:center;gap:12px;padding:16px 18px;background:linear-gradient(160deg,#241531,#130C17);border-bottom:1px solid var(--bd);}',
      '.cw-iconbtn{width:32px;height:32px;border-radius:10px;border:none;background:rgba(255,255,255,.06);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .18s;flex-shrink:0;}',
      '.cw-iconbtn:hover{background:rgba(255,255,255,.14);}.cw-iconbtn svg{width:18px;height:18px;}',
      '.cw-chead-ava{width:36px;height:36px;border-radius:50%;overflow:hidden;background:linear-gradient(145deg,var(--acc),#9c7f2c);display:flex;align-items:center;justify-content:center;color:#1a1206;font:700 15px "Inter";flex-shrink:0;}',
      '.cw-chead-ava img{width:100%;height:100%;object-fit:cover;}',
      '.cw-chead-tx{flex:1;min-width:0;}',
      '.cw-chead-tx h4{font:600 15px/1.1 "Inter";margin:0;color:#fff;}',
      '.cw-chead-tx p{font:400 12px/1.3 "Inter";margin:2px 0 0;color:var(--tx2);display:flex;align-items:center;gap:6px;}',
      '.cw-live{width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.2);}',
      '.cw-msgs{padding:20px 16px 8px;display:flex;flex-direction:column;gap:12px;}',
      '.cw-m{display:flex;gap:9px;align-items:flex-end;max-width:86%;animation:cwBub .28s var(--sp);}',
      '@keyframes cwBub{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}',
      '.cw-m.bot{align-self:flex-start;}.cw-m.user{align-self:flex-end;flex-direction:row-reverse;}',
      '.cw-m-ava{width:26px;height:26px;border-radius:50%;overflow:hidden;flex-shrink:0;background:linear-gradient(145deg,var(--acc),#9c7f2c);display:flex;align-items:center;justify-content:center;color:#1a1206;font:700 12px "Inter";}',
      '.cw-m-ava img{width:100%;height:100%;object-fit:cover;}',
      '.cw-bub{padding:11px 14px;border-radius:16px;font:400 14px/1.55 "Inter";white-space:pre-wrap;word-wrap:break-word;}',
      '.cw-m.bot .cw-bub{background:var(--card);border:1px solid var(--bd);color:#ECECEC;border-bottom-left-radius:5px;}',
      '.cw-m.user .cw-bub{background:linear-gradient(145deg,var(--acc),#b8942f);color:#1a1206;font-weight:500;border-bottom-right-radius:5px;}',
      '.cw-bub a{color:var(--acc2);font-weight:600;text-decoration:underline;}',
      '.cw-m.user .cw-bub a{color:#3a2a06;}',
      '.cw-chips{display:flex;flex-wrap:wrap;gap:8px;padding:2px 2px 8px 36px;}',
      '.cw-chip{background:var(--card);border:1px solid var(--bd);color:var(--acc2);font:500 12.5px "Inter";padding:9px 13px;border-radius:999px;cursor:pointer;transition:background .16s,transform .16s;}',
      '.cw-chip:hover{background:#241a10;transform:translateY(-1px);}',
      '.cw-typing{display:flex;gap:4px;padding:13px 15px;background:var(--card);border:1px solid var(--bd);border-radius:16px;border-bottom-left-radius:5px;width:fit-content;}',
      '.cw-typing span{width:7px;height:7px;border-radius:50%;background:var(--acc);opacity:.5;animation:cwT 1s infinite;}',
      '.cw-typing span:nth-child(2){animation-delay:.16s;}.cw-typing span:nth-child(3){animation-delay:.32s;}',
      '@keyframes cwT{0%,60%,100%{transform:translateY(0);opacity:.4;}30%{transform:translateY(-4px);opacity:1;}}',
      // composer
      '.cw-comp{padding:12px 14px;border-top:1px solid var(--bd);background:var(--bg);}',
      '.cw-comp-row{display:flex;align-items:flex-end;gap:8px;background:var(--card);border:1px solid var(--bd);border-radius:16px;padding:7px 7px 7px 15px;transition:border-color .2s;}',
      '.cw-comp-row:focus-within{border-color:rgba(201,168,76,.4);}',
      '.cw-in{flex:1;border:none;background:none;outline:none;resize:none;color:#fff;font:400 14px/1.45 "Inter";max-height:100px;padding:6px 0;}',
      '.cw-in::placeholder{color:var(--mut);}',
      '.cw-send{width:36px;height:36px;border-radius:11px;border:none;flex-shrink:0;cursor:pointer;background:linear-gradient(145deg,var(--acc),#a9862f);color:#1a1206;display:flex;align-items:center;justify-content:center;transition:transform .18s var(--sp),opacity .2s;}',
      '.cw-send:hover{transform:scale(1.06);}.cw-send:disabled{opacity:.4;cursor:default;transform:none;}',
      '.cw-send svg{width:17px;height:17px;}',
      '.cw-cred{text-align:center;font:400 10.5px "Inter";color:var(--mut);margin:9px 0 1px;}',
      '.cw-cred b{color:var(--tx2);font-weight:600;}',
      // bottom nav
      '.cw-nav{display:flex;border-top:1px solid var(--bd);background:rgba(13,13,13,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);}',
      '.cw-tab{flex:1;padding:11px 0 9px;background:none;border:none;cursor:pointer;color:var(--mut);display:flex;flex-direction:column;align-items:center;gap:4px;font:500 11px "Inter";transition:color .18s;}',
      '.cw-tab svg{width:21px;height:21px;transition:transform .2s var(--sp);}',
      '.cw-tab:hover{color:var(--tx2);}',
      '.cw-tab.on{color:var(--acc);}.cw-tab.on svg{transform:translateY(-1px);}',
      // proactive popup
      '.cw-promo{position:fixed;right:24px;bottom:96px;z-index:2147482499;width:330px;max-width:calc(100vw - 40px);background:var(--bg);border:1px solid var(--bd);border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,.55);padding:18px 18px 16px;color:#fff;font-family:"Inter",sans-serif;opacity:0;transform:translateY(16px) scale(.96);transform-origin:bottom right;transition:opacity .35s var(--sp),transform .4s var(--sp);pointer-events:none;overflow:hidden;}',
      '.cw-promo::before{content:"";position:absolute;top:-50%;right:-30%;width:80%;height:150%;background:radial-gradient(ellipse,rgba(201,168,76,.18),transparent 70%);}',
      '.cw-promo.cw-show{opacity:1;transform:none;pointer-events:auto;}',
      '.cw-promo-x{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.06);border:none;color:var(--tx2);width:26px;height:26px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;}',
      '.cw-promo-x svg{width:15px;height:15px;}.cw-promo-x:hover{background:rgba(255,255,255,.14);color:#fff;}',
      '.cw-promo-ic{position:relative;z-index:1;width:44px;height:44px;border-radius:13px;background:rgba(201,168,76,.14);color:var(--acc);display:flex;align-items:center;justify-content:center;margin-bottom:13px;}',
      '.cw-promo-ic svg{width:23px;height:23px;}',
      '.cw-promo-msg{position:relative;z-index:1;font:400 15px/1.5 "Inter";color:#ECECEC;margin-bottom:15px;}',
      '.cw-promo-cta{position:relative;z-index:1;width:100%;background:linear-gradient(145deg,var(--acc),#a9862f);color:#1a1206;border:none;border-radius:13px;padding:12px;font:700 14px "Inter";cursor:pointer;transition:transform .18s var(--sp),box-shadow .2s;box-shadow:0 8px 24px rgba(201,168,76,.24);}',
      '.cw-promo-cta:hover{transform:translateY(-1px);box-shadow:0 12px 30px rgba(201,168,76,.34);}',
      '.cw-promo-no{position:relative;z-index:1;display:block;width:100%;text-align:center;background:none;border:none;color:var(--mut);font:400 12.5px "Inter";margin-top:9px;cursor:pointer;}',
      '.cw-promo-no:hover{color:var(--tx2);}',
      // mobile
      '@media(max-width:480px){.cw-win{right:0;left:0;bottom:0;top:0;width:100%;height:100%;border-radius:0;}.cw-launcher{right:16px;bottom:16px;}.cw-promo{right:12px;left:12px;width:auto;bottom:90px;}}',
      '@media(prefers-reduced-motion:reduce){.cw *{animation:none !important;transition:none !important;}}'
    ].join('\n');
    var st = document.createElement('style'); st.id = 'carolina-styles'; st.textContent = css; document.head.appendChild(st);
  }

  // ── Helpers ──
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function renderMd(t) {
    var h = esc(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/(https?:\/\/[^\s<]+)/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>'; });
    return h.replace(/\n/g, '<br>');
  }
  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }

  // ── Home actions data ──
  function homeCards() {
    return [
      { ic: ICON.gift, cls: 'gift', title: 'Get your free gift', desc: 'A PDF: your first $3K/month', seed: "Yes! I'd love the free $3K/month PDF." },
      { ic: ICON.chart, title: 'Take the free assessment', desc: 'Your Business Health Score in 60s', seed: 'I want to take the free quiz — can you guide me?' },
      { ic: ICON.phone, title: 'Book a strategy call', desc: 'Free 1:1 consultation', seed: "I'd like to book a call with the team." },
      { ic: ICON.spark, title: 'Explore the programs', desc: 'Fast Forward · Collective · The5th AI', seed: 'Tell me about your programs.' }
    ];
  }
  function knowledgeItems() {
    return [
      { q: 'Which program is right for me?', seed: 'Which program is right for me?' },
      { q: 'How does the free assessment work?', seed: 'How does the free assessment work?' },
      { q: 'What is The5th and who is it for?', seed: 'What is The5th and who is it for?' },
      { q: 'How do I book a strategy call?', seed: "I'd like to book a call with the team." },
      { q: 'Tell me about The5th AI', seed: 'Tell me about The5th AI.' },
      { q: 'How do I get started?', seed: 'How do I get started?' }
    ];
  }

  // ── Renderers ──
  function renderPanels() {
    mode = 'panels';
    var body = '';
    if (tab === 'home') body = renderHome();
    else if (tab === 'messages') body = renderMessages();
    else body = renderKnowledge();

    els.win.innerHTML =
      '<div class="cw-scroll" id="cw-scroll"><div class="cw-view">' + body + '</div></div>' + navHtml();
    wirePanels();
  }

  function renderHome() {
    var hello = '<div class="cw-hero"><div class="cw-hero-top"><div class="cw-logo">the<b>5</b>th</div>'
      + '<div class="cw-ava">' + avatarInner() + '</div></div>'
      + '<div class="cw-hi">Hello there.<b>How can we help?</b></div></div>';
    var ask = '<div class="cw-ask" id="cw-ask"><h4>Ask a question</h4><p>Carolina replies instantly — programs, pricing, or booking.</p>'
      + '<div class="cw-ask-row">Write a message…<span class="cw-sendmini">' + ICON.send + '</span></div></div>';
    var cards = '<div class="cw-sect"><div class="cw-slabel">Get started</div>';
    homeCards().forEach(function (c, i) {
      cards += '<div class="cw-card ' + (c.cls || '') + '" data-seed="' + esc(c.seed) + '">'
        + '<div class="cw-card-ic">' + c.ic + '</div>'
        + '<div class="cw-card-tx"><h5>' + esc(c.title) + '</h5><p>' + esc(c.desc) + '</p></div>'
        + '<div class="cw-card-go">' + ICON.arrow + '</div></div>';
    });
    cards += '</div>';
    // recent conversation continue
    var recent = '';
    var conv = store.conversations.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; })[0];
    if (conv && conv.messages.length) {
      recent = '<div class="cw-sect" style="padding-top:0"><div class="cw-slabel">Continue</div>'
        + '<div class="cw-conv" data-conv="' + conv.id + '"><div class="cw-conv-ava">' + avatarInner() + '</div>'
        + '<div class="cw-conv-tx"><h5>' + esc(convTitle(conv)) + '</h5><p>' + esc(convPreview(conv)) + '</p></div>'
        + '<div class="cw-conv-t">' + timeAgo(conv.updatedAt) + '</div></div></div>';
    }
    return hello + ask + cards + recent;
  }

  function renderMessages() {
    var head = '<div class="cw-hero" style="padding-bottom:22px"><div class="cw-hero-top"><div class="cw-logo">Messages</div>'
      + '<div class="cw-ava">' + avatarInner() + '</div></div></div>';
    var convs = store.conversations.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; });
    var list;
    if (!convs.length) {
      list = '<div class="cw-empty"><div class="e-ic">' + ICON.msg + '</div><h4>No conversations yet</h4>'
        + '<p>Start chatting with Carolina and your conversations will live here.</p></div>';
    } else {
      list = '<div class="cw-sect">';
      convs.forEach(function (c) {
        list += '<div class="cw-conv" data-conv="' + c.id + '"><div class="cw-conv-ava">' + avatarInner() + '</div>'
          + '<div class="cw-conv-tx"><h5>' + esc(convTitle(c)) + '</h5><p>' + esc(convPreview(c)) + '</p></div>'
          + '<div class="cw-conv-t">' + timeAgo(c.updatedAt) + '</div></div>';
      });
      list += '</div>';
    }
    var cta = '<div class="cw-sect" style="padding-top:4px"><div class="cw-card" id="cw-newconv" style="justify-content:center;background:linear-gradient(145deg,var(--acc),#a9862f);border:none;color:#1a1206;">'
      + '<span style="font:700 14px Inter;color:#1a1206">Ask a new question</span></div></div>';
    return head + cta + list;
  }

  function renderKnowledge() {
    var head = '<div class="cw-hero" style="padding-bottom:22px"><div class="cw-hero-top"><div class="cw-logo">Help &amp; Knowledge</div>'
      + '<div class="cw-ava">' + avatarInner() + '</div></div></div>';
    var search = '<div class="cw-sect"><div class="cw-ksearch">' + ICON.search
      + '<input id="cw-ksearch" placeholder="Search for help…" /></div>';
    var items = '<div class="cw-slabel">Popular questions</div>';
    knowledgeItems().forEach(function (k) {
      items += '<div class="cw-kitem" data-seed="' + esc(k.seed) + '"><span>' + esc(k.q) + '</span><div class="cw-card-go">' + ICON.arrow + '</div></div>';
    });
    return head + search + items + '</div>';
  }

  function navHtml() {
    function t(id, ic, label) {
      return '<button class="cw-tab ' + (tab === id ? 'on' : '') + '" data-tab="' + id + '">' + ic + '<span>' + label + '</span></button>';
    }
    return '<div class="cw-nav">' + t('home', ICON.home, 'Home') + t('messages', ICON.msg, 'Messages') + t('knowledge', ICON.book, 'Help') + '</div>';
  }

  function renderChat() {
    mode = 'chat';
    var conv = activeConv();
    els.win.innerHTML =
      '<div class="cw-chead"><button class="cw-iconbtn" id="cw-back" aria-label="Back">' + ICON.back + '</button>'
      + '<div class="cw-chead-ava">' + avatarInner() + '</div>'
      + '<div class="cw-chead-tx"><h4>Carolina</h4><p><span class="cw-live"></span>The5th concierge · replies instantly</p></div>'
      + '<button class="cw-iconbtn" id="cw-close2" aria-label="Close">' + ICON.close + '</button></div>'
      + '<div class="cw-scroll"><div class="cw-msgs" id="cw-msgs"></div></div>'
      + '<div class="cw-comp"><div class="cw-comp-row"><textarea class="cw-in" id="cw-in" rows="1" placeholder="Write a message…"></textarea>'
      + '<button class="cw-send" id="cw-send" aria-label="Send">' + ICON.send + '</button></div>'
      + '<p class="cw-cred">Powered by <b>The5th AI</b></p></div>';

    els.msgs = els.win.querySelector('#cw-msgs');
    els.in = els.win.querySelector('#cw-in');
    els.send = els.win.querySelector('#cw-send');

    els.win.querySelector('#cw-back').addEventListener('click', function () { renderPanels(); });
    els.win.querySelector('#cw-close2').addEventListener('click', function () { toggle(false); });
    els.send.addEventListener('click', function () { sendMessage(els.in.value); });
    els.in.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(els.in.value); } });
    els.in.addEventListener('input', function () { els.in.style.height = 'auto'; els.in.style.height = Math.min(els.in.scrollHeight, 100) + 'px'; });

    // paint
    addBotMsg(cfg.greeting, true);
    (conv ? conv.messages : []).forEach(function (m) { addMsg(m.role, m.content, true); });
    if (!conv || conv.messages.length === 0) renderChips();
    setTimeout(function () { els.in.focus(); scrollChat(); }, 200);
  }

  function scrollChat() { var s = els.win.querySelector('.cw-scroll'); if (s) s.scrollTop = s.scrollHeight; }
  function addBotMsg(text, noScroll) { addMsg('assistant', text, noScroll); }
  function addMsg(role, text, noScroll) {
    var wrap = document.createElement('div');
    wrap.className = 'cw-m ' + (role === 'user' ? 'user' : 'bot');
    var inner = '';
    if (role !== 'user') inner += '<div class="cw-m-ava">' + avatarInner() + '</div>';
    inner += '<div class="cw-bub">' + renderMd(text) + '</div>';
    wrap.innerHTML = inner;
    els.msgs.appendChild(wrap);
    if (!noScroll) scrollChat();
  }
  function renderChips() {
    var chips = ['Tell me about the programs', 'Book a call', 'Take the free quiz'];
    var row = document.createElement('div'); row.className = 'cw-chips'; row.id = 'cw-chips';
    chips.forEach(function (l) { var b = document.createElement('button'); b.className = 'cw-chip'; b.textContent = l; b.addEventListener('click', function () { sendMessage(l); }); row.appendChild(b); });
    els.msgs.appendChild(row); scrollChat();
  }
  function showTyping() {
    hideTyping();
    var t = document.createElement('div'); t.className = 'cw-m bot'; t.id = 'cw-typing';
    t.innerHTML = '<div class="cw-m-ava">' + avatarInner() + '</div><div class="cw-typing"><span></span><span></span><span></span></div>';
    els.msgs.appendChild(t); scrollChat();
  }
  function hideTyping() { var t = els.win.querySelector('#cw-typing'); if (t) t.remove(); }

  // ── Conversation flow ──
  function ensureActiveConv() {
    var c = activeConv();
    if (!c) { c = mkConv([]); store.conversations.push(c); store.activeId = c.id; saveStore(); }
    return c;
  }
  function startNewChat(seed) {
    var c = mkConv([]); store.conversations.push(c); store.activeId = c.id; saveStore();
    renderChat();
    if (seed) sendMessage(seed);
  }
  function openConv(id) { store.activeId = id; saveStore(); renderChat(); }

  async function sendMessage(text) {
    text = (text || '').trim();
    if (!text || sending) return;
    var chips = els.win.querySelector('#cw-chips'); if (chips) chips.remove();
    var conv = ensureActiveConv();
    sending = true; if (els.send) els.send.disabled = true;
    addMsg('user', text); conv.messages.push({ role: 'user', content: text }); conv.updatedAt = Date.now(); saveStore();
    if (els.in) { els.in.value = ''; els.in.style.height = 'auto'; }
    showTyping();
    try {
      var r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: conv.messages, timeZone: TZ }) });
      var data = await r.json().catch(function () { return {}; });
      hideTyping();
      if (!r.ok || data.error) { addBotMsg(data.error || 'Sorry, I had trouble there. Could you try again?'); }
      else {
        var reply = data.reply || "I'm here — how can I help?";
        addBotMsg(reply); conv.messages.push({ role: 'assistant', content: reply }); conv.updatedAt = Date.now(); saveStore();
        handleActions(data.actions);
      }
    } catch (e) { hideTyping(); addBotMsg("I couldn't reach the team just now — mind trying again in a moment?"); }
    finally { sending = false; if (els.send) els.send.disabled = false; if (els.in) els.in.focus(); }
  }

  function handleActions(actions) {
    if (!Array.isArray(actions)) return;
    actions.forEach(function (a) {
      if (a && a.type === 'navigate' && typeof a.url === 'string' && a.url.charAt(0) === '/') {
        saveStore();
        try { sessionStorage.setItem(REOPEN, 'chat:' + store.activeId); } catch (e) {}
        setTimeout(function () { window.location.href = a.url; }, 950);
      }
    });
  }

  // ── Panel wiring ──
  function wirePanels() {
    var scroll = els.win.querySelector('#cw-scroll');
    // tab nav
    els.win.querySelectorAll('.cw-tab').forEach(function (b) {
      b.addEventListener('click', function () { tab = b.getAttribute('data-tab'); renderPanels(); });
    });
    var ask = els.win.querySelector('#cw-ask');
    if (ask) ask.addEventListener('click', function () { startNewChat(); });
    var newc = els.win.querySelector('#cw-newconv');
    if (newc) newc.addEventListener('click', function () { startNewChat(); });
    els.win.querySelectorAll('[data-seed]').forEach(function (n) {
      n.addEventListener('click', function () { startNewChat(n.getAttribute('data-seed')); });
    });
    els.win.querySelectorAll('[data-conv]').forEach(function (n) {
      n.addEventListener('click', function () { openConv(n.getAttribute('data-conv')); });
    });
    var ks = els.win.querySelector('#cw-ksearch');
    if (ks) ks.addEventListener('keydown', function (e) { if (e.key === 'Enter' && ks.value.trim()) startNewChat(ks.value.trim()); });
  }

  // ── Open/close ──
  function toggle(open) {
    isOpen = open == null ? !isOpen : open;
    els.win.classList.toggle('cw-show', isOpen);
    els.launcher.classList.toggle('cw-open', isOpen);
    var badge = els.launcher.querySelector('.cw-badge'); if (isOpen && badge) badge.remove();
    if (isOpen) { dismissPromo(); if (mode === 'panels' && !els.win.innerHTML) renderPanels(); }
  }

  // ── Proactive popup ──
  function dismissPromo(key) {
    if (els.promo) { els.promo.classList.remove('cw-show'); }
    if (key) { try { localStorage.setItem(DISMISS[key], '1'); } catch (e) {} }
  }
  function maybeShowPromo() {
    if (promoScheduled || isOpen) return;
    if (!cfg.proactive || !cfg.proactive.enabled) return;
    // don't nag if they already have a real conversation
    var hasChat = store.conversations.some(function (c) { return c.messages.length > 0; });
    if (hasChat) return;

    var first = isFirstTime();
    var key = first ? 'gift' : 'quiz';
    var dismissed = false; try { dismissed = localStorage.getItem(DISMISS[key]) === '1'; } catch (e) {}
    if (dismissed) return;

    var data = first ? (cfg.proactive.gift || {}) : (cfg.proactive.quiz || {});
    var message = data.message
      || (first
        ? '🎁 I have a free gift for you — a short PDF on how to make your first $3K/month in your coaching business. Want it?'
        : 'Curious what’s quietly holding your business back? Take our free 60-second assessment — I’ll walk you through it.');
    var ctaLabel = first ? 'Yes, send my gift 🎁' : 'Show me the quiz';
    var seed = first ? "Yes! I'd love the free $3K/month PDF — please send it over." : 'I want to take the quiz — can you guide me through it?';
    var icon = first ? ICON.gift : ICON.chart;

    promoScheduled = true;
    var delay = Math.max(0, Math.min(120, cfg.proactive.delay || 12)) * 1000;
    setTimeout(function () {
      if (isOpen) return;
      var p = el('<div class="cw cw-promo"><button class="cw-promo-x" aria-label="Dismiss">' + ICON.close + '</button>'
        + '<div class="cw-promo-ic">' + icon + '</div>'
        + '<div class="cw-promo-msg">' + esc(message) + '</div>'
        + '<button class="cw-promo-cta">' + ctaLabel + '</button>'
        + '<button class="cw-promo-no">Maybe later</button></div>');
      document.body.appendChild(p); els.promo = p;
      p.querySelector('.cw-promo-x').addEventListener('click', function () { dismissPromo(key); });
      p.querySelector('.cw-promo-no').addEventListener('click', function () { dismissPromo(key); });
      p.querySelector('.cw-promo-cta').addEventListener('click', function () {
        dismissPromo(key); toggle(true); startNewChat(seed);
      });
      requestAnimationFrame(function () { p.classList.add('cw-show'); });
    }, delay);
  }

  // ── Build shell ──
  function build() {
    injectStyles(); suppressIntercom();
    var launcher = el('<button class="cw cw-launcher" aria-label="Chat with Carolina">'
      + '<span class="l-chat">' + ICON.msg + '</span><span class="l-close">' + ICON.close + '</span>'
      + '<span class="cw-badge">1</span></button>');
    var win = el('<div class="cw cw-win" role="dialog" aria-label="The5th assistant"></div>');
    document.body.appendChild(launcher); document.body.appendChild(win);
    els.launcher = launcher; els.win = win;
    launcher.addEventListener('click', function () { toggle(); });
    renderPanels();

    // auto-reopen after navigation (e.g. guiding through the quiz)
    var reopen = null; try { reopen = sessionStorage.getItem(REOPEN); } catch (e) {}
    if (reopen && reopen.indexOf('chat:') === 0) {
      try { sessionStorage.removeItem(REOPEN); } catch (e) {}
      var id = reopen.slice(5);
      if (store.conversations.some(function (c) { return c.id === id; })) { store.activeId = id; toggle(true); renderChat(); }
    }
  }

  function applyConfig() {
    // refresh visible avatars/greeting after async config load — never disrupt an open chat
    if (mode === 'panels') renderPanels();
  }

  function init() {
    loadStore();
    visitCount = trackVisit();
    build();
    fetch(CONFIG_API).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d) { maybeShowPromo(); return; }
      if (d.avatar_url) cfg.avatar = d.avatar_url;
      if (d.greeting) cfg.greeting = d.greeting;
      if (d.proactive) cfg.proactive = d.proactive;
      applyConfig();
      maybeShowPromo();
    }).catch(function () { maybeShowPromo(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
