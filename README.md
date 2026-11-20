# ☀️ SunSizer

**Solar PV System Sizing, Cost Estimation & Quotation Application**

SunSizer is a web-based tool that helps solar installers size off-grid PV systems, estimate costs, and issue professional quotations  - all from a single application.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres + Auth + Storage + RLS) |
| PDF Generation | @react-pdf/renderer (server-side) |
| Animations | Framer Motion |
| Tests | Vitest |
| Deploy Target | Vercel |

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- A **Supabase** project (free tier works)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run database migrations

Open the **Supabase Dashboard → SQL Editor** and run these files in order:

1. `supabase/migrations/20261119_initial_schema.sql`  - Creates all tables, RLS policies, and the user registration trigger
2. `supabase/migrations/20261119_seed_components.sql`  - Seeds placeholder components and prices

> **Important:** The first user to register becomes **ADMIN**. All subsequent users are **INSTALLER** by default. Admin can promote users from the Admin → Users page.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Register your first user

Go to `/register` and create an account. This first account will automatically be assigned the **ADMIN** role.

## Project Structure

```
sunsizer/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Authenticated routes (dashboard, projects, etc.)
│   │   ├── admin/                # Admin panel (users, components, settings)
│   │   ├── components/           # Components browse page
│   │   ├── customers/            # Customer management
│   │   ├── dashboard/            # Dashboard with stats
│   │   └── projects/             # Projects list, detail, new quotation
│   ├── api/                      # API routes
│   │   ├── me/                   # Current user profile
│   │   └── quotation-pdf/        # PDF generation endpoint
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   └── page.tsx                  # Landing page
├── components/
│   ├── admin/                    # Admin client components
│   ├── app-shell/                # Sidebar + app shell
│   ├── customers/                # Customer client components
│   ├── landing/                  # Landing page sections
│   ├── quotation/                # 4-step quotation flow
│   └── ui/                       # Reusable UI components (shadcn-style)
├── lib/
│   ├── actions/                  # Server actions (auth, projects, customers, etc.)
│   ├── calculations/             # Pure TypeScript calculation engine
│   │   ├── __tests__/            # 100 unit tests
│   │   ├── battery.ts            # Battery sizing
│   │   ├── constants.ts          # Engineering defaults, presets, price book
│   │   ├── cost.ts               # Cost breakdown
│   │   ├── engine.ts             # Main entry point
│   │   ├── inverter.ts           # Inverter sizing
│   │   ├── load.ts               # Load audit
│   │   ├── mppt.ts               # MPPT current
│   │   ├── pv.ts                 # PV array sizing
│   │   ├── types.ts              # Type definitions
│   │   └── validate.ts           # Input & design validation
│   ├── pdf/                      # PDF document templates
│   ├── supabase/                 # Supabase client utilities
│   └── database.types.ts         # Generated TypeScript types
├── scripts/
│   └── verify-demo.mts           # Verify script (21 locked demo numbers)
├── supabase/
│   └── migrations/               # SQL migration files
├── docs/                         # Architecture docs & PDFs
├── design-references/            # Sample components (reference only)
└── reference/                    # Prototype engine (reference only)
```

## Calculation Engine

The engine is a **pure TypeScript** module in `lib/calculations/`  - no React, no database imports. It runs identically in the browser (for live feedback) and on the server (for saves).

### Formulae Source

All formulae come from two engineering PDF guides:
- Solar PV Sizing Quotation Software Masters Project
- Solar PV Sizing and Quotation Engineering Guide

### Locked Demo Numbers

The verify script (`npm run verify`) asserts 21 values from the PDFs' worked example:

| Metric | Value |
|--------|-------|
| Connected load | 1,870 W |
| Daily energy | 9,640 Wh (9.64 kWh/day) |
| Inverter required | 2.3375 kW / 2.9219 kVA → selected **3.5 kVA** |
| System voltage | 24 V |
| Lithium battery | 4.546 kWh → **1 battery** |
| PV array | 2.5707 kWp → **5 × 620W panels** (3.10 kWp installed) |
| Backup time | 9.01 hours |
| MPPT charge current | 126.58 A |
| Tubular path | 7.274 kWh → 2S × 2P = **4 batteries** |
| Cost subtotal | ₦4,450,000 |
| Grand total (15% markup) | ₦5,117,500 |

## Commands

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build
npm run start     # Start production server
npm run verify    # Run the 21-point verification against locked demo numbers
npm test          # Run all 100 unit tests (Vitest)
```

## Roles & Permissions

| Feature | Admin | Installer |
|---------|-------|-----------|
| Create projects & quotations | ✅ | ✅ |
| Manage customers | ✅ | ✅ |
| View components & prices | ✅ | ✅ |
| Add/edit components & prices | ✅ | ❌ |
| Manage users & roles | ✅ | ❌ |
| Company settings | ✅ | ❌ |
| Delete any project | ✅ | Own drafts only |

Permissions are enforced by **Row Level Security (RLS)** at the database level.

## Pricing

> ⚠️ **All seeded prices are PLACEHOLDER values** from the PDF guides  - they are NOT real market prices.

Real prices should be entered through the **Admin → Components & Prices** panel. Prices are **append-only** (audit trail): adding a new price doesn't delete the old one; the system always uses the latest.

## Theme

| Element | Color |
|---------|-------|
| Main background | `#FAFAFA` |
| Text | `#000000` |
| Accent (CTAs, highlights) | `#FFD749` with black text |
| Dark surfaces (footer, dark buttons) | `#000000` with white text |
| Cards | `#FFFFFF` with borders |

**Fonts:** Varela Round (headings), Martel (body), Montserrat (UI/labels/buttons)

## Quotation Flow

The 4-step flow guides installers through the complete sizing process:

1. **Load Audit**  - Add appliances (from presets or custom), set quantities, watts, hours
2. **Design Choices**  - Battery type (lithium/tubular), backup hours, panel wattage, markup %
3. **Results**  - System design computed live from the engine (inverter, battery, PV, backup time)
4. **Cost & Quotation**  - Itemised cost breakdown → Save Project → Issue Quotation → Download PDF

## PDF Quotations

Quotations are generated server-side with `@react-pdf/renderer` and include:
- Company branding and details
- Customer information
- System design summary (load, inverter, batteries, PV, backup time)
- Itemised cost breakdown table
- Totals with markup
- Payment details and terms & conditions

Quotation numbers follow the format `QT-YYYY-NNN` (e.g., QT-2026-001).

## Deploy to Vercel

1. Push the repo to GitHub
2. Import in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## License

Private  - Masters Project
