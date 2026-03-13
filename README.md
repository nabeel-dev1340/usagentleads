# USAgentLeads

Real estate agent data marketplace. Buy verified US real estate agent contacts by state or nationwide.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Auth**: Supabase Auth (Google OAuth only)
- **Payments**: Lemon Squeezy
- **Email**: Resend
- **Deployment**: Vercel

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd usagentleads
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API and copy your project URL, anon key, and service role key
3. Run the database migration:

```bash
npx supabase db push
# Or manually run supabase/migrations/0001_initial.sql in the SQL editor
```

4. Enable Google OAuth in Authentication > Providers
5. Create a **private** Storage bucket called `agent-csvs`
6. Upload CSV files:

```
agent-csvs/
  states/
    AL.csv, AK.csv, ... TX.csv (one per state, 2-letter code)
  full/
    usa_agents_full.csv
```

### 4. Lemon Squeezy Setup

1. Create a Lemon Squeezy store
2. Create 3 products/variants:
   - **State Pack**: $20 one-time
   - **Full Database**: $100 one-time
   - **Pro Dashboard**: $49/month subscription
3. Copy variant IDs to `.env.local`
4. Set up webhook pointing to `https://yourdomain.com/api/webhooks/lemonsqueezy`
5. Subscribe to events: `order_created`, `order_refunded`, `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`

### 5. Resend Setup

1. Create a Resend account at [resend.com](https://resend.com)
2. Verify your domain
3. Copy API key to `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `npm run db:push` | Push Supabase migrations |

## Project Structure

```
app/              # Next.js App Router pages and API routes
components/       # React components (ui, layout, home, states, dashboard, checkout)
lib/              # Utilities (supabase, lemonsqueezy, resend, utils)
types/            # TypeScript type definitions
supabase/         # Database migrations
```
