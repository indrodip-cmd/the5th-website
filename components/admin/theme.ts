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
body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; background: ${T.bg}; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.skeleton { background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
@keyframes slideInPanel { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.detail-panel { animation: slideInPanel 0.22s cubic-bezier(0.25,0.46,0.45,0.94) both; }
.admin-row:hover td { background: #f0fdf4 !important; }
.admin-row td { transition: background 0.12s ease; }
.bar-col { transition: height 0.4s cubic-bezier(0.25,0.46,0.45,0.94); }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
.admin-btn { padding: 12px 20px; background: linear-gradient(135deg, #225840, #2d6a4f); border: none; border-radius: 6px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; text-align: center; text-decoration: none; display: block; width: 100%; transition: opacity 0.15s ease; }
.admin-btn:hover { opacity: 0.9; }
.admin-btn:disabled { background: #d1d5db; cursor: not-allowed; opacity: 1; }
.tab-btn { padding: 9px 18px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }

/* ── Workspace shell ── */
.ws-layout { display: flex; min-height: 100vh; background: ${T.bg}; }
.ws-side { width: 236px; flex-shrink: 0; background: ${T.ink}; color: #fff; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; }
.ws-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ws-nav-item { display: flex; align-items: center; gap: 11px; padding: 10px 14px; margin: 1px 10px; border-radius: 9px; color: rgba(255,255,255,0.62); font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; transition: all .14s; }
.ws-nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
.ws-nav-item.active { background: ${T.green2}; color: #fff; }
.ws-nav-ico { width: 18px; height: 18px; flex-shrink: 0; opacity: .9; }
.ws-topbar { height: 60px; background: #fff; border-bottom: 1px solid ${T.border}; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 24px; position: sticky; top: 0; z-index: 40; }
.ws-content { padding: 28px 28px 60px; max-width: 1260px; width: 100%; margin: 0 auto; animation: fadeIn .2s ease; }

/* ── Reusable primitives ── */
.a-card { background: ${T.card}; border: 1px solid ${T.border}; border-radius: ${T.radius}px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
.a-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e4e2; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; background: #fff; color: ${T.text}; transition: border-color .14s; }
.a-input:focus { border-color: ${T.green2}; }
.a-label { font-size: 12px; font-weight: 700; letter-spacing: .04em; color: ${T.sub}; text-transform: uppercase; margin-bottom: 6px; display: block; }
.a-btn { padding: 9px 16px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; display: inline-flex; align-items: center; gap: 7px; }
.a-btn-primary { background: linear-gradient(135deg,#225840,#2d6a4f); color: #fff; }
.a-btn-primary:hover { opacity: .9; }
.a-btn-ghost { background: #f3f4f6; color: #374151; }
.a-btn-ghost:hover { background: #e9ebe9; }
.a-btn:disabled { opacity: .5; cursor: not-allowed; }
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
`
