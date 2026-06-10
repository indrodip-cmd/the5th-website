# The5th — Premium Coaching Platform Website

A conversion-focused marketing site inspired by Intercom's 2024 homepage structure, adapted for The5th's elite coaching brand.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Framer Motion** (scroll + tab animations)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── layout.tsx      # Fonts (Inter + Fraunces), metadata
│   ├── page.tsx        # Page composition
│   └── globals.css     # Brand tokens, glass utilities
├── components/
│   ├── layout/         # Navbar, Footer
│   ├── sections/       # Page sections (Hero, Problem, etc.)
│   └── ui/             # Button, Container, ProductMockup
└── lib/utils.ts
```

## Brand

- Primary background: `#031322`
- Accent: blue spectrum (`#3b82f6`, glass panels)
- Typography: Fraunces (display) + Inter (body)
