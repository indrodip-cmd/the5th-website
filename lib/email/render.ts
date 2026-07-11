/* Email Design Studio (3I.8A.2) — block model + responsive HTML renderer.
   A design is an ordered list of typed blocks; renderEmail() turns it into
   table-based, inline-styled, dark-mode-friendly HTML using the centralized
   brand tokens. Merge tags ({{first_name}}) are left intact for the engine to
   personalize, or substituted for the preview sandbox. */
type Row = Record<string, unknown>
export interface Block { id: string; type: string; props: Row }
export interface Brand {
  company_name: string; logo_url?: string | null; primary_color: string; secondary_color: string; accent_color: string
  text_color: string; bg_color: string; radius: number; font: string; width: number
  footer_address?: string | null; support_email?: string | null; privacy_url?: string | null; terms_url?: string | null
  unsubscribe_text?: string | null; social?: Row
}

export const BLOCK_DEFS: Array<{ type: string; label: string; icon: string; group: string; defaults: Row }> = [
  { type: 'heading', label: 'Heading', icon: 'H', group: 'Basic', defaults: { text: 'Your headline here', size: 28, align: 'center' } },
  { type: 'text', label: 'Paragraph', icon: '¶', group: 'Basic', defaults: { text: 'Write your message here. Use {{first_name}} to personalize.', size: 15, align: 'left' } },
  { type: 'button', label: 'Button', icon: '▭', group: 'Basic', defaults: { text: 'Learn more', url: 'https://the5th.co', align: 'center' } },
  { type: 'image', label: 'Image', icon: '🖼', group: 'Basic', defaults: { src: '', alt: '', url: '', width: 100 } },
  { type: 'divider', label: 'Divider', icon: '—', group: 'Basic', defaults: {} },
  { type: 'spacer', label: 'Spacer', icon: '⇕', group: 'Basic', defaults: { height: 24 } },
  { type: 'list', label: 'List', icon: '≡', group: 'Basic', defaults: { items: 'First point\nSecond point\nThird point' } },
  { type: 'quote', label: 'Quote', icon: '❝', group: 'Basic', defaults: { text: 'A short, powerful quote.', author: '' } },
  { type: 'columns', label: 'Two columns', icon: '▥', group: 'Layout', defaults: { leftText: 'Left column', rightText: 'Right column' } },
  { type: 'cta', label: 'CTA banner', icon: '★', group: 'Premium', defaults: { title: 'Ready to take the next step?', subtitle: 'Book a free strategy call with the team.', buttonText: 'Book a call', buttonUrl: 'https://the5th.co/call' } },
  { type: 'pricing', label: 'Pricing card', icon: '$', group: 'Premium', defaults: { title: 'Fast Forward', price: '$', period: '5-month program', features: 'Weekly 1:1 coaching\nThe Wisdom-to-Income Method\nClient acquisition systems', buttonText: 'See what\'s inside', buttonUrl: 'https://the5th.co/fast-forward' } },
  { type: 'testimonial', label: 'Testimonial', icon: '“', group: 'Premium', defaults: { quote: 'This changed everything for my business.', author: 'Happy Client', role: 'Founder' } },
  { type: 'guarantee', label: 'Guarantee box', icon: '✓', group: 'Premium', defaults: { title: '100% Money-Back Guarantee', text: 'If you meet the requirements and don\'t get the result, we refund your investment.' } },
  { type: 'product', label: 'Product card', icon: '▦', group: 'Premium', defaults: { title: 'The5th AI', subtitle: 'Your personal CMO, 24/7', description: 'Trained to help you build a coaching business — writes offers, emails and content.', buttonText: 'Explore', buttonUrl: 'https://the5th.co/ai', image: '' } },
  { type: 'signature', label: 'Signature', icon: '✍', group: 'Premium', defaults: { name: 'Indrodip', title: 'Founder, The5th' } },
  { type: 'social', label: 'Social links', icon: '@', group: 'Premium', defaults: {} },
  { type: 'html', label: 'Custom HTML', icon: '</>', group: 'Advanced', defaults: { code: '<p>Custom HTML…</p>' } },
]
export function defaultBlock(type: string): Block {
  const d = BLOCK_DEFS.find((b) => b.type === type)
  return { id: 'b' + Math.random().toString(36).slice(2, 8), type, props: JSON.parse(JSON.stringify(d?.defaults || {})) }
}

function mt(s: unknown, vars?: Row): string {
  const str = String(s ?? '')
  if (!vars) return str
  return str.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, k) => { const v = vars[k]; return v == null ? '' : String(v) })
}
const px = (n: unknown, d: number) => `${Number(n) || d}px`

function renderBlock(b: Block, brand: Brand, vars?: Row): string {
  const p = b.props || {}
  const pad = '0 32px'
  const btn = (text: string, url: string, align = 'center') =>
    `<table role="presentation" width="100%"><tr><td align="${align}" style="padding:6px 32px 6px;"><a href="${mt(url, vars)}" style="display:inline-block;background:${brand.accent_color};color:#1a1206;font-weight:700;font-size:15px;text-decoration:none;padding:13px 26px;border-radius:${brand.radius}px;">${mt(text, vars)}</a></td></tr></table>`
  switch (b.type) {
    case 'heading': return `<tr><td style="padding:14px 32px 6px;"><h1 style="margin:0;font-size:${Number(p.size) || 28}px;line-height:1.2;font-weight:800;color:${p.color || brand.primary_color};text-align:${p.align || 'center'};">${mt(p.text, vars)}</h1></td></tr>`
    case 'text': return `<tr><td style="padding:8px 32px;"><p style="margin:0;font-size:${Number(p.size) || 15}px;line-height:1.65;color:${brand.text_color};text-align:${p.align || 'left'};">${mt(p.text, vars)}</p></td></tr>`
    case 'button': return `<tr><td>${btn(String(p.text || 'Learn more'), String(p.url || '#'), String(p.align || 'center'))}</td></tr>`
    case 'image': { const img = `<img src="${mt(p.src, vars)}" alt="${mt(p.alt, vars)}" width="${p.width === 100 || !p.width ? '100%' : Number(p.width) + '%'}" style="display:block;border:0;max-width:100%;border-radius:${brand.radius}px;margin:0 auto;" />`; return `<tr><td style="padding:10px 32px;">${p.url ? `<a href="${mt(p.url, vars)}">${img}</a>` : img}</td></tr>` }
    case 'divider': return `<tr><td style="padding:10px 32px;"><div style="border-top:1px solid #e6e2ea;"></div></td></tr>`
    case 'spacer': return `<tr><td style="height:${px(p.height, 24)};line-height:${px(p.height, 24)};">&nbsp;</td></tr>`
    case 'list': return `<tr><td style="padding:8px 32px;"><table role="presentation">${String(p.items || '').split('\n').filter(Boolean).map((li) => `<tr><td style="padding:4px 0;color:${brand.accent_color};font-weight:800;vertical-align:top;width:20px;">✓</td><td style="padding:4px 0;font-size:15px;line-height:1.5;color:${brand.text_color};">${mt(li, vars)}</td></tr>`).join('')}</table></td></tr>`
    case 'quote': return `<tr><td style="padding:12px 32px;"><div style="border-left:3px solid ${brand.accent_color};padding:6px 0 6px 16px;font-size:17px;font-style:italic;color:${brand.text_color};">${mt(p.text, vars)}${p.author ? `<div style="font-style:normal;font-size:13px;color:#8a8391;margin-top:8px;">— ${mt(p.author, vars)}</div>` : ''}</div></td></tr>`
    case 'columns': return `<tr><td style="padding:8px 24px;"><table role="presentation" width="100%"><tr><td width="50%" style="padding:8px;font-size:14px;line-height:1.55;color:${brand.text_color};vertical-align:top;">${mt(p.leftText, vars)}</td><td width="50%" style="padding:8px;font-size:14px;line-height:1.55;color:${brand.text_color};vertical-align:top;">${mt(p.rightText, vars)}</td></tr></table></td></tr>`
    case 'cta': return `<tr><td style="padding:12px 24px;"><table role="presentation" width="100%" style="background:linear-gradient(135deg,${brand.primary_color},${brand.secondary_color});border-radius:${brand.radius + 6}px;"><tr><td style="padding:28px 26px;text-align:center;"><div style="font-size:21px;font-weight:800;color:#fff;">${mt(p.title, vars)}</div><div style="font-size:14px;color:rgba(255,255,255,.75);margin:8px 0 16px;">${mt(p.subtitle, vars)}</div><a href="${mt(p.buttonUrl, vars)}" style="display:inline-block;background:${brand.accent_color};color:#1a1206;font-weight:700;font-size:15px;text-decoration:none;padding:12px 26px;border-radius:${brand.radius}px;">${mt(p.buttonText, vars)}</a></td></tr></table></td></tr>`
    case 'pricing': return `<tr><td style="padding:12px 24px;"><table role="presentation" width="100%" style="border:1px solid #e6e2ea;border-radius:${brand.radius + 4}px;"><tr><td style="padding:24px 26px;"><div style="font-size:19px;font-weight:800;color:${brand.primary_color};">${mt(p.title, vars)}</div><div style="font-size:13px;color:#8a8391;margin:2px 0 14px;">${mt(p.price, vars)} · ${mt(p.period, vars)}</div><table role="presentation">${String(p.features || '').split('\n').filter(Boolean).map((f) => `<tr><td style="color:${brand.accent_color};font-weight:800;vertical-align:top;width:20px;padding:3px 0;">✓</td><td style="font-size:14px;color:${brand.text_color};padding:3px 0;">${mt(f, vars)}</td></tr>`).join('')}</table><a href="${mt(p.buttonUrl, vars)}" style="display:inline-block;margin-top:16px;background:${brand.accent_color};color:#1a1206;font-weight:700;font-size:14px;text-decoration:none;padding:11px 22px;border-radius:${brand.radius}px;">${mt(p.buttonText, vars)}</a></td></tr></table></td></tr>`
    case 'testimonial': return `<tr><td style="padding:12px 24px;"><table role="presentation" width="100%" style="background:#faf8fc;border-radius:${brand.radius + 4}px;"><tr><td style="padding:24px 26px;"><div style="font-size:16px;line-height:1.6;color:${brand.text_color};font-style:italic;">“${mt(p.quote, vars)}”</div><div style="font-size:13px;color:#8a8391;margin-top:12px;"><b style="color:${brand.primary_color};">${mt(p.author, vars)}</b>${p.role ? ` · ${mt(p.role, vars)}` : ''}</div></td></tr></table></td></tr>`
    case 'guarantee': return `<tr><td style="padding:12px 24px;"><table role="presentation" width="100%" style="border:2px solid ${brand.accent_color};border-radius:${brand.radius + 4}px;background:#fffdf6;"><tr><td style="padding:20px 24px;"><div style="font-size:16px;font-weight:800;color:${brand.primary_color};">✓ ${mt(p.title, vars)}</div><div style="font-size:14px;color:${brand.text_color};margin-top:6px;line-height:1.55;">${mt(p.text, vars)}</div></td></tr></table></td></tr>`
    case 'product': { const im = p.image ? `<img src="${mt(p.image, vars)}" alt="" width="100%" style="display:block;border-radius:${brand.radius}px;margin-bottom:14px;" />` : ''; return `<tr><td style="padding:12px 24px;"><table role="presentation" width="100%" style="border:1px solid #e6e2ea;border-radius:${brand.radius + 4}px;"><tr><td style="padding:22px 24px;">${im}<div style="font-size:18px;font-weight:800;color:${brand.primary_color};">${mt(p.title, vars)}</div><div style="font-size:13px;color:${brand.accent_color};font-weight:600;margin:2px 0 8px;">${mt(p.subtitle, vars)}</div><div style="font-size:14px;color:${brand.text_color};line-height:1.55;margin-bottom:14px;">${mt(p.description, vars)}</div><a href="${mt(p.buttonUrl, vars)}" style="display:inline-block;background:${brand.accent_color};color:#1a1206;font-weight:700;font-size:14px;text-decoration:none;padding:10px 22px;border-radius:${brand.radius}px;">${mt(p.buttonText, vars)}</a></td></tr></table></td></tr>` }
    case 'signature': return `<tr><td style="padding:16px 32px;"><div style="font-size:15px;color:${brand.text_color};">Warmly,</div><div style="font-size:16px;font-weight:800;color:${brand.primary_color};margin-top:4px;">${mt(p.name, vars)}</div><div style="font-size:13px;color:#8a8391;">${mt(p.title, vars)}</div></td></tr>`
    case 'social': { const s = (brand.social || {}) as Row; const links = Object.entries(s).filter(([, v]) => v).map(([k, v]) => `<a href="${v}" style="color:${brand.primary_color};text-decoration:none;font-size:13px;font-weight:600;margin:0 8px;">${k}</a>`).join(''); return links ? `<tr><td align="center" style="padding:10px 32px;">${links}</td></tr>` : '' }
    case 'html': return `<tr><td style="padding:8px 32px;">${mt(p.code, vars)}</td></tr>`
    default: return ''
  }
}

export function renderEmail(design: { blocks?: Block[] }, brand: Brand, vars?: Row): string {
  const blocks = design?.blocks || []
  const header = brand.logo_url
    ? `<tr><td align="center" style="padding:26px 32px 6px;"><img src="${brand.logo_url}" alt="${brand.company_name}" height="34" style="display:block;border:0;" /></td></tr>`
    : `<tr><td align="center" style="padding:26px 32px 6px;"><div style="font-size:20px;font-weight:800;color:${brand.primary_color};">${brand.company_name}</div></td></tr>`
  const footer = `<tr><td style="padding:24px 32px 30px;border-top:1px solid #ece8f0;"><div style="font-size:12px;color:#9b94a3;line-height:1.6;text-align:center;">${brand.footer_address || brand.company_name}${brand.support_email ? ` · <a href="mailto:${brand.support_email}" style="color:#9b94a3;">${brand.support_email}</a>` : ''}<br/><a href="{{unsubscribe_url}}" style="color:#9b94a3;text-decoration:underline;">${brand.unsubscribe_text || 'Unsubscribe'}</a>${brand.privacy_url ? ` · <a href="${brand.privacy_url}" style="color:#9b94a3;">Privacy</a>` : ''}${brand.terms_url ? ` · <a href="${brand.terms_url}" style="color:#9b94a3;">Terms</a>` : ''}</div></td></tr>`
  const body = blocks.map((b) => renderBlock(b, brand, vars)).join('\n')
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="color-scheme" content="light"/></head>
<body style="margin:0;padding:0;background:${brand.bg_color};font-family:${brand.font};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.bg_color};"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="${brand.width}" cellpadding="0" cellspacing="0" style="max-width:${brand.width}px;width:100%;background:#ffffff;border-radius:${brand.radius + 6}px;overflow:hidden;box-shadow:0 8px 30px rgba(40,20,50,.08);">
${header}${body}${footer}
</table></td></tr></table></body></html>`
}
