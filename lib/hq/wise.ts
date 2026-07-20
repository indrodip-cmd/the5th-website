// lib/hq/wise.ts
// Live "cash in bank" from the Wise API (https://api.wise.com).
// Requires WISE_API_TOKEN (Wise → Settings → API tokens). WISE_PROFILE_ID is
// optional — if omitted we auto-discover the business (or first) profile.
// Shows real balances per currency. Returns { connected: false } otherwise —
// never fabricated. (Transaction statements need Wise SCA request-signing, so
// they're intentionally out of scope here; balances are the reliable read.)

const WISE_API_TOKEN = process.env.WISE_API_TOKEN;
const WISE_PROFILE_ID = process.env.WISE_PROFILE_ID;
const BASE = "https://api.wise.com";

async function wiseGet(path: string): Promise<any | null> {
  if (!WISE_API_TOKEN) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${WISE_API_TOKEN}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export type WiseBalances = {
  connected: boolean;
  balances: { currency: string; value: number; type: string }[];
  profileType?: string;
  note?: string;
};

function empty(note: string): WiseBalances {
  return { connected: false, balances: [], note };
}

async function resolveProfile(): Promise<{ id: string; type?: string } | null> {
  if (WISE_PROFILE_ID) return { id: WISE_PROFILE_ID };
  const profiles = await wiseGet("/v1/profiles");
  if (!Array.isArray(profiles) || !profiles.length) return null;
  // Prefer the business profile; fall back to the first.
  const biz = profiles.find((p: any) => `${p.type}`.toLowerCase() === "business");
  const chosen = biz || profiles[0];
  return { id: `${chosen.id}`, type: chosen.type };
}

export async function getWiseBalances(): Promise<WiseBalances> {
  if (!WISE_API_TOKEN)
    return empty("Add WISE_API_TOKEN in Vercel to show your Wise cash balances.");

  const profile = await resolveProfile();
  if (!profile)
    return empty("WISE_API_TOKEN is set but no Wise profile was found — check the token, or set WISE_PROFILE_ID.");

  const raw = await wiseGet(`/v4/profiles/${profile.id}/balances?types=STANDARD`);
  if (raw === null)
    return empty("Wise API did not return balances — verify WISE_API_TOKEN and WISE_PROFILE_ID.");

  const list: any[] = Array.isArray(raw) ? raw : raw?.balances || [];
  const balances = list
    .map((b: any) => ({
      currency: `${b.amount?.currency || b.currency || ""}`.toUpperCase(),
      value: Number(b.amount?.value ?? b.value ?? 0),
      type: `${b.type || "STANDARD"}`,
    }))
    .filter((b) => b.currency)
    .sort((a, b) => b.value - a.value);

  return { connected: true, balances, profileType: profile.type };
}
