/* Dormant connectors (3I.3) — GA4, Google Search Console, Meta Ads, Google Ads.
   Full architecture with the real credential shape; each `configured()` stays
   false and `sync()` is a safe no-op until the env vars are added. When creds
   arrive, fill in the fetch bodies (models + Integration Center already exist). */

// ── Google Analytics 4 (Data API v1) — GA4_PROPERTY_ID + GOOGLE_SERVICE_ACCOUNT_JSON ──
export function ga4Configured(): boolean {
  return !!(process.env.GA4_PROPERTY_ID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
}
export async function ga4Sync(): Promise<{ records: number; log: string[] }> {
  if (!ga4Configured()) return { records: 0, log: ['GA4 not configured'] }
  // TODO(live): runReport on properties/{GA4_PROPERTY_ID} → crm_analytics_daily
  // (sessions, activeUsers, conversions, source/medium). Join to contacts by client_id.
  return { records: 0, log: ['GA4 sync scaffold — awaiting implementation'] }
}

// ── Google Search Console (Search Analytics API) — GSC_SITE_URL + GOOGLE_SERVICE_ACCOUNT_JSON ──
export function gscConfigured(): boolean {
  return !!(process.env.GSC_SITE_URL && process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
}
export async function gscSync(): Promise<{ records: number; log: string[] }> {
  if (!gscConfigured()) return { records: 0, log: ['GSC not configured'] }
  // TODO(live): searchanalytics.query (dimensions: query,page) → crm_analytics_daily.
  return { records: 0, log: ['GSC sync scaffold — awaiting implementation'] }
}

// ── Meta Ads (Marketing API) — META_ADS_TOKEN + META_AD_ACCOUNT_ID ──
export function metaAdsConfigured(): boolean {
  return !!(process.env.META_ADS_TOKEN && process.env.META_AD_ACCOUNT_ID)
}
export async function metaAdsSync(): Promise<{ records: number; log: string[] }> {
  if (!metaAdsConfigured()) return { records: 0, log: ['Meta Ads not configured'] }
  // TODO(live): /act_{id}/insights (campaign level) → crm_ad_campaigns + crm_ad_metrics.
  return { records: 0, log: ['Meta Ads sync scaffold — awaiting implementation'] }
}

// ── Google Ads (Google Ads API) — GOOGLE_ADS_* (developer token, customer id, OAuth) ──
export function googleAdsConfigured(): boolean {
  return !!(process.env.GOOGLE_ADS_DEVELOPER_TOKEN && process.env.GOOGLE_ADS_CUSTOMER_ID)
}
export async function googleAdsSync(): Promise<{ records: number; log: string[] }> {
  if (!googleAdsConfigured()) return { records: 0, log: ['Google Ads not configured'] }
  // TODO(live): GAQL campaign report → crm_ad_campaigns + crm_ad_metrics.
  return { records: 0, log: ['Google Ads sync scaffold — awaiting implementation'] }
}
