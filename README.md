# Budgets

A calm, mobile-first budget tracker built with Next.js, Supabase, and Tailwind CSS.

## Stack

- **Next.js 16** (App Router, TypeScript) — the web app
- **Supabase** — Postgres database, auth (magic link), row-level security
- **Tailwind CSS v4** — styling
- **Recharts** — net worth / account trend line graphs
- **Vercel** — hosting

## Local setup

1. Copy the env template and fill in your Supabase project's URL + anon key
   (Supabase dashboard → Settings → API):

   ```bash
   cp .env.local.example .env.local
   ```

2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

## Database

The schema lives in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
Run it once in your Supabase project's SQL editor (Dashboard → SQL Editor → New query → paste
→ Run). It creates all tables, row-level security policies, and a trigger that seeds default
categories (Food, Shopping, Gifts, Taxi, PT, Drinks, Groceries) for every new user.

## Project structure

```
src/
  app/            routes (Home, Transactions, Accounts, Login, auth callback)
  components/      UI building blocks (cards, bottom nav, add-transaction sheet, etc.)
  lib/             Supabase clients, data fetchers, net-worth/trend math, types
supabase/
  migrations/      SQL schema + RLS policies
```
