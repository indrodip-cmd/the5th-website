/* The5th — Ask by voice (framework-free). Speak a question, hear the answer.
   Speech-to-text and text-to-speech both use the visitor's own browser. Only the TEXT of the
   question is sent to the concierge (/api/carolina) together with the same anonymous page
   signals the chat already uses. This is a synthetic assistant voice, not a recording of a person. */
(function () {
  'use strict';
  if (window.The5thVoice && window.The5thVoice._ready) return;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var synth = window.speechSynthesis;
  var root = null, rec = null, state = 'idle', history = [], speakOn = true, voices = [], cid = 'v-' + Math.random().toString(36).slice(2) + Date.now().toString(36);

  function css() {
    if (document.getElementById('t5-v-style')) return;
    var s = document.createElement('style'); s.id = 't5-v-style';
    s.textContent =
      '#t5-voice{position:fixed;inset:0;z-index:2147483000;display:none;align-items:flex-end;justify-content:center;background:rgba(20,8,24,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);font:400 15px/1.5 "DM Sans",Inter,system-ui,sans-serif}' +
      '#t5-voice.open{display:flex}' +
      '#t5-voice .v-sheet{width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:24px 24px 0 0;padding:22px 20px calc(22px + env(safe-area-inset-bottom));color:#fff;background:linear-gradient(160deg,#4E3158,#2E1A35 55%,#231029);border:1px solid rgba(201,168,76,.45);box-shadow:0 -30px 80px -20px rgba(0,0,0,.7);animation:t5vup .45s cubic-bezier(.22,1,.36,1)}' +
      '@keyframes t5vup{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}' +
      '@media(min-width:700px){#t5-voice{align-items:center}#t5-voice .v-sheet{border-radius:24px}}' +
      '#t5-voice .v-top{display:flex;align-items:center;justify-content:space-between;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:800;color:#C9A84C}' +
      '#t5-voice .v-x{background:none;border:0;color:rgba(255,255,255,.7);font-size:26px;line-height:1;cursor:pointer;padding:6px 8px;min-width:44px;min-height:44px}' +
      '#t5-voice h2{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;font-size:2rem;line-height:1.05;margin:6px 0 4px}' +
      '#t5-voice h2 em{color:#E4C879}' +
      '#t5-voice .v-sub{color:rgba(255,255,255,.72);font-size:14px;font-weight:300}' +
      '#t5-voice .v-mic{position:relative;display:block;width:104px;height:104px;margin:22px auto 8px;border-radius:50%;border:0;cursor:pointer;color:#2E1A35;background:linear-gradient(180deg,#ecd391,#C9A84C 60%,#B0902F);box-shadow:0 16px 40px rgba(201,168,76,.4)}' +
      '#t5-voice .v-mic svg{width:42px;height:42px}' +
      '#t5-voice .v-mic::after{content:"";position:absolute;inset:-10px;border-radius:50%;border:2px solid rgba(228,200,121,.5);opacity:0}' +
      '#t5-voice[data-s=listening] .v-mic::after{animation:t5ring 1.4s infinite}' +
      '@keyframes t5ring{0%{transform:scale(.9);opacity:.8}100%{transform:scale(1.35);opacity:0}}' +
      '#t5-voice .v-st{text-align:center;font-size:13px;letter-spacing:.08em;color:#E4C879;font-weight:600;min-height:20px}' +
      '#t5-voice .v-bars{display:none;justify-content:center;align-items:flex-end;gap:4px;height:26px;margin-top:8px}' +
      '#t5-voice[data-s=speaking] .v-bars,#t5-voice[data-s=listening] .v-bars{display:flex}' +
      '#t5-voice .v-bars i{width:4px;border-radius:2px;background:#E4C879;animation:t5bar 1s infinite ease-in-out}' +
      '#t5-voice .v-bars i:nth-child(2){animation-delay:.15s}#t5-voice .v-bars i:nth-child(3){animation-delay:.3s}#t5-voice .v-bars i:nth-child(4){animation-delay:.45s}#t5-voice .v-bars i:nth-child(5){animation-delay:.6s}' +
      '@keyframes t5bar{0%,100%{height:6px}50%{height:24px}}' +
      '#t5-voice .v-log{margin-top:14px;display:grid;gap:10px}' +
      '#t5-voice .v-q{justify-self:end;max-width:88%;padding:10px 14px;border-radius:14px 14px 4px 14px;background:rgba(201,168,76,.18);border:1px solid rgba(201,168,76,.4)}' +
      '#t5-voice .v-a{justify-self:start;max-width:94%;padding:12px 14px;border-radius:14px 14px 14px 4px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12)}' +
      '#t5-voice form{display:flex;gap:8px;margin-top:16px}' +
      '#t5-voice input[type=text]{flex:1;min-height:46px;padding:0 14px;border-radius:10px;border:1px solid rgba(201,168,76,.4);background:rgba(255,255,255,.07);color:#fff;font:inherit;outline:none}' +
      '#t5-voice form button{min-height:46px;padding:0 16px;border-radius:10px;border:0;background:#C9A84C;color:#2E1A35;font:700 14px "DM Sans",sans-serif;cursor:pointer}' +
      '#t5-voice .v-row{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;justify-content:space-between;margin-top:14px;font-size:13px}' +
      '#t5-voice .v-row label{display:flex;gap:8px;align-items:center;color:rgba(255,255,255,.8);cursor:pointer}' +
      '#t5-voice .v-row button{background:none;border:0;color:#E4C879;text-decoration:underline;text-underline-offset:3px;cursor:pointer;font:600 13px "DM Sans",sans-serif;min-height:36px}' +
      '#t5-voice .v-fine{margin-top:12px;font-size:11.5px;color:rgba(255,255,255,.5);line-height:1.5}' +
      '@media(prefers-reduced-motion:reduce){#t5-voice .v-sheet,#t5-voice .v-bars i,#t5-voice .v-mic::after{animation:none!important}}';
    document.head.appendChild(s);
  }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstChild; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(sel) { return root.querySelector(sel); }
  function setState(s, msg) {
    state = s; root.setAttribute('data-s', s);
    var t = { idle: SR ? 'Tap the microphone and ask your question' : 'Type your question below', listening: 'Listening…', thinking: 'Thinking…', speaking: 'Speaking…', error: msg || 'Something went wrong' };
    $('.v-st').textContent = msg && s !== 'error' ? msg : t[s];
  }
  function build() {
    css();
    root = el('<div id="t5-voice" role="dialog" aria-modal="true" aria-label="Ask The5th by voice" data-s="idle"><div class="v-sheet">' +
      '<div class="v-top"><span>Ask by voice</span><button class="v-x" type="button" aria-label="Close">×</button></div>' +
      '<h2>Ask The5th <em>anything.</em></h2><p class="v-sub">Speak naturally. You will hear a short answer, and the full text stays on screen.</p>' +
      '<button class="v-mic" type="button" aria-label="Start listening"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="5" width="12" height="22" rx="6"/><path d="M10 22a14 14 0 0 0 28 0M24 36v7M16 43h16"/></svg></button>' +
      '<div class="v-st" aria-live="polite"></div><div class="v-bars"><i></i><i></i><i></i><i></i><i></i></div>' +
      '<div class="v-log" id="t5-vlog"></div>' +
      '<form><input type="text" placeholder="Or type your question" aria-label="Type your question" autocomplete="off"><button type="submit">Ask</button></form>' +
      '<div class="v-row"><label><input type="checkbox" class="v-sp" checked> Read answers aloud</label><button type="button" class="v-chat">Continue in chat</button><button type="button" class="v-stop">Stop speaking</button></div>' +
      '<p class="v-fine">Your browser turns speech into text and reads the answer aloud. Only the text of your question is sent to us. This is an AI assistant with a synthetic voice.</p>' +
      '</div></div>');
    document.body.appendChild(root);
    $('.v-x').addEventListener('click', close);
    root.addEventListener('click', function (e) { if (e.target === root) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('open')) close(); });
    $('.v-mic').addEventListener('click', function () { if (state === 'listening') { try { rec.stop(); } catch (e) {} } else listen(); });
    $('form').addEventListener('submit', function (e) { e.preventDefault(); var i = $('input[type=text]'), v = i.value.trim(); if (v) { i.value = ''; ask(v); } });
    $('.v-sp').addEventListener('change', function (e) { speakOn = e.target.checked; if (!speakOn) stopSpeak(); });
    $('.v-stop').addEventListener('click', stopSpeak);
    $('.v-chat').addEventListener('click', function () {
      var last = history.length ? history[history.length - 2] : null; close();
      try { window.dispatchEvent(new CustomEvent('the5th:invite', { detail: { seed: last ? last.content : 'I have a question.' } })); } catch (e) {}
    });
    if (!SR) $('.v-mic').style.display = 'none';
  }
  function pickVoice() {
    voices = synth ? synth.getVoices() : [];
    var lang = (navigator.language || 'en-US');
    var pref = voices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(lang.slice(0, 2).toLowerCase()) === 0; });
    var best = pref.filter(function (v) { return /natural|neural|google|samantha|serena|karen|daniel|premium|enhanced/i.test(v.name); })[0];
    return best || pref[0] || voices[0] || null;
  }
  function clean(t) { return String(t).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/https?:\/\/\S+/g, '').replace(/[*_#`>]/g, '').replace(/\s+/g, ' ').trim(); }
  function stopSpeak() { try { if (synth) synth.cancel(); } catch (e) {} if (state === 'speaking') setState('idle'); }
  function speak(text) {
    if (!speakOn || !synth) { setState('idle'); return; }
    stopSpeak();
    var parts = clean(text).match(/[^.!?]+[.!?]*/g) || [clean(text)], v = pickVoice(), n = 0;
    setState('speaking');
    parts.forEach(function (p, i) {
      if (!p.trim()) return;
      var u = new SpeechSynthesisUtterance(p.trim()); if (v) u.voice = v; u.lang = (v && v.lang) || navigator.language || 'en-US'; u.rate = 1.0; u.pitch = 1.0;
      n++;
      u.onend = function () { if (--n <= 0 && state === 'speaking') setState('idle'); };
      u.onerror = function () { if (--n <= 0 && state === 'speaking') setState('idle'); };
      synth.speak(u);
    });
    if (!n) setState('idle');
  }
  function add(cls, text) { var d = document.createElement('div'); d.className = cls; d.textContent = text; $('#t5-vlog').appendChild(d); d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  function listen() {
    if (!SR) return; stopSpeak();
    try {
      rec = new SR(); rec.lang = navigator.language || 'en-US'; rec.interimResults = true; rec.maxAlternatives = 1; rec.continuous = false;
      var final = '';
      rec.onstart = function () { setState('listening'); };
      rec.onresult = function (e) { var t = ''; for (var i = e.resultIndex; i < e.results.length; i++) { t += e.results[i][0].transcript; if (e.results[i].isFinal) final = t; } $('.v-st').textContent = t ? '“' + t + '”' : 'Listening…'; if (!final) final = t; };
      rec.onerror = function (e) { setState('error', e.error === 'not-allowed' ? 'Microphone is blocked. Allow it in your browser, or type below.' : 'I could not hear that. Try again or type below.'); };
      rec.onend = function () { if (state === 'listening') { if (final.trim()) ask(final.trim()); else setState('idle'); } };
      rec.start();
    } catch (e) { setState('error', 'Voice is not available here. Type below instead.'); }
  }
  function ask(q) {
    add('v-q', q); setState('thinking');
    history.push({ role: 'user', content: q });
    var body = { messages: history.slice(-8), agent: 'carolina', voice: true, conversationId: cid, path: location.pathname, timeZone: (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } })() };
    try { body.visitor_id = localStorage.getItem('a5_vid') || undefined; } catch (e) {}
    try { if (window.The5thMind && window.The5thMind.signals) body.visitor = window.The5thMind.signals(); } catch (e) {}
    fetch('/api/carolina', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        var reply = (x.j && x.j.reply) || '';
        if (!x.ok || !reply) { history.pop(); setState('error', (x.j && x.j.error) || 'I could not answer that just now. Please try again.'); return; }
        history.push({ role: 'assistant', content: reply }); add('v-a', clean(reply)); speak(reply);
        try { if (navigator.sendBeacon) navigator.sendBeacon('/api/track', new Blob([JSON.stringify({ event_type: 'chat_message', visitor_id: localStorage.getItem('a5_vid') || 'anon', session_id: sessionStorage.getItem('a5_sid') || 'anon', path: location.pathname, meta: { via: 'voice' } })], { type: 'text/plain' })); } catch (e) {}
      })
      .catch(function () { history.pop(); setState('error', 'Connection problem. Please try again.'); });
  }
  function open(seed) {
    if (!root) build();
    root.classList.add('open'); document.body.style.overflow = 'hidden'; setState('idle');
    try { if (synth && synth.getVoices) synth.getVoices(); } catch (e) {}
    setTimeout(function () { var b = $('.v-mic'); if (b && b.style.display !== 'none') b.focus(); else $('input[type=text]').focus(); }, 60);
    if (typeof seed === 'string' && seed) ask(seed);
  }
  function close() { if (!root) return; try { if (rec) rec.abort(); } catch (e) {} stopSpeak(); root.classList.remove('open'); document.body.style.overflow = ''; }
  window.The5thVoice = { _ready: true, open: open, close: close, supported: !!SR };
  if (window.__t5VoicePending) { window.__t5VoicePending = false; open(); }
})();
