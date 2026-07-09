/* ══════════════════════════════════════════════════════════════════
   Carolina — The5th Consulting concierge chat widget (Intercom-style)
   Self-contained, no dependencies. Loads site-wide via one <script>.
   Talks to /api/carolina (Claude Sonnet). Sales + booking only.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__carolinaLoaded) return;
  window.__carolinaLoaded = true;

  var LS_KEY = 'the5th_carolina_thread_v1';
  var API = '/api/carolina';
  var TZ = 'UTC';
  try { TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) {}

  var C = {
    plum: '#3D2645', plumDark: '#2E1A35', gold: '#C9A84C', goldDeep: '#B0902F',
    parchment: '#FAF6F0', ink: '#1A1A2E', line: 'rgba(0,0,0,0.08)'
  };

  var GREETING =
    "Hi, I'm Carolina 👋 I help women 40+ turn their expertise into income with The5th. " +
    "Curious about our programs, or want to book a quick call with the team?";
  var CHIPS = ['Tell me about the programs', 'Book a call', 'Take the free quiz'];

  // message history sent to the API: [{role, content}]
  var thread = [];
  var sending = false;

  // ── Persistence ──
  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) { var p = JSON.parse(raw); if (Array.isArray(p)) thread = p; }
    } catch (e) {}
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(thread.slice(-24))); } catch (e) {}
  }

  // ── Hide the legacy Intercom launcher (Carolina replaces it) ──
  function suppressIntercom() {
    var css = '#intercom-container,.intercom-lightweight-app,.intercom-launcher,'
      + '.intercom-launcher-frame,#intercom-launcher-frame,'
      + '.intercom-messenger-frame{display:none !important;visibility:hidden !important;}';
    var s = document.createElement('style');
    s.id = 'carolina-hide-intercom';
    s.textContent = css;
    document.head.appendChild(s);
    try { if (typeof window.Intercom === 'function') window.Intercom('update', { hide_default_launcher: true }); } catch (e) {}
  }

  // ── Styles ──
  function injectStyles() {
    if (document.getElementById('carolina-styles')) return;
    var css = [
      '@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@400;500;600&display=swap");',
      '.cw-launcher{position:fixed;right:22px;bottom:22px;z-index:2147482500;width:60px;height:60px;border-radius:50%;cursor:pointer;border:none;background:linear-gradient(155deg,' + C.plum + ',' + C.plumDark + ');box-shadow:0 10px 30px rgba(46,26,53,.42);display:flex;align-items:center;justify-content:center;transition:transform .22s ease,box-shadow .22s ease;}',
      '.cw-launcher:hover{transform:scale(1.06);box-shadow:0 14px 36px rgba(46,26,53,.5);}',
      '.cw-launcher svg{width:27px;height:27px;fill:#fff;transition:opacity .2s,transform .2s;}',
      '.cw-launcher .cw-ic-close{position:absolute;opacity:0;transform:rotate(-30deg);}',
      '.cw-open .cw-ic-chat{opacity:0;transform:rotate(30deg);}',
      '.cw-open .cw-ic-close{opacity:1;transform:rotate(0);}',
      '.cw-badge{position:absolute;top:-3px;right:-3px;min-width:20px;height:20px;border-radius:10px;background:' + C.gold + ';color:' + C.plumDark + ';font:700 11px/20px "DM Sans",sans-serif;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.25);padding:0 5px;}',
      '.cw-panel{position:fixed;right:22px;bottom:94px;z-index:2147482500;width:388px;max-width:calc(100vw - 32px);height:620px;max-height:calc(100vh - 120px);background:#fff;border-radius:18px;box-shadow:0 24px 68px rgba(20,12,24,.34);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(18px) scale(.98);transform-origin:bottom right;pointer-events:none;transition:opacity .26s ease,transform .26s cubic-bezier(.2,.8,.25,1);font-family:"DM Sans",system-ui,sans-serif;}',
      '.cw-panel.cw-show{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}',
      '.cw-head{background:linear-gradient(150deg,' + C.plum + ',' + C.plumDark + ');color:#fff;padding:20px 20px 22px;position:relative;}',
      '.cw-head::after{content:"";position:absolute;top:-40%;right:-10%;width:60%;height:120%;background:radial-gradient(ellipse,rgba(201,168,76,.22),transparent 70%);pointer-events:none;}',
      '.cw-head-row{display:flex;align-items:center;gap:12px;position:relative;z-index:1;}',
      '.cw-ava{width:42px;height:42px;border-radius:50%;background:linear-gradient(145deg,' + C.gold + ',' + C.goldDeep + ');color:' + C.plumDark + ';font:600 20px/42px "Cormorant Garamond",serif;text-align:center;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.25);}',
      '.cw-head h3{font:500 19px/1.1 "Cormorant Garamond",serif;margin:0;letter-spacing:.2px;}',
      '.cw-head p{margin:3px 0 0;font-size:12px;color:rgba(255,255,255,.62);display:flex;align-items:center;gap:6px;}',
      '.cw-dot{width:7px;height:7px;border-radius:50%;background:#5fd08a;box-shadow:0 0 0 3px rgba(95,208,138,.25);}',
      '.cw-x{position:absolute;top:16px;right:16px;z-index:2;background:rgba(255,255,255,.12);border:none;color:#fff;width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:16px;line-height:1;transition:background .2s;}',
      '.cw-x:hover{background:rgba(255,255,255,.24);}',
      '.cw-body{flex:1;overflow-y:auto;padding:20px 18px 8px;background:' + C.parchment + ';display:flex;flex-direction:column;gap:12px;}',
      '.cw-msg{display:flex;gap:9px;align-items:flex-end;max-width:88%;}',
      '.cw-msg.bot{align-self:flex-start;}',
      '.cw-msg.user{align-self:flex-end;flex-direction:row-reverse;}',
      '.cw-mava{width:26px;height:26px;border-radius:50%;background:linear-gradient(145deg,' + C.gold + ',' + C.goldDeep + ');color:' + C.plumDark + ';font:600 13px/26px "Cormorant Garamond",serif;text-align:center;flex-shrink:0;}',
      '.cw-bub{padding:11px 14px;border-radius:15px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;}',
      '.cw-msg.bot .cw-bub{background:#fff;color:' + C.ink + ';border:1px solid ' + C.line + ';border-bottom-left-radius:5px;box-shadow:0 1px 2px rgba(0,0,0,.03);}',
      '.cw-msg.user .cw-bub{background:linear-gradient(145deg,' + C.plum + ',' + C.plumDark + ');color:#fff;border-bottom-right-radius:5px;}',
      '.cw-bub a{color:' + C.goldDeep + ';font-weight:600;}',
      '.cw-msg.user .cw-bub a{color:#f0d98a;}',
      '.cw-chips{display:flex;flex-wrap:wrap;gap:8px;padding:2px 4px 6px 40px;}',
      '.cw-chip{background:#fff;border:1px solid rgba(201,168,76,.5);color:' + C.plum + ';font:600 12.5px/1 "DM Sans",sans-serif;padding:9px 13px;border-radius:20px;cursor:pointer;transition:all .18s;}',
      '.cw-chip:hover{background:' + C.plum + ';color:#fff;border-color:' + C.plum + ';}',
      '.cw-typing{display:flex;gap:4px;padding:13px 15px;background:#fff;border:1px solid ' + C.line + ';border-radius:15px;border-bottom-left-radius:5px;width:fit-content;}',
      '.cw-typing span{width:7px;height:7px;border-radius:50%;background:' + C.goldDeep + ';opacity:.5;animation:cwB 1s infinite;}',
      '.cw-typing span:nth-child(2){animation-delay:.16s;}.cw-typing span:nth-child(3){animation-delay:.32s;}',
      '@keyframes cwB{0%,60%,100%{transform:translateY(0);opacity:.4;}30%{transform:translateY(-4px);opacity:1;}}',
      '.cw-foot{padding:12px 14px;background:#fff;border-top:1px solid ' + C.line + ';}',
      '.cw-inrow{display:flex;align-items:flex-end;gap:8px;background:' + C.parchment + ';border:1px solid ' + C.line + ';border-radius:14px;padding:6px 6px 6px 14px;}',
      '.cw-in{flex:1;border:none;background:transparent;resize:none;outline:none;font:400 14px/1.45 "DM Sans",sans-serif;color:' + C.ink + ';max-height:96px;padding:6px 0;}',
      '.cw-send{flex-shrink:0;width:36px;height:36px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(145deg,' + C.gold + ',' + C.goldDeep + ');display:flex;align-items:center;justify-content:center;transition:opacity .2s,transform .2s;}',
      '.cw-send:hover{transform:scale(1.05);}.cw-send:disabled{opacity:.4;cursor:not-allowed;transform:none;}',
      '.cw-send svg{width:17px;height:17px;fill:' + C.plumDark + ';}',
      '.cw-cred{text-align:center;font-size:10.5px;color:#b6ada0;margin:8px 0 0;}',
      '@media(max-width:480px){.cw-panel{right:0;left:0;bottom:0;width:100%;max-width:100%;height:100%;max-height:100%;border-radius:0;}.cw-launcher{right:16px;bottom:16px;}}'
    ].join('\n');
    var st = document.createElement('style');
    st.id = 'carolina-styles';
    st.textContent = css;
    document.head.appendChild(st);
  }

  var els = {};

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Minimal, safe rendering: escape, then linkify URLs and **bold**.
  function render(text) {
    var h = esc(text);
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/(https?:\/\/[^\s<]+)/g, function (u) {
      return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>';
    });
    return h.replace(/\n/g, '<br>');
  }

  function addMsg(role, text) {
    var wrap = document.createElement('div');
    wrap.className = 'cw-msg ' + (role === 'user' ? 'user' : 'bot');
    if (role !== 'user') {
      var av = document.createElement('div');
      av.className = 'cw-mava';
      av.textContent = 'C';
      wrap.appendChild(av);
    }
    var bub = document.createElement('div');
    bub.className = 'cw-bub';
    bub.innerHTML = render(text);
    wrap.appendChild(bub);
    els.body.appendChild(wrap);
    scrollDown();
  }

  function scrollDown() { els.body.scrollTop = els.body.scrollHeight; }

  function showTyping() {
    hideTyping();
    var t = document.createElement('div');
    t.className = 'cw-msg bot';
    t.id = 'cw-typing-row';
    t.innerHTML = '<div class="cw-mava">C</div><div class="cw-typing"><span></span><span></span><span></span></div>';
    els.body.appendChild(t);
    scrollDown();
  }
  function hideTyping() {
    var t = document.getElementById('cw-typing-row');
    if (t) t.remove();
  }

  function renderChips() {
    var old = document.getElementById('cw-chips');
    if (old) old.remove();
    if (thread.length > 0) return; // only show on a fresh conversation
    var row = document.createElement('div');
    row.className = 'cw-chips';
    row.id = 'cw-chips';
    CHIPS.forEach(function (label) {
      var b = document.createElement('button');
      b.className = 'cw-chip';
      b.textContent = label;
      b.addEventListener('click', function () { sendMessage(label); });
      row.appendChild(b);
    });
    els.body.appendChild(row);
    scrollDown();
  }

  function paintHistory() {
    els.body.innerHTML = '';
    addMsg('assistant', GREETING);
    thread.forEach(function (m) { addMsg(m.role, m.content); });
    renderChips();
  }

  async function sendMessage(text) {
    text = (text || '').trim();
    if (!text || sending) return;
    var chips = document.getElementById('cw-chips');
    if (chips) chips.remove();

    sending = true;
    els.send.disabled = true;
    addMsg('user', text);
    thread.push({ role: 'user', content: text });
    save();
    els.in.value = '';
    els.in.style.height = 'auto';
    showTyping();

    try {
      var r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: thread, timeZone: TZ })
      });
      var data = await r.json().catch(function () { return {}; });
      hideTyping();
      if (!r.ok || data.error) {
        addMsg('assistant', data.error || "Sorry, I had trouble there. Could you try again?");
      } else {
        var reply = data.reply || "I'm here — how can I help?";
        addMsg('assistant', reply);
        thread.push({ role: 'assistant', content: reply });
        save();
      }
    } catch (e) {
      hideTyping();
      addMsg('assistant', "I couldn't reach the team just now — mind trying again in a moment?");
    } finally {
      sending = false;
      els.send.disabled = false;
      els.in.focus();
    }
  }

  var isOpen = false;
  function togglePanel(open) {
    isOpen = open == null ? !isOpen : open;
    els.panel.classList.toggle('cw-show', isOpen);
    els.launcher.classList.toggle('cw-open', isOpen);
    var badge = document.getElementById('cw-badge');
    if (isOpen && badge) badge.remove();
    if (isOpen) setTimeout(function () { els.in.focus(); scrollDown(); }, 260);
  }

  function build() {
    injectStyles();
    suppressIntercom();

    var launcher = document.createElement('button');
    launcher.className = 'cw-launcher';
    launcher.setAttribute('aria-label', 'Chat with Carolina');
    launcher.innerHTML =
      '<svg class="cw-ic-chat" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.4 1.05 4.58 2.77 6.2L4 22l5.1-1.6c.92.26 1.9.4 2.9.4 5.52 0 10-4.03 10-9S17.52 2 12 2z"/></svg>' +
      '<svg class="cw-ic-close" viewBox="0 0 24 24"><path d="M18.3 5.7a1 1 0 0 0-1.4-1.4L12 9.17 7.1 4.3A1 1 0 0 0 5.7 5.7L10.83 12 5.7 18.3a1 1 0 1 0 1.4 1.4L12 14.83l4.9 4.87a1 1 0 0 0 1.4-1.4L13.17 12z"/></svg>' +
      '<span class="cw-badge" id="cw-badge">1</span>';

    var panel = document.createElement('div');
    panel.className = 'cw-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Carolina chat');
    panel.innerHTML =
      '<div class="cw-head">' +
        '<button class="cw-x" aria-label="Close">&times;</button>' +
        '<div class="cw-head-row">' +
          '<div class="cw-ava">C</div>' +
          '<div><h3>Carolina</h3><p><span class="cw-dot"></span>The5th concierge · replies instantly</p></div>' +
        '</div>' +
      '</div>' +
      '<div class="cw-body" id="cw-body"></div>' +
      '<div class="cw-foot">' +
        '<div class="cw-inrow">' +
          '<textarea class="cw-in" id="cw-in" rows="1" placeholder="Write a message…"></textarea>' +
          '<button class="cw-send" id="cw-send" aria-label="Send">' +
            '<svg viewBox="0 0 24 24"><path d="M3.4 20.4l17.5-7.5a1 1 0 0 0 0-1.84L3.4 3.56a1 1 0 0 0-1.4 1.09L4 11l10 1-10 1-2 6.32a1 1 0 0 0 1.4 1.08z"/></svg>' +
          '</button>' +
        '</div>' +
        '<p class="cw-cred">Powered by The5th AI</p>' +
      '</div>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    els.launcher = launcher;
    els.panel = panel;
    els.body = panel.querySelector('#cw-body');
    els.in = panel.querySelector('#cw-in');
    els.send = panel.querySelector('#cw-send');

    launcher.addEventListener('click', function () { togglePanel(); });
    panel.querySelector('.cw-x').addEventListener('click', function () { togglePanel(false); });
    els.send.addEventListener('click', function () { sendMessage(els.in.value); });
    els.in.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(els.in.value); }
    });
    els.in.addEventListener('input', function () {
      els.in.style.height = 'auto';
      els.in.style.height = Math.min(els.in.scrollHeight, 96) + 'px';
    });

    paintHistory();
  }

  function init() { load(); build(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
