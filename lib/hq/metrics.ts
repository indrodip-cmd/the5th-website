// lib/hq/metrics.ts
// Founder Command Center — aggregates the entire business from Supabase.
// All reads use the service-role key (server only). Never import into a client component.

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hlcvxeujqjhropiignjq.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function sb<T = any>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  }
}

// Monthly recurring value (USD) contributed by one active member of each tier.
export const TIER_LABEL: Record<string, string> = {
  member_yearly: "Yearly Member",
  member_monthly: "Monthly Member",
  ai_only: "The5th AI",
  ai_trial: "Free Trial",
  course_only: "Course Access",
  admin: "Admin",
  free: "Free",
};

const DAY = 86400000;
const iso = (d: Date) => d.toISOString();
const dayStr = (d: Date) => d.toISOString().split("T")[0];

export type MemberRow = {
  id: string;
  email: string;
  tier: string;
  is_active: boolean;
  joined_at: string | null;
  last_login: string | null;
  coaching_active: boolean;
  permanent_credits: number | null;
};

export type MetricsBundle = Awaited<ReturnType<typeof buildMetrics>>;

export async function buildMetrics() {
  const now = Date.now();
  const d7 = iso(new Date(now - 7 * DAY));
  const d30 = iso(new Date(now - 30 * DAY));
  const day7 = dayStr(new Date(now - 7 * DAY));

  const [
    members,
    trials,
    quizLeads,
    leads,
    aiUsage,
    conversations,
    sessions,
    missions7d,
    tracker7d,
    calls,
    memberships,
  ] = await Promise.all([
    sb<MemberRow>(
      "members?select=id,email,tier,is_active,joined_at,last_login,coaching_active,permanent_credits&order=joined_at.desc"
    ),
    sb("ai_trials?select=email,messages_used,created_at"),
    sb(
      "quiz_leads?select=email,profile_type,converted_to_member,call_booked,video_watched,revenue_logged,created_at&order=created_at.desc"
    ),
    sb("leads?select=stage,last_contacted,created_at"),
    sb("ai_usage?select=message_count,extra_credits,tier,last_message_at,week_start"),
    sb(`ai_conversations?select=id,created_at&created_at=gte.${d30}`),
    sb("user_sessions?select=email,last_active"),
    sb(`daily_mission_completions?select=id,xp_earned,completed_date&completed_date=gte.${day7}`),
    sb(`tracker_activity?select=dms_sent,calls_booked,sales_closed,cash_collected,track_date&track_date=gte.${day7}`),
    sb("coaching_calls?select=id,title,date,duration,attendees&order=date.desc&limit=50"),
    sb("memberships?select=plan_id,status,activated_at,cancelled_at"),
  ]);

  // ── MEMBERS BY TIER (real counts only — revenue comes solely from the Whop API) ──
  const activeMembers = members.filter((m) => m.is_active !== false);
  const byTier: Record<string, number> = {};
  for (const m of activeMembers) byTier[m.tier] = (byTier[m.tier] || 0) + 1;
  const membersByTier = Object.entries(byTier)
    .map(([tier, count]) => ({ tier, label: TIER_LABEL[tier] || tier, count }))
    .sort((a, b) => b.count - a.count);

  // ── GROWTH ──
  const newMembers7d = members.filter((m) => m.joined_at && m.joined_at >= d7).length;
  const newMembers30d = members.filter((m) => m.joined_at && m.joined_at >= d30).length;
  const memberEmails = new Set(members.map((m) => (m.email || "").toLowerCase()));
  const trialsConverted = trials.filter((t: any) =>
    memberEmails.has((t.email || "").toLowerCase())
  ).length;
  const cancelledMemberships = memberships.filter(
    (m: any) => m.status === "cancelled" || m.status === "payment_failed"
  ).length;

  // 14-day signup sparkline
  const signupTrend: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const ds = dayStr(new Date(now - i * DAY));
    signupTrend.push({
      date: ds,
      count: members.filter((m) => (m.joined_at || "").startsWith(ds)).length,
    });
  }

  // ── QUIZ FUNNEL ──
  const quizTotal = quizLeads.length;
  const quizVideo = quizLeads.filter((q: any) => q.video_watched).length;
  const quizBooked = quizLeads.filter((q: any) => q.call_booked).length;
  const quizConverted = quizLeads.filter((q: any) => q.converted_to_member).length;
  const quizRevenueLogged = quizLeads.reduce(
    (s: number, q: any) => s + (Number(q.revenue_logged) || 0),
    0
  );
  const profileTypes: Record<string, number> = {};
  for (const q of quizLeads as any[]) {
    if (q.profile_type) profileTypes[q.profile_type] = (profileTypes[q.profile_type] || 0) + 1;
  }

  // ── SALES PIPELINE (member-logged leads) ──
  const pipelineByStage: Record<string, number> = {};
  for (const l of leads as any[]) {
    pipelineByStage[l.stage || "unknown"] = (pipelineByStage[l.stage || "unknown"] || 0) + 1;
  }

  // ── PRODUCT USAGE ──
  const totalAiMessages = aiUsage.reduce((s: number, u: any) => s + (u.message_count || 0), 0);
  const aiActive7d = aiUsage.filter(
    (u: any) => u.last_message_at && u.last_message_at >= d7
  ).length;
  const activeSessions7d = new Set(
    sessions
      .filter((s: any) => s.last_active && s.last_active >= d7)
      .map((s: any) => (s.email || "").toLowerCase())
  ).size;
  const missionsCompleted7d = missions7d.length;

  const tracker = {
    dms: tracker7d.reduce((s: number, t: any) => s + (t.dms_sent || 0), 0),
    calls: tracker7d.reduce((s: number, t: any) => s + (t.calls_booked || 0), 0),
    sales: tracker7d.reduce((s: number, t: any) => s + (t.sales_closed || 0), 0),
    cash: tracker7d.reduce((s: number, t: any) => s + (Number(t.cash_collected) || 0), 0),
  };

  // ── BOOKINGS (from coaching_calls; Cal.com layers live data on top) ──
  const upcomingCalls = calls
    .filter((c: any) => c.date && new Date(c.date).getTime() > now)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);
  const calls30d = calls.filter((c: any) => c.date && c.date >= d30).length;

  return {
    growth: {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      newMembers7d,
      newMembers30d,
      coachingActive: members.filter((m) => m.coaching_active).length,
      trials: trials.length,
      trialsConverted,
      trialConversionRate: trials.length ? Math.round((trialsConverted / trials.length) * 100) : 0,
      cancellations: cancelledMemberships,
      membersByTier,
      signupTrend,
    },
    funnel: {
      quizTotal,
      quizVideo,
      quizBooked,
      quizConverted,
      quizConversionRate: quizTotal ? Math.round((quizConverted / quizTotal) * 100) : 0,
      quizRevenueLogged: Math.round(quizRevenueLogged),
      profileTypes,
      pipelineByStage,
    },
    usage: {
      totalAiMessages,
      aiActive7d,
      conversations30d: conversations.length,
      activeSessions7d,
      missionsCompleted7d,
      tracker,
    },
    bookings: {
      calls30d,
      upcoming: upcomingCalls.map((c: any) => ({
        id: c.id,
        title: c.title,
        date: c.date,
        duration: c.duration,
        attendees: Array.isArray(c.attendees) ? c.attendees.length : 0,
      })),
      source: "coaching_calls", // becomes "calcom" when live API is connected
    },
    generatedAt: new Date().toISOString(),
  };
}

// Verify a member is an admin before returning founder data.
// The app authenticates by email (members.id != auth uid), so we gate on email.
export async function isAdminByEmail(email: string): Promise<boolean> {
  if (!email) return false;
  const rows = await sb<{ tier: string }>(
    `members?email=eq.${encodeURIComponent(email.toLowerCase())}&select=tier&limit=1`
  );
  return rows[0]?.tier === "admin";
}
