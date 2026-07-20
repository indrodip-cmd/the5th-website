// lib/hq/calcom.ts
// Live appointment bookings from the Cal.com API v2 (https://api.cal.com/v2).
// Requires CALCOM_API_KEY (Cal.com → Settings → Developer → API keys; key starts cal_live_).
// Returns { connected: false } with zeros when the key is absent — never fabricated.

const CALCOM_API_KEY = process.env.CALCOM_API_KEY;
const BASE = "https://api.cal.com/v2";
const API_VERSION = "2026-05-01";

const DAY = 86400000;

export type CalBookings = {
  connected: boolean;
  upcoming: { id: string; title: string; start: string; attendee: string; status: string }[];
  upcoming7d: number;
  upcomingTotal: number;
  booked30d: number;
  cancelled30d: number;
  noShows30d: number;
  note?: string;
};

function empty(note: string): CalBookings {
  return { connected: false, upcoming: [], upcoming7d: 0, upcomingTotal: 0, booked30d: 0, cancelled30d: 0, noShows30d: 0, note };
}

async function calGet(query: string): Promise<any[] | null> {
  try {
    const res = await fetch(`${BASE}/bookings?${query}`, {
      headers: { Authorization: `Bearer ${CALCOM_API_KEY}`, "cal-api-version": API_VERSION },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j.data?.bookings || j.data || j.bookings || [];
  } catch {
    return null;
  }
}

export async function getCalBookings(): Promise<CalBookings> {
  if (!CALCOM_API_KEY) return empty("Add CALCOM_API_KEY in Vercel to show live bookings.");

  const [upcoming, past, cancelled] = await Promise.all([
    calGet("status=upcoming&limit=100"),
    calGet("status=past&limit=100"),
    calGet("status=cancelled&limit=100"),
  ]);
  if (upcoming === null && past === null && cancelled === null)
    return empty("CALCOM_API_KEY is set but Cal.com rejected it — check the key.");

  const now = Date.now();
  const c30 = now - 30 * DAY;
  const in7 = now + 7 * DAY;

  const startMs = (b: any) => new Date(b.start || b.startTime || 0).getTime();
  const attendee = (b: any) => b.attendees?.[0]?.name || b.attendees?.[0]?.email || "—";

  const up = (upcoming || []).filter((b) => startMs(b) > now);
  up.sort((a, b) => startMs(a) - startMs(b));

  const booked30d = (past || []).filter((b) => startMs(b) >= c30).length + up.length;
  const cancelled30d = (cancelled || []).filter((b) => startMs(b) >= c30).length;
  const noShows30d = (past || []).filter(
    (b) => startMs(b) >= c30 && (b.attendees || []).some((a: any) => a.absent || a.noShow)
  ).length;

  return {
    connected: true,
    upcoming: up.slice(0, 12).map((b) => ({
      id: `${b.uid || b.id}`,
      title: b.title || b.eventType?.slug || "Booking",
      start: new Date(startMs(b)).toISOString(),
      attendee: attendee(b),
      status: `${b.status || "accepted"}`.toLowerCase(),
    })),
    upcoming7d: up.filter((b) => startMs(b) <= in7).length,
    upcomingTotal: up.length,
    booked30d,
    cancelled30d,
    noShows30d,
  };
}
