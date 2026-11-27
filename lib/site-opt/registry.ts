/* Elements the overnight optimiser is allowed to propose copy for. Each one is a
   short button/label on a static page, tagged in the HTML with data-opt="<id>" and
   data-cta="<ctaKey>". Nothing outside this list can ever be changed. */
export type OptElement = { id: string; page: string; cta: string; current: string; purpose: string }

export const OPT_ELEMENTS: OptElement[] = [
  { id: 'home.hero.cta', page: '/', cta: 'hero-quiz', current: 'Take the free 2-minute quiz →', purpose: 'Primary button in the homepage hero for first-time visitors (experts 40+). Free, low-commitment first step.' },
  { id: 'home.final.cta', page: '/', cta: 'final-quiz', current: 'Take the free 2-minute quiz →', purpose: 'Closing button at the bottom of the homepage, after the visitor has read the whole story.' },
  { id: 'collective.hero.cta', page: '/collective', cta: 'hero-join', current: 'Join The Collective · $997/year →', purpose: 'Hero button for The Collective annual membership ($997 per year, 365-day money-back guarantee).' },
  { id: 'collective.plan.cta', page: '/collective', cta: 'plan-join', current: 'Join The Collective · $997/year →', purpose: 'Button inside the pricing card of The Collective page.' },
  { id: 'resources.spot.cta', page: '/resources', cta: 'spot-quiz', current: 'TAKE THE FREE QUIZ NOW', purpose: 'Spotlight button on the Resources page for the free Income Blocker Quiz. Keep it uppercase.' },
  { id: 'programs.free.cta', page: '/programs', cta: 'free-quiz', current: 'TAKE THE FREE QUIZ', purpose: 'Button for the free Income Blocker Quiz inside the Programs page. Keep it uppercase.' },
  { id: 'about.hero.cta', page: '/about', cta: 'about-quiz', current: 'Start with the free quiz →', purpose: 'Hero button on the About page for people learning about the mission.' },
]
export const OPT_BY_ID = new Map(OPT_ELEMENTS.map((e) => [e.id, e]))
