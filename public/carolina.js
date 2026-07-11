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
  // Stable anonymous visitor id (set by track.js) so the CRM can merge this
  // chat into the visitor's journey once they identify themselves.
  function vid() { try { return window.__a5vid || window.localStorage.getItem('a5_vid') || ''; } catch (e) { return ''; } }

  var TZ = 'UTC';
  try { TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) {}
  // Official The5th AI launcher icon (public/images/). Falls back to a
  // built-in glyph if the asset is missing. Swap the path to change the icon.
  var LAUNCHER_ICON = '/images/Untitled%20design%20-%202026-07-09T192610.060.png';

  // ── Config (admin-driven) ──
  var cfg = {
    avatar: null,
    greeting: "Hi, I'm Carolina 👋 I help women 40+ turn their expertise into income with The5th. Curious about our programs, or want to book a quick call with the team?",
    proactive: { enabled: true, delay: 10 },   // context-aware greetings on; admin can set enabled:false to opt out
    agents: {},
    features: { attachments: true, booking: true }
  };

  // The team. Carolina (sales) → Natasha (service) → Benjamin (support).
  var AGENT_DEFAULTS = {
    carolina: { name: 'Carolina', role: 'Sales concierge' },
    natasha: { name: 'Natasha', role: 'Customer success' },
    benjamin: { name: 'Benjamin', role: 'Support specialist' }
  };
  function agentInfo(key) {
    key = key || 'carolina';
    var c = (cfg.agents && cfg.agents[key]) || {};
    var d = AGENT_DEFAULTS[key] || AGENT_DEFAULTS.carolina;
    return { key: key, name: c.name || d.name, role: c.role || d.role, avatar: c.avatar || null };
  }
  function agentAva(key) {
    var a = agentInfo(key);
    return a.avatar ? '<img src="' + esc(a.avatar) + '" alt="' + esc(a.name) + '">' : '<span>' + esc(a.name.charAt(0)) + '</span>';
  }
  // Overlapping cluster of the whole team (Intercom-style faces).
  function teamCluster(big) {
    var html = '<div class="cw-team' + (big ? ' cw-team-lg' : '') + '" aria-label="The5th team — online">';
    ['carolina', 'natasha', 'benjamin'].forEach(function (k) {
      html += '<span class="cw-tm" title="' + esc(agentInfo(k).name) + '">' + agentAva(k) + '</span>';
    });
    return html + '<span class="cw-team-dot"></span></div>';
  }
  // Team faces + an AI badge — "both AI and humans are available".
  function heroStack() {
    var html = '<div class="cw-hstack">';
    ['carolina', 'natasha', 'benjamin'].forEach(function (k) {
      html += '<span class="cw-hs-face">' + agentAva(k) + '</span>';
    });
    return html + '<span class="cw-hs-ai" title="The5th AI">' + ICON.spark + '</span></div>';
  }
  var leadName = '';
  var leadEmail = '';
  try { leadEmail = localStorage.getItem('cw_lead_email') || ''; leadName = leadName || localStorage.getItem('cw_lead_name') || ''; } catch (e) {}
  function setLead(name, email) {
    if (name) { leadName = String(name).split(' ')[0]; try { localStorage.setItem('cw_lead_name', leadName); } catch (e) {} }
    if (email) { leadEmail = String(email).trim(); try { localStorage.setItem('cw_lead_email', leadEmail); } catch (e) {} }
  }
  var viewContext = '';   // what content the visitor is viewing, for AI context awareness
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  // Respect the OS "reduce motion" setting — disables scale/slide/streaming.
  var REDUCE = false;
  try { REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}
  function shake(el) { if (!el || REDUCE) return; el.classList.remove('cw-shake'); void el.offsetWidth; el.classList.add('cw-shake'); }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'cw cw-toast'; t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { if (t.parentNode) t.remove(); }, 320); }, 1600);
  }
  // Cascading entrance for the cards in a freshly-rendered panel.
  function staggerIn(root) {
    if (REDUCE) return;
    var nodes = root.querySelectorAll('.cw-home > .cw-sect > .cw-feat, .cw-home .cw-product, .cw-home .cw-kbcard, .cw-home .cw-kgrid, .cw-home .cw-conv, .cw-home .cw-anc, .cw-home .cw-acard, .cw-home .cw-vcard, .cw-home .cw-carousel, .cw-home .cw-community, .cw-home .cw-news, .cw-home .cw-empty');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.animationDelay = Math.min(i, 10) * 40 + 'ms';
      nodes[i].classList.add('cw-rise');
    }
  }

  // ── State ──
  var store = { conversations: [], activeId: null };
  var tab = 'home';        // home | messages | knowledge
  var mode = 'panels';     // panels | chat
  var isOpen = false;
  var sending = false;
  var promoScheduled = false;
  var els = {};
  var homeTimers = [];
  function clearHomeTimers() { homeTimers.forEach(function (t) { clearInterval(t); }); homeTimers = []; }
  var homeScroll = 0, pendingScroll = null;   // remember Home scroll across chat
  var lastMsgKey = null;                        // message grouping (role+agent)
  var thinkTimer = null;                        // rotating "thinking" status
  var phTimer = null;                           // rotating composer placeholder
  var histIndex = -1;                           // composer prompt history cursor
  var slashIndex = 0;                           // slash-command menu selection
  var attachments = [];                         // pending composer attachments
  var IMG_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  var MAX_FILE = 7 * 1024 * 1024;               // 7MB
  function fmtSize(n) { return n < 1024 * 1024 ? Math.round(n / 1024) + ' KB' : (n / 1048576).toFixed(1) + ' MB'; }

  // ── Appearance (dark/light) + language ──
  var theme = 'dark'; try { theme = localStorage.getItem('the5th_carolina_theme') || 'dark'; } catch (e) {}
  var lang = 'en'; try { lang = localStorage.getItem('the5th_carolina_lang') || 'en'; } catch (e) {}
  var LANGS = [['en', 'English'], ['fr', 'Français'], ['de', 'Deutsch'], ['es', 'Español'], ['it', 'Italiano'], ['pt', 'Português'], ['nl', 'Nederlands']];
  function langName(c) { return ({ en: 'English', fr: 'French', de: 'German', es: 'Spanish', it: 'Italian', pt: 'Portuguese', nl: 'Dutch' })[c] || 'English'; }
  var I18N = {
    en: { hi: 'Hello there.', help: 'How can we help?', ask: 'Ask a question', askSub: 'Our AI agent and team are here to help', ph: 'Ask The5th AI anything…', welcome: 'Welcome to The5th AI 👋' },
    fr: { hi: 'Bonjour.', help: 'Comment pouvons-nous aider ?', ask: 'Posez une question', askSub: 'Notre agent IA et notre équipe sont là pour vous aider', ph: 'Demandez tout à The5th AI…', welcome: 'Bienvenue chez The5th AI 👋' },
    de: { hi: 'Hallo.', help: 'Wie können wir helfen?', ask: 'Stellen Sie eine Frage', askSub: 'Unser KI-Agent und Team helfen gerne', ph: 'Fragen Sie The5th AI…', welcome: 'Willkommen bei The5th AI 👋' },
    es: { hi: 'Hola.', help: '¿Cómo podemos ayudar?', ask: 'Haz una pregunta', askSub: 'Nuestro agente de IA y equipo están aquí para ayudar', ph: 'Pregúntale lo que sea a The5th AI…', welcome: 'Bienvenido a The5th AI 👋' },
    it: { hi: 'Ciao.', help: 'Come possiamo aiutarti?', ask: 'Fai una domanda', askSub: 'Il nostro agente AI e il team sono qui per aiutarti', ph: 'Chiedi qualsiasi cosa a The5th AI…', welcome: 'Benvenuto in The5th AI 👋' },
    pt: { hi: 'Olá.', help: 'Como podemos ajudar?', ask: 'Faça uma pergunta', askSub: 'Nosso agente de IA e equipe estão aqui para ajudar', ph: 'Pergunte qualquer coisa ao The5th AI…', welcome: 'Bem-vindo ao The5th AI 👋' },
    nl: { hi: 'Hallo.', help: 'Waarmee kunnen we helpen?', ask: 'Stel een vraag', askSub: 'Onze AI-agent en team helpen je graag', ph: 'Vraag The5th AI alles…', welcome: 'Welkom bij The5th AI 👋' }
  };
  function T(k) { var d = I18N[lang] || I18N.en; return d[k] || I18N.en[k] || k; }
  function applyTheme() { if (els.win) els.win.classList.toggle('cw-light', theme === 'light'); if (els.promo) els.promo.classList.toggle('cw-light', theme === 'light'); }
  function setTheme(t) { theme = t; try { localStorage.setItem('the5th_carolina_theme', t); } catch (e) {} applyTheme(); }
  function setLang(l) { lang = l; try { localStorage.setItem('the5th_carolina_lang', l); } catch (e) {} if (mode === 'panels') showTab(tab); }

  var PLACEHOLDERS = [
    'Ask The5th AI anything…', 'Ask about Fast Forward…', 'Which program fits me?…',
    'Compare Fast Forward vs The5th AI…', 'Explain pricing & fit…', 'Book a strategy call…'
  ];
  var SLASH = [
    { cmd: '/help', desc: 'What can you help with?', run: function () { sendMessage('What can you help me with?'); } },
    { cmd: '/programs', desc: 'See the programs', run: function () { sendMessage('Tell me about your programs.'); } },
    { cmd: '/fastforward', desc: 'Learn about Fast Forward', run: function () { sendMessage('Tell me about Fast Forward.'); } },
    { cmd: '/ai', desc: 'Learn about The5th AI', run: function () { sendMessage('Tell me about The5th AI.'); } },
    { cmd: '/pricing', desc: 'Pricing & fit', run: function () { sendMessage('Can you explain pricing and fit?'); } },
    { cmd: '/quiz', desc: 'Take the free assessment', run: function () { sendMessage('I want to take the free assessment.'); } },
    { cmd: '/book', desc: 'Book a strategy call', run: function () { sendMessage("I'd like to book a strategy call."); } },
    { cmd: '/support', desc: 'Talk to a person', run: function () { sendMessage('I need help from a person.'); } },
    { cmd: '/clear', desc: 'Clear this chat', run: function () { chatMenu('clear'); } }
  ];

  // Nav badge state (data-driven; number | 'NEW' | 'dot' | null). None by default.
  var badges = { home: null, chat: null, knowledge: null, discover: null, account: null };
  var NAV_ORDER = ['home', 'chat', 'knowledge', 'discover', 'account'];
  function navBadge(b) {
    if (!b) return '';
    if (b === 'dot') return '<span class="cw-nav-dot"></span>';
    if (typeof b === 'number') return b > 0 ? '<span class="cw-nav-badge">' + (b > 99 ? '99+' : b) + '</span>' : '';
    return '<span class="cw-nav-badge">' + esc(b) + '</span>';
  }
  function notifEnabled() { try { return localStorage.getItem('the5th_carolina_notif') !== '0'; } catch (e) { return true; } }

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
    return { id: uid(), messages: messages || [], agent: 'carolina', createdAt: Date.now(), updatedAt: Date.now() };
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
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.7 12 3.5l9 7.2"/><path d="M5.5 9.4V20a1 1 0 0 0 1 1H10v-4.6a2 2 0 0 1 4 0V21h3.5a1 1 0 0 0 1-1V9.4"/></svg>',
    msg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4 19.5l1.4-4.2A7.5 7.5 0 1 1 20 11.5Z"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.4C10.4 5 8 4.5 4 4.8V18c4-.3 6.4.2 8 1.6 1.6-1.4 4-1.9 8-1.6V4.8c-4-.3-6.4.2-8 1.6z"/><path d="M12 6.4v13.2"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7S12 3 9 3a2.5 2.5 0 0 0 0 5M12 7s0-4 3-4a2.5 2.5 0 0 1 0 5"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 4-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 3.2 2 2 0 0 1 4 1h2a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.1 8.9a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="m14.9 9.1-1.6 4.2-4.2 1.6 1.6-4.2z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9.2" r="3.3"/><path d="M6 19.2a6.2 6.2 0 0 1 12 0"/><circle cx="12" cy="12" r="9.2"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 6a3 3 0 0 1 0 5.5M20.5 19a5.5 5.5 0 0 0-4-5.3"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z" fill="currentColor" stroke="none"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 2 2v3h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 13V4h3v9zM17 13l-4 8a2 2 0 0 1-2-2v-3H6a2 2 0 0 1-2-2.3l1.2-6A2 2 0 0 1 7.2 4H17"/></svg>',
    clip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.6 1.6 0 0 1-2.3-2.3l7.8-7.8"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 3v3M16 3v3"/></svg>'
  };

  function avatarInner() {
    var a = agentInfo('carolina');
    if (a.avatar) return '<img src="' + esc(a.avatar) + '" alt="Carolina">';
    if (cfg.avatar) return '<img src="' + esc(cfg.avatar) + '" alt="Carolina">';
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
      '.cw-win{position:fixed;right:24px;bottom:96px;z-index:2147482500;width:448px;max-width:calc(100vw - 40px);height:min(700px,calc(100dvh - 120px));background:var(--bg);border:1px solid var(--bd);border-radius:28px;box-shadow:0 40px 100px rgba(0,0,0,.55);display:flex;flex-direction:column;overflow:hidden;color:var(--tx);opacity:0;transform:translateY(20px) scale(.97);transform-origin:bottom right;pointer-events:none;transition:opacity .28s var(--sp),transform .34s var(--sp),width .42s var(--sp),height .42s var(--sp);}',
      '.cw-win.cw-show{opacity:1;transform:none;pointer-events:auto;}',
      // Reading mode — widen the window ~3x on desktop so long content (case
      // studies, program pages) is comfortable to read; shrinks back on Back.
      '@media(min-width:481px){',
      '.cw-win.cw-wide{width:min(1180px,calc(100vw - 44px));height:min(860px,calc(100dvh - 64px));}',
      '.cw-win.cw-wide .cw-article{max-width:940px;margin:0 auto;}',
      '.cw-win.cw-wide .cw-art-body{max-width:760px;margin-left:auto;margin-right:auto;}',
      '.cw-win.cw-wide .cw-richbody{font-size:15.5px;line-height:1.75;}',
      '}',
      // Always-visible close inside the window — the reliable exit on mobile
      // (the launcher can sit behind a full-screen window). Hidden on desktop.
      '.cw-mclose{display:none;position:fixed;top:calc(10px + env(safe-area-inset-top,0px));right:12px;z-index:2147482600;width:44px;height:44px;border-radius:50%;border:none;background:rgba(0,0,0,.5);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#fff;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.4);transition:transform .16s var(--sp);}',
      '.cw-mclose svg{width:23px;height:23px;}.cw-mclose:active{transform:scale(.88);}',
      '.cw-scroll{flex:1;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.12) transparent;}',
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
      // premium proactive bubble (agent avatar + typing → message)
      '.cw-promo2{padding-top:16px;}',
      '.cw-promo-head{display:flex;align-items:center;gap:10px;position:relative;z-index:1;margin-bottom:12px;}',
      '.cw-promo-ava{width:36px;height:36px;border-radius:50%;overflow:hidden;flex-shrink:0;background:linear-gradient(145deg,var(--acc),#9c7f2c);display:flex;align-items:center;justify-content:center;color:#1a1206;font:700 15px "Inter";}',
      '.cw-promo-ava img{width:100%;height:100%;object-fit:cover;}',
      '.cw-promo-who{flex:1;min-width:0;}',
      '.cw-promo-who b{display:block;font:600 14px "Inter";color:#fff;}',
      '.cw-promo-who i{font:400 11.5px "Inter";color:var(--tx2);font-style:normal;}',
      '.cw-promo-body{position:relative;z-index:1;min-height:22px;margin-bottom:14px;animation:cwFade .3s var(--sp);}',
      '.cw-promo-typing{margin:0;}',
      '.cw-promo-actions{position:relative;z-index:1;animation:cwFade .3s var(--sp);}',
      '@keyframes cwBounce{0%{transform:translateY(0);}30%{transform:translateY(-8px);}55%{transform:translateY(0);}72%{transform:translateY(-4px);}100%{transform:translateY(0);}}',
      '.cw-launcher.cw-bounce{animation:cwBounce .9s var(--sp);}',
      // mobile — full-screen, keyboard-safe (visualViewport sets --cw-kb),
      // safe-area aware, with the always-visible close button shown.
      '@media(max-width:480px){',
      '.cw-win{right:0;left:0;bottom:0;top:0;width:100%;max-width:100%;height:100dvh;height:calc(100dvh - var(--cw-kb,0px));border-radius:0;transition:opacity .26s var(--sp),transform .3s var(--sp);}',
      '.cw-mclose.cw-mshow{display:flex;}',
      '.cw-launcher{right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));}',
      '.cw-promo{right:12px;left:12px;width:auto;bottom:calc(90px + env(safe-area-inset-bottom,0px));}',
      '.cw-hero,.cw-chead,.cw-topbar{padding-top:calc(16px + env(safe-area-inset-top,0px));}',
      '.cw-scroll{scroll-padding-bottom:24px;}',
      '}',
      '@media(prefers-reduced-motion:reduce){.cw *{animation:none !important;transition:none !important;}}'
    ].join('\n');
    var st = document.createElement('style'); st.id = 'carolina-styles'; st.textContent = css; document.head.appendChild(st);
    injectHomeStyles();
  }

  function injectHomeStyles() {
    if (document.getElementById('carolina-home-styles')) return;
    var css = [
      '.cw-home{padding-bottom:24px;}',
      // sticky top bar
      '.cw-topbar{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;height:72px;padding:0 16px;background:rgba(13,13,13,0);transition:background .3s var(--sp),border-color .3s,backdrop-filter .3s;border-bottom:1px solid transparent;}',
      '.cw-topbar.scrolled{background:rgba(13,13,13,.72);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--bd);}',
      '.cw-tb-left{display:flex;align-items:center;gap:12px;}',
      '.cw-greet{font:500 14px/1 "Inter";color:var(--tx2);}',
      '.cw-tb-right{display:flex;align-items:center;gap:10px;}',
      '.cw-team{position:relative;display:flex;align-items:center;}',
      '.cw-tm{width:34px;height:34px;border-radius:50%;overflow:hidden;border:2px solid #241530;background:linear-gradient(145deg,var(--acc),#9c7f2c);display:flex;align-items:center;justify-content:center;color:#1a1206;font:700 13px "Inter";margin-left:-11px;box-shadow:0 3px 10px rgba(0,0,0,.4);transition:transform .2s var(--sp);}',
      '.cw-tm:first-child{margin-left:0;}',
      '.cw-team:hover .cw-tm{margin-left:-6px;}.cw-team:hover .cw-tm:first-child{margin-left:0;}',
      '.cw-tm img{width:100%;height:100%;object-fit:cover;}',
      '.cw-team-dot{position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border-radius:50%;background:#4ade80;border:2px solid #241530;box-shadow:0 0 0 1px rgba(0,0,0,.2);}',
      '.cw-bell{background:var(--card);border:1px solid var(--bd);}',
      // hero title
      '.cw-htitle{padding:8px 16px 18px;}',
      '.cw-htitle h1{font:700 28px/1.1 "Inter";letter-spacing:-.02em;color:#fff;margin:0 0 6px;}',
      '.cw-htitle p{font:400 15px/1.4 "Inter";color:var(--tx2);margin:0;}',
      // search
      '.cw-search{display:flex;align-items:center;gap:11px;height:58px;margin:0 16px;padding:0 16px;background:var(--bg2);border:1px solid var(--bd);border-radius:18px;color:var(--mut);transition:border-color .25s var(--sp),box-shadow .25s,background .2s;}',
      '.cw-search:hover{background:#191919;}',
      '.cw-search:focus-within{border-color:rgba(201,168,76,.55);box-shadow:0 0 0 4px rgba(201,168,76,.12),0 10px 30px rgba(0,0,0,.3);}',
      '.cw-search svg{width:19px;height:19px;flex-shrink:0;}',
      '.cw-search input{flex:1;background:none;border:none;outline:none;color:#fff;font:400 15px "Inter";height:100%;}',
      '.cw-search input::placeholder{color:var(--mut);}',
      '.cw-search-spark{color:var(--acc);display:flex;}.cw-search-spark svg{width:18px;height:18px;}',
      // pills
      '.cw-pills{display:flex;gap:8px;overflow-x:auto;padding:16px;scrollbar-width:none;}',
      '.cw-pills::-webkit-scrollbar{display:none;}',
      '.cw-pill{flex-shrink:0;height:36px;padding:0 15px;border-radius:999px;background:var(--card);border:1px solid var(--bd);color:var(--tx2);font:500 13px "Inter";cursor:pointer;white-space:nowrap;transition:transform .16s var(--sp),background .16s,color .16s,border-color .16s;}',
      '.cw-pill:hover{transform:translateY(-1px);background:#201a10;color:var(--acc2);border-color:rgba(201,168,76,.3);}',
      // section title
      '.cw-sect{padding:0 16px;}',
      '.cw-h3{font:600 20px/1.2 "Inter";color:#fff;margin:32px 2px 16px;letter-spacing:-.01em;}',
      // featured card
      '.cw-feat{background:var(--card);border:1px solid var(--bd);border-radius:18px;overflow:hidden;margin-bottom:16px;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.25);transition:transform .18s var(--sp),box-shadow .18s,border-color .18s;}',
      '.cw-feat:hover{transform:translateY(-2px) scale(1.01);box-shadow:0 18px 44px rgba(0,0,0,.4);border-color:rgba(201,168,76,.25);}',
      '.cw-cover{position:relative;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;overflow:hidden;}',
      '.cw-cover::after{content:"";position:absolute;inset:0;background:radial-gradient(120% 80% at 70% 10%,rgba(255,255,255,.12),transparent 60%);}',
      '.cw-cover-emoji{font-size:52px;filter:drop-shadow(0 6px 16px rgba(0,0,0,.4));position:relative;z-index:1;}',
      // premium generative artwork (no image): glow orb + glass ring + glyph + grain
      '.cw-cart{position:relative;}',
      '.cw-cart::before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.05) 1px,transparent 1px);background-size:4px 4px;opacity:.5;mix-blend-mode:overlay;pointer-events:none;}',
      '.cw-cart-orb{position:absolute;top:-45%;right:-28%;width:78%;height:160%;background:radial-gradient(circle,var(--cag,rgba(201,168,76,.3)),transparent 66%);pointer-events:none;}',
      '.cw-cart-ring{position:absolute;left:50%;top:50%;width:126px;height:126px;transform:translate(-50%,-50%);border-radius:50%;border:1px solid var(--ca,#C9A84C);opacity:.3;box-shadow:0 0 50px var(--cag,rgba(201,168,76,.3)) inset,0 0 28px var(--cag,rgba(201,168,76,.3));pointer-events:none;}',
      '.cw-cart-glyph{position:relative;z-index:1;font-size:50px;line-height:1;color:#fff;filter:drop-shadow(0 8px 22px rgba(0,0,0,.55));}',
      '.cw-cover-hero .cw-cart-glyph{opacity:.92;}',
      '.cw-cover-lg{aspect-ratio:16/8;border-radius:0;}',
      '.cw-feat-body{padding:18px;}',
      '.cw-feat-body h4{font:600 18px/1.25 "Inter";color:#fff;margin:0 0 4px;}',
      '.cw-feat-sub{font:600 12.5px/1 "Inter";color:var(--acc);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;}',
      '.cw-feat-desc{font:400 13.5px/1.6 "Inter";color:var(--tx2);margin:0 0 16px;}',
      '.cw-feat-btns{display:flex;gap:10px;flex-wrap:wrap;}',
      '.cw-btn{border:none;border-radius:14px;padding:11px 18px;font:600 13.5px "Inter";cursor:pointer;transition:transform .16s var(--sp),box-shadow .18s,background .18s;}',
      '.cw-btn-primary{background:linear-gradient(145deg,var(--acc),#a9862f);color:#1a1206;box-shadow:0 8px 22px rgba(201,168,76,.24);}',
      '.cw-btn-primary:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(201,168,76,.36);}',
      '.cw-btn-ghost{background:transparent;border:1px solid var(--bd);color:#fff;}',
      '.cw-btn-ghost:hover{background:var(--hover);border-color:rgba(255,255,255,.18);}',
      // knowledge card
      '.cw-kbcard{background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:18px;}',
      '.cw-kbcard-head{display:flex;align-items:center;gap:13px;margin-bottom:16px;}',
      '.cw-kbcard-head h5{font:600 15px/1.2 "Inter";color:#fff;margin:0 0 2px;}',
      '.cw-kbcard-head p{font:400 12.5px "Inter";color:var(--tx2);margin:0;}',
      '.cw-catrow{display:flex;flex-wrap:wrap;gap:8px;}',
      '.cw-cat{padding:8px 14px;border-radius:999px;background:var(--bg2);border:1px solid var(--bd);color:var(--tx2);font:500 12.5px "Inter";cursor:pointer;transition:background .16s,color .16s,border-color .16s;}',
      '.cw-cat:hover{background:#201a10;color:var(--acc2);border-color:rgba(201,168,76,.3);}',
      // carousel
      '.cw-carousel{position:relative;overflow:hidden;border-radius:18px;}',
      '.cw-track{display:flex;transition:transform .5s var(--sp);}',
      '.cw-slide{flex:0 0 100%;background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:22px;}',
      '.cw-slide-rev{font:700 24px/1 "Inter";color:var(--acc);margin-bottom:12px;}',
      '.cw-slide-q{font:400 15px/1.6 "Inter";color:#ECECEC;margin:0 0 14px;}',
      '.cw-slide-who{font:500 13px "Inter";color:var(--tx2);}',
      '.cw-dots{display:flex;gap:6px;justify-content:center;margin-top:14px;}',
      '.cw-dots span{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2);transition:background .2s,width .2s;}',
      '.cw-dots span.on{background:var(--acc);width:18px;border-radius:3px;}',
      // article viewer
      '.cw-artbar{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--bd);background:rgba(13,13,13,.9);backdrop-filter:blur(20px);}',
      '.cw-artbar>span{flex:1;font:600 15px "Inter";color:#fff;}',
      '.cw-article{}',
      '.cw-slidein{animation:cwSlide .34s var(--sp);}',
      '@keyframes cwSlide{from{opacity:0;transform:translateX(24px);}to{opacity:1;transform:none;}}',
      '.cw-art-body{padding:20px 18px 30px;}',
      '.cw-art-body h1{font:700 26px/1.2 "Inter";color:#fff;margin:16px 0 4px;letter-spacing:-.02em;}',
      '.cw-art-desc{font:400 15px/1.7 "Inter";color:var(--tx2);margin:14px 0 4px;}',
      '.cw-art-list{list-style:none;padding:0;margin:16px 0 0;}',
      '.cw-art-list li{position:relative;padding-left:24px;font:400 14px/1.5 "Inter";color:#ECECEC;margin-bottom:10px;}',
      '.cw-art-list li::before{content:"";position:absolute;left:4px;top:8px;width:7px;height:7px;border-radius:50%;background:var(--acc);}',
      // ── card component system ──
      '.cw-feat{position:relative;}',
      '.cw-feat:focus-visible,.cw-vcard:focus-visible,.cw-acard:focus-visible{outline:2px solid var(--acc);outline-offset:2px;}',
      '.cw-hero-card{border-color:rgba(201,168,76,.22);box-shadow:0 16px 42px rgba(0,0,0,.4);}',
      '.cw-cov-img{width:100%;height:100%;object-fit:cover;}',
      '.cw-cover-grad{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15) 0%,transparent 30%,transparent 60%,rgba(13,13,13,.55) 100%);}',
      '.cw-feat:hover .cw-cov-img{transform:scale(1.02);}',
      '.cw-cover .cw-cov-img{transition:transform .4s var(--sp);}',
      // category badge
      '.cw-badge2{position:absolute;top:14px;left:14px;z-index:2;height:26px;display:inline-flex;align-items:center;padding:0 12px;border-radius:999px;background:rgba(13,13,13,.6);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.14);color:#fff;font:600 11.5px/1 "Inter";letter-spacing:.04em;text-transform:uppercase;}',
      '.cw-art-body .cw-badge2,.cw-abody .cw-badge2{position:static;margin-bottom:10px;}',
      // cta arrow slide
      '.cw-cta-arrow{display:inline-block;font-style:normal;transition:transform .18s var(--sp);}',
      '.cw-btn-primary:hover .cw-cta-arrow{transform:translateX(4px);}',
      // meta row
      '.cw-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font:400 13px "Inter";color:var(--mut);margin:12px 0 2px;}',
      '.cw-meta-dot{color:var(--mut);opacity:.6;}',
      // feature grid (two column)
      '.cw-feat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;margin:2px 0 16px;}',
      '.cw-feat-item{font:500 13px/1.4 "Inter";color:#D4D4D8;}',
      // info row
      '.cw-info-row{display:flex;gap:10px;margin:0 0 16px;border-top:1px solid var(--bd);padding-top:14px;}',
      '.cw-info-cell{flex:1;}',
      '.cw-info-cell span{display:block;font:700 14px/1.2 "Inter";color:#fff;}',
      '.cw-info-cell small{font:500 11px/1 "Inter";color:var(--mut);text-transform:uppercase;letter-spacing:.04em;}',
      // premium lock
      '.cw-locked .cw-cover{filter:blur(6px) saturate(.7);}',
      '.cw-lock{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(13,13,13,.5);}',
      '.cw-lock-badge{font:700 13px "Inter";color:#fff;background:rgba(0,0,0,.5);padding:6px 14px;border-radius:999px;border:1px solid var(--bd);}',
      // knowledge count
      '.cw-count{font:600 12px "Inter";color:var(--acc);margin-right:8px;}',
      // announcement (reuses .cw-card)
      '.cw-anc{width:100%;text-align:left;}',
      // video card
      '.cw-hscroll{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none;scroll-snap-type:x mandatory;}',
      '.cw-hscroll::-webkit-scrollbar{display:none;}',
      '.cw-vcard{flex:0 0 220px;scroll-snap-align:start;background:var(--card);border:1px solid var(--bd);border-radius:16px;overflow:hidden;cursor:pointer;transition:transform .18s var(--sp),border-color .18s;}',
      '.cw-vcard:hover{transform:translateY(-2px);border-color:rgba(201,168,76,.25);}',
      '.cw-vthumb{position:relative;aspect-ratio:16/9;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;}',
      '.cw-play{width:40px;height:40px;border-radius:50%;background:rgba(13,13,13,.65);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;padding-left:3px;transition:transform .2s var(--sp);}',
      '.cw-vcard:hover .cw-play{transform:scale(1.12);}',
      '.cw-vthumb .cw-dur{position:absolute;bottom:8px;right:8px;background:rgba(13,13,13,.75);color:#fff;font:600 11px "Inter";padding:3px 7px;border-radius:6px;}',
      '.cw-vbody{padding:12px 14px;}',
      '.cw-vbody h5{font:600 14px/1.35 "Inter";color:#fff;margin:0 0 3px;}',
      '.cw-vbody p{font:400 12px "Inter";color:var(--tx2);margin:0;}',
      // article card (compact horizontal)
      '.cw-acard{display:flex;gap:14px;align-items:center;background:var(--card);border:1px solid var(--bd);border-radius:16px;padding:12px;margin-bottom:10px;cursor:pointer;transition:transform .18s var(--sp),border-color .18s;}',
      '.cw-acard:hover{transform:translateY(-2px);border-color:rgba(201,168,76,.25);}',
      '.cw-athumb{width:76px;height:76px;flex-shrink:0;border-radius:12px;background-size:cover;background-position:center;}',
      '.cw-abody{flex:1;min-width:0;}',
      '.cw-abody h5{font:600 15px/1.35 "Inter";color:#fff;margin:0 0 4px;}',
      // skeleton
      '.cw-skel{pointer-events:none;}',
      '.cw-sk{position:relative;overflow:hidden;background:#1a1a1a;}',
      '.cw-sk::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent);animation:cwShine 1.4s infinite;}',
      '@keyframes cwShine{from{transform:translateX(-100%);}to{transform:translateX(100%);}}',
      '.cw-sk-line{height:12px;border-radius:6px;margin:10px 0;}',
      // ── floating glass navigation (overrides base) ──
      '.cw-nav{margin:0 16px 16px;height:68px;display:flex;align-items:center;justify-content:space-around;gap:2px;padding:0 10px;background:rgba(22,22,22,.92);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);border:1px solid rgba(255,255,255,.06);border-radius:22px;box-shadow:0 24px 60px rgba(0,0,0,.4);flex-shrink:0;transition:transform .32s var(--sp),opacity .3s;}',
      '.cw-nav.tuck{transform:translateY(12px);opacity:.92;}',
      '.cw-tab{position:relative;display:flex;align-items:center;justify-content:center;width:50px;height:50px;border:none;background:transparent;color:#7A7A82;cursor:pointer;border-radius:16px;transition:background .28s var(--sp),color .25s,transform .1s var(--sp);}',
      '.cw-tab-glow{position:absolute;inset:0;border-radius:16px;opacity:0;background:radial-gradient(circle at 50% 45%,rgba(201,168,76,.28),transparent 68%);transition:opacity .3s;}',
      '.cw-tab-ic{position:relative;display:flex;align-items:center;justify-content:center;transition:transform .2s var(--sp);}',
      '.cw-tab-ic svg{width:23px;height:23px;}',
      '.cw-tab.on{background:rgba(255,255,255,.07);color:var(--acc);}',
      '.cw-tab.on .cw-tab-glow{opacity:1;}',
      '.cw-tab.on .cw-tab-ic{animation:cwPop .34s var(--sp);}',
      '@keyframes cwPop{0%{transform:scale(1);}50%{transform:scale(1.16);}100%{transform:scale(1);}}',
      '.cw-tab:not(.on):hover{background:rgba(255,255,255,.03);color:#c9c9d0;}',
      '.cw-tab:not(.on):hover .cw-tab-ic{transform:translateY(-1px);}',
      '.cw-tab:active{transform:scale(.92);}',
      '.cw-tab:focus-visible{outline:2px solid var(--acc);outline-offset:2px;}',
      // agent handoff separator
      '.cw-join{display:flex;align-items:center;justify-content:center;gap:8px;margin:6px auto 2px;padding:5px 12px;background:rgba(255,255,255,.04);border:1px solid var(--bd);border-radius:999px;width:fit-content;}',
      '.cw-join-ava{width:20px;height:20px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,var(--acc),#9c7f2c);color:#1a1206;font:700 10px "Inter";}',
      '.cw-join-ava img{width:100%;height:100%;object-fit:cover;}',
      '.cw-join-tx{font:400 12px "Inter";color:var(--mut);}.cw-join-tx b{color:var(--tx2);font-weight:600;}',
      '.cw-navava{width:24px;height:24px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.25);}',
      '.cw-nav-badge{position:absolute;top:-7px;right:-9px;min-width:18px;height:18px;border-radius:999px;background:#EF4444;color:#fff;font:700 11px/18px "Inter";text-align:center;padding:0 5px;box-shadow:0 0 0 2px rgba(22,22,22,.9);animation:cwBadgePop .4s var(--sp);}',
      '@keyframes cwBadgePop{0%{transform:scale(0);}60%{transform:scale(1.2);}100%{transform:scale(1);}}',
      '.cw-nav-dot{position:absolute;top:-2px;right:-4px;width:8px;height:8px;border-radius:50%;background:#3b82f6;box-shadow:0 0 0 2px rgba(22,22,22,.9);}',
      '@media(max-width:480px){.cw-nav{height:78px;margin:0 10px calc(10px + env(safe-area-inset-bottom,0px));}}',
      // ── account panel ──
      '.cw-acct-id{display:flex;align-items:center;gap:14px;position:relative;z-index:1;}',
      '.cw-acct-ava{width:52px;height:52px;border-radius:50%;background:var(--card);border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;color:var(--acc);flex-shrink:0;}',
      '.cw-acct-ava svg{width:26px;height:26px;}',
      '.cw-acct-id h4{font:600 18px "Inter";color:#fff;margin:0 0 2px;}',
      '.cw-acct-id p{font:400 13px "Inter";color:var(--tx2);margin:0;}',
      '.cw-alist{background:var(--card);border:1px solid var(--bd);border-radius:16px;overflow:hidden;}',
      '.cw-arow{display:flex;align-items:center;gap:13px;width:100%;padding:14px 16px;background:none;border:none;border-bottom:1px solid var(--bd);color:#fff;font:500 14.5px "Inter";cursor:pointer;text-align:left;transition:background .16s;}',
      '.cw-arow:last-child{border-bottom:none;}',
      'button.cw-arow:hover{background:var(--hover);}',
      '.cw-arow-ic{color:var(--tx2);display:flex;flex-shrink:0;}.cw-arow-ic svg{width:19px;height:19px;}',
      '.cw-arow-lb{flex:1;}',
      '.cw-arow-r{color:var(--mut);display:flex;}.cw-arow-r svg{width:17px;height:17px;}',
      '.cw-arow-tag{color:var(--mut);font:500 13px "Inter";}',
      '.cw-arow.danger{color:#f87171;}.cw-arow.danger .cw-arow-ic{color:#f87171;}',
      '.cw-switch{width:42px;height:24px;border-radius:999px;background:rgba(255,255,255,.14);border:none;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;padding:0;}',
      '.cw-switch span{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .2s var(--sp);}',
      '.cw-switch.on{background:var(--acc);}',
      '.cw-switch.on span{transform:translateX(18px);}',
      // ── cinematic Home hero (widget) ──
      '.cw-herowrap{position:relative;background:radial-gradient(circle at 100% 0%,rgba(255,255,255,.08),transparent 38%),radial-gradient(circle at 0% 100%,rgba(255,255,255,.045),transparent 42%),linear-gradient(180deg,#151515 0%,#111 42%,#0D0D0D 100%);}',
      '.cw-herowrap::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.04;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27140%27 height=%27140%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E");}',
      '.cw-herowrap::after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 -46px 60px -34px rgba(0,0,0,.65);}',
      '.cw-heropad{position:relative;z-index:1;padding:4px 20px 26px;}',
      '.cw-brand{display:inline-flex;align-items:center;animation:cwHF .5s var(--sp) both;}',
      '.cw-brand img{height:26px;width:auto;filter:drop-shadow(0 2px 6px rgba(0,0,0,.45));}',
      '.cw-brand{font:700 17px/1 "Inter";color:#fff;}.cw-brand b{color:var(--acc);}',
      '.cw-tb-right{animation:cwHD .5s var(--sp) .05s both;}',
      '.cw-team-lg .cw-tm{width:46px;height:46px;margin-left:-14px;border:3px solid rgba(255,255,255,.9);font-size:16px;}',
      '.cw-team-lg .cw-tm:first-child{margin-left:0;}',
      '.cw-team-lg:hover .cw-tm{transform:translateY(-1px) scale(1.04);}',
      '.cw-team-lg .cw-team-dot{width:12px;height:12px;border:2px solid #151515;}',
      '.cw-hero-x{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);margin-left:10px;}',
      '.cw-hero-x:hover{background:rgba(255,255,255,.14);}',
      '.cw-hero-x svg{transition:transform .2s var(--sp);}.cw-hero-x:hover svg{transform:rotate(3deg);}',
      '.cw-hgreet{display:flex;flex-direction:column;margin-top:30px;animation:cwHU .55s var(--sp) .12s both;}',
      '.cw-hg1{font:700 clamp(30px,8.6vw,40px)/0.95 "Inter";letter-spacing:-.02em;color:rgba(255,255,255,.46);}',
      '.cw-hg2{font:800 clamp(31px,9vw,42px)/0.95 "Inter";letter-spacing:-.025em;color:#fff;margin-top:2px;}',
      '.cw-searchcard{display:flex;align-items:center;gap:13px;width:100%;margin-top:28px;min-height:84px;padding:15px 16px;background:rgba(27,27,27,.92);border:1px solid var(--bd);border-radius:22px;box-shadow:0 18px 44px rgba(0,0,0,.45);cursor:pointer;text-align:left;animation:cwHU .55s var(--sp) .18s both;transition:transform .2s var(--sp),border-color .2s,box-shadow .2s;}',
      '.cw-searchcard:hover{transform:translateY(-2px);border-color:rgba(201,168,76,.32);box-shadow:0 26px 56px rgba(0,0,0,.55);}',
      '.cw-sc-ic{width:44px;height:44px;border-radius:13px;background:rgba(201,168,76,.12);color:var(--acc);display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
      '.cw-sc-ic svg{width:20px;height:20px;}',
      '.cw-sc-tx{flex:1;min-width:0;display:flex;flex-direction:column;}',
      '.cw-sc-tx b{font:700 18px/1.2 "Inter";color:#fff;}',
      '.cw-sc-tx i{font:400 12.5px/1.35 "Inter";color:var(--tx2);font-style:normal;margin-top:3px;}',
      '.cw-hstack{display:flex;align-items:center;flex-shrink:0;}',
      '.cw-hs-face,.cw-hs-ai{width:34px;height:34px;border-radius:50%;overflow:hidden;border:2px solid #1B1B1B;margin-left:-10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
      '.cw-hstack>:first-child{margin-left:0;}',
      '.cw-hs-face{background:linear-gradient(145deg,var(--acc),#9c7f2c);color:#1a1206;font:700 12px "Inter";}',
      '.cw-hs-face img{width:100%;height:100%;object-fit:cover;}',
      '.cw-hs-ai{background:linear-gradient(145deg,#2A1830,#141b2e);color:var(--acc);}.cw-hs-ai svg{width:16px;height:16px;}',
      '@keyframes cwHF{from{opacity:0;}to{opacity:1;}}',
      '@keyframes cwHD{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:none;}}',
      '@keyframes cwHU{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}',
      // ── Part 2A4 global motion system ──
      '.cw{--sp-soft:cubic-bezier(.2,.8,.3,1);--t-fast:.14s;--t-med:.22s;--t-slow:.32s;}',
      // cascading card entrance
      '.cw-rise{opacity:0;animation:cwRise .44s var(--sp) both;}',
      '@keyframes cwRise{from{opacity:0;transform:translateY(8px) scale(.985);}to{opacity:1;transform:none;}}',
      // streaming AI text cursor
      '.cw-cursor{display:inline-block;width:2px;height:1em;background:var(--acc);margin-left:1px;vertical-align:text-bottom;border-radius:1px;animation:cwBlink 1s steps(1) infinite;}',
      '@keyframes cwBlink{50%{opacity:0;}}',
      // directional chat bubbles (assistant from left, user from right)
      '.cw-m.bot{animation:cwBubL .22s var(--sp);}',
      '.cw-m.user{animation:cwBubR .22s var(--sp);}',
      '@keyframes cwBubL{from{opacity:0;transform:translateX(-10px) translateY(4px);}to{opacity:1;transform:none;}}',
      '@keyframes cwBubR{from{opacity:0;transform:translateX(10px) translateY(4px);}to{opacity:1;transform:none;}}',
      // error shake
      '.cw-shake{animation:cwShake .4s var(--sp);}',
      '@keyframes cwShake{0%,100%{transform:translateX(0);}20%{transform:translateX(-4px);}40%{transform:translateX(4px);}60%{transform:translateX(-3px);}80%{transform:translateX(2px);}}',
      // tactile press
      '.cw-btn:active,.cw-feat:active,.cw-card:active,.cw-searchcard:active,.cw-pill:active,.cw-chip:active,.cw-cat:active,.cw-acard:active,.cw-vcard:active,.cw-conv:active,.cw-kitem:active,.cw-arow:active{transform:scale(.98);}',
      // meaningful cursors
      '.cw button:disabled,.cw [aria-disabled="true"]{cursor:not-allowed;}',
      '.cw-feat,.cw-card,.cw-conv,.cw-kitem,.cw-searchcard,.cw-vcard,.cw-acard{cursor:pointer;}',
      // success (checkmark draws itself)
      '.cw-success{display:flex;align-items:center;gap:9px;align-self:flex-start;margin:2px 0 2px 35px;color:#4ade80;font:600 13px "Inter";}',
      '.cw-check{width:26px;height:26px;flex-shrink:0;}',
      '.cw-check-c{fill:none;stroke:#4ade80;stroke-width:3;stroke-dasharray:150;stroke-dashoffset:150;animation:cwDraw .5s var(--sp) forwards;}',
      '.cw-check-p{fill:none;stroke:#4ade80;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:40;stroke-dashoffset:40;animation:cwDraw .4s var(--sp) .35s forwards;}',
      '@keyframes cwDraw{to{stroke-dashoffset:0;}}',
      // ── Part 2A5 Home content ──
      '.cw-ssub{font:400 13.5px/1.5 "Inter";color:var(--tx2);margin:-8px 2px 14px;}',
      // The5th AI product card (distinct)
      '.cw-product{position:relative;overflow:hidden;background:linear-gradient(150deg,#1a1030,#141b2e 60%,#141414);border:1px solid rgba(201,168,76,.18);border-radius:22px;padding:22px;box-shadow:0 16px 42px rgba(0,0,0,.4);}',
      '.cw-product-glow{position:absolute;top:-40%;right:-20%;width:70%;height:120%;background:radial-gradient(ellipse,rgba(201,168,76,.16),transparent 70%);pointer-events:none;animation:cwGlow 6s ease-in-out infinite;}',
      '@keyframes cwGlow{0%,100%{opacity:.7;}50%{opacity:1;}}',
      '.cw-product-top{position:relative;z-index:1;margin-bottom:12px;}',
      '.cw-badge-ai{position:static;background:rgba(201,168,76,.14);border-color:rgba(201,168,76,.3);color:var(--acc2);}',
      '.cw-product-h{position:relative;z-index:1;font:700 22px/1.2 "Inter";color:#fff;margin:0 0 4px;}',
      '.cw-product-sub{position:relative;z-index:1;font:500 14px/1.5 "Inter";color:var(--tx2);margin:0 0 16px;}',
      '.cw-pgrid{position:relative;z-index:1;display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px;}',
      '.cw-pchip{font:500 12.5px "Inter";color:#E6E6EA;background:rgba(255,255,255,.05);border:1px solid var(--bd);border-radius:999px;padding:7px 12px;}',
      // knowledge search + category grid
      '.cw-ksrch{margin-top:2px;min-height:64px;}',
      '.cw-kgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;}',
      '.cw-kcat{display:flex;align-items:center;gap:11px;background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:13px 14px;cursor:pointer;text-align:left;transition:transform .16s var(--sp),background .16s,border-color .16s;}',
      '.cw-kcat:hover{transform:translateY(-2px);background:#201a10;border-color:rgba(201,168,76,.25);}',
      '.cw-kcat-ic{width:30px;height:30px;border-radius:9px;background:rgba(201,168,76,.1);color:var(--acc);display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
      '.cw-kcat-ic svg{width:16px;height:16px;}',
      '.cw-kcat-t{font:600 13.5px "Inter";color:#fff;}',
      // community card
      '.cw-community{background:var(--card);border:1px solid var(--bd);border-radius:22px;padding:20px;cursor:pointer;box-shadow:0 12px 32px rgba(0,0,0,.28);transition:transform .18s var(--sp),border-color .18s;overflow:hidden;}',
      '.cw-cm-art{position:relative;margin:-20px -20px 16px;aspect-ratio:16/7;overflow:hidden;display:flex;align-items:center;justify-content:center;}',
      '.cw-cm-art .cw-cov-img{width:100%;height:100%;object-fit:cover;}',
      '.cw-community:hover{transform:translateY(-2px);border-color:rgba(201,168,76,.25);}',
      '.cw-cm-head{display:flex;align-items:center;gap:13px;margin-bottom:14px;}',
      '.cw-cm-head h5{font:700 16px/1.2 "Inter";color:#fff;margin:0 0 2px;}',
      '.cw-cm-head p{font:400 12.5px "Inter";color:var(--tx2);margin:0;}',
      '.cw-cm-desc{font:400 13.5px/1.6 "Inter";color:var(--tx2);margin:0 0 16px;}',
      '.cw-cm-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}',
      '.cw-cm-faces{display:flex;}',
      '.cw-cm-face{width:32px;height:32px;border-radius:50%;overflow:hidden;border:2px solid var(--card);margin-left:-10px;background:linear-gradient(145deg,var(--acc),#9c7f2c);color:#1a1206;font:700 12px/28px "Inter";text-align:center;}',
      '.cw-cm-face:first-child{margin-left:0;}.cw-cm-face img{width:100%;height:100%;object-fit:cover;}',
      // newsletter
      '.cw-news{position:relative;overflow:hidden;background:linear-gradient(150deg,#241530,#141414);border:1px solid var(--bd);border-radius:24px;padding:24px 22px;}',
      '.cw-news-glow{position:absolute;top:-50%;left:-20%;width:70%;height:140%;background:radial-gradient(ellipse,rgba(201,168,76,.14),transparent 70%);pointer-events:none;}',
      '.cw-news h4{position:relative;z-index:1;display:flex;align-items:center;gap:8px;font:700 19px/1.2 "Inter";color:#fff;margin:0 0 8px;}',
      '.cw-news h4 svg{width:20px;height:20px;color:var(--acc);}',
      '.cw-news p{position:relative;z-index:1;font:400 13.5px/1.6 "Inter";color:var(--tx2);margin:0 0 16px;}',
      '.cw-news-form{position:relative;z-index:1;display:flex;gap:8px;}',
      '.cw-news-form input{flex:1;min-width:0;background:var(--bg2);border:1px solid var(--bd);border-radius:13px;padding:12px 14px;color:#fff;font:400 14px "Inter";outline:none;transition:border-color .2s;}',
      '.cw-news-form input:focus{border-color:rgba(201,168,76,.5);}',
      '.cw-news-form .cw-btn{flex-shrink:0;}',
      '.cw-news-ok{position:relative;z-index:1;display:flex;align-items:center;gap:8px;font:600 13.5px "Inter";margin-top:12px;}',
      '.cw-news-ok.done{color:#4ade80;}.cw-news-ok.err{color:#f87171;}',
      '.cw-news-ok .cw-check{width:22px;height:22px;}',
      // footer
      '.cw-foot2{padding:26px 4px 8px;text-align:center;}',
      '.cw-foot2-links{display:flex;align-items:center;justify-content:center;gap:10px;font:500 13px "Inter";}',
      '.cw-foot2-links a{color:var(--tx2);cursor:pointer;transition:color .15s;}',
      '.cw-foot2-links a:hover{color:var(--acc2);}',
      '.cw-foot2-links span{color:var(--mut);}',
      '.cw-foot2-meta{font:400 11px "Inter";color:var(--mut);margin-top:10px;}',
      // ── Part 2B1 AI chat ──
      '.cw-chatview{flex:1;min-height:0;display:flex;flex-direction:column;position:relative;animation:cwChatIn .3s var(--sp);}',
      '@keyframes cwChatIn{from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:none;}}',
      '.cw-chead{position:relative;}',
      '.cw-chead-mid{flex:1;display:flex;align-items:center;gap:11px;min-width:0;}',
      '.cw-menu-pop{position:absolute;top:58px;right:14px;z-index:20;background:var(--card);border:1px solid var(--bd);border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.5);padding:6px;min-width:196px;animation:cwDrop .16s var(--sp);}',
      '@keyframes cwDrop{from{opacity:0;transform:translateY(-4px) scale(.98);}to{opacity:1;transform:none;}}',
      '.cw-menu-pop button{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;background:none;border:none;border-radius:9px;color:#fff;font:500 13.5px "Inter";cursor:pointer;text-align:left;transition:background .15s;}',
      '.cw-menu-pop button:hover{background:var(--hover);}',
      '.cw-menu-pop button svg{width:16px;height:16px;color:var(--tx2);}',
      '.cw-menu-pop button.danger{color:#f87171;}.cw-menu-pop button.danger svg{color:#f87171;}',
      '.cw-newpill{position:absolute;left:50%;transform:translateX(-50%);bottom:86px;z-index:15;display:flex;align-items:center;gap:6px;background:var(--acc);color:#1a1206;border:none;border-radius:999px;padding:8px 15px;font:600 12.5px "Inter";cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.45);animation:cwHU .3s var(--sp);}',
      '.cw-newpill svg{width:15px;height:15px;transform:rotate(90deg);}',
      // message column, grouping, width
      '.cw-m{max-width:80%;}',
      '.cw-mcol{display:flex;flex-direction:column;min-width:0;max-width:100%;}',
      '.cw-m.user .cw-mcol{align-items:flex-end;}',
      '.cw-m.cw-grouped{margin-top:-6px;}',
      '.cw-m.cw-grouped .cw-m-ava{visibility:hidden;}',
      // inline actions
      '.cw-mact{display:flex;gap:1px;margin-top:5px;opacity:0;transform:translateY(-2px);transition:opacity .16s var(--sp),transform .16s var(--sp);}',
      '.cw-m.bot:hover .cw-mact{opacity:1;transform:none;}',
      '.cw-mact button{width:26px;height:26px;border-radius:7px;border:none;background:transparent;color:var(--mut);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;}',
      '.cw-mact button:hover{background:var(--hover);color:#fff;}.cw-mact button.on{color:var(--acc);}',
      '.cw-mact button svg{width:15px;height:15px;}',
      // thinking caption
      '.cw-think{align-self:center;font:400 12px "Inter";color:var(--mut);}',
      // inline cards
      '.cw-incard-wrap{align-self:flex-start;max-width:88%;margin:2px 0 2px 36px;}',
      '.cw-incard{display:flex;gap:12px;background:var(--card);border:1px solid var(--bd);border-radius:16px;overflow:hidden;padding:12px;cursor:pointer;transition:transform .18s var(--sp),border-color .18s;}',
      '.cw-incard:hover{transform:translateY(-2px);border-color:rgba(201,168,76,.3);}',
      '.cw-incard-cover{width:60px;height:60px;flex-shrink:0;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:26px;}',
      '.cw-incard-b{flex:1;min-width:0;}',
      '.cw-incard-b h5{display:flex;align-items:center;gap:6px;font:700 14.5px "Inter";color:#fff;margin:0 0 3px;}',
      '.cw-incard-b h5 svg{width:16px;height:16px;color:var(--acc);}',
      '.cw-incard-b p{font:400 12.5px/1.45 "Inter";color:var(--tx2);margin:0 0 10px;}',
      '.cw-incard-btns{display:flex;gap:8px;flex-wrap:wrap;}',
      '.cw-incard-btns .cw-btn{padding:8px 14px;font-size:12.5px;border-radius:11px;}',
      '.cw-incard-book{cursor:default;}',
      // ── Part 2B2 markdown + components ──
      '.cw-m-ava{width:30px;height:30px;}',
      '.cw-bub{border-radius:18px;padding:13px 16px;font-size:14.5px;line-height:1.68;}',
      '.cw-bub>*:first-child{margin-top:0;}.cw-bub>*:last-child{margin-bottom:0;}',
      '.cw-p{margin:0 0 11px;}',
      '.cw-mh{font-weight:700;color:#fff;margin:15px 0 8px;line-height:1.3;}',
      '.cw-mh1{font-size:19px;}.cw-mh2{font-size:16.5px;}.cw-mh3{font-size:15px;}',
      '.cw-list{margin:0 0 11px;padding-left:20px;}',
      '.cw-list li{margin:4px 0;line-height:1.6;}',
      '.cw-list li.cw-li-check{list-style:none;margin-left:-20px;display:flex;gap:8px;align-items:flex-start;}',
      '.cw-cbx{width:18px;height:18px;border-radius:5px;border:1.5px solid var(--bd);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;color:#1a1206;margin-top:1px;}',
      '.cw-cbx.on{background:var(--acc);border-color:var(--acc);}',
      '.cw-ic{background:rgba(255,255,255,.08);border:1px solid var(--bd);border-radius:6px;padding:1px 6px;font:500 12.5px ui-monospace,Menlo,monospace;color:#f0d98a;}',
      '.cw-code{border:1px solid var(--bd);border-radius:14px;overflow:hidden;margin:10px 0;background:#0f0f0f;}',
      '.cw-code-top{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,.03);border-bottom:1px solid var(--bd);}',
      '.cw-code-top span{font:600 11px ui-monospace,Menlo,monospace;color:var(--mut);text-transform:uppercase;letter-spacing:.05em;}',
      '.cw-code-copy{display:flex;align-items:center;gap:5px;background:none;border:none;color:var(--tx2);font:500 11.5px "Inter";cursor:pointer;}',
      '.cw-code-copy svg{width:13px;height:13px;}.cw-code-copy:hover{color:#fff;}',
      '.cw-code pre{margin:0;padding:14px;overflow-x:auto;}',
      '.cw-code code{font:400 12.5px/1.6 ui-monospace,Menlo,monospace;color:#E6E6EA;white-space:pre;}',
      '.cw-table-wrap{overflow-x:auto;margin:10px 0;border:1px solid var(--bd);border-radius:12px;}',
      '.cw-table{border-collapse:collapse;width:100%;font-size:13px;}',
      '.cw-table th{background:rgba(255,255,255,.04);text-align:left;padding:9px 12px;font-weight:600;color:#fff;border-bottom:1px solid var(--bd);white-space:nowrap;}',
      '.cw-table td{padding:9px 12px;color:var(--tx2);border-bottom:1px solid var(--bd);}',
      '.cw-table tr:last-child td{border-bottom:none;}',
      '.cw-table tbody tr:nth-child(odd){background:rgba(255,255,255,.015);}',
      '.cw-table tbody tr:hover{background:rgba(255,255,255,.045);}',
      '.cw-bq{border-left:3px solid var(--acc);background:rgba(255,255,255,.03);border-radius:0 8px 8px 0;padding:10px 14px;margin:10px 0;color:var(--tx2);font-style:italic;}',
      '.cw-hr{border:none;border-top:1px solid var(--bd);margin:14px 0;}',
      // error card
      '.cw-errcard{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.25);border-radius:16px;padding:16px;}',
      '.cw-errcard h5{font:700 14.5px "Inter";color:#fca5a5;margin:0 0 4px;}',
      '.cw-errcard p{font:400 13px "Inter";color:var(--tx2);margin:0 0 12px;}',
      '.cw-retry{padding:8px 16px;font-size:13px;}',
      // toast
      '.cw-toast{position:fixed;left:50%;bottom:104px;transform:translateX(-50%) translateY(10px);z-index:2147483000;background:#1B1B1B;border:1px solid var(--bd);color:#fff;font:600 13px "Inter";padding:10px 18px;border-radius:999px;box-shadow:0 12px 34px rgba(0,0,0,.5);opacity:0;transition:opacity .28s var(--sp),transform .28s var(--sp);pointer-events:none;}',
      '.cw-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}',
      // ── launcher (official white FAB) ──
      '.cw-launcher{width:64px;height:64px;background:#FFFFFF !important;border:none !important;box-shadow:0 18px 50px rgba(0,0,0,.28);}',
      '.cw-launcher:hover{transform:translateY(-3px) scale(1.06);box-shadow:0 24px 60px rgba(0,0,0,.35);}',
      '.cw-launcher:active{transform:scale(.94);}',
      '.cw-launcher .l-chat{position:relative;display:flex;align-items:center;justify-content:center;width:58%;height:58%;opacity:1;transform:none;}',
      '.cw-launcher .l-icon{width:100%;height:100%;object-fit:contain;display:block;}',
      '.cw-launcher .l-fb{display:none;align-items:center;justify-content:center;width:100%;height:100%;color:#3D2645;position:static;}',
      '.cw-launcher .l-fb svg{width:100%;height:100%;color:#3D2645;position:static;}',
      '.cw-launcher .l-close{color:#3D2645;}.cw-launcher .l-close svg{color:#3D2645;}',
      '.cw-open .l-chat{opacity:0;transform:rotate(40deg) scale(.6);}',
      '@media(max-width:768px){.cw-launcher{width:58px;height:58px;}}',
      '@media(max-width:480px){.cw-launcher{width:56px;height:56px;}}',
      // ── Part 2B3 welcome experience ──
      '.cw-welcome{padding:8px 4px 6px;}',
      '.cw-wava{width:48px;height:48px;border-radius:50%;overflow:hidden;background:linear-gradient(145deg,var(--acc),#9c7f2c);color:#1a1206;font:700 20px/48px "Inter";text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.3);margin-bottom:14px;}',
      '.cw-wava img{width:100%;height:100%;object-fit:cover;}',
      '.cw-welcome h3{font:700 22px/1.25 "Inter";letter-spacing:-.01em;color:#fff;margin:0 0 8px;}',
      '.cw-welcome p{font:400 14px/1.6 "Inter";color:var(--tx2);margin:0;}',
      '.cw-wgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0 6px;}',
      '.cw-wcard{position:relative;display:flex;flex-direction:column;gap:10px;align-items:flex-start;text-align:left;background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:15px;cursor:pointer;transition:transform .18s var(--sp),box-shadow .18s,border-color .18s;overflow:hidden;}',
      '.cw-wcard::before{content:"";position:absolute;inset:0;border-radius:18px;padding:1px;background:linear-gradient(135deg,rgba(201,168,76,.5),transparent 60%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity .2s;}',
      '.cw-wcard:hover{transform:translateY(-3px);box-shadow:0 16px 38px rgba(0,0,0,.4);border-color:transparent;}',
      '.cw-wcard:hover::before{opacity:1;}',
      '.cw-wcard-ic{width:38px;height:38px;border-radius:12px;background:rgba(201,168,76,.12);color:var(--acc);display:flex;align-items:center;justify-content:center;}',
      '.cw-wcard-ic svg{width:20px;height:20px;}',
      '.cw-wcard-t{font:600 13.5px/1.35 "Inter";color:#fff;}',
      // ── Part 2B4 composer ──
      '.cw-comp{position:relative;background:rgba(20,20,20,.92);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);padding-bottom:calc(12px + env(safe-area-inset-bottom,0px));}',
      '.cw-comp-row{min-height:54px;border-radius:20px;align-items:flex-end;padding:7px 7px 7px 16px;transition:border-color .2s var(--sp),box-shadow .2s;}',
      '.cw-comp-row:focus-within{border-color:rgba(201,168,76,.45);box-shadow:0 0 0 4px rgba(201,168,76,.1);}',
      '.cw-in{font-size:15px;line-height:1.6;min-height:44px;max-height:300px;padding:11px 0;}',
      '.cw-comp-row{min-height:62px;}',
      // attach button
      '.cw-attach{flex-shrink:0;width:38px;height:38px;border-radius:11px;border:none;background:transparent;color:var(--tx2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .16s,color .16s;align-self:flex-end;}',
      '.cw-attach:hover{background:var(--hover);color:#fff;}.cw-attach svg{width:19px;height:19px;}',
      // attachment preview chips (above composer)
      '.cw-atts{display:none;flex-wrap:wrap;gap:8px;padding:0 2px 10px;}',
      '.cw-att{display:flex;align-items:center;gap:9px;background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:7px 9px;max-width:220px;animation:cwRise .3s var(--sp);}',
      '.cw-att-th{width:34px;height:34px;border-radius:8px;background-size:cover;background-position:center;flex-shrink:0;}',
      '.cw-att-ic{width:34px;height:34px;border-radius:8px;background:rgba(201,168,76,.12);color:var(--acc);display:flex;align-items:center;justify-content:center;flex-shrink:0;}.cw-att-ic svg{width:17px;height:17px;}',
      '.cw-att-tx{display:flex;flex-direction:column;min-width:0;}',
      '.cw-att-tx b{font:600 12.5px "Inter";color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;}',
      '.cw-att-tx i{font:400 11px "Inter";color:var(--mut);font-style:normal;}',
      '.cw-att-x{width:20px;height:20px;border-radius:6px;border:none;background:rgba(255,255,255,.06);color:var(--tx2);cursor:pointer;font-size:15px;line-height:1;flex-shrink:0;}',
      '.cw-att-x:hover{background:rgba(248,113,113,.2);color:#fca5a5;}',
      // drop zone overlay
      '.cw-drop{display:none;position:absolute;inset:8px;z-index:25;border:2px dashed rgba(201,168,76,.5);border-radius:18px;background:rgba(201,168,76,.08);color:var(--acc2);align-items:center;justify-content:center;gap:8px;font:600 14px "Inter";pointer-events:none;}',
      '.cw-comp-row.cw-dragging + .cw-drop,.cw-comp-row.cw-dragging~.cw-drop{display:flex;}',
      '.cw-comp-row.cw-dragging{border-color:rgba(201,168,76,.5);}',
      // attachments shown inside a sent user message
      '.cw-msgatts{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;justify-content:flex-end;}',
      '.cw-msgatt{display:flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:6px 9px;font:500 12px "Inter";color:var(--tx2);}',
      '.cw-msgatt svg{width:15px;height:15px;color:var(--mut);}',
      '.cw-msgatt.img{width:120px;height:120px;padding:0;border-radius:12px;background-size:cover;background-position:center;}',
      '.cw-in::placeholder{transition:opacity .2s var(--sp);}',
      '.cw-in.cw-ph-fade::placeholder{opacity:0;}',
      '.cw-send{width:40px;height:40px;transition:transform .12s var(--sp),opacity .2s,background .2s;}',
      '.cw-send:disabled{background:rgba(255,255,255,.09);color:var(--mut);box-shadow:none;cursor:not-allowed;}',
      '.cw-send:disabled svg{fill:var(--mut);}',
      '.cw-send:not(:disabled):active{transform:scale(.94);}',
      '.cw-cred b{color:var(--tx2);font-weight:600;}',
      // slash-command menu
      '.cw-slash{position:absolute;left:14px;right:14px;bottom:100%;margin-bottom:6px;z-index:30;background:var(--card);border:1px solid var(--bd);border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.55);padding:6px;max-height:262px;overflow-y:auto;animation:cwDrop .16s var(--sp);}',
      '.cw-slash-i{display:flex;align-items:baseline;gap:10px;width:100%;padding:9px 12px;background:none;border:none;border-radius:10px;color:#fff;font:500 13.5px "Inter";cursor:pointer;text-align:left;}',
      '.cw-slash-i b{color:var(--acc2);font-weight:600;min-width:96px;}',
      '.cw-slash-i span{color:var(--tx2);font-size:12.5px;}',
      '.cw-slash-i.on,.cw-slash-i:hover{background:var(--hover);}',
      // ── Part 2B5 in-chat content viewer ──
      '.cw-art-meta{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:0 0 4px;}',
      '.cw-readtime{display:inline-flex;align-items:center;gap:5px;font:500 12px "Inter";color:var(--mut);white-space:nowrap;}',
      '.cw-readtime svg{width:14px;height:14px;}',
      '.cw-art-rel{margin-top:28px;padding-top:20px;border-top:1px solid var(--bd);}',
      '.cw-rel{display:flex;align-items:center;gap:12px;width:100%;background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:11px 12px;margin-bottom:9px;cursor:pointer;text-align:left;transition:transform .16s var(--sp),border-color .16s;color:var(--mut);}',
      '.cw-rel:hover{transform:translateY(-2px);border-color:rgba(201,168,76,.25);}',
      '.cw-rel-ic{width:40px;height:40px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;}',
      '.cw-rel-ic svg{width:19px;height:19px;}',
      '.cw-rel-t{flex:1;min-width:0;display:flex;flex-direction:column;font:600 14px/1.3 "Inter";color:#fff;}',
      '.cw-rel-t i{font:400 12px/1.3 "Inter";color:var(--tx2);font-style:normal;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.cw-rel svg:last-child{width:17px;height:17px;flex-shrink:0;}',
      '.cw-rel:hover svg:last-child{color:var(--acc);}',
      // ── premium featured covers (branded image + text overlay) ──
      '.cw-cover-hero .cw-cover-grad{background:linear-gradient(180deg,rgba(0,0,0,.15) 0%,transparent 32%,rgba(13,13,13,.55) 68%,rgba(13,13,13,.92) 100%);}',
      '.cw-cover-cap{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:16px 16px 15px;}',
      '.cw-cover-eyebrow{display:inline-block;font:700 10px/1 "Inter";letter-spacing:.09em;text-transform:uppercase;color:#1a1206;background:var(--acc);padding:5px 10px;border-radius:999px;margin-bottom:9px;box-shadow:0 4px 12px rgba(0,0,0,.35);}',
      '.cw-cover-title{font:700 23px/1.14 "Inter";letter-spacing:-.02em;color:#fff;margin:0;text-shadow:0 2px 14px rgba(0,0,0,.6);}',
      '.cw-cover-sub{display:block;font:500 13px/1.4 "Inter";color:rgba(255,255,255,.92);margin-top:4px;text-shadow:0 1px 8px rgba(0,0,0,.55);}',
      '.cw-cover-cta{position:absolute;top:12px;right:12px;z-index:2;display:inline-flex;align-items:center;gap:5px;font:600 11.5px "Inter";color:#fff;background:rgba(13,13,13,.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.16);padding:6px 11px;border-radius:999px;opacity:0;transform:translateY(-4px);transition:opacity .2s,transform .2s var(--sp);}',
      '.cw-cover-cta svg{width:14px;height:14px;}',
      '.cw-feat:hover .cw-cover-cta,.cw-product-cover:hover .cw-cover-cta{opacity:1;transform:none;}',
      '.cw-cover-hero .cw-cover-emoji{position:absolute;inset:0;margin:auto;}',
      // ── Part 3B source attribution chips ──
      '.cw-sources{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:8px;}',
      '.cw-sources-lbl{font:600 10.5px "Inter";letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin-right:2px;}',
      '.cw-src{display:inline-flex;align-items:center;gap:6px;max-width:200px;background:var(--card);border:1px solid var(--bd);border-radius:999px;padding:6px 11px;cursor:pointer;color:var(--tx2);font:500 12px "Inter";transition:transform .15s var(--sp),border-color .15s,color .15s;}',
      '.cw-src:hover{transform:translateY(-1px);border-color:rgba(201,168,76,.3);color:#fff;}',
      '.cw-src svg{width:13px;height:13px;flex-shrink:0;color:var(--acc);}',
      '.cw-src span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      // ── Part 3D unified content viewer ──
      '.cw-progress{height:3px;background:rgba(255,255,255,.06);flex-shrink:0;}',
      '.cw-progress span{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--acc),var(--acc2));transition:width .1s linear;}',
      '.cw-content-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:16px 0 10px;}',
      '.cw-ctype{font:700 10.5px "Inter";letter-spacing:.07em;text-transform:uppercase;color:#1a1206;background:var(--acc);padding:4px 10px;border-radius:999px;}',
      '.cw-content-meta .cw-readtime,.cw-cauthor{font:500 12px "Inter";color:var(--mut);display:inline-flex;align-items:center;gap:5px;}',
      '.cw-content-meta .cw-readtime svg{width:14px;height:14px;}',
      '.cw-richbody{font:400 15px/1.75 "Inter";color:#D4D4D8;margin-top:6px;}',
      '.cw-richbody .cw-mh{color:#fff;margin:22px 0 10px;}',
      '.cw-richbody .cw-p{margin:0 0 14px;}',
      '.cw-toc{margin:6px 0 16px;background:var(--card);border:1px solid var(--bd);border-radius:12px;overflow:hidden;}',
      '.cw-toc summary{padding:11px 14px;cursor:pointer;font:600 13px "Inter";color:#fff;list-style:none;}',
      '.cw-toc summary::-webkit-details-marker{display:none;}',
      '.cw-toc ul{margin:0;padding:0 8px 8px;list-style:none;}',
      '.cw-toc li{padding:8px 10px;border-radius:8px;cursor:pointer;font:400 13px "Inter";color:var(--tx2);transition:background .15s,color .15s;}',
      '.cw-toc li:hover{background:var(--hover);color:var(--acc2);}',
      '.cw-embed{position:relative;aspect-ratio:16/9;border-radius:14px;overflow:hidden;margin:14px 0;background:#000;}',
      '.cw-embed iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}',
      '.cw-faq{margin:14px 0;}',
      '.cw-faq-i{border:1px solid var(--bd);border-radius:12px;margin-bottom:9px;overflow:hidden;background:var(--card);}',
      '.cw-faq-i summary{padding:14px 16px;cursor:pointer;font:600 14px "Inter";color:#fff;list-style:none;}',
      '.cw-faq-i summary::-webkit-details-marker{display:none;}',
      '.cw-faq-i>div{padding:0 16px 14px;font:400 13.5px/1.6 "Inter";color:var(--tx2);}',
      '.cw-metrics{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0;}',
      '.cw-metric{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:16px;}',
      '.cw-metric b{display:block;font:700 22px "Inter";color:var(--acc);}',
      '.cw-metric span{font:500 12px "Inter";color:var(--tx2);}',
      '.cw-feedback{display:flex;align-items:center;gap:8px;margin:24px 0 0;padding-top:18px;border-top:1px solid var(--bd);font:500 13px "Inter";color:var(--tx2);}',
      '.cw-feedback button{width:34px;height:30px;border-radius:9px;border:1px solid var(--bd);background:var(--card);cursor:pointer;font-size:15px;transition:transform .15s,border-color .15s;}',
      '.cw-feedback button:hover{transform:translateY(-1px);}.cw-feedback button.on{border-color:var(--acc);background:#241a10;}',
      '.cw-loading{padding:18px;}',
      '.cw-artbar #cw-bm{font-size:18px;line-height:1;color:var(--acc);}',
      // ── Part 3E in-chat booking calendar ──
      '.cw-book{align-self:flex-start;width:100%;max-width:340px;background:var(--card);border:1px solid var(--bd);border-radius:16px;overflow:hidden;}',
      '.cw-book-h{display:flex;align-items:center;gap:8px;padding:13px 15px;font:600 14px "Inter";color:#fff;background:linear-gradient(150deg,#241531,#141414);border-bottom:1px solid var(--bd);}',
      '.cw-book-h svg{width:17px;height:17px;color:var(--acc);}',
      '.cw-book-body{padding:13px 14px;font:400 13px "Inter";color:var(--tx2);}',
      '.cw-book-body a{color:var(--acc2);}',
      '.cw-book-days{display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none;}',
      '.cw-book-days::-webkit-scrollbar{display:none;}',
      '.cw-book-day{flex-shrink:0;padding:7px 11px;border-radius:10px;border:1px solid var(--bd);background:var(--bg2);color:var(--tx2);font:600 12px "Inter";cursor:pointer;white-space:nowrap;transition:all .15s;}',
      '.cw-book-day.on{background:var(--acc);color:#1a1206;border-color:var(--acc);}',
      '.cw-book-times{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:4px;}',
      '.cw-book-time{padding:9px 4px;border-radius:9px;border:1px solid var(--bd);background:var(--bg2);color:#fff;font:600 12.5px "Inter";cursor:pointer;transition:all .15s;}',
      '.cw-book-time:hover{border-color:rgba(201,168,76,.4);}',
      '.cw-book-time.on{background:var(--acc);color:#1a1206;border-color:var(--acc);}',
      '.cw-book-form{display:flex;flex-direction:column;gap:8px;margin-top:12px;}',
      '.cw-book-form input{background:var(--bg2);border:1px solid var(--bd);border-radius:11px;padding:11px 13px;color:#fff;font:400 14px "Inter";outline:none;}',
      '.cw-book-form input:focus{border-color:rgba(201,168,76,.5);}',
      '.cw-book-form .cw-btn{margin-top:2px;}',
      '.cw-book-done{display:flex;align-items:center;gap:12px;padding:18px 16px;}',
      '.cw-book-done b{display:block;font:700 15px "Inter";color:#fff;}',
      '.cw-book-done span{font:400 12.5px "Inter";color:var(--tx2);}',
      // ── appearance + language controls (Account) ──
      '.cw-seg{display:inline-flex;background:var(--bg2);border:1px solid var(--bd);border-radius:9px;padding:2px;}',
      '.cw-seg-b{padding:5px 13px;border:none;background:transparent;color:var(--mut);font:600 12px "Inter";border-radius:7px;cursor:pointer;}',
      '.cw-seg-b.on{background:var(--acc);color:#1a1206;}',
      '.cw-langsel{background:var(--bg2);border:1px solid var(--bd);border-radius:9px;color:var(--tx);font:500 13px "Inter";padding:7px 10px;cursor:pointer;outline:none;}',
      // ── light theme ──
      '.cw-win.cw-light{--bg:#FFFFFF;--bg2:#F4F4F3;--card:#FFFFFF;--bd:rgba(0,0,0,.09);--hover:rgba(0,0,0,.045);--tx:#1A1A2E;--tx2:#57534E;--mut:#8A8075;--acc:#B0902F;--acc2:#9c7f2c;box-shadow:0 40px 100px rgba(0,0,0,.22);border-color:rgba(0,0,0,.09);}',
      '.cw-win.cw-light h1,.cw-win.cw-light h3,.cw-win.cw-light h4,.cw-win.cw-light h5{color:var(--tx);}',
      '.cw-win.cw-light .cw-cover-title,.cw-win.cw-light .cw-cover-cap h4,.cw-win.cw-light .cw-cover-sub{color:#fff;}',
      '.cw-win.cw-light .cw-logo,.cw-win.cw-light .cw-h3,.cw-win.cw-light .cw-greet,.cw-win.cw-light .cw-hg2,.cw-win.cw-light .cw-chead-tx h4,.cw-win.cw-light .cw-welcome h3,.cw-win.cw-light .cw-acct-id h4,.cw-win.cw-light .cw-sc-tx b{color:var(--tx);}',
      '.cw-win.cw-light .cw-hg1{color:rgba(0,0,0,.42);}',
      '.cw-win.cw-light .cw-chead{background:linear-gradient(160deg,#F7F3EE,#fff);border-bottom:1px solid var(--bd);}',
      '.cw-win.cw-light .cw-iconbtn{background:rgba(0,0,0,.05);color:var(--tx);}.cw-win.cw-light .cw-iconbtn:hover{background:rgba(0,0,0,.09);}',
      '.cw-win.cw-light .cw-herowrap{background:radial-gradient(circle at 100% 0%,rgba(201,168,76,.16),transparent 42%),linear-gradient(180deg,#F7F3EE,#fff);}',
      '.cw-win.cw-light .cw-herowrap::before{opacity:0;}.cw-win.cw-light .cw-herowrap::after{box-shadow:none;}',
      '.cw-win.cw-light .cw-hero{background:linear-gradient(165deg,#F3EEF6,#FBF7FF);}',
      '.cw-win.cw-light .cw-topbar.scrolled{background:rgba(255,255,255,.82);}',
      '.cw-win.cw-light .cw-m.bot .cw-bub{color:var(--tx);}',
      '.cw-win.cw-light .cw-richbody{color:#3d3d3d;}',
      '.cw-win.cw-light .cw-nav{background:rgba(255,255,255,.92);}',
      '.cw-win.cw-light .cw-tab.on{background:rgba(0,0,0,.05);}',
      '.cw-win.cw-light .cw-comp{background:rgba(250,250,249,.95);}',
      '.cw-win.cw-light .cw-in{color:var(--tx);}',
      '.cw-win.cw-light .cw-cred{color:var(--mut);}',
      '.cw-win.cw-light .cw-feat-sub{color:var(--acc2);}',
      '.cw-win.cw-light .cw-book-h{background:linear-gradient(150deg,#F7F3EE,#fff);color:var(--tx);border-bottom:1px solid var(--bd);}',
      '.cw-win.cw-light .cw-book-done b{color:var(--tx);}',
      '.cw-win.cw-light .cw-product{background:linear-gradient(150deg,#FBF7FF,#fff);border-color:rgba(176,144,47,.25);}',
      '.cw-win.cw-light .cw-pchip{color:#3d3d3d;background:rgba(0,0,0,.04);}',
      '.cw-win.cw-light .cw-news{background:linear-gradient(150deg,#F7F3EE,#fff);}.cw-win.cw-light .cw-news h4,.cw-win.cw-light .cw-news p{color:var(--tx);}',
      '.cw-win.cw-light .cw-community{background:#fff;}',
      // The5th AI product card with cover
      '.cw-product-cover{position:relative;margin:-22px -22px 18px;aspect-ratio:16/9;overflow:hidden;cursor:pointer;}',
      '.cw-product-cover .cw-cover-emoji{position:absolute;inset:0;margin:auto;font-size:52px;align-items:center;justify-content:center;}',
      '.cw-product-body{position:relative;z-index:1;}'
    ].join('\n');
    var st = document.createElement('style'); st.id = 'carolina-home-styles'; st.textContent = css; document.head.appendChild(st);
  }

  // ── Helpers ──
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // Accent hex → rgba (for generative-cover glows).
  function hexA(hex, a) {
    try { var h = String(hex).replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
      var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; } catch (e) { return 'rgba(201,168,76,' + a + ')'; }
  }
  // Premium generative cover — luxury gradient + glow orb + glass ring + glyph.
  // Used whenever there's no uploaded image, so every product looks intentional.
  function genCover(m, big) {
    var ac = m.accent || '#C9A84C', grad = m.cover || 'linear-gradient(158deg,#2A1830,#160D1A 55%,#0D0D0D)';
    return '<div class="cw-cover cw-cart' + (big ? ' cw-cover-lg' : '') + '" style="--ca:' + ac + ';--cag:' + hexA(ac, .32) + ';background:' + grad + '">'
      + '<span class="cw-cart-orb"></span><span class="cw-cart-ring"></span>'
      + '<span class="cw-cart-glyph">' + (m.emoji || '✦') + '</span><div class="cw-cover-grad"></div></div>';
  }
  // Inline markdown → HTML (escaped): code, bold, italic, links.
  function mdInline(t) {
    t = esc(t);
    t = t.replace(/`([^`]+)`/g, '<code class="cw-ic">$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, function (_, txt, url) {
      var ext = /^https?:/.test(url);
      return '<a href="' + url + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + txt + '</a>';
    });
    t = t.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, function (m, sp, url) { return sp + '<a href="' + url + '" target="_blank" rel="noopener">' + url + '</a>'; });
    return t;
  }
  function mdCode(lang, code) {
    return '<div class="cw-code"><div class="cw-code-top"><span>' + esc(lang || 'code') + '</span>'
      + '<button class="cw-code-copy" data-code="' + encodeURIComponent(code) + '">' + ICON.copy + ' Copy</button></div>'
      + '<pre><code>' + esc(code) + '</code></pre></div>';
  }
  function mdTable(rows) {
    function cells(r) { return r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(function (c) { return c.trim(); }); }
    var head = cells(rows[0]);
    var body = rows.slice(1).map(cells);
    var h = '<div class="cw-table-wrap"><table class="cw-table"><thead><tr>' + head.map(function (c) { return '<th>' + mdInline(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    body.forEach(function (r) { h += '<tr>' + r.map(function (c) { return '<td>' + mdInline(c) + '</td>'; }).join('') + '</tr>'; });
    return h + '</tbody></table></div>';
  }
  // Block-level markdown renderer.
  function renderMd(src) {
    src = String(src);
    var blocks = [];
    src = src.replace(/```(\w+)?\n?([\s\S]*?)```/g, function (_, lang, code) { blocks.push({ lang: lang || '', code: code.replace(/\n$/, '') }); return ' C' + (blocks.length - 1) + ' '; });
    var lines = src.split(/\r?\n/), html = '', i = 0;
    while (i < lines.length) {
      var line = lines[i];
      var cm = line.match(/^ C(\d+) $/);
      if (cm) { var b = blocks[+cm[1]]; html += mdCode(b.lang, b.code); i++; continue; }
      if (/^\s*$/.test(line)) { i++; continue; }
      if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) { html += '<hr class="cw-hr">'; i++; continue; }
      var h = line.match(/^(#{1,3})\s+(.*)$/);
      if (h) { var lv = h[1].length; html += '<h' + (lv + 2) + ' class="cw-mh cw-mh' + lv + '">' + mdInline(h[2]) + '</h' + (lv + 2) + '>'; i++; continue; }
      if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]*-[\s:|-]*$/.test(lines[i + 1])) {
        var tbl = [line]; i += 2;
        while (i < lines.length && /\|/.test(lines[i]) && !/^\s*$/.test(lines[i])) { tbl.push(lines[i]); i++; }
        html += mdTable(tbl); continue;
      }
      if (/^\s*>\s?/.test(line)) { var q = []; while (i < lines.length && /^\s*>\s?/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; } html += '<blockquote class="cw-bq">' + mdInline(q.join(' ')) + '</blockquote>'; continue; }
      if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
        var ordered = /^\s*\d+\./.test(line), items = '';
        while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
          var it = lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, '');
          var cb = it.match(/^\[([ xX])\]\s+(.*)$/);
          if (cb) items += '<li class="cw-li-check"><span class="cw-cbx' + (cb[1].toLowerCase() === 'x' ? ' on' : '') + '">' + (cb[1].toLowerCase() === 'x' ? '✓' : '') + '</span><span>' + mdInline(cb[2]) + '</span></li>';
          else items += '<li>' + mdInline(it) + '</li>';
          i++;
        }
        html += (ordered ? '<ol' : '<ul') + ' class="cw-list">' + items + (ordered ? '</ol>' : '</ul>'); continue;
      }
      var para = [line]; i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^\s*(#{1,3}\s|>|[-*+]\s|\d+\.\s|---)/.test(lines[i]) && !/^ C\d+ $/.test(lines[i]) && !/\|/.test(lines[i])) { para.push(lines[i]); i++; }
      html += '<p class="cw-p">' + mdInline(para.join(' ')) + '</p>';
    }
    return html;
  }
  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }

  // ── Home data (data-driven, reusable) ──
  function greeting() {
    var h = new Date().getHours();
    if (h < 12) return 'Good morning 👋';
    if (h < 18) return 'Good afternoon 👋';
    return 'Good evening 👋';
  }

  var QUICK = [
    { label: 'Learn Fast Forward', article: 'fastforward' },
    { label: 'Pricing', seed: 'What are your pricing options?' },
    { label: 'Book Strategy Call', seed: "I'd like to book a call with the team." },
    { label: 'Get The5th AI', article: 'ai' },
    { label: 'Success Stories', seed: 'Can you share some client success stories?' },
    { label: 'Knowledge Base', gotab: 'knowledge' }
  ];

  // Program card models (extend the shared card data model)
  var PROGRAMS = {
    'fast-forward': {
      id: 'fastforward', type: 'hero', emoji: '🚀', badge: '🔥', category: 'Featured Program',
      cover: 'linear-gradient(158deg,#2A1830 0%,#3D2645 48%,#160D1A 100%)', coverImage: null, accent: '#C9A84C',
      title: 'Fast Forward', sub: 'Backed by a 100% Money-Back Guarantee',
      desc: "Build a scalable coaching or service business using proven systems, AI-powered workflows, modern marketing strategies, and direct implementation support. If you meet the guarantee requirements and don't achieve the agreed outcome, we'll refund your investment according to our policy.",
      features: ['Weekly Coaching', 'AI Tools', 'Sales Systems', 'Marketing Strategy', 'Funnel Templates', 'Lifetime Community'],
      info: [{ k: 'Guarantee', v: '100% Money-Back' }, { k: 'Format', v: '1:1 + Group' }],
      url: '/fast-forward',
      primaryAction: { label: 'Learn More', kind: 'article', value: 'fastforward' },
      secondaryAction: { label: 'Book Strategy Call', kind: 'seed', value: "I'd like to book a call with the team." }
    },
    'the5th-ai': {
      id: 'the5th-ai', type: 'promotion', emoji: '🤖', badge: '✨', category: 'AI Assistant',
      cover: 'linear-gradient(158deg,#1A1330 0%,#2A1840 48%,#0D0D14 100%)', coverImage: null, accent: '#B98CD9',
      title: 'The5th AI', sub: 'Your complete marketing team, powered by AI',
      desc: 'Generate landing pages, sales funnels, email campaigns, webinar scripts, offers, ad copy, content calendars, business strategies, client proposals and much more — all within one intelligent workspace.',
      features: ['Marketing', 'Funnels', 'Content', 'Emails', 'Sales', 'Automation', 'AI Agents', 'Business Plans'],
      url: '/ai',
      primaryAction: { label: 'Try Free', kind: 'article', value: 'ai' },
      secondaryAction: { label: 'Explore', kind: 'seed', value: 'Tell me about The5th AI.' }
    },
    'the-collective': {
      id: 'the-collective', type: 'promotion', emoji: '✨', badge: 'COMMUNITY', category: 'Program',
      cover: 'linear-gradient(158deg,#14231D 0%,#2A1830 52%,#0D0D0D 100%)', coverImage: null, accent: '#C9A84C',
      title: 'The Collective', sub: 'Scale toward and past $10K/month',
      desc: 'The ongoing community and coaching that takes you toward — and beyond — consistent $10K months, surrounded by women building on their own terms.',
      features: ['Group Coaching', 'Community 40+', 'Accountability', 'Live Sessions'],
      url: '/collective',
      primaryAction: { label: 'Learn More', kind: 'article', value: 'the-collective' },
      secondaryAction: { label: 'Book Strategy Call', kind: 'seed', value: "I'd like to book a call with the team." }
    }
  };
  // Legacy short keys (backend show_card / navigate) → CMS slugs.
  var PROG_ALIAS = { fastforward: 'fast-forward', ai: 'the5th-ai', collective: 'the-collective' };
  function getProgram(key) { return PROGRAMS[key] || PROGRAMS[PROG_ALIAS[key]] || null; }

  // Load programs/products from the CMS Content API — the single source of
  // truth. Falls back to the seeded defaults above if the API is unavailable.
  function loadPrograms() {
    fetch('/api/carolina/content?type=program&limit=20').then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { return d; }).catch(function () { return null; })
      .then(function (dProg) {
        fetch('/api/carolina/content?type=product&limit=20').then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; })
          .then(function (dProd) {
            var items = ((dProg && dProg.items) || []).concat((dProd && dProd.items) || []);
            items.forEach(function (it) {
              var data = it.data || {};
              PROGRAMS[it.slug] = {
                id: it.slug, type: it.type === 'product' ? 'promotion' : 'hero',
                emoji: data.emoji || '✦', badge: data.badge || '', category: it.category || '',
                cover: data.cover || 'linear-gradient(158deg,#2A1830,#160D1A 55%,#0D0D0D)', coverImage: it.cover_image || null, accent: data.accent || null,
                title: it.title, sub: it.subtitle || '', desc: it.description || it.summary || '',
                features: data.features || [], info: data.info || [], url: data.url || null,
                primaryAction: data.primaryAction || { label: 'Learn More', kind: 'article', value: it.slug },
                secondaryAction: data.secondaryAction || { label: 'Book Strategy Call', kind: 'seed', value: "I'd like to book a call with the team." }
              };
            });
            if (items.length && mode === 'panels' && tab === 'home') showTab('home');
            loadPromoArt();   // apply uploaded artwork LAST so it always wins
          });
      });
  }

  // Homepage Promotions CMS → product artwork (image uploaded in
  // /admin/cms/promos flows straight into these cards). Slugs match PROGRAMS.
  function loadPromoArt() {
    fetch('/api/homepage/promos').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.promos) return;
      var changed = false;
      d.promos.forEach(function (pr) {
        var p = PROGRAMS[pr.slug]; if (!p) return;
        if (pr.image_url) { p.coverImage = pr.image_url; changed = true; }
        if (pr.accent) { p.accent = pr.accent; changed = true; }
        if (pr.gradient) { p.cover = pr.gradient; changed = true; }
      });
      if (changed && mode === 'panels' && tab === 'home') showTab('home');
    }).catch(function () {});
  }

  // Data-driven feeds — empty until real content/CMS is connected.
  var BLOG = [];         // {id,type:'article',category,title,readingTime,publishedAt,author,cover}
  var VIDEOS = [];       // {id,type:'video',title,duration,speaker,views,cover}
  var EVENTS = [];       // {id,type:'event',title,date,location,cover,live}
  // Truthful "updates" that route internally (no fabricated metrics).
  var ANNOUNCEMENTS = [
    { badge: 'NEW', title: 'Free business assessment', description: 'Get your Business Health Score in 60 seconds', icon: null, primaryAction: { kind: 'seed', value: 'I want to take the free quiz — can you guide me?' } },
    { title: 'Book a strategy call', description: 'A free 1:1 consultation with the team', primaryAction: { kind: 'seed', value: "I'd like to book a call with the team." } },
    { title: 'Meet The5th AI', description: 'Your marketing team, powered by AI', primaryAction: { kind: 'article', value: 'ai' } }
  ];

  var KB_CATS = ['Marketing', 'Funnels', 'Sales', 'AI', 'Automation', 'Mindset', 'Offers', 'Pricing', 'Ads', 'Email', 'Community', 'Scaling'];

  // Real client stories only — empty by default (never fabricate income claims).
  var STORIES = [];
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
  // Enter panels mode: build the persistent shell (scroll body + nav) once,
  // then show the current tab. The nav is NOT rebuilt on tab switches so the
  // active capsule animates rather than jumping.
  function renderPanels() {
    clearHomeTimers(); clearPh();
    mode = 'panels';
    if (els.win) els.win.classList.remove('cw-wide');   // shrink back from reading mode
    if (tab === 'messages') tab = 'chat';
    els.win.innerHTML =
      '<div class="cw-scroll" id="cw-scroll"><div class="cw-view" id="cw-view"></div></div>' + navHtml();
    wireNav();
    attachShellScroll();
    showTab(tab);
  }

  function bodyForTab(t) {
    if (t === 'home') return renderHome();
    if (t === 'chat') return renderMessages();
    if (t === 'knowledge') return renderKnowledge();
    if (t === 'discover') return renderDiscover();
    if (t === 'account') return renderAccount();
    return renderHome();
  }

  // Swap only the body + move the capsule (nav persists).
  function showTab(t) {
    tab = t;
    clearHomeTimers();
    var view = els.win.querySelector('#cw-view');
    if (!view) { renderPanels(); return; }
    view.innerHTML = bodyForTab(t);
    // restart the fade-in
    view.classList.remove('cw-view'); void view.offsetWidth; view.classList.add('cw-view');
    var sc = els.win.querySelector('#cw-scroll');
    if (sc) { sc.scrollTop = (t === 'home' && pendingScroll != null) ? pendingScroll : 0; pendingScroll = null; }
    var nav = els.win.querySelector('#cw-nav');
    if (nav) {
      nav.classList.remove('tuck');
      nav.querySelectorAll('.cw-tab').forEach(function (b) {
        var on = b.getAttribute('data-tab') === t;
        b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    wirePanels();
    wireActions(els.win);
    if (t === 'home') mountHome();
    staggerIn(view);
  }

  function sectionTitle(t) { return '<h3 class="cw-h3">' + esc(t) + '</h3>'; }

  function emptyState(icon, title, desc, extra) {
    return '<div class="cw-empty" style="padding:36px 20px"><div class="e-ic">' + icon + '</div>'
      + '<h4>' + esc(title) + '</h4><p>' + esc(desc) + '</p>' + (extra || '') + '</div>';
  }

  // Unified action dispatch for any element carrying data-ak / data-av.
  function applyAction(kind, value) {
    if (kind === 'article') openArticle(value);
    else if (kind === 'nav') window.location.href = value;
    else if (kind === 'seed') startNewChat(value);
    else if (kind === 'tab') { tab = value; renderPanels(); }
    else if (kind === 'conv') openConv(value);
    else if (kind === 'book') openBooking();
  }
  function wireActions(root) {
    root.querySelectorAll('[data-ak]').forEach(function (n) {
      n.addEventListener('click', function (e) { e.stopPropagation(); applyAction(n.getAttribute('data-ak'), n.getAttribute('data-av')); });
      if (n.getAttribute('role') === 'button') {
        n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); applyAction(n.getAttribute('data-ak'), n.getAttribute('data-av')); } });
      }
    });
  }

  // ── Reusable card component system ──────────────────────────────
  // A single data model renders every card variant. Fields:
  //  id,type,title,subtitle/sub,description/desc,category,badge,cover,
  //  emoji,coverImage,features[],info[],author,publishedAt,readingTime,
  //  views,duration,revenue,timeline,locked,primaryAction,secondaryAction
  function actAttr(a) {
    if (!a) return '';
    return 'data-ak="' + esc(a.kind) + '" data-av="' + esc(a.value) + '"';
  }
  function badgeHtml(m) {
    if (!m.category && !m.badge) return '';
    var txt = (m.badge ? m.badge + ' ' : '') + (m.category || '');
    return '<span class="cw-badge2">' + esc(txt.trim()) + '</span>';
  }
  function coverHtml(m, big) {
    if (m.coverImage) return '<div class="cw-cover' + (big ? ' cw-cover-lg' : '') + '"><img class="cw-cov-img" src="' + esc(m.coverImage) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'" /><div class="cw-cover-grad"></div></div>';
    return genCover(m, big);
  }
  // Premium cover: image (with gradient + emoji fallback) and a branded
  // text overlay (eyebrow + title + subtitle) — never just an emoji.
  function heroCover(m, big) {
    var sub = m.sub || m.subtitle || '';
    var eyebrow = (m.badge ? m.badge + ' ' : '') + (m.category || '');
    var ac = m.accent || '#C9A84C', grad = m.cover || 'linear-gradient(158deg,#2A1830,#160D1A 55%,#0D0D0D)';
    var art = m.coverImage
      ? '<img class="cw-cov-img" src="' + esc(m.coverImage) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'" />'
      : '<span class="cw-cart-orb"></span><span class="cw-cart-ring"></span><span class="cw-cart-glyph">' + (m.emoji || '✦') + '</span>';
    return '<div class="cw-cover cw-cover-hero cw-cart' + (big ? ' cw-cover-lg' : '') + '" style="--ca:' + ac + ';--cag:' + hexA(ac, .32) + ';background:' + grad + '">'
      + art
      + '<div class="cw-cover-grad"></div>'
      + '<div class="cw-cover-cap">'
      + (eyebrow.trim() ? '<span class="cw-cover-eyebrow">' + esc(eyebrow.trim()) + '</span>' : '')
      + '<h4 class="cw-cover-title">' + esc(m.title) + '</h4>'
      + (sub ? '<span class="cw-cover-sub">' + esc(sub) + '</span>' : '')
      + '</div><span class="cw-cover-cta">Learn more ' + ICON.arrow + '</span></div>';
  }
  function ctaHtml(m) {
    var out = '';
    if (m.primaryAction) out += '<button class="cw-btn cw-btn-primary" ' + actAttr(m.primaryAction) + '>' + esc(m.primaryAction.label) + ' <i class="cw-cta-arrow">→</i></button>';
    if (m.secondaryAction) out += '<button class="cw-btn cw-btn-ghost" ' + actAttr(m.secondaryAction) + '>' + esc(m.secondaryAction.label) + '</button>';
    return out ? '<div class="cw-feat-btns">' + out + '</div>' : '';
  }
  function metaHtml(m) {
    var bits = [];
    if (m.author) bits.push(esc(m.author));
    if (m.publishedAt) bits.push(esc(m.publishedAt));
    if (m.readingTime) bits.push(esc(m.readingTime));
    if (m.views) bits.push(esc(m.views) + ' views');
    if (!bits.length) return '';
    return '<div class="cw-meta">' + bits.join('<span class="cw-meta-dot">·</span>') + '</div>';
  }
  function featureGrid(m) {
    if (!m.features || !m.features.length) return '';
    var items = m.features.map(function (f) { return '<div class="cw-feat-item">✔ ' + esc(f) + '</div>'; }).join('');
    return '<div class="cw-feat-grid">' + items + '</div>';
  }
  function infoRow(m) {
    if (!m.info || !m.info.length) return '';
    var items = m.info.map(function (x) { return '<div class="cw-info-cell"><span>' + esc(x.v) + '</span><small>' + esc(x.k) + '</small></div>'; }).join('');
    return '<div class="cw-info-row">' + items + '</div>';
  }
  function lockOverlay(m) {
    if (!m.locked) return '';
    return '<div class="cw-lock"><div class="cw-lock-badge">🔒 Premium</div>'
      + '<button class="cw-btn cw-btn-primary" ' + actAttr(m.unlockAction || { kind: 'seed', value: 'How do I unlock this?' }) + '>Unlock</button></div>';
  }

  // Master renderer — switches presentation by type, one data model.
  function renderCard(m) {
    var t = m.type || 'base';
    var sub = m.sub || m.subtitle || '';
    var desc = m.desc || m.description || '';
    // Whole card is clickable → its cardAction, or falls back to the primary CTA.
    var clickable = actAttr(m.cardAction || m.primaryAction);

    // Compact announcement
    if (t === 'announcement') {
      return '<button class="cw-card cw-anc" ' + actAttr(m.primaryAction || m.cardAction) + '>'
        + '<div class="cw-card-ic">' + (m.icon || ICON.spark) + '</div>'
        + '<div class="cw-card-tx"><h5>' + esc(m.title) + '</h5><p>' + esc(desc) + '</p></div>'
        + '<div class="cw-card-go">' + ICON.arrow + '</div></button>';
    }
    // Knowledge card
    if (t === 'knowledge') {
      return '<button class="cw-card" ' + actAttr(m.primaryAction || m.cardAction) + '>'
        + '<div class="cw-card-ic">' + (m.icon || ICON.book) + '</div>'
        + '<div class="cw-card-tx"><h5>' + esc(m.title) + '</h5><p>' + esc(desc) + '</p></div>'
        + '<div class="cw-card-go">' + (m.count ? '<span class="cw-count">' + esc(m.count) + '</span>' : '') + ICON.arrow + '</div></button>';
    }
    // Video card (horizontal)
    if (t === 'video') {
      return '<div class="cw-vcard" ' + actAttr(m.primaryAction || m.cardAction) + '>'
        + '<div class="cw-vthumb" ' + (m.coverImage ? 'style="background-image:url(' + esc(m.coverImage) + ')"' : 'style="background:' + (m.cover || 'linear-gradient(135deg,#241528,#141b2e)') + '"') + '>'
        + '<div class="cw-play">▶</div>' + (m.duration ? '<span class="cw-dur">' + esc(m.duration) + '</span>' : '') + '</div>'
        + '<div class="cw-vbody"><h5>' + esc(m.title) + '</h5><p>' + esc(m.speaker || '') + (m.views ? ' · ' + esc(m.views) + ' views' : '') + '</p></div></div>';
    }
    // Case study card
    if (t === 'casestudy') {
      return '<div class="cw-slide" ' + actAttr(m.cardAction) + '>'
        + (m.revenue ? '<div class="cw-slide-rev">' + esc(m.revenue) + '</div>' : '')
        + '<p class="cw-slide-q">“' + esc(m.quote || '') + '”</p>'
        + '<div class="cw-slide-who">' + esc(m.name || '') + (m.company ? ' · ' + esc(m.company) : '') + (m.timeline ? ' · ' + esc(m.timeline) : '') + '</div></div>';
    }
    // Article card (compact horizontal)
    if (t === 'article') {
      return '<div class="cw-acard" ' + actAttr(m.primaryAction || m.cardAction) + '>'
        + '<div class="cw-athumb" ' + (m.coverImage ? 'style="background-image:url(' + esc(m.coverImage) + ')"' : 'style="background:' + (m.cover || 'linear-gradient(135deg,#241528,#141b2e)') + '"') + '></div>'
        + '<div class="cw-abody">' + badgeHtml(m) + '<h5>' + esc(m.title) + '</h5>' + metaHtml(m) + '</div></div>';
    }
    // hero / promotion / base — full card. With a cover image, the title +
    // subtitle live on the branded cover overlay (no duplicate in the body).
    var withCap = !!m.coverImage;
    var cover = withCap ? heroCover(m, t === 'hero') + lockOverlay(m) : coverHtml(m, t === 'hero') + badgeHtml(m) + lockOverlay(m);
    var body = withCap
      ? (desc ? '<p class="cw-feat-desc">' + esc(desc) + '</p>' : '') + featureGrid(m) + infoRow(m) + metaHtml(m) + ctaHtml(m)
      : '<h4>' + esc((m.emoji ? m.emoji + ' ' : '') + m.title) + '</h4>' + (sub ? '<div class="cw-feat-sub">' + esc(sub) + '</div>' : '') + (desc ? '<p class="cw-feat-desc">' + esc(desc) + '</p>' : '') + featureGrid(m) + infoRow(m) + metaHtml(m) + ctaHtml(m);
    return '<div class="cw-feat' + (t === 'hero' ? ' cw-hero-card' : '') + (m.locked ? ' cw-locked' : '') + '" ' + clickable + ' tabindex="0" role="button">'
      + cover + '<div class="cw-feat-body">' + body + '</div></div>';
  }

  function renderSkeletonCard() {
    return '<div class="cw-feat cw-skel"><div class="cw-cover cw-sk"></div>'
      + '<div class="cw-feat-body"><div class="cw-sk cw-sk-line" style="width:40%"></div>'
      + '<div class="cw-sk cw-sk-line" style="width:80%"></div><div class="cw-sk cw-sk-line" style="width:65%"></div></div></div>';
  }

  // The5th AI — a deliberately DIFFERENT layout from the Fast Forward card.
  function productCard(p) {
    var feats = (p.features || []).map(function (f) { return '<span class="cw-pchip">' + esc(f) + '</span>'; }).join('');
    var ac = p.accent || '#B98CD9';
    var art = p.coverImage
      ? '<img class="cw-cov-img" src="' + esc(p.coverImage) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'" />'
      : '<span class="cw-cart-orb"></span><span class="cw-cart-ring"></span><span class="cw-cart-glyph">' + (p.emoji || '✦') + '</span>';
    var cover = '<div class="cw-product-cover cw-cart" data-ak="article" data-av="ai" role="button" style="--ca:' + ac + ';--cag:' + hexA(ac, .32) + ';background:' + (p.cover || 'linear-gradient(158deg,#1A1330,#0D0D14 60%)') + '">'
      + art + '<div class="cw-cover-grad"></div>'
      + '<div class="cw-cover-cap"><span class="cw-cover-eyebrow">' + esc((p.badge || '✨') + ' AI Product') + '</span>'
      + '<h4 class="cw-cover-title">' + esc(p.title) + '</h4><span class="cw-cover-sub">' + esc(p.sub) + '</span></div></div>';
    return '<div class="cw-product">'
      + '<div class="cw-product-glow"></div>' + cover
      + '<div class="cw-product-body"><div class="cw-pgrid">' + feats + '</div>'
      + '<div class="cw-feat-btns"><button class="cw-btn cw-btn-primary" data-ak="article" data-av="ai">Try Free <i class="cw-cta-arrow">→</i></button>'
      + '<button class="cw-btn cw-btn-ghost" data-ak="nav" data-av="/ai">Buy Now</button>'
      + '<button class="cw-btn cw-btn-ghost" data-ak="article" data-av="ai">Learn More</button></div></div></div>';
  }

  function knowledgeGrid() {
    var grid = '<div class="cw-kgrid">';
    KB_CATS.forEach(function (c) {
      grid += '<button class="cw-kcat" data-ak="seed" data-av="I need help with ' + esc(c) + '."><span class="cw-kcat-ic">' + ICON.folder + '</span><span class="cw-kcat-t">' + esc(c) + '</span></button>';
    });
    return grid + '</div>';
  }

  function communityCard() {
    var faces = ['carolina', 'natasha', 'benjamin'].map(function (k) { return '<span class="cw-cm-face">' + agentAva(k) + '</span>'; }).join('');
    var p = getProgram('the-collective') || {};
    var ac = p.accent || '#C9A84C';
    var art = p.coverImage
      ? '<div class="cw-cm-art"><img class="cw-cov-img" src="' + esc(p.coverImage) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'" /><div class="cw-cover-grad"></div></div>'
      : '<div class="cw-cm-art cw-cart" style="--ca:' + ac + ';--cag:' + hexA(ac, .32) + ';background:' + (p.cover || 'linear-gradient(158deg,#14231D,#2A1830 52%,#0D0D0D)') + '"><span class="cw-cart-orb"></span><span class="cw-cart-ring"></span><span class="cw-cart-glyph">' + (p.emoji || '◆') + '</span><div class="cw-cover-grad"></div></div>';
    return '<div class="cw-community" data-ak="article" data-av="collective" tabindex="0" role="button">'
      + art
      + '<div class="cw-cm-head"><div class="cw-card-ic">' + ICON.users + '</div>'
      + '<div><h5>The Collective</h5><p>Women 40+ building on their own terms</p></div></div>'
      + '<p class="cw-cm-desc">Ongoing coaching, accountability and a community that takes you toward — and past — consistent $10K months.</p>'
      + '<div class="cw-cm-foot"><div class="cw-cm-faces">' + faces + '</div>'
      + '<button class="cw-btn cw-btn-primary" data-ak="article" data-av="collective">Join the community</button></div></div>';
  }

  function newsletterCard() {
    return '<div class="cw-news"><div class="cw-news-glow"></div>'
      + '<h4>' + ICON.mail + ' Join The5th Weekly</h4>'
      + '<p>Business strategies, AI updates, marketing frameworks and exclusive resources — every week.</p>'
      + '<form class="cw-news-form" id="cw-news-form"><input type="email" id="cw-news-email" placeholder="you@email.com" aria-label="Email address" />'
      + '<button type="submit" class="cw-btn cw-btn-primary" id="cw-news-btn">Subscribe</button></form>'
      + '<div class="cw-news-ok" id="cw-news-ok"></div></div>';
  }

  function footerHtml() {
    var year = new Date().getFullYear();
    return '<div class="cw-foot2"><div class="cw-foot2-links">'
      + '<a data-ak="nav" data-av="/privacy">Privacy</a><span>·</span>'
      + '<a data-ak="nav" data-av="/terms">Terms</a><span>·</span>'
      + '<a data-ak="seed" data-av="I need help from a person.">Contact</a></div>'
      + '<div class="cw-foot2-meta">The5th AI · v2 · © ' + year + ' The5th Consulting</div></div>';
  }

  function renderHome() {
    // ── Cinematic hero: sticky top bar + greeting + search card ──
    var topbar = '<div class="cw-topbar" id="cw-topbar">'
      + '<div class="cw-tb-left"><span class="cw-brand"><img src="/logo-white2.png" alt="The5th" onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'the<b>5</b>th\'" /></span></div>'
      + '<div class="cw-tb-right">' + teamCluster(true)
      + '<button class="cw-iconbtn cw-hero-x" id="cw-home-close" aria-label="Close">' + ICON.close + '</button></div></div>';

    var greet = '<div class="cw-hgreet"><span class="cw-hg1">' + esc(T('hi')) + '</span><span class="cw-hg2">' + esc(T('help')) + '</span></div>';

    var searchCard = '<button class="cw-searchcard" id="cw-searchcard">'
      + '<span class="cw-sc-ic">' + ICON.search + '</span>'
      + '<span class="cw-sc-tx"><b>' + esc(T('ask')) + '</b><i>' + esc(T('askSub')) + '</i></span>'
      + heroStack() + '</button>';

    var heroBlock = '<div class="cw-herowrap">' + topbar + '<div class="cw-heropad">' + greet + searchCard + '</div></div>';

    // Continue (recent conversation)
    var recent = '';
    var conv = store.conversations.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; })[0];
    if (conv && conv.messages.length) {
      recent = '<div class="cw-sect">' + sectionTitle('Continue where you left off')
        + '<div class="cw-conv" data-conv="' + conv.id + '"><div class="cw-conv-ava">' + avatarInner() + '</div>'
        + '<div class="cw-conv-tx"><h5>' + esc(convTitle(conv)) + '</h5><p>' + esc(convPreview(conv)) + '</p></div>'
        + '<div class="cw-conv-t">' + timeAgo(conv.updatedAt) + '</div></div></div>';
    }

    // 1) Featured Program — Fast Forward (hero card)
    var ffP = getProgram('fast-forward');
    var featured = ffP ? '<div class="cw-sect">' + sectionTitle('Featured Program') + renderCard(ffP) + '</div>' : '';

    // 2) The5th AI — distinct product layout
    var aiP = getProgram('the5th-ai');
    var product = aiP ? '<div class="cw-sect">' + sectionTitle('The5th AI') + productCard(aiP) + '</div>' : '';

    // 3) Latest Updates
    var updates = ANNOUNCEMENTS.length
      ? '<div class="cw-sect">' + sectionTitle('Latest updates') + ANNOUNCEMENTS.map(function (a) { a.type = 'announcement'; return renderCard(a); }).join('') + '</div>'
      : '';

    // 4) Knowledge Center — header + category grid
    var kb = '<div class="cw-sect">' + sectionTitle('Knowledge Center')
      + '<p class="cw-ssub">Browse everything, instantly.</p>'
      + '<div class="cw-searchcard cw-ksrch" data-ak="seed" data-av="I have a question about The5th.">'
      + '<span class="cw-sc-ic">' + ICON.search + '</span>'
      + '<span class="cw-sc-tx"><b>Search the knowledge base</b><i>Ask our AI anything</i></span></div>'
      + knowledgeGrid() + '</div>';

    // 5) Latest Articles — editorial (data-driven)
    var articles = '<div class="cw-sect">' + sectionTitle('Latest articles')
      + (BLOG.length
        ? BLOG.slice(0, 3).map(function (b) { b.type = 'article'; return renderCard(b); }).join('')
        : emptyState(ICON.book, 'No articles yet', 'Ask The5th AI for a recommendation and I’ll point you to the right next step.',
          '<button class="cw-btn cw-btn-ghost" data-ak="seed" data-av="Can you recommend where I should start?" style="margin-top:14px">Ask for a recommendation</button>'))
      + '</div>';

    // 6) Client Success — carousel (data-driven)
    var success = '<div class="cw-sect">' + sectionTitle('Client success')
      + (STORIES.length
        ? '<div class="cw-carousel" id="cw-carousel"><div class="cw-track" id="cw-track">' + STORIES.map(function (s) { s.type = 'casestudy'; return renderCard(s); }).join('') + '</div><div class="cw-dots" id="cw-dots"></div></div>'
        : emptyState(ICON.spark, 'Client stories coming soon', 'Real results from women building with The5th, shared here shortly.'))
      + '</div>';

    // 8) Upcoming Events (data-driven)
    var events = '<div class="cw-sect">' + sectionTitle('Upcoming events')
      + (EVENTS.length
        ? EVENTS.map(function (e) { e.type = 'promotion'; return renderCard(e); }).join('')
        : emptyState(ICON.spark, 'No events scheduled', 'Check back later — live workshops are announced here.'))
      + '</div>';

    // 9) Community  10) Newsletter  11) Footer
    var community = '<div class="cw-sect">' + sectionTitle('Community') + communityCard() + '</div>';
    var newsletter = '<div class="cw-sect">' + newsletterCard() + '</div>';
    var footer = footerHtml();

    return heroBlock + '<div class="cw-home">' + recent + featured + product + updates + kb + articles + success + events + community + newsletter + footer + '</div>';
  }

  // ── Unified in-chat content viewer (Part 3D) — every CMS type ──
  var TYPE_META = {
    program: { badge: 'Program', ic: 'spark' }, product: { badge: 'Product', ic: 'spark' },
    article: { badge: 'Article', ic: 'book' }, knowledge: { badge: 'Guide', ic: 'book' },
    case_study: { badge: 'Case study', ic: 'chart' }, video: { badge: 'Video', ic: 'play' },
    faq: { badge: 'FAQ', ic: 'book' }, announcement: { badge: 'Update', ic: 'spark' },
    event: { badge: 'Event', ic: 'phone' }, testimonial: { badge: 'Story', ic: 'chart' },
    page: { badge: 'Page', ic: 'book' }, team: { badge: 'Team', ic: 'user' }
  };
  function programToItem(p) {
    return {
      type: p.type === 'promotion' ? 'product' : 'program', slug: p.id, title: p.title, subtitle: p.sub,
      description: p.desc, cover_image: p.coverImage, category: p.category, reading_time: 4,
      data: { emoji: p.emoji, badge: p.badge, cover: p.cover, features: p.features, info: p.info, url: p.url }
    };
  }
  function videoEmbed(data) {
    if (!data) return '';
    if (data.provider === 'youtube' && data.videoId) return '<div class="cw-embed"><iframe src="https://www.youtube.com/embed/' + esc(data.videoId) + '" allowfullscreen loading="lazy"></iframe></div>';
    if (data.provider === 'vimeo' && data.videoId) return '<div class="cw-embed"><iframe src="https://player.vimeo.com/video/' + esc(data.videoId) + '" allowfullscreen loading="lazy"></iframe></div>';
    return '';
  }
  function faqHtml(data) {
    var items = (data && data.items) || [];
    if (!items.length) return '';
    return '<div class="cw-faq">' + items.map(function (f) {
      return '<details class="cw-faq-i"><summary>' + esc(f.q || '') + '</summary><div>' + renderMd(f.a || '') + '</div></details>';
    }).join('') + '</div>';
  }
  function metricsHtml(data) {
    var m = (data && data.metrics) || [];
    if (!m.length) return '';
    return '<div class="cw-metrics">' + m.map(function (x) { return '<div class="cw-metric"><b>' + esc(x.v) + '</b><span>' + esc(x.k) + '</span></div>'; }).join('') + '</div>';
  }
  function relatedHtml(related) {
    if (!related || !related.length) return '';
    return '<div class="cw-slabel">Related</div>' + related.slice(0, 6).map(function (r) {
      var meta = TYPE_META[r.type] || { badge: r.type, ic: 'book' };
      var ico = r.cover_image ? '<span class="cw-rel-ic" style="background-image:url(' + esc(r.cover_image) + ');background-size:cover"></span>' : '<span class="cw-rel-ic" style="background:linear-gradient(135deg,#3D2645,#143826)">' + ICON[meta.ic] + '</span>';
      return '<button class="cw-rel" data-content="' + esc(r.slug) + '">' + ico + '<span class="cw-rel-t">' + esc(r.title) + '<i>' + esc(meta.badge) + '</i></span>' + ICON.arrow + '</button>';
    }).join('');
  }
  function ctaFor(item) {
    var t = item.type, title = item.title, d = item.data || {};
    if (t === 'program') return '<button class="cw-btn cw-btn-primary" data-ak="book" data-av="1">Book a strategy call</button>';
    if (t === 'product') return '<button class="cw-btn cw-btn-primary" data-ak="seed" data-av="I want to try ' + esc(title) + '.">Try Free</button>' + (d.url ? '<button class="cw-btn cw-btn-ghost" data-ak="nav" data-av="' + esc(d.url) + '">Buy Now</button>' : '');
    if (t === 'case_study') return '<button class="cw-btn cw-btn-primary" data-ak="book" data-av="1">Book a strategy call</button>';
    if (t === 'event') return '<button class="cw-btn cw-btn-primary" data-ak="seed" data-av="I\'d like to reserve a spot for ' + esc(title) + '.">Reserve my spot</button>';
    return '';
  }

  function bookmarks() { try { return JSON.parse(localStorage.getItem('the5th_carolina_bm') || '[]'); } catch (e) { return []; } }
  function isBookmarked(slug) { return bookmarks().indexOf(slug) !== -1; }
  function toggleBookmark(slug) { var b = bookmarks(); var i = b.indexOf(slug); if (i === -1) b.push(slug); else b.splice(i, 1); try { localStorage.setItem('the5th_carolina_bm', JSON.stringify(b)); } catch (e) {} return i === -1; }

  function renderContentView(item, related) {
    mode = 'article';
    if (els.win) els.win.classList.add('cw-wide');   // reading mode: comfortable width
    var d = item.data || {};
    var meta = TYPE_META[item.type] || { badge: item.type, ic: 'book' };
    var emoji = d.emoji ? d.emoji + ' ' : '';
    var cover = item.cover_image
      ? '<div class="cw-cover cw-cover-lg"><img class="cw-cov-img" src="' + esc(item.cover_image) + '" alt="" onerror="this.style.display=\'none\'"/><div class="cw-cover-grad"></div></div>'
      : '<div class="cw-cover cw-cover-lg" style="background:' + (d.cover || 'linear-gradient(135deg,#241528,#141b2e)') + '"><span class="cw-cover-emoji">' + (d.emoji || '✦') + '</span><div class="cw-cover-grad"></div></div>';
    var metaLine = '<span class="cw-ctype">' + esc(meta.badge) + '</span>'
      + (item.reading_time ? '<span class="cw-readtime">' + ICON.book + ' ' + item.reading_time + ' min read</span>' : '')
      + (item.author ? '<span class="cw-cauthor">' + esc(item.author) + '</span>' : '');
    var typeTop = (item.type === 'program' || item.type === 'product')
      ? ((d.features && d.features.length ? '<ul class="cw-art-list">' + d.features.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') + (d.info && d.info.length ? infoRow({ info: d.info }) : ''))
      : metricsHtml(d);

    els.win.innerHTML =
      '<div class="cw-chatview"><div class="cw-artbar"><button class="cw-iconbtn" id="cw-artback" aria-label="Back">' + ICON.back + '</button>'
      + '<span>' + esc(item.title) + '</span>'
      + '<button class="cw-iconbtn" id="cw-bm" aria-label="Bookmark" title="Bookmark">' + (isBookmarked(item.slug) ? '★' : '☆') + '</button>'
      + '<button class="cw-iconbtn" id="cw-share" aria-label="Copy link" title="Copy link">' + ICON.copy + '</button></div>'
      + '<div class="cw-progress"><span id="cw-progress-bar"></span></div>'
      + '<div class="cw-scroll" id="cw-cscroll"><div class="cw-article">'
      + cover
      + '<div class="cw-art-body"><div class="cw-content-meta">' + metaLine + '</div>'
      + '<h1>' + esc(emoji + item.title) + '</h1>'
      + (item.subtitle ? '<div class="cw-feat-sub" style="margin:0 0 12px">' + esc(item.subtitle) + '</div>' : '')
      + '<div id="cw-toc"></div>'
      + typeTop
      + '<div class="cw-richbody" id="cw-richbody">' + renderMd(item.description || item.summary || '') + '</div>'
      + (item.type === 'faq' ? faqHtml(d) : '')
      + '<div class="cw-feat-btns" style="margin-top:22px">' + ctaFor(item)
      + '<button class="cw-btn cw-btn-ghost" id="cw-askabout">Ask The5th AI about this</button></div>'
      + '<div class="cw-feedback">Was this helpful? <button data-fb="up">👍</button><button data-fb="down">👎</button></div>'
      + '<div class="cw-art-rel" id="cw-related">' + relatedHtml(related) + '</div>'
      + '</div></div></div></div>';

    viewContext = item.title + ' (' + item.type + ')';
    var art = els.win.querySelector('.cw-article'); if (art) art.classList.add('cw-slidein');
    wireContent(item);
    buildToc();
  }

  function wireContent(item) {
    els.win.querySelector('#cw-artback').addEventListener('click', function () { pendingScroll = homeScroll; viewContext = ''; renderPanels(); });
    var bm = els.win.querySelector('#cw-bm');
    if (bm) bm.addEventListener('click', function () { var on = toggleBookmark(item.slug); bm.textContent = on ? '★' : '☆'; toast(on ? 'Bookmarked' : 'Removed'); });
    var sh = els.win.querySelector('#cw-share');
    if (sh) sh.addEventListener('click', function () { var url = location.origin + (item.data && item.data.url ? item.data.url : '/' + item.slug); try { navigator.clipboard.writeText(url); } catch (e) {} toast('Link copied'); });
    var ask = els.win.querySelector('#cw-askabout');
    if (ask) ask.addEventListener('click', function () { startNewChat('I have a question about ' + item.title + '.', item.title + ' (' + item.type + ')'); });
    els.win.querySelectorAll('.cw-feedback [data-fb]').forEach(function (b) { b.addEventListener('click', function () { els.win.querySelectorAll('.cw-feedback [data-fb]').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); toast('Thanks for the feedback'); }); });
    els.win.querySelectorAll('[data-content]').forEach(function (n) { n.addEventListener('click', function (e) { e.stopPropagation(); openContent(n.getAttribute('data-content')); }); });
    // reading progress
    var sc = els.win.querySelector('#cw-cscroll'), bar = els.win.querySelector('#cw-progress-bar');
    if (sc && bar) sc.addEventListener('scroll', function () { var m = sc.scrollHeight - sc.clientHeight; bar.style.width = (m > 0 ? Math.min(100, (sc.scrollTop / m) * 100) : 0) + '%'; });
    wireActions(els.win);
  }
  function buildToc() {
    var body = els.win.querySelector('#cw-richbody'); var toc = els.win.querySelector('#cw-toc');
    if (!body || !toc) return;
    var hs = body.querySelectorAll('.cw-mh1, .cw-mh2');
    if (hs.length < 2) return;
    var html = '<details class="cw-toc"><summary>Contents</summary><ul>';
    hs.forEach(function (h, i) { var id = 'sec' + i; h.id = id; html += '<li data-goto="' + id + '">' + esc(h.textContent) + '</li>'; });
    toc.innerHTML = html + '</ul></details>';
    toc.querySelectorAll('[data-goto]').forEach(function (li) { li.addEventListener('click', function () { var t = document.getElementById(li.getAttribute('data-goto')); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); });
  }

  function openContent(slug) {
    captureHomeScroll(); clearHomeTimers(); mode = 'article';
    if (els.win) els.win.classList.add('cw-wide');   // widen as the reader loads
    var local = getProgram(slug);
    if (local) {
      renderContentView(programToItem(local), []);
      // fetch CMS related in the background
      fetch('/api/carolina/content/' + encodeURIComponent(slug)).then(function (r) { return r.ok ? r.json() : null; }).then(function (dd) {
        if (dd && dd.related && dd.related.length) { var el = els.win.querySelector('#cw-related'); if (el) { el.innerHTML = relatedHtml(dd.related); el.querySelectorAll('[data-content]').forEach(function (n) { n.addEventListener('click', function (e) { e.stopPropagation(); openContent(n.getAttribute('data-content')); }); }); } }
      }).catch(function () {});
      return;
    }
    els.win.innerHTML = '<div class="cw-chatview"><div class="cw-artbar"><button class="cw-iconbtn" id="cw-artback">' + ICON.back + '</button><span>Loading…</span></div><div class="cw-scroll"><div class="cw-loading"><div class="cw-feat cw-skel"><div class="cw-cover cw-sk"></div><div class="cw-feat-body"><div class="cw-sk cw-sk-line" style="width:50%"></div><div class="cw-sk cw-sk-line"></div><div class="cw-sk cw-sk-line" style="width:70%"></div></div></div></div></div></div>';
    var bk = els.win.querySelector('#cw-artback'); if (bk) bk.addEventListener('click', function () { pendingScroll = homeScroll; renderPanels(); });
    fetch('/api/carolina/content/' + encodeURIComponent(slug)).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.item) { renderPanels(); toast('Content unavailable'); return; }
      renderContentView(d.item, d.related || []);
    }).catch(function () { renderPanels(); toast('Content unavailable'); });
  }
  // Back-compat: existing wiring calls openArticle — route it to the unified viewer.
  function openArticle(key) { openContent(key); }

  // Home mount: search, pills, and the success carousel.
  // (Sticky-header + nav scroll behaviour live in attachShellScroll.)
  function mountHome() {
    var sc = els.win.querySelector('#cw-searchcard');
    if (sc) sc.addEventListener('click', function () { startNewChat(); });
    var hx = els.win.querySelector('#cw-home-close');
    if (hx) hx.addEventListener('click', function () { toggle(false); });
    // Newsletter subscribe
    var nf = els.win.querySelector('#cw-news-form');
    if (nf) nf.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (els.win.querySelector('#cw-news-email') || {}).value || '';
      var ok = els.win.querySelector('#cw-news-ok');
      var btn = els.win.querySelector('#cw-news-btn');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { if (ok) { ok.textContent = 'Please enter a valid email.'; ok.className = 'cw-news-ok err'; } shake(nf); return; }
      if (btn) { btn.disabled = true; btn.textContent = 'Subscribing…'; }
      fetch('/api/carolina/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), visitor_id: vid() }) })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (d) {
          if (d && d.ok) { nf.style.display = 'none'; if (ok) { ok.className = 'cw-news-ok done'; ok.innerHTML = '<svg class="cw-check" viewBox="0 0 52 52"><circle class="cw-check-c" cx="26" cy="26" r="23"/><path class="cw-check-p" d="M15 27l7.5 7.5L37 19"/></svg> You’re in — welcome to The5th Weekly.'; } }
          else { if (ok) { ok.textContent = (d && d.error) || 'Something went wrong.'; ok.className = 'cw-news-ok err'; } if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; } }
        })
        .catch(function () { if (ok) { ok.textContent = 'Network error — try again.'; ok.className = 'cw-news-ok err'; } if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; } });
    });
    els.win.querySelectorAll('[data-article]').forEach(function (n) { n.addEventListener('click', function (e) { e.stopPropagation(); openArticle(n.getAttribute('data-article')); }); });
    els.win.querySelectorAll('[data-gotab]').forEach(function (n) { n.addEventListener('click', function () { showTab(n.getAttribute('data-gotab')); }); });
    // carousel auto-advance
    var track = els.win.querySelector('#cw-track');
    if (track && STORIES.length > 1) {
      var dots = els.win.querySelector('#cw-dots');
      var idx = 0;
      for (var i = 0; i < STORIES.length; i++) dots.insertAdjacentHTML('beforeend', '<span class="cw-dot-i' + (i === 0 ? ' on' : '') + '"></span>');
      var go = function (n) { idx = (n + STORIES.length) % STORIES.length; track.style.transform = 'translateX(-' + (idx * 100) + '%)'; dots.querySelectorAll('span').forEach(function (d, di) { d.classList.toggle('on', di === idx); }); };
      homeTimers.push(setInterval(function () { go(idx + 1); }, 6000));
    }
  }

  function renderMessages() {
    var head = '<div class="cw-hero" style="padding-bottom:22px"><div class="cw-hero-top"><div class="cw-logo">Chat</div>'
      + teamCluster() + '</div></div>';
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
      + teamCluster() + '</div></div>';
    var search = '<div class="cw-sect"><div class="cw-ksearch">' + ICON.search
      + '<input id="cw-ksearch" placeholder="Search for help…" /></div>';
    var items = '<div class="cw-slabel">Popular questions</div>';
    knowledgeItems().forEach(function (k) {
      items += '<div class="cw-kitem" data-seed="' + esc(k.seed) + '"><span>' + esc(k.q) + '</span><div class="cw-card-go">' + ICON.arrow + '</div></div>';
    });
    return head + search + items + '</div>';
  }

  // Discover — blogs, videos, case studies, news, events (data-driven).
  function renderDiscover() {
    var head = '<div class="cw-hero" style="padding-bottom:22px"><div class="cw-hero-top"><div class="cw-logo">Discover</div>'
      + teamCluster() + '</div></div>';
    var out = '';
    if (ANNOUNCEMENTS.length) out += '<div class="cw-sect">' + sectionTitle('Updates') + ANNOUNCEMENTS.map(function (a) { a.type = 'announcement'; return renderCard(a); }).join('') + '</div>';
    if (BLOG.length) out += '<div class="cw-sect">' + sectionTitle('Latest blog') + BLOG.map(function (b) { b.type = 'article'; return renderCard(b); }).join('') + '</div>';
    if (STORIES.length) out += '<div class="cw-sect">' + sectionTitle('Case studies') + STORIES.map(function (s) { s.type = 'casestudy'; return '<div style="margin-bottom:10px">' + renderCard(s) + '</div>'; }).join('') + '</div>';
    if (EVENTS.length) out += '<div class="cw-sect">' + sectionTitle('Events') + EVENTS.map(function (e) { e.type = 'promotion'; return renderCard(e); }).join('') + '</div>';
    if (!out) out = emptyState(ICON.compass, 'Discover is coming soon', 'Fresh blogs, videos, case studies and events will land here — stay tuned.',
      '<button class="cw-btn cw-btn-ghost" data-ak="seed" data-av="What can The5th help me with?" style="margin-top:14px">Ask Carolina instead</button>');
    return head + '<div class="cw-home">' + out + '</div>';
  }

  // Account — profile, settings, preferences (all functional, local).
  function renderAccount() {
    var head = '<div class="cw-hero" style="padding-bottom:26px"><div class="cw-hero-top"><div class="cw-logo">Account</div></div>'
      + '<div class="cw-acct-id"><div class="cw-acct-ava">' + ICON.user + '</div>'
      + '<div><h4>Welcome 👋</h4><p>Chat with Carolina for personalised help</p></div></div></div>';

    function row(icon, label, right, attrs, danger) {
      return '<button class="cw-arow' + (danger ? ' danger' : '') + '"' + (attrs || '') + '>'
        + '<span class="cw-arow-ic">' + icon + '</span><span class="cw-arow-lb">' + label + '</span>'
        + '<span class="cw-arow-r">' + (right || ICON.arrow) + '</span></button>';
    }
    function toggleRow(icon, label, on, id) {
      return '<div class="cw-arow"><span class="cw-arow-ic">' + icon + '</span><span class="cw-arow-lb">' + label + '</span>'
        + '<button class="cw-switch' + (on ? ' on' : '') + '" id="' + id + '" role="switch" aria-checked="' + on + '" aria-label="' + label + '"><span></span></button></div>';
    }

    var prefs = '<div class="cw-sect">' + sectionTitle('Preferences')
      + '<div class="cw-alist">'
      + toggleRow(ICON.bell, 'Notifications', notifEnabled(), 'cw-notif-tg')
      + '<div class="cw-arow"><span class="cw-arow-ic">' + ICON.moon + '</span><span class="cw-arow-lb">Appearance</span>'
      + '<span class="cw-seg"><button class="cw-seg-b' + (theme === 'dark' ? ' on' : '') + '" data-theme="dark">Dark</button><button class="cw-seg-b' + (theme === 'light' ? ' on' : '') + '" data-theme="light">Light</button></span></div>'
      + '<div class="cw-arow"><span class="cw-arow-ic">' + ICON.globe + '</span><span class="cw-arow-lb">Language</span>'
      + '<select class="cw-langsel" id="cw-lang" aria-label="Language">' + LANGS.map(function (l) { return '<option value="' + l[0] + '"' + (lang === l[0] ? ' selected' : '') + '>' + l[1] + '</option>'; }).join('') + '</select></div>'
      + '</div></div>';

    var actions = '<div class="cw-sect">' + sectionTitle('Support')
      + '<div class="cw-alist">'
      + row(ICON.phone, 'Book a strategy call', ICON.arrow, ' data-ak="seed" data-av="I\'d like to book a call with the team."')
      + row(ICON.msg, 'Contact support', ICON.arrow, ' data-ak="seed" data-av="I need help from a person."')
      + row(ICON.shield, 'Privacy Policy', ICON.arrow, ' data-ak="nav" data-av="/privacy"')
      + row(ICON.book, 'Terms of Service', ICON.arrow, ' data-ak="nav" data-av="/terms"')
      + '</div></div>';

    var danger = '<div class="cw-sect">'
      + '<div class="cw-alist">' + row(ICON.trash, 'Clear all conversations', '', ' id="cw-clearconv"', true) + '</div>'
      + '<p class="cw-cred" style="margin-top:18px">Powered by <b>The5th AI</b></p></div>';

    return head + prefs + actions + danger;
  }

  // Five-item floating glass navigation. Icons are Lucide-style, 1.8 stroke.
  var NAV_ITEMS = [
    { id: 'home', ic: 'home', label: 'Home' },
    { id: 'chat', ic: 'msg', label: 'Chat' },
    { id: 'knowledge', ic: 'book', label: 'Knowledge' },
    { id: 'discover', ic: 'compass', label: 'Discover' },
    { id: 'account', ic: 'user', label: 'Account' }
  ];
  function navHtml() {
    var html = '<nav class="cw-nav" id="cw-nav" role="tablist" aria-label="Primary">';
    NAV_ITEMS.forEach(function (it) {
      var on = tab === it.id;
      var icon = (it.id === 'account' && cfg.userAvatar)
        ? '<img class="cw-navava" src="' + esc(cfg.userAvatar) + '" alt="" />'
        : ICON[it.ic];
      html += '<button class="cw-tab' + (on ? ' on' : '') + '" role="tab" tabindex="' + (on ? '0' : '-1') + '"'
        + ' aria-selected="' + (on ? 'true' : 'false') + '" aria-label="' + it.label + '" title="' + it.label + '" data-tab="' + it.id + '">'
        + '<span class="cw-tab-glow"></span><span class="cw-tab-ic">' + icon + navBadge(badges[it.id]) + '</span></button>';
    });
    return html + '</nav>';
  }
  function wireNav() {
    var nav = els.win.querySelector('#cw-nav');
    if (!nav) return;
    nav.querySelectorAll('.cw-tab').forEach(function (b) {
      b.addEventListener('click', function () { showTab(b.getAttribute('data-tab')); });
    });
    nav.addEventListener('keydown', function (e) {
      var i = NAV_ORDER.indexOf(tab);
      if (e.key === 'ArrowRight') { e.preventDefault(); showTab(NAV_ORDER[(i + 1) % NAV_ORDER.length]); focusActiveTab(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); showTab(NAV_ORDER[(i - 1 + NAV_ORDER.length) % NAV_ORDER.length]); focusActiveTab(); }
    });
  }
  function focusActiveTab() { var a = els.win.querySelector('.cw-tab.on'); if (a) a.focus(); }

  // One scroll listener drives both the Home sticky-header blur and the
  // nav "tuck" (slides down + lightens while scrolling down).
  function attachShellScroll() {
    var sc = els.win.querySelector('#cw-scroll');
    var nav = els.win.querySelector('#cw-nav');
    if (!sc) return;
    var last = 0;
    sc.addEventListener('scroll', function () {
      var top = sc.scrollTop;
      var tb = els.win.querySelector('#cw-topbar'); if (tb) tb.classList.toggle('scrolled', top > 8);
      if (nav) {
        if (top > last + 3 && top > 40) nav.classList.add('tuck');
        else if (top < last - 3) nav.classList.remove('tuck');
      }
      last = top;
    });
  }

  // Premium first-open suggestion cards (refined SVG icons, not emoji).
  var WELCOME_CARDS = [
    { ic: 'chart', title: 'Grow my business', seed: 'I want to grow my business — where should I start?' },
    { ic: 'compass', title: 'Which program fits me?', seed: 'Which program is right for me?' },
    { ic: 'spark', title: 'Learn about The5th AI', seed: 'Tell me about The5th AI.' },
    { ic: 'book', title: 'Browse the knowledge base', seed: 'What can I learn from your knowledge base?' },
    { ic: 'shield', title: 'Learn about Fast Forward', seed: 'Tell me about Fast Forward.' },
    { ic: 'phone', title: 'Book a strategy call', seed: "I'd like to book a strategy call." }
  ];

  function renderChat() {
    clearHomeTimers(); clearThink();
    mode = 'chat';
    if (els.win) els.win.classList.remove('cw-wide');   // chat uses the standard width
    lastMsgKey = null;
    var conv = activeConv();
    var cur = agentInfo((conv && conv.agent) || 'carolina');
    els.win.innerHTML =
      '<div class="cw-chatview">'
      + '<div class="cw-chead"><button class="cw-iconbtn" id="cw-back" aria-label="Back to home">' + ICON.back + '</button>'
      + '<div class="cw-chead-mid"><div class="cw-chead-ava" id="cw-chead-ava">' + agentAva(cur.key) + '</div>'
      + '<div class="cw-chead-tx"><h4 id="cw-chead-name">' + esc(cur.name) + '</h4><p><span class="cw-live"></span><span id="cw-chead-role">' + esc(cur.role) + '</span> · online</p></div></div>'
      + '<button class="cw-iconbtn" id="cw-menu" aria-label="Conversation options" aria-haspopup="true">' + ICON.dots + '</button>'
      + '<div class="cw-menu-pop" id="cw-menu-pop" role="menu" hidden>'
      + '<button data-menu="clear" role="menuitem">' + ICON.refresh + ' Clear chat</button>'
      + '<button data-menu="emailme" role="menuitem">' + ICON.mail + ' Email me this chat</button>'
      + '<button data-menu="export" role="menuitem">' + ICON.download + ' Export transcript</button>'
      + '<button data-menu="delete" role="menuitem" class="danger">' + ICON.trash + ' Delete conversation</button></div></div>'
      + '<div class="cw-scroll" id="cw-cscroll"><div class="cw-msgs" id="cw-msgs"></div></div>'
      + '<div class="cw-comp"><div class="cw-slash" id="cw-slash" role="listbox" hidden></div>'
      + '<div class="cw-atts" id="cw-atts"></div>'
      + '<div class="cw-comp-row" id="cw-comprow">'
      + (cfg.features.attachments ? '<button class="cw-attach" id="cw-attach" aria-label="Attach a file" title="Attach a screenshot or file">' + ICON.clip + '</button>'
        + '<input type="file" id="cw-file" multiple accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" hidden />' : '')
      + '<textarea class="cw-in" id="cw-in" rows="1" aria-label="Message The5th AI" placeholder="' + esc(T('ph')) + '"></textarea>'
      + '<button class="cw-send" id="cw-send" aria-label="Send" disabled>' + ICON.send + '</button></div>'
      + '<div class="cw-drop" id="cw-drop">' + ICON.clip + ' Drop files to attach</div>'
      + '<p class="cw-cred">Powered by <b>The5th AI</b> · type <b>/</b> for commands</p></div></div>';

    els.msgs = els.win.querySelector('#cw-msgs');
    els.in = els.win.querySelector('#cw-in');
    els.send = els.win.querySelector('#cw-send');
    var cscroll = els.win.querySelector('#cw-cscroll');

    els.win.querySelector('#cw-back').addEventListener('click', function () { pendingScroll = homeScroll; renderPanels(); });
    els.send.addEventListener('click', function () { sendMessage(els.in.value); });
    wireComposer();
    cscroll.addEventListener('scroll', function () { if (nearBottom()) hideNewPill(); });
    // Delegated copy for code blocks rendered inside markdown.
    els.msgs.addEventListener('click', function (e) {
      var cp = e.target.closest && e.target.closest('.cw-code-copy');
      if (cp) { try { navigator.clipboard.writeText(decodeURIComponent(cp.getAttribute('data-code') || '')); } catch (_) {} toast('Copied to clipboard'); }
    });

    // 3-dot menu
    var menu = els.win.querySelector('#cw-menu'), pop = els.win.querySelector('#cw-menu-pop');
    menu.addEventListener('click', function (e) { e.stopPropagation(); pop.hidden = !pop.hidden; });
    document.addEventListener('click', function () { if (pop) pop.hidden = true; });
    pop.querySelectorAll('[data-menu]').forEach(function (b) {
      b.addEventListener('click', function () { pop.hidden = true; chatMenu(b.getAttribute('data-menu')); });
    });

    // paint — premium welcome for a fresh chat, else the AI intro + history.
    var empty = !conv || conv.messages.length === 0;
    if (empty) {
      renderWelcome();
    } else {
      addBotMsg(cfg.greeting, true, 'carolina');
      conv.messages.forEach(function (m) {
        if (m.role === 'system' && m.kind === 'join') { addJoinSeparator(m.agent, true); lastMsgKey = null; }
        else addMsg(m.role, m.content, true, m.agent, m.cards, m.att, m.sources);
      });
    }
    setTimeout(function () { els.in.focus(); scrollChat(); }, 220);
  }

  function transcriptPayload() {
    var conv = activeConv(); if (!conv) return [];
    return conv.messages.filter(function (m) { return m.role === 'user' || m.role === 'assistant'; })
      .map(function (m) { return { role: m.role, content: m.content }; });
  }
  function sendTranscript(email, cb) {
    var msgs = transcriptPayload();
    if (!msgs.length) { toast('Start a conversation first'); if (cb) cb(false); return; }
    fetch('/api/carolina/transcript', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, name: leadName, messages: msgs }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) { if (d.ok) { setLead('', email); toast('Sent — check your inbox 📬'); if (cb) cb(true); } else { toast(d.error || 'Could not send that'); if (cb) cb(false); } })
      .catch(function () { toast('Network error — try again'); if (cb) cb(false); });
  }
  function appendEmailCapture() {
    if (mode !== 'chat' || !els.msgs) return;
    var wrap = makeMsgWrap('assistant', 'carolina');
    var col = wrap.querySelector('.cw-mcol');
    var card = document.createElement('div'); card.className = 'cw-book';
    card.innerHTML = '<div class="cw-book-h">' + ICON.mail + ' Email me this conversation</div>'
      + '<div class="cw-book-body"><div class="cw-book-form"><input id="cw-em-in" type="email" placeholder="you@email.com" value="' + esc(leadEmail || '') + '"><button class="cw-btn cw-btn-primary" id="cw-em-send">Send transcript</button></div></div>';
    col.appendChild(card); els.msgs.appendChild(wrap); maybeScroll(true);
    var inp = card.querySelector('#cw-em-in'), btn = card.querySelector('#cw-em-send');
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
    function go() {
      var v = (inp.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { toast('Enter a valid email'); shake(card); return; }
      btn.disabled = true; btn.textContent = 'Sending…';
      sendTranscript(v, function (ok) {
        if (ok) card.innerHTML = '<div class="cw-book-done"><svg class="cw-check" viewBox="0 0 52 52"><circle class="cw-check-c" cx="26" cy="26" r="23"/><path class="cw-check-p" d="M15 27l7.5 7.5L37 19"/></svg><div><b>Sent!</b><span>Your conversation is on its way to ' + esc(v) + '</span></div></div>';
        else { btn.disabled = false; btn.textContent = 'Send transcript'; }
      });
    }
    btn.addEventListener('click', go);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  }
  function emailTranscript() {
    var conv = activeConv();
    if (!conv || conv.messages.filter(function (m) { return m.role !== 'system'; }).length === 0) { toast('Start a conversation first'); return; }
    if (leadEmail && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(leadEmail)) sendTranscript(leadEmail);
    else appendEmailCapture();
  }

  function chatMenu(action) {
    var conv = activeConv(); if (!conv) return;
    if (action === 'emailme') { emailTranscript(); return; }
    if (action === 'clear') { conv.messages = []; saveStore(); renderChat(); }
    else if (action === 'delete') {
      store.conversations = store.conversations.filter(function (c) { return c.id !== conv.id; });
      store.activeId = null; saveStore(); tab = 'chat'; renderPanels();
    } else if (action === 'export') {
      var lines = conv.messages.filter(function (m) { return m.role !== 'system'; })
        .map(function (m) { return (m.role === 'user' ? 'You' : agentInfo(m.agent).name) + ': ' + m.content; });
      var blob = new Blob(['The5th AI conversation\n\n' + lines.join('\n\n')], { type: 'text/plain' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'the5th-conversation.txt'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    }
  }

  function updateChatHeader(agentKey) {
    var a = agentInfo(agentKey);
    var ava = els.win.querySelector('#cw-chead-ava'); if (ava) ava.innerHTML = agentAva(a.key);
    var nm = els.win.querySelector('#cw-chead-name'); if (nm) nm.textContent = a.name;
    var role = els.win.querySelector('#cw-chead-role'); if (role) role.textContent = a.role;
  }

  function clearPh() { if (phTimer) { clearInterval(phTimer); phTimer = null; } }
  function promptHistory() { var c = activeConv(); if (!c) return []; return c.messages.filter(function (m) { return m.role === 'user'; }).map(function (m) { return m.content; }).reverse(); }

  // ── attachments ──
  function updateSendState() { if (els.send && els.in) els.send.disabled = !(els.in.value.trim() || attachments.length); }
  function renderAttChips() {
    var box = els.win && els.win.querySelector('#cw-atts'); if (!box) return;
    box.innerHTML = '';
    attachments.forEach(function (a) {
      var chip = document.createElement('div'); chip.className = 'cw-att';
      var thumb = (a.kind === 'image' && a.url) ? '<span class="cw-att-th" style="background-image:url(' + a.url + ')"></span>' : '<span class="cw-att-ic">' + ICON.doc + '</span>';
      chip.innerHTML = thumb + '<span class="cw-att-tx"><b>' + esc(a.name) + '</b><i>' + fmtSize(a.size) + '</i></span><button class="cw-att-x" aria-label="Remove">&times;</button>';
      chip.querySelector('.cw-att-x').addEventListener('click', function () { removeAttachment(a.id); });
      box.appendChild(chip);
    });
    box.style.display = attachments.length ? 'flex' : 'none';
  }
  function removeAttachment(id) { attachments = attachments.filter(function (a) { return a.id !== id; }); renderAttChips(); updateSendState(); }
  function addFiles(files) {
    if (cfg.features && cfg.features.attachments === false) return;
    Array.prototype.slice.call(files || []).forEach(function (f) {
      if (attachments.length >= 5) { toast('You can attach up to 5 files'); return; }
      var isImg = IMG_TYPES.indexOf(f.type) !== -1, isPdf = f.type === 'application/pdf';
      if (!isImg && !isPdf) { toast('Only images and PDFs are supported'); return; }
      if (f.size > MAX_FILE) { toast(f.name + ' is too large (max 7MB)'); return; }
      var reader = new FileReader();
      reader.onload = function () {
        var res = String(reader.result || ''); var data = res.split(',')[1] || '';
        attachments.push({ id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: f.name, size: f.size, kind: isImg ? 'image' : 'pdf', media_type: f.type, data: data, url: isImg ? res : null });
        renderAttChips(); updateSendState();
      };
      reader.readAsDataURL(f);
    });
  }

  // The composer: auto-grow, rotating placeholder, send state, prompt history,
  // and a slash-command menu (the "command center").
  function wireComposer() {
    var ta = els.in, send = els.send, slash = els.win.querySelector('#cw-slash');
    function autoGrow() { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 300) + 'px'; }
    var updateSend = updateSendState;

    // attachments: button, file input, drag & drop, paste
    var fileInput = els.win.querySelector('#cw-file');
    var attachBtn = els.win.querySelector('#cw-attach');
    var row = els.win.querySelector('#cw-comprow');
    if (attachBtn) attachBtn.addEventListener('click', function () { fileInput.click(); });
    if (fileInput) fileInput.addEventListener('change', function () { addFiles(fileInput.files); fileInput.value = ''; });
    if (row) {
      var dz = 0;
      ['dragenter', 'dragover'].forEach(function (ev) { row.addEventListener(ev, function (e) { e.preventDefault(); row.classList.add('cw-dragging'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { row.addEventListener(ev, function (e) { e.preventDefault(); if (ev === 'drop' && e.dataTransfer) addFiles(e.dataTransfer.files); row.classList.remove('cw-dragging'); }); });
    }
    ta.addEventListener('paste', function (e) {
      var items = e.clipboardData && e.clipboardData.items; if (!items) return;
      var files = []; for (var k = 0; k < items.length; k++) { if (items[k].kind === 'file') { var f = items[k].getAsFile(); if (f) files.push(f); } }
      if (files.length) { e.preventDefault(); addFiles(files); }
    });
    renderAttChips();
    function startPh() {
      clearPh(); if (REDUCE || lang !== 'en') return; var i = 0;
      phTimer = setInterval(function () {
        if (document.activeElement === ta || ta.value) return;
        i = (i + 1) % PLACEHOLDERS.length; ta.classList.add('cw-ph-fade');
        setTimeout(function () { ta.setAttribute('placeholder', PLACEHOLDERS[i]); ta.classList.remove('cw-ph-fade'); }, 200);
      }, 3400);
    }
    function slashItems(q) { q = q.toLowerCase(); return SLASH.filter(function (s) { return s.cmd.indexOf(q) === 0; }); }
    function openSlash(items) {
      slashIndex = 0;
      slash.innerHTML = items.map(function (s, i) { return '<button class="cw-slash-i' + (i === 0 ? ' on' : '') + '" data-cmd="' + s.cmd + '"><b>' + s.cmd + '</b><span>' + esc(s.desc) + '</span></button>'; }).join('');
      slash.hidden = false;
      slash.querySelectorAll('.cw-slash-i').forEach(function (b) { b.addEventListener('mousedown', function (e) { e.preventDefault(); pickSlash(b.getAttribute('data-cmd')); }); });
    }
    function closeSlash() { slash.hidden = true; slash.innerHTML = ''; }
    function pickSlash(cmd) { var s = null; SLASH.forEach(function (x) { if (x.cmd === cmd) s = x; }); ta.value = ''; autoGrow(); updateSend(); closeSlash(); if (s) s.run(); }
    function highlight() { var items = slash.querySelectorAll('.cw-slash-i'); items.forEach(function (b, i) { b.classList.toggle('on', i === slashIndex); if (i === slashIndex && b.scrollIntoView) b.scrollIntoView({ block: 'nearest' }); }); }

    ta.addEventListener('input', function () {
      autoGrow(); updateSend(); histIndex = -1;
      var v = ta.value;
      if (v.charAt(0) === '/' && v.indexOf(' ') === -1) { var items = slashItems(v); if (items.length) openSlash(items); else closeSlash(); }
      else closeSlash();
    });
    ta.addEventListener('focus', updateSend);
    ta.addEventListener('keydown', function (e) {
      if (!slash.hidden) {
        var items = slash.querySelectorAll('.cw-slash-i');
        if (e.key === 'ArrowDown') { e.preventDefault(); slashIndex = (slashIndex + 1) % items.length; highlight(); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); slashIndex = (slashIndex - 1 + items.length) % items.length; highlight(); return; }
        if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); var b = items[slashIndex]; if (b) pickSlash(b.getAttribute('data-cmd')); return; }
        if (e.key === 'Escape') { e.preventDefault(); closeSlash(); return; }
      }
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(ta.value); return; }
      if (e.key === 'Escape') { ta.value = ''; ta.style.height = 'auto'; updateSend(); return; }
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && ta.selectionStart === 0 && ta.selectionEnd === 0) {
        var hist = promptHistory(); if (!hist.length) return;
        e.preventDefault();
        if (e.key === 'ArrowUp') histIndex = Math.min(histIndex + 1, hist.length - 1);
        else histIndex = Math.max(histIndex - 1, -1);
        ta.value = histIndex === -1 ? '' : hist[histIndex];
        autoGrow(); updateSend();
      }
    });
    updateSend(); startPh();
  }

  // ── scroll helpers ──
  function chatScrollEl() { return els.win.querySelector('#cw-cscroll'); }
  function scrollChat() { var s = chatScrollEl(); if (s) s.scrollTop = s.scrollHeight; }
  function nearBottom() { var s = chatScrollEl(); if (!s) return true; return s.scrollHeight - s.scrollTop - s.clientHeight < 100; }
  function maybeScroll(force) { if (force || nearBottom()) scrollChat(); else showNewPill(); }
  function showNewPill() { var p = els.win.querySelector('#cw-newpill'); if (p) p.hidden = false; }
  function hideNewPill() { var p = els.win.querySelector('#cw-newpill'); if (p) p.hidden = true; }

  // ── message rendering (grouping + inline actions + inline cards) ──
  function msgKey(role, agentKey) { return role === 'user' ? 'user' : 'bot:' + (agentKey || 'carolina'); }
  function makeMsgWrap(role, agentKey) {
    var key = msgKey(role, agentKey);
    var grouped = key === lastMsgKey;
    lastMsgKey = key;
    var wrap = document.createElement('div');
    wrap.className = 'cw-m ' + (role === 'user' ? 'user' : 'bot') + (grouped ? ' cw-grouped' : '');
    if (role !== 'user') { var av = document.createElement('div'); av.className = 'cw-m-ava'; av.innerHTML = agentAva(agentKey || 'carolina'); wrap.appendChild(av); }
    var col = document.createElement('div'); col.className = 'cw-mcol'; wrap.appendChild(col);
    return wrap;
  }
  function botActions(col, text) {
    var bar = document.createElement('div'); bar.className = 'cw-mact';
    bar.innerHTML = '<button title="Copy" data-a="copy">' + ICON.copy + '</button>'
      + '<button title="Regenerate" data-a="regen">' + ICON.refresh + '</button>'
      + '<button title="Helpful" data-a="up">' + ICON.up + '</button>'
      + '<button title="Not helpful" data-a="down">' + ICON.down + '</button>';
    bar.querySelector('[data-a="copy"]').addEventListener('click', function () { try { navigator.clipboard.writeText(text); } catch (e) {} flashAct(bar, 'copy'); toast('Copied to clipboard'); });
    bar.querySelector('[data-a="regen"]').addEventListener('click', function () { regenerate(); });
    bar.querySelector('[data-a="up"]').addEventListener('click', function (e) { e.currentTarget.classList.toggle('on'); });
    bar.querySelector('[data-a="down"]').addEventListener('click', function (e) { e.currentTarget.classList.toggle('on'); });
    col.appendChild(bar);
  }
  function flashAct(bar, a) { var b = bar.querySelector('[data-a="' + a + '"]'); if (b) { b.classList.add('on'); setTimeout(function () { b.classList.remove('on'); }, 900); } }

  function attChipsHtml(att) {
    if (!att || !att.length) return '';
    return '<div class="cw-msgatts">' + att.map(function (a) {
      return (a.kind === 'image' && a.url)
        ? '<span class="cw-msgatt img" style="background-image:url(' + a.url + ')"></span>'
        : '<span class="cw-msgatt">' + ICON.doc + '<span>' + esc(a.name) + '</span></span>';
    }).join('') + '</div>';
  }
  function addBotMsg(text, noScroll, agentKey) { addMsg('assistant', text, noScroll, agentKey); }
  // Source-attribution chips (grounded content) under an AI answer.
  function renderSources(col, sources) {
    if (!sources || !sources.length) return;
    var row = document.createElement('div'); row.className = 'cw-sources';
    row.innerHTML = '<span class="cw-sources-lbl">Sources</span>' + sources.slice(0, 4).map(function (s) {
      return '<button class="cw-src" data-slug="' + esc(s.slug) + '" data-title="' + esc(s.title) + '">' + ICON.doc + '<span>' + esc(s.title) + '</span></button>';
    }).join('');
    row.querySelectorAll('.cw-src').forEach(function (b) {
      b.addEventListener('click', function () { openContent(b.getAttribute('data-slug')); });
    });
    col.appendChild(row);
  }
  function addMsg(role, text, noScroll, agentKey, cards, att, sources) {
    var wrap = makeMsgWrap(role, agentKey);
    var col = wrap.querySelector('.cw-mcol');
    if (role === 'user' && att && att.length) { var ac = document.createElement('div'); ac.innerHTML = attChipsHtml(att); col.appendChild(ac.firstChild); }
    if (text) { var bub = document.createElement('div'); bub.className = 'cw-bub'; bub.innerHTML = renderMd(text); col.appendChild(bub); }
    if (role !== 'user') { botActions(col, text); renderSources(col, sources); }
    els.msgs.appendChild(wrap);
    if (cards && cards.length) renderInlineCards(cards);
    if (!noScroll) maybeScroll(role === 'user');
  }

  // Progressive streaming reveal (grows smoothly, blinking cursor, then settles).
  function streamBotMsg(text, agentKey, cards, sources) {
    return new Promise(function (resolve) {
      var wrap = makeMsgWrap('assistant', agentKey);
      var col = wrap.querySelector('.cw-mcol');
      var bub = document.createElement('div'); bub.className = 'cw-bub'; col.appendChild(bub);
      els.msgs.appendChild(wrap); maybeScroll(false);
      function finish() {
        bub.classList.remove('cw-streaming'); bub.innerHTML = renderMd(text);
        botActions(col, text);
        if (cards && cards.length) renderInlineCards(cards);
        renderSources(col, sources);
        maybeScroll(false); resolve();
      }
      if (REDUCE || text.length < 3) { bub.innerHTML = renderMd(text); return finish(); }
      bub.classList.add('cw-streaming');
      var tokens = text.split(/(\s+)/); var i = 0, acc = '';
      (function step() {
        if (i >= tokens.length) return finish();
        acc += tokens[i++];
        // stream as plain escaped text; full markdown is rendered at finish()
        bub.innerHTML = esc(acc).replace(/\n/g, '<br>') + '<span class="cw-cursor"></span>';
        maybeScroll(false);
        setTimeout(step, 16 + Math.random() * 34);
      })();
    });
  }

  // Inline rich cards returned by the AI (show_card tool).
  function renderInlineCards(cards) {
    cards.forEach(function (c) {
      var block = document.createElement('div'); block.className = 'cw-incard-wrap';
      if (c.type === 'program' && getProgram(c.program)) {
        var p = getProgram(c.program);
        block.innerHTML = '<div class="cw-incard" data-ak="article" data-av="' + esc(c.program) + '" role="button" tabindex="0">'
          + '<div class="cw-incard-cover" style="background:' + p.cover + '"><span>' + p.emoji + '</span></div>'
          + '<div class="cw-incard-b"><h5>' + esc(p.title) + '</h5><p>' + esc(p.sub) + '</p>'
          + '<div class="cw-incard-btns"><button class="cw-btn cw-btn-primary" data-ak="article" data-av="' + esc(c.program) + '">Learn More</button>'
          + '<button class="cw-btn cw-btn-ghost" data-ak="seed" data-av="I\'d like to book a call about ' + esc(p.title) + '.">Book a call</button></div></div></div>';
      } else if (c.type === 'booking') {
        block.innerHTML = '<div class="cw-incard cw-incard-book"><div class="cw-incard-b"><h5>' + ICON.phone + ' Free strategy call</h5>'
          + '<p>A no-pressure 1:1 to map your next step.</p>'
          + '<div class="cw-incard-btns"><button class="cw-btn cw-btn-primary" data-ak="book" data-av="1">Find a time</button></div></div></div>';
      }
      if (block.firstChild) { els.msgs.appendChild(block); wireActions(block); }
    });
  }

  function regenerate() {
    var conv = activeConv(); if (!conv || sending) return;
    // drop trailing assistant messages, then re-send the last user turn.
    while (conv.messages.length && conv.messages[conv.messages.length - 1].role !== 'user') conv.messages.pop();
    var lastUser = conv.messages.length ? conv.messages[conv.messages.length - 1] : null;
    if (!lastUser) return;
    conv.messages.pop(); saveStore();
    renderChat();
    sendMessage(lastUser.content);
  }

  // "Benjamin joined the chat" system separator.
  function addJoinSeparator(agentKey, noScroll) {
    var a = agentInfo(agentKey);
    var row = document.createElement('div'); row.className = 'cw-join';
    row.innerHTML = '<span class="cw-join-ava">' + agentAva(agentKey) + '</span><span class="cw-join-tx"><b>' + esc(a.name) + '</b> joined the chat</span>';
    els.msgs.appendChild(row); lastMsgKey = null;
    if (!noScroll) maybeScroll(false);
  }
  function addSuccessCheck() {
    var row = document.createElement('div'); row.className = 'cw-success';
    row.innerHTML = '<svg class="cw-check" viewBox="0 0 52 52"><circle class="cw-check-c" cx="26" cy="26" r="23"/><path class="cw-check-p" d="M15 27l7.5 7.5L37 19"/></svg><span>Booked &amp; confirmed</span>';
    els.msgs.appendChild(row); maybeScroll(false);
  }

  // ── In-chat visual booking calendar (Part 3E) — never leaves the chat ──
  function openBooking() {
    if (cfg.features && cfg.features.booking === false) { window.open('https://cal.com/indrodip-ghosh-ut1vxh/60min', '_blank'); return; }
    if (mode !== 'chat' || !els.msgs) startNewChat();
    appendBookingCard();
  }
  function appendBookingCard() {
    clearChips();
    var wrap = makeMsgWrap('assistant', 'carolina');
    var col = wrap.querySelector('.cw-mcol');
    var card = document.createElement('div'); card.className = 'cw-book';
    card.innerHTML = '<div class="cw-book-h">' + ICON.cal + ' Book a free strategy call</div><div class="cw-book-body">Loading available times…</div>';
    col.appendChild(card); els.msgs.appendChild(wrap); maybeScroll(true);
    fetch('/api/carolina/availability?tz=' + encodeURIComponent(TZ)).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.days || !d.days.length) {
        var link = (d && d.fallback_link) || 'https://cal.com/indrodip-ghosh-ut1vxh/60min';
        card.querySelector('.cw-book-body').innerHTML = 'No open times right now. <a href="' + esc(link) + '" target="_blank" rel="noopener">Use the scheduling link →</a>';
        return;
      }
      renderBookingUI(card, d);
    }).catch(function () { card.querySelector('.cw-book-body').textContent = 'Could not load times — please try again.'; });
  }
  function renderBookingUI(card, d) {
    var state = { dayIdx: 0, start: null, name: leadName || '', email: '' };
    function draw() {
      var day = d.days[state.dayIdx];
      var tabs = d.days.map(function (dd, i) { return '<button class="cw-book-day' + (i === state.dayIdx ? ' on' : '') + '" data-day="' + i + '">' + esc(dd.label) + '</button>'; }).join('');
      var times = day.slots.map(function (s) { return '<button class="cw-book-time' + (state.start === s.start ? ' on' : '') + '" data-start="' + esc(s.start) + '">' + esc(s.label) + '</button>'; }).join('');
      var form = state.start ? '<div class="cw-book-form"><input id="cw-bk-name" placeholder="Your name" value="' + esc(state.name || '') + '"><input id="cw-bk-email" type="email" placeholder="you@email.com" value="' + esc(state.email || '') + '"><button class="cw-btn cw-btn-primary" id="cw-bk-confirm">Confirm booking</button></div>' : '';
      card.querySelector('.cw-book-body').innerHTML = '<div class="cw-book-days">' + tabs + '</div><div class="cw-book-times">' + times + '</div>' + form;
      card.querySelectorAll('[data-day]').forEach(function (b) { b.addEventListener('click', function () { state.dayIdx = +b.getAttribute('data-day'); state.start = null; draw(); }); });
      card.querySelectorAll('[data-start]').forEach(function (b) { b.addEventListener('click', function () { state.start = b.getAttribute('data-start'); draw(); maybeScroll(false); }); });
      var cf = card.querySelector('#cw-bk-confirm');
      if (cf) {
        var ni = card.querySelector('#cw-bk-name'), ei = card.querySelector('#cw-bk-email');
        ni.addEventListener('input', function () { state.name = ni.value; });
        ei.addEventListener('input', function () { state.email = ei.value; });
        cf.addEventListener('click', function () { confirmBooking(card, state); });
      }
    }
    draw();
  }
  function confirmBooking(card, state) {
    if (!state.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((state.email || '').trim())) { toast('Add your name and a valid email'); shake(card); return; }
    var btn = card.querySelector('#cw-bk-confirm'); if (btn) { btn.disabled = true; btn.textContent = 'Booking…'; }
    fetch('/api/carolina/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: state.name.trim(), email: state.email.trim(), start: state.start, timeZone: TZ, visitor_id: vid() }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (res) {
        if (res.ok) {
          var lbl = ''; try { lbl = new Date(res.start).toLocaleString([], { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { lbl = res.start; }
          card.innerHTML = '<div class="cw-book-done"><svg class="cw-check" viewBox="0 0 52 52"><circle class="cw-check-c" cx="26" cy="26" r="23"/><path class="cw-check-p" d="M15 27l7.5 7.5L37 19"/></svg><div><b>You\'re booked!</b><span>' + esc(lbl) + ' — confirmation on its way to ' + esc(state.email.trim()) + '</span></div></div>';
          setLead(state.name.trim(), state.email.trim()); maybeScroll(false);
          try { localStorage.setItem('cw_booked', '1'); } catch (e) {}
        } else { toast(res.error || 'Could not book that time'); if (btn) { btn.disabled = false; btn.textContent = 'Confirm booking'; } }
      })
      .catch(function () { toast('Network error — try again'); if (btn) { btn.disabled = false; btn.textContent = 'Confirm booking'; } });
  }
  // Premium first-open welcome: avatar, headline, description + big cards.
  function renderWelcome() {
    var head = document.createElement('div'); head.className = 'cw-welcome';
    head.innerHTML = '<div class="cw-wava">' + agentAva('carolina') + '</div>'
      + '<h3>' + esc(T('welcome')) + '</h3>'
      + '<p>I\'m your business advisor. I can answer questions, recommend the right program, explain what\'s included, point you to resources, and book you a strategy call — all right here. What would you like to work on?</p>';
    els.msgs.appendChild(head);
    var grid = document.createElement('div'); grid.className = 'cw-wgrid';
    WELCOME_CARDS.forEach(function (c) {
      var b = document.createElement('button'); b.className = 'cw-wcard';
      b.innerHTML = '<span class="cw-wcard-ic">' + (ICON[c.ic] || ICON.spark) + '</span><span class="cw-wcard-t">' + esc(c.title) + '</span>';
      b.addEventListener('click', function () { sendMessage(c.seed); });
      grid.appendChild(b);
    });
    els.msgs.appendChild(grid); maybeScroll(false);
  }
  function clearThink() { if (thinkTimer) { clearInterval(thinkTimer); thinkTimer = null; } }
  var THINK_MSGS = ['Searching knowledge…', 'Reviewing your business…', 'Finding the best resources…', 'Preparing recommendations…', 'Building your strategy…'];
  function showTyping(agentKey) {
    hideTyping();
    var t = document.createElement('div'); t.className = 'cw-m bot'; t.id = 'cw-typing';
    t.innerHTML = '<div class="cw-m-ava">' + agentAva(agentKey || 'carolina') + '</div>'
      + '<div class="cw-typing"><span></span><span></span><span></span></div><span class="cw-think"></span>';
    els.msgs.appendChild(t); maybeScroll(false);
    var cap = t.querySelector('.cw-think'); var i = 0; cap.textContent = THINK_MSGS[0];
    clearThink(); thinkTimer = setInterval(function () { i = (i + 1) % THINK_MSGS.length; cap.textContent = THINK_MSGS[i]; }, 1500);
  }
  function hideTyping() { clearThink(); var t = els.win.querySelector('#cw-typing'); if (t) t.remove(); }

  // ── Conversation flow ──
  function ensureActiveConv() {
    var c = activeConv();
    if (!c) { c = mkConv([]); store.conversations.push(c); store.activeId = c.id; saveStore(); }
    return c;
  }
  function captureHomeScroll() {
    var sc = els.win && els.win.querySelector('#cw-scroll');
    if (sc && mode === 'panels' && tab === 'home') homeScroll = sc.scrollTop;
  }
  function startNewChat(seed, ctx) {
    captureHomeScroll();
    viewContext = ctx || '';   // AI context awareness (e.g. which page they came from)
    var c = mkConv([]); store.conversations.push(c); store.activeId = c.id; saveStore();
    renderChat();
    if (seed) sendMessage(seed);
  }
  function openConv(id) { captureHomeScroll(); viewContext = ''; store.activeId = id; saveStore(); renderChat(); }

  // Post the conversation to the API (stripping local-only fields).
  async function callApi(conv, handoff, atts) {
    try {
      var payload = conv.messages
        .filter(function (m) { return m.role === 'user' || m.role === 'assistant'; })
        .map(function (m) { return { role: m.role, content: m.content }; });
      var body = { messages: payload, timeZone: TZ, agent: conv.agent || 'carolina', handoff: !!handoff, conversationId: conv.id, visitor_id: vid() };
      if (viewContext) body.context = viewContext;
      if (lang && lang !== 'en') body.lang = lang;
      // Attachments apply to the current turn only (never on the handoff request).
      if (!handoff && atts && atts.length) body.attachments = atts.map(function (a) { return { kind: a.kind, media_type: a.media_type, data: a.data }; });
      var r = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok || d.error) return { error: d.error || 'Sorry, I had trouble there. Could you try again?' };
      return d;
    } catch (e) { return null; }
  }

  function joinGreeting(agentKey, name) {
    var n = name ? name : 'there';
    if (agentKey === 'benjamin') return 'Hey ' + n + ' 👋 Give me a few seconds to read through your chat so I can help you properly…';
    if (agentKey === 'natasha') return 'Hi ' + n + ' 👋 Carolina filled me in — let me take it from here.';
    return 'Hi ' + n + ' 👋 Happy to help — one sec while I catch up on your chat.';
  }

  // Play a human-feeling handoff: colleague joins, greets, pauses, then answers.
  async function doTransfer(conv, transfer) {
    var to = transfer.to;
    if (transfer.user_name) leadName = transfer.user_name;
    await wait(700);
    conv.agent = to; conv.updatedAt = Date.now();
    conv.messages.push({ role: 'system', kind: 'join', agent: to }); saveStore();
    updateChatHeader(to);
    addJoinSeparator(to);
    await wait(500); showTyping(to); await wait(1500); hideTyping();
    var greet = joinGreeting(to, leadName);
    await streamBotMsg(greet, to); conv.messages.push({ role: 'assistant', content: greet, agent: to }); saveStore();
    // Pause as if reading, then fetch the real answer from the new agent.
    await wait(700); showTyping(to); await wait(2200);
    var res = await callApi(conv, true);
    hideTyping();
    if (!res || res.error) { addBotMsg((res && res.error) || "Sorry, I hit a snag — could you say that again?", false, to); return; }
    var reply = res.reply || 'How can I help?';
    await streamBotMsg(reply, to, res.cards, res.sources); conv.messages.push({ role: 'assistant', content: reply, agent: to, cards: res.cards && res.cards.length ? res.cards : undefined, sources: res.sources && res.sources.length ? res.sources : undefined }); conv.updatedAt = Date.now(); saveStore();
    if (res.booked) addSuccessCheck();
    handleActions(res.actions);
  }

  function clearChips() {
    var c = els.win.querySelector('#cw-chips'); if (c) c.remove();
    var s = els.win.querySelector('#cw-suggest'); if (s) s.remove();
  }
  async function sendMessage(text) {
    text = (text || '').trim();
    var atts = attachments.slice();
    if ((!text && !atts.length) || sending) return;
    clearChips();
    var conv = ensureActiveConv();
    var displayAtt = atts.map(function (a) { return { name: a.name, kind: a.kind, url: a.url }; });
    var storeAtt = atts.length ? atts.map(function (a) { return { name: a.name, kind: a.kind }; }) : undefined;
    var storeText = text || ('[Attached: ' + atts.map(function (a) { return a.name; }).join(', ') + ']');
    addMsg('user', text, false, null, null, displayAtt);
    conv.messages.push({ role: 'user', content: storeText, att: storeAtt }); conv.updatedAt = Date.now(); saveStore();
    attachments = []; renderAttChips();
    if (els.in) { els.in.value = ''; els.in.style.height = 'auto'; }
    updateSendState();
    await respond(conv, atts);
  }
  // Fetch + render one assistant turn for the given conversation (retryable).
  async function respond(conv, atts) {
    if (sending) return;
    sending = true; if (els.send) els.send.disabled = true;
    clearChips();
    showTyping(conv.agent);
    var res = await callApi(conv, false, atts);
    hideTyping();
    if (!res || res.error) {
      addErrorCard(function () { respond(conv, atts); });
      shake(els.win.querySelector('.cw-comp-row'));
    } else if (res.transfer && res.transfer.to) {
      var line = res.reply || ('Let me bring in a colleague who can help with this.');
      await streamBotMsg(line, conv.agent); conv.messages.push({ role: 'assistant', content: line, agent: conv.agent }); saveStore();
      await doTransfer(conv, res.transfer);
      renderSuggestions('');
    } else {
      var reply = res.reply || "I'm here — how can I help?";
      await streamBotMsg(reply, conv.agent, res.cards, res.sources); conv.messages.push({ role: 'assistant', content: reply, agent: conv.agent, cards: res.cards && res.cards.length ? res.cards : undefined, sources: res.sources && res.sources.length ? res.sources : undefined }); conv.updatedAt = Date.now(); saveStore();
      if (res.booked) addSuccessCheck();
      handleActions(res.actions);
      renderSuggestions(reply);
    }
    sending = false; updateSendState(); if (els.in) els.in.focus();
  }
  // Contextual follow-up chips — change based on what the AI just said.
  function suggestFor(reply) {
    var t = (reply || '').toLowerCase();
    if (/price|pricing|cost|invest|\$/.test(t)) return ['Compare programs', 'Is there a guarantee?', 'Book a call', 'Payment options'];
    if (/fast\s?forward/.test(t)) return ["What's included?", 'Money-back guarantee', 'Compare with The5th AI', 'Book a call'];
    if (/the5th ai|\bai\b|funnel|landing page|email|content/.test(t)) return ['Try The5th AI', 'Compare programs', 'See pricing on a call', 'Book a call'];
    if (/collective|community/.test(t)) return ['Who is it for?', 'Compare programs', 'Book a call'];
    if (/quiz|assessment|score/.test(t)) return ['Take the assessment', 'What will I get?', 'Book a call'];
    if (/book|call|consult|schedule|time/.test(t)) return ['Find a time', 'What happens on the call?', 'Talk to support'];
    return ['Tell me more', 'Which program fits me?', 'See pricing', 'Book a call'];
  }
  function renderSuggestions(reply) {
    var old = els.win.querySelector('#cw-suggest'); if (old) old.remove();
    var row = document.createElement('div'); row.className = 'cw-chips cw-suggest'; row.id = 'cw-suggest';
    suggestFor(reply).forEach(function (l) {
      var b = document.createElement('button'); b.className = 'cw-chip'; b.textContent = l; b.addEventListener('click', function () { sendMessage(l); }); row.appendChild(b);
    });
    els.msgs.appendChild(row); maybeScroll(false);
  }
  // Elegant error card with retry (never exposes technical errors).
  function addErrorCard(retryFn) {
    var wrap = document.createElement('div'); wrap.className = 'cw-m bot';
    wrap.innerHTML = '<div class="cw-m-ava">' + agentAva('carolina') + '</div><div class="cw-mcol"><div class="cw-errcard">'
      + '<h5>Something went wrong</h5><p>Please try again in a moment.</p><button class="cw-btn cw-btn-ghost cw-retry">Retry</button></div></div>';
    wrap.querySelector('.cw-retry').addEventListener('click', function () { wrap.remove(); if (retryFn) retryFn(); });
    els.msgs.appendChild(wrap); lastMsgKey = null; maybeScroll(false);
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

  // ── Panel-body wiring (nav is wired once in wireNav) ──
  function wirePanels() {
    var ask = els.win.querySelector('#cw-ask');
    if (ask) ask.addEventListener('click', function () { startNewChat(); });
    var newc = els.win.querySelector('#cw-newconv');
    if (newc) newc.addEventListener('click', function () { startNewChat(); });
    els.win.querySelectorAll('[data-seed]').forEach(function (n) {
      n.addEventListener('click', function (e) { e.stopPropagation(); startNewChat(n.getAttribute('data-seed')); });
    });
    els.win.querySelectorAll('[data-conv]').forEach(function (n) {
      n.addEventListener('click', function () { openConv(n.getAttribute('data-conv')); });
    });
    var ks = els.win.querySelector('#cw-ksearch');
    if (ks) ks.addEventListener('keydown', function (e) { if (e.key === 'Enter' && ks.value.trim()) startNewChat(ks.value.trim()); });
    // Account: notifications toggle
    var notif = els.win.querySelector('#cw-notif-tg');
    if (notif) notif.addEventListener('click', function () {
      var on = !notif.classList.contains('on');
      notif.classList.toggle('on', on); notif.setAttribute('aria-checked', on ? 'true' : 'false');
      try { localStorage.setItem('the5th_carolina_notif', on ? '1' : '0'); } catch (e) {}
    });
    // Account: appearance (dark/light) + language
    els.win.querySelectorAll('[data-theme]').forEach(function (b) {
      b.addEventListener('click', function () { setTheme(b.getAttribute('data-theme')); showTab('account'); });
    });
    var ls = els.win.querySelector('#cw-lang');
    if (ls) ls.addEventListener('change', function () { setLang(ls.value); });
    // Account: clear conversations
    var clear = els.win.querySelector('#cw-clearconv');
    if (clear) clear.addEventListener('click', function () {
      if (!confirm('Clear all conversations? This cannot be undone.')) return;
      store = { conversations: [], activeId: null }; saveStore(); showTab('account');
    });
  }

  // ── Open/close ──
  function toggle(open) {
    isOpen = open == null ? !isOpen : open;
    els.win.classList.toggle('cw-show', isOpen);
    els.launcher.classList.toggle('cw-open', isOpen);
    if (els.mclose) els.mclose.classList.toggle('cw-mshow', isOpen);
    var badge = els.launcher.querySelector('.cw-badge'); if (isOpen && badge) badge.remove();
    if (isOpen) { dismissPromo(); if (mode === 'panels' && !els.win.innerHTML) renderPanels(); }
    else { clearHomeTimers(); clearPh(); els.win.classList.remove('cw-wide'); try { document.documentElement.style.setProperty('--cw-kb', '0px'); } catch (e) {} }
  }

  // ── Proactive engagement (context-aware, trigger-driven, once/session) ──
  var PROACTIVE_FLAG = 'the5th_carolina_proactive_shown';
  // Per-page greetings — curiosity-first, never pushy. Admin can override any of
  // these via config (cfg.proactive.pages[<ctx>] = {msgs,cta,seed,agent}).
  var GREETINGS = {
    home: { agent: 'carolina', cta: 'Show me', seed: "I'd love to know what's quietly holding my business back — can you help?",
      returning: 'Welcome back 👋 Want to pick up where you left off, or see your fastest path to the next $10K month?',
      msgs: ["Want to discover what's quietly capping your business growth?", 'Can I show you the fastest path to your next $10K month?', "Curious what your biggest growth bottleneck is?"] },
    quiz: { agent: 'carolina', cta: 'Start the quiz', seed: 'Can you guide me through the Business Growth Quiz?',
      msgs: ["You're only a couple of minutes from personalized insights — ready to begin?", "Take the Business Growth Quiz and discover what's holding your business back."] },
    quizdone: { agent: 'natasha', cta: 'Walk me through it', seed: 'I just finished the quiz — can you walk me through my results and next steps?',
      msgs: ['🎉 Nice work finishing the quiz! Want me to walk you through your results and the best next step?'] },
    blog: { agent: 'benjamin', cta: 'Ask a question', seed: 'I have a question about this article.',
      msgs: ['Have a question about this article? Ask me anything.', 'Want me to recommend the next read based on what you’re looking at?'] },
    fastforward: { agent: 'carolina', cta: 'Tell me more', seed: 'Tell me about Fast Forward — the guarantee, case studies, and how a strategy call works.',
      msgs: ['Questions about Fast Forward? I can share the guarantee, real case studies, or book you a strategy call.'] },
    ai: { agent: 'carolina', cta: 'Show me a demo', seed: 'Can you show me a live demo of The5th AI, plus pricing and how it compares?',
      msgs: ['Want a live demo of The5th AI — or a quick look at features, pricing and how it compares?'] },
    collective: { agent: 'carolina', cta: 'Explore The Collective', seed: "Tell me about The Collective — what's inside and who it's for.",
      msgs: ["Curious about The Collective? I can show you what's inside and who it's for."] },
    casestudies: { agent: 'natasha', cta: 'Show me similar wins', seed: 'Show me success stories similar to my business, and how an assessment works.',
      msgs: ['Want to see success stories similar to your business — or get a quick assessment?'] },
    booked: { agent: 'natasha', cta: 'Help me prep', seed: 'I have a call booked — can you help me prepare and make the most of it?',
      msgs: ["You're all set for your call 🎉 Anything I can help you prep in the meantime?"] }
  };

  function hasBooked() { try { return localStorage.getItem('cw_booked') === '1'; } catch (e) { return false; } }
  function pageContext() {
    var p = (location.pathname || '/').toLowerCase();
    if (hasBooked()) return 'booked';
    if (/quiz\/(results|thank)/.test(p) || /\/results/.test(p)) return 'quizdone';
    if (/quiz/.test(p)) return 'quiz';
    if (/fast-forward/.test(p)) return 'fastforward';
    if (/\/ai(\/|$)/.test(p)) return 'ai';
    if (/collective/.test(p)) return 'collective';
    if (/clients|testimonials|case|success/.test(p)) return 'casestudies';
    if (/blog|article|post|downloads/.test(p)) return 'blog';
    return 'home';
  }
  function greetingFor(ctx) {
    var over = (cfg.proactive && cfg.proactive.pages && cfg.proactive.pages[ctx]) || null;
    var G = over || GREETINGS[ctx] || GREETINGS.home;
    var msgs = G.msgs || []; if (!msgs.length && !G.returning) return null;
    var idx = 0; try { var k = 'cw_pg_' + ctx, s = sessionStorage.getItem(k); if (s != null) idx = parseInt(s, 10) || 0; else { idx = Math.floor(Math.random() * msgs.length); sessionStorage.setItem(k, String(idx)); } } catch (e) {}
    var msg = (!isFirstTime() && G.returning) ? G.returning : (msgs[idx % msgs.length] || G.returning);
    return { ctx: ctx, msg: msg, cta: G.cta || 'Show me', seed: G.seed || '', agent: G.agent || 'carolina' };
  }

  function dismissPromo(key) {
    if (els.promo) { var p = els.promo; p.classList.remove('cw-show'); setTimeout(function () { if (p && p.parentNode) p.remove(); }, 320); els.promo = null; }
    if (key) { try { localStorage.setItem(key, '1'); } catch (e) {} }
  }
  function pulseLauncher() {
    try {
      var l = els.launcher; if (!l) return;
      if (!l.querySelector('.cw-badge')) l.appendChild(el('<span class="cw-badge">1</span>'));
      if (!REDUCE) { l.classList.remove('cw-bounce'); void l.offsetWidth; l.classList.add('cw-bounce'); }
    } catch (e) {}
  }
  function showPromoBubble(g, dkey) {
    if (isOpen) return;
    try { sessionStorage.setItem(PROACTIVE_FLAG, '1'); } catch (e) {}
    var a = agentInfo(g.agent);
    var p = el('<div class="cw cw-promo cw-promo2"><button class="cw-promo-x" aria-label="Dismiss">' + ICON.close + '</button>'
      + '<div class="cw-promo-head"><span class="cw-promo-ava">' + agentAva(g.agent) + '</span>'
      + '<div class="cw-promo-who"><b>' + esc(a.name) + '</b><i>' + esc(a.role) + '</i></div><span class="cw-live"></span></div>'
      + '<div class="cw-promo-body"><div class="cw-typing cw-promo-typing"><span></span><span></span><span></span></div></div>'
      + '<div class="cw-promo-actions" style="display:none"><button class="cw-promo-cta">' + esc(g.cta) + '</button>'
      + '<button class="cw-promo-no">Not now</button></div>');
    document.body.appendChild(p); els.promo = p; applyTheme();
    requestAnimationFrame(function () { p.classList.add('cw-show'); });
    pulseLauncher();
    // brief typing beat → message (feels like a real person, not a popup ad)
    setTimeout(function () {
      if (!p.parentNode) return;
      var body = p.querySelector('.cw-promo-body'); if (body) body.innerHTML = '<div class="cw-promo-msg">' + esc(g.msg) + '</div>';
      var act = p.querySelector('.cw-promo-actions'); if (act) act.style.display = '';
    }, REDUCE ? 0 : 1100);
    p.querySelector('.cw-promo-x').addEventListener('click', function () { dismissPromo(dkey); });
    p.querySelector('.cw-promo-no').addEventListener('click', function () { dismissPromo(dkey); });
    p.querySelector('.cw-promo-cta').addEventListener('click', function () { dismissPromo(); toggle(true); startNewChat(g.seed); });
  }

  function maybeShowPromo() {
    if (promoScheduled || isOpen) return;
    if (!notifEnabled()) return;
    if (cfg.proactive && cfg.proactive.enabled === false) return;     // admin opt-out
    try { if (sessionStorage.getItem(PROACTIVE_FLAG) === '1') return; } catch (e) {}   // one per session
    if (store.conversations.some(function (c) { return c.messages.length > 0; })) return;  // never interrupt active chatters

    var g = greetingFor(pageContext()); if (!g) return;
    var dkey = 'cw_px_' + g.ctx;
    try { if (localStorage.getItem(dkey) === '1') return; } catch (e) {}    // remembered dismissal
    promoScheduled = true;

    var MIN = 6000, fired = false, startedAt = Date.now();
    var baseDelay = Math.max(MIN, Math.min(60000, ((cfg.proactive && cfg.proactive.delay) || 10) * 1000));
    function fire() { if (fired || isOpen) return; fired = true; cleanup(); showPromoBubble(g, dkey); }
    function cleanup() { clearTimeout(baseT); clearTimeout(idleT); window.removeEventListener('scroll', onScroll); document.removeEventListener('mousemove', onAct); document.removeEventListener('keydown', onAct); document.removeEventListener('touchstart', onAct); }
    var baseT = setTimeout(fire, baseDelay);   // Smart trigger 1: base dwell delay
    var idleT;                                  // Smart trigger 2: 30s idle
    function armIdle() { clearTimeout(idleT); idleT = setTimeout(function () { if (Date.now() - startedAt >= MIN) fire(); }, 30000); }
    function onAct() { armIdle(); }
    armIdle();
    document.addEventListener('mousemove', onAct, { passive: true }); document.addEventListener('keydown', onAct); document.addEventListener('touchstart', onAct, { passive: true });
    function onScroll() {   // Smart trigger 3: scrolled 70% of the page
      var h = document.documentElement, d = h.scrollHeight - h.clientHeight;
      if (d > 200 && ((h.scrollTop || document.body.scrollTop) / d) >= 0.7 && Date.now() - startedAt >= MIN) fire();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── Build shell ──
  function build() {
    injectStyles(); suppressIntercom();
    var launcher = el('<button class="cw cw-launcher" aria-label="Chat with The5th AI">'
      + '<span class="l-chat"><img class="l-icon" src="' + LAUNCHER_ICON + '" alt="" '
      + 'onerror="this.style.display=\'none\';var f=this.parentNode.querySelector(\'.l-fb\');if(f)f.style.display=\'flex\'" />'
      + '<span class="l-fb">' + ICON.msg + '</span></span>'
      + '<span class="l-close">' + ICON.close + '</span>'
      + '<span class="cw-badge">1</span></button>');
    var win = el('<div class="cw cw-win" role="dialog" aria-label="The5th assistant"></div>');
    // Always-reachable close (mobile can hide the launcher behind a full-screen
    // window). Large touch target, respects safe areas.
    var mclose = el('<button class="cw cw-mclose" aria-label="Close chat">' + ICON.close + '</button>');
    document.body.appendChild(launcher); document.body.appendChild(win); document.body.appendChild(mclose);
    els.launcher = launcher; els.win = win; els.mclose = mclose;
    applyTheme();
    launcher.addEventListener('click', function () { toggle(); });
    mclose.addEventListener('click', function () { toggle(false); });
    // ESC closes — never trap the user.
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) { e.preventDefault(); toggle(false); } });
    // Keyboard-safe composer on mobile: track the visual viewport so the window
    // shrinks to the visible area instead of hiding the input behind the keyboard.
    if (window.visualViewport) {
      var vv = window.visualViewport;
      var onVV = function () {
        if (!isOpen || window.innerWidth > 480) { document.documentElement.style.setProperty('--cw-kb', '0px'); return; }
        var kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        document.documentElement.style.setProperty('--cw-kb', kb + 'px');
        if (kb > 60) scrollChat();
      };
      vv.addEventListener('resize', onVV); vv.addEventListener('scroll', onVV);
    }
    // Cmd/Ctrl+K focuses the composer (opening the widget / a chat if needed).
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (!isOpen) toggle(true);
        if (mode !== 'chat') startNewChat();
        setTimeout(function () { if (els.in) els.in.focus(); }, 260);
      }
    });
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
    loadPrograms();   // pull programs/products from CMS, then overlay Promotions-CMS artwork
    fetch(CONFIG_API).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d) { maybeShowPromo(); return; }
      if (d.avatar_url) cfg.avatar = d.avatar_url;
      if (d.greeting) cfg.greeting = d.greeting;
      if (d.proactive) cfg.proactive = Object.assign({ enabled: true, delay: 10 }, d.proactive);
      if (Array.isArray(d.agents)) {
        d.agents.forEach(function (a) { if (a && a.key) cfg.agents[a.key] = { name: a.name, role: a.role, avatar: a.avatar_url }; });
      }
      if (d.features) cfg.features = { attachments: d.features.attachments !== false, booking: d.features.booking !== false };
      applyConfig();
      maybeShowPromo();
    }).catch(function () { maybeShowPromo(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
