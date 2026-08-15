# Development Roadmap: Nattitor B2B Dashboard

> **Agent Instruction:** Follow this roadmap sequentially. Do not skip steps. After completing each logical block, format the code, verify there are no TypeScript errors, create a conventional commit (`feat: ...`, `fix: ...`, `chore: ...`), and check off the corresponding box in this file before proceeding to the next.

## Phase 1: Project Initialization & Infrastructure
- [x] Initialize Next.js 15 App Router project with TypeScript and Tailwind CSS v4.
- [x] Clean up default Next.js boilerplate. Set global background to `#0A0E17` in `globals.css`.
- [x] Inject Nattitor's `.glass-panel` utility class into `globals.css`.
- [x] Install exact dependencies: `supabase-js`, `lucide-react`, `framer-motion`, `recharts` (or `tremor`), `clsx`, `tailwind-merge`.
- [x] Create utility file `lib/utils.ts` for the `cn()` function.
- [x] Configure custom fonts in `layout.tsx` (Inter for body, Space Grotesk for Headings, JetBrains Mono for numbers).

## Phase 2: Database Setup & Mock Data (Supabase)
- [x] Validate presence of `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
- [x] Set up Supabase client utility in `lib/supabase.ts`.
- [x] Create SQL script or migration file for `users`, `subscriptions`, and `transactions` tables.
- [x] Create a seed script (`scripts/seed.ts`) to generate at least 50 realistic mock transactions and users.
- [x] Run seed script and verify data fetching capability from Server Components.

## Phase 3: Core Layout & Navigation
- [x] Build `<Sidebar />` component (Navigation links using Lucide icons).
- [x] Build `<Topbar />` component (Global search input skeleton and User Profile avatar).
- [x] Integrate both into `app/layout.tsx` using a CSS Grid or Flexbox structure suitable for dashboards.

## Phase 4: The Overview Dashboard (`app/page.tsx`)
- [x] Implement Brutalist Skeletons (`loading.tsx` with `React Suspense`) for the dashboard page.
- [x] Build `<KpiCard />` component adhering strictly to the `.glass-panel` style and Terminal Green for positive growth.
- [x] Fetch aggregated transaction data and populate 3-4 KPI Cards (Total Revenue, Active Users, etc.).
- [x] Build `<RevenueChart />` using Recharts/Tremor. Ensure tooltips and interactive elements match the Vega Cyan accent color.

## Phase 5: The Ledger / Data Table (`app/transactions/page.tsx`)
- [x] Implement Brutalist Skeletons (`loading.tsx`) for the transactions page.
- [x] Build `<DataTable />` component to display the `transactions` table.
- [x] Implement Server-Side Pagination (e.g., 10 rows per page).
- [x] Add sorting logic to column headers (Amount, Date).
- [x] Add a debounced search input to filter transactions by user name or ID.

## Phase 6: Polish & Nattitor Signature Integration
- [ ] Audit all interactive elements (buttons, rows, cards) to ensure Framer Motion spring physics are applied (`active:scale-95`).
- [ ] Remove all native hover effects on mobile devices (`md:hover:` restriction).
- [ ] Final visual QA against `CODESTYLE.md` requirements.

## Phase 7: Deployment Optimization
- [ ] Ensure `metadataBase` and core SEO tags are defined in `layout.tsx`.
- [ ] Verify there are no Hydration Mismatches or `console.error`s.
- [ ] Final `npm run build` test to guarantee Vercel deployment success.
