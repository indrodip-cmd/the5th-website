// lib/hq/whop.ts
// Live revenue from the Whop REST API (https://api.whop.com/api/v1).
// Requires WHOP_API_KEY (company API key: whop.com dashboard → Developer → Company API keys).
// Returns { connected: false } with all-zero values when the key is absent or the API
// does not respond — we NEVER estimate or fabricate revenue.

const WHOP_API_KEY = process.env.WHOP_API_KEY;
const BASE = "https://api.whop.com/api/v1";

// Real monthly value of each recurring plan (from whop-webhook PLAN_TIER_MAP).
// Credit packs are one-time and intentionally excluded from MRR.
const PLAN_MONTHLY: Record<string, number> = {
  plan_EGdhCoEqV97Ba: 997 / 12, // yearly $997
  plan_oJ4XbUDNHNetF: 97, // monthly $97
  plan_3j4lU1rGraSsI: 47, // ai-only $47/mo
};
const PLAN_LABEL: Record<string, string> = {
  plan_EGdhCoEqV97Ba: "Yearly ($997/yr)",
  plan_oJ4XbUDNHNetF: "Monthly ($97/mo)",
  plan_3j4lU1rGraSsI: "The5th AI ($47/mo)",
};

const DAY = 86400000;
const dayStr = (d: Date) => d.toISOString().split("T")[0];

async function whopGet(path: string): Promise<any | null> {
  if (!WHOP_API_KEY) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${WHOP_API_KEY}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export type WhopRevenue = {
  connected: boolean;
  currency: string;
  mrr: number;
  arr: number;
  activeMemberships: number;
  mrrByPlan: { label: string; count: number; mrr: number }[];
  revenue30d: number;
  revenue7d: number;
  newSales30d: number;
  refunds30d: number;
  failedPayments: number;
  trend: { date: string; amount: number }[];
  note?: string;
};

function empty(note: string): WhopRevenue {
  return {
    connected: false, currency: "USD", mrr: 0, arr: 0, activeMemberships: 0,
    mrrByPlan: [], revenue30d: 0, revenue7d: 0, newSales30d: 0, refunds30d: 0,
    failedPayments: 0, trend: [], note,
  };
}

const num = (v: any) => (typeof v === "number" ? v : Number(v) || 0);
const rows = (j: any): any[] => (Array.isArray(j) ? j : j?.data || j?.memberships || j?.payments || []);

export async function getWhopRevenue(): Promise<WhopRevenue> {
  if (!WHOP_API_KEY) return empty("Add WHOP_API_KEY in Vercel to show live revenue.");

  const [mem, pay] = await Promise.all([
    whopGet("/memberships?status=active&per=100"),
    whopGet("/payments?per=100"),
  ]);
  if (mem === null && pay === null)
    return empty("WHOP_API_KEY is set but the Whop API did not respond — check the key.");

  // ── MRR from real active recurring memberships × known plan prices ──
  const memberships = rows(mem);
  const planCount: Record<string, number> = {};
  let activeMemberships = 0;
  for (const m of memberships) {
    const s = `${m.status}`.toLowerCase();
    const valid = m.valid !== false && s !== "canceled" && s !== "cancelled" && s !== "expired";
    if (!valid) continue;
    activeMemberships++;
    const planId = m.plan || m.plan_id || m.plan?.id;
    if (planId && PLAN_MONTHLY[planId]) planCount[planId] = (planCount[planId] || 0) + 1;
  }
  const mrrByPlan = Object.entries(planCount).map(([pid, count]) => ({
    label: PLAN_LABEL[pid] || pid,
    count,
    mrr: Math.round(PLAN_MONTHLY[pid] * count),
  }));
  const mrr = Math.round(mrrByPlan.reduce((s, p) => s + p.mrr, 0));

  // ── Revenue from real payments ──
  const payments = rows(pay);
  const now = Date.now();
  const c30 = now - 30 * DAY;
  const c7 = now - 7 * DAY;
  let currency = "USD", revenue30d = 0, revenue7d = 0, newSales30d = 0, refunds30d = 0, failedPayments = 0;
  const trendMap: Record<string, number> = {};

  for (const p of payments) {
    const raw = p.created_at ?? p.paid_at ?? p.settled_at ?? 0;
    const created = num(raw) > 0 && num(raw) < 1e12 ? num(raw) * 1000 : (num(raw) || new Date(raw).getTime());
    const amt = num(p.final_amount ?? p.settled_amount ?? p.subtotal ?? p.amount);
    const status = `${p.status || ""}`.toLowerCase();
    if (p.currency) currency = `${p.currency}`.toUpperCase();
    if (status.includes("refund")) { if (created >= c30) refunds30d += amt; continue; }
    if (status.includes("fail") || status.includes("declin")) { failedPayments++; continue; }
    const paid = status === "" || status.includes("paid") || status.includes("succeed") || status.includes("complete") || status.includes("settled");
    if (!paid) continue;
    if (created >= c30) {
      revenue30d += amt; newSales30d++;
      const ds = dayStr(new Date(created));
      trendMap[ds] = (trendMap[ds] || 0) + amt;
    }
    if (created >= c7) revenue7d += amt;
  }

  const trend: { date: string; amount: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const ds = dayStr(new Date(now - i * DAY));
    trend.push({ date: ds, amount: Math.round(trendMap[ds] || 0) });
  }

  return {
    connected: true, currency, mrr, arr: mrr * 12, activeMemberships, mrrByPlan,
    revenue30d: Math.round(revenue30d), revenue7d: Math.round(revenue7d),
    newSales30d, refunds30d: Math.round(refunds30d), failedPayments, trend,
  };
}
