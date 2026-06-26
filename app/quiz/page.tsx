'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, useInView, type Variants } from 'framer-motion'
import Image from 'next/image'

/* ─── Types ─── */
type QuizAnswers = Record<string, string | string[]>

interface DayPlan {
  day: number; title: string; theme: string; tasks: string[]
  win_condition: string; motivation: string
}
interface Roadmap {
  days: DayPlan[]; summary: string
  biggest_opportunity: string; first_action: string
}
interface Lead {
  id: string; email: string; name: string
  answers: QuizAnswers; roadmap: Roadmap | null
  current_day: number; streak: number
  revenue_logged: number; last_visit: string | null
}
interface ChatMessage { role: 'user' | 'assistant'; content: string }
interface OptionItem { value: string; emoji: string; label: string; sub: string }

type SelectQ   = { id: string; num: number; title: string; sub: string; type: 'select';   options: OptionItem[] }
type MultiQ    = { id: string; num: number; title: string; sub: string; type: 'multi';    options: OptionItem[] }
type TextareaQ = { id: string; num: number; title: string; sub: string; type: 'textarea'; placeholder: string }
type FromToQ   = { id: string; num: number; title: string; sub: string; type: 'fromto';  fromPlaceholder: string; toPlaceholder: string }
type ScaleQ    = { id: string; num: number; title: string; sub: string; type: 'scale';   scaleMin: string; scaleMax: string }
type Question  = SelectQ | MultiQ | TextareaQ | FromToQ | ScaleQ

/* ─── Question pool (order is defined separately, below) ─── */
const questionPool: Question[] = [
  {
    id: 'q1', num: 1, title: 'Where are you in your coaching or consulting business right now?',
    sub: "Be honest — there's no wrong answer. This calibrates your entire blueprint.",
    type: 'select',
    options: [
      { value: 'starting', emoji: '🌱', label: 'Just starting out', sub: 'No clients yet, building from the ground up' },
      { value: 'idea', emoji: '💡', label: "I have an idea but haven't launched", sub: "I know what I want to do, haven't started yet" },
      { value: 'launched', emoji: '🚀', label: "I've launched and have some clients", sub: 'Revenue is coming in but not consistent yet' },
      { value: 'scaling', emoji: '📈', label: "I'm established and want to scale", sub: 'Consistent clients, ready for next level growth' },
    ]
  },
  {
    id: 'qgoal', num: 1, title: 'What is your biggest goal over the next 12 months?',
    sub: 'This is the north star. Everything we map for you points back to it.',
    type: 'select',
    options: [
      { value: 'replace_salary', emoji: '💼', label: 'Replace my salary', sub: 'Earn enough to leave, or match, my job' },
      { value: '5k',        emoji: '🌱', label: 'Reach $5K a month', sub: 'Consistent, reliable monthly income' },
      { value: '10k',       emoji: '📈', label: 'Reach $10K a month', sub: 'A serious, full-time business' },
      { value: 'premium',   emoji: '✨', label: 'Build a premium coaching business', sub: 'Higher-value clients, fewer of them' },
      { value: 'recurring', emoji: '🔄', label: 'Create recurring income', sub: 'Predictable revenue I can count on' },
      { value: 'legacy',    emoji: '🏛️', label: 'Build a lasting legacy', sub: 'Something meaningful that outlasts me' },
    ]
  },
  {
    id: 'q2', num: 2, title: 'Who is your ideal client?',
    sub: 'Choose the description that best fits the person you most want to serve.',
    type: 'select',
    options: [
      { value: 'transitions', emoji: '🌀', label: 'Women going through major life transitions', sub: 'Divorce, career change, empty nest, reinvention' },
      { value: 'career', emoji: '💼', label: 'Professionals seeking career change', sub: 'Corporate escapees, burnout recovery, new direction' },
      { value: 'entrepreneurs', emoji: '🏢', label: 'Entrepreneurs and business owners', sub: 'Growing revenue, scaling, leadership' },
      { value: 'wellness', emoji: '💚', label: 'Health and wellness seekers', sub: 'Body transformation, energy, holistic health' },
      { value: 'mindset', emoji: '🧠', label: 'Personal development and mindset', sub: 'Confidence, relationships, life purpose' },
      { value: 'other', emoji: '✨', label: 'Other / coaches and consultants', sub: 'Helping others grow their expertise business' },
      { value: 'financial', emoji: '💰', label: 'Financial freedom seekers', sub: 'Debt freedom, investing, wealth building, passive income' },
      { value: 'relationships', emoji: '❤️', label: 'Relationship and dating coaches', sub: 'Finding love, marriage, divorce recovery, connection' },
      { value: 'spiritual', emoji: '🌙', label: 'Spiritual and energy work', sub: 'Healing, intuition, purpose, consciousness' },
      { value: 'parenting', emoji: '👨‍👩‍👧', label: 'Parents and family coaches', sub: 'Raising kids, family dynamics, empty nest, aging parents' },
      { value: 'creativity', emoji: '🎨', label: 'Creative entrepreneurs', sub: 'Artists, writers, musicians monetizing their craft' },
      { value: 'corporate', emoji: '🏛️', label: 'Corporate and executive coaching', sub: 'Leadership, team performance, executive presence' },
    ]
  },
  {
    id: 'q3', num: 3, title: 'What age range is your ideal client typically in?',
    sub: 'Select all that apply. You can choose more than one.',
    type: 'multi',
    options: [
      { value: '25-34', emoji: '🌟', label: '25-34', sub: 'Younger professionals building their careers' },
      { value: '35-44', emoji: '⭐', label: '35-44', sub: 'Mid-career, established but seeking change' },
      { value: '45-54', emoji: '🌠', label: '45-54', sub: 'Experienced, ready for transformation' },
      { value: '55-69', emoji: '💫', label: '55-69', sub: 'Wisdom years, monetizing decades of experience' },
      { value: '70+', emoji: '✨', label: '70+', sub: 'Legacy stage, sharing lifetime knowledge' },
    ]
  },
  {
    id: 'q4', num: 4, title: 'What is the #1 pain your ideal client wakes up feeling?',
    sub: 'Your answer directly shapes the quality of your blueprint. Think of this as briefing a world-class strategist — the more specific you are, the more precise and valuable your personalised growth plan becomes.',
    type: 'textarea',
    placeholder: "e.g. They feel stuck and invisible — they have so much to offer but can't figure out how to turn their expertise into income…"
  },
  {
    id: 'q5', num: 5, title: 'What is your zone of genius?',
    sub: 'Your answer directly shapes the quality of your blueprint. Think of this as briefing a world-class strategist — the more specific you are, the more precise and valuable your personalised growth plan becomes.',
    type: 'textarea',
    placeholder: 'e.g. I have a gift for helping women identify their unique story and turn decades of experience into a focused, premium coaching offer…'
  },
  {
    id: 'q6', num: 6, title: 'Do you have a personal transformation story connected to your niche?',
    sub: 'Your story is your most powerful marketing asset. How developed is it?',
    type: 'select',
    options: [
      { value: 'strong', emoji: '🔥', label: 'Yes — a powerful one I share openly', sub: 'My story is central to my brand' },
      { value: 'underused', emoji: '💎', label: "Yes, but I don't fully leverage it", sub: 'I have the story but rarely share it publicly' },
      { value: 'partial', emoji: '🌱', label: 'Partially — still developing my story', sub: "I'm on the journey myself, not fully there yet" },
      { value: 'none', emoji: '❓', label: 'Not really', sub: "I help others but haven't lived the transformation myself" },
    ]
  },
  {
    id: 'q7', num: 7, title: 'Complete your client transformation statement.',
    sub: 'Every powerful offer is built on a clear FROM → TO.',
    type: 'fromto',
    fromPlaceholder: 'e.g. feeling invisible with no clear offer…',
    toPlaceholder: 'e.g. a confident coach with a $5K signature program…'
  },
  {
    id: 'q8', num: 8, title: 'How would you prefer to deliver your coaching?',
    sub: 'Select all that apply. Your blueprint will be built around your preferred formats.',
    type: 'multi',
    options: [
      { value: '1on1', emoji: '👤', label: '1:1 Private Coaching', sub: 'Deep, personalized transformation with individual clients' },
      { value: 'group', emoji: '👥', label: 'Group Coaching Program', sub: 'Cohort-based experience with a small group' },
      { value: 'course', emoji: '🎓', label: 'Online Course / Digital Product', sub: 'Self-paced program clients complete independently' },
      { value: 'membership', emoji: '🔑', label: 'Membership Community', sub: 'Recurring access, ongoing support and content' },
      { value: 'mixed', emoji: '🎯', label: 'Mix of all of the above', sub: 'A hybrid model with multiple touchpoints' },
    ]
  },
  {
    id: 'q9', num: 9, title: 'How long would your ideal signature program be?',
    sub: 'Program length affects pricing, client commitment, and results.',
    type: 'select',
    options: [
      { value: '4-6wk', emoji: '⚡', label: '4–6 Weeks', sub: 'Quick win, intensive transformation' },
      { value: '8-12wk', emoji: '📅', label: '8–12 Weeks', sub: 'Standard program, solid results' },
      { value: '3-6mo', emoji: '🗓️', label: '3–6 Months', sub: 'Deep transformation, premium pricing' },
      { value: '6-12mo', emoji: '🏆', label: '6–12 Months', sub: 'High-level mentorship and accountability' },
      { value: 'ongoing', emoji: '♾️', label: 'Ongoing / Evergreen', sub: 'Continuous support, membership model' },
    ]
  },
  {
    id: 'q10', num: 10, title: 'How confident are you stating your price out loud on a sales call?',
    sub: '1 = I stumble, lower it, or apologize. 5 = I state it clearly and hold the line.',
    type: 'scale', scaleMin: 'Not confident', scaleMax: 'Fully confident'
  },
  {
    id: 'q11', num: 11, title: "What's holding you back from charging what you're worth?",
    sub: 'Pricing psychology matters. Be brutally honest here.',
    type: 'select',
    options: [
      { value: 'not_worth', emoji: '😟', label: "I don't believe my offer is worth it yet", sub: 'Imposter syndrome — I question my value' },
      { value: 'fear_no', emoji: '😨', label: "Fear clients won't pay that much", sub: 'Scared of rejection or hearing "too expensive"' },
      { value: 'justify', emoji: '🤔', label: "I can't justify the price clearly", sub: "Can't articulate the ROI compellingly" },
      { value: 'guilt', emoji: '💭', label: 'I feel guilty charging premium rates', sub: 'Charging a lot feels wrong or selfish' },
      { value: 'confident', emoji: '💪', label: "Nothing — I'm confident in my pricing", sub: "I charge what I'm worth and don't negotiate" },
    ]
  },
  {
    id: 'q12', num: 12, title: 'How consistently do you create and publish content?',
    sub: 'Content consistency is the #1 predictor of lead flow. Be honest.',
    type: 'select',
    options: [
      { value: 'daily', emoji: '🏆', label: 'Daily', sub: 'I show up every single day, no matter what' },
      { value: 'few_week', emoji: '✅', label: 'A few times per week', sub: 'Consistent but not daily' },
      { value: 'weekly', emoji: '📆', label: 'About once a week', sub: 'Weekly posts when I can manage it' },
      { value: 'sporadic', emoji: '🌊', label: 'Sporadically / when inspired', sub: 'Feast or famine — bursts then silence' },
      { value: 'rarely', emoji: '🔇', label: 'Rarely or never', sub: "Haven't found my content rhythm yet" },
    ]
  },
  {
    id: 'q13', num: 13, title: 'What content formats feel natural to you?',
    sub: 'Select all that apply — your blueprint will use your natural strengths.',
    type: 'multi',
    options: [
      { value: 'video', emoji: '🎥', label: 'Video', sub: 'YouTube, Reels, TikTok' },
      { value: 'writing', emoji: '✍️', label: 'Writing', sub: 'Blog posts, newsletter, LinkedIn articles' },
      { value: 'audio', emoji: '🎙️', label: 'Audio / Podcast', sub: 'Conversations, interviews, voice notes' },
      { value: 'social', emoji: '📱', label: 'Social Media Posts', sub: 'Instagram, Facebook, text-based posts' },
      { value: 'live', emoji: '🎤', label: 'Live Events / Workshops', sub: 'Webinars, masterclasses, in-person' },
    ]
  },
  {
    id: 'q14', num: 14, title: 'What blocks your content creation most?',
    sub: 'Your blueprint will include a strategy to overcome your exact block.',
    type: 'select',
    options: [
      { value: 'what_say', emoji: '💬', label: 'Not knowing what to say', sub: 'I sit down to create and go blank' },
      { value: 'perfectionism', emoji: '😰', label: 'Perfectionism / fear of judgment', sub: "I don't post because it's never quite right" },
      { value: 'time', emoji: '⏰', label: 'No time or energy', sub: 'Too much going on to create consistently' },
      { value: 'tech', emoji: '💻', label: 'Tech overwhelm', sub: 'Editing, scheduling, platforms — too much' },
      { value: 'no_results', emoji: '📉', label: "Not seeing results, so I stop", sub: "I've tried, got no engagement, and gave up" },
    ]
  },
  {
    id: 'q15', num: 15, title: 'What is your current relationship with selling your services?',
    sub: 'Sales is a learnable skill at any stage.',
    type: 'select',
    options: [
      { value: 'hate', emoji: '😬', label: 'I hate sales and avoid it', sub: 'It feels pushy, icky, or like begging' },
      { value: 'lose_price', emoji: '😅', label: "I'm okay but lose people at the price", sub: 'Call goes well until I mention the investment' },
      { value: 'decent', emoji: '👍', label: "I'm decent but inconsistent", sub: "I close sometimes but can't predict it" },
      { value: 'good', emoji: '💼', label: "I'm good and close regularly", sub: 'Most calls convert, I have a basic process' },
      { value: 'strength', emoji: '🔥', label: 'Sales is my strength', sub: 'I love it and consistently close high-ticket' },
    ]
  },
  {
    id: 'q16', num: 16, title: 'What is your biggest fear right now in building this business?',
    sub: 'Your blueprint addresses your specific fear directly.',
    type: 'select',
    options: [
      { value: 'visibility', emoji: '👁️', label: 'Putting myself out there and being judged', sub: 'What will people think? What if I get criticized?' },
      { value: 'wont_work', emoji: '💸', label: 'Investing time and money and it not working', sub: 'What if I do everything right and still fail?' },
      { value: 'money', emoji: '📉', label: 'Running out of money before it takes off', sub: 'The financial pressure is real' },
      { value: 'credibility', emoji: '🎓', label: 'Not being credible enough', sub: 'Who am I to charge that much?' },
      { value: 'success', emoji: '🚀', label: "Success — what if I can't handle it?", sub: "What if it works and I'm overwhelmed?" },
    ]
  },
  {
    id: 'q17', num: 17, title: 'What kind of support do you most need right now?',
    sub: 'Select all that apply. Your blueprint will prioritize your most urgent gaps.',
    type: 'multi',
    options: [
      { value: 'strategy', emoji: '🗺️', label: 'A clear strategy and roadmap', sub: 'Tell me exactly what to do and in what order' },
      { value: 'accountability', emoji: '🤝', label: 'Accountability to stay consistent', sub: "I know what to do — I just need to actually do it" },
      { value: 'tech', emoji: '⚙️', label: 'Technical help with tools and systems', sub: 'Website, funnels, email, automation — overwhelming' },
      { value: 'messaging', emoji: '💬', label: 'Messaging and positioning', sub: 'I need to talk about what I do compellingly' },
      { value: 'sales', emoji: '💰', label: 'Sales and conversion coaching', sub: 'Help me close more calls and get more yeses' },
    ]
  },
  {
    id: 'qmp1', num: 17, title: 'How comfortable do you feel charging premium prices?',
    sub: "There's no right answer. This simply helps us understand your pricing confidence.",
    type: 'scale', scaleMin: 'Very uncomfortable', scaleMax: 'Completely at ease'
  },
  {
    id: 'qmp2', num: 17, title: 'When money comes up in your business, what do you most often feel?',
    sub: 'Be honest. This shapes how we support you, never how we judge you.',
    type: 'select',
    options: [
      { value: 'excited',  emoji: '✨', label: 'Excited and motivated', sub: 'Money feels like possibility' },
      { value: 'calm',     emoji: '🌿', label: 'Calm and matter-of-fact', sub: 'It is just part of business' },
      { value: 'anxious',  emoji: '🌧️', label: 'Anxious or uncertain', sub: 'It brings up some tension' },
      { value: 'guilty',   emoji: '💭', label: 'Guilty or uneasy', sub: 'Charging well feels uncomfortable' },
      { value: 'avoidant', emoji: '🙈', label: "I'd rather not think about it", sub: 'I tend to avoid the topic' },
    ]
  },
  {
    id: 'qmp3', num: 17, title: 'Which of these feels most true for you right now?',
    sub: 'Choose the one that resonates most. There are no wrong answers here.',
    type: 'select',
    options: [
      { value: 'hard',      emoji: '⛰️', label: 'Money is hard to earn', sub: 'It takes real effort and struggle' },
      { value: 'slow',      emoji: '🐢', label: 'Wealth takes years to build', sub: 'It is a slow, gradual climb' },
      { value: 'guilt',     emoji: '💗', label: 'I feel guilty charging high prices', sub: 'Even when the value is clearly there' },
      { value: 'rejection', emoji: '😰', label: "I'm afraid people will reject my prices", sub: 'Pricing makes me hesitate' },
      { value: 'freedom',   emoji: '🕊️', label: 'Money creates more freedom', sub: 'It expands what is possible for me' },
    ]
  },
  {
    id: 'qmp4', num: 17, title: "Growing up, how would you describe your family's relationship with money?",
    sub: 'Our early experiences quietly shape how we earn and charge today.',
    type: 'select',
    options: [
      { value: 'worried',     emoji: '😟', label: 'We constantly worried about money', sub: 'There never felt like enough' },
      { value: 'unspoken',    emoji: '🤐', label: 'Money was never really discussed', sub: 'It was a quiet, private topic' },
      { value: 'conflict',    emoji: '⚡', label: 'Money caused tension or conflict', sub: 'It was a source of stress' },
      { value: 'comfortable', emoji: '🏡', label: 'We were financially comfortable', sub: 'Money was rarely a worry' },
      { value: 'healthy',     emoji: '🌳', label: 'We had a healthy relationship with money', sub: 'It felt balanced and open' },
    ]
  },
  {
    id: 'qmp5', num: 17, title: 'Which of these fears affects your business the most?',
    sub: 'Naming it gently is the first step to moving past it.',
    type: 'select',
    options: [
      { value: 'rejection',    emoji: '🚪', label: 'Fear of rejection', sub: 'Hearing no, or being turned down' },
      { value: 'overcharging', emoji: '💸', label: 'Fear of charging too much', sub: 'Asking for what I am truly worth' },
      { value: 'success',      emoji: '🌟', label: 'Fear of success', sub: 'What growth might ask of me' },
      { value: 'failure',      emoji: '🌫️', label: 'Fear of failure', sub: 'Trying, and it not working out' },
      { value: 'judgement',    emoji: '👀', label: 'Fear of being judged', sub: 'What others will think of me' },
    ]
  },
  {
    id: 'q18', num: 18, title: 'What is your revenue goal in the next 6 months?',
    sub: 'Your pricing strategy will align to this target.',
    type: 'select',
    options: [
      { value: '1-3k', emoji: '🎯', label: '$1K – $3K per month', sub: 'Building momentum and first consistent clients' },
      { value: '3-5k', emoji: '📊', label: '$3K – $5K per month', sub: 'Creating real income that matters to my household' },
      { value: '5-10k', emoji: '💫', label: '$5K – $10K per month', sub: 'The $10K milestone — financial freedom within reach' },
      { value: '10k+', emoji: '🏆', label: '$10K+ per month', sub: 'Already have traction, scaling to multiple $10K months' },
    ]
  },
  {
    id: 'q19', num: 19, title: 'How many hours per week can you realistically dedicate to this?',
    sub: 'Your roadmap will be built around your actual available time.',
    type: 'select',
    options: [
      { value: 'lt5', emoji: '🌙', label: 'Less than 5 hours', sub: 'Side hustle — nights and weekends only' },
      { value: '5-10', emoji: '⏱️', label: '5–10 hours', sub: 'Dedicated part-time commitment' },
      { value: '10-20', emoji: '📅', label: '10–20 hours', sub: 'Significant investment — this is a priority' },
      { value: '20+', emoji: '🔥', label: '20+ hours', sub: 'Full focus — this is my primary priority' },
    ]
  },
  {
    id: 'q20', num: 20, title: 'How urgent is this for you right now?',
    sub: '1 = When I get around to it. 5 = I need to make this happen NOW.',
    type: 'scale', scaleMin: 'No rush', scaleMax: 'Need this now'
  },
  {
    id: 'qchallenge', num: 21, title: 'If we could solve just one challenge together, what would it be?',
    sub: "Picture your Strategy Session is over and you leave thrilled. What did we solve? Your answer guides your report and our conversation.",
    type: 'textarea',
    placeholder: "e.g. I'd finally know exactly what to offer and how to price it with real confidence…"
  },
]

/* ─── Chaptered order: Goal → Money → Business → Sales → Vision ─── */
const QUESTION_ORDER = [
  'qgoal',
  'qmp1', 'qmp2', 'qmp3', 'qmp4', 'qmp5',
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9',
  'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17',
  'q18', 'q19', 'q20', 'qchallenge',
]
const questions: Question[] = QUESTION_ORDER
  .map(id => questionPool.find(q => q.id === id))
  .filter((q): q is Question => Boolean(q))

/* ─── Sections / chapters ─── */
type SectionKey = 'goal' | 'money' | 'business' | 'sales' | 'vision'
const SECTION_KEYS: SectionKey[] = ['goal', 'money', 'business', 'sales', 'vision']
const SECTIONS: Record<SectionKey, { name: string; eyebrow: string; intro: string }> = {
  goal:     { name: 'Your Goal',            eyebrow: 'Part 1 of 5', intro: "Let's begin with where you want to be. Everything we build points back to this." },
  money:    { name: 'Your Money Story',     eyebrow: 'Part 2 of 5', intro: "Before strategy, let's understand your relationship with money. This is where a lot of growth quietly hides, and there are no wrong answers." },
  business: { name: 'Your Business',         eyebrow: 'Part 3 of 5', intro: "Now the practical side, who you serve and what you do. This is what our AI uses to shape your offer." },
  sales:    { name: 'Your Sales & Mindset',  eyebrow: 'Part 4 of 5', intro: "How you sell, show up, and stay consistent. This tells us which strategies will actually fit you." },
  vision:   { name: 'Where You’re Headed', eyebrow: 'Part 5 of 5', intro: "Almost there. A few final questions so we can build your roadmap and prepare for your session." },
}
function sectionOf(id: string): SectionKey {
  if (id === 'qgoal') return 'goal'
  if (id.startsWith('qmp')) return 'money'
  if (id === 'qchallenge') return 'vision'
  const n = parseInt(id.replace('q', ''), 10)
  if (n >= 1 && n <= 9) return 'business'
  if (n >= 10 && n <= 17) return 'sales'
  return 'vision'
}

/* ─── useCountUp ─── */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return val
}

/* ─── StatCard ─── */
function StatCard({ label, value, unit, color }: { label: string; value: number; unit?: string; color: string }) {
  const displayed = useCountUp(value)
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}40`, borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>
        {unit === '$' ? `$${displayed.toLocaleString()}` : displayed}{unit && unit !== '$' ? unit : ''}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

/* ─── CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { background: #FAF6F0; }
body { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; color: #1A1A2E; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInLeft  { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); } }
@keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
@keyframes dotPulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(184,150,12,0.5); } 70% { transform: scale(1.25); box-shadow: 0 0 0 5px rgba(184,150,12,0); } }
@keyframes meshMove { 0% { opacity:0.7 } 100% { opacity:1 } }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(1.3)} }
@keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(34,88,64,0.3)} 50%{box-shadow:0 0 0 12px rgba(34,88,64,0)} }
@keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeInLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
@keyframes fadeInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
@keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
@keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
@keyframes countUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes tabletReveal { from { opacity:0.3; transform:scale(0.85) translateY(40px); } to { opacity:1; transform:scale(1) translateY(0); } }

.afu-1 { animation: fadeUp 0.6s ease both; }
.afu-2 { animation: fadeUp 0.6s 0.1s ease both; }
.afu-3 { animation: fadeUp 0.6s 0.2s ease both; }
.afu-4 { animation: fadeUp 0.6s 0.3s ease both; }
.afu-5 { animation: fadeUp 0.6s 0.4s ease both; }
.afu-6 { animation: fadeUp 0.6s 0.5s ease both; }

.sir { animation: slideInRight 0.25s cubic-bezier(0.25,0.46,0.45,0.94) both; }
.sil { animation: slideInLeft  0.25s cubic-bezier(0.25,0.46,0.45,0.94) both; }
.popup-in { animation: scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
.dot-cur  { animation: dotPulse 1.5s ease-in-out infinite; }

.gbtn {
  display: block; width: 100%; padding: 18px 32px;
  background: #1c4a32;
  border: none; border-radius: 50px;
  box-shadow: 0 4px 20px rgba(28,74,50,0.38);
  color: #fff; font-size: 17px; font-weight: 700;
  cursor: pointer; transition: opacity 0.2s ease, transform 0.2s ease;
  text-align: center; font-family: inherit;
}
.gbtn:hover { opacity: 0.88; transform: translateY(-1px); }
.gbtn:active { transform: scale(0.98); opacity: 1; }
.gbtn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

.qopt {
  display: flex; align-items: center; justify-content: flex-start; width: 100%;
  padding: 18px 28px; background: #fff;
  border: 2px solid transparent; border-radius: 50px;
  cursor: pointer; transition: all 0.15s ease;
  text-align: left; margin-bottom: 12px; font-family: inherit;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.qopt:hover { border-color: #1c4a32; box-shadow: 0 4px 18px rgba(0,0,0,0.1); }
.qopt.sel { background: #1c4a32; border-color: #1c4a32; }

.qinput {
  width: 100%; padding: 16px; border: 2px solid rgba(255,255,255,0.3);
  border-radius: 16px; font-size: 17px; font-family: inherit;
  transition: border-color 0.2s ease; outline: none;
  color: #0a0a0a; background: #fff;
}
.qinput:focus { border-color: #1c4a32; }
.qinput::placeholder { color: #9ca3af; }
.qinput::placeholder { color: #9ca3af; }

.scale-btn {
  flex: 1; height: 56px; border-radius: 50px;
  border: 2px solid rgba(255,255,255,0.45); background: #fff;
  font-size: 20px; font-weight: 700; cursor: pointer;
  transition: all 0.15s ease; color: #111; font-family: inherit;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.scale-btn:hover { border-color: #1c4a32; color: #1c4a32; }
.scale-btn.sel { background: #1c4a32; border-color: #1c4a32; color: #fff; }

.otp-box {
  width: 52px; height: 60px; border: 2px solid #e0e0e0;
  border-radius: 6px; text-align: center; font-size: 24px;
  font-weight: 700; color: #0a0a0a; background: #fff;
  font-family: inherit; outline: none; transition: all 0.2s ease;
}
.otp-box:focus { border-color: #225840; }
.otp-box.filled { border-color: #225840; }
.otp-box.otp-err { border-color: #ef4444; background: #fef2f2; }

.timeline-day:hover { border-color: rgba(45,106,79,0.6) !important; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: #0a0f0a; }
::-webkit-scrollbar-thumb { background: #2d6a4f; border-radius: 3px; }

/* ── Landing page ── */
.anim { opacity:0; transform:translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
.anim.animate-in { opacity:1; transform:translateY(0); }

.lp-benefit-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.lp-benefit-card:hover { transform: translateY(-6px) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important; }
.lp-step-card { transition: transform 0.3s ease; }
.lp-step-card:hover { transform: translateY(-4px) !important; }
.lp-testimonial { transition: transform 0.22s ease, box-shadow 0.22s ease; }
.lp-testimonial:hover { transform: translateY(-3px) !important; box-shadow: 0 16px 48px rgba(0,0,0,0.08) !important; }

@media (max-width: 768px) {
  .hero-grid { grid-template-columns: 1fr !important; }
  .hero-headline-line { font-size: 40px !important; }
  .grid-3col { grid-template-columns: 1fr !important; }
  .lp-section-pad { padding: 60px 24px !important; }
  .hero-inner { padding: 80px 24px 40px !important; }
  .landing-tablet { max-width: 320px !important; }
}

/* ══ PREMIUM LANDING ══ */
:root {
  --cream: #faf6f1;
  --ink: #0d0d0b;
  --forest: #1c4a32;
  --forest-mid: #2a6647;
  --sage: #4a8c64;
  --gold: #b8920a;
  --gold-light: #e8c84a;
  --warm-grey: #8a8680;
  --border: rgba(28,74,50,0.12);
}
@keyframes grain {
  0%,100%{transform:translate(0,0)}10%{transform:translate(-2%,-3%)}
  20%{transform:translate(3%,2%)}30%{transform:translate(-1%,4%)}
  40%{transform:translate(4%,-1%)}50%{transform:translate(-3%,3%)}
  60%{transform:translate(2%,-4%)}70%{transform:translate(-4%,1%)}
  80%{transform:translate(3%,-2%)}90%{transform:translate(-1%,3%)}
}
@keyframes float-slow {
  0%,100%{transform:translateY(0px) rotate(0deg);}
  33%{transform:translateY(-12px) rotate(1deg);}
  66%{transform:translateY(-6px) rotate(-0.5deg);}
}
@keyframes reveal-up {
  from{opacity:0;transform:translateY(40px);}
  to{opacity:1;transform:translateY(0);}
}
@keyframes reveal-left {
  from{opacity:0;transform:translateX(-30px);}
  to{opacity:1;transform:translateX(0);}
}
@keyframes shimmer {
  0%{background-position:-200% center;}
  100%{background-position:200% center;}
}
@keyframes line-draw {
  from{width:0;}to{width:98%;}
}
@keyframes ticker {
  from{transform:translateX(0);}
  to{transform:translateX(-50%);}
}
@keyframes morph {
  0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%;}
  25%{border-radius:40% 60% 70% 30%/40% 70% 30% 60%;}
  50%{border-radius:30% 70% 40% 60%/50% 40% 60% 50%;}
  75%{border-radius:70% 30% 60% 40%/30% 60% 40% 70%;}
}
.lp-root{min-height:100vh;background:var(--cream);font-family:'DM Sans',sans-serif;overflow-x:hidden;}
.grain-overlay{position:fixed;inset:-200%;width:400%;height:400%;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
  pointer-events:none;z-index:9997;animation:grain 8s steps(2) infinite;opacity:0.4;}
.lp-nav{position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 48px;background:rgba(250,246,241,0.88);
  backdrop-filter:blur(16px);border-bottom:1px solid var(--border);}
.lp-nav-logo{font-family:'Cormorant Garamond',serif;font-size:15px;
  font-weight:700;color:var(--forest);letter-spacing:0.04em;}
.lp-nav-pill{background:var(--forest);color:#fff;font-size:11px;
  font-weight:600;padding:6px 16px;border-radius:50px;
  letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;
  transition:background 0.2s ease,transform 0.2s ease;border:none;}
.lp-nav-pill:hover{background:var(--forest-mid);transform:translateY(-1px);}
.lp-hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;
  align-items:center;padding:100px 48px 60px;gap:60px;
  max-width:1280px;margin:0 auto;position:relative;}
.lp-eyebrow{display:inline-flex;align-items:center;gap:8px;
  font-size:11px;font-weight:600;letter-spacing:0.14em;
  text-transform:uppercase;color:var(--sage);margin-bottom:28px;
  opacity:0;animation:reveal-left 0.7s 0.2s ease forwards;}
.lp-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);}
.lp-headline{font-family:'Cormorant Garamond',serif;
  font-size:clamp(42px,4.5vw,68px);font-weight:900;line-height:1.06;
  color:var(--ink);margin-bottom:8px;
  opacity:0;animation:reveal-up 0.8s 0.35s ease forwards;}
.lp-headline-accent{font-family:'Cormorant Garamond',serif;
  font-size:clamp(42px,4.5vw,68px);font-weight:900;line-height:1.06;
  font-style:italic;color:var(--forest);display:block;margin-bottom:24px;
  opacity:0;animation:reveal-up 0.8s 0.45s ease forwards;}
.lp-subtext{font-size:15px;line-height:1.8;color:var(--warm-grey);
  max-width:480px;margin-bottom:36px;
  opacity:0;animation:reveal-up 0.8s 0.6s ease forwards;}
.lp-cta-group{display:flex;flex-direction:column;gap:14px;
  opacity:0;animation:reveal-up 0.8s 0.75s ease forwards;}
.lp-cta-primary{position:relative;overflow:hidden;
  display:inline-flex;align-items:center;gap:12px;
  background:var(--forest);color:#fff;font-size:16px;font-weight:600;
  padding:18px 36px;border-radius:4px;border:none;cursor:pointer;
  width:fit-content;letter-spacing:0.01em;font-family:'DM Sans',sans-serif;
  transition:transform 0.25s ease,box-shadow 0.25s ease;
  box-shadow:0 8px 32px rgba(28,74,50,0.28);}
.lp-cta-primary::before{content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);
  background-size:200% 100%;animation:shimmer 3s ease infinite;}
.lp-cta-primary:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(28,74,50,0.35);}
.lp-cta-arrow{width:32px;height:32px;border-radius:50%;
  background:rgba(255,255,255,0.15);display:flex;
  align-items:center;justify-content:center;font-size:16px;
  transition:transform 0.2s ease;}
.lp-cta-primary:hover .lp-cta-arrow{transform:translateX(3px);}
.lp-trust-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.lp-avatars{display:flex;}
.lp-avatar{width:32px;height:32px;border-radius:50%;
  border:2px solid var(--cream);font-size:11px;font-weight:700;
  display:flex;align-items:center;justify-content:center;
  margin-left:-8px;position:relative;}
.lp-avatar:first-child{margin-left:0;}
.lp-trust-text{font-size:12px;color:var(--warm-grey);}
.lp-stars{color:var(--gold);font-size:13px;}
.lp-hero-right{opacity:0;animation:reveal-up 0.9s 0.5s ease forwards;}
.lp-stat-card{background:#fff;border:1px solid var(--border);
  border-radius:16px;padding:32px;
  box-shadow:0 24px 64px rgba(0,0,0,0.06);position:relative;}
.lp-stat-card-label{font-size:11px;font-weight:700;letter-spacing:0.12em;
  text-transform:uppercase;color:var(--warm-grey);margin-bottom:24px;}
.lp-big-stat{font-family:'Cormorant Garamond',serif;
  font-size:72px;font-weight:900;line-height:1;color:var(--forest);margin-bottom:4px;}
.lp-big-stat-label{font-size:12px;color:var(--warm-grey);
  margin-bottom:24px;letter-spacing:0.06em;text-transform:uppercase;}
.lp-stat-bar{width:100%;height:6px;background:#f0f0ee;
  border-radius:3px;margin-bottom:4px;overflow:hidden;}
.lp-stat-bar-fill{height:100%;
  background:linear-gradient(90deg,var(--forest),var(--sage));
  border-radius:3px;width:0%;transition:width 1.8s 0.5s ease;}
.lp-mini-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px;}
.lp-mini-stat{background:var(--cream);border-radius:10px;padding:16px;}
.lp-mini-stat-num{font-family:'Cormorant Garamond',serif;
  font-size:26px;font-weight:700;color:var(--ink);}
.lp-mini-stat-label{font-size:11px;color:var(--warm-grey);margin-top:2px;line-height:1.4;}
.lp-blob{position:absolute;width:420px;height:420px;
  background:radial-gradient(circle at 40% 40%,rgba(74,140,100,0.07),transparent 70%);
  border-radius:60% 40% 30% 70%/60% 30% 70% 40%;
  animation:morph 12s ease-in-out infinite,float-slow 8s ease-in-out infinite;
  pointer-events:none;z-index:0;}
.lp-ticker-wrap{background:var(--forest);padding:13px 0;overflow:hidden;}
.lp-ticker{display:flex;width:max-content;animation:ticker 22s linear infinite;}
.lp-ticker-item{display:flex;align-items:center;white-space:nowrap;}
.lp-ticker-text{font-size:12px;font-weight:600;color:rgba(255,255,255,0.8);
  padding:0 32px;letter-spacing:0.05em;text-transform:uppercase;}
.lp-ticker-dot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.3);flex-shrink:0;}
.lp-benefits{padding:100px 48px;max-width:1280px;margin:0 auto;}
.lp-section-eyebrow{font-size:11px;font-weight:700;letter-spacing:0.14em;
  text-transform:uppercase;color:var(--sage);text-align:center;margin-bottom:16px;}
.lp-section-title{font-family:'Cormorant Garamond',serif;
  font-size:clamp(36px,3.5vw,52px);font-weight:900;line-height:1.1;
  text-align:center;color:var(--ink);margin-bottom:8px;}
.lp-section-title em{font-style:italic;color:var(--forest);}
.lp-section-sub{text-align:center;font-size:15px;color:var(--warm-grey);
  line-height:1.75;max-width:520px;margin:0 auto 64px;}
.lp-benefits-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
.lp-benefit-card{background:#fff;border:1px solid var(--border);
  border-radius:12px;padding:36px 32px;position:relative;overflow:hidden;
  transition:transform 0.3s ease,box-shadow 0.3s ease;cursor:default;}
.lp-benefit-card:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(0,0,0,0.08);}
.lp-benefit-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--forest),var(--sage));
  transform:scaleX(0);transform-origin:left;transition:transform 0.4s ease;}
.lp-benefit-card:hover::before{transform:scaleX(1);}
.lp-benefit-num{font-family:'Cormorant Garamond',serif;font-size:52px;
  font-weight:900;color:rgba(0,0,0,0.05);line-height:1;margin-bottom:16px;}
.lp-benefit-title{font-size:18px;font-weight:700;color:var(--ink);
  margin-bottom:10px;font-family:'DM Sans',sans-serif;}
.lp-benefit-body{font-size:14px;color:var(--warm-grey);line-height:1.75;}
.lp-testimonials{background:var(--ink);padding:100px 48px;}
.lp-testimonials-inner{max-width:1280px;margin:0 auto;}
.lp-testimonials-title{font-family:'Cormorant Garamond',serif;
  font-size:clamp(32px,3vw,48px);font-weight:900;color:#fff;
  text-align:center;margin-bottom:60px;line-height:1.15;}
.lp-testimonials-title em{color:#e8c84a;font-style:italic;}
.lp-testi-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;}
.lp-testi-card{background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.08);
  border-radius:12px;padding:32px;
  transition:background 0.3s ease,transform 0.3s ease;}
.lp-testi-card:hover{background:rgba(255,255,255,0.07);transform:translateY(-4px);}
.lp-testi-quote{font-size:13px;color:rgba(255,255,255,0.75);
  line-height:1.8;margin-bottom:24px;font-style:italic;}
.lp-testi-author{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.lp-testi-avatar{width:40px;height:40px;border-radius:50%;font-size:14px;
  font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.lp-testi-name{font-size:13px;font-weight:700;color:#fff;}
.lp-testi-role{font-size:11px;color:rgba(255,255,255,0.45);margin-top:1px;}
.lp-testi-badge{margin-left:auto;background:rgba(74,140,100,0.25);
  color:rgba(160,220,160,0.9);font-size:11px;font-weight:700;
  padding:4px 10px;border-radius:20px;flex-shrink:0;}
.lp-final-cta{padding:120px 48px;text-align:center;
  background:var(--cream);position:relative;overflow:hidden;}
.lp-final-cta-inner{max-width:640px;margin:0 auto;position:relative;z-index:1;}
.lp-final-headline{font-family:'Cormorant Garamond',serif;
  font-size:clamp(36px,4vw,56px);font-weight:900;
  line-height:1.1;color:var(--ink);margin-bottom:12px;}
.lp-final-headline em{font-style:italic;color:var(--forest);}
.lp-final-sub{font-size:15px;color:var(--warm-grey);line-height:1.75;margin-bottom:40px;}
.lp-final-cta-bg{position:absolute;width:600px;height:600px;
  background:radial-gradient(circle,rgba(28,74,50,0.06) 0%,transparent 70%);
  border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;}
@media (max-width: 1024px) {
  .lp-hero { grid-template-columns: 1fr !important; padding: 88px 40px 60px !important; gap: 48px !important; min-height: auto !important; }
  .lp-hero-right { max-width: 560px !important; margin: 0 auto !important; width: 100% !important; }
  .lp-nav { padding: 16px 32px !important; }
  .lp-benefits-grid { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
  .lp-testi-grid { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
  .lp-benefits { padding: 80px 40px !important; }
  .lp-testimonials { padding: 80px 40px !important; }
  .lp-final-cta { padding: 80px 40px !important; }
}
@media (max-width: 768px) {
  .lp-hero { grid-template-columns: 1fr !important; padding: 80px 24px 48px !important; gap: 40px !important; }
  .lp-hero-right { display: none !important; }
  .lp-nav { padding: 14px 20px !important; }
  .lp-nav-logo { font-size: 13px !important; }
  .lp-headline { font-size: 36px !important; line-height: 1.1 !important; }
  .lp-headline-accent { font-size: 36px !important; line-height: 1.1 !important; }
  .lp-subtext { font-size: 15px !important; }
  .lp-cta-primary { width: 100% !important; justify-content: center !important; font-size: 15px !important; padding: 16px 24px !important; }
  .lp-benefits { padding: 60px 24px !important; }
  .lp-benefits-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
  .lp-benefit-card { padding: 28px 24px !important; }
  .lp-section-title { font-size: 32px !important; }
  .lp-testimonials { padding: 60px 24px !important; }
  .lp-testi-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
  .lp-testi-card { padding: 24px !important; }
  .lp-final-cta { padding: 60px 24px !important; }
  .lp-final-headline { font-size: 32px !important; }
  .lp-ticker-text { font-size: 11px !important; padding: 0 20px !important; }
}
@media (max-width: 480px) {
  .lp-hero { padding: 72px 20px 40px !important; }
  .lp-nav { padding: 12px 16px !important; }
  .lp-eyebrow { font-size: 10px !important; }
  .lp-headline { font-size: 30px !important; }
  .lp-headline-accent { font-size: 30px !important; }
  .lp-subtext { font-size: 14px !important; line-height: 1.7 !important; }
  .lp-cta-primary { font-size: 14px !important; padding: 15px 20px !important; }
  .lp-trust-text { font-size: 11px !important; }
  .lp-benefits { padding: 48px 20px !important; }
  .lp-section-title { font-size: 26px !important; }
  .lp-section-sub { font-size: 14px !important; }
  .lp-benefit-card { padding: 24px 20px !important; }
  .lp-benefit-title { font-size: 16px !important; }
  .lp-benefit-body { font-size: 13px !important; }
  .lp-testimonials { padding: 48px 20px !important; }
  .lp-testimonials-title { font-size: 26px !important; }
  .lp-testi-quote { font-size: 12px !important; }
  .lp-testi-card { padding: 20px !important; }
  .lp-final-cta { padding: 48px 20px !important; }
  .lp-final-headline { font-size: 26px !important; }
  .lp-final-sub { font-size: 13px !important; }
  .quiz-title { font-size: 22px !important; line-height: 1.25 !important; }
  .quiz-sub { font-size: 14px !important; }
  .qopt { padding: 14px 16px !important; margin-bottom: 8px !important; }
  .qopt span { font-size: 15px !important; }
  .scale-btn { height: 52px !important; font-size: 18px !important; }
  .gbtn { padding: 16px 24px !important; font-size: 16px !important; }
  .dot-cur { width: 8px !important; height: 8px !important; }
  .site-header-logo-text { display: none !important; }
  .site-header-tag { display: none !important; }
  .email-screen-inner { padding: 72px 20px 40px !important; }
}
@media (max-width: 768px) and (orientation: landscape) {
  .lp-hero { min-height: auto !important; padding: 70px 32px 40px !important; }
  .lp-headline { font-size: 28px !important; }
  .lp-headline-accent { font-size: 28px !important; margin-bottom: 16px !important; }
  .lp-subtext { font-size: 13px !important; margin-bottom: 24px !important; }
}
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .lp-hero { grid-template-columns: 1fr 1fr !important; padding: 88px 40px 60px !important; min-height: 100vh !important; }
  .lp-hero-right { display: block !important; }
  .lp-headline { font-size: 40px !important; }
  .lp-headline-accent { font-size: 40px !important; }
  .lp-benefits-grid { grid-template-columns: repeat(3,1fr) !important; }
  .lp-testi-grid { grid-template-columns: 1fr 1fr !important; }
}
@media (hover: none) and (pointer: coarse) {
  .qopt { min-height: 56px !important; }
  .gbtn { min-height: 52px !important; }
  .scale-btn { min-height: 52px !important; }
  .lp-cta-primary { min-height: 52px !important; }
  .lp-nav-pill { min-height: 40px !important; padding: 10px 18px !important; }
}
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; scroll-behavior: smooth; }
* { -webkit-tap-highlight-color: rgba(28,74,50,0.1); }

/* ── Quiz options 2-column grid on desktop ── */
.qopt-grid { display: flex; flex-direction: column; }
@media (min-width: 768px) {
  .qopt-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
  .qopt-grid .qopt { margin-bottom: 0 !important; }
}
@media (max-width: 767px) {
  .qopt-grid { display: flex !important; flex-direction: column !important; }
}
/* Quiz content area responsive */
@media (max-width: 767px) {
  .quiz-content-area { max-width: 640px !important; padding: 120px 20px 100px !important; }
}
`

/* ─── Site Header (start / quiz / email / otp) ─── */
function SiteHeader({ screen, currentQ }: { screen: string; currentQ: number }) {
  const isQuiz = screen === 'quiz'
  const allDone = screen === 'email'

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '12px 40px 10px', gap: 8,
    }}>
      {/* Logo centered */}
      <Image src="/logo-the5th.png" alt="The5th Consulting" width={240} height={54} style={{ objectFit: 'contain' }} />

      {/* Progress dots + tag row */}
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1, position: 'relative', height: 10 }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#e0e0e0', transform: 'translateY(-50%)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            {questions.map((_, i) => {
              const done = allDone || (isQuiz && i < currentQ)
              const cur = isQuiz && i === currentQ
              return (
                <div
                  key={i}
                  className={cur ? 'dot-cur' : ''}
                  style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: done ? '#225840' : cur ? '#B0902F' : '#fff',
                    border: `2px solid ${done ? '#225840' : cur ? '#B0902F' : '#e0e0e0'}`,
                    transition: 'background 0.3s ease, border-color 0.3s ease',
                  }}
                />
              )
            })}
          </div>
        </div>
        <div className="site-header-tag" style={{
          fontSize: 13, color: '#999', whiteSpace: 'nowrap', flexShrink: 0,
          visibility: isQuiz ? 'hidden' : 'visible',
        }}>
          Free · 3 min quiz
        </div>
      </div>
    </header>
  )
}

/* ─── Footer (landing page only) ─── */
function Footer() {
  return (
    <footer style={{ background: '#0a1a0f', padding: '60px 40px 40px' }}>
      <div style={{ width: '100%', textAlign: 'center', fontSize: 'clamp(64px, 12vw, 140px)', fontWeight: 900, color: '#fff', letterSpacing: '-4px', lineHeight: 1, marginBottom: 40 }}>
        THE5TH CONSULTING
      </div>
      <div style={{ height: 1, background: '#225840', marginBottom: 28 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontSize: 14, color: '#aaa' }}>© 2026 The5th Consulting. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {['Privacy Policy', 'Data Usage', 'Contact'].map(link => (
            <a
              key={link}
              href="#"
              style={{ fontSize: 14, color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

/* ─── AnimateOnScroll ─── */
function AnimateOnScroll({ children, delay = 0, style: extraStyle }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ ...extraStyle, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms, transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms` }}>
      {children}
    </div>
  )
}

/* ─── TabletMockup ─── */
function TabletMockup() {
  const days = [
    { label: 'Day 1', title: 'Clarity & Positioning', done: true },
    { label: 'Day 2', title: 'Define Your Offer', done: false },
    { label: 'Day 3', title: 'Find Your First Lead', done: false },
  ]
  return (
    <div style={{ display: 'block', margin: '40px auto', width: 480 }}>
      {/* Tablet frame */}
      <div className="tablet-float" style={{ background: '#1a1a1a', borderRadius: 24, padding: 12, boxShadow: '0 30px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#333' }} />
        </div>
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: '#225840', padding: '14px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '.06em', textTransform: 'uppercase' }}>Your 15-Day Roadmap</div>
          </div>
          {days.map(({ label, title, done }, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', background: done ? '#f6faf7' : '#fff' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#225840', marginBottom: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', marginBottom: 8 }}>{title}</div>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, flexShrink: 0, background: done ? '#225840' : 'transparent', border: `1.5px solid ${done ? '#225840' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done && <span style={{ fontSize: 8, color: '#fff', lineHeight: 1 }}>✓</span>}
                  </div>
                  <div style={{ height: 7, background: done ? '#d1fae5' : '#f0f0f0', borderRadius: 4, flex: 1 }} />
                </div>
              ))}
            </div>
          ))}
          <div style={{ padding: '12px 20px', background: '#fef9ec', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 10, color: '#B0902F', fontWeight: 700, whiteSpace: 'nowrap' }}>Day 1 of 15</div>
            <div style={{ height: 4, background: '#f0e0a0', borderRadius: 2, flex: 1 }}>
              <div style={{ height: '100%', background: '#B0902F', borderRadius: 2, width: '7%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── BrowserMockup (Step 1) ─── */
function BrowserMockup() {
  return (
    <div style={{ border: '2px solid #e0e0e0', borderRadius: 12, overflow: 'hidden', background: '#fff', maxWidth: 280, margin: '0 auto' }}>
      <div style={{ background: '#f5f5f5', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: '#e8e8e8', borderRadius: 5, height: 17, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
          <span style={{ fontSize: 8, color: '#888' }}>10kroadmap.org</span>
        </div>
      </div>
      <div style={{ background: '#f9f9f9', padding: '14px 12px' }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
          {Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i <= 1 ? '#225840' : '#e0e0e0' }} />)}
        </div>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0a0a0a', textAlign: 'center', marginBottom: 10, lineHeight: 1.4 }}>Where are you in your coaching business?</div>
        {['Just starting out 🌱', 'Have some clients 🚀', 'Ready to scale 📈'].map((opt, i) => (
          <div key={opt} style={{ background: '#fff', border: `1.5px solid ${i === 0 ? '#225840' : '#e0e0e0'}`, borderRadius: 6, padding: '6px 10px', marginBottom: 5, fontSize: 8.5, color: i === 0 ? '#225840' : '#555', fontWeight: i === 0 ? 600 : 400 }}>
            {opt}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── PhoneMockup (Step 2) ─── */
function PhoneMockup() {
  return (
    <div style={{ width: 160, margin: '0 auto' }}>
      <div style={{ background: '#1a1a1a', borderRadius: 22, padding: '10px 8px', position: 'relative', boxShadow: '0 12px 30px rgba(0,0,0,0.18)' }}>
        <div style={{ position: 'absolute', right: -3, top: 48, width: 3, height: 20, background: '#2a2a2a', borderRadius: '0 3px 3px 0' }} />
        <div style={{ position: 'absolute', left: -3, top: 40, width: 3, height: 16, background: '#2a2a2a', borderRadius: '3px 0 0 3px' }} />
        <div style={{ position: 'absolute', left: -3, top: 62, width: 3, height: 16, background: '#2a2a2a', borderRadius: '3px 0 0 3px' }} />
        <div style={{ width: 40, height: 4, background: '#000', borderRadius: 3, margin: '0 auto 8px' }} />
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ background: '#225840', padding: '7px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#fff' }}>Your Roadmap is Ready ✓</div>
          </div>
          {['Day 1: Clarity & Positioning', 'Day 2: Define Your Offer', 'Day 3: Find Your First Lead'].map((d, i) => (
            <div key={i} style={{ padding: '6px 10px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: i === 0 ? '#225840' : '#e0e0e0', flexShrink: 0 }} />
              <span style={{ fontSize: 7.5, color: '#0a0a0a', fontWeight: 500 }}>{d}</span>
            </div>
          ))}
          <div style={{ padding: '6px 10px', background: '#fef9ec' }}>
            <div style={{ height: 3, background: '#f0e0a0', borderRadius: 2, marginBottom: 4 }}>
              <div style={{ width: '7%', height: '100%', background: '#B0902F', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 7, color: '#B0902F', fontWeight: 600 }}>Day 1 of 15</div>
          </div>
          <div style={{ padding: '8px 10px' }}>
            <div style={{ background: 'linear-gradient(135deg,#225840,#2d6a4f)', borderRadius: 6, padding: '7px 10px', textAlign: 'center' }}>
              <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>View Day 1 →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── ChatMockup (Step 3) ─── */
function ChatMockup() {
  return (
    <div style={{ border: '7px solid #1a1a1a', borderRadius: 18, overflow: 'hidden', maxWidth: 280, margin: '0 auto', background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.14)' }}>
      <div style={{ background: '#225840', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>🤖</div>
        <div>
          <div style={{ fontSize: 8.5, fontWeight: 700, color: '#fff' }}>AI Coach</div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.6)' }}>Online</div>
        </div>
      </div>
      <div style={{ padding: '10px 10px', background: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ maxWidth: '85%' }}>
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '10px 10px 10px 2px', padding: '6px 9px', fontSize: 7.5, color: '#333', lineHeight: 1.55 }}>
            Great work on Day 3! Your next step is to reach out to 5 warm contacts using the DM script I&apos;m sending you today...
          </div>
        </div>
        <div style={{ maxWidth: '80%', alignSelf: 'flex-end' }}>
          <div style={{ background: '#225840', borderRadius: '10px 10px 2px 10px', padding: '6px 9px', fontSize: 7.5, color: '#fff', lineHeight: 1.55 }}>
            Done! Got 2 responses already 🎉
          </div>
        </div>
        <div style={{ maxWidth: '85%' }}>
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '10px 10px 10px 2px', padding: '6px 9px', fontSize: 7.5, color: '#333', lineHeight: 1.55 }}>
            That&apos;s amazing! Here&apos;s exactly what to say next...
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── LandingTabletMockup ─── */
function LandingTabletMockup() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) setVisible(true) }) },
      { threshold: [0, 0.25, 0.5, 0.75, 1.0] }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const sidebarDays = [
    { day: 1, label: 'Clarity & Positioning', done: true, current: false, locked: false },
    { day: 2, label: 'Define Your Offer', done: true, current: false, locked: false },
    { day: 3, label: 'First Outreach', done: true, current: false, locked: false },
    { day: 4, label: 'Build Outreach System', done: false, current: true, locked: false },
    { day: 5, label: 'Content Strategy', done: false, current: false, locked: true },
    { day: 6, label: 'Sales Framework', done: false, current: false, locked: true },
    { day: 7, label: 'Pricing Confidence', done: false, current: false, locked: true },
    { day: 8, label: 'Client Conversion', done: false, current: false, locked: true },
  ]
  const taskItems = [
    { task: 'Identify 10 warm leads in your network', done: true },
    { task: 'Write your personalized DM script', done: true },
    { task: 'Send your first 3 outreach messages', done: false },
  ]

  return (
    <div
      ref={ref}
      className="landing-tablet"
      style={{
        maxWidth: 1000, margin: '0 auto',
        transition: 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1s ease',
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(40px)',
        opacity: visible ? 1 : 0.3,
      }}
    >
      <div style={{ background: '#111', borderRadius: 20, padding: 16, boxShadow: '0 60px 120px rgba(0,0,0,0.3)' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#333', margin: '0 auto 10px' }} />
        <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden' }}>
          {/* Nav bar */}
          <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="10" height="12" viewBox="0 0 32 36" fill="none">
                <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 14 21 10 21 10C21 10 20 14 18 16C17 17 16 17 16 17C16 17 18 13 16 2Z" fill="#2d6a4f"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#225840' }}>The5th</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, background: '#fef9ec', color: '#B0902F', padding: '3px 8px', borderRadius: 10 }}>Day 3 of 15</span>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e8d5b7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>A</div>
            </div>
          </div>
          {/* Main content */}
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, minHeight: 320 }}>
            {/* Sidebar */}
            <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>15-DAY ROADMAP</div>
              {sidebarDays.map(({ day, label, done, current, locked }) => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 28, borderRadius: 6, padding: '0 6px', marginBottom: 2, background: done ? '#e8f5ee' : 'transparent', border: current ? '1.5px solid #B0902F' : 'none' }}>
                  <span style={{ fontSize: 9, color: done ? '#225840' : current ? '#B0902F' : '#aaa', fontWeight: 700, flexShrink: 0 }}>{done ? '✓' : locked ? '🔒' : '→'}</span>
                  <span style={{ fontSize: 9, color: done ? '#225840' : current ? '#B0902F' : '#bbb', fontWeight: current ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 9, color: '#888' }}>3 of 15 complete</div>
              <div style={{ height: 3, background: '#f0f0f0', borderRadius: 2, marginTop: 4 }}>
                <div style={{ width: '20%', height: '100%', background: '#225840', borderRadius: 2 }} />
              </div>
            </div>
            {/* Main panel */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#B0902F', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>TODAY&apos;S MISSION</div>
              <div style={{ background: 'white', borderRadius: 12, padding: 16, borderLeft: '4px solid #B0902F', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>Day 4: Build Your Outreach System</div>
                {taskItems.map(({ task, done }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: done ? '#225840' : 'transparent', border: `1.5px solid ${done ? '#225840' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {done && <span style={{ fontSize: 7, color: '#fff' }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 10, color: done ? '#aaa' : '#333', textDecoration: done ? 'line-through' : 'none' }}>{task}</span>
                  </div>
                ))}
                <div style={{ marginTop: 10, background: '#B0902F', color: 'white', borderRadius: 6, padding: '6px 12px', fontSize: 10, fontWeight: 600, textAlign: 'center' }}>Complete Today</div>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#333', marginBottom: 8 }}>$0 of $10,000</div>
                <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, marginBottom: 8 }}>
                  <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #225840, #4a9a6a)', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, color: '#225840', fontWeight: 600 }}>Log Today&apos;s Revenue +</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Landing page data ─── */
const LP_TICKER = ['Niche Clarity','Signature Offer','Pricing Strategy','7-Day Content Plan','30-Day Roadmap','Lead Magnet','Digital Product','AI Coaching']

const LP_BENEFITS = [
  { num:'01', title:'Your $10K Personalised Blueprint',
    body:'20 answers analysed against 2,400 real coaching profiles. Your niche, your offer, your pricing, your 30-day plan. Not a template. Not recycled advice. Yours.' },
  { num:'02', title:'7 Days of AI Coaching Emails',
    body:'For a week after your assessment, The5th AI sends you one coaching email a day written from your exact answers. Real homework. Real strategies. It reads like someone who actually knows your situation — because it does.' },
  { num:'03', title:'Your Personalised Video',
    body:'Based on where you are in your business journey, we created a short video speaking directly to your stage. Not a webinar replay. Just the one thing you probably need to hear right now.' },
]

const LP_TESTIMONIALS = [
  { quote:'After a failed launch I had lost confidence completely. We rebuilt the strategy, repositioned my pricing from $79 to $225, and within three months generated $26,000 in revenue. I still find that number hard to believe.',
    name:'Laurie Gerber', role:'Online Course Creator', badge:'$26K in 3 months', init:'L', bg:'#2a5c3a' },
  { quote:'I had spoken to multiple agencies before finding Indrodip. None delivered. Within one month I became an Amazon bestselling author. I honestly did not think it would happen that fast.',
    name:'Abbas Jamie', role:'Author and Speaker', badge:'Bestselling Author', init:'A', bg:'#3a3a5c' },
  { quote:'I had spent over $10,000 on coaches before working with Indrodip. None gave me the clarity he did. He rebuilt how I saw my business from niche to offer to the sales conversation. Six weeks later I closed my first client.',
    name:'Jeanne Tomasak', role:'Business Coach', badge:'First client in 6 weeks', init:'J', bg:'#5c3a3a' },
  { quote:'Twenty years running education programs across the UK. I burned through $25,000 on coaches who did not get my context. Two months with Indrodip and I closed my first $2,500 sale. For someone who had nearly given up, that meant everything.',
    name:'Angela Gregg', role:'Education Director', badge:'$2,500 first sale', init:'G', bg:'#3a5c4a' },
]

const LP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=Caveat:wght@400;600;700&display=swap');

@keyframes redpulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

/* ─── reset for landing ─── */
.qp *,.qp *::before,.qp *::after{box-sizing:border-box;margin:0;padding:0;}
.qp{font-family:'DM Sans',sans-serif;color:#111;overflow-x:hidden;}

/* ─── nav ─── */
.qp-nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;
  justify-content:center;padding:20px 60px;
  background:rgba(61,38,69,0.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
.qp-logo{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:700;
  color:#fff;letter-spacing:.04em;}
.qp-nav-btn{background:linear-gradient(180deg,#E4C879,#C9A84C 60%,#B0902F);color:#2E1A35;font-family:'DM Sans',sans-serif;
  font-size:13px;font-weight:700;padding:10px 24px;border-radius:50px;
  border:none;cursor:pointer;letter-spacing:.03em;transition:transform .2s,box-shadow .2s;
  box-shadow:0 4px 14px rgba(201,168,76,.4);}
.qp-nav-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,.5);}

/* ─── hero ─── */
.qp-hero{background:#3D2645;position:relative;overflow:visible;
  padding:120px 40px 0;text-align:center;}
.qp-hero-grain{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:.055;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
.qp-hero-inner{width:100%;max-width:1100px;padding:0 40px;margin:0 auto;position:relative;z-index:1;}
.qp-annotation{font-family:'Caveat',cursive;font-size:22px;font-weight:600;
  color:rgba(255,255,255,.82);display:flex;align-items:center;
  justify-content:center;gap:8px;margin-bottom:6px;}
.qp-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(52px,8vw,96px);
  font-weight:900;line-height:1.0;color:#fff;letter-spacing:-2px;margin-bottom:24px;}
.qp-hero-sub{font-size:18px;line-height:1.75;color:rgba(255,255,255,.75);
  max-width:520px;margin:0 auto 40px;}
.qp-btn-gold{display:inline-flex;align-items:center;justify-content:center;
  background:linear-gradient(180deg,#E4C879,#C9A84C 60%,#B0902F);color:#2E1A35;font-family:'DM Sans',sans-serif;font-size:16px;
  font-weight:700;padding:18px 48px;border-radius:50px;border:none;cursor:pointer;
  letter-spacing:.02em;box-shadow:0 8px 28px rgba(201,168,76,.4);
  transition:transform .25s,box-shadow .25s;}
.qp-btn-gold:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(201,168,76,.5);}
.qp-btn-ghost{display:inline-flex;align-items:center;justify-content:center;
  background:transparent;color:#fff;font-family:'DM Sans',sans-serif;font-size:16px;
  font-weight:700;padding:16px 48px;border-radius:50px;border:1.5px solid rgba(255,255,255,.5);
  cursor:pointer;letter-spacing:.02em;transition:all .25s;}
.qp-btn-ghost:hover{background:#fff;color:#2E1A35;border-color:#fff;transform:translateY(-2px);}
.qp-hero-graphic{display:block;width:100%;max-width:none;
  position:absolute;bottom:0;left:0;z-index:0;pointer-events:none;}

/* ─── archetypes section ─── */
.qp-arch-section{background:#fff;padding:180px 60px 100px;}
.qp-arch-inner{max-width:1200px;margin:0 auto;}
.qp-arch-top{text-align:center;margin-bottom:16px;}
.qp-arch-top-left{max-width:640px;margin:0 auto;}
.qp-arch-top-right{display:none;}
.qp-sect-h{font-family:'Cormorant Garamond',serif;font-size:clamp(36px,4.5vw,60px);
  font-weight:900;line-height:1.08;color:#111;margin-bottom:16px;}
.qp-sect-sub{font-size:16px;color:#555;line-height:1.8;max-width:560px;margin:0 auto 56px;text-align:center;}
.qp-arch-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:40px;margin-bottom:60px;}
.qp-arch-card{text-align:center;}
.qp-arch-img-wrap{height:200px;display:flex;align-items:flex-end;
  justify-content:center;margin-bottom:20px;}
.qp-arch-img{height:100%;width:auto;max-width:180px;object-fit:contain;display:block;}
.qp-arch-name{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;
  color:#111;margin-bottom:8px;}
.qp-arch-desc{font-size:14px;color:#666;line-height:1.72;font-style:italic;}
.qp-arch-btn{text-align:center;}

/* ─── about section ─── */
.qp-about-section{background:#3D2645;position:relative;overflow:hidden;padding:100px 60px;}
.qp-about-grain{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:.055;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
.qp-about-inner{max-width:1000px;margin:0 auto;position:relative;z-index:1;}
.qp-about-h{font-family:'Cormorant Garamond',serif;font-size:clamp(36px,4vw,56px);
  font-weight:900;color:#fff;text-align:center;margin-bottom:56px;line-height:1.1;}
.qp-about-cards{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:56px;}
.qp-white-card{background:#fff;border-radius:20px;padding:40px 36px;}
.qp-card-h{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;
  color:#111;margin-bottom:24px;line-height:1.3;}
.qp-bullet-list{list-style:none;padding:0;margin:0;}
.qp-bullet-li{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px;}
.qp-bullet-star{color:#C9A84C;font-size:20px;flex-shrink:0;margin-top:1px;line-height:1;}
.qp-bullet-content{font-size:15px;color:#222;line-height:1.65;}
.qp-bullet-title{font-weight:700;display:block;margin-bottom:2px;}
.qp-step-num{width:26px;height:26px;border-radius:50%;background:#3D2645;
  color:#fff;font-size:13px;font-weight:700;display:inline-flex;
  align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;}
.qp-card-closing{font-size:14px;color:#555;line-height:1.7;
  margin-top:20px;padding-top:20px;border-top:1px solid #f0f0f0;font-style:italic;}
.qp-about-btn{text-align:center;}

/* ─── transition section ─── */
.qp-transition{background:#3D2645;padding:80px 40px;text-align:center;
  position:relative;overflow:hidden;}
.qp-transition-inner{max-width:900px;margin:0 auto;position:relative;}
.qp-transition-img{width:100%;max-width:700px;display:block;margin:0 auto;}
.qp-star-tl{position:absolute;top:24px;left:40px;font-size:42px;
  color:#fff;opacity:.22;line-height:1.1;pointer-events:none;}
.qp-star-tr{position:absolute;top:24px;right:40px;font-size:42px;
  color:#fff;opacity:.22;line-height:1.1;pointer-events:none;}
.qp-star-bl{position:absolute;bottom:24px;left:48px;font-size:28px;
  color:#fff;opacity:.18;pointer-events:none;}
.qp-star-br{position:absolute;bottom:24px;right:48px;font-size:28px;
  color:#fff;opacity:.18;pointer-events:none;}

/* ─── dark CTA ─── */
.qp-dark-cta{background:#1c4a32;padding:80px 60px;text-align:center;}
.qp-dark-inner{max-width:680px;margin:0 auto;}
.qp-btn-dark-gold{display:inline-flex;align-items:center;justify-content:center;
  background:#C9A84C;color:#111;font-family:'DM Sans',sans-serif;font-size:16px;
  font-weight:700;padding:18px 48px;border-radius:50px;border:none;cursor:pointer;
  letter-spacing:.02em;box-shadow:0 8px 28px rgba(232,184,75,.45);
  transition:transform .25s,box-shadow .25s;}
.qp-btn-dark-gold:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(232,184,75,.55);}
.qp-dark-annotation{font-family:'Caveat',cursive;font-size:22px;font-weight:600;
  color:rgba(255,255,255,.6);display:flex;align-items:center;
  justify-content:center;gap:8px;margin-bottom:8px;}
.qp-dark-h{font-family:'Cormorant Garamond',serif;font-size:clamp(32px,4.5vw,58px);
  font-weight:900;line-height:1.1;color:#fff;margin-bottom:44px;}

/* ─── footer ─── */
.qp-footer{background:#111;padding:60px 60px 40px;}
.qp-footer-top{display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:32px;margin-bottom:48px;}
.qp-footer-logo{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;
  color:#fff;letter-spacing:.04em;}
.qp-footer-avs{display:flex;align-items:center;}
.qp-footer-av{width:44px;height:44px;border-radius:50%;overflow:hidden;
  border:2px solid rgba(255,255,255,.15);margin-left:-10px;flex-shrink:0;}
.qp-footer-av:first-child{margin-left:0;}
.qp-footer-av img{width:100%;height:100%;object-fit:cover;display:block;
  filter:contrast(.9);}
.qp-footer-links{display:flex;gap:48px;flex-wrap:wrap;}
.qp-footer-col h4{font-size:12px;font-weight:700;color:rgba(255,255,255,.35);
  letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px;}
.qp-footer-col a{display:block;font-size:14px;color:rgba(255,255,255,.55);
  text-decoration:none;margin-bottom:8px;transition:color .2s;}
.qp-footer-col a:hover{color:#fff;}
.qp-footer-bottom{border-top:1px solid rgba(255,255,255,.08);
  padding-top:24px;font-size:13px;color:rgba(255,255,255,.3);}

/* ─── responsive ─── */
@media(max-width:1024px){
  .qp-nav{padding:16px 40px;}
  .qp-hero{padding:110px 32px 0;}
  .qp-h1{font-size:clamp(40px,5.5vw,58px) !important;}
  .qp-arch-section{padding:160px 40px 80px;}
  .qp-about-section{padding:80px 40px;}
  .qp-dark-cta{padding:64px 40px;}
  .qp-footer{padding:48px 40px 32px;}
}
@media(max-width:768px){
  .qp-nav{padding:14px 20px;}
  .qp-nav-btn{font-size:12px !important;padding:8px 16px !important;border-radius:20px !important;}
  .qp,.qp-nav-btn,.qp-btn-gold,.qp-btn-ghost,.qp-btn-dark-gold{cursor:pointer;}
  .qp-hero{padding:96px 20px 0;}
  .qp-hero-inner{text-align:center !important;width:100% !important;padding:0 20px !important;}
  .qp-h1{font-size:clamp(26px,7vw,36px) !important;font-weight:800 !important;line-height:1.15 !important;letter-spacing:normal !important;width:100% !important;max-width:100% !important;padding:0 16px !important;box-sizing:border-box !important;text-align:center !important;}
  .qp-hero-sub{font-size:15px !important;padding:0 20px !important;text-align:center !important;max-width:100% !important;}
  .qp-trust-line{font-size:12px !important;white-space:normal !important;word-break:break-word !important;line-height:1.9 !important;padding:0 16px !important;}
  .qp-hero-graphic{height:auto !important;object-fit:contain !important;}
  .qp-arch-section{padding:140px 20px 60px !important;}
  .qp-arch-top-right{display:none;}
  .qp-arch-grid{grid-template-columns:1fr !important;gap:20px !important;}
  .qp-arch-card{max-width:420px;margin:0 auto;}
  .qp-about-section{padding:60px 20px !important;}
  .qp-about-cards{grid-template-columns:1fr;gap:16px;}
  .qp-dark-cta{padding:40px 20px !important;}
  .qp-dark-h{font-size:clamp(24px,6vw,32px) !important;}
  .qp-btn-dark-gold{width:calc(100% - 40px) !important;font-size:14px !important;padding:16px 24px !important;}
  .qp-footer{padding:40px 20px 28px !important;}
  .qp-footer-top{flex-direction:column;align-items:flex-start;gap:24px;}
  .qp-footer-links{gap:24px;}
  .qp-btn-gold,.qp-btn-ghost{width:calc(100% - 40px) !important;font-size:14px !important;padding:16px 24px !important;}
}
@media(max-width:480px){
  .qp-hero-inner{text-align:center !important;width:100% !important;padding:0 16px !important;}
  .qp-h1{font-size:clamp(26px,7vw,36px) !important;font-weight:800 !important;line-height:1.15 !important;letter-spacing:normal !important;width:100% !important;max-width:100% !important;padding:0 16px !important;box-sizing:border-box !important;text-align:center !important;}
  .qp-arch-grid{grid-template-columns:1fr !important;gap:16px !important;}
  .qp-arch-img-wrap{height:150px;}
  .qp-white-card{padding:28px 22px;}
}

/* ─── Gelica headings ─── */
.qp-h1,.qp-sect-h,.qp-arch-name,.qp-about-h,.qp-card-h,.qp-dark-h{font-family:'Gelica',serif !important;}

/* ─── Social proof grid ─── */
.qp-proof-section{background:#faf9f7;padding:80px 60px;border-top:1px solid #f0ece6;margin-top:0;}
.qp-proof-inner{max-width:1100px;margin:0 auto;}
.qp-proof-heading{text-align:center;margin-bottom:48px;}
.qp-proof-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.qp-proof-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:20px 24px;}
.qp-proof-stars{color:#c9a84c;font-size:14px;margin-bottom:12px;}
.qp-proof-quote{font-size:14px;color:#555;line-height:1.72;}
@media(max-width:900px){.qp-proof-grid{grid-template-columns:repeat(2,1fr) !important;}}
@media(max-width:640px){
  .qp-proof-grid{grid-template-columns:1fr !important;gap:10px !important;}
  .qp-proof-card{padding:16px 18px !important;}
  .qp-proof-quote{font-size:14px !important;}
  .qp-proof-heading .qp-sect-h{font-size:clamp(24px,5vw,36px) !important;margin-bottom:32px !important;}
  .qp-proof-section{padding:60px 20px !important;}
}
`

/* ─── Annotation + arrow helper ─── */
function Annotation({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  const col = dark ? 'rgba(255,255,255,.62)' : 'rgba(255,255,255,.82)'
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:4 }}>
      <span style={{ fontFamily:"'Caveat',cursive", fontSize:22, fontWeight:600, color:col, lineHeight:1.2 }}>
        {children}
      </span>
      <svg width="28" height="32" viewBox="0 0 28 32" fill="none" style={{ marginTop:4 }}>
        <path d="M14 2 C14 2 22 10 20 22 C19 28 12 30 12 30" stroke={col} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 26 L12 31 L17 27" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function AnnotationRight({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
      <span style={{ fontFamily:"'Caveat',cursive", fontSize:20, fontWeight:600, color:'#555', textAlign:'right', lineHeight:1.3 }}>
        {children}
      </span>
      <svg width="32" height="28" viewBox="0 0 32 28" fill="none" style={{ transform:'rotate(90deg)' }}>
        <path d="M30 14 C30 14 18 6 8 12 C4 14 3 20 3 20" stroke="#888" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M6 14 L3 20 L9 22" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

/* ─── LandingPage component ─── */
function LandingPage({ onStart }: { onStart: () => void }) {
  const [prefersReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const [isMobile, setIsMobile] = React.useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* Section in-view */
  const archRef     = useRef<HTMLDivElement>(null)
  const archInView  = useInView(archRef,   { once: true, amount: 0.08 })
  const aboutRef    = useRef<HTMLDivElement>(null)
  const aboutInView = useInView(aboutRef,  { once: true, amount: 0.08 })
  const darkRef     = useRef<HTMLDivElement>(null)
  const darkInView  = useInView(darkRef,   { once: true, amount: 0.1 })

  const ease = [0.22, 1, 0.36, 1] as const
  const tr   = (d = 0) => prefersReduced ? { duration: 0 } : { duration: 0.65, delay: d, ease }
  const spr  = { type: 'spring' as const, stiffness: 260, damping: 24 }
  const up   = (d = 0) => ({
    initial: prefersReduced ? {} : { opacity: 0, y: 36 },
    animate: { opacity: 1, y: 0 },
    transition: tr(d),
  })

  const ARCHETYPES = [
    { img:'/illustrations/advocate.png',  name:'The Pioneer',    desc:"You thrive on action, momentum, and bold moves. Your challenge isn't starting — it's creating consistency and sustainable growth." },
    { img:'/illustrations/diplomat.png',  name:'The Pathfinder',  desc:"You're constantly learning and improving. Your next breakthrough comes from simplifying your expertise and creating a clear path for clients." },
    { img:'/illustrations/innovator.png', name:'The Builder',     desc:'You naturally think in systems, processes, and scalability. Your opportunity is building assets that grow beyond your direct involvement.' },
    { img:'/illustrations/confidant.png', name:'The Luminary',    desc:'People trust your expertise and naturally look to you for guidance. Your next level comes from turning influence into a predictable client acquisition system.' },
  ]

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }
    })
  }

  const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  }

  const staggerContainer: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 }
    }
  }

  const cardFadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
    }
  }

  return (
    <div className="qp">
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <style>{LP_CSS}</style>

      {/* ══ NAV ══ */}
      <motion.nav className="qp-nav" initial={{ y:-64, opacity:0 }} animate={{ y:0, opacity:1 }} transition={tr(0)}>
        <div className="qp-logo"><Image src="/logo-white2.png" alt="The5th Consulting" width={240} height={54} style={{ objectFit: 'contain' }} /></div>
      </motion.nav>

      {/* ══ HERO ══ */}
      <section className="qp-hero" style={{ paddingTop: isMobile ? '100px' : '120px', paddingBottom: isMobile ? '60px' : '220px', paddingLeft: isMobile ? '16px' : 'clamp(16px, 5vw, 48px)', paddingRight: isMobile ? '16px' : 'clamp(16px, 5vw, 48px)', overflow: 'hidden', position: 'relative' }}>
        <div className="qp-hero-grain" aria-hidden="true" />
        <div className="qp-hero-inner" style={{ position: 'relative', zIndex: 2 }}>

          <motion.div initial="hidden" animate="visible" variants={scaleIn}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:'28px'}}>
              <div style={{
                display:'inline-flex',
                alignItems:'center',
                gap:'10px',
                background:'#0f1117',
                border:'1px solid rgba(255,255,255,0.12)',
                borderRadius:'100px',
                padding:'8px 14px',
                boxShadow:'0 0 32px rgba(0,0,0,0.4)',
                maxWidth:'90vw',
              }}>
                <span style={{
                  width:'8px',
                  height:'8px',
                  borderRadius:'50%',
                  background:'#ef4444',
                  display:'inline-block',
                  boxShadow:'0 0 8px #ef4444, 0 0 20px rgba(239,68,68,0.8)',
                  animation:'redpulse 1.5s ease-in-out infinite',
                  flexShrink:0,
                }}></span>
                <span style={{
                  fontSize:'clamp(9px, 2.2vw, 11px)',
                  fontWeight:'700',
                  letterSpacing:'0.1em',
                  textTransform:'uppercase',
                  color:'#ffffff',
                  textAlign:'center',
                  maxWidth:'90vw',
                }}>NEW · The AI Assessment That Identifies Your Exact Growth Bottleneck In 5 Minutes</span>
              </div>
            </div>
          </motion.div>

          <motion.h1 className="qp-h1" initial="hidden" animate="visible" variants={fadeUp} custom={1} style={{
            fontSize: isMobile ? 'clamp(28px, 7vw, 42px)' : '52px',
            fontWeight: 800,
            lineHeight: isMobile ? 1.2 : 1.1,
            color: '#ffffff',
            textAlign: 'center',
            margin: '0 auto 24px',
            maxWidth: '860px',
            fontFamily: 'Gelica, serif',
          }}>
           What If You're Not Stuck Because Of Your Offer... But Because You're Following A Business Model That Doesn't Suit You?
          </motion.h1>

          <motion.p className="qp-hero-sub" initial="hidden" animate="visible" variants={fadeUp} custom={2} style={{
            maxWidth: '520px',
            fontSize: 'clamp(14px, 3.5vw, 18px)',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.7,
            margin: '0 auto 40px',
            padding: '0 8px',
          }}>
            Most coaches are following strategies built for someone else. In 5 minutes, this assessment identifies your Expert Income Archetype and shows you exactly what to do next.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <motion.div
              animate={{
                boxShadow: [
                  '0 8px 32px rgba(15,17,23,0.4), 0 0 0px rgba(15,17,23,0)',
                  '0 12px 48px rgba(15,17,23,0.7), 0 0 40px rgba(61,38,69,0.4)',
                  '0 8px 32px rgba(15,17,23,0.4), 0 0 0px rgba(15,17,23,0)',
                ],
                opacity: [1, 0.88, 1],
                scale: [1, 1.015, 1],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.04, opacity: 1 }}
              whileTap={{ scale: 0.97 }}
              style={{ borderRadius: '999px', display: 'flex', justifyContent: 'center', width: isMobile ? '100%' : 'auto', maxWidth: '420px', margin: '0 auto', minWidth: 0 }}
            >
              <motion.button className="qp-btn-gold" onClick={onStart} style={{
                width: isMobile ? '100%' : 'auto',
                minWidth: 0,
                fontSize: isMobile ? '14px' : '16px',
                padding: isMobile ? '16px 20px' : '18px 40px',
                whiteSpace: 'nowrap',
              }}>
                DISCOVER MY ARCHETYPE &amp; ROADMAP →
              </motion.button>
            </motion.div>
          </motion.div>

          <p style={{
            textAlign: 'center',
            fontSize: 'clamp(12px, 3vw, 16px)',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: '500',
            letterSpacing: '0.02em',
            marginTop: '20px',
            padding: '0 16px',
          }}>
            Takes 5 Minutes&nbsp;&nbsp;•&nbsp;&nbsp;20 Questions&nbsp;&nbsp;•&nbsp;&nbsp;Instant Results
          </p>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#c9a84c',
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.35)',
              borderRadius: '100px',
              padding: '5px 16px',
              display: 'inline-block',
            }}>
              + Free 7-Day AI Coaching Included
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              marginTop: '32px',
            }}
          >
            {/* Avatar strip */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', overflowX: 'hidden' }}>
              {[
                '/clients/c1.jpg',
                '/clients/c2.jpg',
                '/clients/c3.jpg',
                '/clients/c4.jpg',
                '/clients/c5.jpg',
                '/clients/c6.jpg',
                '/clients/c7.jpg',
                '/clients/c8.jpg',
                '/clients/c9.jpg',
                '/clients/c10.jpg',
                '/clients/c11.jpg',
                '/clients/c12.jpg',
              ].map((src, i) => (
                <div
                  key={i}
                  style={{
                    width: 'clamp(32px, 8vw, 44px)',
                    height: 'clamp(32px, 8vw, 44px)',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid rgba(255,255,255,0.6)',
                    marginLeft: i === 0 ? '0' : '-10px',
                    zIndex: 12 - i,
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={src}
                    alt={`Client ${i + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Stars + rating */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4].map((s) => (
                  <span key={s} style={{ color: '#c9a84c', fontSize: '20px', lineHeight: 1 }}>★</span>
                ))}
                <span style={{ color: '#c9a84c', fontSize: '20px', lineHeight: 1, opacity: 0.5 }}>★</span>
              </div>
              <span style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                color: 'rgba(255,255,255,0.85)',
                fontWeight: '500',
              }}>
                <strong style={{ color: '#ffffff' }}>4.8 stars</strong> from 76 coaches across 12 nations
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            style={{ marginTop: '28px', width: '100%' }}
          >
            <p style={{
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '16px',
            }}>
              Our clients have been featured in
            </p>
            <div style={{
              overflow: 'hidden',
              width: '100%',
              maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                width: 'max-content',
                animation: 'marqueeScroll 30s linear infinite',
              }}>
                {[...Array(2)].map((_, dupIndex) => (
                  <div key={dupIndex} style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                    gap: 'clamp(28px, 6vw, 80px)',
                    paddingRight: 'clamp(28px, 6vw, 80px)',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 'clamp(14px, 4vw, 28px)', fontWeight: '700', color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' }}>Forbes</span>
                    <span style={{ fontSize: 'clamp(12px, 3.5vw, 24px)', fontWeight: '900', color: 'rgba(255,255,255,0.6)', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>HuffPost</span>
                    <span style={{ fontSize: 'clamp(14px, 4vw, 26px)', fontWeight: '900', color: 'rgba(255,255,255,0.6)', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>TEDx</span>
                    <span style={{ fontSize: 'clamp(12px, 3.5vw, 24px)', fontWeight: '700', color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' }}>The Guardian</span>
                    <span style={{ fontSize: 'clamp(12px, 3.5vw, 22px)', fontWeight: '700', color: 'rgba(255,255,255,0.6)', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>Yahoo Finance</span>
                    <span style={{ fontSize: 'clamp(12px, 3.5vw, 24px)', fontWeight: '700', color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' }}>The New York Times</span>
                    <span style={{ fontSize: 'clamp(14px, 4vw, 26px)', fontWeight: '700', color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' }}>WSJ</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Full-width doodle strip */}
        <motion.img
          src="/illustrations/hero-graphic.png"
          alt=""
          aria-hidden="true"
          className="qp-hero-graphic"
          initial={prefersReduced ? {} : { opacity:0, y:40 }}
          animate={{ opacity:1, y:0 }}
          transition={tr(0.6)}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 'auto',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 1,
            display: isMobile ? 'none' : 'block',
          }}
        />
      </section>

      {/* ══ SOCIAL PROOF ══ */}
      <section className="qp-proof-section">
        <div className="qp-proof-inner">
          <div className="qp-proof-heading">
            <h2 className="qp-sect-h">What coaches are saying</h2>
          </div>
          <motion.div
            className="qp-proof-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            {[
              'I implemented one recommendation from my roadmap and signed a $2,500 client within days. The assessment showed me exactly where I was making things harder than they needed to be.',
              'I took the assessment, watched the personalised training, and immediately realised where I was overcomplicating my sales process. Within days, I closed two new clients.',
              'The framework Indrodip shared completely transformed my content. People are responding differently, engaging more deeply, and I finally feel confident in my messaging.',
              'My biggest breakthrough was realising that pricing — not my offer — was the real bottleneck. I finally feel comfortable charging $3,000 for my coaching.',
              "I've taken dozens of business assessments over the years. This was the first one that actually felt personalised and gave me practical next steps.",
              'The roadmap felt like having a business strategist analyse my entire business and tell me exactly what to focus on next.',
            ].map((quote, i) => (
              <motion.div key={i} className="qp-proof-card" variants={cardFadeUp}>
                <div className="qp-proof-stars">★★★★★</div>
                <p className="qp-proof-quote">{quote}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ ARCHETYPES ══ */}
      <section className="qp-arch-section">
        <div className="qp-arch-inner" ref={archRef}>

          <motion.div className="qp-arch-top"
            initial={prefersReduced ? {} : { opacity:0, y:32 }}
            animate={archInView ? { opacity:1, y:0 } : {}}
            transition={tr(0)}
          >
            <div className="qp-arch-top-left">
              <div style={{ fontFamily:"'Caveat',cursive", fontSize:22, fontWeight:600, color:'#3D2645', marginBottom:6 }}>find out which one you are</div>
              <svg width="28" height="30" viewBox="0 0 28 30" fill="none" style={{ display:'block', margin:'0 auto 16px' }}>
                <path d="M14 2 C14 2 20 10 18 20 C17 26 10 28 10 28" stroke="#3D2645" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M6 24 L10 29 L15 25" stroke="#3D2645" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="qp-sect-h"><em style={{ fontStyle:'italic', color:'#1c4a32' }}>Four</em> archetypes. Four different ways to build a successful coaching business.</h2>
              <p className="qp-sect-sub">
                Most coaches are following advice that works perfectly for someone else. This assessment helps you discover the growth model that aligns with your natural strengths.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="qp-arch-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            {ARCHETYPES.map(({ img, name, desc }, i) => (
              <motion.div key={i} className="qp-arch-card" variants={cardFadeUp}>
                <div className="qp-arch-img-wrap">
                  <img src={img} alt={name} className="qp-arch-img" />
                </div>
                <div className="qp-arch-name">{name}</div>
                <div className="qp-arch-desc">&ldquo;{desc}&rdquo;</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="qp-arch-btn"
            initial={prefersReduced ? {} : { opacity:0, y:24 }}
            animate={archInView ? { opacity:1, y:0 } : {}}
            transition={tr(0.42)}
          >
            <motion.button className="qp-btn-gold" onClick={onStart}              whileHover={prefersReduced ? {} : { scale:1.03, y:-2 }} whileTap={{ scale:0.97 }} transition={spr}>
              TAKE THE ASSESSMENT
            </motion.button>
          </motion.div>

        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section className="qp-about-section">
        <div className="qp-about-grain" aria-hidden="true" />
        <div className="qp-about-inner" ref={aboutRef}>

          <motion.div
            initial={prefersReduced ? {} : { opacity:0, y:32 }}
            animate={aboutInView ? { opacity:1, y:0 } : {}}
            transition={tr(0)}
          >
            <Annotation dark>see the methodology</Annotation>
            <h2 className="qp-about-h">This is not another personality quiz</h2>
          </motion.div>

          <div className="qp-about-cards">
            <motion.div className="qp-white-card"
              initial={prefersReduced ? {} : { opacity:0, x:-28 }}
              animate={aboutInView ? { opacity:1, x:0 } : {}}
              transition={tr(0.1)}
            >
              <div className="qp-card-h">Here's What You'll Discover</div>
              <ul className="qp-bullet-list">
                {[
                  { t:'Hidden Growth Bottlenecks', s:'Identify what is actually limiting your revenue at your specific business stage.' },
                  { t:'Messaging Gaps', s:'Understand why your content and conversations are not converting the way they should.' },
                  { t:'Business Model Mismatches', s:'Discover if you are building the right model for your strengths and lifestyle.' },
                  { t:'Pricing Blind Spots', s:'See clearly what is stopping you from charging what your expertise is worth.' },
                  { t:'Your Highest-Leverage Next Steps', s:'Know exactly what to focus on next to move your business forward fast.' },
                ].map(({ t, s }, i) => (
                  <li key={i} className="qp-bullet-li">
                    <span className="qp-bullet-star">★</span>
                    <span className="qp-bullet-content">
                      <span className="qp-bullet-title">{t}</span>
                      {s}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div className="qp-white-card"
              initial={prefersReduced ? {} : { opacity:0, x:28 }}
              animate={aboutInView ? { opacity:1, x:0 } : {}}
              transition={tr(0.15)}
            >
              <div className="qp-card-h">How It Works</div>
              <ul className="qp-bullet-list">
                {[
                  'Answer 20 carefully designed questions about your business, goals, strengths, challenges, and current growth stage.',
                  'Our AI analyses your responses and identifies patterns, opportunities, bottlenecks, and growth drivers.',
                  'Receive your Expert Income Archetype™, personalised roadmap, growth diagnosis, and custom recommendations instantly.',
                ].map((s, i) => (
                  <li key={i} className="qp-bullet-li">
                    <span className="qp-step-num">{i + 1}</span>
                    <span className="qp-bullet-content">{s}</span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginTop: '16px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#c9a84c',
                  color: '#0f1117',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '800',
                  flexShrink: 0,
                }}>4</div>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '15px', margin: '0 0 4px' }}>Your Free 7-Day AI Coaching Begins</p>
                  <p style={{ fontSize: '14px', color: '#555', margin: 0, lineHeight: 1.6 }}>Every day for 7 days, you receive a personalised coaching email built around your archetype — one insight, one action, designed to help you make an extra $3K–$5K.</p>
                </div>
              </div>
              <p className="qp-card-closing">
                Apply your roadmap and start building your business around your strengths instead of forcing strategies that don't fit.
              </p>
              <div style={{
                marginTop: '20px',
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <span style={{ fontSize: '20px' }}>🎁</span>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#0f1117', lineHeight: 1.5 }}>
                  <strong>100% Free.</strong> No credit card. No catch. Just 7 days of real coaching delivered to your inbox.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div className="qp-about-btn"
            initial={prefersReduced ? {} : { opacity:0, y:24 }}
            animate={aboutInView ? { opacity:1, y:0 } : {}}
            transition={tr(0.28)}
          >
            <motion.button className="qp-btn-ghost" onClick={onStart}              whileHover={prefersReduced ? {} : { scale:1.03, y:-2 }} whileTap={{ scale:0.97 }} transition={spr}>
              See It In Action
            </motion.button>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? '12px' : '16px',
              maxWidth: '1000px',
              margin: '48px auto 0',
              padding: isMobile ? '0 12px' : '0 24px',
            }}
          >
            {[
              {
                name: 'Jennifer Collins',
                result: '$3,500 client signed within days',
                text: 'I implemented one recommendation immediately and within days signed a new client worth over $3,500. For the first time, I finally had a roadmap that fit me and my strengths.',
              },
              {
                name: 'Michelle Roberts',
                result: '2 members upgraded in 24 hours',
                text: 'Within 24 hours of making a few simple adjustments, two members upgraded into higher-level support and became paying clients. The assessment gave me clarity and confidence.',
              },
              {
                name: 'Amanda Pierce',
                result: 'Now confidently charging $3,000',
                text: 'After speaking with Indrodip, I completely reframed how I saw my offer. For the first time I genuinely believe I can charge $3,000 for my 1:1 coaching.',
              },
              {
                name: 'Heather Lawson',
                result: 'Messaging fixed, sales feel natural',
                text: 'I realized my offer was not the problem — my messaging was. The roadmap helped me simplify everything. Sales conversations no longer feel awkward or forced.',
              },
              {
                name: 'Kristin Walker',
                result: 'Audience engagement transformed',
                text: 'After applying the framework, my posts felt deeper and more emotional. People started messaging me saying I was speaking directly to them.',
              },
              {
                name: 'Melissa Hartman',
                result: 'Months of confusion cleared instantly',
                text: 'The assessment gave me something I had been searching for months: clarity. I now know exactly what to focus on. My confidence has grown and my content is stronger.',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={cardFadeUp}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '16px',
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[...Array(5)].map((_, s) => (
                    <span key={s} style={{ color: '#c9a84c', fontSize: '16px' }}>★</span>
                  ))}
                </div>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.95)',
                  lineHeight: '1.7',
                  fontStyle: 'italic',
                  margin: 0,
                  flex: 1,
                }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: '11px', color: '#c9a84c', margin: '3px 0 0', fontWeight: '600' }}>{t.result}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ══ TRANSITION ══ */}
      <section className="qp-transition">
        <div className="qp-star-tl" aria-hidden="true">✦<br/>✦ ✦</div>
        <div className="qp-star-tr" aria-hidden="true">✦<br/>✦ ✦</div>
        <div className="qp-star-bl" aria-hidden="true">✦ ✦ ✦</div>
        <div className="qp-star-br" aria-hidden="true">✦ ✦ ✦</div>
        <div className="qp-transition-inner">
          <img src="/illustrations/footer-graphic.png" alt="" aria-hidden="true" className="qp-transition-img" />
        </div>
      </section>

      {/* ══ DARK CTA ══ */}
      <section className="qp-dark-cta">
        <div className="qp-dark-inner" ref={darkRef}>
          <motion.div
            initial={prefersReduced ? {} : { opacity:0, y:32 }}
            animate={darkInView ? { opacity:1, y:0 } : {}}
            transition={tr(0)}
          >
            <div className="qp-dark-annotation">
              <span style={{ fontFamily:"'Caveat',cursive", fontSize:22, fontWeight:600 }}>⏱ Takes approximately 5 minutes.</span>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M13 2 C13 2 20 9 18 18 C17 22 11 24 11 24" stroke="rgba(255,255,255,.55)" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M7 21 L11 25 L15 21" stroke="rgba(255,255,255,.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="qp-dark-h">
              Discover the growth strategy that's actually aligned with you
            </h2>
            <motion.button className="qp-btn-dark-gold" onClick={onStart}              whileHover={prefersReduced ? {} : { scale:1.03, y:-2 }} whileTap={{ scale:0.97 }} transition={spr}>
              DISCOVER MY ARCHETYPE
            </motion.button>
            <p className="qp-trust-line" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginTop: '24px', lineHeight: 1.7 }}>
              ✓ Personalised Archetype Analysis &nbsp;&nbsp; ✓ Hidden Bottleneck Diagnosis &nbsp;&nbsp; ✓ Custom Growth Roadmap &nbsp;&nbsp; ✓ Instant Results &nbsp;&nbsp; ✓ Free Assessment
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>
              Trusted by 500+ coaches, consultants & experts
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '10px', textAlign: 'center', fontStyle: 'italic', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
              Built using real-world coaching, consulting, messaging, sales, and client acquisition data from businesses responsible for over $15M in revenue.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="qp-footer">
        <div className="qp-footer-top">
          <div className="qp-footer-logo"><Image src="/logo-white2.png" alt="The5th Consulting" width={240} height={54} style={{ objectFit: 'contain' }} /></div>
          <div className="qp-footer-avs">
            {[
              '/illustrations/advocate.png',
              '/illustrations/diplomat.png',
              '/illustrations/innovator.png',
              '/illustrations/confidant.png',
            ].map((src, i) => (
              <div key={i} className="qp-footer-av" style={{ zIndex: 4 - i }}>
                <img src={src} alt="" />
              </div>
            ))}
          </div>
          <div className="qp-footer-links">
            <div className="qp-footer-col">
              <h4>Product</h4>
              <a href="#">Assessment</a>
              <a href="#">Platform</a>
              <a href="#">Coaching</a>
            </div>
            <div className="qp-footer-col">
              <h4>Resources</h4>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#">Support</a>
            </div>
          </div>
        </div>
        <div className="qp-footer-bottom">
          &copy; 2026 The5th Consulting. All rights reserved.
        </div>
      </footer>

    </div>
  )
}

/* ─── Page ─── */
export default function Page() {
  const [screen, setScreen] = useState<'start' | 'quiz' | 'email' | 'dashboard'>('start')
  const [currentQ, setCurrentQ] = useState(0)
  const [introsSeen, setIntrosSeen] = useState<Set<string>>(new Set())
  const [cardKey, setCardKey] = useState(0)
  const [slideDir, setSlideDir] = useState<'sir' | 'sil'>('sir')
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [fromTo, setFromTo] = useState({ from: '', to: '' })
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({})
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({})
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [submitting, setSubmitting] = useState(false)
  const [otpError, setOtpError] = useState('')

  const [lead, setLead] = useState<Lead | null>(null)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [tasksDone, setTasksDone] = useState<boolean[]>([false, false, false])
  const [revenueInput, setRevenueInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [activeDay, setActiveDay] = useState(1)
  const [confettiFired, setConfettiFired] = useState(false)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const advancingRef = useRef(false)

  /* ── Navigation ── */
  const goForward = useCallback(() => {
    setError('')
    setSlideDir('sir')
    setCardKey(k => k + 1)
    if (currentQ < questions.length - 1) setCurrentQ(q => q + 1)
    else setScreen('email')
  }, [currentQ])

  const goBack = useCallback(() => {
    setError('')
    setSlideDir('sil')
    setCardKey(k => k + 1)
    if (currentQ > 0) setCurrentQ(q => q - 1)
    else setScreen('start')
  }, [currentQ])

  const handleSelectAnswer = (qId: string, value: string) => {
    if (advancingRef.current) return
    setAnswers(a => ({ ...a, [qId]: value }))
    setError('')
    // Auto-advance: brief highlight on the chosen option, then glide to the next question.
    advancingRef.current = true
    window.setTimeout(() => { goForward(); advancingRef.current = false }, 300)
  }

  const validateAndNext = () => {
    const q = questions[currentQ]
    if (q.type === 'select') {
      if (!answers[q.id]) { setError('Please select an option to continue'); return }
    } else if (q.type === 'textarea') {
      const val = (textAnswers[q.id] || '').trim()
      if (val.length < 5) { setError('Please describe this before continuing'); return }
      setAnswers(a => ({ ...a, [q.id]: val }))
    } else if (q.type === 'fromto') {
      if (!fromTo.from.trim() || !fromTo.to.trim()) { setError('Please complete both fields'); return }
      setAnswers(a => ({ ...a, [q.id]: `FROM: ${fromTo.from} → TO: ${fromTo.to}` }))
    } else if (q.type === 'scale') {
      if (!answers[q.id]) { setError('Please select a number before continuing'); return }
    } else if (q.type === 'multi') {
      const sel = multiAnswers[q.id] || []
      if (sel.length === 0) { setError('Please select at least one option'); return }
      setAnswers(a => ({ ...a, [q.id]: sel }))
    }
    goForward()
  }

  /* ── Email submit ── */
  const BLOCKED_DOMAINS = [
    'mailinator.com','guerrillamail.com','tempmail.com','throwam.com',
    'sharklasers.com','yopmail.com','yopmail.fr','trashmail.com',
    'trashmail.me','trashmail.net','trashmail.io','trashmail.xyz',
    'trashmail.at','trashmail.org','10minutemail.com','10minutemail.net',
    'minutemail.com','tempail.com','emailondeck.com','getairmail.com',
    'fakeinbox.com','mailnesia.com','discard.email','tempr.email',
    'spambox.us','mytrashmail.com','mohmal.com','maildrop.cc',
    'spam4.me','dispostable.com','mailnull.com','spamgourmet.com',
    'nwldx.com','filzmail.com','tempemail.net','fakemail.net',
    'spamspot.com','obobbo.com','wegwerfmail.de','wegwerfmail.net',
    'tempinbox.com','spammotel.com','spamfree24.org','spamthisplease.com',
    'guerrillamailblock.com','grr.la','spam.la','ass.pp.ua',
    'binkmail.com','bobmail.info','chammy.info','devnullmail.com',
    'discardmail.com','discardmail.de','dudmail.com','dumpmail.de',
    'email60.com','emailias.com','emailinfive.com','etranquil.com',
    'explodemail.com','fastacura.com','fleckens.hu','frapmail.com',
    'garliclife.com','gishpuppy.com','great-host.in','gustr.com',
    'h8s.org','haltospam.com','herp.in','hidemail.de','hidzz.com',
    'hmamail.com','hopemail.biz','ieatspam.eu','ieatspam.info',
    'ieh-mail.de','imail1.net','inoutmail.de','inoutmail.eu',
    'inoutmail.info','inoutmail.net','internet-e-mail.de',
    'internet-mail.org','internetemails.net','internetmailing.net',
    'inwind.it','ipoo.org','irish2me.com','iwi.net',
    'jetable.com','jetable.fr.nf','jetable.net','jetable.org',
    'jnxjn.com','jourrapide.com','jsrsolutions.com','kasmail.com',
    'kaspop.com','keepmymail.com','killmail.com','killmail.net',
    'kimsdisk.com','klzlk.com','koszmail.pl','kurzepost.de',
    'lawlita.com','letthemeatspam.com','lhsdv.com','lifebyfood.com',
    'link2mail.net','litedrop.com','lolfreak.net','lookugly.com',
    'lortemail.dk','lucky-mail.info','lv0.in','m21.cc',
    'mail-filter.com','mail-temporaire.com','mail-temporaire.fr',
    'mail2rss.org','mail333.com','mailbidon.com','mailbiz.biz',
    'mailblocks.com','mailbucket.org','mailcat.biz','mailcatch.com',
    'mailde.de','mailde.info','mailexpire.com','mailfa.tk',
    'mailforspam.com','mailfreeonline.com','mailfs.com','mailguard.me',
    'mailin8r.com','mailinatar.com','mailincubator.com',
    'mailismagic.com','mailme.ir','mailme.lv','mailme24.com',
    'mailmetrash.com','mailmoat.com','mailms.com','mailnew.com',
    'mailorg.org','mailpick.biz','mailproxsy.com','mailquack.com',
    'mailrock.biz','mailscrap.com','mailshell.com','mailsiphon.com',
    'mailslite.com','mailspeed.ru','mailtemp.info','mailtome.de',
    'mailtothis.com','mailtrash.net','mailtv.net','mailzilla.com',
    'mailzilla.org','makemetheking.com','mbx.cc','mega.zik.dj',
    'meinspamschutz.de','meltmail.com','mezimages.net','mierdamail.com',
    'migumail.com','mintemail.com','moncourrier.fr.nf','monemail.fr.nf',
    'monmail.fr.nf','mt2009.com','mt2014.com','mx0.wwwnew.eu',
    'mxfuel.com','myalias.pw','mycleaninbox.net','mymail-in.net',
    'mypacks.net','mypartyclip.de','myphantomemail.com','mysamp.de',
    'mytempemail.com','mytempmail.com','nabuma.com','neomailbox.com',
    'nepwk.com','nervmich.net','nervtmich.net','netmails.com',
    'netmails.net','netzidiot.de','neverbox.com','nice-4u.com',
    'nincsmail.hu','nnh.com','no-spam.ws','noblepioneer.com',
    'nobulk.com','noclickemail.com','nogmailspam.info','nomail.pw',
    'nomail.xl.cx','nomail2me.com','nomorespamemails.com','nonspam.eu',
    'nonspammer.de','noref.in','nospam.ze.tc','nospamfor.us',
    'nospammail.net','nospamthanks.info','notmailinator.com',
    'nowhere.org','nowmymail.com','objectmail.com','odaymail.com',
    'one-time.email','oneoffemail.com','onewaymail.com','online.ms',
    'onqin.com','oopi.org','ordinaryamerican.net','otherinbox.com',
    'ourklips.com','outlawspam.com','ovpn.to','owlpic.com',
    'pancakemail.com','pjjkp.com','plexolan.de','politikerclub.de',
    'poofy.org','pookmail.com','privacy.net','privatdemail.net',
    'proxymail.eu','prtnx.com','punkass.com','r4nd0m.de',
    'recode.me','recursor.net','regbypass.com','safetymail.info',
    'safetypost.de','sandelf.de','saynotospams.com','schafmail.de',
    'schrott-email.de','secretemail.de','secure-mail.biz',
    'selfdestructingmail.com','sendspamhere.com','sharklasers.com',
    'shieldedmail.com','shieldemail.com','shitmail.de','shitmail.me',
    'shitmail.org','shitware.nl','skeefmail.com','slopsbox.com',
    'slowslow.de','smellfear.com','snakemail.com','sneakemail.com',
    'sneakmail.de','snkmail.com','sofimail.com','sofort-mail.de',
    'sogetthis.com','solopilotos.com','soodonims.com','spam.su',
    'spamavert.com','spambob.com','spambob.net','spambob.org',
    'spambog.com','spambog.de','spambog.ru','spambox.info',
    'spamcannon.com','spamcannon.net','spamcero.com','spamcon.org',
    'spamcorptastic.com','spamcowboy.com','spamcowboy.net',
    'spamcowboy.org','spamday.com','spamex.com','spamfree.eu',
    'spamfree24.de','spamfree24.eu','spamfree24.info','spamfree24.net',
    'spamgoes.in','spamgrid.com','spamhereplease.com','spamhole.com',
    'spamify.com','spaminator.de','spamkill.info','spaml.com',
    'spaml.de','spammy.host','spamoff.de','spamslicer.com',
    'spamstack.net','spamthis.co.uk','spamtrail.com','spamtroll.net',
    'speed.1s.fr','spoofmail.de','stuffmail.de','super-auswahl.de',
    'supergreatmail.com','supermailer.jp','superrito.com',
    'superstachel.de','suremail.info','svk.jp','sweetxxx.de',
    'tafmail.com','tagyourself.com','teleworm.com','teleworm.us',
    'tempalias.com','tempe-mail.com','tempemail.biz','tempemail.org',
    'tempinbox.co.uk','tempmail.eu','tempmail.it','tempmail2.com',
    'tempmaildemo.com','tempmailer.com','tempmailer.de','tempomail.fr',
    'temporaryemail.net','temporaryemail.us','temporaryforwarding.com',
    'temporaryinbox.com','temporarymail.org','tempthe.net',
    'thanksnospam.com','thanksnospam.info','thisisnotmyrealemail.com',
    'throam.com','throwaway.email','tilien.com','tittbit.in',
    'tizi.com','tmailinator.com','toiea.com','tradermail.info',
    'trash-amil.com','trash-mail.at','trash-mail.cf','trash-mail.de',
    'trash-mail.ga','trash-mail.gq','trash-mail.io','trash-mail.ml',
    'trash-mail.tk','trash2009.com','trash2010.com','trash2011.com',
    'trashdevil.com','trashdevil.de','trashemail.de','trashimail.com',
    'trashinbox.com','trashmailer.com','trashme.dk','trashmails.com',
    'trashtipper.com','trbvm.com','trickmail.net','trillianpro.com',
    'trin.ch','tryalert.com','turual.com','twinmail.de','tyldd.com',
    'uggsrock.com','umail.net','upliftnow.com','uplipht.com',
    'uroid.com','us.af','venompen.com','veryrealemail.com',
    'vidchart.com','viditag.com','viewcastmedia.com','viewcastmedia.net',
    'viewcastmedia.org','viralplays.com','vomoto.com','vpn.st',
    'vsimcard.com','vubby.com','walala.org','walkmail.net',
    'watchfull.net','webemail.me','webm4il.info','wegwerf-email.de',
    'wegwerf-email.net','wegwerf-email.org','wegwerfadresse.de',
    'wegwerfmail.info','wh4f.org','whatiaas.com','whatifnot.com',
    'whatsaas.com','whopy.com','wilemail.com',
    'willselfdestruct.com','winemaven.info','wronghead.com',
    'wuzup.net','wuzupmail.net','wwwnew.eu','xagloo.com',
    'xemaps.com','xents.com','xmaily.com','xoxy.net',
    'xsmail.com','xzapmail.com','ya.ru','yapped.net','yeah.net',
    'yep.it','ykool.com','yogamaven.com','yopmail.pp.ua',
    'yourdomain.com','yuurok.com','z1p.biz','za.com',
    'zehnminuten.de','zehnminutenmail.de','zetmail.com','zippymail.info',
    'zoemail.net','zoemail.org','zomg.info','zxcv.com',
    'zxcvbnm.com','zzz.com',
  ]

  const handleEmailSubmit = () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    const emailValue = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError('Please enter a valid email address')
      return
    }
    const emailDomain = emailValue.split('@')[1]?.toLowerCase()
    if (!emailDomain) {
      setError('Please enter a valid email address')
      return
    }
    if (BLOCKED_DOMAINS.includes(emailDomain)) {
      setError('Please use your real email address. Temporary emails are not accepted.')
      return
    }
    setSubmitting(true); setError('')
    sessionStorage.setItem('quiz_name', name)
    sessionStorage.setItem('quiz_email', emailValue)
    sessionStorage.setItem('quiz_answers', JSON.stringify(answers))
    window.location.href = '/quiz/results'
  }

  /* ── OTP ── */
  const handleOtpDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otpDigits]; next[i] = val; setOtpDigits(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }
  const handleOtpSubmit = async () => {
    const code = otpDigits.join('')
    if (code.length !== 6) { setOtpError('Please enter the full 6-digit code'); return }
    setSubmitting(true); setOtpError('')
    try {
      const res = await fetch('/api/quiz/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      })
      const data = await res.json()
      if (data.error) { setOtpError(data.error); return }
      setLead(data.lead); setRoadmap(data.roadmap)
      sessionStorage.setItem('quiz_name', name)
      sessionStorage.setItem('quiz_email', email)
      sessionStorage.setItem('quiz_answers', JSON.stringify(answers))
      window.location.href = '/quiz/results'
      return
      setActiveDay(data.lead?.current_day || 1)
      setScreen('dashboard')
    } catch { setOtpError('Something went wrong.') }
    finally { setSubmitting(false) }
  }

  /* ── Dashboard handlers ── */
  const handleMarkAllComplete = async () => {
    if (!lead) return
    setTasksDone([true, true, true])
    if (!confettiFired) {
      setConfettiFired(true)
      const confetti = (await import('canvas-confetti')).default
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 }, colors: ['#2d6a4f', '#d4a017', '#fff'] })
    }
    await fetch('/api/quiz/progress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lead.email, day: lead.current_day, tasksCompleted: [0, 1, 2], revenueLogged: 0 })
    })
    setLead(l => l ? { ...l, current_day: Math.min((l.current_day || 1) + 1, 15), streak: (l.streak || 0) + 1 } : l)
  }

  const handleRevenueLog = async () => {
    if (!lead || !revenueInput) return
    const amt = parseFloat(revenueInput); if (isNaN(amt)) return
    await fetch('/api/quiz/progress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lead.email, day: lead.current_day, tasksCompleted: [], revenueLogged: amt })
    })
    setLead(l => l ? { ...l, revenue_logged: (l.revenue_logged || 0) + amt } : l)
    setRevenueInput('')
  }

  const handleChatSend = async () => {
    if (!chatInput.trim() || !lead) return
    const msg = chatInput; setChatInput('')
    setChatMessages(m => [...m, { role: 'user', content: msg }])
    setChatLoading(true)
    try {
      const res = await fetch('/api/quiz/ai-coach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lead.email, message: msg })
      })
      const data = await res.json()
      setChatMessages(m => [...m, { role: 'assistant', content: data.response || 'Sorry, try again.' }])
    } catch {
      setChatMessages(m => [...m, { role: 'assistant', content: 'Something went wrong.' }])
    } finally { setChatLoading(false) }
  }

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const today = roadmap?.days?.find(d => d.day === (lead?.current_day || 1))
  const revPercent = Math.min(((lead?.revenue_logged || 0) / 5000) * 100, 100)
  const firstName = (lead?.name || name || 'there').split(' ')[0]
  const tasksDoneCount = tasksDone.filter(Boolean).length

  /* ── Dashboard style tokens ── */
  const greenBtn: React.CSSProperties = { padding: '16px 32px', borderRadius: 8, background: 'linear-gradient(135deg,#2d6a4f,#1a4a35)', border: '1px solid #1a4a35', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: '.03em', transition: 'all .2s', boxShadow: '0 8px 24px rgba(45,106,79,0.3)', width: '100%', marginTop: 22 }
  const MESH = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 15% 0%, rgba(45,106,79,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 85% 100%, rgba(45,106,79,0.1) 0%, transparent 60%)', animation: 'meshMove 12s ease-in-out infinite alternate' }} />
  )
  const DASH_NAV = (right?: React.ReactNode) => (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,15,10,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(45,106,79,0.18)' }}>
      <span style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 700, color: '#fff' }}>
        The<span style={{ color: '#2d6a4f' }}>5th</span>
      </span>
      {right}
    </nav>
  )

  /* ══════════════ START ══════════════ */
  if (screen === 'start') return <LandingPage onStart={() => setScreen('quiz')} />

  /* ══════════════ QUIZ ══════════════ */
  if (screen === 'quiz') {
    const q = questions[currentQ]
    const hasAnswer = q.type === 'select' ? !!answers[q.id] : q.type === 'scale' ? !!answers[q.id] : true

    const GRAIN_URI = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
    const StarSVG = ({ size = 28, style = {} }: { size?: number; style?: React.CSSProperties }) => (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={style}>
        <path d="M14 2 L15.2 10.8 L22 6 L17.2 13.4 L26 14 L17.2 14.6 L22 22 L15.2 17.2 L14 26 L12.8 17.2 L6 22 L10.8 14.6 L2 14 L10.8 13.4 L6 6 L12.8 10.8 Z" stroke="#0d0d0b" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      </svg>
    )

    /* ── Chapter intro (shown once when entering a new section) ── */
    const sec = sectionOf(q.id)
    const firstOfSection = currentQ === 0 || sectionOf(questions[currentQ - 1].id) !== sec
    const showIntro = firstOfSection && !introsSeen.has(sec)
    const beginSection = () => {
      setSlideDir('sir'); setCardKey(k => k + 1)
      setIntrosSeen(s => { const n = new Set(s); n.add(sec); return n })
    }
    if (showIntro) {
      const meta = SECTIONS[sec]
      return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#FBF8F2,#F4EEE4)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, opacity:.04, backgroundImage: GRAIN_URI }} />
          <style>{CSS}</style>
          <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'18px 24px', display:'flex', alignItems:'center', gap:16 }}>
            <button onClick={goBack} aria-label="Go back" style={{ background:'none', border:'none', fontSize:22, color:'rgba(26,26,46,.45)', cursor:'pointer', lineHeight:1, padding:0 }}>←</button>
            <div style={{ flex:1, display:'flex', justifyContent:'center', gap:7 }}>
              {SECTION_KEYS.map(k => (
                <div key={k} style={{ width: k === sec ? 26 : 8, height:8, borderRadius:50,
                  background: SECTION_KEYS.indexOf(k) < SECTION_KEYS.indexOf(sec) ? '#1C4A32' : k === sec ? '#3D2645' : 'rgba(61,38,69,.16)',
                  transition:'all .35s cubic-bezier(.2,.7,.2,1)' }} />
              ))}
            </div>
            <div style={{ width:22 }} />
          </div>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'90px 28px 60px', position:'relative', zIndex:1 }}>
            <div key={cardKey} className={slideDir} style={{ maxWidth:560, textAlign:'center' }}>
              <div style={{ fontSize:12, letterSpacing:'.24em', textTransform:'uppercase', color:'#B0902F', fontWeight:700, marginBottom:20 }}>{meta.eyebrow}</div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(34px,6.5vw,56px)', fontWeight:500, color:'#1A1A2E', lineHeight:1.04, letterSpacing:'-.02em', marginBottom:20 }}>{meta.name}</h2>
              <p style={{ fontSize:17, fontWeight:300, lineHeight:1.75, color:'#5a5550', marginBottom:38, maxWidth:480, marginLeft:'auto', marginRight:'auto' }}>{meta.intro}</p>
              <button className="gbtn" style={{ maxWidth:300, margin:'0 auto' }} onClick={beginSection}>Begin →</button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#FBF8F2,#F4EEE4)', position: 'relative' }}>
        {/* Grain overlay */}
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, opacity:.04,
          backgroundImage: GRAIN_URI }} />
        <style>{CSS}</style>

        {/* Minimal top bar: just back arrow + progress dots */}
        <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:100,
          padding:'18px 24px', display:'flex', alignItems:'center', gap:16,
          background:'linear-gradient(180deg,rgba(251,248,242,.9),rgba(251,248,242,0))', backdropFilter:'blur(2px)' }}>
          <button onClick={goBack} aria-label="Go back"
            style={{ background:'none', border:'none', fontSize:22, color:'rgba(26,26,46,.45)',
              cursor:'pointer', lineHeight:1, padding:0, flexShrink:0 }}>←</button>
          <div style={{ flex:1, display:'flex', justifyContent:'center', gap:6 }}>
            {questions.map((_, i) => (
              <div key={i} style={{ width: i === currentQ ? 22 : 8, height:8, borderRadius:50,
                background: i < currentQ ? '#1C4A32' : i === currentQ ? '#3D2645' : 'rgba(61,38,69,.16)',
                transition:'all .35s cubic-bezier(.2,.7,.2,1)' }} />
            ))}
          </div>
          <div style={{ width:22, flexShrink:0 }} />
        </div>

        {/* Decorative stars bottom corners */}
        <div style={{ position:'fixed', bottom:40, left:24, zIndex:1, pointerEvents:'none', opacity:.55 }}>
          <StarSVG size={20} style={{ color:'#0d0d0b' }} />
          <StarSVG size={14} style={{ marginTop:8, marginLeft:8, color:'#0d0d0b' }} />
        </div>
        <div style={{ position:'fixed', bottom:40, right:24, zIndex:1, pointerEvents:'none', opacity:.55 }}>
          <StarSVG size={14} style={{ color:'#0d0d0b' }} />
          <StarSVG size={20} style={{ marginTop:8, color:'#0d0d0b' }} />
        </div>

        {/* Content area */}
        <div className="quiz-content-area" style={{ maxWidth: 800, margin: '0 auto', padding: '120px 40px 100px', position:'relative', zIndex:1 }}>

          {/* Animated question wrapper */}
          <div key={cardKey} className={slideDir}>
            {/* Chapter label */}
            <p style={{ textAlign: 'center', fontSize: 11.5, letterSpacing: '.2em', textTransform: 'uppercase', color: '#B0902F', fontWeight: 700, marginTop: 24 }}>
              {SECTIONS[sectionOf(q.id)].eyebrow} · {SECTIONS[sectionOf(q.id)].name}
            </p>
            {/* Question title */}
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 400, fontFamily: "'Cormorant Garamond',serif", color: '#0d0d0b', textAlign: 'center', margin: '14px auto 12px', lineHeight: 1.22, maxWidth: 640 }}>
              {q.title}
            </h2>
            {q.sub && (
              <p style={{ fontSize: 16, color: 'rgba(13,13,11,.6)', textAlign: 'center', marginBottom: 36, lineHeight: 1.65, maxWidth: 520, margin: '0 auto 36px' }}>
                {q.sub}
              </p>
            )}

            {/* Options container */}
            <div style={{ maxWidth: 720, margin: '0 auto' }}>

              {/* SELECT */}
              {q.type === 'select' && (
                <div className="qopt-grid">
                  {q.options.map(opt => {
                    const sel = answers[q.id] === opt.value
                    return (
                      <button
                        key={opt.value}
                        className={`qopt${sel ? ' sel' : ''}`}
                        onClick={() => handleSelectAnswer(q.id, opt.value)}>
                        <span style={{ flex: 1 }}>
                          <span style={{ display: 'block', fontSize: 17, fontWeight: 500, color: sel ? '#fff' : '#0a0a0a' }}>
                            {opt.label}
                          </span>
                          {opt.sub && (
                            <span style={{ display: 'block', fontSize: 13, color: sel ? 'rgba(255,255,255,0.7)' : '#9ca3af', marginTop: 3 }}>
                              {opt.sub}
                            </span>
                          )}
                        </span>
                        {sel && <span style={{ fontSize: 14, color: '#fff', flexShrink: 0, fontWeight: 700, marginLeft: 12 }}>✓</span>}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* TEXTAREA */}
              {q.type === 'textarea' && (
                <>
                  <textarea
                    className="qinput"
                    style={{ minHeight: 130, resize: 'vertical', marginBottom: 10 }}
                    placeholder={q.placeholder}
                    value={textAnswers[q.id] || ''}
                    onChange={e => setTextAnswers(t => ({ ...t, [q.id]: e.target.value }))}
                  />
                  <p style={{ fontSize: 13, color: 'rgba(13,13,11,0.5)', textAlign: 'center', margin: '8px 0 16px' }}>
                    Most people who write 2–3 sentences get significantly more accurate results.
                  </p>
                  {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 10 }}>{error}</p>}
                  <button className="gbtn" onClick={validateAndNext}>Continue →</button>
                </>
              )}

              {/* FROMTO */}
              {q.type === 'fromto' && (
                <>
                  {(['from', 'to'] as const).map(key => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <span style={{ width: 46, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: '#B0902F', flexShrink: 0, textTransform: 'uppercase' }}>
                        {key}
                      </span>
                      <input
                        className="qinput"
                        placeholder={key === 'from' ? q.fromPlaceholder : q.toPlaceholder}
                        value={fromTo[key]}
                        onChange={e => setFromTo(f => ({ ...f, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 10 }}>{error}</p>}
                  <button className="gbtn" onClick={validateAndNext}>Continue →</button>
                </>
              )}

              {/* SCALE */}
              {q.type === 'scale' && (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        className={`scale-btn${answers[q.id] === String(n) ? ' sel' : ''}`}
                        onClick={() => handleSelectAnswer(q.id, String(n))}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>
                    <span>{q.scaleMin}</span><span>{q.scaleMax}</span>
                  </div>
                  <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(26,26,46,.32)' }}>
                    Tap a number to continue
                  </p>
                </>
              )}

              {/* MULTI */}
              {q.type === 'multi' && (
                <>
                  <div className="qopt-grid">
                    {q.options.map(opt => {
                      const sel = (multiAnswers[q.id] || []).includes(opt.value)
                      return (
                        <button
                          key={opt.value}
                          className={`qopt${sel ? ' sel' : ''}`}
                          onClick={() => {
                            setMultiAnswers(m => {
                              const cur = m[q.id] || []
                              return { ...m, [q.id]: sel ? cur.filter(v => v !== opt.value) : [...cur, opt.value] }
                            })
                            setError('')
                          }}>
                          <span style={{ flex: 1 }}>
                            <span style={{ display: 'block', fontSize: 17, fontWeight: 500, color: sel ? '#fff' : '#0a0a0a' }}>
                              {opt.label}
                            </span>
                            {opt.sub && (
                              <span style={{ display: 'block', fontSize: 13, color: sel ? 'rgba(255,255,255,0.7)' : '#9ca3af', marginTop: 3 }}>
                                {opt.sub}
                              </span>
                            )}
                          </span>
                          {sel && <span style={{ fontSize: 14, color: '#fff', flexShrink: 0, fontWeight: 700, marginLeft: 12 }}>✓</span>}
                        </button>
                      )
                    })}
                  </div>
                  {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 8, marginTop: 4 }}>{error}</p>}
                  <button className="gbtn" style={{ marginTop: 32 }} onClick={validateAndNext}>Continue →</button>
                </>
              )}

              {/* SELECT auto-advances on choice — no button needed */}
              {q.type === 'select' && (
                <p style={{ textAlign: 'center', marginTop: 26, fontSize: 12.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(26,26,46,.32)' }}>
                  Tap your answer to continue
                </p>
              )}

            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════ EMAIL ══════════════ */
  if (screen === 'email') return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
      <style>{CSS}</style>
      <SiteHeader screen="email" currentQ={questions.length} />

      <div className="email-screen-inner" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px' }}>
        <div className="afu-1" style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
          {/* Gold label */}
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#B0902F', marginBottom: 20 }}>
            YOUR ROADMAP IS READY ✨
          </div>

          <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, color: '#0a0a0a', marginBottom: 12, lineHeight: 1.2 }}>
            Your personalized 15-day roadmap is ready
          </h2>
          <p style={{ fontSize: 16, color: '#555', marginBottom: 32, lineHeight: 1.7 }}>
            Enter your details below to unlock your free AI dashboard
          </p>

          {/* Benefits */}
          <div style={{ marginBottom: 32, display: 'inline-block', textAlign: 'left' }}>
            {['Your full AI-generated 15-day roadmap', 'Daily tasks built from your assessment answers', 'AI business coach available 24/7', 'Revenue tracker toward your $5K goal', '7-day personalized email coaching series'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#e8f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#225840', fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 15, color: '#374151' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <input className="qinput" style={{ marginBottom: 12 }} type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} />
            <input className="qinput" style={{ marginBottom: 20 }} type="email" placeholder="Your best email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()} />
            {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 14, textAlign: 'left' }}>{error}</p>}
            <button className="gbtn" onClick={handleEmailSubmit} disabled={submitting}>
              {submitting ? 'Building your roadmap…' : 'Get My Roadmap →'}
            </button>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 14 }}>🔒 Your info is private. We never spam.</p>
          </div>
        </div>
      </div>
    </div>
  )

  /* ══════════════ DASHBOARD ══════════════ */
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f0a', color: '#fff', paddingBottom: 80 }}>
      <style>{CSS}</style>
      {MESH}
      {DASH_NAV(
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          <span>Day {lead?.current_day || 1} of 15</span>
          <span>🔥 {lead?.streak || 0}</span>
          <span style={{ color: '#2d6a4f', fontWeight: 600 }}>${(lead?.revenue_logged || 0).toLocaleString()}</span>
        </div>
      )}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '90px 20px 24px', position: 'relative', zIndex: 1 }}>

        {/* Welcome */}
        <div style={{ marginBottom: 40, animation: 'fadeUp .55s ease both' }}>
          <h1 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 900, color: '#fff' }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginTop: 7, maxWidth: 620 }}>{roadmap?.summary || 'Your personalized roadmap to $5,000/month is ready.'}</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 40 }}>
          <StatCard label="Current Day" value={lead?.current_day || 1} color="#d4a017" />
          <StatCard label="Day Streak 🔥" value={lead?.streak || 0} color="#f59e0b" />
          <StatCard label="Revenue Logged" value={lead?.revenue_logged || 0} unit="$" color="#2d6a4f" />
          <StatCard label="Tasks Done Today" value={tasksDoneCount} color="#8b5cf6" />
        </div>

        {/* Progress Ring */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(45,106,79,0.22)', borderRadius: 24, padding: '32px 36px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle cx="70" cy="70" r="58" fill="none" stroke="url(#rg)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - revPercent / 100)}`}
                transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
              <defs>
                <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2d6a4f" /><stop offset="100%" stopColor="#d4a017" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{Math.round(revPercent)}%</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>to $5K</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#d4a017', textTransform: 'uppercase', marginBottom: 8 }}>Revenue to $5,000</div>
            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
              ${(lead?.revenue_logged || 0).toLocaleString()}
              <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>/ $5,000</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              {[500, 1000, 2000, 3000, 5000].map(m => {
                const hit = (lead?.revenue_logged || 0) >= m
                return (
                  <div key={m} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 50, background: hit ? 'rgba(45,106,79,0.25)' : 'rgba(255,255,255,0.04)', color: hit ? '#2d6a4f' : 'rgba(255,255,255,0.25)', border: `1px solid ${hit ? '#2d6a4f40' : 'transparent'}` }}>
                    ${m >= 1000 ? `${m / 1000}K` : m}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Today's Mission */}
        {today && (
          <div style={{ background: 'rgba(45,106,79,0.07)', border: '1px solid rgba(45,106,79,0.28)', borderRadius: 24, padding: '32px', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#d4a017', textTransform: 'uppercase' }}>Day {today.day} Mission</span>
              <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 50, background: 'rgba(45,106,79,0.18)', color: '#2d6a4f', fontWeight: 600 }}>{today.theme}</span>
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{today.title}</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', marginBottom: 24, lineHeight: 1.6 }}>{today.motivation}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {today.tasks.map((task, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }}>
                  <div onClick={() => { const n = [...tasksDone]; n[i] = !n[i]; setTasksDone(n) }}
                    style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${tasksDone[i] ? '#2d6a4f' : 'rgba(255,255,255,0.18)'}`, background: tasksDone[i] ? '#2d6a4f' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'all .18s', marginTop: 2 }}>
                    {tasksDone[i] && <span style={{ fontSize: 13, color: '#fff' }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 14, color: tasksDone[i] ? 'rgba(255,255,255,0.35)' : '#fff', textDecoration: tasksDone[i] ? 'line-through' : 'none', lineHeight: 1.65, transition: 'all .18s' }}>{task}</span>
                </label>
              ))}
            </div>
            <div style={{ background: 'rgba(45,106,79,0.1)', border: '1px solid rgba(45,106,79,0.18)', borderRadius: 12, padding: '12px 18px', marginBottom: 20, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              🏆 <strong style={{ color: '#fff' }}>Win condition:</strong> {today.win_condition}
            </div>
            <button onClick={handleMarkAllComplete} style={{ ...greenBtn, width: 'auto', padding: '14px 32px', marginTop: 0 }}>
              Mark All Complete 🎉
            </button>
          </div>
        )}

        {/* 15-Day Timeline */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 16 }}>15-Day Journey</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
            {Array.from({ length: 15 }, (_, i) => i + 1).map(d => {
              const cur = lead?.current_day || 1
              const isToday = d === cur; const isDone = d < cur
              const dp = roadmap?.days?.find(x => x.day === d)
              return (
                <button key={d} className="timeline-day" onClick={() => setActiveDay(d)}
                  style={{ minWidth: 66, padding: '12px 8px', borderRadius: 14, border: `1.5px solid ${isToday ? '#d4a017' : isDone ? 'rgba(45,106,79,0.35)' : 'rgba(255,255,255,0.07)'}`, background: isToday ? 'rgba(212,160,23,0.1)' : isDone ? 'rgba(45,106,79,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all .18s', animation: isToday ? 'pulseGlow 2s infinite' : 'none', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{isDone ? '✅' : isToday ? '⭐' : '🔒'}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? '#d4a017' : isDone ? '#2d6a4f' : 'rgba(255,255,255,0.25)' }}>Day {d}</div>
                  {dp && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 58 }}>{dp.theme}</div>}
                </button>
              )
            })}
          </div>
          {activeDay !== (lead?.current_day || 1) && (() => {
            const dp = roadmap?.days?.find(d => d.day === activeDay)
            return dp ? (
              <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ fontSize: 11, color: '#d4a017', fontWeight: 600, marginBottom: 4 }}>Day {activeDay} · {dp.theme}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 10 }}>{dp.title}</div>
                {dp.tasks.map((t, i) => <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 5 }}>· {t}</div>)}
              </div>
            ) : null
          })()}
        </div>

        {/* Revenue Logger */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(45,106,79,0.18)', borderRadius: 24, padding: '28px 32px', marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#2d6a4f', textTransform: 'uppercase', marginBottom: 16 }}>Log a Win 💰</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              style={{ flex: 1, padding: '12px 20px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, fontFamily: 'inherit', transition: 'border-color .2s', outline: 'none' }}
              type="number" placeholder="Amount earned ($)" value={revenueInput}
              onChange={e => setRevenueInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRevenueLog()} />
            <button onClick={handleRevenueLog}
              style={{ padding: '12px 26px', borderRadius: 8, background: 'linear-gradient(135deg,#2d6a4f,#1a4a35)', border: '1px solid #1a4a35', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap', boxShadow: '0 6px 20px rgba(45,106,79,0.28)' }}>
              Add Win
            </button>
          </div>
        </div>

        {/* AI Coach Chat */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(45,106,79,0.18)', borderRadius: 24, padding: '28px 32px', marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#2d6a4f', textTransform: 'uppercase', marginBottom: 20 }}>AI Business Coach</div>
          <div style={{ height: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14, marginTop: 90 }}>
                Ask your AI coach anything — offer, outreach, pricing, mindset…
              </div>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '82%', padding: '12px 16px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.role === 'user' ? 'rgba(45,106,79,0.25)' : 'rgba(255,255,255,0.06)', fontSize: 14, lineHeight: 1.7, color: '#fff', border: `1px solid ${m.role === 'user' ? 'rgba(45,106,79,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', gap: 5, padding: '10px 14px', width: 'fit-content' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#2d6a4f', animation: `pulse 1.2s ${i * 0.18}s infinite` }} />)}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              style={{ flex: 1, padding: '12px 20px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'inherit', transition: 'border-color .2s', outline: 'none' }}
              placeholder="Ask your AI coach…" value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChatSend()} />
            <button onClick={handleChatSend} disabled={chatLoading}
              style={{ padding: '12px 22px', borderRadius: 8, background: 'linear-gradient(135deg,#2d6a4f,#1a4a35)', border: '1px solid #1a4a35', color: '#fff', fontSize: 14, cursor: 'pointer', transition: 'all .2s', boxShadow: '0 6px 20px rgba(45,106,79,0.28)' }}>
              Send
            </button>
          </div>
        </div>

        {/* Roadmap Insights */}
        {roadmap && (
          <div style={{ background: 'rgba(212,160,23,0.04)', border: '1px solid rgba(212,160,23,0.18)', borderRadius: 24, padding: '28px 32px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#d4a017', textTransform: 'uppercase', marginBottom: 18 }}>Your AI Roadmap Insights</div>
            <div style={{ display: 'grid', gap: 18 }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Biggest Opportunity</div>
                <div style={{ fontSize: 15, color: '#fff', lineHeight: 1.65 }}>{roadmap.biggest_opportunity}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Your First Action</div>
                <div style={{ fontSize: 15, color: '#2d6a4f', fontWeight: 600, lineHeight: 1.65 }}>{roadmap.first_action}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: 'linear-gradient(135deg,#172e20,#2d6a4f)', borderTop: '1px solid rgba(45,106,79,0.35)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Ready to build this faster with 1:1 coaching?</span>
        <a href="https://the5thconsulting.typeform.com/to/u9maum7Y" target="_blank" rel="noopener noreferrer"
          style={{ padding: '10px 26px', borderRadius: 8, background: '#fff', color: '#172e20', fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, transition: 'transform .2s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
          Book your free strategy call →
        </a>
      </div>
    </div>
  )
}
