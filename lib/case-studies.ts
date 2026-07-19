/* ════════ Case study data — single source of truth ════════
   Consumed by the /results Case Study Library page AND by Carolina (the AI
   concierge) via caseStudiesBrief(), so the assistant can guide visitors with
   real client proof and steer toward a strategy call. */

export type Metric = { v: string; l: string }
export interface Study {
  slug: string
  name: string
  image?: string        // optional — falls back to a branded monogram poster
  videoUrl?: string     // optional — when set, the card shows a ▶ badge + modal embeds it
  category: string      // broad — drives the niche shelves + filter chips
  niche: string         // specific — shown on the card + searchable
  location: string
  tagline: string
  background: string
  challenge: string
  whatWeDid: string
  headline: { v: string; period: string }
  metrics?: Metric[]
  bullets?: string[]
  tags: string[]        // extra search keywords
}

export const CASE_STUDIES: Study[] = [
  {
    slug: 'abbas-jamie',
    name: 'Abbas Jamie',
    image: '/clients/cases/abbas-jamie.jpeg',
    category: 'Leadership & Executive',
    niche: 'Executive & conscious-living coaching',
    location: 'Indonesia',
    tagline: 'From Corporate CEO to Conscious Living Advocate',
    background:
      "Abbas spent years as a CEO at one of South Africa's most recognized companies — a life of status, luxury, and relentless pressure. He walked away, relocated to a quiet island in Indonesia, and rebuilt his life around simplicity. He turned that transformation into a coaching practice serving burned-out executives.",
    challenge:
      'A powerful story and proven philosophy, but no system to monetize it. He had written a book but needed a launch strategy to build an audience and convert readers into clients within a defined timeframe.',
    whatWeDid:
      "We built a full book-launch funnel: a lead campaign offering the first chapter free to warm the audience, nurtured toward buying the full book, then a consultation offer, and finally an invite into Abbas's premium $3,000 coaching program.",
    headline: { v: '$21,000+', period: 'in 2 months' },
    metrics: [
      { v: '400', l: 'chapter downloads' },
      { v: '190', l: 'books purchased' },
      { v: '25', l: 'consults booked' },
      { v: '7', l: 'enrolled at $3,000' },
    ],
    tags: ['book launch', 'funnel', 'executive', 'ceo', 'south africa', 'burnout', 'lead generation'],
  },
  {
    slug: 'laurie-gerber',
    name: 'Laurie Gerber',
    image: '/clients/cases/laurie-gerber.png',
    category: 'Relationships',
    niche: 'Dating coach for professionals 50+',
    location: 'USA',
    tagline: 'Relaunching a Stalled Course into a Profitable, Community-Led Program',
    background:
      'Laurie is a dating coach with 20 years of experience and a TEDx talk, helping professionals over 50 find meaningful relationships. Despite her credibility, a previous course launch had underperformed.',
    challenge:
      'She needed to relaunch with a strategy that matched her authority and justified a higher price. The previous launch at $79 did not reflect the true value of her offer.',
    whatWeDid:
      'We rebuilt the launch around three pillars: a targeted webinar feeding a dedicated Facebook community, the replay used inside the community to keep building trust, and a price reposition from $79 to $249.',
    headline: { v: '$14,193', period: 'in 60 days' },
    metrics: [
      { v: '600', l: 'community members' },
      { v: '57', l: 'enrolled at $249' },
      { v: '$79→$249', l: 'price repositioned' },
    ],
    tags: ['webinar', 'course', 'community', 'dating', 'professionals over 50', 'tedx', 'facebook'],
  },
  {
    slug: 'bharti-chauhan',
    name: 'Bharti Chauhan',
    image: '/clients/cases/bharti-chauhan.png',
    category: 'Relationships',
    niche: 'Marriage & couples retreats',
    location: 'India',
    tagline: 'Reviving a Decade-Old Retreat Program with a Low-Ticket Funnel',
    background:
      'Bharti is a marriage coach and TEDx speaker who has run couples retreats for over ten years. The retreats were transformative, but attendance had declined and selling tickets directly at $700 per couple no longer drove demand.',
    challenge:
      'She needed to rebuild interest, reach new couples who did not know her, and create a low-friction entry point into her higher-ticket retreat.',
    whatWeDid:
      'We built a paid challenge funnel: a $2.99 webinar ticket, a dedicated landing page and WhatsApp community, automated phone reminders for show-up, then a retreat pitch with phone follow-up to convert.',
    headline: { v: '$18,000+', period: 'from one challenge' },
    metrics: [
      { v: '477', l: 'registrations' },
      { v: '$1,426', l: 'ticket sales' },
      { v: '38', l: 'couples at $700' },
    ],
    tags: ['challenge funnel', 'webinar', 'retreat', 'couples', 'marriage', 'tedx', 'whatsapp', 'low ticket'],
  },
  {
    slug: 'gurpreet',
    name: 'Gurpreet',
    image: '/clients/cases/gurpreet.png',
    category: 'Self Development',
    niche: 'Law of Attraction & self development',
    location: '',
    tagline: 'From Zero Revenue to $18,000 in 3 Months',
    background:
      'Gurpreet came in with no active income. She had already invested more than $16,000 across multiple programs with no return, and was exhausted and close to giving up.',
    challenge:
      'She needed a clear, executable system to move from zero to paying clients without adding more complexity to an already overwhelming situation.',
    whatWeDid:
      'We stripped everything back to fundamentals: clarified her offer, identified her ideal client, and built a simple outreach and conversion system she could run consistently — no complicated funnels.',
    headline: { v: '$18,000', period: 'in 3 months' },
    bullets: [
      'From $0 to her first paying clients within weeks',
      'Built a repeatable client-acquisition process from scratch',
      'Revenue on a business that had previously produced nothing',
    ],
    tags: ['law of attraction', 'self development', 'manifestation', 'mindset', 'outreach', 'from zero', 'first clients', 'offer clarity', 'overwhelm'],
  },
  {
    slug: 'shyama-prasad-goswami',
    name: 'Shyama Prasad Goswami',
    image: '/clients/cases/shyama-prasad-goswami.jpg',
    category: 'Business & Consulting',
    niche: 'B2B growth consulting',
    location: '',
    tagline: 'A Fortune 500 CEO Builds a High-Ticket Consulting Practice After Retirement',
    background:
      'Shyama spent decades as CEO of a billion-dollar Fortune 500 company across textiles and pharmaceuticals. After retiring he wanted to help small and mid-size companies grow, but had no system to package or sell that expertise.',
    challenge:
      'Unquestionable authority and decades of results, but no structured offer, no positioning in a new market, and no process for attracting clients outside the corporate world.',
    whatWeDid:
      'We built his consulting practice from the ground up: a clear positioning statement around his credibility, an offer at a premium price point, and a client-acquisition approach leveraging his network and reputation.',
    headline: { v: '$180,000', period: 'in 5 months' },
    bullets: [
      'Launched a structured consulting offer for the first time',
      'Secured high-value clients from his target market',
      'Turned corporate authority into a sellable offer',
    ],
    tags: ['consulting', 'fortune 500', 'ceo', 'pharmaceutical', 'textile', 'high-ticket', 'retirement', 'b2b'],
  },
  {
    slug: 'torill',
    name: 'Torill',
    // Photo removed at Torill's request — no consent to use her image.
    category: 'Leadership & Executive',
    niche: 'Leadership coaching',
    location: 'Norway',
    tagline: 'A Celebrity Coach Returns After 15 Years and Sells Out a $7,000 Program',
    background:
      'Torill is a leadership coach in Norway whose career reached the highest levels — she consulted governments, not just entrepreneurs. After 15 years at the top she stepped away, and needed to re-enter with a program matching her caliber.',
    challenge:
      'She had not launched publicly in over a decade. Despite an exceptional track record, she had no current audience, no active platform, and no system for filling a high-ticket program.',
    whatWeDid:
      'We built her re-entry from scratch: a $7,000 leadership program for high performers, positioned around the depth only her background could deliver, with the launch system, audience, and conversion pathway.',
    headline: { v: '$210,000', period: 'in 3 months' },
    metrics: [
      { v: '15 yrs', l: 'back to market' },
      { v: '30', l: 'enrolled at $7,000' },
      { v: '1', l: 'program launch' },
    ],
    tags: ['leadership', 'norway', 'high-ticket', 'relaunch', 'government', 'executive'],
  },
  {
    slug: 'amalia',
    name: 'Amalia',
    image: '/clients/cases/amalia.png',
    category: 'Health & Fitness',
    niche: 'Fitness coaching',
    location: 'Canada',
    tagline: 'From Army Veteran and Stay-at-Home Mom to Six-Figure Fitness Coach',
    background:
      'Amalia served in the Canadian Army for 13 years, then spent years as a stay-at-home mother — disciplined and passionate about fitness, but with no path to turn that passion into income.',
    challenge:
      'She needed to package her fitness knowledge into a professional offer, position herself credibly, and build a client-acquisition system — all while starting from zero as a business owner.',
    whatWeDid:
      'We built her business from the foundation: a unique positioning as a fitness coach with real military-grade discipline, an $8,000 premium program, and the funnel and outreach system to fill it.',
    headline: { v: '$16,000', period: 'in 5 months' },
    bullets: [
      'Launched her first professional coaching offer',
      'Built a client-acquisition system from scratch',
      'Signed clients into an $8,000 program',
    ],
    tags: ['fitness', 'army', 'veteran', 'canada', 'premium', 'stay at home mom'],
  },
  {
    slug: 'girish',
    name: 'Girish',
    image: '/clients/cases/girish.png',
    category: 'Self Development',
    niche: 'Celebrity Law of Attraction coaching',
    location: 'India',
    tagline: "A Celebrity Law of Attraction Coach's Comeback",
    background:
      'Girish is a well-known celebrity coach in India. Personal setbacks, including a divorce, pulled him out of work for a year. He was ready to return and build a structured way to help people again.',
    challenge:
      'He had authority and an audience but no tiered offer to convert either into consistent revenue.',
    whatWeDid:
      'We launched him inside the 10K Roadmap program and built a two-tier offer: an entry tier at $200/year and a platinum tier at $3,500/year — now running as his core revenue engine.',
    headline: { v: '$120,000', period: 'in 8 months' },
    metrics: [
      { v: '$200 / $3,500', l: 'two-tier offer' },
      { v: '$35,000', l: 'paid ad spend' },
      { v: '8 mo', l: 'to $120K' },
    ],
    tags: ['law of attraction', 'mindset', 'manifestation', 'celebrity', 'india', 'comeback', 'two-tier offer', 'coaching'],
  },
  {
    slug: 'max',
    name: 'Max',
    image: '/clients/cases/max.jpg',
    category: 'Relationships',
    niche: 'Divorce coaching for men',
    location: 'USA',
    tagline: 'An American War Hero Turns Personal Pain into a Divorce Coaching Practice',
    background:
      'Max is an American veteran who lost his leg in the Vietnam War. Two divorces gave him hard-won perspective on loss, identity, and rebuilding — and he wanted to guide other men through the same.',
    challenge:
      'A story that commanded respect and a rare perspective, but no structured offer, no clear positioning, and no system to reach men in the middle of one of the hardest experiences of their lives.',
    whatWeDid:
      'We built his divorce coaching practice from the ground up: positioning around authenticity and lived experience, an accessible price point, and a simple, direct outreach and conversion system.',
    headline: { v: '$9,000', period: 'in 3.5 months' },
    bullets: [
      'Launched his coaching practice for the first time',
      'Signed paying clients within the first weeks',
      'Positioned around lived experience, not credentials alone',
    ],
    tags: ['divorce', 'men', 'veteran', 'vietnam', 'war hero', 'authenticity'],
  },
  {
    slug: 'maham-kabani',
    name: 'Maham Kabani',
    image: '/clients/cases/maham-kabani.png',
    category: 'Personal Branding',
    niche: 'Social media & personal branding',
    location: 'Dubai',
    tagline: 'From a Failed Storytelling Course to a Converting Funnel',
    background:
      'Maham moved from Pakistan to Dubai to build a social media and personal branding business. She had the skill and the audience but no proven system to turn either into revenue.',
    challenge:
      'Her first storytelling course launch failed. The funnel was wrong, the upsell sequence was wrong, and the offer sat at 0% conversion.',
    whatWeDid:
      'We rebuilt her funnel from the ground up and repositioned her community as the core product instead of a side offer.',
    headline: { v: '$12,000', period: 'in 2 months' },
    metrics: [
      { v: '0% → 15%', l: 'conversion rate' },
      { v: '$47', l: 'avg revenue / customer' },
      { v: '$5,000', l: 'ad spend' },
    ],
    tags: ['social media', 'personal branding', 'funnel', 'storytelling', 'community', 'dubai', 'pakistan', 'upsell'],
  },
  {
    slug: 'angela',
    name: 'Angela',
    image: '/clients/cases/angela.png',
    category: 'Career Coaching',
    niche: 'Career coaching',
    location: 'UK',
    tagline: '20 Years in Education, Turned Into a Coaching Offer',
    background:
      "Angela spent 20 years working in education and NGOs across the UK, watching job outcomes for students deteriorate year over year. She wanted to build a course and coaching program to address it directly.",
    challenge:
      "She had deep expertise but no clear offer and no framework for understanding her audience's real pain points.",
    whatWeDid:
      "Over 3 months of coaching, we defined her offer, clarified her audience's pain, and rebuilt her messaging to speak to it directly.",
    headline: { v: '$2,500', period: 'first revenue, in 2 months' },
    bullets: [
      'First sale closed within 2 months of joining',
      '$2,500 in first revenue',
      'Offer and messaging built around real audience pain',
    ],
    tags: ['career coaching', 'education', 'ngo', 'uk', 'offer clarity', 'messaging', 'first sale', 'course'],
  },
  {
    slug: 'gabe',
    name: 'Gabe',
    image: '/clients/cases/gabe.png',
    category: 'Health & Fitness',
    niche: 'Fitness coaching for men 40+',
    location: '',
    tagline: 'Leaving a Job to Build a Coaching Business for Men 40+',
    background:
      'Gabe wanted to leave his job and build a coaching program for men over 40. He had the intent but lacked mental clarity on what to actually offer.',
    challenge:
      'No clear offer, no clarity on positioning, no momentum.',
    whatWeDid:
      'Over 3 months, we helped him define his offer and launch his coaching program with a long-term business focus rather than a quick win.',
    headline: { v: 'Launched', period: 'program live, momentum built' },
    bullets: [
      'Coaching program successfully launched',
      'Clear offer and positioning built',
      'Momentum established; results tracking toward long-term goals (work in progress)',
    ],
    tags: ['fitness', 'men over 40', 'coaching', 'positioning', 'offer', 'launch', 'long-term'],
  },
  {
    slug: 'kate-winchester',
    name: 'Kate Winchester',
    image: '/clients/cases/kate-winchester.png',
    category: 'Health & Fitness',
    niche: "Women's wellness coaching",
    location: 'New Zealand',
    tagline: 'A New Zealand Bodybuilder Turns Her Own Struggle Into a Business',
    background:
      'Kate is a successful bodybuilder in New Zealand who privately struggled with anxiety and depression. She wanted to help other women navigate the same.',
    challenge:
      'Her first program launch converted at zero.',
    whatWeDid:
      'Inside the community program, we rebuilt her audience targeting, her offer, and her content strategy.',
    headline: { v: '$2,500', period: 'first revenue' },
    bullets: [
      'First $2,500 in revenue after a zero-conversion launch',
      'Right audience and offer identified and validated',
      'Content strategy rebuilt around her own story',
    ],
    tags: ["women's wellness", 'anxiety', 'depression', 'bodybuilder', 'new zealand', 'community', 'offer', 'content'],
  },
  {
    slug: 'milesa-arjoon-greene',
    name: 'Milesa Arjoon Greene',
    image: '/clients/cases/milesa-arjoon-greene.png',
    category: 'Self Development',
    niche: 'EFT & anxiety coaching',
    location: '',
    tagline: '20 Years in Corporate, Rebuilt Into an EFT Coaching Business',
    background:
      'Milesa spent 20 years in corporate before deciding to retire from it and help other women overcome anxiety through EFT.',
    challenge:
      'Her first launch failed to generate revenue.',
    whatWeDid:
      'Inside the community program, we clarified her offer, defined her content strategy, and gave her a clear channel-specific messaging strategy.',
    headline: { v: '$4,500', period: 'in 3 months' },
    bullets: [
      'Clear offer defined and validated',
      'Content strategy built from scratch',
      'Channel-specific messaging strategy in place',
    ],
    tags: ['eft', 'anxiety', 'women', 'corporate', 'tapping', 'content strategy', 'messaging', 'emotional freedom technique'],
  },
  {
    slug: 'susan-taylor',
    name: 'Susan Taylor',
    image: '/clients/cases/susan-taylor.jpg',
    category: 'Personal Finance Coaching',
    niche: 'Personal finance coaching for homemakers',
    location: '',
    tagline: 'A Finance-Degree Housewife Turns Decades of Support Into Her Own Business',
    background:
      "Susan spent her life supporting her entrepreneur husband. She holds a finance degree and had learned personal finance deeply through years of managing her household's financial decisions, but had never built anything of her own.",
    challenge:
      'She wanted to help other homemakers build something of their own. She invested more than $20,000 across different programs trying to launch, and failed every time.',
    whatWeDid:
      'Inside the 10K Roadmap program, we taught her how to create content, sell, and pitch without overwhelming herself. She built real confidence in the process.',
    headline: { v: '$8,000', period: 'in 3 months' },
    bullets: [
      '$8,000 in revenue in 3 months',
      'Confidence and a repeatable sales process built from scratch',
    ],
    tags: ['personal finance', 'finance', 'homemaker', 'housewife', 'content', 'sales', 'confidence', 'women'],
  },
]

export const CASE_CATEGORIES = ['All', ...Array.from(new Set(CASE_STUDIES.map(s => s.category)))]


/* Compact, plain-text brief of every case study for the AI system prompt.
   Kept short (name · niche · location · result · one line) so it stays cheap
   per turn while giving Carolina real, non-fabricated proof to reference. */
export function caseStudiesBrief(): string {
  const lines = CASE_STUDIES.map(s => {
    const where = s.location ? `, ${s.location}` : ''
    return `- ${s.name} (${s.niche}${where}) — ${s.headline.v} ${s.headline.period}. ${s.tagline}. What we did: ${s.whatWeDid}`
  })
  return `REAL CLIENT CASE STUDIES (${CASE_STUDIES.length} — all real, documented; NEVER invent, alter figures, or add clients not on this list):\n${lines.join('\n')}`
}
