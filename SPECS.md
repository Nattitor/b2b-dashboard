# Project Specification: B2B Metrics Dashboard

> **Target Audience:** AI Coding Assistants / Agents.
> **Context:** This document serves as the absolute source of truth for the architectural and functional requirements of the Nattitor B2B Dashboard portfolio project. Strict adherence to these specifications is mandatory.

---

## 1. Project Overview & Scope (Visión General y Alcance)

**Definition:** A single-panel Business-to-Business (B2B) Dashboard designed to visualize high-level business metrics, user acquisition, and financial transactions.

**Primary Constraint (Read-Only Context):** 
This is a portfolio demonstration project. It is heavily restricted to read-only interactions for public viewers. 
- **NO** real payment gateways (Stripe/PayPal) will be integrated.
- **NO** actual user authentication flow is required for the public demo.
- **Seed Data:** The database will rely entirely on pre-populated (seed) data to simulate high-volume, real-world traffic and transactions. The focus is on UI/UX, data visualization, and performance.

---

## 2. Strict Technology Stack (Stack Tecnológico Estricto)

Agents must strictly use the following technologies and avoid introducing deprecated or alternative libraries:

- **Core Framework:** Next.js 15 (Strictly App Router). *Server Components* must be the default.
- **Styling:** Tailwind CSS v4 + `clsx` and `tailwind-merge` for dynamic utility class management.
  - *Design System Enforcement:* The agent MUST strictly read and apply the rules defined in `CODESTYLE.md`. Do not invent generic UI components. All cards must use the `.glass-panel` utility. All numeric data in the Data Table must use JetBrains Mono or equivalent monospace font. Use Vega Cyan for active states.
- **Database & Auth:** Supabase (PostgreSQL).
- **Data Visualization:** Recharts or Tremor (Must be optimized for React Server Components / Client boundaries).
- **Iconography:** Lucide React (Clean, modern, technical standard).
- **Animations:** Framer Motion. 
  - *Nattitor Signature Physics Rule:* Use heavy spring physics (`{ type: "spring", stiffness: 350, damping: 25, mass: 0.5 }`). No generic linear easings.

---

## 3. Database Schema (Esquema de Base de Datos)

The relational PostgreSQL schema (Supabase) consists of 3 core tables:

1. **`users` (Clients/Customers)**
   - `id` (UUID, Primary Key)
   - `name` (String)
   - `email` (String)
   - `created_at` (Timestamp)
   - `status` (Enum: Active, Inactive)

2. **`subscriptions` (Products/Plans)**
   - `id` (UUID, Primary Key)
   - `plan_name` (String: e.g., Basic, Pro, Enterprise)
   - `monthly_price` (Decimal)

3. **`transactions` (Financial Ledger)**
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key -> `users.id`)
   - `subscription_id` (UUID, Foreign Key -> `subscriptions.id`)
   - `amount` (Decimal)
   - `status` (Enum: Success, Pending, Failed)
   - `created_at` (Timestamp)

---

## 4. App Router Architecture (Arquitectura de Rutas)

Routing must follow this strict file structure to avoid routing spaghetti:

- `app/layout.tsx`: 
  - Contains the global **Sidebar** (lateral navigation) and **Topbar** (Global search input and User Profile dropdown).
- `app/page.tsx`: 
  - The **Overview Dashboard**. Contains high-level KPIs and the primary revenue chart.
- `app/transactions/page.tsx`: 
  - The **Detailed Ledger**. Contains the interactive Data Table with full pagination logic.

---

## 5. Core Components Specification (Especificación de Componentes Core)

Specific behavioral constraints for the complex UI pieces:

### 5.1 KPI Cards (`app/page.tsx`)
- Must display the current metric (e.g., MRR, Total Users) and the MoM (Month-over-Month) percentage growth.
- **Styling Rule:** Positive growth must utilize the Terminal Green (`#10B981` / `text-green-500`) to match the brutalist aesthetic. Negative growth must use a high-contrast red.

### 5.2 Main Chart (`app/page.tsx`)
- Implement an **Area Chart** for revenue over time.
- Must be fully interactive: hovering over the chart area must trigger a dynamic Tooltip showing the exact date and revenue amount.

### 5.3 Interactive Data Table (`app/transactions/page.tsx`)
- **Sorting:** Users must be able to click on column headers (e.g., Date, Amount) to toggle ascending/descending sorting.
- **Filtering:** Must include a debounce-optimized search input field that filters rows by Transaction ID or User Name.
- **Pagination:** Essential to handle the large seeded database gracefully. Server-side pagination is preferred for performance demonstration.

### 5.4 Loading States (React Suspense)
All server-fetched components (Charts, Data Table, KPIs) must be wrapped in React Suspense boundaries.
- **Fallback UI:** Generate custom Brutalist Skeleton loaders (pulsing dark panels `animate-pulse bg-white/5 border border-white/10`) for the `loading.tsx` files. Never use generic circular spinners.

---

## 6. Environment Configuration

The project will rely on the following environment variables (do not hardcode these in the source):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
