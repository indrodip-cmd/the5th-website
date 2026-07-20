// lib/hq/brevo.ts
// Email funnel stats from Brevo (uses existing BREVO_API_KEY). List IDs mirror
// the whop-webhook BREVO_LIST_IDS map: 12 yearly, 13 monthly, 14 ai-only, 15 trial.

const BREVO_API_KEY = process.env.BREVO_API_KEY;

const LISTS: { id: number; label: string }[] = [
  { id: 12, label: "Members — Yearly" },
  { id: 13, label: "Members — Monthly" },
  { id: 14, label: "The5th AI" },
  { id: 15, label: "Free Trial / Nurture" },
];

export type BrevoStats = {
  connected: boolean;
  totalContacts: number;
  lists: { label: string; contacts: number }[];
  note?: string;
};

export async function getBrevoStats(): Promise<BrevoStats> {
  if (!BREVO_API_KEY) {
    return { connected: false, totalContacts: 0, lists: [], note: "BREVO_API_KEY not set." };
  }
  try {
    const results = await Promise.all(
      LISTS.map(async (l) => {
        const res = await fetch(`https://api.brevo.com/v3/contacts/lists/${l.id}`, {
          headers: { "api-key": BREVO_API_KEY, accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) return { label: l.label, contacts: 0 };
        const j = await res.json();
        return { label: l.label, contacts: j.totalSubscribers ?? j.uniqueSubscribers ?? 0 };
      })
    );
    return {
      connected: true,
      totalContacts: results.reduce((s, r) => s + r.contacts, 0),
      lists: results,
    };
  } catch {
    return { connected: false, totalContacts: 0, lists: [], note: "Brevo request failed." };
  }
}
