/* Shared design tokens + global CSS for the entire Workspace (/admin).
   One source of truth for the premium admin look, reused by every module. */

export const T = {
  ink: '#0a1a0f',
  green: '#225840',
  green2: '#2d6a4f',
  bg: '#f4f5f4',
  card: '#ffffff',
  border: '#eef0ee',
  text: '#0a0a0a',
  sub: '#6b7280',
  muted: '#9ca3af',
  danger: '#b91c1c',
  radius: 14,
} as const

/* Global admin CSS — injected once by AdminShell. Extends the original
   Command Center styles with sidebar/shell, tables, badges and drawer. */
export const ADMIN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; background: ${T.bg}; color: ${T.text}; }
a, button { -webkit-tap-highlight-color: transparent; }
/* Accessibility: visible keyboard focus everywhere, honoured only for keyboard. */
:focus-visible { outline: 2px solid ${T.green2}; outline-offset: 2px; border-radius: 6px; }
:focus:not(:focus-visible) { outline: none; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; } }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.skeleton { background: linear-gradient(90deg,#eef0ef 25%,#e3e6e4 50%,#eef0ef 75%); background-size:200% 100%; animation: shimmer 1.4s ease-in-out infinite; border-radius: 8px; }
@keyframes slideInPanel { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes riseIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.detail-panel { animation: slideInPanel 0.22s cubic-bezier(0.25,0.46,0.45,0.94) both; }
.admin-row:hover td { background: #f0fdf4 !important; }
.admin-row td { transition: background 0.12s ease; }
.bar-col { transition: height 0.4s cubic-bezier(0.25,0.46,0.45,0.94); }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: #d7dbd8; border-radius: 6px; border: 2px solid transparent; background-clip: padding-box; }
::-webkit-scrollbar-thumb:hover { background: #c2c8c4; background-clip: padding-box; }
::-webkit-scrollbar-track { background: transparent; }
.admin-btn { padding: 12px 20px; background: linear-gradient(135deg, #225840, #2d6a4f); border: none; border-radius: 6px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; text-align: center; text-decoration: none; display: block; width: 100%; transition: opacity 0.15s ease; }
.admin-btn:hover { opacity: 0.9; }
.admin-btn:disabled { background: #d1d5db; cursor: not-allowed; opacity: 1; }
.tab-btn { padding: 9px 18px; border-radius: 999px; border: none; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .16s cubic-bezier(.22,1,.36,1); }
.tab-btn:hover { filter: brightness(.98); }

/* ── Workspace shell ── */
.ws-layout { display: flex; min-height: 100vh; background: ${T.bg}; }
.ws-side { width: 236px; flex-shrink: 0; background: ${T.ink}; color: #fff; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; }
.ws-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ws-nav-item { display: flex; align-items: center; gap: 11px; padding: 10px 14px; margin: 1px 10px; border-radius: 10px; color: rgba(255,255,255,0.6); font-size: 13.5px; font-weight: 600; cursor: pointer; text-decoration: none; transition: background .16s, color .16s; }
.ws-nav-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
.ws-nav-item.active { background: ${T.green2}; color: #fff; box-shadow: 0 4px 14px rgba(45,106,79,.35); }
.ws-nav-ico { width: 18px; height: 18px; flex-shrink: 0; opacity: .9; }
.ws-topbar { height: 60px; background: rgba(255,255,255,.85); backdrop-filter: saturate(180%) blur(12px); -webkit-backdrop-filter: saturate(180%) blur(12px); border-bottom: 1px solid ${T.border}; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 24px; position: sticky; top: 0; z-index: 40; }
.ws-content { padding: 28px 28px 60px; max-width: 1260px; width: 100%; margin: 0 auto; animation: riseIn .26s cubic-bezier(.22,1,.36,1); }
.ws-hamburger { display: none; width: 38px; height: 38px; border: 1px solid ${T.border}; border-radius: 10px; background: #fff; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.ws-hamburger span { display: block; width: 16px; height: 2px; background: ${T.ink}; border-radius: 2px; box-shadow: 0 5px 0 ${T.ink}, 0 -5px 0 ${T.ink}; }
.ws-side-overlay { position: fixed; inset: 0; background: rgba(10,26,15,.5); z-index: 299; animation: fadeIn .18s ease; }

/* ── Mobile: off-canvas sidebar, safe areas, comfortable spacing ── */
@media (max-width: 900px) {
  .ws-side { position: fixed; top: 0; left: 0; z-index: 300; height: 100dvh; transform: translateX(-100%); transition: transform .28s cubic-bezier(.22,1,.36,1); box-shadow: 10px 0 44px rgba(0,0,0,.35); padding-top: env(safe-area-inset-top,0); }
  .ws-side.open { transform: translateX(0); }
  .ws-hamburger { display: flex; }
  .ws-topbar { padding: 0 14px; padding-top: env(safe-area-inset-top,0); height: calc(60px + env(safe-area-inset-top,0)); }
  .ws-content { padding: 18px 15px calc(56px + env(safe-area-inset-bottom,0)); }
  .a-modal { width: 96vw; }
  .a-drawer { width: 100vw; }
}

/* ── Reusable primitives ── */
.a-card { background: ${T.card}; border: 1px solid ${T.border}; border-radius: ${T.radius}px; box-shadow: 0 1px 2px rgba(16,24,40,.04), 0 6px 18px rgba(16,24,40,.05); transition: box-shadow .2s, border-color .2s; }
.a-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e4e2; border-radius: 9px; font-size: 14px; font-family: inherit; outline: none; background: #fff; color: ${T.text}; transition: border-color .16s, box-shadow .16s; }
.a-input:focus { border-color: ${T.green2}; box-shadow: 0 0 0 3px rgba(45,106,79,.12); }
.a-input::placeholder { color: ${T.muted}; }
.a-label { font-size: 12px; font-weight: 700; letter-spacing: .04em; color: ${T.sub}; text-transform: uppercase; margin-bottom: 6px; display: block; }
.a-btn { padding: 9px 16px; border-radius: 9px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: transform .16s cubic-bezier(.22,1,.36,1), box-shadow .18s, background .16s, opacity .16s; display: inline-flex; align-items: center; gap: 7px; }
.a-btn:active { transform: translateY(1px); }
.a-btn-primary { background: linear-gradient(135deg,#225840,#2d6a4f); color: #fff; box-shadow: 0 2px 8px rgba(34,88,64,.2); }
.a-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(34,88,64,.28); }
.a-btn-ghost { background: #f3f4f6; color: #374151; }
.a-btn-ghost:hover { background: #e9ebe9; }
.a-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }
.a-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.a-table thead tr { background: ${T.ink}; }
.a-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.65); text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; }
.a-table td { padding: 13px 16px; color: ${T.text}; border-bottom: 1px solid #f2f3f2; }
.a-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.a-overlay { position: fixed; inset: 0; background: rgba(10,26,15,0.4); z-index: 200; animation: fadeIn .15s ease; }
.a-drawer { position: fixed; top: 0; right: 0; height: 100vh; width: min(560px, 94vw); background: #fff; z-index: 201; overflow-y: auto; box-shadow: -8px 0 40px rgba(0,0,0,0.14); }
.a-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: #fff; border-radius: 14px; z-index: 201; width: min(520px, 94vw); max-height: 88vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.24); }

/* ── Dashboard grid ── */
.dash-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; align-items: start; }
.dash-cell { min-width: 0; }
.dash-cell.dragging { opacity: .4; }
.dash-cell.drop-target { outline: 2px dashed ${T.green2}; outline-offset: 3px; border-radius: 14px; }
@media (max-width: 1080px) { .dash-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } .dash-cell { grid-column: span 2 !important; } }
@media (max-width: 620px) { .dash-grid { grid-template-columns: 1fr; } .dash-cell { grid-column: span 1 !important; } }

/* ═══════════════════════════════════════════════════════════════════════
   Mobile + iPad optimization — cascades to EVERY /admin module.
   Modules are built with inline styles, so we reach their grids/rows with
   [style*=…] attribute selectors. Verified safe: no admin chart uses CSS-grid
   columns (the only chart is flex/width-based), so collapsing grids never
   breaks a visualization.
   ═══════════════════════════════════════════════════════════════════════ */

/* Never let a module push the page into horizontal scroll on a touch device.
   clip (not hidden) so overflow-y stays visible and the sticky topbar keeps working. */
.ws-main { overflow-x: clip; }
/* Any table becomes horizontally scrollable inside its own wrapper instead of
   blowing out the card. Pair <table class="a-table"> with a parent .a-table-wrap. */
.a-table-wrap { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }

/* iPad (portrait + landscape ≤1024): thin the densest fixed grids so 3–4 column
   layouts and fixed sidebars aren't cramped. Two-column stays two-column here. */
@media (max-width: 1024px) {
  .ws-content { max-width: 100%; }
  [style*="grid-template-columns: repeat(4"],
  [style*="grid-template-columns: repeat(3"],
  [style*="grid-template-columns: 1fr 1fr 1fr"],
  [style*="grid-template-columns: 1fr 0.8fr 1fr auto"] { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
  [style*="grid-template-columns: 180px 1fr 300px"],
  [style*="grid-template-columns: 260px 1fr"],
  [style*="grid-template-columns: 2fr 1fr auto"] { grid-template-columns: 1fr !important; }
}

/* iOS: 16px form controls prevent Safari auto-zoom on focus; 44px min tap targets. */
@media (max-width: 820px) {
  .a-input, input, textarea, select { font-size: 16px; }
  .a-btn, .admin-btn, .tab-btn, .ws-nav-item { min-height: 44px; }
  .a-btn, .tab-btn { display: inline-flex; align-items: center; justify-content: center; }
  .ws-nav-item { padding-top: 12px; padding-bottom: 12px; }
  /* Horizontal pill/tab rows scroll instead of wrapping into a tall stack. */
  .a-tabs { display: flex; gap: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 2px; }
  .a-tabs::-webkit-scrollbar { display: none; }
  .a-tabs > * { flex-shrink: 0; }
}

/* Live Inbox — master/detail on phones + small tablets: show the conversation
   list, then swap to the full-screen thread (with a back button) when one is open. */
.inbox-back { display: none; }
@media (max-width: 820px) {
  .inbox-list { width: 100% !important; }
  .inbox-root.has-active .inbox-list { display: none; }
  .inbox-root:not(.has-active) .inbox-thread { display: none; }
  .inbox-back { display: inline-flex; }
  .inbox-root { height: calc(100dvh - 96px) !important; }
}

/* Phones (≤680): single-column everything + full-height sheets with safe areas. */
@media (max-width: 680px) {
  [style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
  .ws-content { padding: 16px 13px calc(56px + env(safe-area-inset-bottom,0)); }
  .a-table { min-width: 560px; }               /* keep columns legible; wrapper scrolls */
  .a-drawer { width: 100vw; height: 100dvh; }
  .a-modal { width: 96vw; max-height: 92dvh; }
  .tab-btn { padding: 9px 15px; font-size: 13px; }
}
`
